import Image from "next/image";
import Link from "next/link";

export type PostSummary = { slug: string; href: string; title: string; excerpt: string; image?: string; date: string; minutes: string };

/** A blog post teaser. `large` is the featured post at the top of the index. */
export function PostCard({ post, lang, large = false }: { post: PostSummary; lang: string; large?: boolean }) {
  return (
    <Link href={post.href} className={`group block ${large ? "grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center" : ""}`}>
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
        <h3 className={`mt-2 group-hover:text-burgundy ${large ? "text-2xl sm:text-3xl" : "text-xl"}`}>{post.title}</h3>
        {large && <p className="mt-4 max-w-lg text-platinum-2">{post.excerpt}</p>}
      </div>
    </Link>
  );
}
