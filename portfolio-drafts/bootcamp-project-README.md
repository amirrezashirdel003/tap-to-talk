# Jewelry Storefront UI

A responsive Persian-language storefront concept for jewelry, coins, and investment products. The project focuses on the customer-facing interface: category selection, product presentation, and informational sections.

[Read the detailed technical documentation](./TECHNICAL_DOCUMENTATION.md).

## Features

- Responsive landing page with a hero section
- Category carousel for women's, men's, jewelry, coins, investment products, and all categories
- Product carousel built with Swiper
- Product catalog data organized by category
- Currency information section
- Educational blog section
- Responsive layouts styled with Tailwind CSS

Product and currency values are static data in the current implementation; they are not live market prices.

## Technology

- React 19
- JavaScript (ES modules)
- Vite
- Tailwind CSS 4
- Swiper
- Lucide React
- ESLint

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

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
  components/   Shared UI and layout components
  container/    Shared page container
  pages/
    About/      About page
    Home/       Landing page, categories, and product showcase
  router/       Application routes
```

## Current scope and limitations

- This repository is a frontend presentation project. A backend, account system, checkout, payment processing, and live product or currency API were not present in the reviewed code.
- The currency list and product prices are hard-coded examples and must not be presented as current financial data.
- The About page component is minimal and the Footer is commented out on the home page.
- Some product image references point into `/src/assets`, and one item uses `/` as its image path. Verify image loading in a production build before deployment.
- No screenshots, automated test suite, or GitHub Actions workflow were present during the repository audit.
