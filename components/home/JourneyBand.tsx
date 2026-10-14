import Link from "next/link";

/** The band a journey page opens with: the chosen half of the homepage choice, collapsed. */
export function JourneyBand({ side, title, line, instead, insteadHref }: {
  side: "buy" | "sell";
  title: string;
  line: string;
  instead: [string, string];
  insteadHref: string;
}) {
  return (
    <section className={`journey-band journey-band-${side} relative isolate flex flex-col justify-center overflow-hidden px-8 pb-24 pt-28 sm:px-12`}>
      <h1 className="font-display text-[clamp(3rem,7.5vw,6rem)] leading-none">{title}</h1>
      <p className="mt-4 max-w-sm text-ink/80">{line}</p>
      <p className="absolute bottom-8 left-8 right-8 text-sm text-ink/75 sm:left-12 sm:right-12">
        {instead[0]}{" "}
        <Link href={insteadHref} className="border-b border-white/70 pb-0.5 text-burgundy hover:border-burgundy">{instead[1]}</Link>
      </p>
    </section>
  );
}
