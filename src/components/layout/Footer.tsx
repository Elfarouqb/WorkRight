import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.svg";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & description */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="WorkRight Navigator" className="h-10" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              {t("footer.description")}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              {t("footer.disclaimer")}
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-heading font-bold text-foreground mb-4">{t("footer.tools")}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/rechtenverkenner" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.rechtenverkenner")}
                </Link>
              </li>
              <li>
                <Link to="/tijdlijn" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("features.timeline.title")}
                </Link>
              </li>
              <li>
                <Link to="/termijnen" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("features.deadline.title")}
                </Link>
              </li>
              <li>
                <Link to="/procesgids" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.procesgids")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading font-bold text-foreground mb-4">{t("footer.resources")}</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.juridischloket.nl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Het Juridisch Loket
                </a>
              </li>
              <li>
                <a 
                  href="https://mensenrechten.nl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  College voor de Rechten van de Mens
                </a>
              </li>
              <li>
                <a 
                  href="https://www.uwv.nl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  UWV
                </a>
              </li>
              <li>
                <a 
                  href="https://discriminatie.nl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Antidiscriminatiebureau
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} WorkRight Navigator. {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
