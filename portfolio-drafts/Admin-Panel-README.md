# Admin Panel

A React-based administration dashboard for plant and article content. The interface provides protected dashboard routes and connects to an external API for data operations.

[Read the detailed technical documentation](./TECHNICAL_DOCUMENTATION.md).

## Features

- Login page and client-side protected dashboard routes
- Plant list, create, update, preview, and delete workflows
- Plant image upload through the API
- Article list, create, update, and preview screens
- Server-state queries managed with TanStack Query
- Form handling and validation with React Hook Form and Zod
- Responsive dashboard layout styled with Tailwind CSS

The application UI and service layer are in this repository. The backend API is external and is not included.

## Technology

- React 19
- JavaScript (ES modules)
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form and Zod
- Tailwind CSS
- ESLint

## Getting started

Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

Use the local URL printed by Vite. The dashboard's data and authentication flows require the external API expected by the application; this repository does not provide a backend or local mock server.

## Available scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Project structure

```text
src/
  components/    Shared dashboard, plant, article, and form UI
  hooks/         Data-fetching hooks
  pages/         Login, dashboard, plants, and articles
  routes/        Authentication gate
  services/      API clients and query keys
  utils/         Authentication helpers
```

## Current scope and limitations

- API-backed workflows depend on an external service; its server implementation is not in this repository.
- Article and plant operations should be tested against an authorized API environment before deployment.
- No screenshots, automated test suite, or GitHub Actions workflow were present during the repository audit.
- API credentials must not be committed. Configure the external service and authentication according to its own deployment instructions.
