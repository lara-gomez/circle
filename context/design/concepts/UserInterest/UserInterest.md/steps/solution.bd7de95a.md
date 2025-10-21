---
timestamp: 'Thu Oct 16 2025 23:29:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_232935.3ff09952.md]]'
content_id: bd7de95a836c16d2d6e5e1b4e16f2f57007e62a0e6d37a6cc9661dcb0dac3384
---

# solution: Decoupling Recommendation Logic

To better adhere to the principles of Concept Design, the recommendation logic should be decoupled from the `UserInterest` concept.

1. **Create a dedicated `Recommendation` concept:**
   * This new concept would have the explicit purpose of generating recommendations based on user preferences and a pool of candidate items/events.
   * It would typically *not* manage its own state for user interests or items. Instead, it would define actions that *take* user interests (e.g., as a set of tags and item IDs, which could be queried from `UserInterest`) and candidate items (e.g., as a list from an `EventCatalog` or similar concept) as inputs.
2. **Composition via Synchronization:**
   * The `Recommendation` concept would interact with `UserInterest` and other concepts (like an `EventCatalog` or `PostFeed` concept) through synchronizations.
   * For example, a `Request.getRecommendations` action could trigger a sync. This sync would:
     1. Query `UserInterest` for the user's personal tags and item interests.
     2. Query an `EventCatalog` (or similar concept) for a relevant pool of candidate items.
     3. Call an action on the `Recommendation` concept, passing the user's interests, the candidate items, and any filtering parameters.
     4. The `Recommendation` concept would then perform the filtering and ranking, returning the `recommendedItems`.

**Example Sketch of a `Recommendation` Concept:**

```concept
concept Recommendation [User, Item]

purpose: To provide personalized, ranked suggestions of items to users based on their expressed interests and external item characteristics.

principle: When a user requests recommendations, their stored interests (tags and specific items) are gathered. A pool of candidate items is identified, and these items are filtered and ranked according to how well they match the user's interests and any additional criteria, resulting in a personalized list of suggestions.

state: (empty, or only temporary state for complex recommendation sessions, but not for storing interests/items themselves)

actions:
  generateRecommendations (
    user: User,
    userTags: String[],
    userItemLikes: Item[],
    candidateItems: Array<{id: Item, description: String, tags: String[], location?: String, time?: Date}>,
    filters?: {location?: String, timeRange?: {start: Date, end: Date}, requiredTags?: String[]}
  ): (recommendedItems: Array<Item>)
    requires: ... (similar to the current recommendItems action, but taking interests as explicit arguments)
    effects: ... (generates ranked recommendations)
```

This approach clearly separates the concern of *managing* user interests (in `UserInterest`) from the concern of *applying* those interests to generate recommendations (in `Recommendation`), leading to more modular, reusable, and independently understandable concepts.
