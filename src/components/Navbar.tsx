import { useState, useEffect, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { Menu, X, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll function
  const handleSmoothScroll = (
    e: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    const sectionId = href.replace("#", "");
    const section = document.getElementById(sectionId);

    if (section) {
      const navbarHeight = 80; // Adjust based on your navbar height
      const sectionPosition = section.offsetTop - navbarHeight;

      window.scrollTo({
        top: sectionPosition,
        behavior: "smooth",
      });

      // Close mobile menu if open
      setIsMobileMenuOpen(false);

      // Update URL without refreshing
      window.history.pushState(null, "", href);
    }
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Documentation", href: "#docs" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#120226]/95 backdrop-blur-lg border-b border-[#2A1673]/30 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#4A3CC9] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ThreatChain</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-[#B6B6CC] hover:text-white transition-colors duration-200 font-medium cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/become-contributor"
              className="bg-[#4A3CC9] text-white px-6 py-2.5 rounded-lg hover:bg-[#5A49DA] shadow-lg shadow-[#4A3CC9]/30 transition-all duration-300 hover:scale-105 font-medium"
            >
              Become a Contributor
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#2A1673]/30 py-4"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-[#B6B6CC] hover:text-white transition-colors duration-200 font-medium py-2 cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-[#2A1673]/30">
                <button className="text-[#A789D6] hover:text-white transition-colors duration-200 font-medium py-2 text-left">
                  Sign In
                </button>
                <Link
                  to="/become-contributor"
                  className="w-full bg-[#4A3CC9] text-white px-6 py-3 rounded-lg hover:bg-[#5A49DA] transition-all duration-300 font-medium text-center"
                >
                  Become a Contributor
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
