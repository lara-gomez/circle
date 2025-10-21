---
timestamp: 'Thu Oct 16 2025 23:29:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_232935.3ff09952.md]]'
content_id: fc82b31a7257e4dc09dc4268e790b1dc2fe069fb153cd1d4ecef1ab8e29c73d4
---

# file: src/userinterest/UserInterestConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "UserInterest" + ".";

type User = ID;
type Item = ID; // Generic type for items

// Internal entity IDs for UserItemInterest and UserPersonalInterest documents
type UserItemInterestId = ID;
type UserPersonalInterestId = ID;

/**
 * State: A set of UserItemInterests
 * Associates a user with a specific item they are interested in.
 */
interface UserItemInterestDoc {
  _id: UserItemInterestId;
  user: User;
  item: Item;
}

/**
 * State: A set of UserPersonalInterests
 * Associates a user with a general tag/topic they are interested in.
 */
interface UserPersonalInterestDoc {
  _id: UserPersonalInterestId;
  user: User;
  tag: string;
}

/**
 * Interface for the detailed candidate items passed to recommendItems.
 * This extends the generic 'Item' type with necessary attributes for filtering and ranking.
 */
interface CandidateItem {
  id: Item;
  description: string;
  tags: string[]; // for matching with UserPersonalInterests
  location?: string;
  time?: Date;
}

/**
 * Filters for the recommendItems action.
 */
interface RecommendationFilters {
  location?: string;
  timeRange?: { start: Date; end: Date };
  requiredTags?: string[];
}

/**
 * @concept UserInterest
 * @purpose enable users to explicitly declare and manage their interests, both in general topics (tags) and in specific items, to personalize their experience and facilitate content discovery.
 */
export default class UserInterestConcept {
  userItemInterests: Collection<UserItemInterestDoc>;
  userPersonalInterests: Collection<UserPersonalInterestDoc>;

  constructor(private readonly db: Db) {
    this.userItemInterests = this.db.collection(PREFIX + "userItemInterests");
    this.userPersonalInterests = this.db.collection(
      PREFIX + "userPersonalInterests",
    );
  }

  /**
   * addPersonalInterest (user: User, tag: String): (personalInterest: {id: ID, user: User, tag: String})
   *
   * @requires tag is a non-empty String. There does not already exist a UserPersonalInterest associating the user to the given tag.
   *
   * @effects Creates a UserPersonalInterest associating the user to the tag, and returns its ID along with the user and tag.
   */
  async addPersonalInterest(
    { user, tag }: { user: User; tag: string },
  ): Promise<{ personalInterest: { id: UserPersonalInterestId; user: User; tag: string } } | {
    error: string;
  }> {
    if (!tag || tag.trim() === "") {
      return { error: "Tag cannot be empty." };
    }

    const existingInterest = await this.userPersonalInterests.findOne({
      user,
      tag,
    });
    if (existingInterest) {
      return { error: `User ${user} is already interested in tag '${tag}'.` };
    }

    const newId = freshID() as UserPersonalInterestId;
    await this.userPersonalInterests.insertOne({ _id: newId, user, tag });
    return { personalInterest: { id: newId, user, tag } };
  }

  /**
   * removePersonalInterest (user: User, tag: String)
   *
   * @requires tag is a non-empty string. There exists a UserPersonalInterest associating the user to the given tag.
   *
   * @effects Removes the UserPersonalInterest associating the user to the tag.
   */
  async removePersonalInterest(
    { user, tag }: { user: User; tag: string },
  ): Promise<Empty | { error: string }> {
    if (!tag || tag.trim() === "") {
      return { error: "Tag cannot be empty." };
    }

    const result = await this.userPersonalInterests.deleteOne({ user, tag });
    if (result.deletedCount === 0) {
      return { error: `User ${user} is not interested in tag '${tag}'.` };
    }
    return {};
  }

  /**
   * addItemInterest (user: User, item: Item): (itemInterest: {id: ID, user: User, item: Item})
   *
   * @requires There does not already exist a UserItemInterest associating the user to the item.
   *
   * @effects Creates a UserItemInterest associating the user to the item, and returns its ID along with the user and item.
   */
  async addItemInterest(
    { user, item }: { user: User; item: Item },
  ): Promise<{ itemInterest: { id: UserItemInterestId; user: User; item: Item } } | {
    error: string;
  }> {
    const existingInterest = await this.userItemInterests.findOne({
      user,
      item,
    });
    if (existingInterest) {
      return { error: `User ${user} is already interested in item '${item}'.` };
    }

    const newId = freshID() as UserItemInterestId;
    await this.userItemInterests.insertOne({ _id: newId, user, item });
    return { itemInterest: { id: newId, user, item } };
  }

  /**
   * removeItemInterest (user: User, item: Item)
   *
   * @requires There exists a UserItemInterest associating the user to the given item.
   *
   * @effects Removes the UserItemInterest associating the user to the item.
   */
  async removeItemInterest(
    { user, item }: { user: User; item: Item },
  ): Promise<Empty | { error: string }> {
    const result = await this.userItemInterests.deleteOne({ user, item });
    if (result.deletedCount === 0) {
      return { error: `User ${user} is not interested in item '${item}'.` };
    }
    return {};
  }

  /**
   * recommendItems (user: User, candidateItems: Array<{id: Item, description: String, tags: String[], location?: String, time?: Date}>, filters?: {location?: String, timeRange?: {start: Date, end: Date}, requiredTags?: String[]}): (recommendedItems: Array<Item>)
   *
   * @requires The user must exist (i.e., we can retrieve their interests). `candidateItems` must be a non-empty array of objects with an `id` of type `Item`, a `description` (String), and `tags` (Array of String). `timeRange` filter, if provided, must have `start` and `end` dates where `start <= end`.
   *
   * @effects Returns a ranked list of `Item` IDs from `candidateItems` that best match the `user`'s `UserPersonalInterests` (tags) and `UserItemInterests`, and satisfy all provided `filters`. Items explicitly declared in `UserItemInterests` are prioritized. Ranking considers tag overlap with `UserPersonalInterests` and keywords in `description`.
   */
  async recommendItems(
    { user, candidateItems, filters }: {
      user: User;
      candidateItems: CandidateItem[];
      filters?: RecommendationFilters;
    },
  ): Promise<{ recommendedItems: Item[] } | { error: string }> {
    if (!candidateItems || candidateItems.length === 0) {
      return { error: "Candidate items list cannot be empty." };
    }
    if (filters?.timeRange && filters.timeRange.start > filters.timeRange.end) {
        return { error: "timeRange filter 'start' must be less than or equal to 'end'." };
    }

    // 1. Retrieve user's interests
    const personalInterests = await this.userPersonalInterests.find({ user })
      .toArray();
    const interestedTags = new Set(personalInterests.map((pi) => pi.tag));

    const itemInterests = await this.userItemInterests.find({ user }).toArray();
    const interestedItemIds = new Set(itemInterests.map((ii) => ii.item));

    let filteredItems: CandidateItem[] = candidateItems;

    // 2. Apply filters
    if (filters) {
      if (filters.location) {
        filteredItems = filteredItems.filter((item) =>
          item.location === filters.location
        );
      }
      if (filters.timeRange) {
        filteredItems = filteredItems.filter((item) => {
          if (!item.time) return false;
          return item.time >= filters.timeRange!.start &&
            item.time <= filters.timeRange!.end;
        });
      }
      if (filters.requiredTags && filters.requiredTags.length > 0) {
        const requiredTagsSet = new Set(filters.requiredTags);
        filteredItems = filteredItems.filter((item) =>
          item.tags.some((tag) => requiredTagsSet.has(tag))
        );
      }
    }

    // 3. Calculate relevance and rank
    // Scoring logic:
    // - High score for items directly in UserItemInterests
    // - Score based on tag overlap with UserPersonalInterests
    // - Simple keyword match in description (can be expanded with LLM)
    const rankedItems = filteredItems.map((item) => {
      let score = 0;

      // Prioritize items explicitly marked as interesting
      if (interestedItemIds.has(item.id)) {
        score += 1000; // High score for explicit interest
      }

      // Score based on personal interest tag overlap
      const commonTags = item.tags.filter((tag) => interestedTags.has(tag));
      score += commonTags.length * 10; // 10 points per matching tag

      // Simple keyword match in description (very basic, can be enhanced with LLM)
      for (const tag of interestedTags) {
        if (item.description.toLowerCase().includes(tag.toLowerCase())) {
          score += 5; // 5 points for keyword in description
        }
      }

      return { item, score };
    })
      .sort((a, b) => b.score - a.score) // Sort in descending order of score
      .map((ranked) => ranked.item.id); // Return only the Item IDs

    return { recommendedItems: rankedItems };
  }

  /**
   * _getPersonalInterests (user: User): (personalInterest: {id: ID, user: User, tag: String})
   *
   * @requires The user exists.
   *
   * @effects Returns a list of all personal interest tags for the given user.
   */
  async _getPersonalInterests(
    { user }: { user: User },
  ): Promise<{ personalInterest: { id: UserPersonalInterestId; user: User; tag: string } }[]> {
    const interests = await this.userPersonalInterests.find({ user }).toArray();
    return interests.map((pi) =>
      ({ personalInterest: { id: pi._id, user: pi.user, tag: pi.tag } })
    );
  }

  /**
   * _getItemInterests (user: User): (itemInterest: {id: ID, user: User, item: Item})
   *
   * @requires The user exists.
   *
   * @effects Returns a list of all item interests for the given user.
   */
  async _getItemInterests(
    { user }: { user: User },
  ): Promise<{ itemInterest: { id: UserItemInterestId; user: User; item: Item } }[]> {
    const interests = await this.userItemInterests.find({ user }).toArray();
    return interests.map((ii) =>
      ({ itemInterest: { id: ii._id, user: ii.user, item: ii.item } })
    );
  }
}
```

***
