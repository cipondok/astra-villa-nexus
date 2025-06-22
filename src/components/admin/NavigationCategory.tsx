
import React from "react";
import { navigationSections } from "./navigationSections";
import NavigationCard from "./NavigationCard";

interface NavigationCategoryProps {
  category: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const NavigationCategory = ({ category, activeSection, onSectionChange }: NavigationCategoryProps) => {
  const isUsersCategory = category === 'Users';
  const sectionsInCategory = navigationSections.filter(section => section.category === category);

  return (
    <div>
      <h3 className={`text-lg font-semibold mb-3 ${
        isUsersCategory ? 'text-blue-600' : 'text-gray-700'
      }`}>
        {isUsersCategory ? '👥 Users Management' : category}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectionsInCategory.map((section) => (
          <NavigationCard
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            isUsersCategory={isUsersCategory}
            onSectionChange={onSectionChange}
          />
        ))}
      </div>
    </div>
  );
};

export default NavigationCategory;
