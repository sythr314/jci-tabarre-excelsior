import Link from "next/link";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/about", label: "À propos" },
  { href: "/initiatives", label: "Nos initiatives" },
  { href: "/contact", label: "Contact" },
  { href: "/join", label: "Nous rejoindre" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-heading font-bold text-2xl text-white">JCI</span>
              <span className="font-heading font-semibold text-cyan text-sm leading-tight">
                Tabarre<br />Excelsior
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Locale membre de JCI Haïti — Junior Chamber International.
              Des jeunes leaders engagés pour le changement.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm hover:text-cyan transition-colors focus-visible:outline-none focus-visible:text-cyan"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-2 text-sm">
              <li>Tabarre, Haïti</li>
              <li>
                <a
                  href="https://jcihaiti.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan transition-colors focus-visible:outline-none focus-visible:text-cyan"
                >
                  jcihaiti.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {year} JCI Tabarre Excelsior. Tous droits réservés.</p>
          <p>Membre de JCI Haïti — Junior Chamber International</p>
        </div>
      </div>
    </footer>
  );
}
