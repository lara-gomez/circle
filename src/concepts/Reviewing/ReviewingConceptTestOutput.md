```
running 5 tests from ./src/concepts/Reviewing/ReviewingConcept.test.ts

ReviewingConcept: Principle fulfillment - Create, Modify, Delete, View Review ...
------- output -------

--- Fulfilling Principle: Create, Modify, Delete, View Review ---

Action: userAlice adds a review for itemProductA with rating 8 and entry "Great product!"
Result: Review created with ID 0199eb39-ad37-71e6-a9b5-7d408c851907
Query: Verified initial review for userAlice on itemProductA: {"id":"0199eb39-ad37-71e6-a9b5-7d408c851907","reviewer":"user:Alice","target":"item:ProductA","rating":8,"entry":"Great product!"}

Action: userAlice modifies their review for itemProductA to rating 9 and entry "Even better than expected!"
Result: Review modified.
Query: Verified modified review for userAlice on itemProductA: {"id":"0199eb39-ad37-71e6-a9b5-7d408c851907","reviewer":"user:Alice","target":"item:ProductA","rating":9,"entry":"Even better than expected!"}

Action: userAlice removes their review for itemProductA.
Result: Review removed.
Query: Verified no review exists for userAlice on itemProductA.

--- Principle fulfillment complete ---

----- output end -----
ReviewingConcept: Principle fulfillment - Create, Modify, Delete, View Review ... ok (807ms)


ReviewingConcept: addReview - Requirements and Effects ...
------- output -------

--- Testing addReview ---
Action: userAlice adds a review for itemProductA (rating 7, entry "Good.")
Effect: Review for userAlice on itemProductA successfully added. Current state: {"id":"0199eb39-b02d-7e48-ba07-85d643eb9d93","reviewer":"user:Alice","target":"item:ProductA","rating":7,"entry":"Good."}

Action: userBob attempts to add a review for itemProductA with rating -1
Requirement: Failed as expected: Rating must be between 0 and 10.

Action: userBob attempts to add a review for itemProductA with rating 11
Requirement: Failed as expected: Rating must be between 0 and 10.

Action: userAlice attempts to add another review for itemProductA
Requirement: Failed as expected: User user:Alice has already reviewed item item:ProductA.
Effect: No duplicate review observed for userAlice. Total reviews by user: 1

--- addReview tests complete ---

----- output end -----
ReviewingConcept: addReview - Requirements and Effects ... ok (663ms)


ReviewingConcept: removeReview - Requirements and Effects ...
------- output -------

--- Testing removeReview ---
Setup: userBob adds a review for itemServiceB (rating 6, entry "Average.")
Setup Result: Review created.

Action: userBob removes review for itemServiceB.
Result: Review removed.
Effect: No review found for userBob on itemServiceB after removal.

Action: userBob attempts to remove a non-existent review for itemServiceB.
Requirement: Failed as expected: No review by user user:Bob for item item:ServiceB found to remove.

--- removeReview tests complete ---

----- output end -----
ReviewingConcept: removeReview - Requirements and Effects ... ok (771ms)


ReviewingConcept: modifyReview - Requirements and Effects ...
------- output -------

--- Testing modifyReview ---
Setup: userAlice adds a review for itemServiceB (rating 5, entry "Initial thought.")
Setup Result: Review created with ID 0199eb39-b5aa-7158-bf34-891e1575e0d4.

Action: userAlice modifies review for itemServiceB (rating 10, entry "Absolutely fantastic!")
Result: Review modified successfully.
Effect: Review for userAlice on itemServiceB updated. Current state: {"id":"0199eb39-b5aa-7158-bf34-891e1575e0d4","reviewer":"user:Alice","target":"item:ServiceB","rating":10,"entry":"Absolutely fantastic!"}

Action: userAlice attempts to modify review for itemServiceB with rating -5
Requirement: Failed as expected: Rating must be between 0 and 10.

Action: userAlice attempts to modify review for itemServiceB with rating 15
Requirement: Failed as expected: Rating must be between 0 and 10.

Action: userBob attempts to modify a review for nonExistentItem.
Requirement: Failed as expected: No review by user user:Bob for item item:NonExistent found to modify.

--- modifyReview tests complete ---

----- output end -----
ReviewingConcept: modifyReview - Requirements and Effects ... ok (647ms)


ReviewingConcept: Queries - _getReview, _getReviewsByItem, _getReviewsByUser ...
------- output -------

--- Testing Queries ---
Setup: Adding reviews...
Setup Result: 3 reviews added.

Query: _getReview for userAlice on itemProductA
Result: {"id":"0199eb39-b81c-7e9b-9612-d839585ed2ed","reviewer":"user:Alice","target":"item:ProductA","rating":8,"entry":"Alice on ProdA"}

Query: _getReview for non-existent user/item pair
Result: [] (empty as expected)

Query: _getReviewsByItem for itemProductA
Result: Reviews for itemProductA: ["Alice on ProdA","Bob on ProdA"]

Query: _getReviewsByItem for an item with no reviews (item:None)
Result: [] (empty as expected)

Query: _getReviewsByUser for userAlice
Result: Reviews by userAlice: ["Alice on ProdA","Alice on ServB"]

Query: _getReviewsByUser for a user with no reviews (user:Charlie)
Result: [] (empty as expected)

--- Query tests complete ---

----- output end -----
ReviewingConcept: Queries - _getReview, _getReviewsByItem, _getReviewsByUser ... ok (751ms)

ok | 5 passed | 0 failed (3s)
```