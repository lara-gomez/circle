running 6 tests from ./src/concepts/UserInterest/UserInterestConcept.test.ts

Principle: User declares and manages personal and item interests ...
------- output -------
--- Starting Principle Test: User declares and manages interests ---

Step 1: User A adds personal interests (tags)
- Added personal interest 'technology'. Result: {"personalInterest":"0199f015-0a40-7372-9c1e-a457da201fc1"}
- Added personal interest 'travel'. Result: {"personalInterest":"0199f015-0aac-7894-9d6d-c47ee967cc9f"}
- Current personal interests for User A:
  [{"_id":"0199f015-0a40-7372-9c1e-a457da201fc1","user":"user:Alice","tag":"technology"},
   {"_id":"0199f015-0aac-7894-9d6d-c47ee967cc9f","user":"user:Alice","tag":"travel"}]

Step 2: User A indicates interest in specific items
- Added item interest 'item:Product123'. Result: {"itemInterest":"0199f015-0ae7-7dd7-b0c8-8e11f2cb5272"}
- Added item interest 'item:ServiceABC'. Result: {"itemInterest":"0199f015-0b2c-7d36-ab1e-edd8c6a43497"}
- Current item interests for User A:
  [{"_id":"0199f015-0ae7-7dd7-b0c8-8e11f2cb5272","user":"user:Alice","item":"item:Product123"},
   {"_id":"0199f015-0b2c-7d36-ab1e-edd8c6a43497","user":"user:Alice","item":"item:ServiceABC"}]

Step 3: User A removes an interest
- Removed personal interest 'technology'. Result: {}
- Updated personal interests for User A:
  [{"_id":"0199f015-0aac-7894-9d6d-c47ee967cc9f","user":"user:Alice","tag":"travel"}]

Step 4: User A removes an item interest
- Removed item interest 'item:Product123'. Result: {}
- Updated item interests for User A:
  [{"_id":"0199f015-0b2c-7d36-ab1e-edd8c6a43497","user":"user:Alice","item":"item:ServiceABC"}]

--- Principle Test Finished ---
----- output end -----
Principle: User declares and manages personal and item interests ... ok (1s)


Action: addPersonalInterest requirements ...
------- output -------
--- Starting addPersonalInterest Requirements Test ---

Test: Cannot add an empty tag.
- Attempted with empty tag. Result: {"error":"Tag cannot be empty."}
- Attempted with whitespace-only tag. Result: {"error":"Tag cannot be empty."}

Test: Add successfully and check effects.
- Added 'music'. Result: {"personalInterest":"0199f015-0db5-7ef0-b175-687f3eeac905"}
- Verified personal interests:
  [{"_id":"0199f015-0db5-7ef0-b175-687f3eeac905","user":"user:Alice","tag":"music"}]

Test: Cannot add the same tag twice for the same user.
- Attempted to add duplicate tag. Result: {"error":"User user:Alice already has personal interest in tag 'music'."}

--- addPersonalInterest Requirements Test Finished ---
----- output end -----
Action: addPersonalInterest requirements ... ok (593ms)


Action: removePersonalInterest requirements and effects ...
------- output -------
--- Starting removePersonalInterest Test ---

Setup: Add a personal interest first.
- Interests after setup:
  [{"_id":"0199f015-1015-7706-bb17-303afac01330","user":"user:Alice","tag":"sports"}]

Test: Cannot remove an empty tag.
- Attempted with empty tag. Result: {"error":"Tag cannot be empty."}
- Attempted with whitespace-only tag. Result: {"error":"Tag cannot be empty."}

Test: Cannot remove a non-existent tag.
- Attempted to remove non-existent tag. Result: {"error":"User user:Alice does not have personal interest in tag 'nonexistent'."}

Test: Successfully remove existing tag and check effects.
- Removed 'sports'. Result: {}
- Verified personal interests: []

--- removePersonalInterest Test Finished ---
----- output end -----
Action: removePersonalInterest requirements and effects ... ok (640ms)


Action: addItemInterest requirements and effects ...
------- output -------
--- Starting addItemInterest Test ---

Test: Add successfully and check effects.
- Added interest in 'item:Product123'. Result: {"itemInterest":"0199f015-12de-7784-ae6b-e8295607b5df"}
- Verified item interests:
  [{"_id":"0199f015-12de-7784-ae6b-e8295607b5df","user":"user:Bob","item":"item:Product123"}]

Test: Cannot add the same item interest twice for the same user.
- Attempted to add duplicate item interest. Result: {"error":"User user:Bob already has interest in item item:Product123."}

--- addItemInterest Test Finished ---
----- output end -----
Action: addItemInterest requirements and effects ... ok (674ms)


Action: removeItemInterest requirements and effects ...
------- output -------
--- Starting removeItemInterest Test ---

Setup: Add an item interest first.
- Interests after setup:
  [{"_id":"0199f015-1534-7051-8b48-a98e4f4316ae","user":"user:Bob","item":"item:Product123"}]

Test: Cannot remove a non-existent item interest.
- Attempted to remove non-existent item interest. Result: {"error":"User user:Bob does not have interest in item item:ServiceABC."}

Test: Successfully remove existing item interest and check effects.
- Removed interest in 'item:Product123'. Result: {}
- Verified item interests: []

--- removeItemInterest Test Finished ---
----- output end -----
Action: removeItemInterest requirements and effects ... ok (630ms)


Queries: _getPersonalInterests and _getItemInterests handle empty states ...
------- output -------
--- Starting Query Empty State Test ---

Test: _getPersonalInterests for a user with no personal interests.
- Personal interests for userA (empty): []

Test: _getItemInterests for a user with no item interests.
- Item interests for userA (empty): []

--- Query Empty State Test Finished ---
----- output end -----
Queries: _getPersonalInterests and _getItemInterests handle empty states ... ok (589ms)


Query: _getUsersInterestedInItems functionality ...
------- output -------
--- Starting _getUsersInterestedInItems Query Test ---

Setup: Add various item interests for multiple users.

Test: Retrieve users interested in item1 (should be userA, userB).
- Users interested in item:Product123: [{"user":"user:Alice"},{"user":"user:Bob"}]

Test: Retrieve users interested in item2 (should be userA, userC).
- Users interested in item:ServiceABC: [{"user":"user:Alice"},{"user":"user:Charlie"}]

Test: Retrieve users interested in item3 (no one interested).
- Users interested in item:BookXYZ: []

Test: Verify that after removing an interest, query reflects change.
- Users interested in item:Product123 after userA's removal: [{"user":"user:Bob"}]

--- _getUsersInterestedInItems Query Test Finished ---
----- output end -----
Query: _getUsersInterestedInItems functionality ... ok (788ms)

ok | 7 passed | 0 failed (4s)
