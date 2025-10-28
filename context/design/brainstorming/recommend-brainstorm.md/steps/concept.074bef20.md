---
timestamp: 'Mon Oct 27 2025 01:27:02 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_012702.38bf62f4.md]]'
content_id: 074bef20dc3afdd515906b16848e452518ad44f3a123b1eb641efb47d1516354
---

# concept: UserInterest \[User, Item]

* **concept**: UserInterest \[User, Item, Event]
  *Note: Added Event as a generic parameter because the concept now directly works with Event objects (as input to queries), even if it doesn't manage their state. This makes its polymorphic nature clearer.*
* **purpose**: enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience, facilitate content discovery, and receive tailored event recommendations.
* **principle**: A user wants to add their personal interests through specific tags; they can remove this tag or add more tags whenever. They may also indicate interest in specific items and can similarly remove or add more interests in the future. Based on these explicit and implicit interests, the system can provide a ranked list of relevant events, optionally enhanced by an AI model for deeper personalization and context awareness.
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
  * `_getRecommendedEvents (userId: User, candidateEvents: Set of {id: Event, name: String, date: DateTime, location: String, description: String, relevantInterests: Set of String}, filterLocation: String): (event: {id: Event, name: String, date: DateTime, location: String, description: String, relevantInterests: Set of String})`
    * **requires**: `userId` is a valid user identifier. `candidateEvents` is a set of events with their details.
    * **effects**:
      1. Retrieves `userTags` (personal interests) for `userId` from this concept's state.
      2. Filters `candidateEvents` by `filterLocation` if provided.
      3. Calculates a relevance score for each filtered event based on the overlap between retrieved `userTags` and each `event`'s `relevantInterests`.
      4. Returns an array of event details, sorted by relevance (highest first), then by `date` (earliest first).
      5. If `candidateEvents` is empty or `userId` has no associated personal interests, returns an empty array.
  * `_getAugmentedRecommendedEvents (userId: User, candidateEvents: Set of {id: Event, name: String, date: DateTime, location: String, description: String, relevantInterests: Set of String}, userContext: Map<String, Any>, llmService: Any, filterLocation: String): (event: {id: Event, name: String, date: DateTime, location: String, description: String, relevantInterests: Set of String}) | (error: String)`
    * **requires**: `userId` is a valid user identifier. `candidateEvents` is a set of events with full details. `llmService` is an operational LLM client/service (e.g., a `GeminiLLM` instance).
    * **effects**:
      1. Retrieves `userTags` (personal interests) for `userId` from this concept's state.
      2. Filters `candidateEvents` by `filterLocation` if provided.
      3. Constructs a detailed prompt for the `llmService` incorporating `userId`, the retrieved `userTags`, the detailed filtered `candidateEvents`, and the `userContext` map, requesting a comma-separated list of ranked event IDs.
      4. Invokes the `llmService` to analyze and rank the filtered `candidateEvents` based on the provided data.
      5. If the `llmService` call is successful and returns valid ranked event IDs, it returns an array of corresponding event details, ranked by the `llmService`.
      6. If `llmService` fails or is unavailable, or returns invalid results, it logs a warning and falls back to the logic of `_getRecommendedEvents` using the provided inputs and the retrieved `userTags`, returning the non-augmented ranked events. If even the fallback fails (e.g., no candidate events or no user interests), it returns an error.

***
