# Story 1.1: shift-handover-report

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Tenant Admin (Chủ quán),
I want to view and create shift handover reports with exact fixed columns (FNET, GCP, MOMO, Tiền mặt, Chi TM),
so that I can easily verify daily revenues, expenses, and staff handover amounts against the cash drawer.

## Acceptance Criteria

1. API Backend (NestJS): Provide an endpoint to create a new ShiftHandoverReport.
2. API Backend (NestJS): Provide an endpoint to fetch a list of reports with date and shift filters. Returning mapped data computing the "Calculated fields" (Sau chi, Chênh lệch, Tổng thực nhận) natively from the backend mapping, preventing UI logic bloat.
3. API Output Format: Must calculate `sauChi = cashRevenue - cashExpense`, `chenhLech = actualReceived - sauChi` and `tongThucNhan = fnetRevenue + gcpRevenue + momoRevenue + actualReceived`.
4. Database (Prisma): Reports are safely stored in the `ShiftHandoverReport` model.
5. Security: Enforce `tenant_id` context logging seamlessly.

## Tasks / Subtasks

- [x] Task 1: Setup DTOs and Validation (AC: 1, 2, 4)
  - [x] Implement `CreateShiftReportDto` with `class-validator` (Date, ShiftType Enum: SANG, TOI, DEM, Revenues, Expenses)
  - [x] Implement `FilterShiftReportDto`
- [x] Task 2: Create NestJS Service & Repository Layer (AC: 1, 2)
  - [x] Make `ShiftHandoverReportService` with `create()` handling Prisma insertion correctly
  - [x] Implement `findAll()` retrieving reports and mapping computed fields automatically
- [x] Task 3: Expose Controller Endpoints (AC: 1, 2)
  - [x] Expose `POST /api/admin-app/shift-reports`
  - [x] Expose `GET /api/admin-app/shift-reports`
- [ ] Task 4: API Testing/Validation (AC: 3)
  - [ ] Check if DTO validation catches invalid amounts
  - [ ] Check if the Service correctly formats output with 3 extra calculated rows

## Dev Notes

- **Database:** Prisma schema already updated with `ShiftHandoverReport` model. `npx prisma db push` has been synced safely. DO NOT modify `schema.prisma`.
- **Backend Architecture:** Placed under module `apps/api/src/app/admin-app/shift-handover-report`. Make sure to import this module inside `apps/api/src/app/admin-app/admin-app.module.ts`.

### Project Structure Notes

- Module: `apps/api/src/app/admin-app/shift-handover-report/shift-handover-report.module.ts`
- Controller: `apps/api/src/app/admin-app/shift-handover-report/shift-handover-report.controller.ts`
- Service: `apps/api/src/app/admin-app/shift-handover-report/shift-handover-report.service.ts`
- DTOs: `apps/api/src/app/admin-app/shift-handover-report/dto/create-shift-report.dto.ts`

### References

- Based on legacy UI code: `_old_monolith_temp/app/admin/reports/page.tsx`

## Dev Agent Record

### Agent Model Used

Antigravity

### Debug Log References

### Completion Notes List

### File List
