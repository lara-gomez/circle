---
timestamp: 'Thu Oct 16 2025 22:48:55 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_224855.5de1a24a.md]]'
content_id: 587a19d3c890ac54b51d8388b70c5f74219e72776e6023c52606f9f727c98016
---

# file: src/userinterest/UserInterestConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "UserInterest" + ".";

// Generic types for the concept's external dependencies
type User = ID;
type Item = ID;

// Internal entity types, represented as IDs (for the association itself)
type UserPersonalInterest = ID; // Represents the unique ID of a user-tag association
type UserItemInterest = ID;     // Represents the unique ID of a user-item association

/**
 * State: A set of UserItemInterests, associating a user with an item.
 * Each document represents a single user's interest in a specific item.
 */
interface UserItemInterestDoc {
  _id: UserItemInterest; // Unique ID for this specific interest record
  user: User;
  item: Item;
}

/**
 * State: A set of UserPersonalInterests, associating a user with a tag string.
 * Each document represents a single user's personal interest in a general topic (tag).
 */
interface UserPersonalInterestDoc {
  _id: UserPersonalInterest; // Unique ID for this specific interest record
  user: User;
  tag: string;
}

/**
 * @concept UserInterest
 * @purpose enable users to explicitly declare and manage their interests,
 *          both in specific items and in general topics, to personalize
 *          their experience and facilitate content discovery.
 * @principle a user wants to add their personal interests through a specific tag;
 *             they can remove this tag or add more tags whenever; they may also
 *             indicate interest in specific items and can similarly remove or
 *             add more interests in the future.
 */
export default class UserInterestConcept {
  userItemInterests: Collection<UserItemInterestDoc>;
  userPersonalInterests: Collection<UserPersonalInterestDoc>;

  constructor(private readonly db: Db) {
    this.userItemInterests = this.db.collection(PREFIX + "userItemInterests");
    this.userPersonalInterests = this.db.collection(PREFIX + "userPersonalInterests");
  }

  /**
   * Action: Adds a personal interest (tag) for a user.
   * @signature addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)
   * @requires tag is a non-empty String, there does not already exist a UserPersonalInterest associating the user to the given tag.
   * @effects Creates a UserPersonalInterest associating the user to the tag, and returns its ID.
   */
  async addPersonalInterest({ user, tag }: { user: User; tag: string }): Promise<{ personalInterest: UserPersonalInterest } | { error: string }> {
    if (!tag || tag.trim() === "") {
      return { error: "Tag cannot be empty." };
    }

    // Check precondition: no existing interest for the user/tag pair
    const existingInterest = await this.userPersonalInterests.findOne({ user, tag });
    if (existingInterest) {
      return { error: `User ${user} already has personal interest in tag '${tag}'.` };
    }

    const personalInterestId = freshID() as UserPersonalInterest;
    await this.userPersonalInterests.insertOne({ _id: personalInterestId, user, tag });

    return { personalInterest: personalInterestId };
  }

  /**
   * Action: Removes a personal interest (tag) for a user.
   * @signature removePersonalInterest (user: User, tag: String): Empty
   * @requires tag is a non-empty string, there exists a UserPersonalInterest associating the user to the given tag.
   * @effects Removes the UserPersonalInterest associating the user to the tag.
   */
  async removePersonalInterest({ user, tag }: { user: User; tag: string }): Promise<Empty | { error: string }> {
    if (!tag || tag.trim() === "") {
      return { error: "Tag cannot be empty." };
    }

    // Check precondition implicitly by checking deletedCount
    const result = await this.userPersonalInterests.deleteOne({ user, tag });

    if (result.deletedCount === 0) {
      return { error: `User ${user} does not have personal interest in tag '${tag}'.` };
    }

    return {};
  }

  /**
   * Action: Adds an interest in a specific item for a user.
   * @signature addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)
   * @requires there does not already exist a UserItemInterest associating the user to the item.
   * @effects Creates a UserItemInterest associating the user to the item, and returns its ID.
   */
  async addItemInterest({ user, item }: { user: User; item: Item }): Promise<{ itemInterest: UserItemInterest } | { error: string }> {
    // Check precondition: no existing interest for the user/item pair
    const existingInterest = await this.userItemInterests.findOne({ user, item });
    if (existingInterest) {
      return { error: `User ${user} already has interest in item ${item}.` };
    }

    const itemInterestId = freshID() as UserItemInterest;
    await this.userItemInterests.insertOne({ _id: itemInterestId, user, item });

    return { itemInterest: itemInterestId };
  }

  /**
   * Action: Removes an interest in a specific item for a user.
   * @signature removeItemInterest (user: User, item: Item): Empty
   * @requires there exists a UserItemInterest associating the user to the given item.
   * @effects Removes the UserItemInterest associating the user to the item.
   */
  async removeItemInterest({ user, item }: { user: User; item: Item }): Promise<Empty | { error: string }> {
    // Check precondition implicitly by checking deletedCount
    const result = await this.userItemInterests.deleteOne({ user, item });

    if (result.deletedCount === 0) {
      return { error: `User ${user} does not have interest in item ${item}.` };
    }

    return {};
  }

  /**
   * Query: Retrieves all personal interests (tags) for a given user.
   * @signature _getPersonalInterests (user: User): (personalInterest: UserPersonalInterestDoc)
   * @requires The user exists (implicitly handled by returning an empty array if no interests are found).
   * @effects Returns an array of UserPersonalInterestDoc objects.
   */
  async _getPersonalInterests({ user }: { user: User }): Promise<UserPersonalInterestDoc[]> {
    // Queries do not return errors in this system unless truly exceptional,
    // as per instructions. An empty array signifies no interests found, not an error.
    return await this.userPersonalInterests.find({ user }).toArray();
  }

  /**
   * Query: Retrieves all item interests for a given user.
   * @signature _getItemInterests (user: User): (itemInterest: UserItemInterestDoc)
   * @requires The user exists (implicitly handled by returning an empty array if no interests are found).
   * @effects Returns an array of UserItemInterestDoc objects.
   */
  async _getItemInterests({ user }: { user: User }): Promise<UserItemInterestDoc[]> {
    // Queries do not return errors in this system unless truly exceptional.
    return await this.userItemInterests.find({ user }).toArray();
  }
}
```
