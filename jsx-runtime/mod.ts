export * as JSX from "./jsx_types.ts";

export class JsxRuntimeError extends Error {
  constructor(...message: string[]) {
    super(message.join(" "));
  }
}

export function jsxTemplate(
  strings: string[],
  ...dynamic: string[]
) {
  const arr = [];

  for (let i = 0; i < dynamic.length; i++) {
    arr.push(strings[i]);
    arr.push(dynamic[i]);
  }
  arr.push(strings[strings.length - 1]);

  return arr.join("");
}

export function jsxAttr(name: string, value: unknown): string {
  if (value === null || value === undefined || value === false) {
    return "";
  }

  if (value === "function" || typeof value === "object") {
    throw new JsxRuntimeError(
      `Element was passed attribute "${name}"`,
      `containing a function/object (${value})`,
      "which is not allowed",
    );
  }

  if (value === true) {
    return name;
  }

  return `${name}=${value}`;
}

export function jsxEscape(value: unknown): string {
  if (value === null || value === undefined || typeof value === "boolean") {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(jsxEscape).join("");
  }

  if (typeof value === "function" || typeof value === "object") {
    throw new JsxRuntimeError(
      `Passed function/object (${value}) in JSX body`,
      "which is not allowed",
    );
  }

  return String(value);
}

export function jsx(
  type: (props?: Record<string, unknown>) => string,
  props: Record<string, unknown> | null,
  _key: string,
): string {
  return type(props ?? {});
}
