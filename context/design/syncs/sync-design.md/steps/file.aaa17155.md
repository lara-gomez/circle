---
timestamp: 'Thu Nov 06 2025 21:34:13 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251106_213413.31b7ee57.md]]'
content_id: aaa1715594420a21a79b25f50e715fa417ba7f86ab2b9ded0e16b9783b288cb6
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
type UserPersonalInterest = ID; // Represents the association between a user and a tag
type UserItemInterest = ID;     // Represents the association between a user and an item

/**
 * State: A set of UserItemInterests, associating a user with an item.
 */
interface UserItemInterestDoc {
  _id: UserItemInterest; // Unique ID for this specific interest
  user: User;
  item: Item;
}

/**
 * State: A set of UserPersonalInterests, associating a user with a tag string.
 */
interface UserPersonalInterestDoc {
  _id: UserPersonalInterest; // Unique ID for this specific interest
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
    return await this.userPersonalInterests.find({ user }).toArray();
  }

  /**
   * Query: Retrieves all item interests for a given user.
   * @signature _getItemInterests (user: User): (itemInterest: UserItemInterestDoc)
   * @requires The user exists (implicitly handled by returning an empty array if no interests are found).
   * @effects Returns an array of UserItemInterestDoc objects.
   */
  async _getItemInterests({ user }: { user: User }): Promise<UserItemInterestDoc[]> {
    return await this.userItemInterests.find({ user }).toArray();
  }

  /**
   * Query: Retrieves all users interested in a given item.
   * @signature _getUsersInterestedInItems (item: Item): (user: User)
   * @requires The item exists (implicitly, as the query will return an empty array if no interests are found for it).
   * @effects Returns an array of dictionaries, each containing a 'user' field with the ID of a user interested in the item.
   */
  async _getUsersInterestedInItems({ item }: { item: Item }): Promise<Array<{ user: User }>> {
    // Find all UserItemInterestDoc where the item matches
    const interestedDocs = await this.userItemInterests.find({ item }).toArray();
    // Extract the unique user IDs and map them to the required output format
    const users = interestedDocs.map(doc => ({ user: doc.user }));
    return users;
  }
}
```
