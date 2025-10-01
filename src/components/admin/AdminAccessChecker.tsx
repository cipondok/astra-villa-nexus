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
      // Test reading properties
      const { data: properties, error: readError } = await supabase
        .from('properties')
        .select('id, title, status')
        .limit(1);

      // Test admin function
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
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (isSuccess: boolean) => {
    return isSuccess ? (
      <Badge className="bg-green-100 text-green-800">✓ Pass</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">✗ Fail</Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Admin Access Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Authentication Status */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Authentication Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(!!user)}
                <span>User Authenticated</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(!!user)}
                <span className="text-sm text-gray-600">
                  {user ? user.email : 'Not logged in'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(!!profile)}
                <span>Profile Loaded</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(!!profile)}
                <span className="text-sm text-gray-600">
                  {profile?.role || 'No profile'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
            <div className="flex items-center gap-2">
              {getStatusIcon(isAdmin)}
              <span className="font-medium">Admin Access</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(isAdmin)}
              <span className="text-sm text-gray-600">
                {isAdmin ? 'Admin privileges granted' : 'Admin access required'}
              </span>
            </div>
          </div>
        </div>

        {/* Database Access Test */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database Access Test
            </h3>
            <Button 
              onClick={testDatabaseAccess}
              disabled={isTestingDB}
              size="sm"
              variant="outline"
            >
              {isTestingDB ? "Testing..." : "Test Database"}
            </Button>
          </div>

          {dbTestResult && (
            <div className="space-y-2">
              {dbTestResult.error ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{dbTestResult.error}</AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(dbTestResult.propertiesRead.success)}
                      <span>Read Properties</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(dbTestResult.propertiesRead.success)}
                      <span className="text-sm text-gray-600">
                        {dbTestResult.propertiesRead.success 
                          ? `${dbTestResult.propertiesRead.count} properties` 
                          : dbTestResult.propertiesRead.error}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(dbTestResult.adminAccess.success)}
                      <span>Admin Function</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(dbTestResult.adminAccess.success)}
                      <span className="text-sm text-gray-600">
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
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Action Items
          </h3>
          
          {!user && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Please log in</strong> to access property management features.
              </AlertDescription>
            </Alert>
          )}

          {user && !profile && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Profile not found.</strong> Your user profile may not be properly set up.
              </AlertDescription>
            </Alert>
          )}

          {user && profile && !isAdmin && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Admin access required.</strong> Your current role is "{profile.role}". Contact an administrator to get admin privileges.
              </AlertDescription>
            </Alert>
          )}

          {isAdmin && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
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