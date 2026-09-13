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
          folgt dabei einer klaren Rangfolge. Zuerst ein Basis-Filter:{' '}
          <strong className="text-stone-800 dark:text-stone-200">NOVA 4</strong> (ultra-verarbeitet)
          macht ein Lebensmittel unabhängig von GI/GL zu „ungünstig" – Zucker,
          Fruktose-Süßungsmittel und Industrie-Pflanzenöle kommen in unverarbeiteten bis
          handwerklich verarbeiteten Produkten (NOVA 1–3) praktisch nicht vor. Ist NOVA nicht 4,
          entscheidet die{' '}
          <strong className="text-stone-800 dark:text-stone-200">glykämische Last (GL)</strong>{' '}
          (GI × Kohlenhydratmenge{' '}
          <strong className="text-stone-800 dark:text-stone-200">der tatsächlichen Portion</strong>{' '}
          / 100) über die Basis-Einstufung – ab GL 20 pro Portion gilt ein Lebensmittel als
          ungünstig, ab GL 11 als leicht ungünstig. Der{' '}
          <strong className="text-stone-800 dark:text-stone-200">glykämische Index (GI)</strong>{' '}
          spielt dabei nur eine Nebenrolle (Fallback, wenn keine GL berechnet werden kann): nicht
          die Geschwindigkeit des Blutzuckeranstiegs ist entscheidend, sondern die insgesamt
          freigesetzte Glukosemenge. Ein hoher{' '}
          <strong className="text-stone-800 dark:text-stone-200">Ballaststoffgehalt</strong> (ab
          3&nbsp;g je 100&nbsp;g, EU-Grenzwert für „Ballaststoffquelle") dämpft die
          GL-Einstufung um eine Stufe – komplexe Kohlenhydrate mit intakter Ballaststoffmatrix
          setzen ihre Glukose langsamer frei. Ein niedriger Ballaststoffgehalt verschärft die
          Einstufung dagegen nicht zusätzlich. Die{' '}
          <strong className="text-stone-800 dark:text-stone-200">Omega-6/3-Einordnung</strong>{' '}
          bleibt ein reiner Zusatzfaktor: ein ungünstiges Verhältnis verschlechtert die Einstufung
          um eine Stufe, ein unbekanntes (der Normalfall bei Getreide ohne relevante Fettquelle)
          fließt gar nicht erst ein. „Günstige Wirkung" bedeutet: keiner dieser Faktoren schlägt an
          – nicht, dass das Lebensmittel den Sollwert aktiv senkt (das kann ein einzelnes
          Lebensmittel nicht belegbar). Fehlen GI/GL, NOVA und Omega-6/3 alle drei gleichzeitig,
          wird bewusst kein Weight-Set-Point-Signal berechnet, sondern „nicht bewertbar" angezeigt.
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
          und schwanken je nach Sorte, Reifegrad, Zubereitung und Herkunft. Neben der
          portionsbezogenen GL zeigt die App zum Vergleich auch den Wert je 100&nbsp;g an – nur die
          portionsbezogene GL fließt in die Bewertung ein. Bei Trockenprodukten (Getreide,
          Hülsenfrüchte) ist die hinterlegte Portion die realistische trockene Menge pro Mahlzeit,
          nicht 100&nbsp;g Rohware, da sich die Nährwertangabe auf die trockene, ungekochte Ware
          bezieht. Liegt für ein Produkt kein gemessener GI-Wert vor, schätzt die App ihn per
          Formel aus Zucker-, Ballaststoff-, Fett- und Proteingehalt – das ist eine grobe
          Näherung, kein Laborwert. Die NOVA-Gruppe kommt ausschließlich von Open Food Facts; liegt
          dort keine vor, zeigt die App „NOVA unbestimmt" an, statt selbst zu schätzen. Die
          Einschätzung ist ein didaktisches Hilfsmittel, keine medizinische Bewertung und ersetzt
          keine individuelle Ernährungsberatung.
        </p>
      </div>
    </details>
  )
}
