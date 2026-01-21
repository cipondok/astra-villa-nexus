import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, User, Shield, Database, Settings } from "lucide-react";

const AdminAccessChecker = () => {
  const { user, profile } = useAuth();
  const { isAdmin } = useAdminCheck();
  const [dbTestResult, setDbTestResult] = useState<any>(null);
  const [isTestingDB, setIsTestingDB] = useState(false);

  const testDatabaseAccess = async () => {
    setIsTestingDB(true);
    try {
      const { data: properties, error: readError } = await supabase
        .from('properties')
        .select('id, title, status')
        .limit(1);

      const { data: adminTest, error: adminError } = await supabase
        .rpc('check_admin_access');

      setDbTestResult({
        propertiesRead: { success: !readError, error: readError?.message, count: properties?.length || 0 },
        adminAccess: { success: !adminError, result: adminTest, error: adminError?.message }
      });
    } catch (error) {
      setDbTestResult({
        error: `Test failed: ${error}`
      });
    }
    setIsTestingDB(false);
  };

  const getStatusIcon = (isSuccess: boolean) => {
    return isSuccess ? (
      <CheckCircle className="h-3 w-3 text-emerald-500" />
    ) : (
      <XCircle className="h-3 w-3 text-destructive" />
    );
  };

  const getStatusBadge = (isSuccess: boolean) => {
    return isSuccess ? (
      <Badge className="text-[9px] h-4 px-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">✓ Pass</Badge>
    ) : (
      <Badge className="text-[9px] h-4 px-1.5 bg-destructive/10 text-destructive border-destructive/30">✗ Fail</Badge>
    );
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-medium text-foreground flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" />
          Admin Access Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">
        
        {/* Authentication Status */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-medium text-foreground flex items-center gap-1.5">
            <User className="h-3 w-3" />
            Authentication Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 bg-background/50 border border-border/50 rounded-md">
              <div className="flex items-center gap-1.5">
                {getStatusIcon(!!user)}
                <span className="text-[10px] text-foreground">User Authenticated</span>
              </div>
              <div className="flex items-center gap-1.5">
                {getStatusBadge(!!user)}
                <span className="text-[9px] text-muted-foreground truncate max-w-20">
                  {user ? user.email : 'Not logged in'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-background/50 border border-border/50 rounded-md">
              <div className="flex items-center gap-1.5">
                {getStatusIcon(!!profile)}
                <span className="text-[10px] text-foreground">Profile Loaded</span>
              </div>
              <div className="flex items-center gap-1.5">
                {getStatusBadge(!!profile)}
                <span className="text-[9px] text-muted-foreground">
                  {profile?.role || 'No profile'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 bg-primary/5 border border-primary/20 rounded-md">
            <div className="flex items-center gap-1.5">
              {getStatusIcon(isAdmin)}
              <span className="text-[10px] font-medium text-foreground">Admin Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              {getStatusBadge(isAdmin)}
              <span className="text-[9px] text-muted-foreground">
                {isAdmin ? 'Granted' : 'Required'}
              </span>
            </div>
          </div>
        </div>

        {/* Database Access Test */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-medium text-foreground flex items-center gap-1.5">
              <Database className="h-3 w-3" />
              Database Access Test
            </h3>
            <Button 
              onClick={testDatabaseAccess}
              disabled={isTestingDB}
              size="sm"
              variant="outline"
              className="h-6 text-[9px] px-2"
            >
              {isTestingDB ? "Testing..." : "Test Database"}
            </Button>
          </div>

          {dbTestResult && (
            <div className="space-y-1.5">
              {dbTestResult.error ? (
                <Alert className="p-2 border-destructive/50 bg-destructive/10">
                  <AlertTriangle className="h-3 w-3" />
                  <AlertDescription className="text-[10px]">{dbTestResult.error}</AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2 bg-background/50 border border-border/50 rounded-md">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(dbTestResult.propertiesRead.success)}
                      <span className="text-[10px] text-foreground">Read Properties</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(dbTestResult.propertiesRead.success)}
                      <span className="text-[9px] text-muted-foreground">
                        {dbTestResult.propertiesRead.success 
                          ? `${dbTestResult.propertiesRead.count} found` 
                          : dbTestResult.propertiesRead.error}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-background/50 border border-border/50 rounded-md">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(dbTestResult.adminAccess.success)}
                      <span className="text-[10px] text-foreground">Admin Function</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(dbTestResult.adminAccess.success)}
                      <span className="text-[9px] text-muted-foreground">
                        {dbTestResult.adminAccess.success 
                          ? `Result: ${dbTestResult.adminAccess.result}` 
                          : dbTestResult.adminAccess.error}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Items */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-medium text-foreground flex items-center gap-1.5">
            <Settings className="h-3 w-3" />
            Action Items
          </h3>
          
          {!user && (
            <Alert className="p-2 border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <AlertDescription className="text-[10px] text-amber-600 dark:text-amber-400">
                <strong>Please log in</strong> to access property management features.
              </AlertDescription>
            </Alert>
          )}

          {user && !profile && (
            <Alert className="p-2 border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <AlertDescription className="text-[10px] text-amber-600 dark:text-amber-400">
                <strong>Profile not found.</strong> Your user profile may not be properly set up.
              </AlertDescription>
            </Alert>
          )}

          {user && profile && !isAdmin && (
            <Alert className="p-2 border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <AlertDescription className="text-[10px] text-amber-600 dark:text-amber-400">
                <strong>Admin access required.</strong> Your current role is "{profile.role}". Contact an administrator.
              </AlertDescription>
            </Alert>
          )}

          {isAdmin && (
            <Alert className="p-2 border-emerald-500/50 bg-emerald-500/10">
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              <AlertDescription className="text-[10px] text-emerald-600 dark:text-emerald-400">
                <strong>All requirements met!</strong> You have full admin access to property management.
              </AlertDescription>
            </Alert>
          )}
        </div>

      </CardContent>
    </Card>
  );
};

export default AdminAccessChecker;
