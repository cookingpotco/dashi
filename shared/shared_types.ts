import { type Element } from "../jsx-runtime/jsx_types.ts";

export type Handler<P = Record<string, never>> = (
  req: Request,
  params: P,
) => Element | Promise<Element>;

export type Layout = (
  req: Request,
  children: Element,
) => Element | Promise<Element>;

export type Middleware = (
  req: Request,
  next: () => Promise<Response>,
) => Response | Promise<Response>;
