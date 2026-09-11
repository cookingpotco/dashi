import type { ReadArgs } from "dashi";

export function Home({ html }: ReadArgs) {
  return html(
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-20 py-20">
        <div className="flex w-full max-w-166 flex-col items-center gap-4 text-center">
          <p className="rotate-1 rounded-button border-2 border-black bg-yellow px-3 py-1 font-mono text-button uppercase shadow-regular">
            $DASHI_APP_NAME
          </p>
          <h1 className="flex flex-nowrap items-end justify-center gap-3.75 text-title-compact md:text-title">
            <span>Welcome to</span>
            <span className="relative inline-block">
              <span className="absolute bottom-2 left-0 h-3 w-39 -rotate-1 bg-blue" />
              <span className="relative">dashi</span>
            </span>
          </h1>
          <p className="text-body text-body-text">
            Your new app is running. Edit{" "}
            <span className="font-mono font-normal text-error">
              `home/mod.tsx`
            </span>{" "}
            and this page updates on save.
          </p>
        </div>
        <a
          href="https://dashi.run/docs"
          className="inline-flex cursor-pointer items-center justify-center rounded-button border-2 border-black bg-pink px-2 py-1 font-mono text-button uppercase no-underline shadow-regular outline-none transition duration-150 ease-out focus:outline-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          read the docs
        </a>
      </main>
      <footer className="flex items-center justify-center gap-2 px-4 py-4">
        <img
          src="/static/logo-icon-transp.png"
          alt=""
          width={42}
          height={32}
          className="h-8 w-10.5"
        />
        <p className="text-body-smallest">
          Built with dashi ·{" "}
          <a href="https://dashi.run" className="text-inherit no-underline">
            dashi.run
          </a>
        </p>
      </footer>
    </div>,
  );
}
