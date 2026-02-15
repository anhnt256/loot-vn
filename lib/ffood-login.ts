import { chromium } from "playwright";

const TOKEN_KEYS = ["token", "authToken", "access_token", "accessToken"];

export type FfoodLoginResult = { token: string; expired: Date } | null;

/**
 * Login to ffood via Playwright using ffoodUrl, username, password.
 * Tries common form selectors and extracts token from localStorage or cookies.
 */
export async function loginAndGetToken(
  ffoodUrl: string,
  username: string,
  password: string,
  options?: { timeout?: number; headless?: boolean; keepOpen?: boolean }
): Promise<FfoodLoginResult> {
  const timeout = options?.timeout ?? 30_000;
  // Always headless when deployed (no UI); allow headed only in development
  const headless = process.env.NODE_ENV === "production" ? true : (options?.headless ?? true);
  const keepOpen = options?.keepOpen ?? false;

  const browser = await chromium.launch({ headless });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(ffoodUrl, { waitUntil: "domcontentloaded", timeout });

    // Click "Đăng nhập với FFOOD ID" button (Ant Design primary submit button)
    const ffoodIdBtn = page.getByRole("button", { name: "Đăng nhập với FFOOD ID" });
    await ffoodIdBtn.click({ timeout });

    // Wait for redirect then for page to finish loading (Keycloak login page)
    await page.waitForURL(/.*/, { waitUntil: "commit", timeout }).catch(() => {});
    await page.waitForLoadState("load", { timeout });
    await page.waitForLoadState("networkidle", { timeout }).catch(() => {});

    // Keycloak form: fill email -> username, password -> password, click Sign In
    await page.waitForSelector("#username", { state: "visible", timeout });
    await page.locator("#username").fill(username);
    await page.locator("#password").fill(password);
    await page.locator("#kc-login").click();

    // Wait for post-login redirect and load
    await page.waitForLoadState("load", { timeout });
    await page.waitForLoadState("networkidle", { timeout }).catch(() => {});

    // Extract token from localStorage then cookies
    const tokenFromStorage = await page.evaluate((keys: string[]) => {
      for (const k of keys) {
        try {
          const v = localStorage.getItem(k);
          if (v && typeof v === "string" && v.length > 0) return v;
        } catch {}
      }
      return null;
    }, TOKEN_KEYS);

    if (tokenFromStorage) {
      const expired = new Date(Date.now() + 24 * 60 * 60 * 1000);
      return { token: tokenFromStorage, expired };
    }

    const cookies = await context.cookies();
    const authCookie = cookies.find(
      (c) =>
        /token|auth|access/i.test(c.name) && c.value && c.value.length > 0
    );
    if (authCookie?.value) {
      const expired = authCookie.expires === -1 ? new Date(Date.now() + 24 * 60 * 60 * 1000) : new Date(authCookie.expires * 1000);
      return { token: authCookie.value, expired };
    }

    console.error("Ffood login: no token found in localStorage or cookies");
    return null;
  } finally {
    if (!keepOpen) await browser.close();
  }
}
