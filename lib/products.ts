import data from "@/export/data/products.json";

export type Product = {
  id: number;
  sku: string;
  slug: string;
  title: string;
  status: string;
  price: number | null;
  in_stock: boolean;
  categories: string[];
  attributes: Record<string, string>;
  specs: Record<string, string>;
  image: string | null;
  gallery: string[];
  video: string | null;
  created: string;
};

const products = (data as unknown as Product[]).filter((p) => p.status === "publish");

const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";
/** Old-site media path ("media/2025/09/x.png") -> URL. Local: /media/..., later a CDN via NEXT_PUBLIC_MEDIA_URL. */
export const mediaUrl = (path: string) => `${MEDIA_BASE}/${path}`;

export const productBySku = (sku: string) => {
  const product = products.find((p) => p.sku === sku);
  if (!product) throw new Error(`Product ${sku} not found in export/data/products.json`);
  return product;
};

export const newestProducts = (count: number) =>
  [...products].sort((a, b) => b.created.localeCompare(a.created)).slice(0, count);

/** "ASSCHER 7.79ct Fancy Vivid Yellow Even VVS1 Diamond" -> "Asscher 7.79 ct" (jewellery keeps its own title). */
export const displayName = (p: Product) =>
  p.attributes.shape && p.attributes.carat ? `${p.attributes.shape} ${p.attributes.carat} ct` : p.title;

/** Face-up size in mm from the report's measurements ("15.02 - 15.08 X 9.01" -> 15.05). */
export function diameterMm(p: Product) {
  const [a, b] = (p.specs.Measurements ?? "").match(/[\d.]+/g)?.map(Number) ?? [];
  if (!a) throw new Error(`No measurements for ${p.sku}`);
  return b ? (a + b) / 2 : a;
}

export const inStockDiamonds = () => products.filter((p) => p.in_stock && p.categories.includes("Diamonds"));

export const specKeys = ["color", "clarity", "cut", "lab"] as const;
export type SpecKey = (typeof specKeys)[number];

/** Grading-report rows for a card, in report order; missing values are skipped. */
export const keySpecs = (p: Product) =>
  specKeys.map((k) => [k, p.attributes[k]] as const).filter((row): row is [SpecKey, string] => Boolean(row[1]));
