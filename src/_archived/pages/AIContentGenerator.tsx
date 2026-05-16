import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, LayoutGrid, Lightbulb, History } from "lucide-react";
import useAIContentGenerator, { ContentTemplate, ContentType, CONTENT_TEMPLATES } from "@/hooks/useAIContentGenerator";
import {
  ContentTemplateCard,
  ContentGeneratorForm,
  GeneratedContentDisplay,
  ContentHistoryPanel,
  ExampleScenarios
} from "@/components/content";

const AIContentGenerator = () => {
  const {
    generateContent,
    isGenerating,
    generatedContent,
    contentHistory,
    copyToClipboard
  } = useAIContentGenerator();

  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [lastVariables, setLastVariables] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState("templates");

  const handleSelectTemplate = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setActiveTab("generate");
  };

  const handleGenerate = async (
    type: ContentType,
    variables: Record<string, any>,
    language: 'en' | 'id' = 'en',
    tone: 'professional' | 'friendly' | 'luxury' | 'casual' = 'professional'
  ) => {
    setLastVariables(variables);
    await generateContent(type, variables, language, tone);
  };

  const handleQuickGenerate = async (type: ContentType, variables: Record<string, any>) => {
    const template = CONTENT_TEMPLATES.find(t => t.id === type);
    if (template) {
      setSelectedTemplate(template);
      setLastVariables(variables);
    }
    await generateContent(type, variables, 'en', 'professional');
    setActiveTab("generate");
  };

  const handleSelectScenario = (type: ContentType, variables: Record<string, any>) => {
    const template = CONTENT_TEMPLATES.find(t => t.id === type);
    if (template) {
      setSelectedTemplate(template);
      setLastVariables(variables);
      setActiveTab("generate");
    }
  };

  const handleRegenerate = () => {
    if (selectedTemplate) {
      generateContent(selectedTemplate.id, lastVariables, 'en', 'professional');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Content Generator</h1>
              <p className="text-muted-foreground">
                Automatically generate property descriptions, guides, reports, and more
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary">8 Content Types</Badge>
            <Badge variant="secondary">10 Example Templates</Badge>
            <Badge variant="outline">Bilingual EN/ID</Badge>
            <Badge variant="outline">Multiple Tones</Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - History */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ContentHistoryPanel 
              history={contentHistory} 
              onCopy={copyToClipboard}
            />
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="templates" className="gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="generate" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate
                </TabsTrigger>
                <TabsTrigger value="examples" className="gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Examples
                </TabsTrigger>
              </TabsList>

              {/* Templates Tab */}
              <TabsContent value="templates">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {CONTENT_TEMPLATES.map((template) => (
                    <ContentTemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleSelectTemplate}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Generate Tab */}
              <TabsContent value="generate" className="space-y-6">
                {selectedTemplate ? (
                  <>
                    <ContentGeneratorForm
                      template={selectedTemplate}
                      onBack={() => {
                        setSelectedTemplate(null);
                        setActiveTab("templates");
                      }}
                      onGenerate={handleGenerate}
                      isGenerating={isGenerating}
                    />
                    
                    {generatedContent && (
                      <GeneratedContentDisplay
                        content={generatedContent}
                        type={selectedTemplate.id}
                        onCopy={copyToClipboard}
                        onRegenerate={handleRegenerate}
                        isGenerating={isGenerating}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">Select a Template to Start</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose from the Templates tab or try an Example scenario
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setActiveTab("templates")}
                        className="text-sm text-primary hover:underline"
                      >
                        Browse Templates →
                      </button>
                      <span className="text-muted-foreground">or</span>
                      <button
                        onClick={() => setActiveTab("examples")}
                        className="text-sm text-primary hover:underline"
                      >
                        Try Examples →
                      </button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Examples Tab */}
              <TabsContent value="examples">
                <ExampleScenarios
                  onSelectScenario={handleSelectScenario}
                  onGenerate={handleQuickGenerate}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentGenerator;
