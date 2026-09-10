import type { ErrorArgs, FatalArgs, NotFoundArgs } from "dashi";
import styles from "./styles.json" with { type: "json" };

function ErrorWell({ code, message }: { code: string; message: string }) {
  return (
    <main className="mx-auto flex w-full max-w-main flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <p className="font-mono text-status-compact lg:text-status">{code}</p>
      <p className="text-body-small text-body-text lg:text-body">{message}</p>
      <a
        href="/"
        className="inline-flex cursor-pointer items-center justify-center rounded-button border-2 border-black bg-pink px-2 py-1 font-mono text-button uppercase no-underline shadow-regular outline-none transition duration-150 ease-out focus:outline-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        go home
      </a>
    </main>
  );
}

export function notFound({ html }: NotFoundArgs) {
  return html(<ErrorWell code="404" message="That page isn't here." />, {
    status: 404,
  });
}

export function error({ html }: ErrorArgs) {
  return html(<ErrorWell code="500" message="Something went wrong." />);
}

export function fatal({ html }: FatalArgs) {
  return html(
    <html lang="en">
      <head>
        <title>500 — Dashi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link
          rel="icon"
          href="/static/favicon.ico"
          type="image/x-icon"
        />
        <link rel="stylesheet" href={styles.href} />
      </head>
      <body className="flex min-h-screen flex-col">
        <ErrorWell code="500" message="Something went wrong." />
      </body>
    </html>,
  );
}
