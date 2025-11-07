---
timestamp: 'Fri Nov 07 2025 13:08:17 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_130817.c13081e6.md]]'
content_id: dc2dd0191edea0da18cdbc124792e024554fac14b72a12a643faaba9c504a0c5
---

# response:

```typescript
// file: src/userauthentication/UserAuthenticationConcept.ts
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
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
 *   an isAuthenticated Flag
 */
interface UserDocument {
  _id: User;
  username: string;
  password: string; // WARNING: In a production system, passwords should always be hashed and never stored in plain text.
  isAuthenticated: boolean;
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
    // Precondition: Check if the username already exists
    const existingUser = await this.users.findOne({ username });
    if (existingUser) {
      return { error: `Username '${username}' already exists` };
    }

    // Effects: Create a new User
    const newUser: UserDocument = {
      _id: freshID() as User,
      username,
      password, // For this exercise, storing as plain text. In production, hash and salt!
      isAuthenticated: false, // Newly registered users are not authenticated by default
    };

    await this.users.insertOne(newUser);

    return { user: newUser._id };
  }

  /**
   * authenticate (username: String, password: String): (user: User) | (error: String)
   *
   * @requires there exists a user with the given username and password, the isAuthenticated flag must be False
   * @effects returns the registered user that matches with the given username and password, sets the isAuthenticated flag to True
   */
  async authenticate(
    { username, password }: { username: string; password: string },
  ): Promise<{ user: User } | { error: string }> {
    // Precondition: Find a user with the given username and password
    // WARNING: In production, you would retrieve by username, then securely compare hashed passwords.
    const authenticatedUser = await this.users.findOne({ username, password });

    if (!authenticatedUser) {
      return { error: "Invalid username or password" };
    }

    // Precondition: the isAuthenticated flag must be False
    if (authenticatedUser.isAuthenticated) {
      return { error: "User is already authenticated" };
    }

    // Effects: Set isAuthenticated flag to True
    await this.users.updateOne(
      { _id: authenticatedUser._id },
      { $set: { isAuthenticated: true } },
    );

    // Effects: Returns the registered user
    return { user: authenticatedUser._id };
  }

  /**
   * logout (user: User): Empty | (error: String)
   *
   * @requires the given user exists and their isAuthenticated flag must be True
   * @effects sets the isAuthenticated flag for the user to False
   */
  async logout(
    { user }: { user: User },
  ): Promise<Empty | { error: string }> {
    // Precondition: Find the user
    const existingUser = await this.users.findOne({ _id: user });

    if (!existingUser) {
      return { error: `User with ID '${user}' not found` };
    }

    // Precondition: isAuthenticated flag must be True
    if (!existingUser.isAuthenticated) {
      return { error: `User '${user}' is not authenticated` };
    }

    // Effects: Set isAuthenticated flag to False
    await this.users.updateOne(
      { _id: user },
      { $set: { isAuthenticated: false } },
    );

    return {};
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
    // Precondition: User exists
    const foundUser = await this.users.findOne({ _id: user });
    if (!foundUser) {
      return { error: `User with ID '${user}' not found` };
    }
    // Effects: Returns the username associated with the user
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
    // Precondition: A user with the given username exists
    const foundUser = await this.users.findOne({ username });
    if (!foundUser) {
      return { error: `User with username '${username}' not found` };
    }
    // Effects: Returns the user
    return [{ user: foundUser._id }];
  }
}
```
