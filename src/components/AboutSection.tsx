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
          ist ein gewichteter Composite-Score aus fünf Faktoren – Jenkinson beschreibt den
          Sollwert-Effekt ausdrücklich als Zusammenspiel von Insulin/Leptin, Verarbeitungsgrad und
          Omega-6/3, nicht als Ergebnis eines einzelnen „schlechten" Werts. Ein einzelner auffälliger
          Einzelwert reicht daher nie allein für eine ungünstige Gesamteinstufung:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong className="text-stone-800 dark:text-stone-200">NOVA-Gruppe (35&nbsp;%)</strong> –
            NOVA 1–2 zählt als Plus, NOVA 4 (ultra-verarbeitet, meist mit Zucker,
            Fruktose-Süßungsmitteln und Industrie-Pflanzenölen) als stärkstes Minus.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">
              Glykämische Last (30&nbsp;%)
            </strong>{' '}
            – GI × Kohlenhydratmenge der{' '}
            <strong className="text-stone-800 dark:text-stone-200">tatsächlichen Portion</strong>{' '}
            / 100 (ab GL 20 „hoch", ab 11 „mittel"). Eine hohe GL wird nur dann voll negativ
            gewertet, wenn zusätzlich der GI hoch UND die Ballaststoffe niedrig sind – ist der GI
            niedriger oder liegen genug Ballaststoffe vor (ab 3&nbsp;g/100&nbsp;g, EU-Grenzwert für
            „Ballaststoffquelle"), wird dieselbe GL nur noch milde gewertet, da die schnelle
            Insulinspitze – laut Jenkinson das eigentliche Problem – ausbleibt. Jenkinsons Plan
            nennt dazu ein <strong className="text-stone-800 dark:text-stone-200">tägliches</strong>{' '}
            GL-Budget von 80–150, keine Einzelprodukt-Grenzwerte – eine einzelne „hohe" Portion ist
            also kein Alarmsignal für sich, sondern eine von mehreren, die ins Tagesbudget passen
            müssen (Kontext-Hinweis dazu bei jedem Produkt).
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">Zuckeranteil (15&nbsp;%)</strong>{' '}
            – als direkter Insulin-/Leptin-Faktor: niedrig bis 5&nbsp;g/100&nbsp;g, hoch ab
            22,5&nbsp;g/100&nbsp;g (etablierte Lebensmittel-Ampel-Grenzwerte).
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">
              Omega-6/3-Verhältnis (15&nbsp;%)
            </strong>{' '}
            – zählt nur bei relevantem Fettanteil (über 5&nbsp;g/100&nbsp;g), sonst neutral: bei
            Getreide oder Gemüse ohne nennenswertes Fett wäre eine Bewertung nicht aussagekräftig.
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-200">
              Protein-/Ballaststoffdichte (5&nbsp;%)
            </strong>{' '}
            – reiner Bonus (nie negativ): sättigungsfördernd über das PYY-Signal.
          </li>
        </ul>
        <p>
          Aus dem gewichteten Score (-2 bis +2) ergibt sich eine 5-stufige Einordnung: 🟢🟢 sehr
          günstig, 🟢 günstig, ⚪ neutral, 🟡 leicht ungünstig, 🔴 ungünstig. „Günstig" bedeutet dabei:
          die bekannten Faktoren schlagen in Summe positiv aus – nicht, dass das Lebensmittel den
          Sollwert aktiv senkt (das kann ein einzelnes Lebensmittel nicht belegbar). Fehlt einer der
          gewichteten Faktoren (NOVA, GL, Zucker), wird sein Gewicht auf die bekannten Faktoren
          umgelegt, statt die Bewertung zu verweigern.
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
