
import React from "react";
import { categories } from "./navigationSections";
import NavigationCategory from "./NavigationCategory";

interface AdminNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminNavigation = ({ activeSection, onSectionChange }: AdminNavigationProps) => {
  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <NavigationCategory
          key={category}
          category={category}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
      ))}
    </div>
  );
};

export default AdminNavigation;
