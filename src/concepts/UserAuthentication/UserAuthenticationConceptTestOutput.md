```
running 7 tests from ./src/concepts/UserAuthentication/UserAuthenticationConcept.test.ts

Principle: Register and then authenticate a user successfully ...
------- output -------
Trace: Registering a new user (Alice)...
Trace: User Alice registered with ID: 0199ea5f-d97a-70c8-8216-a5dd62a20137
Trace: Attempting to authenticate Alice with correct credentials...
Trace: User Alice successfully authenticated.
Principle fulfilled: A user was registered and then successfully authenticated.
----- output end -----
Principle: Register and then authenticate a user successfully ... ok (631ms)


Action: register - Successful registration ...
------- output -------
Testing: Successful registration of a new user.
Effect confirmed: User Bob registered with ID: 0199ea5f-dc05-789d-88ff-4543b0d17738
----- output end -----
Action: register - Successful registration ... ok (631ms)


Action: register - Requires: username must not already exist ...
------- output -------
Testing: Registering a username that already exists.
Setup: User 'alice_jones' registered once.
Requirement confirmed: Cannot register with an existing username. Error: {"error":"Username 'alice_jones' already exists"}
----- output end -----
Action: register - Requires: username must not already exist ... ok (632ms)


Action: authenticate - Successful authentication ...
------- output -------
Testing: Successful authentication with correct credentials.
Setup: User Alice registered with ID: 0199ea5f-e0f6-7d48-a82d-5ca5fd0fc6b3
Effect confirmed: User Alice authenticated successfully.
----- output end -----
Action: authenticate - Successful authentication ... ok (630ms)


Action: authenticate - Requires: user with given username and password must exist ...
------- output -------
Setup: User Alice registered.
Testing: Authentication with non-existent username.
Requirement confirmed: Failed authentication for non-existent user. Error: {"error":"Invalid username or password"}
Testing: Authentication with incorrect password.
Requirement confirmed: Failed authentication for incorrect password. Error: {"error":"Invalid username or password"}
----- output end -----
Action: authenticate - Requires: user with given username and password must exist ... ok (599ms)


Query: _getUsername - Retrieve username by User ID ...
------- output -------
Setup: User Alice registered with ID: 0199ea5f-e57a-71de-9b4c-3c7065d402a1
Testing: Retrieving username for existing user ID.
Effect confirmed: Username 'alice_jones' retrieved for user ID '0199ea5f-e57a-71de-9b4c-3c7065d402a1'.
Testing: Retrieving username for non-existent user ID.
Requirement confirmed: Failed to retrieve username for non-existent user. Error: {"error":"User with ID 'user:fake' not found"}
----- output end -----
Query: _getUsername - Retrieve username by User ID ... ok (570ms)


Query: _getUserByUsername - Retrieve User ID by username ...
------- output -------
Setup: User Bob registered with ID: 0199ea5f-e7f6-7d51-adf1-ff7912c6263e
Testing: Retrieving user ID for existing username.
Effect confirmed: User ID '0199ea5f-e7f6-7d51-adf1-ff7912c6263e' retrieved for username 'bob_smith'.
Testing: Retrieving user ID for non-existent username.
Requirement confirmed: Failed to retrieve user ID for non-existent username. Error: {"error":"User with username 'unknown_user' not found"}
----- output end -----
Query: _getUserByUsername - Retrieve User ID by username ... ok (633ms)


ok | 7 passed | 0 failed (4s)
```
