export function AboutSection() {
  return (
    <details className="group rounded-2xl border border-stone-200 border-t-4 border-t-amber-700/70 bg-white p-5 dark:border-stone-800 dark:border-t-amber-500/60 dark:bg-stone-900">
      <summary className="cursor-pointer list-none font-serif text-base font-semibold text-stone-800 dark:text-stone-200">
        Was steckt hinter der Einschätzung? ▾
      </summary>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        <p>
          Dr. Andrew Jenkinson beschreibt in seinem Weight-Set-Point-Konzept, dass der Körper ein
          individuelles „Wunschgewicht" über Hormone wie Leptin und Insulin reguliert. Stark
          verarbeitete Lebensmittel liefern konzentrierte Energie bei geringer Sättigungswirkung
          und können diese Regulation stören – der Sollwert kann sich langfristig nach oben
          verschieben. Starke Blutzucker- und Insulinspitzen verstärken diesen Effekt zusätzlich.
        </p>
        <p>
          Das <strong className="text-stone-800 dark:text-stone-200">Weight-Set-Point-Signal</strong>{' '}
          stellt dabei den{' '}
          <strong className="text-stone-800 dark:text-stone-200">glykämischen Index (GI)</strong>{' '}
          und die{' '}
          <strong className="text-stone-800 dark:text-stone-200">glykämische Last (GL)</strong>{' '}
          (GI × Kohlenhydratmenge, immer bezogen auf 100&nbsp;g) in den Mittelpunkt: Ab GI 70 bzw.
          GL 20 pro 100&nbsp;g gilt ein Lebensmittel als ungünstig, ab GI 55 bzw. GL 11 als leicht
          ungünstig. Die strengere der beiden Einstufungen bildet die Basis des
          Weight-Set-Point-Signals. Ein niedriges{' '}
          <strong className="text-stone-800 dark:text-stone-200">Ballaststoff-Verhältnis</strong>{' '}
          (Ballaststoffe unter 10&nbsp;% der Kohlenhydrate) verstärkt eine bereits ungünstige
          GI/GL-Einstufung zusätzlich. Der{' '}
          <strong className="text-stone-800 dark:text-stone-200">Verarbeitungsgrad nach NOVA</strong>{' '}
          (1 = unverarbeitet bis 4 = ultra-verarbeitet) sowie die{' '}
          <strong className="text-stone-800 dark:text-stone-200">Omega-6/3-Einordnung</strong>{' '}
          wirken nur noch als Zusatzfaktoren: NOVA 4 und ein ungünstiges Omega-6/3-Verhältnis
          können die Einstufung jeweils um eine Stufe verschlechtern, sie aber nie verbessern oder
          eine bereits ungünstige GI/GL-Einstufung neutralisieren. Ein unbekanntes
          Omega-6/3-Verhältnis fließt dabei gar nicht erst in die Bewertung ein. „Günstige Wirkung"
          bedeutet: keiner dieser Faktoren schlägt an – nicht, dass das Lebensmittel den Sollwert
          aktiv senkt (das kann ein einzelnes Lebensmittel nicht belegbar). Fehlen GI/GL, NOVA und
          Omega-6/3 alle drei gleichzeitig, wird bewusst kein Weight-Set-Point-Signal berechnet,
          sondern „nicht bewertbar" angezeigt.
        </p>
        <p>
          Das <strong className="text-stone-800 dark:text-stone-200">Omega-6/3-Verhältnis</strong>{' '}
          beschreibt das Mengenverhältnis zweier essenzieller, entzündungsrelevanter Fettsäuregruppen:
          Omega-6 fördert in hoher Dosis eher entzündliche Prozesse, Omega-3 wirkt dem entgegen. Die
          historische/traditionelle Ernährung lag bei etwa 1:1 bis 4:1, die heutige – reich an
          Pflanzenölen wie Sonnenblumen- oder Maiskeimöl – häufig bei 15:1 oder höher. Liegen im
          Produkt gemessene Omega-3/6-Fettwerte vor, berechnet die App das Verhältnis direkt daraus
          (≤4:1 günstig, ≤10:1 neutral, darüber ungünstig); ansonsten ordnet sie das Produkt anhand
          von Kategorie, Bio-/Weide-Label und Zutatenliste ein (z. B. Pflanzenöle mit hohem
          Omega-6-Anteil).
        </p>
        <p className="italic">
          Hinweis: Alle Werte sind Richtwerte aus öffentlichen Tabellen und Kategorie-Zuordnungen
          und schwanken je nach Sorte, Reifegrad, Zubereitung und Herkunft. Liegt für ein Produkt
          kein gemessener GI-Wert vor, schätzt die App ihn per Formel aus Zucker-, Ballaststoff-,
          Fett- und Proteingehalt – das ist eine grobe Näherung, kein Laborwert. Die NOVA-Gruppe
          kommt ausschließlich von Open Food Facts; liegt dort keine vor, zeigt die App „NOVA
          unbestimmt" an, statt selbst zu schätzen. Die Einschätzung ist ein didaktisches
          Hilfsmittel, keine medizinische Bewertung und ersetzt keine individuelle
          Ernährungsberatung.
        </p>
      </div>
    </details>
  )
}
