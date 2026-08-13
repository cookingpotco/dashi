import { assertEquals } from "@std/assert";
import { shouldForwardReview } from "./review_followup.ts";

Deno.test("shouldForwardReview forwards a review that has a summary", () => {
  assertEquals(
    shouldForwardReview("commented", "Found two issues.", []),
    true,
  );
});

Deno.test("shouldForwardReview forwards an empty review that introduces a top-level inline comment", () => {
  assertEquals(
    shouldForwardReview("commented", "", [{ in_reply_to_id: null }]),
    true,
  );
});

Deno.test("shouldForwardReview skips a bare approval", () => {
  assertEquals(shouldForwardReview("approved", "", []), false);
});

Deno.test("shouldForwardReview skips thread replies submitted as an empty review", () => {
  assertEquals(
    shouldForwardReview("commented", "", [{ in_reply_to_id: 123 }]),
    false,
  );
});

Deno.test("shouldForwardReview skips an empty commented review with no comments", () => {
  assertEquals(shouldForwardReview("commented", "", []), false);
});
