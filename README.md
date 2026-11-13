# SitterSG — Trusted Babysitting Marketplace (Singapore MVP)

Mobile-first, responsive MVP connecting Singapore families in **Punggol**, **Sengkang**, and **Tampines** with Singpass-verified, child first-aid/CPR certified babysitters.

> **Demo Mode Notice**: All external integrations (Singpass, MyInfo, OneMap, PayNow/Card payments, WhatsApp Business Cloud API) are mocked locally with `localStorage` persistence. No real NRIC, payment credentials, or API keys are stored or transmitted.

---

## Screens & Role Switcher

Use the **Parent | Sitter | Admin** switcher in the top header to explore all three sides of the marketplace:

### 1. Parent App
- **Find Sitters (`ParentDiscoverPage`)**: Search & filter 18 approved sitters across Punggol, Sengkang, and Tampines by Singapore postal code (mocked OneMap distance calculation), service type (Hourly, Date Night, School Pickup, Holiday Care, Same-Day Emergency, Newborn, Special Needs), language (English, Mandarin, Malay, Tamil), hourly rate (S$18–30/hr), rating, and "Available today". Includes a personalized rebook banner ("Book Sarah again for Friday?").
- **Singpass & MyInfo Onboarding (`SingpassOnboardingModal`)**: Mocked Singpass login flow with an explicit PDPA consent & purpose statement screen before auto-filling name, masked NRIC (`S****482J`), DOB, and address.
- **Sitter Profile & Checkout (`SitterDetailDrawer`, `BookingCheckoutModal`)**: Displays verified credentials (`Singpass ✓`, `First-aid/CPR ✓`, `Interviewed ✓`, `Insured ✓`), availability slots, parent reviews, itemized cost breakdown (hours × rate + 20% standard or 10% Plus fee − S$15 referral credit), and mocked cashless payment (`PayNow QR` / `Visa`).
- **Live Bookings & SOS (`ParentBookingsPage`)**: Live timeline (`Sitter confirmed → On the way → Checked in → Photo update → Checked out`), prominent **SOS Emergency Help** button during active sittings, in-app chat (unlocked only after confirmation), 5-star review submission, and one-tap rebook nudge.
- **Family Profile (`FamilyProfilePage`)**: PDPA-minimized child records (first name + age band only, allergies, Halal/vegetarian dietary & cultural notes, special needs flag) and emergency contacts.
- **Plus & Referrals (`MembershipReferralPage`)**: `SitterSG Plus` (S$29/mo for 10% platform fee & priority emergency dispatch), two-sided S$15 referral credit, and June / Nov–Dec school-holiday pre-booking.

### 2. Sitter App
- **Jobs & Calendar (`SitterAppPage`)**: Accept/decline incoming job requests (family's full block/unit address remains hidden behind a PDPA address shield until accepted), update live sitting steps (`On the way`, `Check in`, `Upload photo update`, `Check out`), chat with confirmed parents, and toggle availability windows.
- **Onboarding (`SitterOnboardingPanel`)**: MOM work-pass eligibility screening (blocking restricted passes such as MDWs/Student Passes), Singpass verification, child First-Aid/CPR certificate upload, interview scheduling, and mocked "Sign with Singpass" waiver signing.
- **Earnings (`SitterAppPage`)**: Net S$ payout ledger (80% sitter share after 20% platform & insurance fee).

### 3. Admin / Trust & Safety Console (`AdminConsolePage`)
- **KPIs & Rollout**: Total bookings, Gross Booking Value (S$), repeat-booking rate, average rating, % confirmed within 24 hours, and active sitters per estate (Punggol, Sengkang, Tampines).
- **Verification Queue**: Approve or reject pending sitters with document & MOM work-pass status checks.
- **Trust & Safety Incident Log**: Review live SOS escalations and disputes, update resolution status (`open` / `investigating` / `resolved`), and save ops notes.

### 4. Notifications Centre (`NotificationsPage`)
- Previews mocked WhatsApp Business Cloud API and Push notifications (booking confirmations, check-in alerts, photo updates, check-out, rate-your-sitter, rebook nudges, June/Nov–Dec school-holiday reminders, and SOS escalations).

---

## Service Layer (`/server.ts` & `/src/services`)

- **`OneMapService` (`/api/onemap/search`)**: Express backend proxy (`server.ts`) authenticating with Singapore SLA OneMap (`/api/auth/post/getToken`) using server-side `ONEMAP_API_TOKEN` or `ONEMAP_API_EMAIL`/`ONEMAP_API_PASSWORD` secrets and querying `/api/common/elastic/search` for reverse address & WGS84 coordinate lookup, with a postal-sector fallback when credentials are not configured.
- **Mocked Services (`src/services/mockServices.ts`)**: Clean TypeScript interfaces in `src/services/interfaces.ts` with `TODO` integration blueprints for:
  - `SingpassAuthService` → Singpass OIDC/FAPI + NDI Sign API
  - `MyInfoService` → MyInfo v4 Person API (explicit PDPA consent gated)
  - `PaymentService` → Stripe PaymentIntents (`paynow`, `card`) / HitPay SGQR escrow
  - `NotificationService` → WhatsApp Business Cloud API templates + FCM/APNs push
  - `StorageService` → `localStorage` persistence for the MVP demo

---

## Assumptions & Regulatory Notes
- **PDPA Minimization**: NRICs are always stored and displayed masked (`S****123A`); children are stored by first name and age band only; exact residential addresses are withheld from sitters until booking confirmation.
- **MOM Work-Pass Compliance**: Only Singapore Citizens, PRs, and eligible LTVP/LTVP+ holders with valid LOC are permitted on the sitter onboarding checklist.
- **Single-App Portability**: Component state and services are cleanly decoupled from UI components so the production React Native or Flutter app can swap `mockServices.ts` for backend REST/GraphQL clients.

---

## Top 5 Next Steps for Production
1. **Backend & Auth Integration**: Build a Node/TypeScript API with PostgreSQL + encrypted PII storage, and integrate official Singpass OIDC/FAPI, MyInfo v4, and Singpass Sign via Corppass onboarding.
2. **Escrow Cashless Payments**: Connect HitPay or Stripe Singapore for dynamic PayNow QR and card pre-authorization, releasing sitter payouts after check-out.
3. **WhatsApp Business & Real-Time Updates**: Register Meta WhatsApp Business Cloud API templates for check-in, photo updates, and rebook nudges, backed by WebSockets/FCM push notifications.
4. **Insurance & Trust-and-Safety Ops**: Finalize commercial public liability & accident policy per booking, and connect the SOS button to a dedicated 24/7 Twilio/WhatsApp on-call escalation line.
5. **Closed Beta Liquidity Monitoring**: Instrument 24-hour confirmation SLAs in Punggol, Sengkang, and Tampines before unlocking adjacent estates (e.g., Pasir Ris, Hougang, Bishan).
