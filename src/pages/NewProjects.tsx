
import Navigation from "@/components/Navigation";
import ProfessionalFooter from "@/components/ProfessionalFooter";

const NewProjects = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-4">New Projects</h1>
        <p>Discover upcoming real estate projects.</p>
        <div className="mt-8 text-center text-muted-foreground">
          <p>New Projects page content will be here soon.</p>
        </div>
      </main>
      <ProfessionalFooter language="en" />
    </div>
  );
};

export default NewProjects;
