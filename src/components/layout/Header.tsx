import { Menu, X, User, LogOut, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AccessibilityToolbar } from "@/components/AccessibilityToolbar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.svg";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const navLinks = [
    { href: "/rechtenverkenner", label: t("nav.rechtenverkenner") },
    { href: "/tijdlijn", label: t("nav.tijdlijn") },
    { href: "/termijnen", label: t("nav.termijnen") },
    { href: "/procesgids", label: t("nav.procesgids") },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleLanguage = () => {
    setLanguage(language === "nl" ? "en" : "nl");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-18 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img 
            src={logo} 
            alt="WorkRight Navigator" 
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLanguage}
            className="gap-2 font-medium"
          >
            <Globe className="w-4 h-4" />
            {language === "nl" ? "EN" : "NL"}
          </Button>

          <AccessibilityToolbar />
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/tijdlijn">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  {t("nav.myTimeline")}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="default">
                {t("nav.login")}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-background"
          >
            <nav className="container py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border mt-2 flex flex-col gap-2">
                {/* Language Toggle Mobile */}
                <Button 
                  variant="outline" 
                  onClick={toggleLanguage}
                  className="w-full gap-2"
                >
                  <Globe className="w-4 h-4" />
                  {language === "nl" ? "Switch to English" : "Naar Nederlands"}
                </Button>

                <AccessibilityToolbar />
                {user ? (
                  <>
                    <Link to="/tijdlijn" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full gap-2">
                        <User className="w-4 h-4" />
                        {t("nav.myTimeline")}
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={handleSignOut} className="w-full gap-2">
                      <LogOut className="w-4 h-4" />
                      {t("nav.logout")}
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">
                      {t("nav.login")}
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
