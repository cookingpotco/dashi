import { NavigationRoot, type ReadArgs } from "dashi";

export function NavOnly({ html }: ReadArgs) {
  return html(
    <NavigationRoot>
      <p id="nav-only">no form</p>
    </NavigationRoot>,
  );
}
