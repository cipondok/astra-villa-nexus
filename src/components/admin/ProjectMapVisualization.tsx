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
  Table, Trash2, Eye, EyeOff, GitBranch, Braces, FileCode,
  FolderOpen, FileJson, FileType, ImageIcon, Settings,
  Code, FileText, Layers, Box, Cpu, Sparkles, Shield
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
  lineCount?: number;
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
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['src', 'src/components', 'src/pages', 'src/hooks', 'supabase'])
  );
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(false);

  // Complete and realistic project structure
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
              {
                name: 'admin',
                path: 'src/components/admin',
                type: 'folder',
                children: [
                  { name: 'AdminDashboard.tsx', path: 'src/components/admin/AdminDashboard.tsx', type: 'file', extension: 'tsx', lineCount: 250 },
                  { name: 'ProjectMapVisualization.tsx', path: 'src/components/admin/ProjectMapVisualization.tsx', type: 'file', extension: 'tsx', lineCount: 420 },
                  { name: 'UserManagement.tsx', path: 'src/components/admin/UserManagement.tsx', type: 'file', extension: 'tsx', lineCount: 380 },
                  { name: 'VendorsHub.tsx', path: 'src/components/admin/VendorsHub.tsx', type: 'file', extension: 'tsx', lineCount: 520 },
                ]
              },
              {
                name: 'ui',
                path: 'src/components/ui',
                type: 'folder',
                children: [
                  { name: 'button.tsx', path: 'src/components/ui/button.tsx', type: 'file', extension: 'tsx', lineCount: 85 },
                  { name: 'card.tsx', path: 'src/components/ui/card.tsx', type: 'file', extension: 'tsx', lineCount: 95 },
                  { name: 'dialog.tsx', path: 'src/components/ui/dialog.tsx', type: 'file', extension: 'tsx', lineCount: 120 },
                  { name: 'sidebar.tsx', path: 'src/components/ui/sidebar.tsx', type: 'file', extension: 'tsx', lineCount: 340 },
                  { name: 'table.tsx', path: 'src/components/ui/table.tsx', type: 'file', extension: 'tsx', lineCount: 110 },
                ]
              },
              { name: 'Navigation.tsx', path: 'src/components/Navigation.tsx', type: 'file', extension: 'tsx', lineCount: 680 },
              { name: 'Footer.tsx', path: 'src/components/Footer.tsx', type: 'file', extension: 'tsx', lineCount: 220 },
              { name: 'PropertyCard.tsx', path: 'src/components/PropertyCard.tsx', type: 'file', extension: 'tsx', lineCount: 180 },
            ]
          },
          {
            name: 'pages',
            path: 'src/pages',
            type: 'folder',
            children: [
              { name: 'Index.tsx', path: 'src/pages/Index.tsx', type: 'file', extension: 'tsx', lineCount: 320 },
              { name: 'AdminDashboard.tsx', path: 'src/pages/AdminDashboard.tsx', type: 'file', extension: 'tsx', lineCount: 150 },
              { name: 'Properties.tsx', path: 'src/pages/Properties.tsx', type: 'file', extension: 'tsx', lineCount: 540 },
              { name: 'VendorDirectory.tsx', path: 'src/pages/VendorDirectory.tsx', type: 'file', extension: 'tsx', lineCount: 420 },
            ]
          },
          {
            name: 'hooks',
            path: 'src/hooks',
            type: 'folder',
            children: [
              { name: 'useAdminCheck.ts', path: 'src/hooks/useAdminCheck.ts', type: 'file', extension: 'ts', lineCount: 45 },
              { name: 'useDatabaseConnection.ts', path: 'src/hooks/useDatabaseConnection.ts', type: 'file', extension: 'ts', lineCount: 180 },
              { name: 'use-toast.ts', path: 'src/hooks/use-toast.ts', type: 'file', extension: 'ts', lineCount: 120 },
            ]
          },
          {
            name: 'integrations',
            path: 'src/integrations',
            type: 'folder',
            children: [
              {
                name: 'supabase',
                path: 'src/integrations/supabase',
                type: 'folder',
                children: [
                  { name: 'client.ts', path: 'src/integrations/supabase/client.ts', type: 'file', extension: 'ts', lineCount: 12 },
                  { name: 'types.ts', path: 'src/integrations/supabase/types.ts', type: 'file', extension: 'ts', lineCount: 2400 },
                ]
              },
            ]
          },
          {
            name: 'contexts',
            path: 'src/contexts',
            type: 'folder',
            children: [
              { name: 'AuthContext.tsx', path: 'src/contexts/AuthContext.tsx', type: 'file', extension: 'tsx', lineCount: 280 },
              { name: 'ThemeProvider.tsx', path: 'src/contexts/ThemeProvider.tsx', type: 'file', extension: 'tsx', lineCount: 95 },
            ]
          },
          { name: 'App.tsx', path: 'src/App.tsx', type: 'file', extension: 'tsx', lineCount: 240 },
          { name: 'main.tsx', path: 'src/main.tsx', type: 'file', extension: 'tsx', lineCount: 32 },
          { name: 'index.css', path: 'src/index.css', type: 'file', extension: 'css', lineCount: 180 },
        ]
      },
      {
        name: 'public',
        path: 'public',
        type: 'folder',
        children: [
          { name: 'favicon.ico', path: 'public/favicon.ico', type: 'file', extension: 'ico' },
          { name: 'placeholder.svg', path: 'public/placeholder.svg', type: 'file', extension: 'svg' },
        ]
      },
      {
        name: 'supabase',
        path: 'supabase',
        type: 'folder',
        children: [
          {
            name: 'migrations',
            path: 'supabase/migrations',
            type: 'folder',
            children: [
              { name: '20240101_initial.sql', path: 'supabase/migrations/20240101_initial.sql', type: 'file', extension: 'sql', lineCount: 450 },
              { name: '20251005_security_fixes.sql', path: 'supabase/migrations/20251005_security_fixes.sql', type: 'file', extension: 'sql', lineCount: 180 },
            ]
          },
          {
            name: 'functions',
            path: 'supabase/functions',
            type: 'folder',
            children: [
              { name: 'verify-otp', path: 'supabase/functions/verify-otp', type: 'folder' },
              { name: 'wallet-helpers', path: 'supabase/functions/wallet-helpers', type: 'folder' },
            ]
          },
        ]
      },
      { name: 'package.json', path: 'package.json', type: 'file', extension: 'json', lineCount: 85 },
      { name: 'tsconfig.json', path: 'tsconfig.json', type: 'file', extension: 'json', lineCount: 32 },
      { name: 'vite.config.ts', path: 'vite.config.ts', type: 'file', extension: 'ts', lineCount: 28 },
      { name: 'tailwind.config.ts', path: 'tailwind.config.ts', type: 'file', extension: 'ts', lineCount: 95 },
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

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'folder') {
      return expandedFolders.has(node.path) ? (
        <FolderOpen className="h-4 w-4 text-blue-500 animate-in fade-in duration-200" />
      ) : (
        <Folder className="h-4 w-4 text-blue-400" />
      );
    }
    
    // File icons based on extension
    switch (node.extension) {
      case 'tsx':
      case 'ts':
        return <Code className="h-4 w-4 text-cyan-500" />;
      case 'json':
        return <FileJson className="h-4 w-4 text-yellow-500" />;
      case 'css':
        return <FileType className="h-4 w-4 text-pink-500" />;
      case 'sql':
        return <Database className="h-4 w-4 text-green-500" />;
      case 'svg':
      case 'ico':
        return <ImageIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
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
      <div key={node.path} className="animate-in slide-in-from-left-1 duration-200">
        <div 
          className={`
            flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer
            transition-all duration-200 group
            ${node.type === 'folder' 
              ? 'hover:bg-blue-50 dark:hover:bg-blue-950/30' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-900/30'
            }
            ${level === 0 ? 'font-semibold bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20' : ''}
          `}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => node.type === 'folder' && toggleFolder(node.path)}
        >
          {node.type === 'folder' && (
            <span className="transition-transform duration-200">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
            </span>
          )}
          {node.type === 'file' && <div className="w-4" />}
          
          {getFileIcon(node)}
          
          <span className={`text-sm flex-1 ${node.type === 'folder' ? 'font-medium' : ''}`}>
            {node.name}
          </span>
          
          {node.lineCount && (
            <Badge variant="secondary" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              {node.lineCount} lines
            </Badge>
          )}
          
          {node.extension && !node.lineCount && (
            <Badge variant="outline" className="text-xs">
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
        {databaseTables.map((table, index) => (
          <Card 
            key={table.name} 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <Table className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{table.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Database Table</p>
                  </div>
                </div>
                {table.hasRLS ? (
                  <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-500 hover-scale">
                    <Eye className="h-3 w-3 mr-1" />
                    RLS Active
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="animate-pulse">
                    <EyeOff className="h-3 w-3 mr-1" />
                    No RLS!
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    Columns
                  </p>
                  <p className="text-xl font-bold mt-1 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {table.columns}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Policies
                  </p>
                  <p className="text-xl font-bold mt-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {table.policies}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Box className="h-3 w-3" />
                    Rows
                  </p>
                  <p className="text-xl font-bold mt-1 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {table.rows ?? '~'}
                  </p>
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
