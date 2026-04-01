# LeadFlow — Automation Guide

To achieve the "Continuous Loop" (Step 15) and "Daily Scheduled Jobs" (Step 1), you need an external trigger. Since LeadFlow is a React application, it cannot run by itself while the browser is closed.

## Option 1: GitHub Actions (Recommended)

You can create a GitHub Action that runs a script daily to trigger your scraping and enrichment flow.

### Step 1: Create a Scraper Script
Create a simple Node.js script in your repository that calls your Supabase Edge Functions or uses a tool like `apify-client` to start the runs.

### Step 2: GitHub Action Workflow
Create `.github/workflows/daily_scrape.yml`:

```yaml
name: Daily LeadFlow Scrape

on:
  schedule:
    - cron: '0 0 * * *' # Runs every day at midnight
  workflow_dispatch: # Allows manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Run Scraper
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          # Your script to trigger scraping
          node scripts/trigger_scrape.js
```

## Option 2: Supabase Edge Functions

You can write the scraping logic (calling Apify/LinkedIn) inside a Supabase Edge Function and use **Supabase Cron** (pg_cron) to trigger it.

1.  Move the logic from `apify.ts` and `linkedinScraper.ts` to a Supabase Edge Function.
2.  Enable the `pg_cron` extension in your Supabase database.
3.  Schedule the function:
    ```sql
    select
      cron.schedule(
        'daily-scrape',
        '0 0 * * *', -- Every day at midnight
        $$
        select
          net.http_post(
            url:='https://your-project.supabase.co/functions/v1/scrape-jobs',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
          ) as request_id;
        $$
      );
    ```

## Step 10: Automatic Follow-up logic

The system is now configured to automatically mark leads as `follow_up_required = true` when:
1.  A lead is marked as **Called**.
2.  An **Email exists** for that lead.
3.  **No email has been sent** yet.

This happens automatically during both individual and bulk status updates.
