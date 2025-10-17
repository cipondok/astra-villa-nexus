import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useUserRoles";

const PropertyTestPanel = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useIsAdmin();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [isTestingDB, setIsTestingDB] = useState(false);

  const testAuth = async () => {
    setIsTestingAuth(true);
    const results = [];
    
    try {
      // Test user authentication
      results.push({
        test: "User Authentication",
        status: user ? "success" : "error",
        message: user ? `Authenticated as: ${user.email}` : "Not authenticated"
      });

      // Test profile data
      results.push({
        test: "Profile Data",
        status: profile ? "success" : "error", 
        message: profile ? `Profile loaded for ${profile.email}` : "No profile found"
      });

      // Test admin status (server-validated)
      results.push({
        test: "Admin Status",
        status: isAdmin ? "success" : "warning",
        message: isAdmin ? "User has admin privileges (verified via RLS)" : "User does not have admin privileges"
      });

    } catch (error) {
      results.push({
        test: "Authentication Test",
        status: "error",
        message: `Error: ${error}`
      });
    }
    
    setTestResults(results);
    setIsTestingAuth(false);
  };

  const testDatabase = async () => {
    setIsTestingDB(true);
    const results = [...testResults];
    
    try {
      // Test reading properties
      const { data: properties, error: readError } = await supabase
        .from('properties')
        .select('id, title, status')
        .limit(3);

      results.push({
        test: "Read Properties",
        status: readError ? "error" : "success",
        message: readError ? `Error: ${readError.message}` : `Found ${properties?.length || 0} properties`
      });

      // Test creating a property (simulation)
      results.push({
        test: "Create Property Access",
        status: "info",
        message: "Simulated - would test property creation"
      });

      // Test updating a property (simulation)
      if (properties && properties.length > 0) {
        const testProperty = properties[0];
        const { error: updateError } = await supabase
          .from('properties')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', testProperty.id);

        results.push({
          test: "Update Property",
          status: updateError ? "error" : "success",
          message: updateError ? `Error: ${updateError.message}` : `Successfully updated property ${testProperty.title}`
        });
      }

    } catch (error) {
      results.push({
        test: "Database Test", 
        status: "error",
        message: `Error: ${error}`
      });
    }
    
    setTestResults(results);
    setIsTestingDB(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      success: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800", 
      warning: "bg-yellow-100 text-yellow-800",
      info: "bg-blue-100 text-blue-800"
    };
    
    return <Badge className={colors[status as keyof typeof colors] || colors.info}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧪 Property Management Diagnostic Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Test Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={testAuth}
            disabled={isTestingAuth}
            variant="outline"
          >
            {isTestingAuth ? "Testing..." : "Test Authentication"}
          </Button>
          <Button 
            onClick={testDatabase}
            disabled={isTestingDB}
            variant="outline"
          >
            {isTestingDB ? "Testing..." : "Test Database Access"}
          </Button>
          <Button 
            onClick={() => setTestResults([])}
            variant="outline"
          >
            Clear Results
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.test}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(result.status)}
                  <span className="text-sm text-gray-600">{result.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
      </CardContent>
    </Card>
  );
};

export default PropertyTestPanel;