import { type Element, NavigationRoot } from "dashi";

export function NotFound(): Element {
  return (
    <html>
      <header id="persistent">persistent</header>
      <NavigationRoot>
        <p id="heading">not found</p>
      </NavigationRoot>
    </html>
  );
}

export function ErrorPage(): Element {
  return <p id="heading">error</p>;
}

export const errorFallback = (
  <html>
    <body>Something went wrong</body>
  </html>
);
