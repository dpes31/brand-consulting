# Brand Consulting Generator

AI-assisted strategic consulting report generator with evidence-driven competitor selection, dynamic 23–40 page planning, verified Creative History, and 16:9 PDF export.

## Start here

- [Project handoff and current phase](docs/PROJECT_HANDOFF.md)
- [AI agent operating rules](AGENTS.md)
- [Phase 1: Layout Safety Guard](docs/phase1-layout-safety.md)
- [Phase 2: Competitor Selection](docs/phase2-competitor-selection.md)
- [Phase 3: Dynamic Page Planner](docs/phase3-dynamic-page-planner.md)
- [Phase 4: Creative History Contract](docs/phase4-creative-history-contract.md)
- [Phase 5: Visualization Engine](docs/phase5-visualization-engine.md)

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Deployment process

1. Work on a phase branch derived from the latest validated phase.
2. Validate the Vercel Preview.
3. Keep `main` unchanged until the owner explicitly approves production merge.
4. Preserve `backup-production-stable-20260622` as the rollback reference.

## Current status

Phase 4 has been validated. Phase 5, the Visualization Engine, is in progress. See `docs/PROJECT_HANDOFF.md` for the authoritative status and deferred defects.
