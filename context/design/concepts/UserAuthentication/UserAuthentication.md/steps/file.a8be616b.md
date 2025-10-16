---
timestamp: 'Wed Oct 15 2025 19:22:34 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_192234.6fc7b064.md]]'
content_id: a8be616b9d6d0268c83cdd1422e6f953e0496c8658a8e009b42ba7da2776ff30
---

# file: src/concepts/UserAuthenticationConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import * as crypto from "node:crypto";

// Declare collection prefix, use concept name
const PREFIX = "UserAuthentication" + ".";

// Generic types of this concept
type User = ID;

// Constants for password hashing using PBKDF2
const HASH_ALGORITHM = "sha512"; // Cryptographically strong hash algorithm
const SALT_LENGTH = 16;         // 16 bytes for salt, usually stored as 32 hex characters
const KEY_LENGTH = 64;          // 64 bytes for derived key, stored as 128 hex characters
const ITERATIONS = 100000;      // Number of PBKDF2 iterations, higher is more secure but slower

/**
 * Interface representing the structure of a User document in MongoDB.
 * The password is no longer stored in plain text but as a hashed value
 * along with its corresponding salt.
 *
 * a set of Users with
 *   a username String
 *   a hashedPassword String
 *   a salt String
 */
interface Users {
  _id: User;
  username: string;
  hashedPassword: string; // The securely hashed password
  salt: string;           // The unique salt used for hashing this password
}

export default class UserAuthenticationConcept {
  users: Collection<Users>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
    // Ensure unique usernames
    this.users.createIndex({ username: 1 }, { unique: true });
  }

  /**
   * Helper function to hash a password using PBKDF2 with a given salt.
   * This function returns a Promise for asynchronous hashing.
   * @param password The plain-text password to hash.
   * @param salt The salt (as a hex string) to use for hashing.
   * @returns A Promise that resolves to the hex-encoded derived key (hashed password).
   */
  private async hashPassword(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Use crypto.pbkdf2 for secure password hashing
      crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, HASH_ALGORITHM, (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(derivedKey.toString("hex")); // Convert Buffer to hex string for storage
        }
      });
    });
  }

  /**
   * register (username: String, password: String): (user: User) | (error: String)
   *
   * **requires**: the username must not already exist in the system
   *
   * **effects**: create a new User; generate a unique salt; hash the provided password with the salt;
   *              store the username, hashed password, and salt; returns the user ID.
   */
  async register({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    // Check if a user with the given username already exists
    const existingUser = await this.users.findOne({ username });
    if (existingUser) {
      return { error: "Username already exists." };
    }

    // Generate a unique salt for this user
    const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");

    // Hash the password using the generated salt
    const hashedPassword = await this.hashPassword(password, salt);

    // Create the new user record
    const newUser: Users = {
      _id: freshID() as User, // Generate a fresh ID for the new user
      username,
      hashedPassword,
      salt,
    };

    // Insert the new user into the database
    await this.users.insertOne(newUser);

    // Return the ID of the newly registered user
    return { user: newUser._id };
  }

  /**
   * authenticate (username: String, password: String): (user: User) | (error: String)
   *
   * **requires**: there exists a user with the given username and the provided password matches
   *              the stored hashed password (after re-hashing with the stored salt)
   *
   * **effects**: if credentials are valid, returns the ID of the registered user;
   *              otherwise, returns an error.
   */
  async authenticate({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    // Find the user record by username
    const userRecord = await this.users.findOne({ username });

    // If no user is found, or if the stored password/salt is missing (shouldn't happen with correct registration)
    if (!userRecord || !userRecord.hashedPassword || !userRecord.salt) {
      // Return a generic error message for security reasons
      // (avoid revealing if username exists or not)
      return { error: "Invalid credentials." };
    }

    // Re-hash the provided password using the stored salt
    const providedHashedPassword = await this.hashPassword(password, userRecord.salt);

    // Compare the newly generated hash with the stored hash
    if (providedHashedPassword === userRecord.hashedPassword) {
      // If hashes match, authentication is successful
      return { user: userRecord._id };
    } else {
      // If hashes don't match, authentication fails
      return { error: "Invalid credentials." };
    }
  }

  /**
   * _getUsername (user: User) : (username: String) | (error: String)
   *
   * **requires**: user exists
   *
   * **effects**: returns the username associated with the user, or an error if the user is not found.
   */
  async _getUsername({ user }: { user: User }): Promise<{ username: string } | { error: string }> {
    const userRecord = await this.users.findOne({ _id: user });
    if (userRecord) {
      return { username: userRecord.username };
    } else {
      return { error: "User not found." };
    }
  }

  /**
   * _getUserByUsername (username: String) : (user: User) | (error: String)
   *
   * **requires**: a user with the given username exists
   *
   * **effects**: if a user with the given username exists, returns that user's ID;
   *              otherwise returns an error.
   */
  async _getUserByUsername({ username }: { username: string }): Promise<{ user: User } | { error: string }> {
    const userRecord = await this.users.findOne({ username });
    if (userRecord) {
      // Only return the user ID, not sensitive information like hashed password or salt
      return { user: userRecord._id };
    } else {
      return { error: "User not found." };
    }
  }
}
```
