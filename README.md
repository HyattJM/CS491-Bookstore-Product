# Rare Finds Bookstore Management System (BMS)

Welcome to the official repository for the Rare Finds Bookstore Management System. This project is a full-stack bookstore management solution designed to streamline inventory, sales, and secure user management.

## 🚀 Getting Started

### Prerequisites
* **Java 21**
* **Maven 3.8+**
* **MySQL 8.0+**

### Database Setup
1. Ensure your local MySQL server is running.
2. The application will automatically create the required tables on the first run, but you can find the manual DDL scripts in `src/main/resources/schema.sql`.

### Running the Application
1. Clone the repository.
2. Navigate to the `backend` folder.
3. Run the following command:
   ```bash
   mvn spring-boot:run
   ```

The API will be available at http://localhost:8081.

## 🛠️ Tech Stack
**Backend:** Spring Boot 3.2.5 (Java 21)

**Database:** MySQL / Spring Data JPA

**Security:** Spring Security (BCrypt)

**Frontend:** React (SPA)

## 📋 Project Status
- [x] Sprint 1: Database Schema, Authentication, RBAC, CRUD for Inventory, Search & Filter UI.
- [ ] Sprint 2: Sales Processing, Reporting Dashboards, Supplier Management.

## 🤝 Team
- **Frank Gialluca:** Product Owner
- **Scott Fleenor:** Scrum Master
- **James Hyatt:** Backend Developer
- **Yves Michel Fouty-Bikandou:** Frontend Developer
- **Luke Brown:** QA / Reporting

---

## Sprint 1 Completion & Search Feature Walkthrough

I have successfully completed the tasks required to fulfill the Sprint 1 requirements (Authentication, RBAC, CRUD for Inventory) and set up the foundation for the frontend application. In addition, I have just completed the **Search & Filter (EP-03)** functionality assigned to Michel Fouty and James Hyatt.

> [!NOTE]
> The backend application is configured to run on port `8081`.
> The frontend application is a Vite + React application.

### Backend Implementation
* **Security & Authentication:** 
  * Implemented `CustomUserDetailsService` using `BCryptPasswordEncoder` with securely hashed passwords in the database.
  * Basic Authentication is required for all `/api/books/**` endpoints, with explicit role-based access control.
  * CORS is globally configured to permit requests (including `OPTIONS` preflight) from the frontend.
* **Database:** Seeded with sample books and test users (`admin`, `manager`, `clerk`) in an in-memory or dynamically updated database.
* **Search Logic (T1-11, T1-12):**
  * Added custom Spring Data JPA queries (`findByTitleContainingIgnoreCase`, `findByAuthor...`, etc.) to process case-insensitive keyword searches efficiently at the database level.
  * Updated the main `getAllBooks` endpoint to dynamically accept optional `query` and `filterBy` request parameters and route them to the proper repository methods.

### Frontend Implementation
* **Design Guidelines:**
  * Avoided Tailwind in favor of Vanilla CSS per the design specs.
  * Built a rich, dark-mode aesthetic with vibrant purple accents, glassmorphism elements, and subtle micro-animations for interactive elements.
* **Authentication UI:** Implemented a secure login screen that converts credentials into Base64 Basic Auth tokens.
* **Dashboard & Search UI (T1-10, T1-13):**
  * Built an intuitive search bar combined with a dropdown filter (`Title`, `Author`, `Genre`).
  * Hitting "Enter" or clicking "Search" fires the updated API request.
  * Added dynamic "No results found for '[query]'" messaging that gracefully handles empty result sets.
  * Displays Role-based UI components (e.g., only Admin/Manager can see "Add New Book", only Admin can see "Delete").

### Getting Started

If your servers are not already running, you can launch them:
1. **Backend:** Run `mvn spring-boot:run` in the `backend` folder.
2. **Frontend:** Run `npm run dev` in the `frontend` folder.

You can then log in using any of the test users:
- `admin` / `password`
- `manager` / `password`
- `clerk` / `password`

---

## Sprint 2 Week 1 Completion: UI Enhancements & External APIs

We have significantly improved the user experience in the Inventory Dashboard by adding high-quality visual elements and interactive features to our book listings.

### New Features & Improvements
* **Real Book Covers via API Integration:**
  * Replaced mock placeholder images by integrating with the **Apple iTunes Books API**.
  * Dynamic, on-the-fly fetching of real, high-resolution book covers based on Book Title and Author.
  * *Note:* Switched from Google Books API to Apple iTunes API to gracefully handle strict rate-limiting and unreliable ISBN cover lookups.
# Rare Finds Bookstore Management System (BMS)

Welcome to the official repository for the Rare Finds Bookstore Management System. This project is a full-stack bookstore management solution designed to streamline inventory, sales, and secure user management.

## 🚀 Getting Started

### Prerequisites
* **Java 21**
* **Maven 3.8+**
* **MySQL 8.0+**

### Database Setup
1. Ensure your local MySQL server is running.
2. The application will automatically create the required tables on the first run, but you can find the manual DDL scripts in `src/main/resources/schema.sql`.

### Running the Application
1. Clone the repository.
2. Navigate to the `backend` folder.
3. Run the following command:
   ```bash
   mvn spring-boot:run
   ```

The API will be available at http://localhost:8081.

## 🛠️ Tech Stack
**Backend:** Spring Boot 3.2.5 (Java 21)

**Database:** MySQL / Spring Data JPA

**Security:** Spring Security (BCrypt)

**Frontend:** React (SPA)

## 📋 Project Status
- [x] Sprint 1: Database Schema, Authentication, RBAC, CRUD for Inventory, Search & Filter UI.
- [ ] Sprint 2: Sales Processing, Reporting Dashboards, Supplier Management.

## 🤝 Team
- **Frank Gialluca:** Product Owner
- **Scott Fleenor:** Scrum Master
- **James Hyatt:** Backend Developer
- **Yves Michel Fouty-Bikandou:** Frontend Developer
- **Luke Brown:** QA / Reporting

---

## Sprint 1 Completion & Search Feature Walkthrough

I have successfully completed the tasks required to fulfill the Sprint 1 requirements (Authentication, RBAC, CRUD for Inventory) and set up the foundation for the frontend application. In addition, I have just completed the **Search & Filter (EP-03)** functionality assigned to Michel Fouty and James Hyatt.

> [!NOTE]
> The backend application is configured to run on port `8081`.
> The frontend application is a Vite + React application.

### Backend Implementation
* **Security & Authentication:** 
  * Implemented `CustomUserDetailsService` using `BCryptPasswordEncoder` with securely hashed passwords in the database.
  * Basic Authentication is required for all `/api/books/**` endpoints, with explicit role-based access control.
  * CORS is globally configured to permit requests (including `OPTIONS` preflight) from the frontend.
* **Database:** Seeded with sample books and test users (`admin`, `manager`, `clerk`) in an in-memory or dynamically updated database.
* **Search Logic (T1-11, T1-12):**
  * Added custom Spring Data JPA queries (`findByTitleContainingIgnoreCase`, `findByAuthor...`, etc.) to process case-insensitive keyword searches efficiently at the database level.
  * Updated the main `getAllBooks` endpoint to dynamically accept optional `query` and `filterBy` request parameters and route them to the proper repository methods.

### Frontend Implementation
* **Design Guidelines:**
  * Avoided Tailwind in favor of Vanilla CSS per the design specs.
  * Built a rich, dark-mode aesthetic with vibrant purple accents, glassmorphism elements, and subtle micro-animations for interactive elements.
* **Authentication UI:** Implemented a secure login screen that converts credentials into Base64 Basic Auth tokens.
* **Dashboard & Search UI (T1-10, T1-13):**
  * Built an intuitive search bar combined with a dropdown filter (`Title`, `Author`, `Genre`).
  * Hitting "Enter" or clicking "Search" fires the updated API request.
  * Added dynamic "No results found for '[query]'" messaging that gracefully handles empty result sets.
  * Displays Role-based UI components (e.g., only Admin/Manager can see "Add New Book", only Admin can see "Delete").

### Getting Started

If your servers are not already running, you can launch them:
1. **Backend:** Run `mvn spring-boot:run` in the `backend` folder.
2. **Frontend:** Run `npm run dev` in the `frontend` folder.

You can then log in using any of the test users:
- `admin` / `password`
- `manager` / `password`
- `clerk` / `password`

---

## Sprint 2 Week 1 Completion: UI Enhancements & External APIs

We have significantly improved the user experience in the Inventory Dashboard by adding high-quality visual elements and interactive features to our book listings.

### New Features & Improvements
* **Real Book Covers via API Integration:**
  * Replaced mock placeholder images by integrating with the **Apple iTunes Books API**.
  * Dynamic, on-the-fly fetching of real, high-resolution book covers based on Book Title and Author.
  * *Note:* Switched from Google Books API to Apple iTunes API to gracefully handle strict rate-limiting and unreliable ISBN cover lookups.
* **Interactive Flip Card UI:**
  * Added a sleek `NativeFlipCard` implementation that seamlessly rotates the book cover 180 degrees horizontally on mouse hover.
  * The back of the card displays a scrollable, dynamically fetched **Book Synopsis**.
  * The flip animation runs flawlessly using modern CSS 3D transforms (`preserve-3d`, `rotateY`, `cubic-bezier` timing function), fully compatible with the new React 19 / Vite environment without relying on deprecated third-party libraries.
* **Layout & Polish:**
  * Embedded a beautifully matching dynamic SVG fallback (`No Cover`) for books missing artwork.
  * Fixed image cropping issues by implementing `object-fit: contain` accompanied by a blended dark-mode navy background (`#0f172a`), preserving the original aspect ratio of all covers.
  * Implemented an `IntersectionObserver` to lazy-load cover images only when scrolled into view, preventing API throttling.

---

## Sprint 2 Completion: Core Features

We have successfully completed all major Epics for Sprint 2!

### 🛒 Sales Processing (Checkout & Cart)
* **Global Context:** Refactored the frontend to use a global `CartContext`, allowing users to maintain a shopping cart across any page.
* **Sleek Cart Drawer:** Introduced an animated `CartDrawer` that slides in from the right edge, allowing users to view items, adjust quantities, and see total prices dynamically.
* **Transactions & Inventory:** Created the `SalesController` and backend entities to process transactions. Checking out instantly creates a permanent `SalesTransaction` record, attaches `SalesTransactionItems`, and correctly deducts purchased quantities from the actual Book inventory.

### 📈 Reporting Dashboards (Analytics)
* **Backend Aggregation:** Added an `AnalyticsService` to compute live business metrics including Total Revenue, Total Books Sold, Recent Transactions, and Low-Stock items (inventory < 10).
* **Data Visualization:** Integrated `recharts` on the frontend to render a beautiful area chart tracking historical revenue trends over time.
* **Role-Based Access:** The `/analytics` endpoint and Analytics Dashboard are strictly secured so that only `ADMIN` or `MANAGER` roles can access them.

### 🏢 Supplier Management
* **Entity & API:** Built out the full backend CRUD capability with a `Supplier` entity, Repository, and Controller for managing vendor relationships.
* **Supplier UI:** Added a comprehensive `SupplierDashboard.jsx` allowing Managers and Admins to view supplier contact info, create new suppliers, and quickly edit existing ones.
* **One-Click Restocking:** Implemented a direct "Restock Inventory" workflow directly on the Supplier Dashboard. Admins can select any book and quickly append to its stock, immediately saving the changes to the database.
