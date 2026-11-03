# Supabase schema

1. Open https://supabase.com/dashboard/project/nhjsadyqgygfffjyisjg/sql
2. Paste and run `schema.sql`.
3. If Create account does not add a row in **Table Editor → profiles**, also run `profiles-signup.sql`.
4. Authentication → Providers → Email: turn **Confirm email** OFF so demo accounts can sign in immediately.
   If login says **Email not confirmed**, run `confirm-emails.sql`.
5. Look for new users in **Table Editor → profiles** and **Authentication → Users**, not Logs.

That creates `profiles`, `suppliers`, `catalog_items`, `projects`, and `project_components`, with RLS so:

- buyers see only their projects
- suppliers edit only their catalog
- admin can read accounts, projects, and materials

Then create Auth users:

| Email | Password | Metadata |
| --- | --- | --- |
| `admin@gmail.com` | `admin123` | `{ "role": "admin", "name": "COSTruct Admin" }` |
| `johan.hardware@gmail.com` (and the other store Gmails) | `supplier123` | `{ "role": "supplier", "name": "Johan Hardware", "supplier_id": "johan" }` |

Buyer accounts are created from **Create an account** in the app. The trigger `handle_new_user` writes a `profiles` row when an Auth user is inserted.

The running Next.js app still uses the local account store so you can demo admin/buyer/supplier without wiring the client yet. Add these env vars when you connect the app:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
