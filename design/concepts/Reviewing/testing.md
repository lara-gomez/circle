[@implementation](implementation.md)

[@testing-concepts](../../background/testing-concepts.md)

[@reviewing](Reviewing.md)

[@example-test](../LikertSurvey/testing.md)

# test: Reviewing
# response:

# file: src/reviewing/ReviewingConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import ReviewingConcept from "./ReviewingConcept.ts";

// Sample IDs for testing
const userAlice = "user:Alice" as ID;
const userBob = "user:Bob" as ID;
const itemProductA = "item:ProductA" as ID;
const itemServiceB = "item:ServiceB" as ID;

Deno.test("ReviewingConcept: Principle fulfillment - Create, Modify, Delete, View Review", async () => {
  const [db, client] = await testDb();
  const reviewingConcept = new ReviewingConcept(db);

  try {
    console.log("--- Fulfilling Principle: Create, Modify, Delete, View Review ---");

    // Trace Step 2: A user creates a review for an item
    console.log(`Action: userAlice adds a review for itemProductA with rating 8 and entry "Great product!"`);
    const addResult = await reviewingConcept.addReview({ user: userAlice, item: itemProductA, rating: 8, entry: "Great product!" });
    assertNotEquals("error" in addResult, true, `addReview should succeed: ${JSON.stringify(addResult)}`);
    const { review: reviewId } = addResult as { review: ID };
    assertExists(reviewId, "Review ID should be returned.");
    console.log(`Result: Review created with ID ${reviewId}`);

    // Verify initial state
    let reviews = await reviewingConcept._getReview({ user: userAlice, item: itemProductA });
    assertEquals(reviews.length, 1, "There should be one review.");
    assertEquals(reviews[0].review.rating, 8, "Initial rating should be 8.");
    assertEquals(reviews[0].review.entry, "Great product!", "Initial entry should be 'Great product!'.");
    console.log(`Query: Verified initial review for userAlice on itemProductA: ${JSON.stringify(reviews[0].review)}`);

    // Trace Step 3: Modify the entry and rating for this review
    console.log(`Action: userAlice modifies their review for itemProductA to rating 9 and entry "Even better than expected!"`);
    const modifyResult = await reviewingConcept.modifyReview({ user: userAlice, item: itemProductA, rating: 9, entry: "Even better than expected!" });
    assertNotEquals("error" in modifyResult, true, `modifyReview should succeed: ${JSON.stringify(modifyResult)}`);
    assertEquals((modifyResult as { review: ID }).review, reviewId, "Modified review ID should match original.");
    console.log(`Result: Review modified.`);

    // Verify modified state
    reviews = await reviewingConcept._getReview({ user: userAlice, item: itemProductA });
    assertEquals(reviews.length, 1, "There should still be one review.");
    assertEquals(reviews[0].review.rating, 9, "Rating should be updated to 9.");
    assertEquals(reviews[0].review.entry, "Even better than expected!", "Entry should be updated.");
    console.log(`Query: Verified modified review for userAlice on itemProductA: ${JSON.stringify(reviews[0].review)}`);

    // Trace Step 4: The user can also delete their review
    console.log(`Action: userAlice removes their review for itemProductA.`);
    const removeResult = await reviewingConcept.removeReview({ user: userAlice, item: itemProductA });
    assertNotEquals("error" in removeResult, true, `removeReview should succeed: ${JSON.stringify(removeResult)}`);
    console.log(`Result: Review removed.`);

    // Verify deletion
    reviews = await reviewingConcept._getReview({ user: userAlice, item: itemProductA });
    assertEquals(reviews.length, 0, "There should be no reviews after deletion.");
    console.log(`Query: Verified no review exists for userAlice on itemProductA.`);

    console.log("--- Principle fulfillment complete ---");
  } finally {
    await client.close();
  }
});

Deno.test("ReviewingConcept: addReview - Requirements and Effects", async () => {
  const [db, client] = await testDb();
  const reviewingConcept = new ReviewingConcept(db);

  try {
    console.log("\n--- Testing addReview ---");

    // Test Case 1: Successful addition of a review
    console.log(`Action: userAlice adds a review for itemProductA (rating 7, entry "Good.")`);
    const addSuccessResult = await reviewingConcept.addReview({ user: userAlice, item: itemProductA, rating: 7, entry: "Good." });
    assertNotEquals("error" in addSuccessResult, true, `addReview should succeed: ${JSON.stringify(addSuccessResult)}`);
    assertExists((addSuccessResult as { review: ID }).review, "Review ID should be returned on success.");
    let reviews = await reviewingConcept._getReview({ user: userAlice, item: itemProductA });
    assertEquals(reviews.length, 1, "Should find the newly added review.");
    assertEquals(reviews[0].review.rating, 7, "Rating should match.");
    console.log(`Effect: Review for userAlice on itemProductA successfully added. Current state: ${JSON.stringify(reviews[0].review)}`);

    // Test Case 2: Attempt to add a review with rating below 0 (requires check)
    console.log(`Action: userBob attempts to add a review for itemProductA with rating -1`);
    const addInvalidRatingLowResult = await reviewingConcept.addReview({ user: userBob, item: itemProductA, rating: -1, entry: "Too low." });
    assertEquals("error" in addInvalidRatingLowResult, true, "Should fail for rating < 0.");
    assertEquals((addInvalidRatingLowResult as { error: string }).error, "Rating must be between 0 and 10.");
    console.log(`Requirement: Failed as expected: ${addInvalidRatingLowResult.error}`);

    // Test Case 3: Attempt to add a review with rating above 10 (requires check)
    console.log(`Action: userBob attempts to add a review for itemProductA with rating 11`);
    const addInvalidRatingHighResult = await reviewingConcept.addReview({ user: userBob, item: itemProductA, rating: 11, entry: "Too high." });
    assertEquals("error" in addInvalidRatingHighResult, true, "Should fail for rating > 10.");
    assertEquals((addInvalidRatingHighResult as { error: string }).error, "Rating must be between 0 and 10.");
    console.log(`Requirement: Failed as expected: ${addInvalidRatingHighResult.error}`);

    // Test Case 4: Attempt to add a duplicate review by the same user for the same item (requires check)
    console.log(`Action: userAlice attempts to add another review for itemProductA`);
    const addDuplicateResult = await reviewingConcept.addReview({ user: userAlice, item: itemProductA, rating: 5, entry: "Duplicate." });
    assertEquals("error" in addDuplicateResult, true, "Should fail for duplicate review.");
    assertEquals((addDuplicateResult as { error: string }).error, `User ${userAlice} has already reviewed item ${itemProductA}.`);
    console.log(`Requirement: Failed as expected: ${addDuplicateResult.error}`);
    reviews = await reviewingConcept._getReviewsByUser({ user: userAlice });
    assertEquals(reviews.length, 1, "No duplicate review should be added.");
    console.log(`Effect: No duplicate review observed for userAlice. Total reviews by user: ${reviews.length}`);

    console.log("--- addReview tests complete ---");
  } finally {
    await client.close();
  }
});

Deno.test("ReviewingConcept: removeReview - Requirements and Effects", async () => {
  const [db, client] = await testDb();
  const reviewingConcept = new ReviewingConcept(db);

  try {
    console.log("\n--- Testing removeReview ---");

    // Setup: Add a review to be removed
    console.log(`Setup: userBob adds a review for itemServiceB (rating 6, entry "Average.")`);
    const addResult = await reviewingConcept.addReview({ user: userBob, item: itemServiceB, rating: 6, entry: "Average." });
    assertNotEquals("error" in addResult, true);
    console.log(`Setup Result: Review created.`);

    // Test Case 1: Successful removal
    console.log(`Action: userBob removes review for itemServiceB.`);
    const removeSuccessResult = await reviewingConcept.removeReview({ user: userBob, item: itemServiceB });
    assertNotEquals("error" in removeSuccessResult, true, `removeReview should succeed: ${JSON.stringify(removeSuccessResult)}`);
    console.log(`Result: Review removed.`);

    // Verify effect: review should be gone
    const reviewsAfterRemoval = await reviewingConcept._getReview({ user: userBob, item: itemServiceB });
    assertEquals(reviewsAfterRemoval.length, 0, "Review should no longer exist.");
    console.log(`Effect: No review found for userBob on itemServiceB after removal.`);

    // Test Case 2: Attempt to remove a non-existent review (requires check)
    console.log(`Action: userBob attempts to remove a non-existent review for itemServiceB.`);
    const removeNonExistentResult = await reviewingConcept.removeReview({ user: userBob, item: itemServiceB });
    assertEquals("error" in removeNonExistentResult, true, "Should fail for non-existent review.");
    assertEquals((removeNonExistentResult as { error: string }).error, `No review by user ${userBob} for item ${itemServiceB} found to remove.`);
    console.log(`Requirement: Failed as expected: ${removeNonExistentResult.error}`);

    console.log("--- removeReview tests complete ---");
  } finally {
    await client.close();
  }
});

Deno.test("ReviewingConcept: modifyReview - Requirements and Effects", async () => {
  const [db, client] = await testDb();
  const reviewingConcept = new ReviewingConcept(db);

  try {
    console.log("\n--- Testing modifyReview ---");

    // Setup: Add a review to be modified
    console.log(`Setup: userAlice adds a review for itemServiceB (rating 5, entry "Initial thought.")`);
    const addResult = await reviewingConcept.addReview({ user: userAlice, item: itemServiceB, rating: 5, entry: "Initial thought." });
    assertNotEquals("error" in addResult, true);
    const { review: reviewId } = addResult as { review: ID };
    console.log(`Setup Result: Review created with ID ${reviewId}.`);

    // Test Case 1: Successful modification
    console.log(`Action: userAlice modifies review for itemServiceB (rating 10, entry "Absolutely fantastic!")`);
    const modifySuccessResult = await reviewingConcept.modifyReview({ user: userAlice, item: itemServiceB, rating: 10, entry: "Absolutely fantastic!" });
    assertNotEquals("error" in modifySuccessResult, true, `modifyReview should succeed: ${JSON.stringify(modifySuccessResult)}`);
    assertEquals((modifySuccessResult as { review: ID }).review, reviewId, "Modified review ID should match original.");
    console.log(`Result: Review modified successfully.`);

    // Verify effect: review should reflect new values
    const modifiedReviews = await reviewingConcept._getReview({ user: userAlice, item: itemServiceB });
    assertEquals(modifiedReviews.length, 1, "Review should still exist.");
    assertEquals(modifiedReviews[0].review.rating, 10, "Rating should be updated to 10.");
    assertEquals(modifiedReviews[0].review.entry, "Absolutely fantastic!", "Entry should be updated.");
    console.log(`Effect: Review for userAlice on itemServiceB updated. Current state: ${JSON.stringify(modifiedReviews[0].review)}`);

    // Test Case 2: Attempt to modify a review with rating below 0 (requires check)
    console.log(`Action: userAlice attempts to modify review for itemServiceB with rating -5`);
    const modifyInvalidRatingLowResult = await reviewingConcept.modifyReview({ user: userAlice, item: itemServiceB, rating: -5, entry: "Invalid." });
    assertEquals("error" in modifyInvalidRatingLowResult, true, "Should fail for rating < 0.");
    assertEquals((modifyInvalidRatingLowResult as { error: string }).error, "Rating must be between 0 and 10.");
    console.log(`Requirement: Failed as expected: ${modifyInvalidRatingLowResult.error}`);

    // Test Case 3: Attempt to modify a review with rating above 10 (requires check)
    console.log(`Action: userAlice attempts to modify review for itemServiceB with rating 15`);
    const modifyInvalidRatingHighResult = await reviewingConcept.modifyReview({ user: userAlice, item: itemServiceB, rating: 15, entry: "Invalid." });
    assertEquals("error" in modifyInvalidRatingHighResult, true, "Should fail for rating > 10.");
    assertEquals((modifyInvalidRatingHighResult as { error: string }).error, "Rating must be between 0 and 10.");
    console.log(`Requirement: Failed as expected: ${modifyInvalidRatingHighResult.error}`);

    // Test Case 4: Attempt to modify a non-existent review (requires check)
    const nonExistentItem = "item:NonExistent" as ID;
    console.log(`Action: userBob attempts to modify a review for nonExistentItem.`);
    const modifyNonExistentResult = await reviewingConcept.modifyReview({ user: userBob, item: nonExistentItem, rating: 5, entry: "Should not exist." });
    assertEquals("error" in modifyNonExistentResult, true, "Should fail for non-existent review.");
    assertEquals((modifyNonExistentResult as { error: string }).error, `No review by user ${userBob} for item ${nonExistentItem} found to modify.`);
    console.log(`Requirement: Failed as expected: ${modifyNonExistentResult.error}`);

    console.log("--- modifyReview tests complete ---");
  } finally {
    await client.close();
  }
});

Deno.test("ReviewingConcept: Queries - _getReview, _getReviewsByItem, _getReviewsByUser", async () => {
  const [db, client] = await testDb();
  const reviewingConcept = new ReviewingConcept(db);

  try {
    console.log("\n--- Testing Queries ---");

    // Setup: Add multiple reviews
    console.log(`Setup: Adding reviews...`);
    await reviewingConcept.addReview({ user: userAlice, item: itemProductA, rating: 8, entry: "Alice on ProdA" });
    await reviewingConcept.addReview({ user: userAlice, item: itemServiceB, rating: 9, entry: "Alice on ServB" });
    await reviewingConcept.addReview({ user: userBob, item: itemProductA, rating: 7, entry: "Bob on ProdA" });
    console.log(`Setup Result: 3 reviews added.`);

    // Query Test 1: _getReview - specific review
    console.log(`Query: _getReview for userAlice on itemProductA`);
    let specificReview = await reviewingConcept._getReview({ user: userAlice, item: itemProductA });
    assertEquals(specificReview.length, 1, "Should find one specific review.");
    assertEquals(specificReview[0].review.reviewer, userAlice);
    assertEquals(specificReview[0].review.target, itemProductA);
    assertEquals(specificReview[0].review.rating, 8);
    console.log(`Result: ${JSON.stringify(specificReview[0].review)}`);

    console.log(`Query: _getReview for non-existent user/item pair`);
    specificReview = await reviewingConcept._getReview({ user: userBob, item: itemServiceB });
    assertEquals(specificReview.length, 0, "Should find no specific review for non-existent pair.");
    console.log(`Result: ${JSON.stringify(specificReview)} (empty as expected)`);

    // Query Test 2: _getReviewsByItem - all reviews for an item
    console.log(`Query: _getReviewsByItem for itemProductA`);
    const reviewsForProductA = await reviewingConcept._getReviewsByItem({ item: itemProductA });
    assertEquals(reviewsForProductA.length, 2, "Should find two reviews for itemProductA.");
    assertExists(reviewsForProductA.find(r => r.review.reviewer === userAlice), "Alice's review should be present.");
    assertExists(reviewsForProductA.find(r => r.review.reviewer === userBob), "Bob's review should be present.");
    console.log(`Result: Reviews for itemProductA: ${JSON.stringify(reviewsForProductA.map(r => r.review.entry))}`);

    console.log(`Query: _getReviewsByItem for an item with no reviews (item:None)`);
    const reviewsForNone = await reviewingConcept._getReviewsByItem({ item: "item:None" as ID });
    assertEquals(reviewsForNone.length, 0, "Should find no reviews for non-reviewed item.");
    console.log(`Result: ${JSON.stringify(reviewsForNone)} (empty as expected)`);

    // Query Test 3: _getReviewsByUser - all reviews by a user
    console.log(`Query: _getReviewsByUser for userAlice`);
    const reviewsByAlice = await reviewingConcept._getReviewsByUser({ user: userAlice });
    assertEquals(reviewsByAlice.length, 2, "Should find two reviews by userAlice.");
    assertExists(reviewsByAlice.find(r => r.review.target === itemProductA), "Alice's review for ProdA should be present.");
    assertExists(reviewsByAlice.find(r => r.review.target === itemServiceB), "Alice's review for ServB should be present.");
    console.log(`Result: Reviews by userAlice: ${JSON.stringify(reviewsByAlice.map(r => r.review.entry))}`);

    console.log(`Query: _getReviewsByUser for a user with no reviews (user:Charlie)`);
    const reviewsByCharlie = await reviewingConcept._getReviewsByUser({ user: "user:Charlie" as ID });
    assertEquals(reviewsByCharlie.length, 0, "Should find no reviews for non-reviewing user.");
    console.log(`Result: ${JSON.stringify(reviewsByCharlie)} (empty as expected)`);

    console.log("--- Query tests complete ---");
  } finally {
    await client.close();
  }
});
```

# trace: Reviewing

The following trace demonstrates how the **principle** of the `Reviewing` concept — "a user creates a review for an item containing a written entry and numerical rating; modify the entry and rating for this review if needed; the user can also delete their review" — is fulfilled by a sequence of actions and verified by queries.

1.  **Given**: A user `userAlice` and an item `itemProductA`.
2.  **Action**: `userAlice` creates a review for `itemProductA`.
    ```
    Reviewing.addReview({ user: "user:Alice", item: "item:ProductA", rating: 8, entry: "This product is great!" })
    ```
3.  **Result**: A new review is created, and its ID is returned.
    ```
    { review: "review1" }
    ```
4.  **Verification**: Check that the review exists and contains the correct details.
    ```
    Reviewing._getReview({ user: "user:Alice", item: "item:ProductA" })
    ```
5.  **Result**: The query returns the review, confirming its existence and properties.
    ```
    [{ review: { id: "review1", reviewer: "user:Alice", target: "item:ProductA", rating: 8, entry: "This product is great!" } }]
    ```
6.  **Action**: `userAlice` decides to modify their existing review for `itemProductA`.
    ```
    Reviewing.modifyReview({ user: "user:Alice", item: "item:ProductA", rating: 9, entry: "Even better than I expected!" })
    ```
7.  **Result**: The existing review is updated, and its ID is returned.
    ```
    { review: "review1" }
    ```
8.  **Verification**: Check that the review reflects the modified details.
    ```
    Reviewing._getReview({ user: "user:Alice", item: "item:ProductA" })
    ```
9.  **Result**: The query returns the updated review, confirming the modification.
    ```
    [{ review: { id: "review1", reviewer: "user:Alice", target: "item:ProductA", rating: 9, entry: "Even better than I expected!" } }]
    ```
10. **Action**: `userAlice` later decides to delete their review for `itemProductA`.
    ```
    Reviewing.removeReview({ user: "user:Alice", item: "item:ProductA" })
    ```
11. **Result**: The review is successfully deleted.
    ```
    {}
    ```
12. **Verification**: Attempt to retrieve the deleted review to confirm its absence.
    ```
    Reviewing._getReview({ user: "user:Alice", item: "item:ProductA" })
    ```
13. **Result**: The query returns an empty array, confirming the deletion of the review.
    ```
    []
    ```