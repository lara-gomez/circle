---
timestamp: 'Fri Nov 07 2025 14:46:58 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_144658.75145c4a.md]]'
content_id: ddb60249ccffc559b631f8750431e9e4382a12250707e6275744d75405356ab3
---

# prompt: fix this error: No overload matches this call. Overload 1 of 2, '(f: (...args: never\[]) => unknown\[], input: { session: symbol; }, output: Record\<string, symbol>): Frames<Frame>', gave the following error. Argument of type '({ session }: { session: ID; }) => Promise<{ user: ID; }\[] | \[{ error: string; }]>' is not assignable to parameter of type '(...args: never\[]) => unknown\[]'. Type 'Promise<{ user: ID; }\[] | \[{ error: string; }]>' is missing the following properties from type 'unknown\[]': length, pop, push, concat, and 35 more. Overload 2 of 2, '(f: ({ session }: { session: ID; }) => Promise<{ user: ID; }\[] | \[{ error: string; }]>, input: { session: symbol; }, output: Record\<string, symbol>): Promise\<Frames<Frame>>', gave the following error. Type 'string' is not assignable to type 'symbol'.deno-ts(2769)
