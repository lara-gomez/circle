---
timestamp: 'Wed Oct 15 2025 23:21:55 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_232155.2fd5b9d4.md]]'
content_id: 315ec269448e99983c675d1ed6daaebecda5ecd43471291de360420628e063b2
---

# concept: Reviewing \[User, Item]

* **concept**: Reviewing \[User, Item]

* **purpose**: users can write reviews for different items

* **principle**: a user creates a review for an item containing a written entry and numerical rating; modify the entry and rating for this review if needed; the user can also delete their review

* **state**:
  * a set of Reviews with
    * a reviewer User
    * a target Item
    * a rating Number
    * an entry String

* **actions**:
  * addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
    * requires: no review by user for this item exists
    * effects: create a review by the user for this item with the given rating and text entry, return the created review

  * removeReview (user: User, item: Item)
    * requires: a review by the user for this item exists
    * effects: deletes the review that is associated with the given user and item

  * modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
    * requires: a review by the user for this item exists
    * effects: modifies the review with the given fields for the rating and entry, returns the modified review

* **queries**:
  * \_getReview (user: User, item: Item) : (review: Review)
    * requires: a review exists for the given user and item
    * effects: returns the review associated with the given user and item
