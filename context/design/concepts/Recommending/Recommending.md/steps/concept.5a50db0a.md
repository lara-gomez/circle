---
timestamp: 'Thu Oct 16 2025 23:26:54 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_232654.63ae58bb.md]]'
content_id: 5a50db0a5da3992f4c87e61cd9f3ce2fa0e7cdffb22dfb480cf512365ec8dccb
---

# concept: Recommending \[User, Item]

* **concept**: Recommending \[User, Item]

* **purpose**: provide personalized item recommendations to users

* **principle**: Recommendations are generated from a pool of events. Events are prioritized by relevance, which is determined according to overlap with a provided set of interests. Filters by location, time, or specific interests are supported. An LLM can take in event characteristics and user interests to produce ranked recommendations.

* **state**:
  * a set of Recommendations
    * a set of users Users
    * a set of items Items
