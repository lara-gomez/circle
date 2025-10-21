---
timestamp: 'Thu Oct 16 2025 23:29:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_232935.3ff09952.md]]'
content_id: 16910864161ba5b06a976432719678cd5160d6bcf9e1d651649b8890f4ab647d
---

# concept: UserInterest \[User, Item]

* **concept**: UserInterest \[User, Item]
* **purpose**: enable users to explicitly declare and manage their interests, both in general topics (tags) and in specific items, to personalize their experience and facilitate content discovery.
* **principle**: A user adds several personal interest tags (e.g., "science fiction", "cooking") and also marks specific items as interesting. They can remove these interests at any time. When they request recommendations, the system uses these stored interests to suggest relevant new items from a provided pool, prioritizing items they've explicitly liked and those matching their tags.
* **state**:
  * A set of `UserItemInterests` with
    * a `user` of type `User`
    * an `item` of type `Item`
  * A set of `UserPersonalInterests` with
    * a `user` of type `User`
    * a `tag` of type `String`
* **actions**:
  * `addPersonalInterest (user: User, tag: String): (personalInterest: {id: ID, user: User, tag: String})`
    * **requires**: `tag` is a non-empty `String`. There does not already exist a `UserPersonalInterest` associating the `user` to the given `tag`.
    * **effects**: Creates a `UserPersonalInterest` associating the `user` to the `tag`, and returns its ID along with the `user` and `tag`.
  * `removePersonalInterest (user: User, tag: String)`
    * **requires**: `tag` is a non-empty `String`. There exists a `UserPersonalInterest` associating the `user` to the given `tag`.
    * **effects**: Removes the `UserPersonalInterest` associating the `user` to the `tag`.
  * `addItemInterest (user: User, item: Item): (itemInterest: {id: ID, user: User, item: Item})`
    * **requires**: There does not already exist a `UserItemInterest` associating the `user` to the `item`.
    * **effects**: Creates a `UserItemInterest` associating the `user` to the `item`, and returns its ID along with the `user` and `item`.
  * `removeItemInterest (user: User, item: Item)`
    * **requires**: There exists a `UserItemInterest` associating the `user` to the given `item`.
    * **effects**: Removes the `UserItemInterest` associating the `user` to the `item`.
  * `recommendItems (user: User, candidateItems: Array<{id: Item, description: String, tags: String[], location?: String, time?: Date}>, filters?: {location?: String, timeRange?: {start: Date, end: Date}, requiredTags?: String[]}): (recommendedItems: Array<Item>)`
    * **requires**: The `user` must exist (i.e., we can retrieve their interests). `candidateItems` must be a non-empty array of objects, where each object has an `id` of type `Item`, a `description` (String), and `tags` (Array of String). `timeRange` filter, if provided, must have `start` and `end` dates where `start <= end`.
    * **effects**: Returns a ranked list of `Item` IDs from `candidateItems` that best match the `user`'s `UserPersonalInterests` (tags) and `UserItemInterests`, and satisfy all provided `filters`. Items explicitly declared in `UserItemInterests` are prioritized. Ranking considers tag overlap with `UserPersonalInterests` and keywords in `description`. The LLM-based prioritization is an implementation detail for how relevance is determined.
* **queries**:
  * `_getPersonalInterests (user: User): (personalInterest: {id: ID, user: User, tag: String})`
    * **requires**: The user exists.
    * **effects**: Returns a list of all personal interest tags for the given user.
  * `_getItemInterests (user: User): (itemInterest: {id: ID, user: User, item: Item})`
    * **requires**: The user exists.
    * **effects**: Returns a list of all item interests for the given user.

***
