---
timestamp: 'Wed Oct 15 2025 23:58:24 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_235824.b4949885.md]]'
content_id: fb69641f0320f73cec23d25675c0a5db6f0dcaa1e5003944a61a5d1bf94cf2d4
---

# file: src/reviewing/ReviewingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "Reviewing" + ".";

// Generic types for the concept's external dependencies
type User = ID;
type Item = ID;

// Internal entity type, represented as an ID
type Review = ID;

/**
 * State: A set of Reviews with a reviewer, target item, rating, and text entry.
 */
interface ReviewDoc {
  _id: Review; // The unique identifier for the review itself
  reviewer: User;
  target: Item;
  rating: number;
  entry: string;
}

/**
 * Interface for the structured review object returned by queries.
 */
interface ReviewOutput {
  id: Review;
  reviewer: User;
  target: Item;
  rating: number;
  entry: string;
}

/**
 * @concept Reviewing
 * @purpose enable users to provide qualitative and quantitative feedback on items
 * @principle a user creates a review for an item containing a written entry and numerical rating;
 *            modify the entry and rating for this review if needed; the user can also delete their review
 */
export default class ReviewingConcept {
  reviews: Collection<ReviewDoc>;

  constructor(private readonly db: Db) {
    this.reviews = this.db.collection(PREFIX + "reviews");
  }

  /**
   * Action: addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
   *
   * @param {User} user - The ID of the user submitting the review.
   * @param {Item} item - The ID of the item being reviewed.
   * @param {number} rating - The numerical rating for the item (0-10).
   * @param {string} entry - The textual feedback for the item.
   * @returns {{review: Review} | {error: string}} The ID of the created review on success, or an error message.
   *
   * @requires no review by user for this item exists.
   * @requires rating is a value between 0 and 10.
   * @effects creates a new review by the user for this item with the given rating and text entry, returns the created review's ID.
   */
  async addReview({ user, item, rating, entry }: { user: User; item: Item; rating: number; entry: string }): Promise<{ review: Review } | { error: string }> {
    if (rating < 0 || rating > 10) {
      return { error: "Rating must be between 0 and 10." };
    }

    const existingReview = await this.reviews.findOne({ reviewer: user, target: item });
    if (existingReview) {
      return { error: `User ${user} has already reviewed item ${item}.` };
    }

    const reviewId = freshID() as Review;
    await this.reviews.insertOne({ _id: reviewId, reviewer: user, target: item, rating, entry });

    return { review: reviewId };
  }

  /**
   * Action: removeReview (user: User, item: Item)
   *
   * @param {User} user - The ID of the user whose review is to be removed.
   * @param {Item} item - The ID of the item the review targets.
   * @returns {Empty | {error: string}} An empty object on success, or an error message.
   *
   * @requires a review by the user for this item exists.
   * @effects deletes the review that is associated with the given user and item.
   */
  async removeReview({ user, item }: { user: User; item: Item }): Promise<Empty | { error: string }> {
    const result = await this.reviews.deleteOne({ reviewer: user, target: item });

    if (result.deletedCount === 0) {
      return { error: `No review by user ${user} for item ${item} found to remove.` };
    }

    return {};
  }

  /**
   * Action: modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
   *
   * @param {User} user - The ID of the user whose review is to be modified.
   * @param {Item} item - The ID of the item the review targets.
   * @param {number} rating - The new numerical rating (0-10).
   * @param {string} entry - The new textual feedback.
   * @returns {{review: Review} | {error: string}} The ID of the modified review on success, or an error message.
   *
   * @requires a review by the user for this item exists.
   * @requires rating is a value between 0 and 10.
   * @effects modifies the review with the given fields for the rating and entry, returns the modified review's ID.
   */
  async modifyReview({ user, item, rating, entry }: { user: User; item: Item; rating: number; entry: string }): Promise<{ review: Review } | { error: string }> {
    if (rating < 0 || rating > 10) {
      return { error: "Rating must be between 0 and 10." };
    }

    const result = await this.reviews.updateOne(
      { reviewer: user, target: item },
      { $set: { rating, entry } },
    );

    if (result.matchedCount === 0) {
      return { error: `No review by user ${user} for item ${item} found to modify.` };
    }

    const modifiedReview = await this.reviews.findOne({ reviewer: user, target: item });
    if (!modifiedReview) {
      // This case should ideally not happen if matchedCount > 0, but good for type safety
      return { error: "Failed to retrieve modified review after update." };
    }

    return { review: modifiedReview._id };
  }

  /**
   * Query: _getReview (user: User, item: Item) : (review: Review)
   *
   * @param {User} user - The ID of the reviewer.
   * @param {Item} item - The ID of the item.
   * @returns {Array<{review: ReviewOutput}>} An array containing the structured review object, or an empty array if not found.
   *
   * @requires a review exists for the given user and item.
   * @effects returns the structured review associated with the given user and item.
   */
  async _getReview({ user, item }: { user: User; item: Item }): Promise<Array<{ review: ReviewOutput }>> {
    const reviewDoc = await this.reviews.findOne({ reviewer: user, target: item });

    if (reviewDoc) {
      return [{
        review: {
          id: reviewDoc._id,
          reviewer: reviewDoc.reviewer,
          target: reviewDoc.target,
          rating: reviewDoc.rating,
          entry: reviewDoc.entry,
        },
      }];
    }
    return [];
  }

  /**
   * Query: _getReviewsByItem (item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @param {Item} item - The ID of the item.
   * @returns {Array<{review: ReviewOutput}>} An array of structured review objects.
   *
   * @effects returns all reviews targeting the given item.
   */
  async _getReviewsByItem({ item }: { item: Item }): Promise<Array<{ review: ReviewOutput }>> {
    const reviewDocs = await this.reviews.find({ target: item }).toArray();
    return reviewDocs.map((doc) => ({
      review: {
        id: doc._id,
        reviewer: doc.reviewer,
        target: doc.target,
        rating: doc.rating,
        entry: doc.entry,
      },
    }));
  }

  /**
   * Query: _getReviewsByUser (user: User) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @param {User} user - The ID of the reviewer.
   * @returns {Array<{review: ReviewOutput}>} An array of structured review objects.
   *
   * @effects returns all reviews authored by the given user.
   */
  async _getReviewsByUser({ user }: { user: User }): Promise<Array<{ review: ReviewOutput }>> {
    const reviewDocs = await this.reviews.find({ reviewer: user }).toArray();
    return reviewDocs.map((doc) => ({
      review: {
        id: doc._id,
        reviewer: doc.reviewer,
        target: doc.target,
        rating: doc.rating,
        entry: doc.entry,
      },
    }));
  }
}
```
