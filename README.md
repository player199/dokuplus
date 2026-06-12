# doku+ — The Sudoku That Flies ✈️

A fast, beautiful, mobile-first sudoku built around one twist: **FLY mode**.

Do the thinking — prune candidates with notes — then hit **FLY** and watch a
little plane sweep the board, auto-landing every cell your logic has already
solved, faster and faster. You fly the strategy; doku+ handles the busywork.

**Play it:** https://dokuplus.vercel.app

## Features

- ✈️ **FLY mode** — auto-fills every forced cell with an accelerating cascade animation
- 🗓️ **Daily Flight** — one shared seeded puzzle per day, same board for everyone
- ♾️ **Infinite puzzles** — generated on device with a guaranteed unique solution
- 🎚️ **Four difficulties** — Easy, Medium, Hard, Expert
- 📝 **Notes & smart notes** — pencil marks, one-tap auto-candidates, peer cleanup on placement
- ⏱️ **Timer, pause, mistake limit, hints, unlimited undo**
- 📊 **Stats** — best times, win counts, and streaks per difficulty
- 💾 **Auto-save** — close the tab mid-game and resume exactly where you left off
- 🌗 **Dark & light themes**, system-font typography, haptic feedback
- 📱 **Mobile-first PWA** — installable, safe-area aware, big touch targets, keyboard support on desktop

## Tech

React 19 + TypeScript + Vite. No runtime dependencies beyond React.

- `src/core/sudoku.ts` — engine: bitmask solver, unique-solution generator, seeded daily RNG
- `src/core/storage.ts` — settings, stats, and saved-game persistence (localStorage)
- `src/game/useGame.ts` — game state reducer, FLY loop, clock, auto-save
- `src/components/` — Home, Game, Board, Controls, Settings

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint
```

## How FLY mode works

Every empty cell has a set of effective candidates: your pencil marks if you
made any, otherwise the computed candidates. When a cell has exactly one valid
candidate, it's a *forced* cell. FLY repeatedly finds the next forced cell,
flies the plane there, and fills it — each landing can unlock new forced
cells, so a well-pruned board cascades all the way to the end.

## License

MIT — see [LICENSE](LICENSE).
