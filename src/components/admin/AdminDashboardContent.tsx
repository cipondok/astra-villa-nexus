
import { Suspense } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import AdminDashboardStats from "@/components/admin/AdminDashboardStats";
import AdminQuickActions from "@/components/admin/AdminQuickActions";
import { tabCategories } from "./AdminTabCategories";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span className="ml-2">Loading...</span>
  </div>
);

interface AdminDashboardContentProps {
  isAdmin: boolean;
  setActiveTab: (tab: string) => void;
}

const AdminDashboardContent = ({ isAdmin, setActiveTab }: AdminDashboardContentProps) => {
  const getVisibleTabs = () => {
    const allTabs = Object.values(tabCategories).flatMap(category => category.items);
    return isAdmin ? allTabs : allTabs.filter(tab => !tab.adminOnly);
  };

  const visibleTabs = getVisibleTabs();

  const DashboardOverview = () => (
    <div className="space-y-6">
      <AdminDashboardStats />
      <AdminQuickActions onTabChange={setActiveTab} />
    </div>
  );

  return (
    <>
      {/* Tab Content */}
      <TabsContent value="overview" className="space-y-0">
        <DashboardOverview />
      </TabsContent>

      {visibleTabs.filter(tab => tab.component).map(tab => (
         <TabsContent key={tab.value} value={tab.value} className="space-y-0">
            <Suspense fallback={<LoadingSpinner />}>
              <tab.component />
            </Suspense>
         </TabsContent>
      ))}
    </>
  );
};

export default AdminDashboardContent;
