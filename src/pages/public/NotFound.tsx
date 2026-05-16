import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-prose py-32 text-center">
      <h1 className="font-serif text-5xl font-semibold">404</h1>
      <p className="mt-3 text-muted-foreground">Page not found.</p>
      <Button asChild className="mt-6"><Link to="/">Back home</Link></Button>
    </section>
  );
}
