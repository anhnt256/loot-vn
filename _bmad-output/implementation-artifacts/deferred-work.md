# Deferred Work — Menu Campaign System (Phase 4)

Deferred from: `spec-menu-campaign-backend-core.md` (2026-04-08)

## Spec 2: Campaign Engine + Budget Tracking + Order Integration
- Campaign evaluation engine (8-step algorithm at checkout)
- Redis budget tracking (atomic INCRBY, sync to DB)
- Hook into `order.service.ts` createOrder flow
- Order cancel rollback (budget + usage counters)

## Spec 3: Real-time + Admin UI
- WebSocket gateway (`menu-campaign.gateway.ts`) for budget updates
- Admin campaign management page (CRUD + status control)
- Campaign analytics dashboard (real-time budget tracking)

## Spec 4: Client UI + A/B Testing + Analytics
- Budget progress bar on client-app (gamification)
- Campaign badges/banners on menu items
- A/B test user assignment + comparison analytics
- `MenuCampaignAnalytics` scheduled aggregation job

## Review Findings Deferred (pre-existing patterns)
- Race condition on `_schemaReady` concurrent first-requests — same pattern as promotion-reward service. Consider Promise latch pattern across all services.
- `parseInt(id, 10)` NaN guard missing across all controllers — project-wide fix needed
- `ALTER TABLE` catch blocks swallow all errors, not just "column exists" — same in promotion-reward
- N+1 queries in getAll (4 child queries per campaign) — optimize with batch IN queries later
- Child table queries in getById don't have tenant_id filter — low risk since parent query validates tenant
