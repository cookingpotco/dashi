import { patch } from "dashi";

export function post() {
  return [
    patch.append("#todos", <li>milk</li>),
    patch.replace("/todo-count", <span>3</span>),
    patch.replace("#status", <p>Saved</p>),
    patch.refresh("/hits"),
    patch.prepend("/todos", <li>bread</li>),
    patch.before("/slot", <p>before</p>),
    patch.after("/slot", <p>after</p>),
  ];
}
