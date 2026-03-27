# VendorVerse - Premium Multi-Vendor Marketplace

Welcome to **VendorVerse**, a state-of-the-art multi-vendor e-commerce marketplace designed with premium aesthetics, robust performance, and a seamless user experience. This platform allows multiple independent vendors to list and sell their products while providing customers with an intuitive, fast, and secure shopping environment.

![VendorVerse Preview](https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=600&fit=crop)

## 📖 Concept & Objective
The core idea behind VendorVerse is to create an e-commerce ecosystem similar to major platforms like Myntra, Amazon, or Etsy. It bridges the gap between independent sellers (vendors) and buyers. 

**Key Objectives:**
- **For Vendors:** An easy-to-use dashboard to upload products, manage inventory, and track sales.
- **For Customers:** A rich, highly responsive storefront featuring advanced search, dynamic filtering, wishlist capabilities, and a smooth checkout process.
- **For the System:** High performance, scalability with paginated data fetching, and an optimized relational database to handle thousands of products seamlessly.

---

## 🚀 Tech Stack

### Frontend (Client-Side)
- **Framework:** [Next.js](https://nextjs.org/) (App Router) with Turbopack for lightning-fast development builds.
- **Language:** TypeScript for type safety and better developer experience.
- **Styling:** Custom Vanilla CSS tailored for premium UI/UX, animations, and responsive design.
- **State Management & API:** React Hooks, Context API (Cart, Wishlist, Auth), and Axios for HTTP requests.

### Backend (Server-Side)
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** Express.js 
- **Database:** PostgreSQL (Relational Database)
- **ORM:** [Prisma](https://www.prisma.io/) (with Preview Features like `fullTextSearchPostgres` enabled).
- **Authentication:** JSON Web Tokens (JWT) for secure session management and role-based access control (Customer vs. Vendor).
- **Performance:** `compression` middleware to reduce payload sizes and optimized API pagination (`skip` & `take`).

---

## ✨ Key Features & Implementation

### 1. Advanced Search & Filtering
- **Implementation:** Replaced basic `ILIKE` queries with **PostgreSQL Native Full-Text Search**. Search inputs are sanitized and joined to perform intersection searches (e.g., searching "red shirt" mandates both terms).
- **Sorting:** Database indices created on `category`, `gender`, `price`, `subcategory`, and `createdAt` enable ultra-fast sorting (Price High/Low, Newest Arrivals).

### 2. High-Performance Product Loading
- **Implementation:** Implemented server-side pagination to prevent the browser from downloading the entire database at once. 
- **Frontend UI:** Integrated a dynamic "Load More" button on category pages that appends the next batch of products seamlessly without blocking the main UI thread.

### 3. Role-Based Authentication
- **Implementation:** A robust auth system using JWT. Users are tagged via an `isVendor` boolean in PostgreSQL.
- **Routing:** Express middleware checks the token validity and ensures that only vendors have access to product creation/deletion endpoints.

### 4. Rich User Experience (UI/UX)
- **Implementation:** Built visually stunning pages like the animated Welcome Page. Used high-quality UI patterns like sliding carousels, toast notifications, discount badges, and a comprehensive user profile dashboard managing saved cards, addresses, and gift cards.

### 5. Cart & Wishlist Ecosystem
- **Implementation:** Managed globally via React Context, persisting state to `localStorage` to ensure the user doesn't lose their cart items upon page refresh.

---

## 🛠️ Project Structure

The repository is organized into a monorepo style with separate frontend and backend directories:

```text
multi-vendor-marketplace/
│
├── multi-vendor-backend/       # Node.js + Express Backend
│   ├── prisma/                 # PostgreSQL Schema & Migrations
│   ├── routes/                 # API Endpoints (Auth, Products, Orders, Reviews)
│   ├── middleware/             # JWT Authentication logic
│   ├── index.js                # Server entry point
│   └── package.json            
│
└── multi-vendor-frontend/      # Next.js Frontend
    ├── app/                    # Next.js App Router (Pages & Layouts)
    ├── components/             # Reusable UI Components (Navbar, ProductImage)
    ├── lib/                    # Axios setup, Auth/Cart/Wishlist Contexts
    ├── public/                 # Static assets
    └── package.json            
```

---

## 💻 How to Run Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally.

### 1. Database Setup
1. Create a PostgreSQL database (e.g., `marketplace`).
2. Navigate to the `multi-vendor-backend` directory.
3. Update the `.env` file with your database URL:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/marketplace"
   JWT_SECRET="your_secret_key"
   ```
4. Run Prisma migrations and generate the client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

### 2. Start the Backend
```bash
cd multi-vendor-backend
npm install
npm run dev
```
*The backend will start on `http://127.0.0.1:5000`*

### 3. Start the Frontend
Open a new terminal window:
```bash
cd multi-vendor-frontend
npm install
npm run dev
```
*The frontend will start on `http://localhost:3000`*

---

## 🔮 Future Roadmap
- **Payment Gateway Integration:** Stripe integration for real checkout processing.
- **Admin Dashboard:** A super-admin panel to moderate vendors and view platform-wide analytics.
- **Vendor Payouts:** Automated payout capabilities for sellers.
- **AI Recommendations:** Implement collaborative filtering to show "You might also like" based on user behavior.

---
*VendorVerse - Redefining the digital shopping experience.*
