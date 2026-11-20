# Shriya Clinic responsive audit

Audit updated on 20 November 2026. Verification used the local production build.

## Consolidated mobile controls

### Walk-in implementation correction

The actual form was embedded in StaffCheckInView with a 20px heading, repeated 12–16px spacing, and stacked Age and Gender rows below the 640px breakpoint. At 360px, its rendered panel was 727.19px tall. Utility padding on shared components also competed with page-level padding and later mobile overrides. The previous component-level tests did not record the panel's total height.

The form now uses WalkInTokenDialog. Age and Gender share a responsive row. A dedicated scrolling field region keeps the footer accessible on short screens. The existing reception state setters and confirmation handler are passed through. Labels use associated controls, and phone entry uses tel input semantics.

Another conflict appeared below 500px viewport height. The old short-screen rule applied flex positioning to grid-based dialog layers. That rule now targets only flex dialog layers. The walk-in layer defines its grid column explicitly.

At 360px, the measured panel is 328px wide and 608.5px tall. The heading is 16px. Fields are 44px, Cancel is 44px and the primary action is 48px. Both buttons use 14px labels. The triage choices remain equal-width at 360px. At 320px, the footer stacks and triage labels use 13px text to fit. With enlarged text, the selector can stack at its own container width.

| Measured at 360px | Before | After |
| --- | --- | --- |
| Panel width | 344px | 328px |
| Panel height | 727.19px | 608.5px |
| Heading | 20px | 16px |
| Triage label | 13px | 14px |
| Triage control height | 44px | 44px |
| Cancel height | 44px | 44px |
| Primary action height | 44px | 48px |
| Age and Gender | Separate rows | Shared row |

The strict walk-in checks passed 24 cases. Eighteen cover nine widths at standard and enlarged text sizes. Six cover 320, 360, 375, 390, 412 and 430px at a short 360px height, asserting both visible footer actions and a scrollable field region. All six requested phone widths also have separate screenshots and computed-style measurements. Native priority selection, keyboard focus and Escape dismissal were checked. The role suite passed 48 additional cases. The service-worker checks passed current-shell retrieval, offline fallback, static-asset caching, request bypass and scoped cache cleanup.

The service worker previously returned cached HTML before fetching the current shell. That could retain an older CSS/script build after deployment. Navigations now fetch current HTML first, with a cached offline fallback. Static hashed assets remain cached, and the worker only cleans up its own older clinic caches.

Exact implementation files changed in this correction

- `src/views/StaffCheckInView.tsx`
- `src/components/dental/WalkInTokenDialog.tsx`
- `src/components/dental/walk-in-token.css`
- `src/components/common/ClayButton.tsx`
- `src/components/common/ClayCard.tsx`
- `src/components/common/ClayInput.tsx`
- `src/components/common/ClaySelect.tsx`
- `src/components/common/priority-selector.css`
- `src/clinic-primitives.css`
- `src/index.css`
- `src/mobile-workspace.css`
- `src/daybook.css`
- `src/main.tsx`
- `public/sw.js`

Verification files changed are `scripts/triage-layout-qa.mjs` and `scripts/sw-cache-qa.mjs`. Computed sizes and screenshots for 320, 360, 375, 390, 412 and 430px are in `scratch/walkin-before` and `scratch/walkin-after`. The page checks for the shared-control implementation are in `scratch/source-fix-pages/results.json`.

The production build passed, along with 288 page-width checks and 120 interaction checks. Source comparison still reports 67 pre-existing TypeScript diagnostics and zero introduced diagnostics. The Vite bundle-size warning remains. Verification uses local browser emulation and isolated local records. Physical keyboards, live clinic transactions and the deployed site require separate verification.

- Replaced competing 26–32px fixed-height overrides with shared 44px touch controls, readable labels and wrapping action groups.
- Reused one native-radio priority selector in scheduled check-in, returning arrivals, walk-ins, directory token issuance and clinical token issuance.
- Shortened reception footer labels and preserved the existing state setters and submission handlers.
- Adjusted mobile clinical actions, account data rows, queue-panel spacing and the reminder preview.
- The walk-in selector passed 18 layout cases across nine widths with standard and enlarged text. Selection, label fit, button height and footer fit were checked.
- Current navigation tests use the existing search shortcut and the bottom Profile control.

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
| Production viewport suite | 288 checks passed with no detected page overflow or uncaught runtime exceptions |
| Widths | 320, 360, 375, 390, 412, 414, 430, 600, 768, 1024, 1280, 1440 CSS pixels |
| Doctor, receptionist and billing roles | 48 additional layout checks at 320, 768 and 1440 pixels passed, including navigation from the accounts desk to billing |
| Keyboard focus trap and Escape release | Passed |
| Production interaction suite | 120 assertions passed across 19 dialog workflows, short-screen/desktop variants, clinical/billing/calendar tabs and public menu navigation |
| Desktop/tablet regression | Production routes measured at 768, 1024, 1280 and 1440; representative screenshots reviewed |
| TypeScript baseline comparison | 67 existing diagnostics before and after; zero introduced |
| Screenshot regressions | The previous build failed 24 of 36 component-layout cases. The revised build passed all 36, including 320px with 125% root text size. These checks measure internal clipping, word breaks, OP numbers, tap-target heights and invoice contents. |
| Invoice print | The preview's print button opened the isolated print frame. The five treatment columns fit the printable A4 area under Chromium print emulation. |

Browser artifacts and machine-readable results:

- `scratch/unified-mobile-final/results.json` and screenshots of the current application at phone, tablet and desktop widths.
- `scratch/triage-review/results.json` and `walk-in-390.jpg` cover the specific triage regression.
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
node scripts/triage-layout-qa.mjs
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
