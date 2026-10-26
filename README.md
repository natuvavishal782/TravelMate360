# TravelMate 360 — First Working Deliverable

Responsive React + Vite starter for a worldwide travel-planning platform.

## Included
- Colorful responsive dashboard and mobile navigation
- My Trips: create/remove trip workspaces
- Discover: searchable sample destinations
- Budget planner with editable estimates (currently USD)
- Travel checklist with completion tracking
- JSON export of personal planner data
- Searchable 1,000-entry roadmap: 25 systems × 40 entries
- Supabase schema starter with row-level security policies
- Vercel deployment configuration

## Run
1. Install Node.js 20+ in a computer or supported cloud development environment.
2. Extract ZIP and run `npm install`.
3. Run `npm run dev` and open the Vite URL.

Phone-only route: upload the files to a GitHub repository using the browser, then import the repository in Vercel. This ZIP does not deploy itself.

## Deploy to Vercel
Import the GitHub repository into Vercel. Build command: `npm run build`; output directory: `dist`. The included `vercel.json` provides SPA fallback.

## Supabase
Review and run `supabase/schema.sql` in Supabase SQL Editor. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Environment Variables and redeploy. Only public anon/publishable keys belong in frontend variables; never expose a service-role key.

Supabase client configuration is scaffolded, but authentication and database-backed sync are not yet implemented. Demo data is saved in this browser's local storage; it is not a secure document vault or a backup.

## Limitations
Destination entries are sample inspiration, not live inventory. Live flight/train/hotel data, bookings, payments, maps, route directions, weather and visa decisions are not connected. Confirm travel rules and bookings with official providers. Feature entries are planned, not completed production capabilities.

## Next checkpoint
Implement authentication, connect trip CRUD to Supabase, and test row-level security before adding third-party travel APIs.
