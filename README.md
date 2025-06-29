# Restaurant ERP+POS System

This is a Next.js-based Point of Sale (POS) application designed to integrate with a self-hosted or cloud-based ERPNext instance. It provides a touch-friendly interface for managing tables, taking orders, and processing payments, with all sales data syncing directly to your ERP.

## Features

- **Table Management:** A visual layout of restaurant tables showing their status (Available, Occupied, Billing).
- **Order Interface:** A menu organized by categories, allowing staff to easily add items to a table's order.
- **Selective Firing:** Staff can select a subset of items from an order (e.g., just the appetizers) and send them to the kitchen printer (KOT).
- **Live ERPNext Integration:**
  - Completed payments create a "Sales Invoice" directly in ERPNext.
  - A live dashboard pulls recent transaction data from ERPNext to display key metrics.
- **Persistent State:** Orders stay with a table even if the user navigates away and comes back.

## Tech Stack

- [Next.js](https://nextjs.org/) (React Framework)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.com/) (Component Library)

---

## Getting Started: Installation and Setup

Follow these steps to get the application running on your local machine and connected to your ERPNext instance.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later recommended)
- `npm` (or `yarn`)
- A running ERPNext instance (either local via Docker/WSL or a cloud-hosted one).

### 1. Clone the Repository

If you haven't already, clone this repository to your local machine:

```bash
git clone <your-repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

Install all the required Node.js packages:

```bash
npm install
```

### 3. Configure ERPNext Connection

This is the most important step to connect the POS to your ERP.

a. **Create an Environment File:** In the root of the project, create a new file named `.env.local`.

b. **Get API Credentials:**
   - Log into your ERPNext instance.
   - Go to your user settings (click your avatar in the top right) and find the **API Access** section.
   - Generate an **API Key** and **API Secret**.

c. **Add Credentials to `.env.local`:** Open the `.env.local` file and add the following, filling in your specific details:

```env
# The full URL to your ERPNext instance
ERPNEXT_URL="http://your-erpnext-domain.com"

# The API Key you generated in ERPNext
ERPNEXT_API_KEY="your_api_key_goes_here"

# The API Secret you generated in ERPNext
ERPNEXT_API_SECRET="your_api_secret_goes_here"
```
> **Note:** If you are running ERPNext locally (e.g., via Docker or WSL), your `ERPNEXT_URL` will likely be `http://localhost:8000`.

### 4. Run the Application

Now you can start the development server.

```bash
npm run dev
```

The application should now be running, typically on **[http://localhost:9002](http://localhost:9002)**.

Make sure your ERPNext server is also running at the same time so the POS can communicate with it. You are now ready to start taking orders!
