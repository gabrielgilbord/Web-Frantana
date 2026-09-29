import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "/opt/cursor/artifacts/screenshots";
mkdirSync(OUT, { recursive: true });

const base = "http://127.0.0.1:3000";

async function shot(page, name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  console.log("saved", path);
  return path;
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  // Mobile 390
  {
    const context = await browser.newContext({
      ...devices["iPhone 13"],
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await shot(page, "qa_hero_mobile_390.png");

    const btn = page.locator('a[href="/musica"]').first();
    const styles = await btn.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        color: cs.color,
        bg: cs.backgroundColor,
        text: el.textContent?.trim(),
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
      };
    });
    console.log("mobile primary CTA", JSON.stringify(styles));

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    console.log("mobile horizontal overflow", overflow);

    for (const path of ["/musica", "/conciertos", "/galeria", "/contacto"]) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      await shot(page, `qa_${path.slice(1)}_mobile_390.png`);
    }
    await context.close();
  }

  // Mobile 375
  {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "qa_hero_mobile_375.png");
    await context.close();
  }

  // Tablet 768
  {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "qa_hero_tablet_768.png");
    await context.close();
  }

  // Desktop 1024
  {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 768 },
    });
    const page = await context.newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await shot(page, "qa_hero_desktop_1024.png");
    await context.close();
  }

  // Desktop 1440
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await shot(page, "qa_hero_desktop_1440.png");

    const btn = page.locator('a[href="/musica"]').first();
    const styles = await btn.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        color: cs.color,
        bg: cs.backgroundColor,
        text: el.textContent?.trim(),
      };
    });
    console.log("desktop primary CTA", JSON.stringify(styles));

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    console.log("desktop horizontal overflow", overflow);

    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.85));
    await page.waitForTimeout(500);
    await shot(page, "qa_home_section_desktop_1440.png");
    await context.close();
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
