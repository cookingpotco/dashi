import { fragment } from "dashi";

export function post() {
  return [
    fragment.append("/todos", <li>milk</li>),
    fragment.replace("/todo-count", <span>3</span>),
  ];
}
