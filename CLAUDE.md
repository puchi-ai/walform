# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Walrus Form is a decentralized form builder built on the **Walrus network** (branded as **Nami Cloud** on frontend) and secured by the **Sui blockchain** for indexing and access control. It enables admin wallet owners to create premium forms, customize themes, and collect responses walletlessly and gaslessly from public visitors.

## Tech Stack

- **Framework**: React 19 + Vite 6 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (custom glassmorphic theme)
- **State Management**: Zustand (useFormStore, useAuthStore, useThemeStore)
- **Routing**: React Router v7
- **Backend Proxy**: Express Server (interacts with S3 proxy/Nami Cloud storage, falls back to local disk storage in `server/storage/`)
- **Blockchain**: Sui Blockchain (Move contract under `contracts/blob_index/` for admin whitelist and form index)

## Commands

```bash
# Start backend proxy server (runs on port 3001)
npm run backend

# Start frontend development server (runs on port 3000)
npm run dev

# Run TypeScript compiler static check
npm run lint

# Compile React frontend for production distribution
npm run build

# Preview static production build locally
npm run preview
```

## Architecture & Routing (`src/App.tsx`)

| Route | Component | Access Control |
|---|---|---|
| `/` | `Landing` | Public |
| `/auth` | `Auth` | Public (zkLogin / Wallet Connection) |
| `/f/:id` | `PublicForm` | Public (Form view & submission) |
| `/p/:id` | `PublicForm` (preview) | Public (Live preview mode in Builder) |
| `/dashboard` | `Dashboard` | Protected (Owner/Admin wallets only) |
| `/builder/:id` | `Builder` | Protected |
| `/analytics/:id` | `Results` | Protected (View submissions) |

## State Management (`src/store/`)

- **`useFormStore.ts`**: Core store for form definitions and submissions. Fetches indexed forms from Sui blockchain, loads full schemas from S3/Nami Cloud proxy in parallel, and interacts with Express API to fetch form responses. Forms array is empty (`[]`) by default, and mock submission generators are removed.
- **`useAuthStore.ts`**: Admin state management. Restricts dashboard entry to wallets registered as admins/owners in the Move contract.
- **`useThemeStore.ts`**: Global interface theme (Dark, Light, Glass).

## Services (`src/services/walrus.ts`)

- `S3Service` (exported as `walrus`) is the integration service. It handles all backend API calls:
  - `publishBlob(id, data)` / `updateBlob(id, data)` — Uploads/updates form schemas on Nami Cloud.
  - `getBlob(id)` — Retrives form definitions.
  - `submitResponse(formId, answers)` — Submits a response walletlessly.
  - `getResponses(formId)` — Retrieves responses for Results page.
  - `deleteBlob(id)` — Removes form definitions.

## Key Files for Common Tasks

- Add a new field type: `src/store/useFormStore.ts` (update `FieldType` union), `src/pages/PublicForm.tsx` (rendering), `src/pages/Builder.tsx` (properties UI)
- Add a new template: `src/config/templates.ts`
- Modify backend proxy routes or storage parameters: `server/index.ts`
- Edit CSS tokens or global variables: `src/index.css` (variables in `:root` and `.dark` blocks)
