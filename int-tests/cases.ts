import {
  assertEquals,
  AssertionError,
  assertStringIncludes,
} from "@std/assert";
import { DOMParser } from "@b-fuze/deno-dom";
import { App, AppRequest, formatHttpFailure } from "./harness.ts";

export interface SelectExpect {
  selector: string;
  text?: string;
  attr?: Record<string, string>;
}

export interface HttpCase {
  name: string;
  fixture?: string | URL;
  request: AppRequest;
  status: number;
  headers?: Record<string, string>;
  bodyIncludes?: string[];
  bodyExcludes?: string[];
  select?: SelectExpect[];
}

function parseHtml(body: string) {
  const doc = new DOMParser().parseFromString(body, "text/html");
  if (!doc) {
    throw new Error("failed to parse HTML");
  }
  return doc;
}

export async function runCase(app: App, httpCase: HttpCase): Promise<void> {
  const res = await app.fetch(httpCase.request);
  const body = await res.text();
  try {
    assertEquals(res.status, httpCase.status);
    if (httpCase.headers) {
      for (const [name, value] of Object.entries(httpCase.headers)) {
        assertEquals(res.headers.get(name), value);
      }
    }
    if (httpCase.bodyIncludes) {
      for (const snippet of httpCase.bodyIncludes) {
        assertStringIncludes(body, snippet);
      }
    }
    if (httpCase.bodyExcludes) {
      for (const snippet of httpCase.bodyExcludes) {
        if (body.includes(snippet)) {
          throw new AssertionError(
            `body includes ${JSON.stringify(snippet)}`,
          );
        }
      }
    }
    if (httpCase.select) {
      const doc = parseHtml(body);
      for (const expect of httpCase.select) {
        const el = doc.querySelector(expect.selector);
        if (!el) {
          throw new AssertionError(
            `no element matches ${JSON.stringify(expect.selector)}`,
          );
        }
        if (expect.text !== undefined) {
          assertEquals(el.textContent?.trim(), expect.text);
        }
        if (expect.attr) {
          for (const [name, value] of Object.entries(expect.attr)) {
            assertEquals(el.getAttribute(name), value);
          }
        }
      }
    }
  } catch (error) {
    const dump = formatHttpFailure(app, httpCase.request, res, body);
    if (error instanceof Error) {
      error.message = `${error.message}\n\n${dump}`;
    }
    throw error;
  }
}
