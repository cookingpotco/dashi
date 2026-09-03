import { cached, CacheStrategy } from "dashi";

export function Home() {
  return cached(
    <main>
      <h1>Hello</h1>
      <p>
        <a href="/posts/hello">A post</a>
      </p>
    </main>,
    { strategy: CacheStrategy.Public, maxAge: 60 },
  );
}
