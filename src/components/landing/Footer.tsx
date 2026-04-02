export function Footer() {
  return (
    <footer className="bg-[#100A36] border-t border-[#2A1673]/30 py-16 px-4 md:px-6 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 md:gap-0">
        <div className="flex-1">
          <h3 className="text-3xl font-bold text-white mb-4">ThreatChain</h3>
          <p className="text-[#B6B6CC] max-w-sm mb-6 text-sm leading-relaxed">
            Blockchain-Powered Threat Intelligence. Securely share, validate,
            and track cybersecurity threats with immutable technology.
          </p>
          <div className="text-xs text-[#B6B6CC]/60">
            Built with React • Blockchain • Cybersecurity
          </div>
        </div>

        <div className="flex-[0.5]">
          <h4 className="text-lg font-semibold text-white mb-6 uppercase tracking-wider text-sm">
            Links
          </h4>
          <ul className="space-y-3">
            {[
              "Public Dashboard",
              "Documentation",
              "API Reference",
              "Contact",
            ].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-[#B6B6CC] hover:text-[#A789D6] transition-colors duration-200"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-[0.5]">
          <h4 className="text-lg font-semibold text-white mb-6 uppercase tracking-wider text-sm">
            Legal
          </h4>
          <ul className="space-y-3">
            {["Terms of Service", "Privacy Policy"].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-[#B6B6CC] hover:text-[#A789D6] transition-colors duration-200 text-sm"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#2A1673]/30 text-center text-[#B6B6CC]/60 text-sm">
        &copy; {new Date().getFullYear()} ThreatChain. All rights reserved.
      </div>
    </footer>
  );
}
