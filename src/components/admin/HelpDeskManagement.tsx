import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, FileText, Users, BookOpen, GraduationCap, FolderOpen } from 'lucide-react';

const HelpDeskManagement = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-indigo-500/10 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
            <HelpCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold">Help Desk Management</h2>
              <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-400 text-[9px] px-1.5 py-0 h-4">Knowledge Base</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">Help desk operations and knowledge base management</p>
          </div>
        </div>
        <Button size="sm" className="h-7 text-[10px]">
          <FileText className="h-3 w-3 mr-1" />
          Create Article
        </Button>
      </div>

      <Tabs defaultValue="articles" className="space-y-3">
        <TabsList className="grid w-full grid-cols-4 h-8 p-0.5 bg-muted/50">
          <TabsTrigger value="articles" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400">
            <BookOpen className="h-3 w-3" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400">
            <HelpCircle className="h-3 w-3" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400">
            <GraduationCap className="h-3 w-3" />
            Training
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-700 dark:data-[state=active]:text-orange-400">
            <FolderOpen className="h-3 w-3" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="mt-3">
          <Card className="border-purple-200/50 dark:border-purple-800/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                  <BookOpen className="h-3 w-3 text-purple-600" />
                </div>
                <CardTitle className="text-xs">Knowledge Base Articles</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {['How to list a property', 'Vendor registration guide', 'Payment process', 'User account management'].map((article) => (
                  <div key={article} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-[10px]">{article}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[9px] px-2">Edit</Button>
                      <Button size="sm" variant="outline" className="h-6 text-[9px] px-2">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="mt-3">
          <Card className="border-blue-200/50 dark:border-blue-800/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                  <HelpCircle className="h-3 w-3 text-blue-600" />
                </div>
                <CardTitle className="text-xs">FAQ Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="h-32 flex items-center justify-center text-[10px] text-muted-foreground bg-muted/30 rounded-lg">
                FAQ Management Interface
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="mt-3">
          <Card className="border-green-200/50 dark:border-green-800/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                  <GraduationCap className="h-3 w-3 text-green-600" />
                </div>
                <CardTitle className="text-xs">Staff Training Materials</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="h-32 flex items-center justify-center text-[10px] text-muted-foreground bg-muted/30 rounded-lg">
                Training Resources
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-3">
          <Card className="border-orange-200/50 dark:border-orange-800/30">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500/20 rounded flex items-center justify-center">
                  <FolderOpen className="h-3 w-3 text-orange-600" />
                </div>
                <CardTitle className="text-xs">Help Resources</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="h-32 flex items-center justify-center text-[10px] text-muted-foreground bg-muted/30 rounded-lg">
                Resource Library
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpDeskManagement;
