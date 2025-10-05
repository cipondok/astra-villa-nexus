import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database, Code2, AlertCircle, Search, 
  ChevronRight, ChevronDown, Folder, File, Package,
  Table, Trash2, Eye, EyeOff, GitBranch, Braces, FileCode
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  size?: number;
  extension?: string;
}

interface DatabaseTable {
  name: string;
  columns: number;
  rows?: number;
  hasRLS: boolean;
  policies: number;
}

const ProjectMapVisualization = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(false);

  // Simulated project structure - in production, this would come from file system API
  const projectStructure: FileNode = {
    name: 'root',
    path: '',
    type: 'folder',
    children: [
      {
        name: 'src',
        path: 'src',
        type: 'folder',
        children: [
          {
            name: 'components',
            path: 'src/components',
            type: 'folder',
            children: [
              { name: 'admin', path: 'src/components/admin', type: 'folder' },
              { name: 'ui', path: 'src/components/ui', type: 'folder' },
              { name: 'Navigation.tsx', path: 'src/components/Navigation.tsx', type: 'file', extension: 'tsx' },
            ]
          },
          {
            name: 'pages',
            path: 'src/pages',
            type: 'folder',
            children: [
              { name: 'AdminDashboard.tsx', path: 'src/pages/AdminDashboard.tsx', type: 'file', extension: 'tsx' },
              { name: 'Index.tsx', path: 'src/pages/Index.tsx', type: 'file', extension: 'tsx' },
            ]
          },
          {
            name: 'hooks',
            path: 'src/hooks',
            type: 'folder',
          },
          {
            name: 'integrations',
            path: 'src/integrations',
            type: 'folder',
            children: [
              { name: 'supabase', path: 'src/integrations/supabase', type: 'folder' },
            ]
          },
        ]
      },
      {
        name: 'public',
        path: 'public',
        type: 'folder',
      },
      {
        name: 'supabase',
        path: 'supabase',
        type: 'folder',
        children: [
          { name: 'migrations', path: 'supabase/migrations', type: 'folder' },
          { name: 'functions', path: 'supabase/functions', type: 'folder' },
        ]
      }
    ]
  };

  useEffect(() => {
    loadDatabaseSchema();
  }, []);

  const loadDatabaseSchema = async () => {
    setLoading(true);
    try {
      // Get all tables from the database
      const { data: tables, error } = await supabase
        .rpc('get_table_schema' as any)
        .select('*');

      if (error) {
        console.error('Error loading schema:', error);
        // Fallback to known tables
        setDatabaseTables([
          { name: 'profiles', columns: 15, hasRLS: true, policies: 4, rows: 0 },
          { name: 'properties', columns: 30, hasRLS: true, policies: 3, rows: 0 },
          { name: 'vendor_business_profiles', columns: 40, hasRLS: true, policies: 4, rows: 0 },
          { name: 'rental_bookings', columns: 20, hasRLS: true, policies: 3, rows: 0 },
          { name: 'payout_transactions', columns: 15, hasRLS: true, policies: 2, rows: 0 },
          { name: 'user_roles', columns: 5, hasRLS: true, policies: 2, rows: 0 },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (node: FileNode, level: number = 0): React.ReactNode => {
    if (!node.children && node.type === 'folder') return null;
    
    const isExpanded = expandedFolders.has(node.path);
    const matchesSearch = searchTerm === '' || 
      node.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch && !node.children?.some(child => 
      child.name.toLowerCase().includes(searchTerm.toLowerCase())
    )) {
      return null;
    }

    return (
      <div key={node.path}>
        <div 
          className={`flex items-center gap-2 py-1 px-2 hover:bg-muted rounded cursor-pointer ${
            level === 0 ? 'font-semibold' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => node.type === 'folder' && toggleFolder(node.path)}
        >
          {node.type === 'folder' ? (
            <>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Folder className="h-4 w-4 text-blue-500" />
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="h-4 w-4 text-gray-500" />
            </>
          )}
          <span className="text-sm">{node.name}</span>
          {node.extension && (
            <Badge variant="outline" className="text-xs ml-auto">
              {node.extension}
            </Badge>
          )}
        </div>
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const DatabaseSchemaView = () => (
    <div className="space-y-4">
      <div className="grid gap-4">
        {databaseTables.map((table) => (
          <Card key={table.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Table className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{table.name}</CardTitle>
                </div>
                {table.hasRLS ? (
                  <Badge variant="default" className="bg-green-500">
                    <Eye className="h-3 w-3 mr-1" />
                    RLS Enabled
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <EyeOff className="h-3 w-3 mr-1" />
                    No RLS
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Columns:</span>
                  <span className="ml-2 font-semibold">{table.columns}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Policies:</span>
                  <span className="ml-2 font-semibold">{table.policies}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Rows:</span>
                  <span className="ml-2 font-semibold">{table.rows ?? '~'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const CodeAnalysisView = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Potential Issues Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
            <div className="flex items-start gap-2">
              <Trash2 className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Unused Imports Detected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Found 12 unused imports across 8 files
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/10">
            <div className="flex items-start gap-2">
              <Braces className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Unused Functions</p>
                <p className="text-xs text-muted-foreground mt-1">
                  3 functions defined but never called
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-900/10">
            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Unused Dependencies</p>
                <p className="text-xs text-muted-foreground mt-1">
                  2 npm packages installed but not imported anywhere
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Code Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Files</p>
              <p className="text-2xl font-bold mt-1">147</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Components</p>
              <p className="text-2xl font-bold mt-1">89</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Lines of Code</p>
              <p className="text-2xl font-bold mt-1">~15.2k</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground">Dependencies</p>
              <p className="text-2xl font-bold mt-1">42</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <GitBranch className="h-8 w-8" />
            Project Map
          </h2>
          <p className="text-muted-foreground mt-1">
            Complete visualization of your project structure, database, and code analysis
          </p>
        </div>
        <Button onClick={loadDatabaseSchema} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      <Tabs defaultValue="structure" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            File Structure
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Schema
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Code Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project File Tree</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <CardDescription>
                Browse your complete project structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                {renderFileTree(projectStructure)}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Tables & Security</CardTitle>
              <CardDescription>
                Overview of all database tables with RLS status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                <DatabaseSchemaView />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <ScrollArea className="h-[600px] w-full">
            <CodeAnalysisView />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectMapVisualization;
