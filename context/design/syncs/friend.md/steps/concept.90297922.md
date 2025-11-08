---
timestamp: 'Fri Nov 07 2025 15:29:29 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_152929.49b76208.md]]'
content_id: 902979223e91cd97c11ab0c697e011c4aba90f0b6612579cbe199e9bd9df8d0f
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
  * addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
    * requires: no review by user for this item exists, rating is a value between 0 and 10
    * effects: create a review by the user for this item with the given rating and text entry, return the created review

  * removeReview (user: User, item: Item)
    * requires: a review by the user for this item exists
    * effects: deletes the review that is associated with the given user and item

  * modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
    * requires: a review by the user for this item exists, rating is a value between 0 and 10
    * effects: modifies the review with the given fields for the rating and entry, returns the modified review

* **queries**:
  * \_getReview (user: User, item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
    * requires: a review exists for the given user and item
    * effects: returns the review associated with the given user and item

  * \_getReviewsByItem (item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
    * effects: returns all reviews targeting the given item

  * \_getReviewsByUser (user: User) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
    * effects: returns all reviews authored by the given user
