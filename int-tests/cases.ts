import {
  assertEquals,
  AssertionError,
  assertStringIncludes,
} from "@std/assert";
import { DOMParser } from "@b-fuze/deno-dom";
import { App, AppRequest, formatIntegrationFailure } from "./harness.ts";

export interface SelectExpect {
  selector: string;
  text?: string;
  attr?: Record<string, string>;
  exists?: boolean;
}

export interface IntegrationTestCase {
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

export async function runCase(
  app: App,
  testCase: IntegrationTestCase,
): Promise<void> {
  const res = await app.fetch(testCase.request);
  const body = await res.text();
  try {
    assertEquals(res.status, testCase.status);
    if (testCase.headers) {
      for (const [name, value] of Object.entries(testCase.headers)) {
        assertEquals(res.headers.get(name), value);
      }
    }
    if (testCase.bodyIncludes) {
      for (const snippet of testCase.bodyIncludes) {
        assertStringIncludes(body, snippet);
      }
    }
    if (testCase.bodyExcludes) {
      for (const snippet of testCase.bodyExcludes) {
        if (body.includes(snippet)) {
          throw new AssertionError(
            `body includes ${JSON.stringify(snippet)}`,
          );
        }
      }
    }
    const doc = parseHtml(body);
    if (testCase.select) {
      for (const expect of testCase.select) {
        const el = doc.querySelector(expect.selector);
        if (expect.exists === false) {
          if (el) {
            throw new AssertionError(
              `expected no element matching ${JSON.stringify(expect.selector)}`,
            );
          }
          continue;
        }
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
    const dump = formatIntegrationFailure(app, testCase.request, res, body);
    if (error instanceof Error) {
      error.message = `${error.message}\n\n${dump}`;
    }
    throw error;
  }
}
