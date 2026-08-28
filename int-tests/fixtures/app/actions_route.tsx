import { fragment } from "dashi";

export function post() {
  return [
    fragment.append("/todos", <li>milk</li>),
    fragment.replace("/todo-count", <span>3</span>),
    fragment.refresh("/hits"),
    fragment.prepend("/todos", <li>bread</li>),
    fragment.before("/slot", <p>before</p>),
    fragment.after("/slot", <p>after</p>),
  ];
}
