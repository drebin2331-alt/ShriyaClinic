# Shriya Clinic responsive audit

Audit date: 19 November 2026. Changes apply to the local repository; no deployment was performed.

## Scope and inventory

- 17 view files audited, including the legacy `AdminDashboard` retained in source.
- The audit covered 32 existing common and dental component files.
- The responsive and visual redesign together changed all 17 view files and 26 existing component files. New components provide the clinic mark, appointment calendar, shared dialog behavior, workspace controls, patient roster card and invoice preview.
- The application has two pathname entry points (`/` and `/admin`) and state-based navigation. Route aliases in `App.tsx` continue to resolve to their existing views.

| View | Coverage / changes |
| --- | --- |
| LandingPage | Header breakpoints, consultation dialog, image/detail overlays, shared touch controls |
| BookingWizard | Existing responsive forms retained; shared controls and shell verified |
| LiveQueueView | Existing grids retained; shared cards, buttons and shell verified |
| AdminSignInPage | Entry page measured at every target width |
| MobileAppDashboard | Role-specific daybook with desktop navigation, current queue, upcoming visits, collections, and a mobile tools sheet |
| AdminDashboard | Legacy source audit, labeled table presentation; not mounted by current route map |
| AppointmentManagement | Week and month navigation, day selection, scheduled appointments from clinic records, booking details and list view |
| PatientManagementView | Directory cards, labeled desktop table fallback, page frame |
| PatientProfileView | Clinical tabs, tables, notes, lab orders, token and prescription dialogs |
| PatientPortal | All seven customer view states, labeled data tables, payment/receipt overlays |
| StaffCheckInView | Check-in lists, arrival/forms dialogs, labeled tables |
| TokenControlView | Queue layout and confirmation dialog |
| BillingPaymentView | Invoice/payment tables, new-bill form, payment and preview dialogs |
| StaffUserManagementView | Labeled account cards, account forms, delete confirmation |
| ReportsView | Labeled doctor statistics, report preview and responsive frame |
| WhatsAppReminderView | Responsive page frame and shared controls |
| ReceptionTVView | Wrapping header/actions, fluid token number, mobile panel padding |

Detailed component inventory is recorded in `scratch/responsive-source-inventory.json`.

## Issue checklist

- [x] Public desktop navigation competed for space at tablet widths. Full navigation now begins at the larger desktop breakpoint; the compact menu remains available below it.
- [x] Staff hamburger changed a desktop-only sidebar on phones. It now opens a scrollable, role-specific drawer and closes after navigation.
- [x] Header backdrop filtering constrained fixed dialogs to header bounds. All 38 existing overlay instances now use a document-level portal; the new staff drawer uses the same component.
- [x] Dialogs had inconsistent height, scroll locking and keyboard behavior. Shared handling limits height to the visible viewport, traps Tab focus, restores focus, and supports Escape dismissal.
- [x] Nested overlays could release background scrolling prematurely. Scroll locks are reference-counted.
- [x] Very short screens squeezed form bodies between pinned headers and footers. Below 500px visible height, the whole panel scrolls.
- [x] Dense tables were difficult to read on phones. Fifteen tables now support labeled stacked rows while retaining their data and actions. Existing purpose-built patient/invoice mobile cards remain in place.
- [x] Desktop table cells broke emails and amounts into fragments. Desktop tables retain readable cell values with scrolling confined to their own containers where necessary.
- [x] Flex/grid intrinsic sizing and page-wide clipping masked overflow. Shared minimum sizing and responsive frames address layout sizing; page-wide horizontal hiding was removed.
- [x] Buttons and fields were too small for touch. Mobile buttons/fields have a 44px minimum height; labeled icon buttons also receive a minimum width. Shared action buttons can wrap.
- [x] Input/select labels were not associated with controls. Shared controls now have stable IDs, linked labels and linked validation messages; mobile fields use 16px text.
- [x] Toasts could extend past a small viewport and overlap navigation. They use inset positioning above the mobile dock and a live region.
- [x] Horizontal tab/filter buttons could shrink and clip. Buttons retain their width within intentional scrolling strips.
- [x] Prescription allergy content became unreadably narrow. The banner stacks and wraps on phones.
- [x] Consultation concern labels and booking summaries were truncated. These now wrap; the booking cancel button retains its width.
- [x] TV display was sized only for large screens. Header/actions wrap, the token size is fluid, and panel padding adapts.
- [x] Dental chart requires its spatial arrangement. It remains an intentional horizontal scrolling region with a keyboard focus target and descriptive label.
- [x] All view modules loaded in the initial JavaScript bundle. Routed views are now lazy-loaded without adding a dependency.
- [x] Reduced-motion preferences and visible keyboard focus have shared styling.

Brand colors, fonts, artwork, existing features, data schemas, API contracts and authorization were preserved. No new application data was introduced.

## Verification

The browser suites use isolated Chrome profiles and the application's local records. The billing-role check uses a local test identity because this role has no built-in demo account. The suites block clinic API requests and exercise the interface without sending medical, payment, account or messaging transactions.

| Check | Result |
| --- | --- |
| Production build (`npm run build`) | Passed |
| Production viewport suite | 264 checks; no detected page overflow or uncaught runtime exceptions |
| Widths | 320, 360, 375, 390, 414, 430, 600, 768, 1024, 1280, 1440 CSS pixels |
| Doctor, receptionist and billing roles | 48 additional layout checks at 320, 768 and 1440 pixels passed, including navigation from the accounts desk to billing |
| Keyboard focus trap and Escape release | Passed |
| Production interaction suite | 116 assertions passed: 18 dialog workflows, short-screen/desktop variants, clinical/billing/calendar tabs and public menu navigation |
| Desktop/tablet regression | Production routes measured at 768, 1024, 1280 and 1440; representative screenshots reviewed |
| TypeScript baseline comparison | 67 existing diagnostics before and after; zero introduced |
| Screenshot regressions | The previous build failed 24 of 36 component-layout cases. The revised build passed all 36, including 320px with 125% root text size. These checks measure internal clipping, word breaks, OP numbers, tap-target heights and invoice contents. |
| Invoice print | The preview's print button opened the isolated print frame. The five treatment columns fit the printable A4 area under Chromium print emulation. |

Browser artifacts and machine-readable results:

- `scratch/handset-pages/results.json` and screenshots of the redesigned application at phone, tablet and desktop widths.
- `scratch/handset-before/results.json` and `scratch/handset-review/results.json` record the before and after measurements. The review directory includes phone screenshots of the appointment book, patient cards and invoice.
- `scratch/responsive-interactions/summary.json`, detailed results and dialog screenshots.
- `scratch/responsive-roles/results.json`.
- `scratch/responsive-typecheck.json`.

Reproduce with a production preview running at `http://127.0.0.1:4173`:

```powershell
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
# In another terminal:
$env:QA_URL='http://127.0.0.1:4173'
node scripts/responsive-qa.mjs
node scripts/mobile-layout-qa.mjs
node scripts/responsive-interactions.mjs
node scripts/responsive-roles.mjs
```

The browser utilities currently use the repository's installed design skill CDP helper and an installed Chrome/Edge browser. `QA_OUT` changes the viewport artifact directory.

## Remaining limitations

- `npm run lint` is not clean: 67 pre-existing TypeScript diagnostics remain, including server visit models, seed-data types and clinical types. They were checked against the original Git source and were not caused by this change.
- Vite still reports a large shared bundle warning. View splitting reduced the main JavaScript from about 1,590kB to 785kB uncompressed; further shared-library splitting is outside this responsive pass.
- Device verification used Chromium viewport emulation. Physical iOS/Android keyboard, screen-reader and printer behavior was not certified.
- Customer view states were exercised with the available guest/local state. A live authenticated patient account and remote transactional workflows were not verified.
- The deployed URL could not be accessed by the web tool. Production testing used the locally built application; the live deployment has not been updated.
