import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { shouldForwardReview } from "./review_followup.ts";

describe("shouldForwardReview", () => {
  it("forwards a review with a summary", () => {
    assertEquals(
      shouldForwardReview("commented", "Found two issues.", []),
      true,
    );
  });

  it("forwards an empty review that introduces a top-level inline comment", () => {
    assertEquals(
      shouldForwardReview("commented", "", [{ in_reply_to_id: null }]),
      true,
    );
  });

  it("skips a bare approval", () => {
    assertEquals(shouldForwardReview("approved", "", []), false);
  });

  it("skips thread replies submitted as an empty review", () => {
    assertEquals(
      shouldForwardReview("commented", "", [{ in_reply_to_id: 123 }]),
      false,
    );
  });

  it("skips an empty commented review with no comments", () => {
    assertEquals(shouldForwardReview("commented", "", []), false);
  });
});
