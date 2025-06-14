
import Navigation from "@/components/Navigation";
import ProfessionalFooter from "@/components/ProfessionalFooter";

const PreLaunching = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-4">Pre-launching Offers</h1>
        <p>Get exclusive access to pre-launching properties and offers.</p>
        <div className="mt-8 text-center text-muted-foreground">
          <p>Pre-launching page content will be here soon.</p>
        </div>
      </main>
      <ProfessionalFooter language="en" />
    </div>
  );
};

export default PreLaunching;
