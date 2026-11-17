# MobiBox Lite — Services

Services administration interface built for the MobileArts internship task.

## Stack

- Next.js App Router and TypeScript
- Redux Toolkit and React-Redux
- Tailwind CSS and shadcn/ui
- React Hook Form and Zod 3
- json-server 0.17.4

## Requirements

- Node.js compatible with the installed Next.js version
- npm
- Git

## Installation

Clone the feature branch:

```powershell
git clone --branch feature/services-flow https://github.com/ahmadshifo/Mobile-Arts-Internship-.git
cd Mobile-Arts-Internship-
npm.cmd ci
```

Create the local environment file:

```powershell
Copy-Item .env.example .env.local
```

Its API configuration should be:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Restart Next.js after changing this configuration.

## Run locally

Start the mock API in one terminal:

```powershell
npm.cmd run api
```

Start Next.js in a second terminal:

```powershell
npm.cmd run dev
```

Open http://localhost:3000/services.

The API runs on port 3001. If Next.js selects another port, use the URL
printed in its terminal.

On macOS or Linux, use npm/npx instead of npm.cmd/npx.cmd and use
`cp .env.example .env.local` to copy the environment file.

## Routes

| Route | Purpose |
|---|---|
| `/` | Redirects to the services list |
| `/services` | List, search, filter, toggle status, and delete |
| `/services/new` | Create a service |
| `/services/[id]/edit` | Edit a service or delete with typed confirmation |

## Features

- Search by service name or provider
- Operator filtering through Redux selectors
- Persistent status changes and deletion
- Shared Create/Edit form and Zod schema
- Live preview and completion checklist
- Validation after submission, followed by live revalidation
- Edit dirty-state detection and Discard
- Loading, error, retry, empty, and not-found states
- Create and delete success screens
- Toast notifications dispatched through uiSlice

## Mock API

Data is stored in `db.json`. Mutations update that file and survive
browser refreshes.

Supported endpoints:

- `GET /services`
- `GET /services/:id`
- `POST /services`
- `PUT /services/:id`
- `PATCH /services/:id`
- `DELETE /services/:id`

The mock API does not enforce the frontend Zod validation rules.
The future backend must validate requests independently.

Back up `db.json` before destructive testing if you want to preserve
the seed data.

## Code organization

- `src/app`: routes and layouts
- `src/components/ui`: shadcn UI components
- `src/components/layout`: sidebar and page header
- `src/components/services`: shared form, preview, and status switch
- `src/lib/api`: HTTP request functions
- `src/lib/validation`: shared service schema
- `src/lib/forms`: default values and checklist helper
- `src/lib/constants`: service options
- `src/store`: Redux store, slices, typed hooks, and selectors
- `src/types`: shared TypeScript types
- `scripts`: validation checks

## Checks

```powershell
npx.cmd tsx scripts/check-service-validation.ts
npx.cmd tsc --noEmit
npx.cmd eslint .
npm.cmd run build
```

The validation script checks schema behavior. Full UI flows are checked
manually.

## Production-mode preview

```powershell
npm.cmd run build
npm.cmd run start
```

Run the mock API separately.

## Future .NET API integration

HTTP calls are isolated in `src/lib/api/services.ts`. Update the API
configuration and adapt request/response mappings to the .NET contract.

The current mock flow supplies the initial subscriber count and creation
timestamp from the frontend.

## Scope

This task covers the Services section. Subscriber and checkout screens
are outside the implemented scope.