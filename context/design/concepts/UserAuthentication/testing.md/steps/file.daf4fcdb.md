---
timestamp: 'Wed Oct 15 2025 19:41:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_194145.b11c5bdb.md]]'
content_id: daf4fcdbcc04cb75252c248d4d572de2e0662d85ca5df7db8553547b7b113344
---

# file: src/UserAuthentication/UserAuthenticationConcept.test.ts

```typescript
import { assertEquals, assertExists, assertObjectMatch } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import UserAuthenticationConcept from "./UserAuthenticationConcept.ts";

Deno.test("UserAuthentication Concept Tests", async (t) => {
  const [db, client] = await testDb();
  const concept = new UserAuthenticationConcept(db);

  // Helper function to check for error objects
  const isError = (result: any): result is { error: string } => {
    return result && typeof result === "object" && "error" in result;
  };

  await t.step("Action: register - successful registration", async () => {
    console.log("--- Testing register: successful registration ---");
    const username = "testuser";
    const password = "password123";

    console.log(`Attempting to register user: ${username}`);
    const result = await concept.register({ username, password });

    console.log(`Register action result: ${JSON.stringify(result)}`);
    assertExists(result, "Register should return a result");
    assertEquals(isError(result), false, `Register should not return an error: ${result.error}`);
    assertExists((result as { user: ID }).user, "Registered user ID should be returned");

    const userId = (result as { user: ID }).user;
    console.log(`Registered user ID: ${userId}`);

    // Verify effects using queries
    console.log(`Verifying effects: querying username for user ID ${userId}`);
    const queriedUsernameResult = await concept._getUsername({ user: userId });
    assertEquals(isError(queriedUsernameResult), false, `_getUsername should not return an error: ${queriedUsernameResult.error}`);
    assertEquals(
      (queriedUsernameResult as { username: string }[])[0].username,
      username,
      "Queried username should match registered username",
    );
    console.log(`Verified username: ${(queriedUsernameResult as { username: string }[])[0].username}`);

    console.log(`Verifying effects: querying user by username ${username}`);
    const queriedUserByUsernameResult = await concept._getUserByUsername({ username });
    assertEquals(isError(queriedUserByUsernameResult), false, `_getUserByUsername should not return an error: ${queriedUserByUsernameResult.error}`);
    assertEquals(
      (queriedUserByUsernameResult as { user: ID }[])[0].user,
      userId,
      "Queried user ID by username should match registered user ID",
    );
    console.log(`Verified user ID by username: ${(queriedUserByUsernameResult as { user: ID }[])[0].user}`);
  });

  await t.step("Action: register - username already exists (requires unmet)", async () => {
    console.log("--- Testing register: username already exists ---");
    const username = "existinguser";
    const password = "securepassword";

    console.log(`First registration for '${username}'`);
    const firstResult = await concept.register({ username, password });
    assertEquals(isError(firstResult), false, "First registration should succeed");
    const userId = (firstResult as { user: ID }).user;
    console.log(`User '${username}' registered with ID: ${userId}`);

    console.log(`Attempting to register same username '${username}' again`);
    const secondResult = await concept.register({ username, password: "anotherpassword" }); // Different password to confirm it's username
    console.log(`Second register action result: ${JSON.stringify(secondResult)}`);
    assertEquals(isError(secondResult), true, "Second registration with same username should fail");
    assertObjectMatch(secondResult, { error: `Username '${username}' already exists` });
    console.log(`Verified error message: ${secondResult.error}`);
  });

  await t.step("Action: authenticate - successful authentication", async () => {
    console.log("--- Testing authenticate: successful authentication ---");
    const username = "authuser";
    const password = "authpassword";

    console.log(`Registering user '${username}' for authentication test`);
    const registerResult = await concept.register({ username, password });
    assertEquals(isError(registerResult), false, "Registration should succeed for auth test");
    const registeredUserId = (registerResult as { user: ID }).user;
    console.log(`User '${username}' registered with ID: ${registeredUserId}`);

    console.log(`Attempting to authenticate user: ${username}`);
    const authResult = await concept.authenticate({ username, password });
    console.log(`Authenticate action result: ${JSON.stringify(authResult)}`);
    assertEquals(isError(authResult), false, `Authentication should not return an error: ${authResult.error}`);
    assertExists((authResult as { user: ID }).user, "Authenticated user ID should be returned");
    assertEquals(
      (authResult as { user: ID }).user,
      registeredUserId,
      "Authenticated user ID should match registered user ID",
    );
    console.log(`Authenticated user ID: ${(authResult as { user: ID }).user}`);
  });

  await t.step("Action: authenticate - incorrect username (requires unmet)", async () => {
    console.log("--- Testing authenticate: incorrect username ---");
    const username = "nonexistentuser";
    const password = "anypassword";

    console.log(`Attempting to authenticate with nonexistent username: ${username}`);
    const result = await concept.authenticate({ username, password });
    console.log(`Authenticate action result: ${JSON.stringify(result)}`);
    assertEquals(isError(result), true, "Authentication with incorrect username should fail");
    assertObjectMatch(result, { error: "Invalid username or password" });
    console.log(`Verified error message: ${result.error}`);
  });

  await t.step("Action: authenticate - incorrect password (requires unmet)", async () => {
    console.log("--- Testing authenticate: incorrect password ---");
    const username = "correctuser";
    const password = "correctpassword";
    const incorrectPassword = "wrongpassword";

    console.log(`Registering user '${username}' for password test`);
    const registerResult = await concept.register({ username, password });
    assertEquals(isError(registerResult), false, "Registration should succeed for password test");
    console.log(`User '${username}' registered.`);

    console.log(`Attempting to authenticate with correct username but incorrect password`);
    const result = await concept.authenticate({ username, password: incorrectPassword });
    console.log(`Authenticate action result: ${JSON.stringify(result)}`);
    assertEquals(isError(result), true, "Authentication with incorrect password should fail");
    assertObjectMatch(result, { error: "Invalid username or password" });
    console.log(`Verified error message: ${result.error}`);
  });

  await t.step("Query: _getUsername - successful retrieval", async () => {
    console.log("--- Testing _getUsername: successful retrieval ---");
    const username = "queryuser";
    const password = "querypassword";

    console.log(`Registering user '${username}'`);
    const registerResult = await concept.register({ username, password });
    assertEquals(isError(registerResult), false, "Registration should succeed");
    const userId = (registerResult as { user: ID }).user;
    console.log(`User '${username}' registered with ID: ${userId}`);

    console.log(`Querying username for user ID: ${userId}`);
    const queryResult = await concept._getUsername({ user: userId });
    console.log(`_getUsername result: ${JSON.stringify(queryResult)}`);
    assertEquals(isError(queryResult), false, `_getUsername should not return an error: ${queryResult.error}`);
    assertEquals(
      (queryResult as { username: string }[])[0].username,
      username,
      "Queried username should match",
    );
    console.log(`Verified username: ${(queryResult as { username: string }[])[0].username}`);
  });

  await t.step("Query: _getUsername - user not found (requires unmet)", async () => {
    console.log("--- Testing _getUsername: user not found ---");
    const nonexistentUserId = "nonexistent:user" as ID;

    console.log(`Querying username for nonexistent user ID: ${nonexistentUserId}`);
    const queryResult = await concept._getUsername({ user: nonexistentUserId });
    console.log(`_getUsername result: ${JSON.stringify(queryResult)}`);
    assertEquals(isError(queryResult), true, "Query for nonexistent user should fail");
    assertObjectMatch(queryResult, { error: `User with ID '${nonexistentUserId}' not found` });
    console.log(`Verified error message: ${queryResult.error}`);
  });

  await t.step("Query: _getUserByUsername - successful retrieval", async () => {
    console.log("--- Testing _getUserByUsername: successful retrieval ---");
    const username = "querybyusername";
    const password = "querypassword";

    console.log(`Registering user '${username}'`);
    const registerResult = await concept.register({ username, password });
    assertEquals(isError(registerResult), false, "Registration should succeed");
    const userId = (registerResult as { user: ID }).user;
    console.log(`User '${username}' registered with ID: ${userId}`);

    console.log(`Querying user ID for username: ${username}`);
    const queryResult = await concept._getUserByUsername({ username });
    console.log(`_getUserByUsername result: ${JSON.stringify(queryResult)}`);
    assertEquals(isError(queryResult), false, `_getUserByUsername should not return an error: ${queryResult.error}`);
    assertEquals(
      (queryResult as { user: ID }[])[0].user,
      userId,
      "Queried user ID should match",
    );
    console.log(`Verified user ID: ${(queryResult as { user: ID }[])[0].user}`);
  });

  await t.step("Query: _getUserByUsername - username not found (requires unmet)", async () => {
    console.log("--- Testing _getUserByUsername: username not found ---");
    const nonexistentUsername = "nonexistentusername";

    console.log(`Querying user ID for nonexistent username: ${nonexistentUsername}`);
    const queryResult = await concept._getUserByUsername({ username: nonexistentUsername });
    console.log(`_getUserByUsername result: ${JSON.stringify(queryResult)}`);
    assertEquals(isError(queryResult), true, "Query for nonexistent username should fail");
    assertObjectMatch(queryResult, { error: `User with username '${nonexistentUsername}' not found` });
    console.log(`Verified error message: ${queryResult.error}`);
  });

  await t.step("Principle: If a user registers and authenticates, they are identified", async () => {
    console.log("--- Testing principle: register then authenticate ---");
    const principleUsername = "principleUser";
    const principlePassword = "principlePassword1";

    console.log(`1. Action: register('${principleUsername}', '...')`);
    const registerResult = await concept.register({
      username: principleUsername,
      password: principlePassword,
    });
    console.log(`   Result: ${JSON.stringify(registerResult)}`);
    assertEquals(isError(registerResult), false, "Registration should succeed as per principle");
    const registeredUser = (registerResult as { user: ID }).user;
    assertExists(registeredUser, "A user ID should be returned upon registration");
    console.log(`   Registered User ID: ${registeredUser}`);

    console.log(`2. Action: authenticate('${principleUsername}', '...')`);
    const authenticateResult = await concept.authenticate({
      username: principleUsername,
      password: principlePassword,
    });
    console.log(`   Result: ${JSON.stringify(authenticateResult)}`);
    assertEquals(isError(authenticateResult), false, "Authentication should succeed as per principle");
    const authenticatedUser = (authenticateResult as { user: ID }).user;
    assertExists(authenticatedUser, "A user ID should be returned upon authentication");
    console.log(`   Authenticated User ID: ${authenticatedUser}`);

    console.log(`3. Verification: Check if authenticated user ID matches registered user ID`);
    assertEquals(
      authenticatedUser,
      registeredUser,
      "The authenticated user must be the same as the registered user",
    );
    console.log("   Principle confirmed: Authenticated user matches the registered user.");
  });

  await client.close();
});
```
