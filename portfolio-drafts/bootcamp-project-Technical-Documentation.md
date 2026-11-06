# Jewelry Storefront UI — Technical Documentation

> **Scope and source:** This document describes `amirrezashirdel003/bootcamp-project` on `main`, inspected on 2026-11-06. It documents the frontend behavior present in the repository and does not imply a deployed store, live pricing feed, or checkout backend.

## 1. Project overview

The project is a Persian-language, responsive storefront interface for jewelry and related products. Its home page combines a hero section, selectable product categories, a product carousel, a currency-information section, and an educational blog section.

The repository contains a frontend presentation and local example data. No product API, authentication flow, cart, checkout, or payment processing was found in the reviewed source.

## 2. Problem and intended use

The interface demonstrates how a retail landing page can organize a small catalog and supporting content in a visual, category-oriented experience. Product selection changes the items shown in the showcase. The currency and blog sections provide additional content areas within the same page.

This is a UI project rather than a complete e-commerce system. The displayed product and currency values are static examples and should not be used as live financial information.

## 3. Technology stack

| Area | Technology evidenced in the repository |
|---|---|
| UI | React 19, JavaScript ES modules, JSX |
| Development/build | Vite |
| Styling | Tailwind CSS 4 and project CSS |
| Product/category carousels | Swiper |
| Icons | Lucide React |
| Routing | React Router |
| Linting | ESLint |

The dependencies and scripts are declared in `package.json`.

## 4. Architecture and data flow

`src/main.jsx` mounts the React app. `src/App.jsx` renders the router, and the home route composes page sections. Category state lives in the home page and is passed to the category selector and product showcase. The showcase filters local product data and passes each product to a card inside a Swiper carousel.

```text
src/main.jsx
  └── src/App.jsx
      └── src/router/index.jsx
          └── src/pages/Home/Home.jsx
              ├── HeroSection
              ├── Categories ── active category state
              ├── ProductShowcase ── ProductsData ── ProductCard
              ├── CurrencySection ── fixed currency values
              └── BlogSection
```

There is no API or persistence layer in the inspected product/currency data flow.

## 5. Project structure

| Path | Responsibility |
|---|---|
| `src/main.jsx`, `src/App.jsx` | React application entry point |
| `src/router/index.jsx` | Route composition |
| `src/pages/Home/Home.jsx` | Home page and section composition |
| `src/pages/Home/components/` | Hero section |
| `src/pages/Home/Category/` | Category carousel and category items |
| `src/pages/Home/ProductShowcase/` | Product carousel, cards, and local product data |
| `src/components/UI/Currency/` | Currency information components |
| `src/components/UI/BlogCard/` | Blog card and blog section |
| `src/components/layout/` | Shared layout components such as the header |
| `src/pages/About/` | About page |
| `src/container/` | Shared page container |
| `src/App.css` and related CSS | Application styles |

## 6. End-to-end page behavior

1. Vite loads `index.html`; `src/main.jsx` mounts the React tree.
2. The router renders the home page.
3. The home page initializes the active product category to `female`.
4. The category component displays six options: female, male, jewelry, coin, investment, and all categories. Selecting an option updates the home page state.
5. The product showcase reads `ProductsData.jsx`. For a selected category it displays that category's array; for `all` it combines all category arrays.
6. Swiper lays out product slides responsively: the configured breakpoints show fewer slides on small viewports and more on wider viewports.
7. The currency section renders a fixed list of six currencies. The blog section displays its local content.

The promotional “view all products” button is presentational in the inspected component; no navigation or purchase workflow is wired to it.

## 7. Product images and static content

Products and image paths are stored in `src/pages/Home/ProductShowcase/ProductsData.jsx`. The data includes example jewelry and coin entries grouped by category. Currency names and formatted values are hard-coded inside `src/components/UI/Currency/CurrencyList.jsx`.

The referenced product images are present under `src/assets/picture`. One product entry uses `/` as its image path rather than a product image, so that item should be corrected before deployment. A file named `Screenshot 2025-11-29 170020.png` is also present in the image directory, but it was not verified as a clean application screenshot and should not be used in a portfolio without checking its contents and removing any sensitive data.

Currency values are static strings. There is no polling, API fetch, timestamp, or other indication that they are current market quotes.

## 8. Responsive behavior

The page uses Tailwind responsive utility classes for layout and sizing. Swiper breakpoints configure category and product carousel slide counts for small and larger viewports. The last inspected commit message mentions responsive layout work and Swiper; actual behavior is defined by the current components and should be tested at target screen sizes.

## 9. Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

Other scripts:

```bash
npm run build
npm run preview
npm run lint
```

## 10. Implemented scope and limitations

| Capability | Status in inspected branch |
|---|---|
| Home/landing page sections | Implemented |
| Category selection | Implemented with local component state |
| Product category filtering | Implemented over local static data |
| Product carousel | Implemented with Swiper |
| Currency display | Implemented with hard-coded values |
| Blog section | Implemented as UI/local content |
| Product detail route | Not found in the reviewed route structure |
| Cart, checkout, payment, authentication | Not found |
| Live product/currency API | Not found |
| Automated test suite and GitHub Actions | Not found during the audit |
| Portfolio-ready screenshots | Not verified; one screenshot-named image asset requires review |

## 11. Limitations and recommended follow-up

- Replace example currency values with clearly dated content or a verified data source before presenting them as current.
- Validate all image paths and add a real product image set with suitable alt text.
- Decide whether the project remains a static UI concept or should add product detail, cart, and checkout flows.
- Improve the minimal About page and decide whether to restore or implement a Footer.
- Add responsive, accessibility, and component tests; add CI checks before claiming production readiness.
- Use screenshots captured from the running app and avoid sample prices that could be mistaken for live financial data.
