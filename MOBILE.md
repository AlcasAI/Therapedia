# 📱 From PWA to a real mobile app (Android & iOS)

This app is already an **installable PWA**. To ship a **real native app** to the
**Apple App Store** and **Google Play**, we wrap the same code with
[**Capacitor**](https://capacitorjs.com) — you reuse 100% of the web app, no
rewrite.

There are two approaches. Start with **A** (fastest).

---

## ✅ Prerequisites (run these on your own computer, not in the cloud session)

Native binaries can't be built inside this web/cloud session — you need local
SDKs:

- **Android app:** [Android Studio](https://developer.android.com/studio)
  (includes the Android SDK + emulator). Works on Windows, macOS, or Linux.
- **iOS app:** a **Mac** with **Xcode**, plus an **Apple Developer account**
  ($99/year) to publish to the App Store.
- **Node.js 18.18+** and this repository cloned locally.

---

## 🚀 Approach A — Wrap the live PWA (recommended, fastest)

The native app loads your deployed HTTPS site. You get a real app immediately,
it always shows the latest version, and updates don't require a new build.

### 1. Deploy the web app

Deploy first (see [README → Deployment](./README.md#️-deployment), e.g. Vercel)
and copy your HTTPS URL, e.g. `https://clinical-protocol-hub.vercel.app`.

### 2. Point Capacitor at that URL

Open `capacitor.config.ts` and set `SERVER_URL` to your deployed URL
(or `export CAP_SERVER_URL="https://your-url"` before the commands below).

### 3. Install deps & add the platforms

```bash
npm install

# Android
npm run cap:add:android
npm run cap:sync
npm run cap:open:android   # opens Android Studio → Run ▶ to an emulator/device

# iOS (Mac only)
npm run cap:add:ios
npm run cap:sync
npm run cap:open:ios       # opens Xcode → Run ▶ to a simulator/device
```

### 4. Build a shippable binary

- **Android:** in Android Studio → *Build → Generate Signed Bundle / APK* → AAB
  for Google Play.
- **iOS:** in Xcode → set your Team/signing → *Product → Archive* →
  distribute to the App Store / TestFlight.

That's it — a real app in the stores, backed by your live PWA.

---

## 📦 Approach B — Fully offline bundled app (advanced)

Here the web assets are bundled inside the app so it works without the live
site. This needs a **static export** of the Next.js app.

> Trade-off: dynamic routes (`/protocols/[slug]`, `/admin/protocols/[id]/edit`)
> must be pre-rendered with `generateStaticParams`, so in offline mode the set
> of protocols is fixed at build time. **Supabase mode (live data) is not
> available offline.** This is the "offline protocol access" roadmap item.

High-level steps:

1. Add `output: "export"` to `next.config.js` and provide `generateStaticParams`
   for the dynamic routes (list the known protocol slugs / ids from the data
   source).
2. `npm run build` → produces a static site in `out/`.
3. In `capacitor.config.ts`, set `webDir: "out"` and remove the `server.url`
   (so Capacitor bundles the local assets instead of loading remote).
4. `npm run cap:sync` then build as in Approach A, step 4.

For most teams, **Approach A is the right starting point**; revisit B only when
true offline access becomes a requirement.

---

## 🎨 App icons & splash screens

Generate native icons/splash from a single source image with:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate   # reads resources/icon.png + resources/splash.png
```

(The PWA icons in `public/icons/` are used for the web/installable version.)

---

## 🧭 Which should I pick?

| You want… | Use |
| --- | --- |
| A real app in the stores ASAP, live data, easy updates | **Approach A** |
| The app to work with no internet at all | **Approach B** (offline) |
| Just to let people try it now, no install | The deployed **PWA URL** (share the link; users can "Add to Home Screen") |
