import { Link } from "react-router-dom";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { PageTransition } from "@/components/motion/PageTransition";
import { ArrowLeft, Compass } from "lucide-react";

export function NotFoundPage() {
  return (
    <PageTransition className="min-h-screen bg-warm-canvas text-ink-black flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-1200 w-full mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-sand/40 flex items-center justify-center mb-6 text-warm-gray">
          <Compass className="w-8 h-8 text-ember-orange" />
        </div>
        <span className="font-mono text-caption text-stone uppercase tracking-widest mb-2">
          404 Error
        </span>
        <h1 className="text-display font-medium text-ink-black mb-4">
          Page Not Found
        </h1>
        <p className="text-body text-pewter max-w-md mb-8">
          The snippet or route you are looking for has been moved or does not exist.
        </p>
        <Link to="/">
          <Button
            variant="primary"
            size="md"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Home
          </Button>
        </Link>
      </main>

      <Footer />
    </PageTransition>
  );
}