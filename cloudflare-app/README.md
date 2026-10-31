# Supabase-versie voor Cloudflare

Dit is de doorontwikkeling van de HTML-upload, los van de oudere Next.js/Prisma-app in de repositoryroot. Niet automatisch publiceren; eerst de acceptatiepunten in `docs/ONTWIKKELPLAN.md` afronden.

Vanaf de repositoryroot:

```sh
npm test
node --check cloudflare-app/app.mjs
node scripts/build-static.mjs
```

Host `cloudflare-app/dist` als statische bestanden via HTTPS. Open `/?demo=1` voor voorbeeldgegevens zonder Supabase-verbinding. De standaard-URL toont de bestaande Supabase-login. Er zijn geen npm-afhankelijkheden nodig voor de statische build. De Supabase-browserbibliotheek wordt via jsDelivr geladen; lettertypes via Google Fonts met lokale terugvalfonts.

`core.mjs` bevat de onafhankelijk geteste berekeningen. `app.mjs` bevat formulieren, auth en recordopslag. Bestaande JSON-velden blijven behouden bij bewerken. Alle databaseverzoeken zijn gericht op `klusbeheer_records` en het account van de ingelogde gebruiker. RLS moet ook op de server correct zijn ingericht; de browser kan dat niet afdwingen.

Opslaan van facturen voegt alleen een nieuw record toe. Er worden geen e-mails verstuurd. De knoppen voor verstuurd/betaald registreren de administratieve status; betalingen worden niet uitgevoerd. Afdrukken/PDF gebruikt de browserafdrukfunctie.
