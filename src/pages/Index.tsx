import React from "react";

const Index = () => {
  // Temporary simplified version for debugging
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Astra Villa
        </h1>
        <p className="text-center text-muted-foreground mb-4">
          Root page is working correctly. This is a temporary debug version.
        </p>
        <div className="text-center">
          <a 
            href="/admin" 
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors mr-4"
          >
            Go to Admin Dashboard
          </a>
          <a 
            href="/vendor" 
            className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Go to Vendor Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;