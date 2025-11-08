---
timestamp: 'Fri Nov 07 2025 16:56:42 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_165642.0a046d4f.md]]'
content_id: cec39a46b1c6dcec693fd603734bf39cd593b6440f43ff56ad5f709bb52a0969
---

# file: src/userauthentication/UserAuthenticationConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import UserAuthenticationConcept from "./UserAuthenticationConcept.ts";

const usernameAlice = "alice_jones";
const passwordAlice = "securePass123";
const usernameBob = "bob_smith";
const passwordBob = "anotherSecurePass";
const nonExistentUsername = "unknown_user";
const wrongPassword = "wrongPassword";

Deno.test("Principle: Register and then authenticate a user successfully", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    console.log("--- Trace Start: Principle Test ---");
    console.log(`Action: Registering a new user '${usernameAlice}'...`);
    const registerResult = await authConcept.register({ username: usernameAlice, password: passwordAlice });
    assertNotEquals("error" in registerResult, true, `Registration for Alice failed: ${JSON.stringify(registerResult)}`);
    const { user: aliceId } = registerResult as { user: ID };
    assertExists(aliceId, "A user ID should be returned after successful registration.");
    console.log(`Result: User '${usernameAlice}' registered with ID: ${aliceId}`);

    console.log(`Action: Attempting to authenticate '${usernameAlice}' with correct credentials...`);
    const authResult = await authConcept.authenticate({ username: usernameAlice, password: passwordAlice });
    assertNotEquals("error" in authResult, true, `Authentication for Alice failed: ${JSON.stringify(authResult)}`);
    const { user: authenticatedAliceId } = authResult as { user: ID };
    assertEquals(authenticatedAliceId, aliceId, "Authenticated user ID should match registered user ID.");
    console.log(`Result: User '${usernameAlice}' successfully authenticated, returned ID: ${authenticatedAliceId}`);

    console.log("Principle Fulfilled: A user was registered and then successfully authenticated using the same credentials.");
    console.log("--- Trace End: Principle Test ---");
  } finally {
    await client.close();
  }
});

Deno.test("Action: register - Successful registration", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    console.log("\n--- Test: register - Successful registration ---");
    console.log(`Action: Registering user '${usernameBob}' with password '${passwordBob}'...`);
    const registerResult = await authConcept.register({ username: usernameBob, password: passwordBob });
    assertNotEquals("error" in registerResult, true, `Registration failed unexpectedly: ${JSON.stringify(registerResult)}`);
    const { user: bobId } = registerResult as { user: ID };
    assertExists(bobId, "User ID should be returned on successful registration.");
    console.log(`Effect Confirmed: User '${usernameBob}' registered with ID: ${bobId}.`);

    console.log(`Query: Verifying registration using _getUserByUsername for '${usernameBob}'...`);
    const userQuery = await authConcept._getUserByUsername({ username: usernameBob });
    assertEquals(userQuery.length, 1, "Should return an array with one user.");
    assertNotEquals("error" in userQuery[0], true, `Query for Bob failed: ${JSON.stringify(userQuery[0])}`);
    assertEquals((userQuery[0] as { user: ID }).user, bobId, "Registered user should be retrievable by username.");
    console.log(`Verification: User ID '${(userQuery[0] as { user: ID }).user}' found for username '${usernameBob}'.`);
    console.log("--- End Test ---");
  } finally {
    await client.close();
  }
});

Deno.test("Action: register - Requires: username must not already exist", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    console.log("\n--- Test: register - Duplicate username requirement ---");
    console.log(`Setup: Registering user '${usernameAlice}' for the first time...`);
    await authConcept.register({ username: usernameAlice, password: passwordAlice });
    console.log(`Setup Complete: User '${usernameAlice}' registered.`);

    console.log(`Action: Attempting to register user '${usernameAlice}' again (expected to fail)...`);
    const duplicateRegisterResult = await authConcept.register({ username: usernameAlice, password: "anotherPassword" }); // Different password to confirm it's username unique constraint
    assertEquals("error" in duplicateRegisterResult, true, "Registering a duplicate username should return an error.");
    assertEquals((duplicateRegisterResult as { error: string }).error, `Username '${usernameAlice}' already exists`, "Error message should indicate duplicate username.");
    console.log(`Requirement Confirmed: Cannot register with an existing username. Error: ${JSON.stringify(duplicateRegisterResult)}`);
    console.log("--- End Test ---");
  } finally {
    await client.close();
  }
});

Deno.test("Action: authenticate - Successful authentication", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    console.log("\n--- Test: authenticate - Successful authentication ---");
    console.log(`Setup: Registering user '${usernameAlice}'...`);
    const registerResult = await authConcept.register({ username: usernameAlice, password: passwordAlice });
    const { user: aliceId } = registerResult as { user: ID };
    console.log(`Setup Complete: User Alice registered with ID: ${aliceId}`);

    console.log(`Action: Authenticating user '${usernameAlice}' with correct password...`);
    const authResult = await authConcept.authenticate({ username: usernameAlice, password: passwordAlice });
    assertNotEquals("error" in authResult, true, `Authentication failed unexpectedly: ${JSON.stringify(authResult)}`);
    const { user: authenticatedAliceId } = authResult as { user: ID };
    assertEquals(authenticatedAliceId, aliceId, "Authenticated user ID should match registered user ID.");
    console.log(`Effect Confirmed: User '${usernameAlice}' authenticated successfully, returned ID: ${authenticatedAliceId}.`);
    console.log("--- End Test ---");
  } finally {
    await client.close();
  }
});

Deno.test("Action: authenticate - Requires: user with given username and password must exist", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    console.log("\n--- Test: authenticate - Invalid credentials requirements ---");
    await authConcept.register({ username: usernameAlice, password: passwordAlice });
    console.log(`Setup: User '${usernameAlice}' registered.`);

    console.log(`Action: Attempting authentication with non-existent username '${nonExistentUsername}' (expected to fail)...`);
    const authNonExistentUser = await authConcept.authenticate({ username: nonExistentUsername, password: passwordAlice });
    assertEquals("error" in authNonExistentUser, true, "Authentication with non-existent username should fail.");
    assertEquals((authNonExistentUser as { error: string }).error, "Invalid username or password", "Error message for non-existent user should be correct.");
    console.log(`Requirement Confirmed: Failed authentication for non-existent user. Error: ${JSON.stringify(authNonExistentUser)}`);

    console.log(`Action: Attempting authentication for '${usernameAlice}' with incorrect password '${wrongPassword}' (expected to fail)...`);
    const authWrongPassword = await authConcept.authenticate({ username: usernameAlice, password: wrongPassword });
    assertEquals("error" in authWrongPassword, true, "Authentication with incorrect password should fail.");
    assertEquals((authWrongPassword as { error: string }).error, "Invalid username or password", "Error message for wrong password should be correct.");
    console.log(`Requirement Confirmed: Failed authentication for incorrect password. Error: ${JSON.stringify(authWrongPassword)}`);
    console.log("--- End Test ---");
  } finally {
    await client.close();
  }
});

Deno.test("Query: _getUsername - Retrieve username by User ID", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    console.log("\n--- Test: _getUsername query ---");
    const registerResult = await authConcept.register({ username: usernameAlice, password: passwordAlice });
    const { user: aliceId } = registerResult as { user: ID };
    console.log(`Setup: User '${usernameAlice}' registered with ID: ${aliceId}`);

    console.log(`Query: Retrieving username for existing user ID '${aliceId}'...`);
    const usernameResult = await authConcept._getUsername({ user: aliceId });
    assertEquals(usernameResult.length, 1, "Should return an array with one username.");
    assertEquals(usernameResult[0].username, usernameAlice, "Returned username should match registered username.");
    console.log(`Effect Confirmed: Username '${usernameResult[0].username}' retrieved for user ID '${aliceId}'.`);

    console.log("Query: Retrieving username for non-existent user ID 'user:fake' (expected empty array)...");
    const nonExistentId = "user:fake" as ID;
    const errorResult = await authConcept._getUsername({ user: nonExistentId });
    assertEquals(errorResult.length, 0, "_getUsername for non-existent user should return an empty array.");
    console.log(`Requirement Confirmed: Returned empty array for non-existent user ID '${nonExistentId}'.`);
    console.log("--- End Test ---");
  } finally {
    await client.close();
  }
});

Deno.test("Query: _getUserByUsername - Retrieve User ID by username", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    console.log("\n--- Test: _getUserByUsername query ---");
    const registerResult = await authConcept.register({ username: usernameBob, password: passwordBob });
    const { user: bobId } = registerResult as { user: ID };
    console.log(`Setup: User '${usernameBob}' registered with ID: ${bobId}`);

    console.log(`Query: Retrieving user ID for existing username '${usernameBob}'...`);
    const userResult = await authConcept._getUserByUsername({ username: usernameBob });
    assertEquals(userResult.length, 1, "Should return an array with one user ID.");
    assertNotEquals("error" in userResult[0], true, `_getUserByUsername failed unexpectedly: ${JSON.stringify(userResult[0])}`);
    assertEquals((userResult[0] as { user: ID }).user, bobId, "Returned user ID should match registered user ID.");
    console.log(`Effect Confirmed: User ID '${(userResult[0] as { user: ID }).user}' retrieved for username '${usernameBob}'.`);

    console.log(`Query: Retrieving user ID for non-existent username '${nonExistentUsername}' (expected error array)...`);
    const errorResult = await authConcept._getUserByUsername({ username: nonExistentUsername });
    assertEquals(errorResult.length, 1, "_getUserByUsername for non-existent username should return an array with an error object.");
    assertEquals("error" in errorResult[0], true, "The returned object should contain an error.");
    assertEquals((errorResult[0] as { error: string }).error, `User with username '${nonExistentUsername}' not found`, "Error message should indicate username not found.");
    console.log(`Requirement Confirmed: Failed to retrieve user ID for non-existent username. Error: ${JSON.stringify(errorResult[0])}`);
    console.log("--- End Test ---");
  } finally {
    await client.close();
  }
});
```
