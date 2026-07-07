const stats = [
  { value: "50+", label: "Membres actifs" },
  { value: "20+", label: "Initiatives réalisées" },
  { value: "5000+", label: "Bénéficiaires" },
  { value: "10+", label: "Années d'engagement" },
];

export function StatsSection() {
  return (
    <section className="bg-cyan py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold font-heading text-navy mb-2">
                {value}
              </div>
              <div className="text-navy/70 font-medium text-sm md:text-base">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
