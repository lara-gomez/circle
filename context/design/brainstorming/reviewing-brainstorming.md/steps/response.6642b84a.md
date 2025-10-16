---
timestamp: 'Thu Oct 16 2025 01:18:03 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_011803.f1e9217d.md]]'
content_id: 6642b84a011ce5a3ff2674c932a6ea5b98742d956d70dcef6a101ec107a2017f
---

# response:

Yes, the `Reviewing` concept's implementation, `ReviewingConcept.ts`, **does abide** by the rule regarding composite objects in action arguments and results.

Let's break down the rule and how the implementation adheres to it:

**Rule:** "Composite objects. Make sure that all of the arguments and results of your actions are either primitive values (strings, numbers, etc) or object identifiers (actually document identifiers in MongoDB). Composite objects should be used only inside concept implementations and never exposed."

**Analysis of `ReviewingConcept.ts` Actions:**

1. **`addReview` action:**
   * **Arguments:** `{ user: User; item: Item; rating: number; entry: string }`
     * `user` and `item` are `ID` (which is a branded string, acting as an object identifier).
     * `rating` is `number` (primitive).
     * `entry` is `string` (primitive).
     * All arguments are primitive values or object identifiers. **Pass.**
   * **Results:** `Promise<{ review: Review } | { error: string }>`
     * `review` is `Review` (an `ID`, object identifier).
     * `error` is `string` (primitive).
     * All results are primitive values or object identifiers. **Pass.**

2. **`removeReview` action:**
   * **Arguments:** `{ user: User; item: Item }`
     * `user` and `item` are `ID` (object identifiers).
     * All arguments are object identifiers. **Pass.**
   * **Results:** `Promise<Empty | { error: string }>`
     * `Empty` is an empty record, representing successful completion without a specific return value (effectively primitive/no composite object).
     * `error` is `string` (primitive).
     * All results are primitive values or object identifiers. **Pass.**

3. **`modifyReview` action:**
   * **Arguments:** `{ user: User; item: Item; rating: number; entry: string }`
     * `user` and `item` are `ID` (object identifiers).
     * `rating` is `number` (primitive).
     * `entry` is `string` (primitive).
     * All arguments are primitive values or object identifiers. **Pass.**
   * **Results:** `Promise<{ review: Review } | { error: string }>`
     * `review` is `Review` (an `ID`, object identifier).
     * `error` is `string` (primitive).
     * All results are primitive values or object identifiers. **Pass.**

**Important Note on Queries:**
The assignment explicitly makes an exception for queries: "Note also that a query, unlike an action, can return a nested dictionary."
The `ReviewingConcept`'s queries (e.g., `_getReviewsByItem`, `_getReviewsByUser`) correctly leverage this by returning `Array<{ review: ReviewOutput }>`, where `ReviewOutput` is a structured object. This is **allowed** for queries and does not violate the rule for actions.

In summary, the implementation correctly restricts the input and output of its **actions** to primitive values and object identifiers, keeping composite objects internal or reserving them for queries as per the assignment's guidelines.
