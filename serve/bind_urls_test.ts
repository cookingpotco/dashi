import { assertEquals } from "@std/assert";
import { bindUrls } from "./bind_urls.ts";

const MIXED = [
  { family: "IPv4", address: "127.0.0.1" },
  { family: "IPv6", address: "fe80::1" },
  { family: "IPv4", address: "169.254.10.2" },
  { family: "IPv4", address: "192.168.1.20" },
  { family: "IPv4", address: "10.0.0.5" },
  { family: "IPv4", address: "192.168.1.20" },
  { family: "IPv6", address: "2001:db8::1" },
  { family: "IPv4", address: "127.0.0.2" },
];

Deno.test("all-interfaces lists localhost then unique non-loopback IPv4", () => {
  assertEquals(bindUrls("0.0.0.0", 8000, MIXED), [
    "http://localhost:8000",
    "http://192.168.1.20:8000",
    "http://10.0.0.5:8000",
  ]);
  assertEquals(bindUrls("::", 3000, MIXED), [
    "http://localhost:3000",
    "http://192.168.1.20:3000",
    "http://10.0.0.5:3000",
  ]);
});

Deno.test("specific hostname lists that host only", () => {
  assertEquals(bindUrls("127.0.0.1", 8000, MIXED), [
    "http://127.0.0.1:8000",
  ]);
  assertEquals(bindUrls("example.test", 8080, MIXED), [
    "http://example.test:8080",
  ]);
});

Deno.test("all-interfaces with no usable addresses lists localhost only", () => {
  assertEquals(bindUrls("0.0.0.0", 8000, []), [
    "http://localhost:8000",
  ]);
});
