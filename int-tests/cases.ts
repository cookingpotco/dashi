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
  html?: {
    bodyIncludes?: string[];
    bodyExcludes?: string[];
    select?: SelectExpect[];
  };
  json?: {
    equals?: unknown;
    contains?: Record<string, unknown>;
  };
}

function parseHtml(body: string) {
  const doc = new DOMParser().parseFromString(body, "text/html");
  if (!doc) {
    throw new Error("failed to parse HTML");
  }
  return doc;
}

function assertHeader(
  res: Response,
  name: string,
  expected: string,
  origin: string,
): void {
  const actual = res.headers.get(name);
  if (actual === expected) {
    return;
  }
  if (name.toLowerCase() === "location") {
    const absolute = new URL(expected, origin).href;
    if (actual === absolute || actual?.endsWith(expected)) {
      return;
    }
  }
  assertEquals(actual, expected);
}

function assertBodySnippets(
  body: string,
  includes?: string[],
  excludes?: string[],
): void {
  if (includes) {
    for (const snippet of includes) {
      assertStringIncludes(body, snippet);
    }
  }
  if (excludes) {
    for (const snippet of excludes) {
      if (body.includes(snippet)) {
        throw new AssertionError(
          `body includes ${JSON.stringify(snippet)}`,
        );
      }
    }
  }
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
        assertHeader(res, name, value, app.origin);
      }
    }
    if (!testCase.html && !testCase.json) {
      assertBodySnippets(body, testCase.bodyIncludes, testCase.bodyExcludes);
    }
    if (testCase.html) {
      assertBodySnippets(
        body,
        testCase.html.bodyIncludes,
        testCase.html.bodyExcludes,
      );
      if (testCase.html.select) {
        const doc = parseHtml(body);
        for (const expect of testCase.html.select) {
          const el = doc.querySelector(expect.selector);
          if (expect.exists === false) {
            if (el) {
              throw new AssertionError(
                `expected no element matching ${
                  JSON.stringify(expect.selector)
                }`,
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
    }
    if (testCase.json) {
      const parsed = JSON.parse(body);
      if (testCase.json.equals !== undefined) {
        assertEquals(parsed, testCase.json.equals);
      }
      if (testCase.json.contains) {
        for (const [key, value] of Object.entries(testCase.json.contains)) {
          assertEquals(parsed[key], value);
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
