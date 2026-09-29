export const SHOP_ENABLED =
  process.env.SHOP_ENABLED === "true" ||
  process.env.NEXT_PUBLIC_SHOP_ENABLED === "true";

export function assertShopHiddenInPublic() {
  return !SHOP_ENABLED;
}
