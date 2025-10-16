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
    console.log("Trace: Registering a new user (Alice)...");
    const registerResult = await authConcept.register({ username: usernameAlice, password: passwordAlice });
    assertNotEquals("error" in registerResult, true, `Registering Alice failed: ${JSON.stringify(registerResult)}`);
    const { user: aliceId } = registerResult as { user: ID };
    assertExists(aliceId, "A user ID should be returned after successful registration.");
    console.log(`Trace: User Alice registered with ID: ${aliceId}`);

    console.log("Trace: Attempting to authenticate Alice with correct credentials...");
    const authResult = await authConcept.authenticate({ username: usernameAlice, password: passwordAlice });
    assertNotEquals("error" in authResult, true, `Authentication for Alice failed: ${JSON.stringify(authResult)}`);
    const { user: authenticatedAliceId } = authResult as { user: ID };
    assertEquals(authenticatedAliceId, aliceId, "Authenticated user ID should match registered user ID.");
    console.log(`Trace: User Alice successfully authenticated.`);

    console.log("Principle fulfilled: A user was registered and then successfully authenticated.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: register - Successful registration", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    console.log("Testing: Successful registration of a new user.");
    const registerResult = await authConcept.register({ username: usernameBob, password: passwordBob });
    assertNotEquals("error" in registerResult, true, `Registration failed unexpectedly: ${JSON.stringify(registerResult)}`);
    const { user: bobId } = registerResult as { user: ID };
    assertExists(bobId, "User ID should be returned on successful registration.");
    console.log(`Effect confirmed: User Bob registered with ID: ${bobId}`);

    const userQuery = await authConcept._getUserByUsername({ username: usernameBob });
    assertNotEquals("error" in userQuery, true, `Query for Bob failed: ${JSON.stringify(userQuery)}`);
    assertEquals((userQuery as { user: ID }[])[0].user, bobId, "Registered user should be retrievable by username.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: register - Requires: username must not already exist", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    console.log("Testing: Registering a username that already exists.");
    await authConcept.register({ username: usernameAlice, password: passwordAlice }); // First registration (expected to succeed)
    console.log(`Setup: User '${usernameAlice}' registered once.`);

    const duplicateRegisterResult = await authConcept.register({ username: usernameAlice, password: passwordAlice }); // Second registration (expected to fail)
    assertEquals("error" in duplicateRegisterResult, true, "Registering a duplicate username should return an error.");
    assertEquals((duplicateRegisterResult as { error: string }).error, `Username '${usernameAlice}' already exists`, "Error message should indicate duplicate username.");
    console.log(`Requirement confirmed: Cannot register with an existing username. Error: ${JSON.stringify(duplicateRegisterResult)}`);
  } finally {
    await client.close();
  }
});

Deno.test("Action: authenticate - Successful authentication", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    console.log("Testing: Successful authentication with correct credentials.");
    const registerResult = await authConcept.register({ username: usernameAlice, password: passwordAlice });
    const { user: aliceId } = registerResult as { user: ID };
    console.log(`Setup: User Alice registered with ID: ${aliceId}`);

    const authResult = await authConcept.authenticate({ username: usernameAlice, password: passwordAlice });
    assertNotEquals("error" in authResult, true, `Authentication failed unexpectedly: ${JSON.stringify(authResult)}`);
    const { user: authenticatedAliceId } = authResult as { user: ID };
    assertEquals(authenticatedAliceId, aliceId, "Authenticated user ID should match registered user ID.");
    console.log(`Effect confirmed: User Alice authenticated successfully.`);
  } finally {
    await client.close();
  }
});

Deno.test("Action: authenticate - Requires: user with given username and password must exist", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    await authConcept.register({ username: usernameAlice, password: passwordAlice });
    console.log(`Setup: User Alice registered.`);

    console.log("Testing: Authentication with non-existent username.");
    const authNonExistentUser = await authConcept.authenticate({ username: nonExistentUsername, password: passwordAlice });
    assertEquals("error" in authNonExistentUser, true, "Authentication with non-existent username should fail.");
    assertEquals((authNonExistentUser as { error: string }).error, "Invalid username or password", "Error message for non-existent user should be correct.");
    console.log(`Requirement confirmed: Failed authentication for non-existent user. Error: ${JSON.stringify(authNonExistentUser)}`);

    console.log("Testing: Authentication with incorrect password.");
    const authWrongPassword = await authConcept.authenticate({ username: usernameAlice, password: wrongPassword });
    assertEquals("error" in authWrongPassword, true, "Authentication with incorrect password should fail.");
    assertEquals((authWrongPassword as { error: string }).error, "Invalid username or password", "Error message for wrong password should be correct.");
    console.log(`Requirement confirmed: Failed authentication for incorrect password. Error: ${JSON.stringify(authWrongPassword)}`);
  } finally {
    await client.close();
  }
});

Deno.test("Query: _getUsername - Retrieve username by User ID", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    const registerResult = await authConcept.register({ username: usernameAlice, password: passwordAlice });
    const { user: aliceId } = registerResult as { user: ID };
    console.log(`Setup: User Alice registered with ID: ${aliceId}`);

    console.log("Testing: Retrieving username for existing user ID.");
    const usernameResult = await authConcept._getUsername({ user: aliceId });
    assertNotEquals("error" in usernameResult, true, `_getUsername failed unexpectedly: ${JSON.stringify(usernameResult)}`);

    const usernames = usernameResult as { username: string }[];

    assertEquals(usernames.length, 1, "Should return an array with one username.");
    assertEquals(usernames[0].username, usernameAlice, "Returned username should match registered username.");
    console.log(`Effect confirmed: Username '${usernameAlice}' retrieved for user ID '${aliceId}'.`);

    console.log("Testing: Retrieving username for non-existent user ID.");
    const nonExistentId = "user:fake" as ID;
    const errorResult = await authConcept._getUsername({ user: nonExistentId });
    assertEquals("error" in errorResult, true, "_getUsername for non-existent user should return an error.");
    assertEquals((errorResult as { error: string }).error, `User with ID '${nonExistentId}' not found`, "Error message should indicate user not found.");
    console.log(`Requirement confirmed: Failed to retrieve username for non-existent user. Error: ${JSON.stringify(errorResult)}`);
  } finally {
    await client.close();
  }
});

Deno.test("Query: _getUserByUsername - Retrieve User ID by username", async () => {
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    const registerResult = await authConcept.register({ username: usernameBob, password: passwordBob });
    const { user: bobId } = registerResult as { user: ID };
    console.log(`Setup: User Bob registered with ID: ${bobId}`);

    console.log("Testing: Retrieving user ID for existing username.");
    const userResult = await authConcept._getUserByUsername({ username: usernameBob });
    assertNotEquals("error" in userResult, true, `_getUserByUsername failed unexpectedly: ${JSON.stringify(userResult)}`);

    const users = userResult as { user: ID }[];

    assertEquals(users.length, 1, "Should return an array with one user ID.");
    assertEquals(users[0].user, bobId, "Returned user ID should match registered user ID.");
    console.log(`Effect confirmed: User ID '${bobId}' retrieved for username '${usernameBob}'.`);

    console.log("Testing: Retrieving user ID for non-existent username.");
    const errorResult = await authConcept._getUserByUsername({ username: nonExistentUsername });
    assertEquals("error" in errorResult, true, "_getUserByUsername for non-existent username should return an error.");
    assertEquals((errorResult as { error: string }).error, `User with username '${nonExistentUsername}' not found`, "Error message should indicate username not found.");
    console.log(`Requirement confirmed: Failed to retrieve user ID for non-existent username. Error: ${JSON.stringify(errorResult)}`);
  } finally {
    await client.close();
  }
});