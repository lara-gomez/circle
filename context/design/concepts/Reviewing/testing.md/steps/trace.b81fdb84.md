---
timestamp: 'Wed Oct 15 2025 23:58:24 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_235824.b4949885.md]]'
content_id: b81fdb84d6aee5beafb9c7d6a152f2b11a064a4b4a32cc3ec99e8dd3ce31abe8
---

# trace: Reviewing

The following trace demonstrates how the **principle** of the `Reviewing` concept — "a user creates a review for an item containing a written entry and numerical rating; modify the entry and rating for this review if needed; the user can also delete their review" — is fulfilled by a sequence of actions and verified by queries.

1. **Given**: A user `userAlice` and an item `itemProductA`.
2. **Action**: `userAlice` creates a review for `itemProductA`.
   ```
   Reviewing.addReview({ user: "user:Alice", item: "item:ProductA", rating: 8, entry: "This product is great!" })
   ```
3. **Result**: A new review is created, and its ID is returned.
   ```
   { review: "review1" }
   ```
4. **Verification**: Check that the review exists and contains the correct details.
   ```
   Reviewing._getReview({ user: "user:Alice", item: "item:ProductA" })
   ```
5. **Result**: The query returns the review, confirming its existence and properties.
   ```
   [{ review: { id: "review1", reviewer: "user:Alice", target: "item:ProductA", rating: 8, entry: "This product is great!" } }]
   ```
6. **Action**: `userAlice` decides to modify their existing review for `itemProductA`.
   ```
   Reviewing.modifyReview({ user: "user:Alice", item: "item:ProductA", rating: 9, entry: "Even better than I expected!" })
   ```
7. **Result**: The existing review is updated, and its ID is returned.
   ```
   { review: "review1" }
   ```
8. **Verification**: Check that the review reflects the modified details.
   ```
   Reviewing._getReview({ user: "user:Alice", item: "item:ProductA" })
   ```
9. **Result**: The query returns the updated review, confirming the modification.
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
