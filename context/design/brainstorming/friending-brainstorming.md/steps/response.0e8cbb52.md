---
timestamp: 'Thu Oct 16 2025 02:39:07 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_023907.bfb355b2.md]]'
content_id: 0e8cbb520da7b009a3d76fb3eb656cc3d4625fa15746db4f8fdde325f6a2bbe6
---

# response:

Yes, it is **necessary** to clarify that the two users given in every action are not the same, both in the concept specification (`requires` clauses) and often in the implementation.

Here's why:

1. **Clarity and Unambiguity in Specification:**
   * A concept specification aims to define the behavior precisely. If an action's logic is fundamentally about interaction *between two distinct entities*, then explicitly stating that `user` and `target` (or `requester` and `target`, `user` and `friend`) must not be the same removes any ambiguity.
   * Without this explicit `requires` clause, someone reading the specification might wonder if self-friending, self-requesting, or self-removing is a valid (though perhaps unusual) operation, or if it would be implicitly handled by other conditions. Being explicit leaves no room for doubt.
   * The rubric emphasizes `Completeness` and `State indexes components appropriately by object`. Self-referential relationships in a social graph (like a user friending themselves) are usually nonsensical in the problem domain and should be explicitly disallowed by the specification.

2. **Robustness and Error Handling in Implementation:**
   * While some actions might implicitly prevent `user === target` due to other preconditions (e.g., if `sendFriendRequest` explicitly disallows it, then `acceptFriendRequest` could never operate on a self-request), adding explicit checks at the start of each action in the implementation provides immediate, clear error feedback for edge cases.
   * For example, in `sendFriendRequest`, if a user passes their own ID for both `user` and `target`, an immediate check `if (user === target)` can return a specific error like "Cannot send a friend request to self." This is more user-friendly and diagnostic than, say, a "User already sent a request to target" error, which might happen if the internal logic attempts to process it.
   * Even if the database operations (like `$addToSet`) might technically handle adding the same ID multiple times gracefully (by not adding duplicates), the semantic intent of "friending" is generally between *different* individuals.

**Reviewing your `Friending` concept specification and implementation:**

* **Specification (`concept: Friending [User]`)**:
  * You have correctly included `"user and target are not the same"` (or similar) in the `requires` clauses for all actions: `sendFriendRequest`, `acceptFriendRequest`, `removeFriendRequest`, and `removeFriend`. This is excellent and aligns with best practices for concept specification.

* **Implementation (`file: src/friending/FriendingConcept.ts`)**:
  * You explicitly check `if (user === target)` in `sendFriendRequest`, which is the correct and most robust approach for that action.
  * For `acceptFriendRequest`, `removeFriendRequest`, and `removeFriend`, you don't have explicit `user === target` checks. This is acceptable because, given the `sendFriendRequest` action prevents self-requests, and the core nature of "friends" implying distinct entities, the other `requires` clauses (`requester has sent a friend request to target`, `user and friend are friends with each other`) already make self-interaction impossible or nonsensical within the defined flow. For instance, you can't accept a self-request if such a request could never be validly sent in the first place.

In conclusion, your current specification and implementation of the `Friending` concept correctly handle the constraint that users in these actions should generally be distinct. The explicit checks in the specification are vital for clarity, and your targeted explicit check in `sendFriendRequest` in the code provides robust error handling where it's most likely to be encountered as a distinct user input error.
