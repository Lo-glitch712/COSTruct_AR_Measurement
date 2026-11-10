# Supabase schema

Project: [`robmfnfvgmgoasllyphd`](https://supabase.com/dashboard/project/robmfnfvgmgoasllyphd)

1. Open https://supabase.com/dashboard/project/robmfnfvgmgoasllyphd/sql
2. Paste and run `schema.sql`. That creates the tables and loads the Partido supplier catalogs.
3. If Create account does not add a row in **Table Editor → profiles**, also run `profiles-signup.sql`.
4. Authentication → Providers → Email: turn **Confirm email** OFF so demo accounts can sign in immediately.
   If login says **Email not confirmed**, run `confirm-emails.sql`.
5. Look for new users in **Table Editor → profiles** and **Authentication → Users**, not Logs.

That creates `profiles`, `suppliers`, `catalog_items`, `projects`, and `project_components`, with RLS so:

- buyers see only their projects
- suppliers edit only their catalog
- admin can read accounts, projects, and materials

Then create Auth users (or sign in once from the app — it can seed them):

| Email | Password | Metadata |
| --- | --- | --- |
| `admin@gmail.com` | `admin123` | `{ "role": "admin", "name": "COSTruct Admin" }` |
| `johan.hardware@gmail.com` (and the other store Gmails) | `supplier123` | `{ "role": "supplier", "name": "Johan Hardware", "supplier_id": "johan" }` |

Buyer accounts are created from **Create an account** in the app. The trigger `handle_new_user` writes a `profiles` row when an Auth user is inserted.

App env:

```
NEXT_PUBLIC_SUPABASE_URL=https://robmfnfvgmgoasllyphd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```
