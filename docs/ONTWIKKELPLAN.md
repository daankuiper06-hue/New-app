# Ontwikkelstatus en vervolgplan

De actieve app staat in `cloudflare-app/` en gebruikt de bestaande Supabase-administratie. De oudere Next.js/Prisma-app in de repositoryroot is een afzonderlijke toepassing en vormt niet de huidige Cloudflare-site. De oorspronkelijke broncode is bewaard op een aparte backupbranch.

## Afgerond

- Klussen, klanten, materiaalbibliotheek, medewerkers en urenregistratie met bewerken, archiveren en herstellen.
- Prijsbasis per regel en klus, centrale materiaalopslag, eigen arbeid en afzonderlijke inhuurkosten.
- Zelfstandige begrotingsregels binnen calculaties, met eigen opslag en behoud van historische calculaties.
- Kostenoverzichten, kwitanties, facturen en prijsloze werkbonnen als vaste documentkopie.
- Documenten met of zonder uren, unieke nummercontrole, administratieve statussen en statushistorie.
- Meerdere sjablonen met titel, kleur, afzender, betaaltekst, voettekst, kolommen en arbeidspecificatie.
- Jaar- en maandrapportage met expliciete bedragen inclusief en exclusief btw.
- JSON-backup en zichtbaarheid van records zonder bestaande klus.
- Opslag met eigenaarcontrole, RLS en controle op gelijktijdige wijzigingen.
- Veilige formulierknoppen en behoud van onbekende historische velden.

## Verificatie

Automatische reken- en gebruikersworkflowtests draaien met `npm test`. Opslag, RLS, documentnummering en versieconflicten zijn afzonderlijk gecontroleerd met een volledig teruggedraaide database-transactie. De gegevensintegriteit bleef gelijk. Zie `docs/ACCEPTATIE_HERSTEL.md`.

## Gegevens die geen softwarefout zijn

Oude kwitanties bevatten niet altijd de oorspronkelijke regelkopie. Opgeslagen documenttotalen blijven daarom intact; huidige afwijkende klusregels worden geen fictieve historische afdrukspecificatie. Records waarvan de oorspronkelijke klus ontbreekt blijven bewaard en kunnen bewust worden gekoppeld. Een begroting verandert niet automatisch de werkelijk uitgevoerde klus.

## Optionele verdere uitbreiding

- Vrije kolomvolgorde en visuele sjablooneditor.
- Bijlagen en bestanden per klus.
- E-mailverzending met voorafgaande controle door de gebruiker.
- Automatische documentnummerreeksen op de server.
- Een aparte testdatabase voor toekomstige automatische browser-schrijftests.

## Publiceren en terugrollen

De eigenaar heeft live publicatie toegestaan. De huidige productiebranch is `development/supabase-klusbeheer-pro`. Controleer tests en statische build voordat Cloudflare publiceert. Productiecode en demo zijn gescheiden: de demo gebruikt alleen lokale voorbeeldgegevens.

Een vorige Cloudflare-versie kan worden teruggezet zonder bestaande records te verwijderen. Oude apps tonen mogelijk niet alle nieuwe recordsoorten.
