import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Loader2, Globe, MessageSquare } from "lucide-react";
import { ContentTemplate, ContentType } from "@/hooks/useAIContentGenerator";

interface ContentGeneratorFormProps {
  template: ContentTemplate;
  onBack: () => void;
  onGenerate: (
    type: ContentType,
    variables: Record<string, any>,
    language: 'en' | 'id',
    tone: 'professional' | 'friendly' | 'luxury' | 'casual'
  ) => Promise<string | null | void>;
  isGenerating: boolean;
}

const ContentGeneratorForm = ({ template, onBack, onGenerate, isGenerating }: ContentGeneratorFormProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'luxury' | 'casual'>('professional');

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(template.id, formData, language, tone);
  };

  const isFormValid = template.variables
    .filter(v => v.required)
    .every(v => formData[v.key]?.toString().trim());

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-3xl">{template.icon}</span>
          <div>
            <CardTitle className="text-xl">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language & Tone Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language
              </Label>
              <Select value={language} onValueChange={(v: 'en' | 'id') => setLanguage(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Indonesian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Tone
              </Label>
              <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template Variables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {template.variables.map((variable) => (
              <div 
                key={variable.key} 
                className={variable.type === 'textarea' ? 'md:col-span-2' : ''}
              >
                <Label htmlFor={variable.key} className="flex items-center gap-2 mb-2">
                  {variable.label}
                  {variable.required && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </Label>
                
                {variable.type === 'text' && (
                  <Input
                    id={variable.key}
                    placeholder={variable.placeholder}
                    value={formData[variable.key] || ''}
                    onChange={(e) => handleInputChange(variable.key, e.target.value)}
                    required={variable.required}
                  />
                )}
                
                {variable.type === 'number' && (
                  <Input
                    id={variable.key}
                    type="number"
                    placeholder={variable.placeholder}
                    value={formData[variable.key] || ''}
                    onChange={(e) => handleInputChange(variable.key, e.target.value)}
                    required={variable.required}
                  />
                )}
                
                {variable.type === 'textarea' && (
                  <Textarea
                    id={variable.key}
                    placeholder={variable.placeholder}
                    value={formData[variable.key] || ''}
                    onChange={(e) => handleInputChange(variable.key, e.target.value)}
                    required={variable.required}
                    rows={3}
                  />
                )}
                
                {variable.type === 'select' && variable.options && (
                  <Select 
                    value={formData[variable.key] || ''} 
                    onValueChange={(v) => handleInputChange(variable.key, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${variable.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {variable.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={!isFormValid || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContentGeneratorForm;
