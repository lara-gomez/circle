---
timestamp: 'Fri Nov 07 2025 14:48:37 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_144837.dcb958a2.md]]'
content_id: 0ef5f0f9f8382e9002d9837d8fd2040afadb075a86cc93ac73a2c62137673ba9
---

# prompt: fix this error: No overload matches this call. Overload 1 of 2, '(f: (...args: never\[]) => unknown\[], input: { session: symbol; }, output: Record\<string, symbol>): Frames', gave the following error. Argument of type '({ session }: { session: ID; }) => Promise<{ user: ID; }\[] | \[{ error: string; }]>' is not assignable to parameter of type '(...args: never\[]) => unknown\[]'. Type 'Promise<{ user: ID; }\[] | \[{ error: string; }]>' is missing the following properties from type 'unknown\[]': length, pop, push, concat, and 35 more. Overload 2 of 2, '(f: ({ session }: { session: ID; }) => Promise<{ user: ID; }\[] | \[{ error: string; }]>, input: { session: symbol; }, output: Record\<string, symbol>): Promise<Frames>', gave the following error. Type 'string' is not assignable to type 'symbol'.deno-ts(2769)
