import { DashiFragmentAttributes } from "dashi/jsx-runtime";

interface FragmentProps extends DashiFragmentAttributes {
  /**
   * Identifier used to replace/update/affect the fragment
   */
  id: string;
  /**
   * Fragment will be fetched from this location when appearing on the page,
   * useful for separating caching lifetimes and dynamic data.
   *
   * Passing `children` will add a pending UI appearing until the
   * actual fragment is loaded.
   */
  src?: string;
}
// TODO: can do a url string type?

function Fragment({ id, src, children, ...rest }: FragmentProps) {
  // TODO: Can we use custom html tags? (I think yes, but is it a good idea...) web components?
  if (src) {
    return (
      <dashi-fragment id={id} src={src} {...rest}>
        {children}
      </dashi-fragment>
    );
  }
  return (
    <dashi-fragment id={id} {...rest}>
      {children}
    </dashi-fragment>
  );
}

export default Fragment;
