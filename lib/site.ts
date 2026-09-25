export const site = {
  name: "Sothis Diamonds",
  url: "https://sothisdiamonds.com",
  email: "info@sothisdiamonds.com",
  phones: ["+32 470 78 12 19", "+32 477 41 85 68"],
  address: { street: "Hoveniersstraat 2 / Bus 210", postcode: "2018", city: "Antwerpen", country: "Belgium" },
  mapUrl: "https://maps.google.com/?q=Hoveniersstraat+2,+2018+Antwerpen",
  tawkId: "68e53f3be9dc6219554ac132/1j6vp97nq",
  // Prices are stored in USD (old site's base currency); EUR rate taken from the old currency switcher.
  // ponytail: fixed rate, switch to a live ECB rate before launch.
  eurPerUsd: 0.8665,
};

export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;
