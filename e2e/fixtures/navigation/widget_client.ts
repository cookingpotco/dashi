customElements.define(
  "widget-el",
  class extends HTMLElement {
    connectedCallback() {
      this.textContent = "widget-upgraded";
    }
  },
);
