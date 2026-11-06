# Greenhouse Admin Panel — Next.js and TypeScript

A Next.js App Router dashboard for greenhouse plant administration. It combines a typed React interface, validated plant forms, and API-backed plant operations.

## Features

- Login interface and dashboard route gating
- Plant list, creation, editing, preview, deletion, and image upload service operations
- Plant form validation with Zod, including required fields and temperature-range validation
- React Hook Form for form state
- Axios-based API requests and TanStack Query for client-side data fetching
- Persian-language dashboard interface
- Framer Motion for interface transitions

The content list currently reads sample content from local data rather than a complete API-backed content-management workflow. The backend API is external and is not included in this repository.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- Axios
- React Hook Form and Zod
- Framer Motion
- ESLint

## Requirements and configuration

Install the project's dependencies:

```bash
npm install
```

The application expects an API base URL in `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=<your API base URL>
```

The API service is not part of this repository. Use a valid development or deployment API URL supplied by that service; no endpoint value or credentials are included here.

## Run locally

```bash
npm run dev
```

The development script starts Next.js on port `5173`.

## Other scripts

```bash
npm run build
npm run start
npm run lint
```

## Project structure

```text
src/
  app/          App Router pages, dashboard layouts, and login route handler
  components/   Dashboard, plant, status, and form components
  data/         Dashboard and sample content data
  hooks/        Authentication and plant data hooks
  lib/          Authentication helpers and plant data mapping
  schemas/      Zod validation schemas
  services/     API service functions and Axios configuration
```

## Current scope and limitations

- The backend is external. Plant data and login operations require its API and a valid environment configuration.
- The content listing uses local sample data; do not describe it as a complete API-backed content-management system.
- The dashboard proxy checks for a token cookie to gate dashboard navigation; backend authorization remains the responsibility of the API.
- No screenshots, automated test suite, or GitHub Actions workflow were present during the repository audit.
- Do not commit `.env.local`, credentials, or real user data.
