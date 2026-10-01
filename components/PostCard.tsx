import Image from "next/image";
import Link from "next/link";

export type PostSummary = { slug: string; href: string; title: string; excerpt: string; image?: string; date: string; minutes: string };

/** A blog post teaser. `large` is the featured post at the top of the index. */
export function PostCard({ post, lang, large = false }: { post: PostSummary; lang: string; large?: boolean }) {
  // The title is the link (so its text is the anchor); it stretches over the whole card.
  return (
    <article className={`group relative ${large ? "grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center" : ""}`}>
      <div className={`relative overflow-hidden bg-ivory-deep ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        {post.image && (
          <Image src={post.image} alt="" fill sizes={large ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"} className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        )}
      </div>
      <div className={large ? "" : "mt-5"}>
        <p className="text-sm text-platinum-2">
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" })}</time>
          <span className="ml-4">{post.minutes}</span>
        </p>
        <h3 className={`mt-2 group-hover:text-burgundy ${large ? "text-2xl sm:text-3xl" : "text-xl"}`}>
          <Link href={post.href} className="after:absolute after:inset-0">{post.title}</Link>
        </h3>
        {large && <p className="mt-4 max-w-lg text-platinum-2">{post.excerpt}</p>}
      </div>
    </article>
  );
}
