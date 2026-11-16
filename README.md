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
| `public/v1/` | **PussyWalk I** (Flash, 2014) pro `1.pussywalk.com` – SWF, statické stránky, Ruffle emulátor |

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

### Ochrana proti podvrženým výsledkům

- Při startu hry klient získá z `POST /api/runs` podepsaný token s časem startu (`lib/runs.ts`, HMAC přes `SCORE_SECRET`).
  Server přijme jen čas, který mohl reálně uplynout od startu, a každý token jde použít jen jednou (`scores.run_id`).
- Stejné jméno se stejným časem na milisekundu se odmítne jako duplicita.
- Rate limit: max. 3 skóre za 5 minut na IP (ukládá se jen HMAC hash IP ve sloupci `ip_hash`).
- Oba POST endpointy chrání Vercel BotID (`instrumentation-client.ts`).

## PussyWalk I (1.pussywalk.com)

Původní Flash hra (Symfony web z roku 2014) běží ve stejném deploymentu. Požadavky na doménu
`1.pussywalk.com` přepisuje `next.config.ts` do `public/v1/` (lokálně http://1.localhost:3000).

- SWF běží v emulátoru [Ruffle](https://ruffle.rs) (`@ruffle-rs/ruffle`), který se při `dev`/`build`
  kopíruje do `public/v1/ruffle/` (`scripts/copy-ruffle.mjs`, v gitu není).
- Flash čte seznam vítězů z `/scores.json` a ukládá přes `POST /saveScore.php` – obojí obsluhuje
  `app/api/v1/*` nad tabulkou `scores_v1` (jen jména, nejnovější nahoře; 4 803 jmen ze zálohy,
  import `scripts/import-v1-scores.mjs`).
- Na mobilu se zobrazí stránka „No keyboard, no fun“ (hra se ovládá šipkami).
