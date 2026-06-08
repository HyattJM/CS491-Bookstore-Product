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

The API will be available at http://localhost:8080.

🛠️ Tech Stack
Backend: Spring Boot 3.2.5 (Java 21)

Database: MySQL / Spring Data JPA

Security: Spring Security (BCrypt)

Frontend: React (SPA)

📋 Project Status
[x] Sprint 1: Database Schema, Authentication, RBAC, CRUD for Inventory.

[ ] Sprint 2: Sales Processing, Reporting Dashboards, Supplier Management.

🤝 Team
Frank Gialluca: Product Owner

Scott Fleenor: Scrum Master

James Hyatt: Backend Developer

Yves Michel Fouty-Bikandou: Frontend Developer

Luke Brown: QA / Reporting
