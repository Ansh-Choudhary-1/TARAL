# TARAL — Feature Audit (What Works, What's Faked)

> **Note (superseded in part):** this audit was taken at commit `b3932c1`. A
> follow-up pass has since removed the chatbot, replaced every fabricated
> stat/alert/trend with a data-derived value, fixed the double-submit order
> duplication, added a "unit not found" state for bad `/monitoring/:unitId`,
> clamped numeric inputs, added real empty states, and made the modal
> keyboard-dismissible. Items below marked ⚠️/❌ for those reasons are now
> mostly resolved; treat this file as the historical baseline. See the README's
> "Known limitations" for the current gap list.

Evidence-based, read-only verification pass. Every item was traced to the responsible
component/handler and checked for real Context + `localStorage` reads/writes vs. hardcoded
data or CSS-only "clickable" elements.

**Legend:** ✅ Real & working · ⚠️ Partially fake / broken edge case · ❌ Fully fake / dead

Verified against commit `b3932c1` (`main`). `npm run build`, `npm run lint`,
`npx tsc --noEmit` all pass.

---

## Auth & session

| Feature | Status | File:Line | What actually happens |
|---|---|---|---|
| Login validation blocks submit with visible errors | ⚠️ | `src/components/auth/Login.tsx:26,164,135,149` | Submit **is** blocked — button `disabled={!isValid}` and the Enter-key path also `return`s when invalid. But an empty form shows **no error text** and just a greyed button; errors only render after `submitted` is set (an Enter-key attempt) or, for email, once the field is non-empty. Clicking the disabled button gives zero feedback. |
| Returning with same email restores same profile | ✅ | `src/components/auth/Login.tsx:34-38` | `accounts[email]` lookup in `localStorage`; if found, `login(existing)` reuses the stored profile object verbatim. Not a fresh random user. |
| Same email + different "Login As" type | ⚠️ | `src/components/auth/Login.tsx:38-47` | `userData = existing ?? {…}` — when the account exists, the selected `userType` **and** the freshly typed name are **silently ignored**. You are logged in with the stored type. No error, no notice. |
| Logout doesn't wipe account data | ✅ | `src/contexts/UserContext.tsx:31-37` | `logout` only calls `remove(STORAGE_KEYS.user)`. Orders / products / fleet / monitoring / reports keys are untouched. |
| Refresh keeps you logged in | ✅ | `src/contexts/UserContext.tsx:24` | `useState(() => get(STORAGE_KEYS.user, null))` restores the session on mount. |

## Navigation & routing

| Feature | Status | File:Line | What actually happens |
|---|---|---|---|
| Sidebar links route correctly / label matches page header | ⚠️ | `src/components/layout/Sidebar.tsx:22-36` vs page `<h1>`s | Routing is correct — every link renders the right component. Label/header **consistency** slips: Admin nav "Orders" → page "Order Tracking"; Admin nav "Analytics" → page "ESG Reports & Analytics" (MSME nav calls the same routes "Order Tracking" / "ESG Reports"). Nav "Dashboard" → "Welcome back, …" (MSME) / "Fleet Command Center" (Admin). |
| `/monitoring/:unitId` with a **valid** ID | ✅ | `src/components/monitoring/MonitoringDashboard.tsx:40-50` | `find(u => u.id === selectedUnit)`; a `useEffect` syncs `selectedUnit` to the route param. TR-002/TR-003/TR-004 each render their own persisted data. |
| `/monitoring/:unitId` with a **bogus** ID | ⚠️ | `src/components/monitoring/MonitoringDashboard.tsx:47-50` | `find(...) ?? monitoringUnits[0]` → **silently renders TR-001**; header reads "Real-time monitoring of TR-001 - Pune Industrial Area" while the URL still says the bogus ID. No "not found", no crash. |
| Unknown routes redirect to `/` | ✅ | `src/App.tsx:62` | `<Route path="*" element={<Navigate to="/" />} />`. |
| Mobile sidebar toggle opens/closes + closes after navigating | ✅ | `src/App.tsx:32,39`; `src/components/layout/Sidebar.tsx:44-48,59,77` | Hamburger toggles `sidebarOpen`; overlay, X button, and every nav `<Link>` call `onClose`. (Unrelated nit: `<main class="lg:ml-64">` at `App.tsx:42` while the sidebar is `lg:static` → ~256 px empty gutter on desktop.) |

## Header

| Feature | Status | File:Line | What actually happens |
|---|---|---|---|
| Notification bell | ❌ | `src/components/layout/Header.tsx:69-72` | `<button>` with **no `onClick`**; the red dot (`:71`) is always rendered. Purely decorative and permanent. No `aria-label`. |
| Profile/user menu — open by click & keyboard | ⚠️ | `src/components/layout/Header.tsx:81,85` | Trigger `<button>` has **no `onClick`**; the menu is shown purely via CSS `group-hover:opacity-100 group-hover:visible`. **Mouse-hover only** — not keyboard-openable, unreliable on touch. This menu is the only route to Logout / Reset Demo Data. |
| Reset Demo Data reseeds everything; effect on logged-in user | ✅ | `src/components/layout/Header.tsx:20-23` → `src/contexts/DataContext.tsx:272-293` | Clears `RESETTABLE_KEYS`, re-seeds orders/products/fuelData/fleet/monitoring/reports, empties inquiries/quotes/creditTrades. Does **not** touch `user` or `accounts` → you stay logged in as the same account. Toast shown. |
| Logout button | ✅ | `src/components/layout/Header.tsx:94-100` | Calls `onLogout` → `user = null` → `AppContent` renders `<Login />`. |

## Dashboard — MSME

| Feature | Status | File:Line | What actually happens |
|---|---|---|---|
| Metric cards computed live | ⚠️ | `src/components/dashboards/MSMEDashboard.tsx:28-67` | "Monthly Fuel Savings", "CO₂ Reduced", "Carbon Credits Earned" are all `computeEsg(myOrders)` (memoized, live). **"Clean Fuel Stars" value is static** (`user?.cleanFuelStars ?? 12`, `:62`). Also "Monthly Fuel Savings" only counts current-calendar-month orders, so it reads ₹0 until you place one this month (seed orders are 2025-dated). |
| "Recent Orders" reflects real orders | ✅ | `src/components/dashboards/MSMEDashboard.tsx:33-36` | `[...myOrders].sort().slice(0,3)` from the shared collection. (MSME view always also includes the 3 `SEED_OWNER` demo orders.) |
| "Compare Fuels" / "Visit Marketplace" navigate | ✅ | `src/components/dashboards/MSMEDashboard.tsx:194-205` | `navigate('/fuel-comparison')` / `navigate('/marketplace')`. |
| "New TARAL Unit Available" alert | ❌ (static, acceptable) | `src/components/dashboards/MSMEDashboard.tsx:211-223` | Hardcoded copy; never reflects real state. |

## Dashboard — Admin

| Feature | Status | File:Line | What actually happens |
|---|---|---|---|
| Metric cards live-derived | ⚠️ | `src/components/dashboards/AdminDashboard.tsx:26-66` | The **values** are real (`useMemo` over `fleetUnits` + `orders` + `computeEsg`). The green "+8% / +22%" delta chips (`:48,:62`) are **hardcoded fake**. The "Orders Today" quick-action card (`:212`) shows the **all-time** order count under a "Today" label. "Active MSMEs 1,247 / +89 this month" (`:203-204`) is **hardcoded**. |
| Every button on this screen has a working handler | ✅ (this screen) | `src/components/dashboards/AdminDashboard.tsx:152,197,207,217` | "Monitor →" and all three gradient cards call `navigate(...)`. The dead buttons on this page come from the shared **Header** (bell + profile trigger). |

## Fuel Comparison

| Feature | Status | File:Line | What actually happens |
|---|---|---|---|
| Industry / current-fuel / consumption recalculates | ✅ | `src/components/fuel/FuelComparison.tsx:31-44` | All three are React state; the table and calculator read them on every render. |
| **0 or negative** monthly consumption | ⚠️ | `src/components/fuel/FuelComparison.tsx:118` | `parseInt(e.target.value) || 0` — no clamp, no `min` attribute. `0` → all figures ₹0 (harmless). **Negative → inverted "savings" and negative CO₂ figures are shown as if real** (misleading but finite; no `NaN`/`Infinity`). Not blocked, not clamped. |
| Non-numeric consumption | ✅ (no crash) | `src/components/fuel/FuelComparison.tsx:118` | `<input type="number">` blocks most input; anything through → `parseInt` `NaN` → `|| 0` → 0. |
| "Order {fuel} Now" creates a real order with correct fuel + qty | ✅ (caveat) | `src/components/fuel/FuelComparison.tsx:46-55` → `src/contexts/DataContext.tsx:159-193` | Creates a real order (correct fuel name, `quantity = monthlyConsumption`), appears in Order Tracking. Caveat: if consumption ≤ 0, `addOrder` clamps to 1 MT (`DataContext.tsx:162`) but the toast still says "…0 MT" / "…-50 MT". |

## Marketplace

| Feature | Status | File:Line | What actually happens |
|---|---|---|---|
| Filter dropdown filters the grid | ✅ | `src/components/marketplace/Marketplace.tsx:47-63` | `products.filter(p => p.name.toLowerCase().includes(selectedFilter))`, memoized. |
| Sort dropdown reorders the grid | ✅ | `src/components/marketplace/Marketplace.tsx:51-62` | price / rating / delivery comparators. |
| "Order Now" → real order + stock decrement + persisted | ✅ (single click) | `src/components/marketplace/Marketplace.tsx:81-104` → `src/contexts/DataContext.tsx:159-193` | Creates the order, `setProducts(... inStock: Math.max(0, inStock - qty))`, persists. New stock shows on the card and survives refresh. |
| Ordering more than `inStock` is blocked with a message | ✅ | `src/components/marketplace/Marketplace.tsx:88-91` | `if (quantity > product.inStock)` → error toast "Only X MT of … in stock", returns. |
| Rapid / double-click "Order Now" (Confirm) | ⚠️ **bug** | `src/contexts/DataContext.tsx:166`; `src/components/marketplace/Marketplace.tsx:81-104` | `addOrder` derives the sequence number from the **closure `orders`** array. Two fast "Confirm Order" clicks before re-render both compute `seq = N+1` → **two orders with the same `ORD-YYYY-001` id** (React duplicate-key warning) and **stock decremented twice**. No submit guard / button disable. |
| "Sold Out" state | ✅ | `src/components/marketplace/Marketplace.tsx:250-257` | Button `disabled={product.inStock <= 0}` and label switches to "Sold Out". |
| "Get Quote" produces a real, viewable quote | ✅ | `src/components/marketplace/Marketplace.tsx:70-74,106-119` | Modal → computes `price × qty` → `addQuote(...)` persists to the `quotes` collection → result shown inline + toast. (Minor: qty ≤ 0 silently coerced to 1, `:109`. No dedicated "my quotes" screen.) |
| "Contact Sales Team" / "Request Custom Quote" save a real inquiry | ✅ | `src/components/marketplace/Marketplace.tsx:76-79,121-129` | Modal (name / company / message) → validates name + message → `addInquiry(...)` persists to the `inquiries` collection + confirmation toast. (No UI to read inquiries back.) |
| Zero-match filter → empty state | ❌ | `src/components/marketplace/Marketplace.tsx:183-184` | `sortedProducts.map` with no empty guard → **blank grid**. (Current filter values always match ≥1 product, so rarely reached, but the empty state is absent.) |
| "24 Active Units / 1,250 MT/Month / 4.7/5 Rating" block | ❌ (hardcoded) | `src/components/marketplace/Marketplace.tsx:304,311,318` | Static JSX copy — not derived from fleet or product data. |

## Order Tracking

| Feature | Status | File:Line | What actually happens |
|---|---|---|---|
| List reflects the shared Orders collection | ✅ | `src/components/orders/OrderTracking.tsx:57,62-68` | `useData().orders`, scoped by user type / email + `SEED_OWNER`. |
| Status-change / cancel / mark-received mutate + persist | ✅ | `src/components/orders/OrderTracking.tsx:75-78,160-184` → `DataContext setOrderStatus` | Persists the new status and rebuilds `trackingSteps`. (Cancel has no confirmation — one click + toast.) |
| Tracking timeline reflects real status | ✅ | `src/components/orders/OrderTracking.tsx:194-216` + `DataContext.buildTrackingSteps` | Processing → 2 steps, In Transit → 4, Delivered → 5, Cancelled → frozen. |
| Empty state at zero orders | ⚠️ | `src/components/orders/OrderTracking.tsx:118-122` | Filter-empty case shows a plain text line ("No orders match this filter yet.") — no icon / CTA. The "brand-new account = 0 orders" scenario is **unreachable**: every view always includes the 3 `SEED_OWNER` seed orders, and Reset Demo Data restores them. |

## ESG Reports

| Feature | Status | File:Line | What actually happens |
|---|---|---|---|
| All figures derived from real order history | ✅ | `src/components/reports/ESGReports.tsx:50-57` | `computeEsg(scopedOrders)`, memoized on `orders`. ("Waste Reduction" +8% chip at `:84` is a hardcoded label beside a derived value.) |
| Placing a new order changes figures without a refresh | ✅ | context-driven | `orders` live in Context → ESGReports re-renders with new numbers immediately. |
| "Generate report" / "trade credits" persist something checkable | ✅ (caveats) | `src/components/reports/ESGReports.tsx:90-101,125-137` | `addReport` → new row in "Available Reports" instantly + persisted. `addCreditTrade` → persisted to `creditTrades` (never displayed back). `downloadReport` (`:103-123`) builds a CSV Blob and calls `link.click()` **without appending the anchor to the DOM** → works in Chrome, can silently no-op in Firefox. |

## Fleet Management (Admin)

| Feature | Status | File:Line | What actually happens |
|---|---|---|---|
| Unit list backed by the real Fleet collection | ✅ | `src/components/fleet/FleetManagement.tsx:38` | `useData().fleetUnits`. |
| Status-toggle persists across refresh | ✅ | `src/components/fleet/FleetManagement.tsx:84-106` → `updateFleetUnit` | Writes to `localStorage`; survives refresh. (There is no add / edit — only the status toggle.) |
| Previously-dead button now wired | ✅ | `src/components/fleet/FleetManagement.tsx:268-277` | Was "Remote Control Panel" (dead). Now "Pause for Maintenance" / "Bring Unit Online" → `toggleUnitStatus` (persists status + sensor fields + toast). |
| Empty state if fleet list is empty | ⚠️ | `src/components/fleet/FleetManagement.tsx:157,210` | `fleetUnits.map` has no empty guard; `{selectedUnitData && …}` hides the detail panel → blank list area if ever empty. Unreachable in practice (seeded + reset re-seeds). Also: unit rows are `onClick` `<div>`s (`:158-163`), **not keyboard-focusable**, and the "System Alerts" block (`:288-308`) is hardcoded — it goes **stale/wrong** after you toggle TR-001/TR-003. |

## Monitoring Dashboard (Admin)

| Feature | Status | File:Line | What actually happens |
|---|---|---|---|
| Unit selector backed by the real Monitoring collection | ✅ | `src/components/monitoring/MonitoringDashboard.tsx:37,181` | `useData().monitoringUnits`. |
| Switching units changes the displayed data | ✅ | `src/components/monitoring/MonitoringDashboard.tsx:47-67` | `unit` re-derived from `selectedUnit`; `draft` / `live` resync on unit change; metrics + logs read from `unit`. |
| The two previously-dead buttons now wired | ✅ (4 wired) | `src/components/monitoring/MonitoringDashboard.tsx:338,351,358,365` | Apply Settings → `applySettings` (persists `controlSettings` + log). Optimize Settings → `optimizeSettings` (persists efficiency/CO₂ + log). Emergency Stop → `emergencyStop` (persists Offline state + log). Generate Report → `generateReport` → `addReport` + log. All four persist and toast. |
| Simulated sensor values are clearly cosmetic & isolated | ✅ | `src/components/monitoring/MonitoringDashboard.tsx:69-79` | `setInterval` mutates **local `live` state only** (temp/pressure jitter). Never persisted, never read by `computeEsg` (which uses `orders` exclusively). Persisted `unit.co2Emission` etc. change only via explicit button actions. |

## Cross-cutting

| Check | Status | Evidence | Notes |
|---|---|---|---|
| `console.log` / `console.debug` / `debugger` in `src/` | ✅ none | `grep -rn` clean | — |
| Hardcoded arrays duplicating `seedData.ts` | ✅ data migrated / ⚠️ decorative remains | — | All real collections (orders, products, fuelData, fleetUnits, monitoringUnits, reports) are in `seedData.ts` + `DataContext`. Still hardcoded in components: UI-config arrays (`filters`, `industries`, `statusFilters`, `reportTypes`, `periods` — correct to keep local) **and decorative content**: `fuelRecommendations` (`MSMEDashboard.tsx:18`), `regionalDemand` (`AdminDashboard.tsx:16`), `complianceStatus` (`ESGReports.tsx:32`), plus static "System Alerts" and the marketplace stat block. |
| `<button>` with no `onClick` and not a form submit | ⚠️ 3 found | — | `Header.tsx:69` (notification bell — dead), `Header.tsx:81` (profile-menu trigger — CSS `group-hover` only), `App.tsx:78` ("Start Chat" in the Ask TARAL widget — intentionally inert). |
| Ask TARAL chatbot still intentionally inert | ✅ | `src/App.tsx:68-82` | Static markup, no handler, no OpenAI import in `App.tsx`. Not half-wired. |
| `npm run build` | ✅ pass | — | Clean. |
| `npm run lint` | ✅ pass | — | 0 problems. |
| `npx tsc --noEmit` | ✅ pass | — | 0 errors. |

---

## Summary

- **Total checklist items:** ~54
- **✅ Real & working:** ~34
- **⚠️ Partially fake / broken edge case:** ~12
- **❌ Fully fake / dead:** ~4 (notification bell; MSME "New TARAL Unit" alert; Marketplace zero-filter empty state; Marketplace "24 Units / 1,250 MT / 4.7★" block) — plus decorative-but-hardcoded content noted inline (regional demand, compliance list, system-alert blocks, fuel-recommendation list).

The core data layer is genuinely real: orders, marketplace stock, fleet status, monitoring
state, reports, quotes and inquiries all read/write through Context + `localStorage` and
survive refresh. The gaps are (a) a real double-submit data bug, (b) keyboard/hover
accessibility on the header menu, (c) unguarded edge cases (bogus unit ID, negative
consumption), and (d) leftover decorative/hardcoded flourishes and thin empty states.

### Top 5 to fix first

1. **Double-click "Confirm Order" creates duplicate orders + double-decrements stock** — `src/contexts/DataContext.tsx:166`. Generate the order id inside the `setOrders` updater from `prev` (with a uniqueness guard), and disable the confirm button while a submit is in flight.
2. **Header profile menu is hover-only + notification bell is dead** — `src/components/layout/Header.tsx:69,81,85`. The profile menu is the only path to Logout / Reset Demo Data and can't be opened by keyboard or reliably by touch. Convert to a click-toggle with `aria-expanded` / outside-click / Esc; give the bell a real action or remove it.
3. **Bogus `/monitoring/:unitId` silently shows TR-001** — `src/components/monitoring/MonitoringDashboard.tsx:47`. Detect `unitId && !found` and render an explicit "Unit not found" state with a back link.
4. **FuelComparison accepts negative consumption and shows negative "savings"/CO₂ as real** — `src/components/fuel/FuelComparison.tsx:118`. Clamp to `>= 0` (and add `min={0}`); block "Order … Now" when the value is `< 1` with a clear message.
5. **Login silently ignores a changed "Login As" for a known email, and hides empty-field errors** — `src/components/auth/Login.tsx:38,135`. Either honour the new selection or tell the user "this email is registered as an MSME/Admin account"; surface the required-field errors instead of only greying the button.

**Runners-up:** missing / thin empty states (Marketplace zero-filter, Order Tracking icon+CTA, Fleet); hardcoded "System Alerts" in Fleet & Admin that go stale after toggles; fake "+8% / +22%" delta chips next to real numbers; Firefox `downloadReport` no-op; `main`'s `lg:ml-64` double-gutter on desktop; sidebar-label vs page-header inconsistencies (Admin "Orders" / "Analytics").
