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

---

## Task 5 – Stripe Checkout Integration (Explanation)

I would integrate Stripe Checkout by creating a secure backend endpoint (e.g. `/api/create-checkout-session`) that uses the Stripe SDK to create a Checkout Session for the application fee, specifying the amount, currency, and success/cancel URLs.  
When creating the session, I would also store a `payment_request` record in the database linked to the `application_id`, saving the Stripe session ID and marking its status as `pending`.  
On the frontend, when the user initiates payment, I would call this endpoint and redirect the user to Stripe’s hosted Checkout page using `session.url`.  
I would then configure a Stripe webhook endpoint to listen for events such as `checkout.session.completed` and securely verify them using Stripe’s signing secret.  
On successful payment, I would update the corresponding `payment_request` to `paid` and store transaction metadata.  
Finally, I would update the related application’s stage or timeline (for example, from `awaiting_payment` to `paid`) to reflect the successful application fee payment.

---

All tasks have been completed according to the assignment specifications.
