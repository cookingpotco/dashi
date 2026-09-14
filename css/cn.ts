import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class strings with conflict resolution.
 *
 * @param classes Class strings and falsy values to omit.
 * @see https://dashi.run/docs/styling#cn
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return twMerge(...classes);
}
