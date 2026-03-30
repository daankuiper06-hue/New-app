# D Kuiper Techniek App

Stabiele basis voor:
- klanten
- projecten
- urenregistratie
- calculatie
- materiaalfacturen
- PDF export van facturen

## Wat zit erin

### Klanten
Naam, e-mail en telefoon opslaan.

### Projecten
Elk project is gekoppeld aan een klant.

### Urenregistratie
Per project datum, uren en omschrijving opslaan.

### Calculatie
Per project materiaalregels opslaan met:
- materiaal
- aantal
- inkoop p.s.
- verkoop p.s. incl. btw
- btw %
- winst per regel

### Facturen
Facturen worden aangemaakt vanuit de calculatieregels van een project.
Op de factuur staat alleen:
- materiaal
- aantal
- prijs p.s. incl. btw
- subtotaal incl. btw
- btw bedrag

### PDF export
Elke factuur heeft een knop om PDF te downloaden.

## Stap voor stap online zetten

### 1. Zip uitpakken
Pak deze map uit op je computer.

### 2. Naar GitHub uploaden
Maak een nieuwe repository en upload alle bestanden uit deze map.

### 3. Neon database koppelen
Maak in Neon een database aan.
Kopieer de connection string.

### 4. Vercel project maken
Importeer je GitHub repository in Vercel.

### 5. Environment variable zetten in Vercel
Voeg toe:

`DATABASE_URL`

met als waarde jouw Neon PostgreSQL URL.

### 6. Deploy
De build doet automatisch:
- prisma generate
- prisma db push
- next build

Dus bij de eerste deploy worden de tabellen meteen aangemaakt.

## Lokaal starten

Maak eerst een `.env` bestand op basis van `.env.example`.

Daarna:

```bash
npm install
npm run dev
```

## Belangrijk

Deze versie is bewust simpel en stabiel opgezet.
Geen typedRoutes, geen ingewikkelde experimentele Next.js instellingen.

## Handige vervolgstappen

Later kun je nog toevoegen:
- factuurnummering
- logo op factuur
- klantadres
- arbeid op offerte maar niet op factuur
- verwijderen en bewerken van regels
- aparte calculatie export
