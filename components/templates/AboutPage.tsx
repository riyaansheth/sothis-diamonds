import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { RevealHeading } from "@/components/Motion";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

const IMAGE = "/media/2025/10/334f201a-db9d-4582-9b3c-e9091242500c.png"; // featured image of the old about page

/** Facts from the old about page only. No team section: the old site names no one. */
export function AboutPage({ lang, crumbs }: { lang: Locale; crumbs: Crumb[] }) {
  const t = getDictionary(lang);
  const a = t.about;
  const year = (s: string) => s.replace("{founded}", String(site.founded));

  return (
    <>
      <section className="wrap grid gap-14 pb-24 pt-32 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-20">
        <div className="min-w-0">
          <Breadcrumbs items={crumbs} />
          <RevealHeading lines={[a.title]} as="h1" className="mt-8 text-[3rem] leading-none sm:text-6xl" />
          <p className="mt-6 max-w-md text-lg text-platinum-2">{a.line}</p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory-deep lg:aspect-square">
          <Image src={IMAGE} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section className="border-y border-line bg-ivory-deep">
        <div className="wrap grid gap-12 py-20 lg:grid-cols-[1fr_1.4fr] lg:py-28">
          <h2 className="text-4xl sm:text-5xl">{a.storyTitle}</h2>
          <div className="max-w-[62ch] space-y-5 text-lg">
            {a.story.map((p) => <p key={p}>{year(p)}</p>)}
          </div>
        </div>
      </section>

      <section className="wrap grid gap-10 py-20 sm:grid-cols-3">
        {a.numbers.map(([n, label]) => (
          <div key={label} className="border-t border-champagne pt-6">
            <p className="font-display text-6xl text-burgundy">{year(n)}</p>
            <p className="mt-3 max-w-[16rem] text-platinum-2">{label}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-line">
        <div className="wrap grid gap-16 py-24 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl sm:text-4xl">{a.valuesTitle}</h2>
            <dl className="mt-10 space-y-6">
              {a.values.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-lg font-semibold">{k}</dt>
                  <dd className="mt-1 text-platinum-2">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl">{a.processTitle}</h2>
            <ol className="mt-10 space-y-6">
              {a.process.map(([k, v], i) => (
                <li key={k} className="grid grid-cols-[2.5rem_1fr]">
                  <span className="font-display text-2xl text-champagne">{i + 1}</span>
                  <div>
                    <p className="text-lg font-semibold">{k}</p>
                    <p className="mt-1 text-platinum-2">{v}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* TODO(client): team photos and names, if the client wants them. Don't invent anyone. */}

      <section className="bg-wine text-on-accent">
        <div className="wrap grid gap-12 py-24 md:grid-cols-2">
          {[[a.missionTitle, a.mission], [a.visionTitle, a.vision]].map(([h, p]) => (
            <div key={h}>
              <h2 className="text-3xl">{h}</h2>
              <p className="mt-4 max-w-md text-lg opacity-85">{p}</p>
            </div>
          ))}
          <div className="md:col-span-2">
            <Link href={localePath(lang, "/sell-your-diamond/")} className="btn btn-inverse">{a.cta}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
