# D Kuiper Techniek - Projecten App

Een nette Next.js app voor:
- klanten beheren
- projecten beheren
- materiaalfacturen maken
- prijs per stuk, btw-bedrag en totalen tonen
- vaste en duidelijke navigatie

## Stack
- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma
- Neon Postgres

## 1. Installeren
```bash
npm install
```

## 2. Environment instellen
Kopieer `.env.example` naar `.env` en vul jouw Neon database in:
```bash
cp .env.example .env
```

Voorbeeld:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
```

## 3. Prisma database push
```bash
npx prisma generate
npx prisma db push
```

## 4. Starten
```bash
npm run dev
```

Daarna openen in je browser op:
```bash
http://localhost:3000
```

## Pagina's
- `/` dashboard
- `/customers` klanten
- `/projects` projecten
- `/invoices` facturen
- `/invoices/new` nieuwe factuur

## Wat al goed staat
- professionele zijbalk navigatie
- projectnamen kunnen direct hernoemd worden
- materiaalfacturen met meerdere regels
- automatische berekening van:
  - subtotaal excl. btw
  - btw-bedrag
  - totaal incl. btw
- klaar om in GitHub te zetten

## Aanbevolen volgende stap
Wil je later nog uitbreiden, dan kun je toevoegen:
- inloggen met Clerk of NextAuth
- PDF export
- offerte module
- status per project
- zoeken en filteren
