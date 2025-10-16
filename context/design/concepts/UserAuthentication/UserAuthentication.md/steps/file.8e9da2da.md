---
timestamp: 'Wed Oct 15 2025 00:41:03 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_004103.3a1ef196.md]]'
content_id: 8e9da2da062e65cac6e0cb76738b510f308bc335f7f5b8a0c0b989b1e517466e
---

# file: src/concepts/UserAuthenticationConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "UserAuthentication" + ".";

// Generic type for external references to a user entity
type User = ID;

/**
 * State: a set of Users with
 *   a username String
 *   a password String
 *
 * This interface defines the structure of documents stored in the 'users' collection.
 * In a real application, passwords would always be hashed (e.g., using bcrypt)
 * before storage, and their comparison would involve hashing the provided password
 * and comparing it to the stored hash. For this example, we follow the literal
 * specification of `password String` for simplicity.
 */
interface AuthUser {
  _id: User;
  username: string;
  password: string; // Store hashed passwords in production!
}

export default class UserAuthenticationConcept {
  private users: Collection<AuthUser>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
  }

  /**
   * register (username: String, password: String): (user: User)
   * register (username: String, password: String): (error: String)
   *
   * **requires** no User with the given `username` already exists
   *
   * **effects** creates a new User `u`; sets the `username` and `password` of `u`; returns `u` as `user`
   */
  async register(
    { username, password }: { username: string; password: string },
  ): Promise<{ user: User } | { error: string }> {
    // Check if username already exists
    const existingUser = await this.users.findOne({ username });
    if (existingUser) {
      return { error: `Username '${username}' already exists.` };
    }

    // Create a new user
    const newUserId = freshID();
    const newUser: AuthUser = {
      _id: newUserId,
      username,
      password, // IMPORTANT: In a production system, this password should be hashed!
    };

    try {
      await this.users.insertOne(newUser);
      return { user: newUserId };
    } catch (e) {
      console.error("Error registering user:", e);
      return { error: "Failed to register user due to an internal error." };
    }
  }

  /**
   * login (username: String, password: String): (user: User)
   * login (username: String, password: String): (error: String)
   *
   * **requires** a User with the given `username` and `password` exists
   *
   * **effects** returns the `User` associated with the `username` and `password` as `user`
   */
  async login(
    { username, password }: { username: string; password: string },
  ): Promise<{ user: User } | { error: string }> {
    // Find user by username and password
    // IMPORTANT: In a production system, compare hashed passwords using a library like bcrypt.
    const user = await this.users.findOne({ username, password });

    if (!user) {
      return { error: "Invalid username or password." };
    }
    return { user: user._id };
  }

  /**
   * _getUsername (user: User) : (username: String)
   *
   * **requires** `user` exists
   *
   * **effects** returns the `username` of the given `user`
   */
  async _getUsername({ user }: { user: User }): Promise<{ username: string }[]> {
    const foundUser = await this.users.findOne({ _id: user });
    if (!foundUser) {
      // Queries return an array. If no result, return an empty array.
      return [];
    }
    return [{ username: foundUser.username }];
  }

  /**
   * _getUserByUsername (username: String) : (user: User)
   *
   * **requires** a user with `username` exists
   *
   * **effects** returns the `User` ID associated with the `username`
   */
  async _getUserByUsername(
    { username }: { username: string },
  ): Promise<{ user: User }[]> {
    const foundUser = await this.users.findOne({ username });
    if (!foundUser) {
      return [];
    }
    return [{ user: foundUser._id }];
  }
}
```
