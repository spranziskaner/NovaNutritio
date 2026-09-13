export function AboutSection() {
  return (
    <details className="group rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <summary className="cursor-pointer list-none text-sm font-semibold text-neutral-800 dark:text-neutral-200">
        Was steckt hinter der Einschätzung? ▾
      </summary>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        <p>
          Dr. Andrew Jenkinson beschreibt in seinem Weight-Set-Point-Konzept, dass der Körper ein
          individuelles „Wunschgewicht" über Hormone wie Leptin und Insulin reguliert. Stark
          verarbeitete Lebensmittel liefern konzentrierte Energie bei geringer Sättigungswirkung
          und können diese Regulation stören – der Sollwert kann sich langfristig nach oben
          verschieben. Starke Blutzucker- und Insulinspitzen verstärken diesen Effekt zusätzlich.
        </p>
        <p>
          Diese App kombiniert deshalb zwei Kennzahlen: den{' '}
          <strong className="text-neutral-800 dark:text-neutral-200">glykämischen Index (GI)</strong>{' '}
          bzw. die daraus abgeleitete glykämische Last (GI × Kohlenhydratmenge der Portion) sowie
          den <strong className="text-neutral-800 dark:text-neutral-200">Verarbeitungsgrad nach NOVA</strong>{' '}
          (1 = unverarbeitet bis 4 = ultra-verarbeitet). Der NOVA-Wert fließt stärker gewichtet in
          die Gesamteinschätzung ein, da laut Jenkinson gerade der Verarbeitungsgrad – unabhängig
          vom Blutzuckerwert – die Sättigungssignale beeinflusst.
        </p>
        <p className="italic">
          Hinweis: Alle Werte sind Richtwerte aus öffentlichen Tabellen und schwanken je nach
          Sorte, Reifegrad und Zubereitung. Die Einschätzung ist ein didaktisches Hilfsmittel,
          keine medizinische Bewertung und ersetzt keine individuelle Ernährungsberatung.
        </p>
      </div>
    </details>
  )
}
