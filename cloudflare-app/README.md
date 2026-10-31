# D Kuiper Klusbeheer Pro voor Cloudflare

Statische webapp met de bestaande Supabase Auth en administratie. De oudere Next.js/Prisma-app in de repositoryroot is een afzonderlijke toepassing.

## Controleren en bouwen

```sh
npm test
node --check cloudflare-app/app.mjs
node scripts/build-static.mjs
```

De output staat in `cloudflare-app/dist`. Cloudflare gebruikt:

```sh
npx wrangler@4 deploy --config cloudflare-app/wrangler.jsonc
```

De bestaande productiebranch is `development/supabase-klusbeheer-pro`. Nieuwe publicaties volgen alleen binnen de door de eigenaar gegeven toestemming. Een eerdere Cloudflare-versie kan worden teruggezet zonder bestaande records te verwijderen.

De standaard-URL gebruikt Supabase; `?demo=1` gebruikt uitsluitend voorbeeldgegevens in lokale browseropslag. De demo bewijst geen databasebeveiliging. De opslagacceptatie staat in `docs/ACCEPTATIE_HERSTEL.md`.

`core.mjs` verzorgt berekeningen en vaste documentkopieën; `app.mjs` de formulieren en eigenaargebonden opslag. Calculatieregels zijn begrotingen en veranderen de uitgevoerde klus niet. Archiveren bewaart gegevens. Statusknoppen registreren administratie en versturen geen e-mails of betalingen.

Oude kwitantietotalen worden niet herberekend. Bij afwijkende huidige klusregels wordt geen fictieve historische afdrukspecificatie gemaakt. Een nieuw kostenoverzicht kan vanuit de klus worden opgeslagen.
