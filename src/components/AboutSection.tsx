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
          Das <strong className="text-stone-800 dark:text-stone-200">Gesamtsignal</strong> stellt
          dabei den{' '}
          <strong className="text-stone-800 dark:text-stone-200">glykämischen Index (GI)</strong>{' '}
          und die{' '}
          <strong className="text-stone-800 dark:text-stone-200">glykämische Last (GL)</strong>{' '}
          (GI × Kohlenhydratmenge einer realistischen Portion) in den Mittelpunkt: Ab GI 70 bzw.
          GL 20 pro Portion gilt ein Lebensmittel als auffällig, ab GI 55 bzw. GL 11 als mittel.
          Die strengere der beiden Einstufungen bildet die Basis des Gesamtsignals. Ein niedriges{' '}
          <strong className="text-stone-800 dark:text-stone-200">Ballaststoff-Verhältnis</strong>{' '}
          (Ballaststoffe unter 10&nbsp;% der Kohlenhydrate) verstärkt eine bereits auffällige
          GI/GL-Einstufung zusätzlich. Der{' '}
          <strong className="text-stone-800 dark:text-stone-200">Verarbeitungsgrad nach NOVA</strong>{' '}
          (1 = unverarbeitet bis 4 = ultra-verarbeitet) sowie die{' '}
          <strong className="text-stone-800 dark:text-stone-200">Omega-6/3-Einordnung</strong>{' '}
          wirken nur noch als Zusatzfaktoren: NOVA 4 und ein ungünstiges Omega-6/3-Verhältnis
          können die Einstufung jeweils um eine Stufe verschlechtern, sie aber nie verbessern oder
          eine bereits auffällige GI/GL-Einstufung neutralisieren. Ein unbekanntes
          Omega-6/3-Verhältnis fließt dabei gar nicht erst in die Bewertung ein. Grün bedeutet:
          keiner dieser Faktoren schlägt an. Fehlen GI/GL, NOVA und Omega-6/3 alle drei
          gleichzeitig, wird bewusst kein Gesamtsignal berechnet, sondern „unvollständige
          Datenlage" angezeigt.
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
