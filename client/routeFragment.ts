const fragmentHeaders = new Headers();
fragmentHeaders.append("Accept", "text/html");
fragmentHeaders.append("X-Fragment", "1");

async function fetchContent(src: string) {
  const res = await fetch(src, { method: "GET", headers: fragmentHeaders });

  const html = await res.text();

  // TODO: Error handling
  return html;
}

class RouteFragment extends HTMLElement {
  private readonly lazy: boolean;
  private readonly src: string;

  constructor() {
    super();

    this.lazy = this.getAttribute("lazy") !== null;

    const srcAttr = this.getAttribute("src");

    if (!srcAttr) {
      throw new Error("Missing required `src` field on fragment element");
    }

    this.src = srcAttr;
  }

  connectedCallback() {
    if (this.lazy) {
      fetchContent(this.src).then((html) => this.innerHTML = html);
    }
  }

  disconnectedCallback() {
  }

  // TODO: Add moved callback, so others don't fire each time the element is moved
}

customElements.define("route-fragment", RouteFragment);
