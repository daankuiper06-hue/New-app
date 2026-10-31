# D Kuiper Klusbeheer Pro — ontwikkelplan

Datum: 31 oktober 2026. Branch: `development/supabase-klusbeheer-pro`.

## Uitgangspunt en onderzoek

De GitHub-repository op commit `a62142403611fa36a39f4372241298a5445099ea` bevat een Next.js 14/Prisma-app met aparte Customer, Project en Invoice-tabellen. De geüploade Cloudflare-versie gebruikt Supabase Auth en één tabel `klusbeheer_records` met JSON-gegevens en legacy-ID's. Dit zijn verschillende applicaties; de Prisma-app kan de bestaande Supabase-administratie niet rechtstreeks lezen.

De oorspronkelijke GitHub-code staat in `backup/voor-ontwikkeling-2026-10-31`. De ongewijzigde HTML-upload staat in `archive/index-original-2026-10-31.html` (SHA-256 `d9a3fb623eadb7e534ce7d66722628c51c1efcee474853f6de5fa98258f6374b`).

Gevonden problemen in de upload: ontbrekende bewerkfuncties voor stamgegevens, geen facturen, geen kosten voor ingehuurde arbeid, onduidelijke btw-basis van historische prijzen, geen herstel na verwijderen, beperkte foutafhandeling en geen bescherming tegen gelijktijdig overschrijven. Het bestaande Next.js-buildcommando voerde bovendien automatisch `prisma db push` uit. Dit is verwijderd; builds veranderen geen database meer.

De bestaande Prisma-API-routes bevatten geen zichtbare authenticatiecontrole en meerdere `@ts-nocheck`-aanwijzingen. De nieuwe statische app gebruikt deze routes niet. De Next.js-app is niet vrijgegeven of als veilig aangemerkt. De exacte Cloudflare-productieconfiguratie en Supabase-beveiligingsregels konden nog niet worden geïnspecteerd.

## Architectuur en behoud van gegevens

De nieuwe statische app staat apart in `cloudflare-app/`. De oorspronkelijke Next.js-app blijft beschikbaar. De nieuwe versie behoudt het bestaande Supabase-project, tabel, recordtypes, owner-ID's en legacy-koppelingen. Er zijn geen migraties of databasecommando's uitgevoerd en geen echte klantgegevens gelezen of gewijzigd.

Nieuwe records gebruiken aanvullend `factuur` en `instellingen`. Archiveren zet alleen JSON-velden; herstellen kan via Instellingen. Updates voegen velden samen, zodat onbekende historische velden behouden blijven. Selecteren en muteren gebeurt met `owner_id`; updates controleren tevens `updated_at` tegen de geladen versie. Dit is aanvullende bescherming en vervangt Supabase Row Level Security niet.

## Geïmplementeerd

| Onderdeel | Gedrag |
| --- | --- |
| Klussen | Aanmaken/bewerken, klantkoppeling, adres, status, centrale materiaalopslag, prijsbasis |
| Klanten | Aanmaken/bewerken, contact- en adresgegevens, archief/herstel |
| Materialen | Bibliotheek, kopiëren naar klus, vaste verkoopprijs of centrale opslag, 0/9/21% btw |
| Medewerkers | Eigen arbeid/inhuur, apart verkoop- en kostentarief |
| Uren | Datum, werkzaamheden, medewerker, uren, eigen tariefkopie, totaaloverzicht |
| Calculatie | Netto omzet, btw, bruto klantbedrag, netto kosten, resultaat vóór belasting |
| Documenten | Factuur, kostenoverzicht, kwitantie, handmatig documentnummer, vaste klant- en prijsnapshot |
| Status | Concept, verstuurd, betaald, geannuleerd; betaling corrigeren; statushistorie bij betaal-/verzendwijzigingen |
| Sjablonen | Meerdere sjablonen, titel, kleur, afzender, betaaltekst, voettekst, kolommen aan/uit, arbeid bundelen |
| Back-up | JSON-download van eigen records, afzonderlijke demo zonder Supabase-verkeer |

Eigen arbeid telt mee in het resultaat; inhuurkosten worden ervan afgetrokken. Dit resultaat is geen nettoloon. De prijsbasis van bestaande regels wordt niet geraden: projectbasis of regelbasis moet zijn vastgesteld. Ook het arbeidstype van historische uren moet expliciet worden gekozen voordat ze in een document worden opgenomen. Bij nieuwe regels wordt die informatie direct opgeslagen. Het klantdocument bevat geen inkoopprijzen of opslagpercentages.

## Openstaande acceptatie vóór productie

1. Supabase: met bevoegde toegang de exacte tabeldefinitie, toegestane recordtypes, `updated_at`, indices, RLS en policies controleren. Test met twee afzonderlijke testaccounts dat gebruikers elkaars records niet kunnen lezen of wijzigen.
2. Een aparte Supabase-testomgeving of gecontroleerde testadministratie gebruiken voor inloggen, grote datasets, insert/update/select, verlopen sessies, conflicten, netwerkuitval en herstel. Browserdemo bewijst geen geauthenticeerde databasewerking.
3. Documentnummering op databaseniveau atomair per eigenaar afdwingen. De huidige app controleert dubbele nummers op de geladen administratie. Twee gelijktijdige apparaten kunnen zonder unieke database-index nog hetzelfde nummer opslaan. Ontwerp een unieke partiële index op eigenaar en genormaliseerd nummer, inspecteer eerst bestaande dubbele waarden, en pas alleen na review toe. Er is bewust geen schemawijziging uitgevoerd.
4. Historische prijsafspraken vastleggen; materiaal- en arbeidsregels bij representatieve klussen vergelijken met de huidige administratie. Maak eerst een Supabase-back-up buiten deze app.
5. Afdruk/PDF, mobiele schermen, lange documenten en afzendergegevens met Daan beoordelen. Een sjabloon zonder afzender is bruikbaar voor kostenoverzichten; de app blokkeert een nieuwe factuur zonder afzendertekst. Dit is geen volledige inhoudelijke factuurcontrole.
6. Cloudflare-build en productiebranch inspecteren en een geïsoleerde preview configureren. Test login-redirects, CSP/CDN, cache en HTTPS. Gebruik geen productiedatabase voor automatische schrijftests.
7. Pas na uitdrukkelijke toestemming van Daan de gecontroleerde versie live zetten; bestaande website/artifact behouden voor terugrollen.

## Vervolgprioriteiten

P0: bovenstaande authenticatie-, RLS-, schema- en nummeringsacceptatie. P1: stabiele eigen documentnummerreeks, expliciete documentcorrecties, werkbonnen, extra rapportage en geautomatiseerde browsertests met testdatabase. P2: drag-and-drop kolomvolgorde, vrije sjabloonlayout, bijlagen en aanvullende import/export. Sjablonen hebben nu vaste kolomvolgorde met instelbare zichtbaarheid; het is nog geen vrije spreadsheet-editor.

## Publicatie en terugrollen

Er is geen Cloudflare-deploy of merge uitgevoerd. `main` blijft ongewijzigd. Voor een toekomstige statische Cloudflare-deploy: voer `npm test` uit en daarna `node scripts/build-static.mjs`; de outputmap is `cloudflare-app/dist`. De Supabase-projectinstellingen in `app.mjs` zijn de bestaande publieke URL en publishable key, geen service-role key. De testdemo wordt geopend met `?demo=1` en bewaart alleen voorbeeldgegevens lokaal.

Bij rollback de vorige Cloudflare-versie terugzetten. Er zijn geen datamigraties die teruggedraaid moeten worden; nieuw aangemaakte records blijven bewaard. Omdat facturen nieuwe recordtypes zijn, toont de oude app die mogelijk niet.
