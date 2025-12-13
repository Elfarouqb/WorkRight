import { Shield, ExternalLink } from "lucide-react";

const resources = [
  { name: "ACAS", url: "https://www.acas.org.uk/" },
  { name: "Citizens Advice", url: "https://www.citizensadvice.org.uk/" },
  { name: "Equality Advisory Service", url: "https://www.equalityadvisoryservice.com/" },
  { name: "Law Society", url: "https://www.lawsociety.org.uk/" },
];

const links = [
  { name: "How It Works", href: "#how-it-works" },
  { name: "Features", href: "#features" },
  { name: "Deadlines", href: "#deadlines" },
  { name: "Accessibility", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg">
                  WorkRight
                </span>
                <span className="text-xs text-background/60 -mt-0.5">
                  Navigator
                </span>
              </div>
            </div>
            <p className="text-background/70 max-w-md leading-relaxed mb-4">
              Free, accessible guidance for workers who suspect discrimination.
              We help you understand your rights and prepare for what's next.
            </p>
            <p className="text-sm text-background/50">
              This tool provides general information, not legal advice. Always
              consult a qualified professional for your specific situation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold mb-4">Navigate</h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* External Resources */}
          <div>
            <h4 className="font-heading font-bold mb-4">Get Expert Help</h4>
            <ul className="space-y-3">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-background/70 hover:text-background transition-colors"
                  >
                    {resource.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/50">
          <p>
            © {new Date().getFullYear()} WorkRight Navigator. Built with care
            for vulnerable workers.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-background transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-background transition-colors">
              Accessibility Statement
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
