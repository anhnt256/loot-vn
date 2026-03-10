/**
 * Script to auto-generate WorkShiftRevenueReport for January 2026
 * Run with: npx ts-node --project tsconfig.json scripts/generate-revenue-report-jan.ts
 * Or: npx tsx scripts/generate-revenue-report-jan.ts
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const DELAY_MS = 10000; // 30 seconds delay between API calls
const BRANCHES = ["TAN_PHU"];

// January 2026: 1 to 31
const YEAR = 2026;
const MONTH = 1;
const DAYS_IN_MONTH = 31;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

async function generateReport(date: string, branch: string): Promise<void> {
  console.log(`\n[${new Date().toLocaleTimeString()}] Generating report for ${date} - ${branch}...`);

  try {
    const response = await fetch(`${BASE_URL}/api/work-shift-revenue-report/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, branch }),
    });

    const data = await response.json();

    if (data.success) {
      console.log(`  ✓ Success: ${data.summary?.inserted || 0} inserted, ${data.summary?.updated || 0} updated, ${data.summary?.skipped || 0} skipped`);
      if (data.summary?.withErrors > 0) {
        console.log(`  ⚠ ${data.summary.withErrors} shifts had errors`);
        data.results?.forEach((r: { workShiftName: string; errors?: string[] }) => {
          if (r.errors?.length) {
            console.log(`    - ${r.workShiftName}: ${r.errors.join(", ")}`);
          }
        });
      }
    } else {
      console.log(`  ✗ Failed: ${data.error}`);
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("WorkShiftRevenueReport Generator - January 2026");
  console.log("=".repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Branches: ${BRANCHES.join(", ")}`);
  console.log(`Date range: ${formatDate(YEAR, MONTH, 1)} to ${formatDate(YEAR, MONTH, DAYS_IN_MONTH)}`);
  console.log(`Delay between calls: ${DELAY_MS / 1000}s`);
  console.log("=".repeat(60));

  const totalCalls = DAYS_IN_MONTH * BRANCHES.length;
  let callCount = 0;

  for (let day = 8; day <= DAYS_IN_MONTH; day++) {
    const date = formatDate(YEAR, MONTH, day);

    for (const branch of BRANCHES) {
      callCount++;
      console.log(`\n[${callCount}/${totalCalls}] Processing...`);

      await generateReport(date, branch);

      // Don't wait after the last call
      if (callCount < totalCalls) {
        console.log(`  Waiting ${DELAY_MS / 1000}s before next call...`);
        await delay(DELAY_MS);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Completed all reports!");
  console.log("=".repeat(60));
}

main().catch(console.error);
