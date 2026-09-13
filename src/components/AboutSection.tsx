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
          Diese App kombiniert deshalb drei Kennzahlen zu einem{' '}
          <strong className="text-neutral-800 dark:text-neutral-200">Gesamtsignal</strong>: den{' '}
          <strong className="text-neutral-800 dark:text-neutral-200">Verarbeitungsgrad nach NOVA</strong>{' '}
          (1 = unverarbeitet bis 4 = ultra-verarbeitet), die{' '}
          <strong className="text-neutral-800 dark:text-neutral-200">glykämische Last (GL)</strong>{' '}
          (Glykämischer Index × Kohlenhydratmenge der Portion – aussagekräftiger für die
          Insulinwirkung als der GI allein) sowie die{' '}
          <strong className="text-neutral-800 dark:text-neutral-200">Omega-6/3-Einordnung</strong>{' '}
          des Lebensmittels. Rot bedeutet: NOVA 4 zusammen mit hoher GL oder ungünstigem
          Omega-Verhältnis, oder zwei der drei Kriterien fallen ungünstig aus. Gelb heißt: genau
          eines der drei Kriterien ist auffällig, Grün: alle drei sind unauffällig. Fehlt einer der
          drei Werte, wird bewusst kein Gesamtsignal berechnet, sondern „unvollständige Datenlage"
          angezeigt.
        </p>
        <p className="italic">
          Hinweis: Alle Werte sind Richtwerte aus öffentlichen Tabellen und Kategorie-Zuordnungen
          und schwanken je nach Sorte, Reifegrad, Zubereitung und Herkunft. Liegt für ein Produkt
          kein gemessener GI-Wert vor, schätzt die App ihn per Formel aus Zucker-, Ballaststoff-,
          Fett- und Proteingehalt – das ist eine grobe Näherung, kein Laborwert. Omega-6/3 wird nie
          berechnet, sondern ausschließlich über Kategorie-, Label- und Zutatenlisten-Abgleich
          eingeordnet; ohne Treffer zeigt die App „keine Einordnung verfügbar" statt zu raten. Die
          Einschätzung ist ein didaktisches Hilfsmittel, keine medizinische Bewertung und ersetzt
          keine individuelle Ernährungsberatung.
        </p>
      </div>
    </details>
  )
}
