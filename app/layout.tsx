import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://jci-excelsior.netlify.app"),
  title: {
    default: "JCI Tabarre Excelsior",
    template: "%s | JCI Tabarre Excelsior",
  },
  description:
    "Locale JCI Tabarre Excelsior — Junior Chamber International Haïti. Jeunes leaders engagés pour le développement communautaire.",
  openGraph: {
    siteName: "JCI Tabarre Excelsior",
    locale: "fr_HT",
    type: "website",
  },
};

const stripExtensionAttrsScript = `
(function() {
  try {
    var isExtAttr = function(n) {
      return typeof n === 'string' && (n.indexOf('bis_') === 0 || n.indexOf('__processed_') === 0);
    };
    var cleanNode = function(el) {
      if (!el || !el.attributes) return;
      for (var i = el.attributes.length - 1; i >= 0; i--) {
        var name = el.attributes[i].name;
        if (isExtAttr(name)) el.removeAttribute(name);
      }
    };
    var cleanAll = function(root) {
      var scope = root && root.querySelectorAll ? root : document;
      cleanNode( document.documentElement );
      cleanNode( document.body );
      var nodes = scope.querySelectorAll('[bis_skin_checked],[bis_register]');
      for (var i = 0; i < nodes.length; i++) cleanNode(nodes[i]);
    };
    var origSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
      if (isExtAttr(name)) return;
      return origSetAttribute.call(this, name, value);
    };
    cleanAll(document);
    var obs = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'attributes' && isExtAttr(m.attributeName)) {
          m.target.removeAttribute(m.attributeName);
        } else if (m.type === 'childList') {
          for (var j = 0; j < m.addedNodes.length; j++) {
            var n = m.addedNodes[j];
            if (n.nodeType === 1) {
              cleanNode(n);
              cleanAll(n);
            }
          }
        }
      }
    });
    obs.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', function() { cleanAll(document); }, { once: true });
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: stripExtensionAttrsScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Montserrat:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
