# PROJECT_LAYOUT.md

This file documents the project folder contract for `luckyWheel`.

## Current Layout

```text
.
├── src/                         # Browser application modules
├── docs/
│   ├── delivery/                # Iteration and delivery planning
│   ├── tech/                    # Deployment and technical runbooks
│   └── agent-development-guidelines.md
├── outputs/
│   └── packages/                # Generated deployment packages
├── SPEC.md                      # Product truth
├── DATA_DESIGN.md               # Data truth
├── TECH_DESIGN.md               # Technical truth
├── TEST_PLAN.md                 # Verification truth
├── AGENTS.md                    # Concise agent execution entry
├── README.md                    # Human project entry
├── index.html                   # Static app shell
├── package.json                 # npm scripts and build dependency
└── vite.config.js               # Vite build configuration
```

## Standard Mapping

| Standard role | `luckyWheel` path | Notes |
| --- | --- | --- |
| Source code | `src/`, `index.html` | Static browser app. |
| Runtime config | `vite.config.js`, `package.json` | Build and script behavior. |
| Product spec | `SPEC.md` | Promoted from the original `prd.md`. |
| Data design | `DATA_DESIGN.md` | Config object, URL state, and localStorage rules. |
| Technical design | `TECH_DESIGN.md` | Architecture, modules, build, and deployment constraints. |
| Test plan | `TEST_PLAN.md` | Build gate and manual acceptance checklist. |
| Agent rules | `AGENTS.md` | Short runtime instructions; details live under `docs/`. |
| Deployment docs | `docs/tech/deployment.md` | Moved from the original `DEPLOY.md`. |
| Generated artifacts | `outputs/` | Regenerable packages and exports. |

## Change Rule

When code, docs, generated artifacts, or project commands introduce a new top-level directory, update this file and the README directory tree in the same change.
