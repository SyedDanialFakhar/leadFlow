# LeadFlow — Alignment & Automation Plan

This plan outlines the steps to fully align the existing system with the requested end-to-end automation flow, specifically focusing on the targeting logic, follow-up triggers, and the "continuous loop" requirement.

## User Review Required

> [!IMPORTANT]
> **Free Tier Limits**: While the system can run for "free" using external API free tiers (Apify, Apollo, Hunter, Resend), these have strict monthly limits (e.g., 50 Apollo credits, 25 Hunter searches). Daily automated scraping of multiple cities/roles will likely exhaust these credits in 1-2 days.

> [!NOTE]
> **Scheduling**: As this is a client-side React app, "Daily Scheduled Jobs" require an external trigger (like a GitHub Action or a simple CRON job hitting a webhook) because the browser cannot run code while closed.

## Proposed Changes

### [Enrichment & Targeting]
Align the targeting rules and enrichment logic with the specific user requirements.

#### [MODIFY] [contactPicker.ts](file:///d:/Downloads/leadflow-miner-main/leadflow-miner-main/src/utils/contactPicker.ts)
- Update [getRecommendedContactRole](file:///d:/Downloads/leadflow-miner-main/leadflow-miner-main/src/utils/contactPicker.ts#1-11) to exactly match the requested brackets:
  - < 30: CEO / Director
  - 30-100: Sales Manager / GM
  - 100-300: HR / People & Culture
  - 300-500: People & Culture ONLY

#### [MODIFY] [useEnrichment.ts](file:///d:/Downloads/leadflow-miner-main/leadflow-miner-main/src/hooks/useEnrichment.ts)
- Add "Reporting to X" logic to the enrichment search query.

### [Leads & Follow-up]
Implement automatic status progression and follow-up flags.

#### [MODIFY] [leadsService.ts](file:///d:/Downloads/leadflow-miner-main/leadflow-miner-main/src/services/leadsService.ts)
- Add logic to automatically set `follow_up_required = true` when a lead status is updated to `called` (if an email exists and hasn't been sent).

### [Automation & Scheduling]
Provide a mechanism for daily triggers.

#### [NEW] [automation-guide.md](file:///d:/Downloads/leadflow-miner-main/leadflow-miner-main/automation-guide.md)
- Provide instructions on how to set up a GitHub Action to trigger the scraping process via a Supabase Edge Function or similar.

## Verification Plan

### Automated Tests
- Run `vitest` on `contactPicker.test.ts` (to be created) to verify role selection logic.
- Mock Supabase calls to verify `follow_up_required` flag logic.

### Manual Verification
- Run a scraper for "Melbourne" + "BDM" and verify "Results Preview" displays correctly.
- Enrich a lead and verify the target role matches the employee count bracket.
- Mark a lead as "called" and verify `follow_up_required` flips to `true`.
