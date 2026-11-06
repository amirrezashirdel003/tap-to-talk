# Greenhouse Admin Panel — Next.js Technical Documentation

> **Scope and source:** This document describes `amirrezashirdel003/Admin-Panel-with-TS-And-Next-js` on `main`, inspected on 2026-11-06. The API backend is external. This document intentionally omits API hostnames, credentials, tokens, and private response data.

## 1. Project overview

This project is a Persian-language greenhouse administration interface built with Next.js, TypeScript, and React. The inspected code includes a dashboard overview, plant listing and form workflows, and a content-management area. Plant operations are designed to use an external API; the content listing currently renders local sample data.

It is a frontend application with a small login route handler that forwards authentication to an external service. It is not a standalone backend or database.

## 2. Technology stack

| Area | Technology evidenced in the repository |
|---|---|
| Application framework | Next.js 16 App Router |
| UI | React 19 and TypeScript |
| Styling | Tailwind CSS 4 |
| Server-state and mutations | TanStack Query |
| HTTP | Axios |
| Forms and validation | React Hook Form and Zod |
| Animation | Framer Motion |
| Linting | ESLint |

See `package.json`, `next.config.ts`, and `src/app/` for the framework setup and routes.

## 3. Architecture

The application uses Next.js App Router route segments. Server-rendered layout/page files coexist with client components marked with `"use client"` for forms, TanStack Query, and interactive dashboard screens.

```text
src/app/
  login/                    login page
  api/login/                login forwarding route handler
  dashboard/
    page.tsx                dashboard overview
    plants/                 plant list and plant routes
    contents/               content list and editor routes

client pages/components → hooks → services → Axios → external API
```

Plant data hooks use TanStack Query. The service layer centralizes resource operations, and successful plant mutations invalidate list/detail queries. Zod schemas define client-side field validation.

## 4. Important directories and files

| Path | Responsibility |
|---|---|
| `src/app/layout.tsx` | Root document layout and global application shell |
| `src/app/providers.tsx` | Client-side provider setup |
| `src/app/login/page.tsx` | Login form page |
| `src/app/api/login/route.ts` | Server route handler that forwards login to the external API |
| `src/app/dashboard/` | Dashboard shell, overview, plant routes, and content routes |
| `src/components/` | Dashboard widgets, forms, navigation, and reusable UI |
| `src/hooks/useAuth.ts` | Login mutation and navigation on success |
| `src/hooks/usePlants.ts` | Plant queries and mutations |
| `src/services/` | API operations, Axios client, and query keys |
| `src/schemas/plantSchema.ts` | Plant form schema and type inferred from Zod |
| `src/lib/auth.ts` | Client-side token cookie reading/removal and display-name parsing |
| `src/proxy.ts` | Dashboard navigation gate based on presence of a token cookie |
| `src/data/` | Local dashboard/content presentation data |

## 5. Main application flow

1. Next.js serves the App Router application.
2. The user opens `/login`; the form submits through the login hook.
3. The login hook calls the service, which posts credentials to the local `/api/login` route handler.
4. The route handler forwards the request to the configured external API. On success it returns the admin payload and sets a token cookie.
5. The login hook navigates to `/dashboard`.
6. `src/proxy.ts` checks for the cookie's presence on dashboard paths and redirects unauthenticated navigation to `/login`.
7. Plant pages use TanStack Query hooks and Axios service operations to fetch or mutate plant data; successful mutations invalidate affected cached queries.
8. The content listing currently renders local sample data rather than loading the full content list from an API.

The proxy's cookie-presence check is a navigation gate, not proof that the token is valid. The API must perform real authentication and authorization on every protected operation.

## 6. API integration and configuration

### API boundary

The frontend calls an external service for authentication and plant data. The backend source code, persistence layer, deployment, and complete API contract are not included here. The exact API host is intentionally omitted.

Plant service operations include list/detail retrieval, create, update, delete, and image upload. Plant hooks wrap those operations in TanStack Query queries/mutations and invalidate affected list/detail keys when changes succeed. The local login route handler forwards submitted credentials to the external login service and returns the admin data with a token cookie.

The content list and some displayed content values use local data. Do not describe the content module as fully API-backed based only on the current code.

### Environment setup

The Axios client reads `NEXT_PUBLIC_API_URL`. For local development, create an untracked `.env.local` file:

```dotenv
NEXT_PUBLIC_API_URL=<API base URL supplied by the API owner>
```

Do not add real credentials, access tokens, or private records to this file in Git. The `NEXT_PUBLIC_` prefix makes a value eligible for inclusion in browser-side bundles; it must not be used for secrets.

### Security and session caveats

- The login route handler currently sets the token cookie with `httpOnly: false`; client code reads it. This means JavaScript on the same origin can access the cookie. A secure `HttpOnly` session design should be considered with the API owner.
- The proxy checks only whether a cookie exists. It does not validate token signature, expiry, user role, or authorization. These checks belong on a trusted server/API.
- Error and authorization behavior depend on the external API. The frontend's `401` interceptor removes the client token and redirects to login.
- No API hostname or credential is reproduced in this document.

## 7. Plant validation and data handling

`src/schemas/plantSchema.ts` defines required plant name, scientific name, summary, description, care level, light, watering, temperature limits, featured/hero flags, and at least one category. Temperature input is validated as numeric text and the minimum must be lower than the maximum.

The schema is used for client-side form validation. The external API must independently validate and authorize submitted data.

Plant list rows map API fields such as plant name, image URL, category, care level, light, and watering to table presentation. Missing category names fall back to a Persian “uncategorized” label.

## 8. Run locally

```bash
npm install
```

Create `.env.local` with the API URL as described above, then:

```bash
npm run dev
```

The development script starts Next.js on port `5173`.

Other scripts:

```bash
npm run build
npm run start
npm run lint
```

Full login and plant workflows require a compatible API environment and authorized test account. The repository does not include a local backend.

## 9. Feature completion

| Capability | Status in inspected branch |
|---|---|
| Login page and API-forwarding route | Implemented; depends on external authentication API |
| Dashboard overview | Implemented; some values are derived from local presentation data |
| Plant listing | Implemented against API service |
| Plant create/edit UI and validation | Routes/forms and Zod schema are present; API is required for persistence |
| Plant CRUD and image upload service calls | Implemented in frontend service layer |
| Content list/editor UI | Present; list currently uses local sample data |
| API server/database | Not included |
| Automated tests and GitHub Actions | No test suite or workflow was found during the audit |
| Screenshots | No screenshots were found in the repository during the audit |

## 10. Limitations and next steps

- Supply a non-production API environment and document its contract separately.
- Move any environment-specific non-secret settings to documented configuration; keep credentials out of Git.
- Revisit client-readable token handling and ensure server-side authorization is enforced.
- Implement API-backed content listing if that is an intended feature; current local data should be labelled as sample/demo content.
- Add tests for form validation, query mutations, login errors, and access-control behavior.
- Capture screenshots with synthetic/non-sensitive data before publication.
