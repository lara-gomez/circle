---
timestamp: 'Mon Oct 27 2025 01:34:43 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_013443.b1485a1d.md]]'
content_id: d79f2cc0cb8be493a1181fb914131ba2fc7c5d5507a3452e8a3a2ea3672da3f0
---

# concept: UserInterest \[User, Item, RecommendableItem]

* **concept**: UserInterest \[User, Item, RecommendableItem]
  *Note: `RecommendableItem` is now a generic parameter representing any item that can be recommended. `Item` remains for explicit user interests in specific, potentially non-recommendable, items (e.g., a user might be interested in a *category* of items, or a specific *physical object* that isn't part of a dynamic recommendation pool).*
* **purpose**: enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience, facilitate content discovery, and receive tailored recommendations for various `RecommendableItem` types.
* **principle**: A user wants to add their personal interests through specific tags; they can remove this tag or add more tags whenever. They may also indicate interest in specific `Item`s and can similarly remove or add more interests in the future. Based on these explicit and implicit interests, the system can dynamically process a given set of `RecommendableItem`s (which include relevant details) and provide a ranked list of relevant item *identifiers*, optionally enhanced by an AI model for deeper personalization.
* **state**:
  * A set of `UserItemInterests` with
    * a user User
    * an item Item
  * A set of `UserPersonalInterests` with
    * a user User
    * a tag String
* **actions**:
  * `addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)`
    * **requires**: `tag` is a non-empty String, there does not already exist a `UserPersonalInterest` associating the user to the given tag.
    * **effects**: Creates a `UserPersonalInterest` associating the user to the tag, and returns it.
  * `removePersonalInterest (user: User, tag: String)`
    * **requires**: `tag` is a non-empty string, there exists a `UserPersonalInterest` associating the user to the given tag.
    * **effects**: Removes the `UserPersonalInterest` associating the user to the tag.
  * `addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)`
    * **requires**: There does not already exist a `UserItemInterest` associating the user to the item.
    * **effects**: Creates a `UserItemInterest` associating the user to the item, and returns it.
  * `removeItemInterest (user: User, item: Item)`
    * **requires**: There exists a `UserItemInterest` associating the user to the given item.
    * **effects**: Removes the `UserItemInterest` associating the user to the item.
* **queries**:
  * `_getPersonalInterests (user: User): (tag: String)`
    * **effects**: Returns all personal interest tags associated with the given user.
  * `_getItemInterests (user: User): (item: Item)`
    * **effects**: Returns all item IDs the user is interested in.
  * `_getRecommendedItems (userId: User, candidateItems: Set of {id: RecommendableItem, name: String, date: DateTime, location: String, description: String, itemTags: Set of String}): (item: RecommendableItem)`
    * **requires**: `userId` is a valid user identifier. `candidateItems` is a set of items with their necessary details for recommendation.
    * **effects**:
      1. Retrieves `userTags` (personal interests) for `userId` from this concept's state.
      2. Calculates a relevance score for each item in `candidateItems` based on the overlap between retrieved `userTags` and each `item`'s `itemTags`.
      3. Returns an array of `RecommendableItem` IDs, sorted by relevance (highest first), then by `date` (earliest first).
      4. If `candidateItems` is empty or `userId` has no associated personal interests, returns an empty array.
  * `_getAugmentedRecommendedItems (userId: User, candidateItems: Set of {id: RecommendableItem, name: String, date: DateTime, location: String, description: String, itemTags: Set of String}, llmService: Any): (item: RecommendableItem) | (error: String)`
    * **requires**: `userId` is a valid user identifier. `candidateItems` is a set of items with their necessary details for recommendation. `llmService` is an operational LLM client/service (e.g., a `GeminiLLM` instance).
    * **effects**:
      1. Retrieves `userTags` (personal interests) for `userId` from this concept's state.
      2. Constructs a detailed prompt for the `llmService` incorporating `userId`, the retrieved `userTags`, and the detailed `candidateItems`, requesting a comma-separated list of ranked `RecommendableItem` IDs.
      3. Invokes the `llmService` to analyze and rank the `candidateItems` based on the provided data.
      4. If the `llmService` call is successful and returns valid ranked item IDs, it returns an array of these `RecommendableItem` IDs, ranked by the `llmService`.
      5. If `llmService` fails or is unavailable, or returns invalid results, it logs a warning and falls back to the logic of `_getRecommendedItems` using the provided inputs and the retrieved `userTags`, returning the non-augmented ranked `RecommendableItem` IDs. If even the fallback fails (e.g., no candidate items or no user interests), it returns an error.

***
