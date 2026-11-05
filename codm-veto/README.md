# CODM Map Veto

Pick/ban rooms for Call of Duty: Mobile series. The admin creates a room, shares the 6-character code or the invite link, and the two captains ban, pick and choose starting sides from their own phones. The order is all bans, then all picks, then all starting sides. Who bans and picks each mode follows the CODM World Championship 2026 esports settings.

The site opens on a home page: a create button, a box to join with a code, how a veto runs, the formats, the 2026 map pool, and the rooms you've opened on that device. Creating a room is its own page (`/#new`), and a room is `/#K7QM4X`.

The site runs on **Vercel**. Rooms are stored in **Supabase**, which also pushes live updates to every open screen.

## What's in the folder

| Path | What it is |
|---|---|
| `public/index.html`, `public/styles.css`, `public/app.js` | The page people open |
| `public/veto-engine.js` | Map pools and veto order, shared by the page and the server |
| `public/images/maps/` | Put your map images here (see below) |
| `api/` | Vercel server functions: create a room, read it, take a seat, make a move |
| `supabase/schema.sql` | The two database tables, run once in Supabase |

The server checks every move. Only the captain whose turn it is (or the host with "Act for either team" on) can ban, pick or choose a side. Seat and host keys are stored as hashes in a table browsers can't read.

## Deploy, step by step

### 1. Set up Supabase (about 5 minutes)

1. Go to [supabase.com](https://supabase.com), sign in, and create a **New project**. Any region close to your players works (Singapore is closest to the Philippines).
2. When it's ready, open **SQL Editor**, click **New query**, paste everything from `supabase/schema.sql`, and click **Run**.
3. Open **Project Settings > API Keys** (on some projects it's **Settings > API**). Copy three values:
   - the **Project URL**
   - the **anon** or **publishable** key (safe to show in the browser)
   - the **service_role** or **secret** key (keep this private, it can write anything)

### 2. Put the code on GitHub

Create a new repository and upload this folder (without `node_modules`). GitHub Desktop or the "Upload files" button both work.

### 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com), click **Add New > Project**, and import the repository.
2. Framework preset: **Other**. Leave build settings empty. `vercel.json` already tells Vercel to serve the `public` folder.
3. Before clicking Deploy, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | Project URL |
   | `SUPABASE_ANON_KEY` | anon / publishable key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key |

4. Click **Deploy**. If you added the variables after deploying, go to **Deployments**, open the latest one and choose **Redeploy**.

Shortcut: the **Supabase** integration in Vercel's Marketplace can create the project and add these variables for you. The server also accepts the names that integration uses (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY` and so on). You still need to run `schema.sql` once.

### 4. Check it

Open your Vercel URL. Under "Join with a code" the note should say *Both captains open this same site and enter the code*. If it says rooms aren't connected, the environment variables are missing or the site wasn't redeployed.

Create a room, copy the invite link, and open it on your phone to take a seat.

## Map images

Copy your images into `public/images/maps/` with these names (JPG, about 640x400 is plenty):

```
summit.jpg  hacienda.jpg  combine.jpg  takeoff.jpg  arsenal.jpg
tunisia.jpg  firing-range.jpg  coastal.jpg  slums.jpg  meltdown.jpg
raid.jpg  standoff.jpg  crossroads-strike.jpg
```

A missing image just shows the dark tile with the map name.

## Changing the map pool

**For one room:** use **Map pool** when creating the room. Tap a map to switch it off, type a name and press Add to bring in another map, or use the x on a map you added to remove it. Your pool is remembered in that browser for the next room. Each room keeps the pool it was created with.

How the veto adapts: every mode bans until only the maps that get played are left, so no map is ever left over. Bans alternate, starting with the team that picks first in that mode.
- Bo5 with the 2026 pool: Hardpoint 5 maps, 2 picks, 3 bans. S&D 5 maps, 2 picks, 3 bans. Control 3 maps, 2 bans, 1 decider.
- Add a sixth Hardpoint map and it becomes 4 bans; switch one off and it becomes 2.
- The page won't create a room if a mode has fewer maps than it plays in that format, and it tells you how many it needs.

Maps you add show the plain tile unless you add an image with the matching name, for example `nuketown.jpg` for "Nuketown".

**For every room by default:** edit `MODES` in `public/veto-engine.js`. `FORMATS` in the same file holds who bans and picks in each mode. Push the change to GitHub and Vercel redeploys on its own.

## Running it on your computer

```
npm install
npx vercel dev
```

`vercel dev` asks you to log in and link the project the first time, then pulls the environment variables from Vercel.

## Good to know

- Anyone with the code can watch a room. Taking a seat only needs a name, so share codes in your team channels, not publicly.
- Seats are tied to the browser that took them. If a captain switches phones, the host frees the seat and they take it again.
- Rooms stay in the database. The bottom of `schema.sql` has a one-line clean-up you can run now and then.
- Live updates use Supabase Realtime. If it's blocked, the page falls back to checking every 2 seconds.
