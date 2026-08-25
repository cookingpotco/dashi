import { type Element, RouteNavigation } from "dashi";

export function NotFound(): Element {
  return (
    <html>
      <header id="chrome">chrome</header>
      <RouteNavigation>
        <p id="heading">not found</p>
      </RouteNavigation>
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
