---
timestamp: 'Mon Oct 27 2025 22:19:44 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_221944.5fec10a8.md]]'
content_id: e38ddf1222a1e9c28c596b165abe118a33ef7f3769b4d8c28d024021d3148ef5
---

# file: deno.json

```json
{
  "imports": {
    "@concepts/": "./src/concepts/",
    "@google/generative-ai": "npm:@google/generative-ai@^0.24.1",
    "@utils/": "./src/utils/"
  },
  "tasks": {
    "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api"
  }
}

```
