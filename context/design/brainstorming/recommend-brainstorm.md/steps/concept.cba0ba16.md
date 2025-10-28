---
timestamp: 'Mon Oct 27 2025 02:04:16 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_020416.96c7a6a1.md]]'
content_id: cba0ba164eac81c277d5838e04f272334820fe85dae4f31200f9f3750982dcef
---

# concept: Reviewing \[User, Item]

* **concept**: Reviewing \[User, Item]

* **purpose**: enable users to provide qualitative and quantitative feedback on items

* **principle**: a user creates a review for an item containing a written entry and numerical rating; modify the entry and rating for this review if needed; the user can also delete their review

* **state**:
  * a set of Reviews with
    * a reviewer User
    * a target Item
    * a rating Number
    * an entry String

* **actions**:
  * `addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)`
    * **requires**: no review by user for this item exists, rating is a value between 0 and 10
    * **effects**: create a review by the user for this item with the given rating and text entry, return the created review

  * `removeReview (user: User, item: Item)`
    * **requires**: a review by the user for this item exists
    * **effects**: deletes the review that is associated with the given user and item

  * `modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)`
    * **requires**: a review by the user for this item exists, rating is a value between 0 and 10
    * **effects**: modifies the review with the given fields for the rating and entry, returns the modified review

* **queries**:
  * `_getReview (user: User, item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})`
    * **requires**: a review exists for the given user and item
    * **effects**: returns the review associated with the given user and item

  * `_getReviewsByItem (item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})`
    * **effects**: returns all reviews targeting the given item

  * `_getReviewsByUser (user: User) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})`
    * **effects**: returns all reviews authored by the given user
