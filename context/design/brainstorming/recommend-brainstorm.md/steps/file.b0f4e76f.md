---
timestamp: 'Mon Oct 27 2025 02:04:16 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_020416.96c7a6a1.md]]'
content_id: b0f4e76f48eef487d4680428a150768846ac8f39b9cd02e8e9d4728ca554a1b4
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

// Internal entity types, represented as IDs (though not strictly needed as relationships are direct)
type UserPersonalInterest = ID; // Represents the association record
type UserItemInterest = ID; // Represents the association record

/**
 * State: An association of a User with an Item they are interested in.
 */
interface UserItemInterestDoc {
  _id: UserItemInterest; // Unique ID for this specific interest record
  user: User;
  item: Item;
}

/**
 * State: An association of a User with a general tag/topic they are interested in.
 */
interface UserPersonalInterestDoc {
  _id: UserPersonalInterest; // Unique ID for this specific interest record
  user: User;
  tag: string;
}

/**
 * @concept UserInterest
 * @purpose enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience and facilitate content discovery.
 * @principle a user wants to add their personal interests through a specific tag; they can remove this tag or add more tags whenever; they may also indicate interest in specific items and can similarly remove or add more interests in the future.
 */
export default class UserInterestConcept {
  userItemInterests: Collection<UserItemInterestDoc>;
  userPersonalInterests: Collection<UserPersonalInterestDoc>;

  constructor(private readonly db: Db) {
    this.userItemInterests = this.db.collection(PREFIX + "userItemInterests");
    this.userPersonalInterests = this.db.collection(PREFIX + "userPersonalInterests");

    // Ensure uniqueness for interest records to prevent duplicates
    this.userItemInterests.createIndex({ user: 1, item: 1 }, { unique: true });
    this.userPersonalInterests.createIndex({ user: 1, tag: 1 }, { unique: true });
  }

  /**
   * addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)
   *
   * @requires tag is a non-empty String, there does not already exist a UserPersonalInterest associating the user to the given tag
   * @effects creates a UserPersonalInterest associating the user to the tag, and returns it
   */
  async addPersonalInterest({ user, tag }: { user: User; tag: string }): Promise<{ personalInterest: UserPersonalInterest } | { error: string }> {
    if (!tag.trim()) {
      return { error: "Tag cannot be empty." };
    }

    const existingInterest = await this.userPersonalInterests.findOne({ user, tag });
    if (existingInterest) {
      return { error: `User ${user} already has personal interest tag "${tag}".` };
    }

    const interestId = freshID() as UserPersonalInterest;
    await this.userPersonalInterests.insertOne({ _id: interestId, user, tag });
    return { personalInterest: interestId };
  }

  /**
   * removePersonalInterest (user: User, tag: String)
   *
   * @requires tag is a non-empty string, there exists a UserPersonalInterest associating the user to the given tag
   * @effects removes the UserPersonalInterest associating the user to the tag
   */
  async removePersonalInterest({ user, tag }: { user: User; tag: string }): Promise<Empty | { error: string }> {
    if (!tag.trim()) {
      return { error: "Tag cannot be empty." };
    }

    const result = await this.userPersonalInterests.deleteOne({ user, tag });
    if (result.deletedCount === 0) {
      return { error: `No personal interest tag "${tag}" found for user ${user}.` };
    }
    return {};
  }

  /**
   * addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)
   *
   * @requires there does not already exist a UserItemInterest associating the user to the item
   * @effects creates a UserItemInterest associating the user to the tag, and returns it
   */
  async addItemInterest({ user, item }: { user: User; item: Item }): Promise<{ itemInterest: UserItemInterest } | { error: string }> {
    const existingInterest = await this.userItemInterests.findOne({ user, item });
    if (existingInterest) {
      return { error: `User ${user} is already interested in item ${item}.` };
    }

    const interestId = freshID() as UserItemInterest;
    await this.userItemInterests.insertOne({ _id: interestId, user, item });
    return { itemInterest: interestId };
  }

  /**
   * removeItemInterest (user: User, item: Item)
   *
   * @requires there exists a UserItemInterest associating the user to the given item
   * @effects removes the UserItemInterest associating the user to the item
   */
  async removeItemInterest({ user, item }: { user: User; item: Item }): Promise<Empty | { error: string }> {
    const result = await this.userItemInterests.deleteOne({ user, item });
    if (result.deletedCount === 0) {
      return { error: `No item interest in ${item} found for user ${user}.` };
    }
    return {};
  }

  /**
   * _getPersonalInterests (user: User) : (tag: String)
   *
   * @requires user exists
   * @effects returns all personal interest tags associated with the user
   */
  async _getPersonalInterests({ user }: { user: User }): Promise<{ tag: string }[]> {
    const interests = await this.userPersonalInterests.find({ user }).toArray();
    return interests.map(i => ({ tag: i.tag }));
  }

  /**
   * _getItemInterests (user: User) : (item: Item)
   *
   * @requires user exists
   * @effects returns all items the user has expressed interest in
   */
  async _getItemInterests({ user }: { user: User }): Promise<{ item: Item }[]> {
    const interests = await this.userItemInterests.find({ user }).toArray();
    return interests.map(i => ({ item: i.item }));
  }
}
```

***
