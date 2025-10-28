---
timestamp: 'Mon Oct 27 2025 02:04:16 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_020416.96c7a6a1.md]]'
content_id: 2d5a654e9fe66044e8bfad2ae683d1ab8cca76c4fb957e799ab7c9f9616686e4
---

# file: src/userauthentication/UserAuthenticationConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import { createHash } from "node:crypto"; // For password hashing

// Collection prefix to ensure namespace separation
const PREFIX = "UserAuthentication" + ".";

// Generic type for the concept's external dependency
type User = ID;

/**
 * State: A set of Users with a username and a hashed password.
 */
interface UserAccountDoc {
  _id: User; // MongoDB document ID for the user
  username: string;
  passwordHash: string; // Storing hashed password for security
}

/**
 * @concept UserAuthentication
 * @purpose enable users to register and verify their identity using a username and password.
 * @principle If a user registers with a unique username and password, they can then authenticate using those same credentials to be identified as the registered user.
 */
export default class UserAuthenticationConcept {
  userAccounts: Collection<UserAccountDoc>;

  constructor(private readonly db: Db) {
    this.userAccounts = this.db.collection(PREFIX + "userAccounts");
    // Ensure username is unique for efficient lookup
    this.userAccounts.createIndex({ username: 1 }, { unique: true });
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  /**
   * register (username: String, password: String): (user: User)
   *
   * @requires the username must not already exist in the system
   * @effects create a new User with this username and password, returns the user
   */
  async register({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const existingUser = await this.userAccounts.findOne({ username });
    if (existingUser) {
      return { error: `Username "${username}" already exists.` };
    }

    const userId = freshID() as User;
    const passwordHash = this.hashPassword(password);
    await this.userAccounts.insertOne({ _id: userId, username, passwordHash });

    return { user: userId };
  }

  /**
   * authenticate (username: String, password: String): (user: User)
   *
   * @requires there exists a user with the given username and password
   * @effects returns the registered user that matches with the given username and password
   */
  async authenticate({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const passwordHash = this.hashPassword(password);
    const userAccount = await this.userAccounts.findOne({ username, passwordHash });

    if (!userAccount) {
      return { error: "Invalid username or password." };
    }

    return { user: userAccount._id };
  }

  /**
   * _getUsername (user: User) : (username: String)
   *
   * @requires user exists
   * @effects returns the username associated with the user
   */
  async _getUsername({ user }: { user: User }): Promise<Array<{ username: string }> | { error: string }> {
    const userAccount = await this.userAccounts.findOne({ _id: user });
    if (!userAccount) {
      return { error: `User with ID ${user} not found.` };
    }
    return [{ username: userAccount.username }];
  }

  /**
   * _getUserByUsername (username: String) : (user: User) | (error: String)
   *
   * @requires a user with the given username exists
   * @effects if a user with the given username exists, returns that user; otherwise returns an error
   */
  async _getUserByUsername({ username }: { username: string }): Promise<Array<{ user: User }> | { error: string }> {
    const userAccount = await this.userAccounts.findOne({ username });
    if (!userAccount) {
      return { error: `User with username "${username}" not found.` };
    }
    return [{ user: userAccount._id }];
  }
}
```

***
