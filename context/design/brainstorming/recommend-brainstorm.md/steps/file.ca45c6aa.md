---
timestamp: 'Mon Oct 27 2025 02:04:16 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_020416.96c7a6a1.md]]'
content_id: ca45c6aa25c8b7042bcbc8cf43a92da11375641ddf23d503103e20089c412885
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

// Internal entity type, represented as ID
type Review = ID;

/**
 * State: A set of Reviews.
 * Each review links a reviewer (User), a target item (Item), a numerical rating, and a text entry.
 */
interface ReviewDoc {
  _id: Review; // MongoDB document ID
  reviewer: User;
  target: Item;
  rating: number;
  entry: string;
}

/**
 * @concept Reviewing
 * @purpose enable users to provide qualitative and quantitative feedback on items
 * @principle a user creates a review for an item containing a written entry and numerical rating; modify the entry and rating for this review if needed; the user can also delete their review
 */
export default class ReviewingConcept {
  reviews: Collection<ReviewDoc>;

  constructor(private readonly db: Db) {
    this.reviews = this.db.collection(PREFIX + "reviews");
  }

  /**
   * addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
   *
   * @requires no review by user for this item exists, rating is a value between 0 and 10
   * @effects create a review by the user for this item with the given rating and text entry, return the created review
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
   * removeReview (user: User, item: Item)
   *
   * @requires a review by the user for this item exists
   * @effects deletes the review that is associated with the given user and item
   */
  async removeReview({ user, item }: { user: User; item: Item }): Promise<Empty | { error: string }> {
    const result = await this.reviews.deleteOne({ reviewer: user, target: item });
    if (result.deletedCount === 0) {
      return { error: `No review found by user ${user} for item ${item}.` };
    }
    return {};
  }

  /**
   * modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
   *
   * @requires a review by the user for this item exists, rating is a value between 0 and 10
   * @effects modifies the review with the given fields for the rating and entry, returns the modified review
   */
  async modifyReview({ user, item, rating, entry }: { user: User; item: Item; rating: number; entry: string }): Promise<{ review: Review } | { error: string }> {
    if (rating < 0 || rating > 10) {
      return { error: "Rating must be between 0 and 10." };
    }

    const updatedReview = await this.reviews.findOneAndUpdate(
      { reviewer: user, target: item },
      { $set: { rating, entry } },
      { returnDocument: "after" }
    );

    if (!updatedReview.value) {
      return { error: `No review found by user ${user} for item ${item} to modify.` };
    }
    return { review: updatedReview.value._id };
  }

  /**
   * _getReview (user: User, item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @requires a review exists for the given user and item
   * @effects returns the review associated with the given user and item
   */
  async _getReview({ user, item }: { user: User; item: Item }): Promise<Array<{ id: Review; reviewer: User; target: Item; rating: number; entry: string }> | { error: string }> {
    const review = await this.reviews.findOne({ reviewer: user, target: item });
    if (!review) {
      return { error: `No review found by user ${user} for item ${item}.` };
    }
    return [{ id: review._id, reviewer: review.reviewer, target: review.target, rating: review.rating, entry: review.entry }];
  }

  /**
   * _getReviewsByItem (item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @effects returns all reviews targeting the given item
   */
  async _getReviewsByItem({ item }: { item: Item }): Promise<Array<{ id: Review; reviewer: User; target: Item; rating: number; entry: string }>> {
    const reviews = await this.reviews.find({ target: item }).toArray();
    return reviews.map(r => ({ id: r._id, reviewer: r.reviewer, target: r.target, rating: r.rating, entry: r.entry }));
  }

  /**
   * _getReviewsByUser (user: User) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @effects returns all reviews authored by the given user
   */
  async _getReviewsByUser({ user }: { user: User }): Promise<Array<{ id: Review; reviewer: User; target: Item; rating: number; entry: string }>> {
    const reviews = await this.reviews.find({ reviewer: user }).toArray();
    return reviews.map(r => ({ id: r._id, reviewer: r.reviewer, target: r.target, rating: r.rating, entry: r.entry }));
  }
}
```

***
