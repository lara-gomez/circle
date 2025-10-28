---
timestamp: 'Mon Oct 27 2025 02:12:22 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_021222.f8a32b0b.md]]'
content_id: d6c3c690eec5b03819ac2c41c17f9379ef883816345493c3a922a04e2c1978ac
---

# file: src/utils/types.ts

```typescript
// Re-exporting Empty and ID if they are in this file already.
export type Empty = Record<PropertyKey, never>;
export type ID = string & { __brand: "ID" }; // Type branding for generic IDs

/**
 * Interface for a Language Model (LLM) service.
 * This abstracts the specific LLM implementation (e.g., Gemini, OpenAI).
 */
export interface LLM {
  executeLLM(prompt: string): Promise<string>;
}
```
