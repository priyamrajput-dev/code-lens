import { Link } from "react-router-dom";
import { clsx } from "clsx";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={clsx("bg-warm-canvas pt-12 pb-6 px-6", className)}>
      <div className="max-w-1200 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-medium text-ember-orange">Code Lens</span>
            <p className="text-body text-pewter mt-4 max-w-sm">
              Paste any code and get an instant explanation. Choose from six
              explanation modes or chat with your code.
            </p>
          </div>

          <div>
            <h4 className="text-small-ui font-medium text-ink-black mb-4">Product</h4>
            <ul className="space-y-2">
              {["How it works", "Modes", "Pricing", "Changelog"].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-caption text-pewter hover:text-ember-orange transition-colors duration-150"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-small-ui font-medium text-ink-black mb-4">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-caption text-pewter hover:text-ember-orange transition-colors duration-150"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-sand/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-caption text-warm-gray">
            © {new Date().getFullYear()} Code Lens. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="#"
              className="text-caption text-warm-gray hover:text-pewter transition-colors duration-150"
            >
              Privacy Policy
            </Link>
            <Link
              to="#"
              className="text-caption text-warm-gray hover:text-pewter transition-colors duration-150"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}