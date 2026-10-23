export const site = {
  name: "Sothis Diamonds",
  url: "https://sothisdiamonds.com",
  email: "info@sothisdiamonds.com",
  phones: ["+32 470 78 12 19"],
  // The WhatsApp chat (wa.me), digits only. ponytail: assumed to be the shop phone; confirm with the client.
  whatsapp: "32470781219",
  address: { street: "Hoveniersstraat 2 / Bus 210", postcode: "2018", city: "Antwerpen", country: "Belgium" },
  mapUrl: "https://maps.google.com/?q=Hoveniersstraat+2,+2018+Antwerpen",
  // The family business since 1970 (Bharat Brothers); Sothis Diamonds itself since 2018.
  founded: 1970,
  // TODO(client): opening hours aren't on the old site. Shown on the contact page once set.
  hours: null as string | null,
  // Prices are stored in USD (old site's base currency); EUR rate taken from the old currency switcher.
  // ponytail: fixed rate, switch to a live ECB rate before launch.
  eurPerUsd: 0.8665,
};

export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;
