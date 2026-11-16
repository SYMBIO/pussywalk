# PussyWalk II

Satirická hra „simulátor vrávorání“ (2017/2018). Verze 3 je port původní
webpack/jQuery aplikace na Next.js + Neon Postgres, hostovaná na Vercelu
(tým SYMBIO, projekt `pussywalk`).

## Struktura

| Cesta | Obsah |
|---|---|
| `app/` | Next.js App Router: stránka hry, `api/scores` (tabulka vítězů), `share` (OG stránka pro sdílení na FB) |
| `game/` | Původní herní engine (jQuery, Box2D, canvas) – převzatý téměř beze změn |
| `lib/` | Přístup k databázi |
| `db/schema.sql` | Schéma tabulky `scores` |
| `scripts/` | Migrace a jednorázový import dat z Firebase |
| `public/` | Assety z produkčního buildu (obrázky, zvuky, fonty, Box2D, `app/` pro nativní aplikaci) |
| `assets-src/` | Zdroje grafiky (TexturePacker, RUBE level, LESS styly) |

## Vývoj

```bash
pnpm install
vercel env pull .env.local   # DATABASE_URL z Neon integrace
pnpm dev
```

## Databáze

```bash
node --env-file=.env.local scripts/migrate.mjs
node --env-file=.env.local scripts/import-firebase.mjs <scoreboard.json>
```

Původní tabulka vítězů běžela ve Firebase Realtime DB (`pussywalk-2`).
Import je idempotentní (klíčem je Firebase push key ve sloupci `legacy_key`).
Tabulka zobrazuje jen časy ≥ 40 s, seřazené od nejrychlejšího – stejně jako originál.
