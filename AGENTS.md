<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Signed-in pages live under `src/routes/_authenticated/` (client-only gate, redirects to `/login`); page data loads via route loaders + `useSuspenseQuery` with query options in `src/lib/queries.ts`. Why: one auth gate and one cache for all protected pages.
- Admin privileges come only from `public.user_roles` checked with `has_role`; the role is auto-granted by a trigger when an email listed in the private `public.admin_emails` table is confirmed. `profiles.role` is just the client/worker account type and is not user-editable. Why: prevents privilege escalation.
- Demo worker profiles have no sign-in account, so `profiles.id` has no foreign key to auth users; child tables reference profiles with `ON UPDATE CASCADE` so imported users can be re-linked to new account ids. Why: supports sample data and the Bolt user import.
- AI job analysis runs in `src/lib/job-ai.server.ts`: the project's own Gemini key when `GEMINI_API_KEY` is set, otherwise a Gemini model through Lovable AI. Why: preserves the original provider while working without a key.
