import { test, expect } from "@playwright/test";

test.describe("Navegación pública", () => {
  test("home muestra brand FRANTANA y CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "FRANTANA" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Escuchar" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Conciertos" }).first()).toBeVisible();
  });

  test("rutas públicas principales responden", async ({ page }) => {
    for (const path of ["/sobre", "/musica", "/conciertos", "/galeria", "/contacto"]) {
      const res = await page.goto(path);
      expect(res?.ok()).toBeTruthy();
    }
  });

  test("tienda pública permanece oculta", async ({ page }) => {
    const res = await page.goto("/tienda");
    expect(page.url()).not.toContain("/tienda");
    // middleware redirects home
    await expect(page.getByRole("heading", { name: "FRANTANA" })).toBeVisible();
    expect(res?.status()).toBeLessThan(400);

    await page.goto("/");
    await expect(page.getByRole("navigation").getByText("Tienda")).toHaveCount(0);
  });

  test("admin no se enlaza en nav pública", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header").getByRole("link", { name: "Admin" })).toHaveCount(0);
  });
});

test.describe("Autorización admin", () => {
  test("API conciertos exige auth", async ({ request }) => {
    const res = await request.get("/api/concerts");
    expect(res.status()).toBe(401);
  });

  test("login y CRUD concierto", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("admin@frantana.es");
    await page.getByLabel("Contraseña").fill("changeme-frantana-admin");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();

    await page.goto("/admin/conciertos");
    const title = `E2E Concierto ${Date.now()}`;
    await page.getByLabel("Título").fill(title);
    await page.getByLabel("Fecha (YYYY-MM-DD)").fill("2099-12-01");
    await page.getByLabel("Ciudad").fill("Madrid");
    await page.getByLabel("Recinto").fill("Sala Test");
    await page.getByLabel("Publicado").check();
    await page.getByRole("button", { name: "Crear" }).click();
    await expect(page.getByText(title)).toBeVisible();

    await page.goto("/conciertos");
    await expect(page.getByText(title)).toBeVisible();
  });
});
