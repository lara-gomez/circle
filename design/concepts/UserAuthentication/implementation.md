[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

[@UserAuthentication](./UserAuthentication.md)

[@example-implementation](../LikertSurvey/implementation.md)

# implement: UserAuthentication
# response:

# concept: UserAuthentication \[User]

*   **concept**: UserAuthentication \[User]

*   **purpose**: enable users to register and verify their identity using a username and password.

*   **principle**: If a user registers with a unique username and password, they can then authenticate using those same credentials to be identified as the registered user.

*   **state**:
    *   a set of Users with
        *   a username String
        *   a password String

*   **actions**:
    *   register (username: String, password: String): (user: User)
        *   requires: the username must not already exist in the system
        *   effects: create a new User with this username and password, returns the user

    *   authenticate (username: String, password: String): (user: User)
        *   requires: there exists a user with the given username and password
        *   effects: returns the registered user that matches with the given username and password

*   **queries**:
    *   _getUsername (user: User) : (username: String)
        *   requires: user exists
        *   effects: returns the username associated with the user

    *   _getUserByUsername (username: String) : (user: User) | (error: String)
        *   requires: a user with the given username exists
        *   effects: if a user with the given username exists, returns that user; otherwise returns an error


```typescript
// file: src/UserAuthentication/UserAuthenticationConcept.ts
import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

/**
 * @concept UserAuthentication [User]
 * @purpose enable users to register and verify their identity using a username and password.
 * @principle If a user registers with a unique username and password, they can then authenticate
 *   using those same credentials to be identified as the registered user.
 */

// Declare collection prefix, use concept name
const PREFIX = "UserAuthentication" + ".";

// Generic types of this concept
type User = ID;

/**
 * State:
 * a set of Users with
 *   a username String
 *   a password String
 */
interface UserDocument {
  _id: User;
  username: string;
  password: string; // WARNING: In a production system, passwords should always be hashed and never stored in plain text.
}

export default class UserAuthenticationConcept {
  private users: Collection<UserDocument>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
  }

  /**
   * register (username: String, password: String): (user: User) | (error: String)
   *
   * @requires the username must not already exist in the system
   * @effects creates a new User with this username and password, returns the user
   */
  async register(
    { username, password }: { username: string; password: string },
  ): Promise<{ user: User } | { error: string }> {
    // Check if the username already exists (Precondition)
    const existingUser = await this.users.findOne({ username });
    if (existingUser) {
      return { error: `Username '${username}' already exists` };
    }

    // Generate a fresh ID for the new user
    const newUser: UserDocument = {
      _id: freshID() as User,
      username,
      password, // For this exercise, storing as plain text. In production, hash!
    };

    // Insert the new user into the database (Effects)
    await this.users.insertOne(newUser);

    return { user: newUser._id };
  }

  /**
   * authenticate (username: String, password: String): (user: User) | (error: String)
   *
   * @requires there exists a user with the given username and password
   * @effects returns the registered user that matches with the given username and password
   */
  async authenticate(
    { username, password }: { username: string; password: string },
  ): Promise<{ user: User } | { error: string }> {
    // Find a user with the given username and password (Precondition)
    // WARNING: In production, you would retrieve by username, then securely compare hashed passwords.
    const authenticatedUser = await this.users.findOne({ username, password });
    if (!authenticatedUser) {
      return { error: "Invalid username or password" };
    }

    // Return the authenticated user's ID (Effects)
    return { user: authenticatedUser._id };
  }

  /**
   * _getUsername (user: User) : (username: String)[] | (error: String)
   *
   * @requires user exists
   * @effects returns the username associated with the user
   */
  async _getUsername(
    { user }: { user: User },
  ): Promise<{ username: string }[] | { error: string }> {
    const foundUser = await this.users.findOne({ _id: user });
    if (!foundUser) {
      return { error: `User with ID '${user}' not found` };
    }
    // Queries return an array of dictionaries
    return [{ username: foundUser.username }];
  }

  /**
   * _getUserByUsername (username: String) : (user: User)[] | (error: String)
   *
   * @requires a user with the given username exists
   * @effects if a user with the given username exists, returns that user; otherwise returns an error
   */
  async _getUserByUsername(
    { username }: { username: string },
  ): Promise<{ user: User }[] | { error: string }> {
    const foundUser = await this.users.findOne({ username });
    if (!foundUser) {
      return { error: `User with username '${username}' not found` };
    }
    // Queries return an array of dictionaries
    return [{ user: foundUser._id }];
  }
}
```