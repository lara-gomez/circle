[@implementation](implementation.md)

[@testing-concepts](../../background/testing-concepts.md)

[@userInterest-concept](UserInterest.md)

[@example-test](../LikertSurvey/testing.md)

# test: UserInterest
# response:

# file: src/userinterest/UserInterestConcept.test.ts

```typescript
import { assertEquals, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import UserInterestConcept from "./UserInterestConcept.ts";

const userA = "user:Alice" as ID;
const userB = "user:Bob" as ID;
const item1 = "item:Product123" as ID;
const item2 = "item:ServiceABC" as ID;

Deno.test("Principle: User declares and manages personal and item interests", async () => {
  console.log("--- Starting Principle Test: User declares and manages interests ---");
  const [db, client] = await testDb();
  const userInterestConcept = new UserInterestConcept(db);

  try {
    console.log("Step 1: User A adds personal interests (tags)");
    const techTag = "technology";
    const travelTag = "travel";

    let addTechResult = await userInterestConcept.addPersonalInterest({ user: userA, tag: techTag });
    assertNotEquals("error" in addTechResult, true, `Adding '${techTag}' should succeed.`);
    console.log(`- Added personal interest '${techTag}'. Result: ${JSON.stringify(addTechResult)}`);

    let addTravelResult = await userInterestConcept.addPersonalInterest({ user: userA, tag: travelTag });
    assertNotEquals("error" in addTravelResult, true, `Adding '${travelTag}' should succeed.`);
    console.log(`- Added personal interest '${travelTag}'. Result: ${JSON.stringify(addTravelResult)}`);

    let personalInterests = await userInterestConcept._getPersonalInterests({ user: userA });
    assertEquals(personalInterests.length, 2, "User A should have 2 personal interests.");
    assertEquals(personalInterests.some(i => i.tag === techTag), true, `User A should have '${techTag}' interest.`);
    assertEquals(personalInterests.some(i => i.tag === travelTag), true, `User A should have '${travelTag}' interest.`);
    console.log(`- Current personal interests for User A: ${JSON.stringify(personalInterests)}`);

    console.log("Step 2: User A indicates interest in specific items");
    let addItem1Result = await userInterestConcept.addItemInterest({ user: userA, item: item1 });
    assertNotEquals("error" in addItem1Result, true, `Adding interest in '${item1}' should succeed.`);
    console.log(`- Added item interest '${item1}'. Result: ${JSON.stringify(addItem1Result)}`);

    let addItem2Result = await userInterestConcept.addItemInterest({ user: userA, item: item2 });
    assertNotEquals("error" in addItem2Result, true, `Adding interest in '${item2}' should succeed.`);
    console.log(`- Added item interest '${item2}'. Result: ${JSON.stringify(addItem2Result)}`);

    let itemInterests = await userInterestConcept._getItemInterests({ user: userA });
    assertEquals(itemInterests.length, 2, "User A should have 2 item interests.");
    assertEquals(itemInterests.some(i => i.item === item1), true, `User A should have interest in '${item1}'.`);
    assertEquals(itemInterests.some(i => i.item === item2), true, `User A should have interest in '${item2}'.`);
    console.log(`- Current item interests for User A: ${JSON.stringify(itemInterests)}`);

    console.log("Step 3: User A removes an interest");
    let removeTechResult = await userInterestConcept.removePersonalInterest({ user: userA, tag: techTag });
    assertEquals("error" in removeTechResult, false, `Removing '${techTag}' should succeed.`);
    console.log(`- Removed personal interest '${techTag}'. Result: ${JSON.stringify(removeTechResult)}`);

    personalInterests = await userInterestConcept._getPersonalInterests({ user: userA });
    assertEquals(personalInterests.length, 1, "User A should now have 1 personal interest.");
    assertEquals(personalInterests.some(i => i.tag === techTag), false, `User A should NOT have '${techTag}' interest.`);
    assertEquals(personalInterests.some(i => i.tag === travelTag), true, `User A should still have '${travelTag}' interest.`);
    console.log(`- Updated personal interests for User A: ${JSON.stringify(personalInterests)}`);

    console.log("Step 4: User A removes an item interest");
    let removeItem1Result = await userInterestConcept.removeItemInterest({ user: userA, item: item1 });
    assertEquals("error" in removeItem1Result, false, `Removing interest in '${item1}' should succeed.`);
    console.log(`- Removed item interest '${item1}'. Result: ${JSON.stringify(removeItem1Result)}`);

    itemInterests = await userInterestConcept._getItemInterests({ user: userA });
    assertEquals(itemInterests.length, 1, "User A should now have 1 item interest.");
    assertEquals(itemInterests.some(i => i.item === item1), false, `User A should NOT have interest in '${item1}'.`);
    assertEquals(itemInterests.some(i => i.item === item2), true, `User A should still have interest in '${item2}'.`);
    console.log(`- Updated item interests for User A: ${JSON.stringify(itemInterests)}`);

  } finally {
    await client.close();
    console.log("--- Principle Test Finished ---");
  }
});

Deno.test("Action: addPersonalInterest requirements", async () => {
  console.log("--- Starting addPersonalInterest Requirements Test ---");
  const [db, client] = await testDb();
  const userInterestConcept = new UserInterestConcept(db);
  const tag = "music";

  try {
    console.log("Test: Cannot add an empty tag.");
    let result = await userInterestConcept.addPersonalInterest({ user: userA, tag: "" });
    assertEquals("error" in result, true, "Should return an error for empty tag.");
    console.log(`- Attempted with empty tag. Result: ${JSON.stringify(result)}`);

    result = await userInterestConcept.addPersonalInterest({ user: userA, tag: "   " });
    assertEquals("error" in result, true, "Should return an error for whitespace-only tag.");
    console.log(`- Attempted with whitespace-only tag. Result: ${JSON.stringify(result)}`);

    console.log("Test: Add successfully and check effects.");
    let addResult = await userInterestConcept.addPersonalInterest({ user: userA, tag });
    assertNotEquals("error" in addResult, true, `Adding '${tag}' should succeed.`);
    console.log(`- Added '${tag}'. Result: ${JSON.stringify(addResult)}`);

    const interests = await userInterestConcept._getPersonalInterests({ user: userA });
    assertEquals(interests.length, 1, "User A should have 1 personal interest.");
    assertEquals(interests[0].tag, tag, `The interest should be '${tag}'.`);
    console.log(`- Verified personal interests: ${JSON.stringify(interests)}`);

    console.log("Test: Cannot add the same tag twice for the same user.");
    let duplicateResult = await userInterestConcept.addPersonalInterest({ user: userA, tag });
    assertEquals("error" in duplicateResult, true, "Should return an error for duplicate tag.");
    console.log(`- Attempted to add duplicate tag. Result: ${JSON.stringify(duplicateResult)}`);
    assertEquals((duplicateResult as { error: string }).error, `User ${userA} already has personal interest in tag '${tag}'.`);

  } finally {
    await client.close();
    console.log("--- addPersonalInterest Requirements Test Finished ---");
  }
});

Deno.test("Action: removePersonalInterest requirements and effects", async () => {
  console.log("--- Starting removePersonalInterest Test ---");
  const [db, client] = await testDb();
  const userInterestConcept = new UserInterestConcept(db);
  const tag = "sports";

  try {
    console.log("Setup: Add a personal interest first.");
    await userInterestConcept.addPersonalInterest({ user: userA, tag });
    let interestsBefore = await userInterestConcept._getPersonalInterests({ user: userA });
    assertEquals(interestsBefore.length, 1, "User A should have 1 personal interest after setup.");
    console.log(`- Interests after setup: ${JSON.stringify(interestsBefore)}`);

    console.log("Test: Cannot remove an empty tag.");
    let result = await userInterestConcept.removePersonalInterest({ user: userA, tag: "" });
    assertEquals("error" in result, true, "Should return an error for empty tag.");
    console.log(`- Attempted with empty tag. Result: ${JSON.stringify(result)}`);

    result = await userInterestConcept.removePersonalInterest({ user: userA, tag: "   " });
    assertEquals("error" in result, true, "Should return an error for whitespace-only tag.");
    console.log(`- Attempted with whitespace-only tag. Result: ${JSON.stringify(result)}`);

    console.log("Test: Cannot remove a non-existent tag.");
    let nonExistentTag = "nonexistent";
    let nonExistentResult = await userInterestConcept.removePersonalInterest({ user: userA, tag: nonExistentTag });
    assertEquals("error" in nonExistentResult, true, "Should return an error for non-existent tag.");
    console.log(`- Attempted to remove non-existent tag. Result: ${JSON.stringify(nonExistentResult)}`);
    assertEquals((nonExistentResult as { error: string }).error, `User ${userA} does not have personal interest in tag '${nonExistentTag}'.`);

    console.log("Test: Successfully remove existing tag and check effects.");
    let removeResult = await userInterestConcept.removePersonalInterest({ user: userA, tag });
    assertEquals("error" in removeResult, false, `Removing '${tag}' should succeed.`);
    console.log(`- Removed '${tag}'. Result: ${JSON.stringify(removeResult)}`);

    let interestsAfter = await userInterestConcept._getPersonalInterests({ user: userA });
    assertEquals(interestsAfter.length, 0, "User A should have 0 personal interests after removal.");
    console.log(`- Verified personal interests: ${JSON.stringify(interestsAfter)}`);

  } finally {
    await client.close();
    console.log("--- removePersonalInterest Test Finished ---");
  }
});

Deno.test("Action: addItemInterest requirements and effects", async () => {
  console.log("--- Starting addItemInterest Test ---");
  const [db, client] = await testDb();
  const userInterestConcept = new UserInterestConcept(db);

  try {
    console.log("Test: Add successfully and check effects.");
    let addResult = await userInterestConcept.addItemInterest({ user: userB, item: item1 });
    assertNotEquals("error" in addResult, true, `Adding interest in '${item1}' for '${userB}' should succeed.`);
    console.log(`- Added interest in '${item1}'. Result: ${JSON.stringify(addResult)}`);

    const itemInterests = await userInterestConcept._getItemInterests({ user: userB });
    assertEquals(itemInterests.length, 1, "User B should have 1 item interest.");
    assertEquals(itemInterests[0].item, item1, `The interest should be in '${item1}'.`);
    console.log(`- Verified item interests: ${JSON.stringify(itemInterests)}`);

    console.log("Test: Cannot add the same item interest twice for the same user.");
    let duplicateResult = await userInterestConcept.addItemInterest({ user: userB, item: item1 });
    assertEquals("error" in duplicateResult, true, "Should return an error for duplicate item interest.");
    console.log(`- Attempted to add duplicate item interest. Result: ${JSON.stringify(duplicateResult)}`);
    assertEquals((duplicateResult as { error: string }).error, `User ${userB} already has interest in item ${item1}.`);

  } finally {
    await client.close();
    console.log("--- addItemInterest Test Finished ---");
  }
});

Deno.test("Action: removeItemInterest requirements and effects", async () => {
  console.log("--- Starting removeItemInterest Test ---");
  const [db, client] = await testDb();
  const userInterestConcept = new UserInterestConcept(db);

  try {
    console.log("Setup: Add an item interest first.");
    await userInterestConcept.addItemInterest({ user: userB, item: item1 });
    let interestsBefore = await userInterestConcept._getItemInterests({ user: userB });
    assertEquals(interestsBefore.length, 1, "User B should have 1 item interest after setup.");
    console.log(`- Interests after setup: ${JSON.stringify(interestsBefore)}`);

    console.log("Test: Cannot remove a non-existent item interest.");
    let nonExistentResult = await userInterestConcept.removeItemInterest({ user: userB, item: item2 });
    assertEquals("error" in nonExistentResult, true, "Should return an error for non-existent item interest.");
    console.log(`- Attempted to remove non-existent item interest. Result: ${JSON.stringify(nonExistentResult)}`);
    assertEquals((nonExistentResult as { error: string }).error, `User ${userB} does not have interest in item ${item2}.`);

    console.log("Test: Successfully remove existing item interest and check effects.");
    let removeResult = await userInterestConcept.removeItemInterest({ user: userB, item: item1 });
    assertEquals("error" in removeResult, false, `Removing interest in '${item1}' for '${userB}' should succeed.`);
    console.log(`- Removed interest in '${item1}'. Result: ${JSON.stringify(removeResult)}`);

    let interestsAfter = await userInterestConcept._getItemInterests({ user: userB });
    assertEquals(interestsAfter.length, 0, "User B should have 0 item interests after removal.");
    console.log(`- Verified item interests: ${JSON.stringify(interestsAfter)}`);

  } finally {
    await client.close();
    console.log("--- removeItemInterest Test Finished ---");
  }
});

Deno.test("Queries: _getPersonalInterests and _getItemInterests handle empty states", async () => {
  console.log("--- Starting Query Empty State Test ---");
  const [db, client] = await testDb();
  const userInterestConcept = new UserInterestConcept(db);

  try {
    console.log("Test: _getPersonalInterests for a user with no personal interests.");
    const personalInterests = await userInterestConcept._getPersonalInterests({ user: userA });
    assertEquals(personalInterests.length, 0, "Should return an empty array for a user with no personal interests.");
    console.log(`- Personal interests for userA (empty): ${JSON.stringify(personalInterests)}`);

    console.log("Test: _getItemInterests for a user with no item interests.");
    const itemInterests = await userInterestConcept._getItemInterests({ user: userA });
    assertEquals(itemInterests.length, 0, "Should return an empty array for a user with no item interests.");
    console.log(`- Item interests for userA (empty): ${JSON.stringify(itemInterests)}`);

  } finally {
    await client.close();
    console.log("--- Query Empty State Test Finished ---");
  }
});
```

# trace:

The following trace demonstrates how the **principle** of the `UserInterest` concept is fulfilled by a sequence of actions.

1.  **Given**: A user `userA` and two generic items `item1` and `item2`.
2.  **Action**: User `userA` adds a personal interest with the tag "programming".
    ```
    UserInterest.addPersonalInterest({ user: "userA", tag: "programming" })
    ```
3.  **Result**: A new `UserPersonalInterest` record is created, and its ID is returned.
    ```
    { personalInterest: "personalInterest1" }
    ```
4.  **Action**: User `userA` adds another personal interest with the tag "hiking".
    ```
    UserInterest.addPersonalInterest({ user: "userA", tag: "hiking" })
    ```
5.  **Result**: A new `UserPersonalInterest` record is created, and its ID is returned.
    ```
    { personalInterest: "personalInterest2" }
    ```
6.  **Action**: User `userA` indicates interest in `item1`.
    ```
    UserInterest.addItemInterest({ user: "userA", item: "item1" })
    ```
7.  **Result**: A new `UserItemInterest` record is created, and its ID is returned.
    ```
    { itemInterest: "itemInterest1" }
    ```
8.  **Action**: User `userA` indicates interest in `item2`.
    ```
    UserInterest.addItemInterest({ user: "userA", item: "item2" })
    ```
9.  **Result**: A new `UserItemInterest` record is created, and its ID is returned.
    ```
    { itemInterest: "itemInterest2" }
    ```
10. **Action**: User `userA` decides to remove the "programming" tag.
    ```
    UserInterest.removePersonalInterest({ user: "userA", tag: "programming" })
    ```
11. **Result**: The `UserPersonalInterest` record for "programming" is removed.
    ```
    {}
    ```
12. **Action**: To verify, `userA` retrieves all their personal interests.
    ```
    UserInterest._getPersonalInterests({ user: "userA" })
    ```
13. **Result**: Only the "hiking" tag is returned, confirming the removal.
    ```
    [
      { _id: "personalInterest2", user: "userA", tag: "hiking" }
    ]
    ```
14. **Action**: User `userA` decides to remove interest in `item2`.
    ```
    UserInterest.removeItemInterest({ user: "userA", item: "item2" })
    ```
15. **Result**: The `UserItemInterest` record for `item2` is removed.
    ```
    {}
    ```
16. **Action**: To verify, `userA` retrieves all their item interests.
    ```
    UserInterest._getItemInterests({ user: "userA" })
    ```
17. **Result**: Only `item1` is returned, confirming the removal.
    ```
    [
      { _id: "itemInterest1", user: "userA", item: "item1" }
    ]
    ```