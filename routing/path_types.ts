type Alpha =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
  | "_";

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Alnum = Alpha | Digit;

type RestAlnum<Remaining extends string> = Remaining extends "" ? true
  : Remaining extends `${infer First}${infer Rest}`
    ? First extends Alnum ? RestAlnum<Rest> : false
  : false;

type ValidName<Name extends string> = Name extends `${infer First}${infer Rest}`
  ? First extends Alpha ? RestAlnum<Rest> : false
  : false;

/** @internal */
type Split<Remaining extends string> = Remaining extends
  `${infer Head}/${infer Tail}` ? [Head, ...Split<Tail>]
  : [Remaining];

/** @internal */
type SegmentsOf<Path extends string> = Path extends "/" ? []
  : Path extends `/${infer Rest}` ? Split<Rest>
  : [];

type NameCheck<Name extends string, Seen extends string[]> = ValidName<
  Name
> extends true
  ? Name extends Seen[number] ? "Invalid route path: duplicate param name"
  : never
  : "Invalid route path: invalid param name";

type NonLastSegmentError<Segment extends string, Seen extends string[]> =
  Segment extends "" ? "Invalid route path: empty segments are not allowed"
    : Segment extends "*"
      ? "Invalid route path: catch-all must be named (:path*)"
    : Segment extends `:${string}?`
      ? "Invalid route path: optional and catch-all only allowed as the last segment"
    : Segment extends `:${string}*`
      ? "Invalid route path: optional and catch-all only allowed as the last segment"
    : Segment extends `:${infer Name}` ? NameCheck<Name, Seen>
    : never;

type LastSegmentError<Segment extends string, Seen extends string[]> =
  Segment extends "" ? "Invalid route path: empty segments are not allowed"
    : Segment extends "*"
      ? "Invalid route path: catch-all must be named (:path*)"
    : Segment extends `:${infer Name}?` ? NameCheck<Name, Seen>
    : Segment extends `:${infer Name}*` ? NameCheck<Name, Seen>
    : Segment extends `:${infer Name}` ? NameCheck<Name, Seen>
    : never;

type ParamName<Segment extends string> = Segment extends `:${infer Name}?`
  ? Name
  : Segment extends `:${infer Name}*` ? Name
  : Segment extends `:${infer Name}` ? Name
  : never;

type RememberParam<Segment extends string, Seen extends string[]> =
  ParamName<Segment> extends infer Name extends string ? [...Seen, Name] : Seen;

type ContinueWalk<
  Head extends string,
  Rest extends string[],
  Seen extends string[],
> = NonLastSegmentError<Head, Seen> extends infer Error
  ? [Error] extends [never] ? WalkSegments<Rest, RememberParam<Head, Seen>>
  : Error
  : never;

type WalkSegments<Segments extends string[], Seen extends string[] = []> =
  Segments extends [infer Head extends string, ...infer Rest extends string[]]
    ? Rest extends [] ? LastSegmentError<Head, Seen>
    : ContinueWalk<Head, Rest, Seen>
    : never;

/** @internal */
export type PathError<Path extends string> = Path extends "/" ? never
  : Path extends `/${infer Rest}`
    ? Rest extends `${string}/`
      ? "Invalid route path: no trailing slash except /"
    : WalkSegments<Split<Rest>>
  : "Invalid route path: path must start with /";

type EndsWithOptionalOrCatchall<Path extends string> = Path extends `${string}?`
  ? true
  : Path extends `${string}*` ? true
  : false;

/**
 * A group prefix: a valid path that does not end in optional or
 * catch-all. `""` and `"/"` are invalid; omit the argument for a
 * pathless group.
 *
 * @internal
 */
export type GroupPrefixError<Path extends string> = Path extends "" | "/"
  ? "Invalid group prefix: omit the argument for a pathless group"
  : PathError<Path> extends infer Error
    ? [Error] extends [never]
      ? EndsWithOptionalOrCatchall<Path> extends true
        ? "Invalid group prefix: optional and catch-all are not allowed"
      : never
    : Error
  : never;

/**
 * Join a group prefix and a child path. `""` and `"/"` add no segments;
 * a child of `"/"` is the prefix itself.
 */
/** @internal */
export type Join<Prefix extends string, Path extends string> = Prefix extends
  "" | "/" ? Path extends "" | "/" ? "/" : Path
  : Path extends "" | "/" ? Prefix
  : `${Prefix}${Path}`;

/** @internal */
type SegmentParams<Segment extends string> = Segment extends `:${infer Name}?`
  ? { [Key in Name]?: string }
  : Segment extends `:${infer Name}*` ? { [Key in Name]: string }
  : Segment extends `:${infer Name}` ? { [Key in Name]: string }
  : never;

/** @internal */
type Flatten<Params> = { [Key in keyof Params]: Params[Key] };

/** @internal */
type MergeParams<Segments extends string[]> = Segments extends
  [infer Head extends string, ...infer Rest extends string[]]
  ? SegmentParams<Head> extends infer HeadParams
    ? [HeadParams] extends [never] ? MergeParams<Rest>
    : Rest extends [] ? HeadParams
    : HeadParams & MergeParams<Rest>
  : never
  : Record<string, never>;

/** Params inferred from a path literal like `/posts/:id`. */
export type ParamsOf<Path extends string> = [PathError<Path>] extends [never]
  ? Flatten<MergeParams<SegmentsOf<Path>>>
  : never;
