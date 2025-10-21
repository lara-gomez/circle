---
timestamp: 'Thu Oct 16 2025 23:29:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_232935.3ff09952.md]]'
content_id: ef39789148b8e0af76d8a079cc878564aa9ad6b8d13f701dff8f9da2c0795cf4
---

# problem: Design Tension with `recommendItems`

The inclusion of the `recommendItems` action within the `UserInterest` concept introduces a tension with the "Separation of Concerns" and "Independence" principles of Concept Design.

1. **Separation of Concerns**: The primary purpose of `UserInterest` is "to explicitly declare and manage their interests". Generating recommendations, while *utilizing* these interests, is a distinct concern. It's a *consumption* of interests for a specific purpose (content discovery/ranking), not the *management* of the interests themselves. A recommendation engine is typically a complex subsystem, and conflating it with a concept whose role is merely data storage and basic CRUD for interests makes the `UserInterest` concept less focused.
2. **Independence**: The `recommendItems` action requires a rich `candidateItems` input structure (containing `description`, `tags`, `location`, `time`). This means the `UserInterest` concept now makes assumptions about the structure and properties of `Item`s, going beyond its generic type parameter `Item`. While passing this as an argument maintains technical independence (no direct imports of another concept's type definitions), it indicates a strong implicit coupling. The logic for filtering and scoring these `candidateItems` also resides within `UserInterest`, effectively making `UserInterest` partially responsible for event/item processing and recommendation logic, which are concerns that could belong to an `Event` concept or a dedicated `Recommendation` concept.
3. **Completeness**: While `UserInterest` is complete for *managing* interests, the `recommendItems` action's completeness is somewhat artificial. It needs to be fed a pre-processed `candidateItems` list. If the "pool of events" or items were managed by another concept (e.g., `EventCatalog`), a true recommendation system would *read* from that `EventCatalog` concept and the `UserInterest` concept to produce results. By forcing `candidateItems` as an input, `UserInterest` remains "complete" in isolation but at the cost of requiring external orchestration to gather and format `candidateItems`, which hides the true dependencies of a recommendation system.

In essence, `recommendItems` conceptually "calls out" to an external source for items and brings in domain-specific logic (scoring, filtering by `location`/`time`) that isn't strictly about *what interests a user has*, but rather *how those interests are applied to find relevant items*.

***
