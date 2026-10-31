# Testresultaten — 31 oktober 2026

## Geslaagd

- `npm test`: 11/11 tests. Inclusief/exclusief btw, 0/9/21%, afronding, centrale opslag, eigen/inhuurkosten, historische prijsbasis, classificatie oude uren, archiefuitsluiting, documentkopieën, invoercontrole en HTML-escaping.
- `node --check cloudflare-app/app.mjs`: geslaagd.
- `node scripts/build-static.mjs`: statische uitvoer aangemaakt.
- `git diff --check`: geslaagd.
- Browsercontrole in afzonderlijke demo (`?demo=1`), met uitsluitend voorbeeldgegevens: dashboard, klus openen, nieuwe klus opslaan, zoekfilter, klant aanmaken, archiveren en herstellen, inhuurmedewerker aanmaken, uren toevoegen (2,5 uur), materiaal kopiëren uit bibliotheek, kostenoverzicht opslaan en openen, sjabloon aanpassen, factuur opslaan met verborgen prijs-per-stukkolom, documentstatus wijzigen naar verstuurd, records opnieuw laden.
- Tijdens de browsercontrole trad op HTTP een ontbrekende `crypto.randomUUID` op. Opgelost met een `crypto.getRandomValues`-fallback; uren en materiaal daarna succesvol opgeslagen.

Voorbeeldcontrole: vier spots à netto €51 en zes eigen uren à netto €25 geven €354 netto, €74,34 btw, €428,34 bruto, €170 materiaalkosten en €184 resultaat vóór belasting. Na de aanvullende testregels gaf het document €438,22 netto + €92,03 btw = €530,25 bruto.

## Nog niet bewezen

Geen geauthenticeerde productie- of testdatabasehandelingen uitgevoerd. Row Level Security, toegestane JSON-recordtypes, timestampgedrag, concurrentie en servervalidatie moeten met bevoegde Supabase-toegang worden getest. De nieuwe recordtypes kunnen afhankelijk zijn van bestaande constraints. Unieke documentnummers zijn nog niet atomair op de server afgedwongen. Lange afdrukken/PDF en specifieke mobiele schermgroottes zijn niet afzonderlijk getest. De oudere Next.js-app is niet gebouwd; voor de nieuwe statische app zijn de Next.js-afhankelijkheden niet nodig.

## GitHub en publicatie

De back-upbranch en ontwikkelbranch zijn op GitHub aangemaakt. De gebruiker heeft op 31 oktober 2026 expliciet toestemming gegeven om de broncode en oorspronkelijke HTML naar deze openbare repository te uploaden. De wijzigingen worden via de gekoppelde GitHub-app op de ontwikkelbranch opgeslagen en als concept-pull-request aangeboden. De nieuwe code is lokaal gecommit. Een push is door de automatische goedkeuringscontrole afgewezen omdat de repository openbaar is en ook de geüploade HTML openbaar zou worden. De remote ontwikkelbranch is daarna alleen gelezen en staat nog op de oorspronkelijke commit `a62142403611fa36a39f4372241298a5445099ea`. Geen alternatieve uploadroute gebruikt. Voor pushen is expliciete toestemming voor die openbare broncode-upload nodig. Er is nog geen pull request met de wijzigingen aangemaakt.

Cloudflare is niet gewijzigd. Supabase-schema en bestaande records zijn niet gewijzigd.
