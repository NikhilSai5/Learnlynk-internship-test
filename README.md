# LearnLynk Internship – Technical Assignment

This repository contains my complete submission for the LearnLynk Internship Technical Test.  
All tasks (Task 1 to Task 5) have been successfully implemented as per the provided requirements.

---

## Task 1 – Database Schema (Supabase / PostgreSQL)

- Designed relational tables for leads, applications, and tasks
- Implemented proper:
  - Primary and foreign keys
  - Constraints (task type, due date validation)
  - Indexes for common query patterns
- Schema supports multi-tenant data isolation
  
<img width="1918" height="871" alt="tasks table" src="https://github.com/user-attachments/assets/9cdbeeaa-b47b-437d-8e5f-78e2a97dcb9e" />

Delivered as a runnable `.sql` file compatible with Supabase.

---

## Task 2 – Row Level Security (RLS)

- Enabled RLS on the leads table
- Implemented role-based access:
  - Admin can access all leads
  - Counselor can access:
    - Leads owned by them
    - Leads assigned to their team
- Used JWT-based role checks and `auth.uid()` correctly

  <img width="1918" height="857" alt="RLS pics" src="https://github.com/user-attachments/assets/6652a443-07f6-4ca2-848a-474d9640eb73" />


---

## Task 3 – Supabase Edge Function (`create-task`)

- Built a Supabase Edge Function using Deno and TypeScript
- Features:
  - Accepts POST requests to create tasks for applications
  - Validates input and due date
  - Inserts tasks securely using the service role
  - Emits realtime event `task.created`
  - Proper error handling and HTTP status codes
- Function is deployed and tested using the Supabase Edge Functions dashboard
<img width="1918" height="875" alt="function page" src="https://github.com/user-attachments/assets/7401f0af-f090-48e2-95df-024edff46915" />

<img width="636" height="852" alt="create task" src="https://github.com/user-attachments/assets/6550e30f-6fba-4340-8101-40fe4580f9ec" />

---

## Task 4 – Frontend Dashboard (Next.js)

- Created `/dashboard/today` page using:
  - Next.js
  - Supabase client
  - React Query
- Features:
  - Fetches tasks due today
  - Displays tasks in a table
  - Supports Mark Complete action
  - Handles loading and error states

<img width="1918" height="1011" alt="can view task" src="https://github.com/user-attachments/assets/1667e79b-d359-4341-a4aa-bbcaa534298e" />

---

## Task 5 – Stripe Checkout Integration (Explanation)

- I'd create a backend endpoint (like /api/create-checkout-session) that uses Stripe's SDK to generate a Checkout Session with the application fee amount and success/cancel URLs
- Before redirecting to Stripe, I'd store a payment_request record in the database linked to the application_id, saving the Stripe session ID and setting status as "pending"
- On the frontend, I'd call this endpoint and redirect the user to Stripe's hosted checkout page using the session URL
- I'd set up a webhook endpoint to listen for Stripe events like checkout.session.completed, making sure to verify the webhook signature for security
- When payment succeeds, I'd update the payment_request status to "paid" and store the transaction metadata
- Finally, I'd update the application's stage (like from "awaiting payment" to "under review") or timeline field to reflect that payment was completed
---

All tasks have been completed according to the assignment specifications.
