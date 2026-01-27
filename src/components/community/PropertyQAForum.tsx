import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  MessageCircle,
  ThumbsUp,
  CheckCircle2,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Send,
  Pin,
  Filter,
  Eye,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: string;
  property_id: string;
  author_id: string;
  question: string;
  category: string;
  is_anonymous: boolean;
  answer_count: number;
  view_count: number;
  upvote_count: number;
  is_pinned: boolean;
  is_resolved: boolean;
  created_at: string;
}

interface Answer {
  id: string;
  question_id: string;
  author_id: string;
  content: string;
  is_owner_response: boolean;
  is_resident_response: boolean;
  is_accepted: boolean;
  upvote_count: number;
  created_at: string;
}

interface PropertyQAForumProps {
  propertyId: string;
  className?: string;
}

const categories = [
  { value: 'all', label: 'All Questions' },
  { value: 'general', label: 'General' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'location', label: 'Location' },
  { value: 'amenities', label: 'Amenities' },
  { value: 'legal', label: 'Legal' },
  { value: 'neighbors', label: 'Neighbors' },
];

const PropertyQAForum: React.FC<PropertyQAForumProps> = ({ propertyId, className }) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [propertyId]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('property_questions')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'active')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnswers = async (questionId: string) => {
    try {
      const { data, error } = await supabase
        .from('property_answers')
        .select('*')
        .eq('question_id', questionId)
        .eq('status', 'active')
        .order('is_accepted', { ascending: false })
        .order('upvote_count', { ascending: false });

      if (error) throw error;
      setAnswers(prev => ({ ...prev, [questionId]: data || [] }));
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  const handleExpandQuestion = async (questionId: string) => {
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(questionId);
      if (!answers[questionId]) {
        await fetchAnswers(questionId);
      }
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please sign in', description: 'You need to be signed in to ask questions', variant: 'destructive' });
        return;
      }

      const { error } = await supabase
        .from('property_questions')
        .insert({
          property_id: propertyId,
          author_id: user.id,
          question: newQuestion,
          category: 'general'
        });

      if (error) throw error;

      toast({ title: 'Question Posted!', description: 'Your question has been submitted.' });
      setNewQuestion('');
      fetchQuestions();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const answerText = newAnswer[questionId];
    if (!answerText?.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please sign in', description: 'You need to be signed in to answer', variant: 'destructive' });
        return;
      }

      const { error } = await supabase
        .from('property_answers')
        .insert({
          question_id: questionId,
          author_id: user.id,
          content: answerText
        });

      if (error) throw error;

      toast({ title: 'Answer Posted!', description: 'Your answer has been submitted.' });
      setNewAnswer(prev => ({ ...prev, [questionId]: '' }));
      fetchAnswers(questionId);
      
      // Update answer count
      await supabase
        .from('property_questions')
        .update({ answer_count: (questions.find(q => q.id === questionId)?.answer_count || 0) + 1 })
        .eq('id', questionId);
      
      fetchQuestions();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuestions = questions.filter(
    q => selectedCategory === 'all' || q.category === selectedCategory
  );

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Property Q&A
          </h3>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions from the community
          </p>
        </div>
      </div>

      {/* Ask Question */}
      <Card>
        <CardContent className="p-4">
          <Textarea
            placeholder="Ask a question about this property..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="mb-3"
            rows={2}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmitQuestion} disabled={isSubmitting || !newQuestion.trim()}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              Post Question
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
            className="shrink-0"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))
        ) : filteredQuestions.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No questions yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to ask about this property!
            </p>
          </Card>
        ) : (
          filteredQuestions.map(question => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={cn(
                'cursor-pointer transition-shadow hover:shadow-md',
                question.is_pinned && 'border-primary'
              )}>
                <CardContent className="p-4">
                  <div 
                    className="flex items-start gap-3"
                    onClick={() => handleExpandQuestion(question.id)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {question.is_anonymous ? '?' : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {question.is_pinned && (
                          <Pin className="h-3 w-3 text-primary" />
                        )}
                        <span className="text-sm font-medium">
                          {question.is_anonymous ? 'Anonymous' : 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(question.created_at)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {question.category}
                        </Badge>
                        {question.is_resolved && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm mb-2">{question.question}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {question.upvote_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {question.answer_count} answers
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {question.view_count}
                        </span>
                      </div>
                    </div>
                    
                    {expandedQuestion === question.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Expanded Answers */}
                  <AnimatePresence>
                    {expandedQuestion === question.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t space-y-4">
                          {/* Answers */}
                          {answers[question.id]?.map(answer => (
                            <div key={answer.id} className="flex gap-3 pl-4 border-l-2 border-muted">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {answer.is_owner_response ? 'O' : answer.is_resident_response ? 'R' : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium">
                                    {answer.is_owner_response ? 'Property Owner' : 
                                     answer.is_resident_response ? 'Current Resident' : 'User'}
                                  </span>
                                  {answer.is_owner_response && (
                                    <Badge className="bg-blue-100 text-blue-700 text-xs">Owner</Badge>
                                  )}
                                  {answer.is_resident_response && (
                                    <Badge className="bg-green-100 text-green-700 text-xs">Resident</Badge>
                                  )}
                                  {answer.is_accepted && (
                                    <Badge className="bg-primary text-primary-foreground text-xs">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Accepted
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(answer.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm">{answer.content}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    {answer.upvote_count}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Add Answer */}
                          <div className="pl-4 space-y-2">
                            <Textarea
                              placeholder="Write your answer..."
                              value={newAnswer[question.id] || ''}
                              onChange={(e) => setNewAnswer(prev => ({ ...prev, [question.id]: e.target.value }))}
                              rows={2}
                              className="text-sm"
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleSubmitAnswer(question.id)}
                              disabled={isSubmitting || !newAnswer[question.id]?.trim()}
                            >
                              {isSubmitting && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                              Post Answer
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertyQAForum;
