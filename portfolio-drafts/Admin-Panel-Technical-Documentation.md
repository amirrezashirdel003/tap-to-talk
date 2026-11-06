# Admin Panel — Technical Documentation

> **Scope and source:** This document describes the `main` branch of `amirrezashirdel003/Admin-Panel` as inspected on 2026-11-06. It describes the frontend only. The API server and its data store are external and are not included in this repository. No API host, credential, token, or private response data is reproduced here.

## 1. Project overview

Admin Panel is a Persian-language web dashboard for managing greenhouse plant records and editorial articles. An administrator signs in, enters a protected dashboard, and uses list, create, preview, edit, and delete screens. Plant records can also be associated with image uploads.

The project is a frontend client, not a complete standalone content-management platform: persistence, authentication decisions, and business data are supplied by an external API.

## 2. Problem and intended use

The interface centralizes routine plant-catalog and article-management tasks behind a dashboard. Its user-facing screens and forms are implemented in React; API services issue requests for data and mutations. The repository does not contain the backend, so the dashboard cannot provide its complete intended workflows without a compatible API and authorized credentials.

## 3. Technology stack

| Area | Technology evidenced in the repository |
|---|---|
| UI | React 19, JavaScript ES modules, JSX |
| Development/build | Vite |
| Routing | React Router |
| Server-state management | TanStack Query and React Query Devtools |
| HTTP | Axios |
| Forms and validation | React Hook Form and Zod |
| Styling | Tailwind CSS 4 and project CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| Linting | ESLint |

Dependency declarations and scripts are in `package.json`; application wiring is in `src/App.jsx`.

## 4. Architecture

The browser application uses a client-side route tree. `QueryClientProvider` wraps the router, and a shared `AuthGate` wraps dashboard routes. Pages call custom query hooks; hooks call service functions; services use the shared Axios instance. Successful mutations invalidate relevant TanStack Query keys so the UI can refetch current records.

```text
src/main.jsx
  └── src/App.jsx
      ├── QueryClientProvider
      ├── /login
      └── AuthGate
          └── /dashboard
              ├── overview
              ├── plants: list / create / edit / preview
              └── articles: list / create / edit / preview

page components → hooks → service functions → Axios instance → external API
```

The UI is Persian and uses Persian labels; this document uses English for international project presentation.

## 5. Main source layout

| Path | Responsibility |
|---|---|
| `src/main.jsx`, `src/App.jsx` | Application root, query provider, route definitions |
| `src/pages/auth/` | Login screen |
| `src/pages/dashboard/` | Dashboard shell and overview |
| `src/pages/plants/` | Plant list, preview, and create/edit form screens |
| `src/pages/articles/` | Article list, preview, and create/edit form screens |
| `src/routes/authGate.jsx` | Client-side route guard |
| `src/hooks/` | TanStack Query hooks for plant, article, and authentication operations |
| `src/services/` | Axios configuration, API service functions, and query keys |
| `src/components/` | Shared layout, form controls, status panels, tables, and item components |
| `src/schemas/` | Zod validation schemas |
| `src/utils/` | Client-side authentication helpers |
| `src/data/` | Dashboard labels and presentation data |
| `vite.config.js` | Vite and Tailwind plugin configuration |

## 6. Application flow

1. Vite serves the React entry point and `src/main.jsx` mounts the app.
2. `src/App.jsx` creates a TanStack Query client and defines `/login` and nested `/dashboard` routes.
3. The login page submits credentials through the authentication service.
4. On successful login, the current client stores the received token in `localStorage`; `AuthGate` checks whether a token is present before rendering dashboard routes.
5. The shared Axios instance attaches the token to API requests. A `401` response clears the locally stored token and redirects the browser to `/login`.
6. Dashboard pages use query hooks to load lists/details and mutation hooks to create, update, delete, or upload data. Successful mutations invalidate related query keys.
7. The dashboard overview derives counts for plants and published/draft articles from the returned API data.

The client-side guard improves navigation UX; it does not replace authorization checks on the API server.

## 7. API integration — important boundary

### What is implemented

The frontend has dedicated service modules for authentication, plants, and articles. The service functions issue list/detail requests and create/update/delete mutations. Plant services also upload one or more files using `multipart/form-data`. TanStack Query hooks wrap these functions and refresh related cached queries after successful mutations.

The shared Axios client contains a configured API base URL in the current repository. The exact host is intentionally omitted from this documentation. The API implementation, database, deployment configuration, and complete request/response contract are not part of this project.

### Configuration and safe setup

- The current JavaScript client has its API base URL in the Axios configuration. Before distributing this repository or using a different environment, move the base URL to an environment-specific setting and document the expected variable without committing credentials.
- No API token, password, or production response example is required in this document. Do not put real credentials or private record data in the README, source code, screenshots, or issue reports.
- To run the application end-to-end, use an API environment and account authorized by the API owner. A frontend-only checkout cannot create a working backend.
- Do not infer the API's data model from UI labels alone. Confirm field formats, error responses, pagination, upload limits, and authorization requirements with the API owner.

### Authentication and security limitations visible in the client

- The current token helper stores the token in browser `localStorage`. JavaScript running in the same origin can access it, so this approach requires careful XSS prevention. A server-managed `HttpOnly`, `Secure`, `SameSite` cookie flow is preferable where the backend supports it.
- The route gate checks token presence in the browser. The API must independently validate the token and authorize every protected operation.
- The `401` interceptor handles expired/invalid client sessions by clearing local state and redirecting. Other error states remain dependent on page-level handling.
- This documentation does not include or expose the configured API host or any credentials.

## 8. Data fetching and mutation behavior

TanStack Query is configured at the app root with a one-minute default stale time. Plant and article query keys are grouped in `src/services/queryKeys.js`. Hooks in `src/hooks/` delegate to service functions. Mutation success invalidates the affected list and, where applicable, the affected detail query.

The dashboard derives overview counts from API responses. List pages display loading and error states in the inspected code. The exact backend persistence and consistency semantics cannot be confirmed from this frontend repository.

## 9. Forms and validation

Create/edit screens use React Hook Form and Zod integration where configured. The project includes schemas under `src/schemas/`; the UI sends validated form data to service functions. Plant and article payload requirements are ultimately subject to the external API's contract. Client-side validation is not a substitute for server-side validation.

## 10. Run locally

```bash
npm install
npm run dev
```

Vite prints the local development URL. Full login and data-management behavior require a compatible external API and a valid account. This repository does not provide API credentials or a mock backend.

Available scripts:

```bash
npm run build
npm run preview
npm run lint
```

## 11. Current implementation status

| Capability | Status in the inspected branch |
|---|---|
| Login UI and token-based client flow | Implemented; depends on the external API |
| Protected dashboard navigation | Implemented as a client-side token-presence check |
| Plant list and detail screens | Implemented; data comes from the API |
| Plant create/edit/delete service operations | Implemented in the frontend service layer |
| Plant image upload request | Implemented with multipart form data |
| Article list/detail/create/edit/delete operations | Frontend routes and service functions are present |
| Overview counts | Derived from returned plant/article data |
| Backend, database, and API deployment | Not included |
| Automated tests and GitHub Actions | No test suite or workflow was found during the audit |
| Screenshots | No screenshots were found in the repository during the audit |

## 12. Known limitations and recommended follow-up

- Provide a documented, environment-specific API URL and a safe local-development setup.
- Confirm API schemas, validation rules, upload constraints, and authorization behavior with the backend owner.
- Prefer a secure session design that does not expose long-lived tokens to JavaScript, if supported by the API.
- Add component/service tests and CI checks before describing the project as production-ready.
- Capture genuine screenshots only after running the application against a non-sensitive test environment.
- Avoid publishing real API host details or private business data without the API owner's approval.
