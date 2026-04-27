# Avatar Fight — App Store Connect copy

Everything you need to paste into App Store Connect when submitting the build.

---

## App Information

| Field | Value |
|---|---|
| **Name** | Avatar Fight |
| **Subtitle** | Chibi RPG · Duel Online | (max 30 chars) |
| **Bundle ID** | com.uwais.avatarfight |
| **SKU** | avatar-fight-001 |
| **Primary Category** | Games |
| **Secondary Category** | Role-Playing Games |
| **Content Rights** | Contains, or has access to, third-party content (NO) |

---

## Pricing

- **Price**: Free
- **Availability**: All territories
- **Pre-orders**: No

---

## Promotional Text

(170 chars max — appears above the description, can be updated without resubmitting)

> Now in closed beta. Pick a class, level a pet, gear up, and duel chibi heroes in 30-second landscape battles. New combat, gear and pets every week.

---

## Description

(4000 chars max — what users see on the store page)

```
Avatar Fight is a chibi-anime fantasy RPG that takes 30 seconds to play and 30 days to master.

Pick one of five classes — Knight, Ninja, Mage, Archer, or Vampire — and start dueling. Every fight is a fast, satisfying landscape battle: land crits, dodge attacks, and unleash up to three pet companions who fight alongside you in alternating turn order.

⚔️ FAST DUELS
Battles take 30 seconds. Crits chain into combos. Pets pile on damage. There's a small upset chance every time, so weaker heroes can pull off the impossible.

🛡️ GEAR THAT FEELS REAL
Buy weapons and armor from the smithy. Equip them and watch your character actually wear them — every chest piece, every weapon shows up on your hero in real time. Stats stack, looks change, fights swing.

🐉 PET COMPANIONS
Hatch dragons, wolves, eagles, and stranger creatures. Each one has its own HP bar, its own stats, and its own turn in combat. Run up to three at once. Lose them in battle, revive them after.

🏆 ARENA RANKING
Fight the AI ladder, sweep entire rosters with FIGHT ALL, or conquer rivals for guaranteed gold and crystals. Level up. Outscale opponents. Climb.

🎨 BUILT BY HAND
Every character, pet, and piece of gear is original art generated specifically for the game — no asset packs, no clones. Old-school RPG parchment vibes meet 2026 production.

CLOSED BETA — Help shape the launch. Bug reports and ideas land directly in our public GitHub. Tester names go in the launch credits.

Avatar Fight runs landscape on iPhone. Free to play. No ads in beta. No data collection — your hero stays on your device.
```

---

## Keywords

(100 chars max — comma-separated, no spaces between)

```
chibi,rpg,fantasy,pvp,arena,duel,pet,anime,landscape,fight,knight,mage,archer,ninja,vampire
```

---

## Support URL

```
https://github.com/Uwais12/avatar-fight/issues
```

## Marketing URL (optional)

```
https://avatar-fight-web.vercel.app
```

## Privacy Policy URL (REQUIRED)

```
https://avatar-fight-web.vercel.app/privacy
```

---

## What's New in This Version

(For the FIRST submission — you'll write a fresh one each release.)

```
First public beta build. Five classes, six weapons, four armor sets, five pet companions, alternating turn-order combat with up to three pets per side. Drag the bow, swing the staff, summon a dragon — see your gear on your hero in real time. Welcome to the guild.
```

---

## App Privacy — answers for App Store Connect

When App Store Connect asks "Does your app collect data?" the answer for the iOS app is **No**.

For each category they list, select **"Data Not Collected"**:
- Contact Info ❌
- Health & Fitness ❌
- Financial Info ❌
- Location ❌
- Sensitive Info ❌
- Contacts ❌
- User Content ❌
- Browsing History ❌
- Search History ❌
- Identifiers ❌
- Purchases ❌
- Usage Data ❌
- Diagnostics ❌
- Other Data ❌

The app stores everything on-device via AsyncStorage; no server calls leave the phone.

---

## Age Rating

Run the App Store Connect age-rating wizard with these answers:

| Question | Answer |
|---|---|
| Cartoon or Fantasy Violence | **Infrequent/Mild** (chibi battles with damage numbers, no blood) |
| Realistic Violence | None |
| Sexual Content / Nudity | None |
| Profanity / Crude Humor | None |
| Alcohol, Tobacco, Drug References | None |
| Mature/Suggestive Themes | None |
| Horror / Fear | None |
| Gambling | None |
| Unrestricted Web Access | No |
| Medical / Treatment Info | No |

Result: **9+** (a hair under 12+ because of the cartoon violence flag).

---

## Review Information

For App Store Connect "App Review Information" section:

| Field | Value |
|---|---|
| **First Name** | Uwais |
| **Last Name** | Ishaq |
| **Phone Number** | [your number] |
| **Email** | uzair.i@hotmail.co.uk |
| **Demo Account** | Not required (no login) |
| **Notes for Reviewer** | "Avatar Fight is a single-player chibi-anime RPG with on-device combat. There is no login, no in-app purchase, and no network activity. The optional tester signup site at avatar-fight-web.vercel.app is unrelated to App Store sign-up. Test build by tapping any class on the welcome screen → battles begin in the Arena tab." |

---

## Build & Version

| Field | Value |
|---|---|
| **Version Number** | 1.0.0 |
| **Build Number** | 1 (auto-bumped by EAS thereafter) |
| **Copyright** | © 2026 Uwais Ishaq |

Increment **Version Number** for each public release (1.0.1, 1.0.2…).
EAS bumps **Build Number** automatically on each build.

---

## Required asset checklist

| Asset | Size | Status |
|---|---|---|
| App Icon | 1024×1024 PNG, RGB no alpha | ✅ `assets/icon.png` |
| iPhone 6.9" Screenshot | 1320×2868 (or 2868×1320 landscape) | See `assets/store-screenshots/` |
| iPhone 6.7" Screenshot | 1290×2796 (or 2796×1290 landscape) | See `assets/store-screenshots/` |
| iPhone 6.5" Screenshot | 1242×2688 (or 2688×1242 landscape) | Reuse 6.7" if Apple allows |
| iPad Pro 12.9" Screenshot (6th gen) | 2048×2732 | Required only if you support iPad — currently `supportsTablet: true` so YES |

**Minimum**: 3 screenshots per supported display size. Recommended: 5-6.

---

## Submission flow recap

1. `eas build --platform ios --profile production` — uploads, signs, builds. Wait ~15-30 min.
2. `eas submit --platform ios --latest` — pushes the .ipa to App Store Connect.
3. In App Store Connect:
   - Paste this doc's copy into the right fields
   - Upload screenshots
   - Set price (Free)
   - Fill App Privacy → "Data Not Collected"
   - Run Age Rating wizard
   - Add internal testers (Users and Access → invite by Apple ID email)
4. **For TestFlight only**: build appears under TestFlight → Builds within 10 min of upload. Internal testers can install immediately. No Apple review.
5. **For external beta or App Store launch**: hit "Submit for Review". 24-48h Apple review.

---

## Common rejection reasons (and how to dodge them)

- **Crashes on launch** — test on real device + simulator before submitting
- **Broken links** — privacy URL must resolve (it does, after we deploy)
- **Placeholder content** — make sure no "Lorem ipsum" or test text remains
- **Login wall with no demo account** — N/A, our app has no login
- **Different app from screenshots** — keep screenshots accurate to the build
