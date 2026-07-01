/**
 * Maps category names to their corresponding SVG icon filenames
 * located in public/assets/icons/.
 *
 * Since the Category model has no `icon` field in the database,
 * this utility bridges the gap for the customer-facing UI.
 */

const CATEGORY_ICON_MAP: Record<string, string> = {
  Electronics: "mobile.svg",
  Accessories: "watch.svg",
  Gaming: "game.svg",
  "Home & Living": "lamp.svg",
  "Food & Beverage": "cake.svg",
  Computers: "monitor.svg",
  Audio: "airpods.svg",
  Wearables: "tag.svg",
}

/**
 * Returns the icon filename for a given category name.
 * Falls back to "box.svg" for unrecognized names.
 */
export function getCategoryIcon(categoryName: string): string {
  return CATEGORY_ICON_MAP[categoryName] ?? "box.svg"
}

export default CATEGORY_ICON_MAP
