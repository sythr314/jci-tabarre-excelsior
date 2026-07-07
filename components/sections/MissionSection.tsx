import { SectionHeader } from "@/components/ui/SectionHeader";

const values = [
  {
    icon: "🌍",
    title: "Action communautaire",
    description: "Nous agissons localement pour créer un impact durable dans nos communautés.",
  },
  {
    icon: "💡",
    title: "Entrepreneuriat",
    description: "Nous encourageons l'esprit d'entreprise et l'innovation chez les jeunes Haïtiens.",
  },
  {
    icon: "🎓",
    title: "Formation continue",
    description: "Nous investissons dans le développement personnel et professionnel de nos membres.",
  },
  {
    icon: "🤝",
    title: "Réseau mondial",
    description: "Nous faisons partie d'un réseau de 200 000 membres JCI à travers le monde.",
  },
];

export function MissionSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Notre mission"
          subtitle="JCI Tabarre Excelsior offre aux jeunes l'opportunité de développer leur potentiel de leadership pour créer un impact positif."
          centered
          className="mb-14"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map(({ icon, title, description }) => (
            <div key={title} className="text-center">
              <div className="text-4xl mb-4" aria-hidden="true">{icon}</div>
              <h3 className="font-heading font-bold text-navy text-lg mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
