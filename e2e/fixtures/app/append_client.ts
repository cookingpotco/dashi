customElements.define(
  "append-el",
  class extends HTMLElement {
    connectedCallback() {
      this.textContent = "append-upgraded";
    }
  },
);
