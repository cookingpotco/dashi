import { navigate } from "dashi/client";

customElements.define(
  "dashi-go",
  class extends HTMLElement {
    connectedCallback() {
      this.addEventListener("click", () => {
        const href = this.getAttribute("href");
        if (href !== null) {
          void navigate(href);
        }
      });
    }
  },
);
