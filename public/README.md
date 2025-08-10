# PacMac Prophecy Watch — README & Render Deploy Guide

*A space‑themed RSS website that surfaces current events and shows possible correlations to biblical end‑times passages, with clear Scripture citations (KJV — public domain).*

> Friendly note: This project is a **study aid**, not a prophetic ticker. It highlights **possible** correlations based on transparent keyword matching that you can edit yourself.

---

## 🚀 What this repo contains

* **Backend:** Node + Express server that fetches multiple news RSS feeds, tags them by end‑times topics, and exposes a JSON API.
* **Frontend:** Static HTML/JS/CSS (space theme) that lists articles, lets you filter/search, and shows inline verse citations.
* **Caching:** In‑memory cache (10 minutes) to keep the app fast and polite to RSS providers.

### File tree

```
pacmac-prophecy-watch/
├─ package.json
├─ server.js
└─ public/
   ├─ index.html
   ├─ styles.css
   └─ app.js
```

If you don’t have the files yet, copy them from this canvas into the matching paths.

---

## 🧩 How the mapping works (in one mouthful)

* Headlines/descriptions are scanned for **plain keywords** per topic (edit these in `server.js` under **\[SECTION: TOPIC KEYWORDS]**).
* If any keyword matches, the article is tagged with that topic.
* The UI shows topic badges and a short KJV verse connected to that topic.

This is deliberate: simple, explainable, and easy to tweak.

---

## 🧪 Run it locally (step by tiny step)

1. **Install Node.js 18+** from nodejs.org.
2. **Open your terminal** (Command Prompt/PowerShell on Windows, Terminal on macOS/Linux).
3. **Go to the project folder**:

   ```bash
   cd pacmac-prophecy-watch
   ```
4. **Install dependencies** (this reads `package.json` and downloads the libraries):

   ```bash
   npm install
   ```
5. **Start the server**:

   ```bash
   npm run dev
   ```
6. **Open the site** in your browser: [http://localhost:3000](http://localhost:3000)

If you see cards appear, you’re golden. If not, see Troubleshooting below.

---

## 🔧 Where to change things (exact spots)

* **Add/remove RSS feeds** → `server.js` at **\[SECTION: RSS FEEDS]**.
* **Edit topics/verses/keywords** → `server.js` at **\[SECTION: TOPIC KEYWORDS]**.
* **Frontend look & feel** → `public/styles.css` and `public/index.html`.

> Tip: Keep verse snippets short so cards stay readable. Full passages can be linked later.

---

## 🌐 Deploy to Render (click‑by‑click)

This creates a free, always‑on web service (with occasional cold starts). Render will run your Node server and serve `public/` as static files.

### A) Prepare the repo

* Put these four files into a Git repo (`pacmac-prophecy-watch`).
* Commit and push to GitHub/GitLab/Bitbucket.

```bash
git init
git add .
git commit -m "Initial commit: PacMac Prophecy Watch"
git branch -M main
git remote add origin https://github.com/<you>/pacmac-prophecy-watch.git
git push -u origin main
```

### B) Create a web service on Render

1. Go to **render.com** and sign in.
2. Click **New +** → **Web Service**.
3. **Connect your repository** (pick `pacmac-prophecy-watch`).
4. **Name**: `pacmac-prophecy-watch` (or anything fun and spacey).
5. **Region**: choose the closest to your audience.
6. **Branch**: `main`.
7. **Runtime**: **Node**.
8. **Build Command**:

   ```
   npm install
   ```
9. **Start Command**:

   ```
   node server.js
   ```
10. **Instance Type**: Start with **Free** to experiment.
11. Click **Create Web Service**.

Render will:

* Install dependencies (from `package.json`).
* Set the `PORT` environment variable (your `server.js` already respects `process.env.PORT`).
* Start the server (`node server.js`).

When it finishes, you’ll get a public URL like `https://pacmac-prophecy-watch.onrender.com/`.

### C) Post‑deploy checklist

* Visit the URL → you should see the starfield and cards.
* Test **topic filter** and **search** in the header.
* Open a couple of **Read Source** links to confirm they go out to Reuters/AP/BBC/etc.

### D) Optional: Auto‑deploy on push

On your Render service, turn on **Auto‑Deploy** so any `git push` to `main` rebuilds and redeploys.

### E) Optional: Custom domain

1. Buy/own a domain (e.g., from Namecheap, Cloudflare, Google Domains).
2. In Render → your service → **Settings** → **Custom Domains**.
3. Add `watch.yourdomain.com` (or the root domain), follow the DNS instructions (usually a CNAME).
4. Wait for DNS to propagate; Render will provision TLS for free.

---

## 🧰 Render‑specific notes & gotchas

* **Cold starts** (Free tier): The service may sleep after inactivity; the first request can take a few seconds to wake.
* **Memory**: RSS parsing is light, but if you add many feeds, consider bumping the instance size.
* **Timeouts**: Feeds sometimes stall; we set `rss-parser` `timeout: 15000`. You can adjust in `server.js`.
* **CORS**: We enable `cors()` in `server.js` so the browser can call `/api/*` from the same origin. If you split frontend and backend across domains later, keep CORS in mind.
* **Caching**: Items are cached in memory for \~10 minutes via `node-cache`. On a new instance (during deploys) the cache is cold until the first fetch.

---

## 🛡️ Theology posture (a friendly guardrail)

The app presents **possible** correlations for study. It is not making predictions. Always compare headlines with Scripture carefully (Acts 17:11).

---

## 🧭 Roadmap ideas (when you want to get fancy)

* Add a **topic sidebar** with counts (e.g., how many “Wars & Rumours of Wars” items today).
* Add a **“Compare translations”** toggle (stick to public‑domain translations unless you have licenses).
* Swap keyword matching for a small **NLP classifier** trained on your topic set (while keeping explainability in the UI).
* Add **feed health** indicators and per‑feed refresh buttons.

---

## 🆘 Troubleshooting

**Nothing loads / blank page**

* The server must be running. Locally: `npm run dev`. On Render: check the **Logs** tab.

**Render deploy fails at build**

* Make sure the repo contains `package.json`, `server.js`, and the `public/` folder at the **repo root**.
* Ensure **Build Command** is exactly `npm install` and **Start Command** is `node server.js`.

**RSS feed errors in logs**

* Some providers occasionally rate‑limit or change URLs. Update the feed URL in `server.js` under **\[SECTION: RSS FEEDS]**.

**Verses aren’t showing**

* Cards only show a verse if a topic matched. Confirm your keywords under **\[SECTION: TOPIC KEYWORDS]** line up with the headline text.

**I want to add a new topic**

* In `server.js` under **\[SECTION: TOPIC KEYWORDS]** add a block like:

  ```js
  new_topic_key: {
    label: 'My Topic Label',
    keywords: ['word1','word2'],
    verses: [
      { ref: 'Book 1:1', text: 'Short KJV snippet here.' }
    ]
  }
  ```

  Restart the server (locally) or push to `main` to redeploy on Render.

---

## 📜 License

* Code: MIT (you can adapt as you like; please keep the attribution if you fork).
* Scripture: KJV public domain excerpts.

---

## 🙌 Credits

* Built with Node, Express, rss‑parser, and pure HTML/CSS/JS.
* Space vibes courtesy of a lightweight canvas starfield in `public/app.js`.

> Keep building, keep testing, keep your sense of wonder. If you want me to wire up a one‑click Render Blueprint (YAML) next, I can generate that too so deploys are a single button press.
