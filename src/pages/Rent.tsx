
import Navigation from "@/components/Navigation";
import ProfessionalFooter from "@/components/ProfessionalFooter";

const Rent = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-4">Rent Properties</h1>
        <p>Browse properties available for rent.</p>
        <div className="mt-8 text-center text-muted-foreground">
          <p>Rent page content will be here soon.</p>
        </div>
      </main>
      <ProfessionalFooter language="en" />
    </div>
  );
};

export default Rent;
