import { JSX } from "../mod.ts";

export interface Route {
  render?: () => JSX.Element | Promise<JSX.Element>;
}
