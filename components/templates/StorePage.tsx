import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AccountView, CartView, CheckoutView, CompareView, WishlistView, type Item } from "@/components/StoreViews";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { allProducts, displayName, mediaUrl, productPath } from "@/lib/products";

export const STORE_PAGES = { cart: "cart", checkout: "checkout", wishlist: "wishlist", compare: "compare", "my-account": "account" } as const;
type Kind = (typeof STORE_PAGES)[keyof typeof STORE_PAGES];

/** Cart, checkout, wishlist, compare and account: the lists live in the browser, so the views are client-side. */
export function StorePage({ lang, kind, path }: { lang: Locale; kind: Kind; path: string }) {
  const t = getDictionary(lang);
  const s = t.store;
  const items: Item[] = allProducts.map((p) => {
    const a = p.attributes;
    const rows: [string, string | undefined][] = [
      ["Carat", a.carat && `${a.carat} ct`], ["Shape", a.shape], ["Colour", a.color], ["Clarity", a.clarity], ["Cut", a.cut],
      ["Polish", a.polish], ["Symmetry", a.symmetry], ["Fluorescence", a.fluorescence], ["Lab", a.lab],
      ["Measurements", p.specs.Measurements && `${p.specs.Measurements.replace(/\s*X\s*/g, " × ")} mm`],
      ["Depth", p.specs["Depth %"] && `${p.specs["Depth %"]}%`], ["Table", p.specs["Table %"] && `${p.specs["Table %"]}%`],
    ];
    return {
      id: p.id,
      name: displayName(p),
      href: productPath(p, lang),
      image: p.image ? mediaUrl(p.image) : undefined,
      price: p.price ?? 0,
      inStock: p.in_stock,
      specs: rows.filter((r): r is [string, string] => Boolean(r[1])),
    };
  });
  const links = { shop: localePath(lang, "/shop/"), checkout: localePath(lang, "/checkout/"), contact: localePath(lang, "/contact-us/") };
  const title = { cart: s.cart, checkout: s.checkout, wishlist: s.wishlist, compare: s.compare, account: t.account.title }[kind];

  return (
    <section className="wrap pb-28 pt-32">
      <Breadcrumbs items={[{ label: t.product.breadcrumbHome, href: localePath(lang, "/") }, { label: title, href: path }]} />
      <h1 className="mt-8 text-4xl sm:text-5xl">{title}</h1>
      {kind === "cart" && <CartView items={items} t={s} links={links} />}
      {kind === "checkout" && <CheckoutView items={items} t={s} links={links} />}
      {kind === "wishlist" && <WishlistView items={items} t={s} links={links} />}
      {kind === "compare" && <CompareView items={items} t={s} links={links} />}
      {kind === "account" && <AccountView t={t.account} />}
    </section>
  );
}
