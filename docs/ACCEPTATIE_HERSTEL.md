# Functionele herstelcontrole

Deze release voegt bewerkbare calculaties, prijsloze werkbonnen en maandrapportage toe en herstelt formulier-, document- en opslagfouten.

## Gecontroleerde gebruikershandelingen

- Alle menuonderdelen openen.
- Klussen en stamgegevens toevoegen en bewerken met behoud van onbekende historische JSON-velden.
- Annuleren en navigeren zonder een formulier onbedoeld op te slaan.
- Medewerkerstarieven met aparte verkoopbasis en inhuurkosten overnemen.
- Calculaties aan een klus koppelen en eigen begrotingsregels maken, bewerken, archiveren en herstellen; uitgevoerde klusregels blijven gescheiden.
- Documenten opslaan met of zonder uren, unieke nummers, aangepaste sjabloontitels en onveranderlijke prijsgegevens.
- Werkbonnen afdrukken zonder prijzen; eerdere werkbonnen blijven toegankelijk.
- Documenten markeren en corrigeren met statushistorie.
- Historische kwitantietotalen behouden; afwijkende huidige specificaties uitsluitend in een afzonderlijk administratieonderdeel tonen.
- Records zonder bestaande klus zichtbaar maken en bewust kunnen koppelen.
- Jaartotalen controleren tegen de twaalf maandtotalen; onvolledige berekeningen blijven herkenbaar.

## Opslagcontroles

Een transactie met tijdelijke testrecords is volledig teruggedraaid. Gecontroleerd: eigen records toevoegen en wijzigen, verouderde versies weigeren, wijziging van eigenaar weigeren, records afschermen voor een andere gebruiker en dubbele documentnummers afwijzen. De gegevenscontrole vóór en na de transactie was identiek.

De automatisch toegevoegde RLS-functie is niet langer uitvoerbaar door openbare app-rollen; de eventtrigger zelf blijft bestaan.

## Grenzen

Browserafdrukken gebruikt de afdrukdialoog van de browser. De oorspronkelijke regelkopie van oude kwitanties ontbreekt in de brongegevens; deze wordt niet verzonnen. Losse records worden niet automatisch aan een willekeurige klus toegewezen. De vrije spreadsheetachtige sjablooneditor en e-mailverzending behoren niet tot deze release.

Uitvoeren: `npm test`, `node --check cloudflare-app/app.mjs`, `node scripts/build-static.mjs`.
