---
timestamp: 'Thu Oct 16 2025 22:32:58 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_223258.06cf2ce5.md]]'
content_id: 6d4a5fe224ce9f5ad7346636d9b15a1a204dcd463a7a9dd2f8021ad22151cc6b
---

# concept: UserInterest

* **concept**: UserInterest \[User, Item]

* **purpose**: To enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience and facilitate content discovery.

* **principle**: If a user adds "Science Fiction" as a personal interest and also expresses interest in a specific "Book:123" item, then they can later retrieve both their general "Science Fiction" interest and their specific "Book:123" item interest. If they later remove "Science Fiction", it will no longer appear in their personal interests.

* **state**:
  * A set of `UserItemInterests` with
    * a `user` of type `User`
    * an `item` of type `Item`
  * A set of `UserPersonalInterests` with
    * a `user` of type `User`
    * a `tag` of type `String` (representing a keyword or topic)

* **actions**:
  * `addItemInterest (user: User, item: Item)`
    * **requires**: The user is not already interested in the item.
    * **effects**: Adds the specified `item` to the `user`'s `UserItemInterests`.
  * `removeItemInterest (user: User, item: Item)`
    * **requires**: The user is currently interested in the item.
    * **effects**: Removes the specified `item` from the `user`'s `UserItemInterests`.
  * `addPersonalInterest (user: User, tag: String)`
    * **requires**: The user does not already have this personal `tag` as an interest.
    * **effects**: Adds the specified `tag` to the `user`'s `UserPersonalInterests`.
  * `removePersonalInterest (user: User, tag: String)`
    * **requires**: The user currently has this personal `tag` as an interest.
    * **effects**: Removes the specified `tag` from the `user`'s `UserPersonalInterests`.

* **queries**:
  * `_getItemInterests (user: User): (item: Item)[]`
    * **requires**: `true`
    * **effects**: Returns an array of `Item` IDs that the `user` is interested in.
  * `_getPersonalInterests (user: User): (tag: String)[]`
    * **requires**: `true`
    * **effects**: Returns an array of `String` tags that the `user` has as personal interests.

***

### Explanation of Changes:

1. **Purpose**: Slightly rephrased for better need-focus.
2. **Principle**: Added a clear scenario demonstrating both types of interests and the add/remove lifecycle.
3. **State Redesign (Separation of Concerns)**:
   * Split the single `Interests` entity into `UserItemInterests` and `UserPersonalInterests`. This explicitly models the two distinct types of relationships.
   * `UserItemInterests` now focuses solely on `User` to `Item` relationships.
   * `UserPersonalInterests` now focuses solely on `User` to `String` (renamed to `tag`) relationships.
   * This eliminates ambiguity and adheres to the separation of concerns, making each state component clearer.
4. **Actions Redefined (Completeness and Correctness)**:
   * All actions now have appropriate input arguments (`user`, `item`, or `tag`).
   * All actions now have `requires` and `effects` clauses to specify their behavior precisely, including error conditions (e.g., preventing duplicate interests).
   * Returns are implicitly `Empty` as no explicit results are specified (except errors, if added for implementation).
5. **Queries Added**: Two queries (`_getItemInterests`, `_getPersonalInterests`) were added to retrieve the different types of interests for a user, fulfilling the "Completeness" criterion by allowing users (or other concepts via syncs) to read the state.
