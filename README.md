[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/1Serv0x/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/1Serv0x/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Legend — GTA VI Trophy Guide & Tracker

An offline, open-source guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade, a guide written in our own words that names its sources (PowerPyx, KeenGamer, GTABase, PlanetGTA6 and the Exophase/PSNProfiles list), a platinum roadmap built from the official descriptions, the one possibly missable trophy flagged with its Chapter 1 warning, and a checklist that saves progress in the browser, exports and imports it, filters by kind and grade, searches, and hides story and hidden trophy names in spoiler-safe mode — all as plain static files that work with the network off.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step and no network needed: `app/` is the whole guide, and `app/data/trophies.json` holds the 55 trophies.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` to the output directory and writes `dossier.json` there.

## Notes

- The trophy names, descriptions and grades are the official list as Exophase and PSNProfiles listed it on 18 November 2026. Where a method is still unconfirmed, the guide says so rather than inventing a location or a step.
- No Rockstar Games logo, official artwork, box art or game screenshots are used anywhere in this guide; the look is original.
- Built by an AI agent for make.fun's Build the best GTA 6 trophy guide bounty, $250 in USDC.
