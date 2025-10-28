---
timestamp: 'Mon Oct 27 2025 01:30:57 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_013057.19965fef.md]]'
content_id: 095e1b02a4d801c9b83e76e81b29d092ebc51069b76e825e028af7bdf7756f49
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
type Item = ID; // Generic item ID for user interests (e.g., specific products, movies)
type RecommendableItem = ID; // Generic item ID for items being recommended (e.g., events, articles)

// Internal entity types, represented as IDs
type UserPersonalInterest = ID;
type UserItemInterest = ID;

/**
 * State: A set of UserItemInterests.
 */
interface UserItemInterestDoc {
  _id: UserItemInterest;
  user: User;
  item: Item;
}

/**
 * State: A set of UserPersonalInterests.
 */
interface UserPersonalInterestDoc {
  _id: UserPersonalInterest;
  user: User;
  tag: string;
}

/**
 * Interface for details of a generic recommendable item.
 * This structure reflects the data needed from an external concept (e.g., Event, Product, Article)
 * to perform recommendations. It is designed to be polymorphic.
 */
interface RecommendableItemDetails {
  id: RecommendableItem; // The unique ID of the recommendable item
  name: string; // A display name for the item (e.g., eventName, productName)
  date: Date; // A relevant date for the item (e.g., eventTime, publicationDate, releaseDate) for chronological sorting.
  duration?: number; // Optional duration in minutes (useful for events, might be omitted for other items)
  location?: string; // Optional location string for geographical filtering.
  description: string; // Textual content for LLM analysis.
  itemTags: string[]; // Interests/tags explicitly associated with the item itself.
}

/**
 * Placeholder for an LLM service interface.
 * This should match the actual interface of your GeminiLLM client.
 */
interface LLMService {
  invoke(prompt: string): Promise<{ result: string } | { error: string }>;
}

/**
 * @concept UserInterest
 * @purpose enable users to explicitly declare and manage their interests, both in specific items
 * and in general topics, to personalize their experience, facilitate content discovery,
 * and receive tailored recommendations for various `RecommendableItem` types.
 */
export default class UserInterestConcept {
  userItemInterests: Collection<UserItemInterestDoc>;
  userPersonalInterests: Collection<UserPersonalInterestDoc>;

  constructor(private readonly db: Db) {
    this.userItemInterests = this.db.collection(PREFIX + "userItemInterests");
    this.userPersonalInterests = this.db.collection(PREFIX + "userPersonalInterests");
  }

  /**
   * Action: Creates a new personal interest for a user.
   * @requires tag is a non-empty String, there does not already exist a UserPersonalInterest
   *           associating the user to the given tag.
   * @effects Creates a UserPersonalInterest associating the user to the tag, and returns it.
   */
  async addPersonalInterest({ user, tag }: { user: User; tag: string }): Promise<{ personalInterest: UserPersonalInterest } | { error: string }> {
    if (!tag || tag.trim() === "") {
      return { error: "Tag cannot be empty." };
    }
    const existingInterest = await this.userPersonalInterests.findOne({ user, tag });
    if (existingInterest) {
      return { error: `User ${user} already has personal interest tag '${tag}'.` };
    }

    const interestId = freshID() as UserPersonalInterest;
    await this.userPersonalInterests.insertOne({ _id: interestId, user, tag });
    return { personalInterest: interestId };
  }

  /**
   * Action: Removes a personal interest from a user.
   * @requires tag is a non-empty string, there exists a UserPersonalInterest associating the user to the given tag.
   * @effects Removes the UserPersonalInterest associating the user to the tag.
   */
  async removePersonalInterest({ user, tag }: { user: User; tag: string }): Promise<Empty | { error: string }> {
    if (!tag || tag.trim() === "") {
      return { error: "Tag cannot be empty." };
    }
    const result = await this.userPersonalInterests.deleteOne({ user, tag });
    if (result.deletedCount === 0) {
      return { error: `No personal interest tag '${tag}' found for user ${user}.` };
    }
    return {};
  }

  /**
   * Action: Creates a new item interest for a user.
   * @requires there does not already exist a UserItemInterest associating the user to the item.
   * @effects Creates a UserItemInterest associating the user to the item, and returns it.
   */
  async addItemInterest({ user, item }: { user: User; item: Item }): Promise<{ itemInterest: UserItemInterest } | { error: string }> {
    const existingInterest = await this.userItemInterests.findOne({ user, item });
    if (existingInterest) {
      return { error: `User ${user} is already interested in item ${item}.` };
    }

    const itemInterestId = freshID() as UserItemInterest;
    await this.userItemInterests.insertOne({ _id: itemInterestId, user, item });
    return { itemInterest: itemInterestId };
  }

  /**
   * Action: Removes an item interest from a user.
   * @requires there exists a UserItemInterest associating the user to the given item.
   * @effects Removes the UserItemInterest associating the user to the item.
   */
  async removeItemInterest({ user, item }: { user: User; item: Item }): Promise<Empty | { error: string }> {
    const result = await this.userItemInterests.deleteOne({ user, item });
    if (result.deletedCount === 0) {
      return { error: `No item interest in ${item} found for user ${user}.` };
    }
    return {};
  }

  /**
   * Query: Returns all personal interest tags associated with the given user.
   * @effects Returns an array of tag strings.
   */
  async _getPersonalInterests({ user }: { user: User }): Promise<{ tag: string }[]> {
    const interests = await this.userPersonalInterests.find({ user }).project({ tag: 1, _id: 0 }).toArray();
    return interests as { tag: string }[];
  }

  /**
   * Query: Returns all item IDs the user is interested in.
   * @effects Returns an array of item IDs.
   */
  async _getItemInterests({ user }: { user: User }): Promise<{ item: Item }[]> {
    const interests = await this.userItemInterests.find({ user }).project({ item: 1, _id: 0 }).toArray();
    return interests as { item: Item }[];
  }

  /**
   * Helper function to calculate a relevance score for an item
   * based on the overlap between user interests and item tags.
   * @param userTags A set of strings representing the user's personal interests.
   * @param itemTags An array of strings representing the item's relevant tags.
   * @returns A numerical score indicating relevance.
   */
  private calculateRelevance(userTags: Set<string>, itemTags: string[]): number {
    let score = 0;
    for (const tag of userTags) {
      if (itemTags.includes(tag)) {
        score++;
      }
    }
    return score;
  }

  /**
   * Query: Generates a list of recommended items based on a user's *own* tags and candidate items,
   * with optional filtering by location.
   * @param userId The ID of the user requesting recommendations.
   * @param candidateItems An array of detailed item objects (e.g., from an 'Event' concept) to be considered.
   * @param filterLocation An optional string to filter items by their location.
   * @returns An array of ranked item details. Returns an empty array if inputs are invalid or no matching items.
   *
   * @requires userId is a valid user identifier. candidateItems is a set of items with their details.
   * @effects Retrieves userTags (personal interests) for userId from this concept's state.
   *          Filters candidateItems by filterLocation if provided.
   *          Calculates a relevance score for each filtered item based on the overlap between retrieved userTags
   *          and each item's itemTags.
   *          Returns an array of item details, sorted by relevance (highest first), then by date (earliest first).
   *          If candidateItems is empty or userId has no associated personal interests, returns an empty array.
   */
  async _getRecommendedItems(
    { userId, candidateItems, filterLocation }: {
      userId: User;
      candidateItems: RecommendableItemDetails[];
      filterLocation?: string; // Optional location filter
    },
  ): Promise<RecommendableItemDetails[]> {
    // Retrieve userTags from this concept's state
    const userTagsResult = await this._getPersonalInterests({ user: userId });
    const userTags = new Set(userTagsResult.map(t => t.tag));

    if (!userId || userTags.size === 0) {
      console.warn(`User ${userId} has no personal interests for non-augmented recommendations.`);
      return [];
    }
    if (!candidateItems || candidateItems.length === 0) {
      return [];
    }

    let filteredItems = candidateItems;
    if (filterLocation) {
      filteredItems = candidateItems.filter(item => item.location?.toLowerCase() === filterLocation.toLowerCase());
    }
    if (filteredItems.length === 0) {
        return []; // No items left after filtering
    }
    
    const recommendations = filteredItems.map((item) => ({
      item,
      relevanceScore: this.calculateRelevance(userTags, item.itemTags),
    }));

    // Sort by relevance (descending), then by date (ascending for upcoming items)
    recommendations.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      // Assuming 'date' is always present and a valid Date object for sorting.
      // If date can be undefined, add a check: `(a.item.date?.getTime() || 0) - (b.item.date?.getTime() || 0)`
      return a.item.date.getTime() - b.item.date.getTime();
    });

    return recommendations.map((r) => r.item);
  }

  /**
   * Helper to serialize items for the LLM prompt.
   */
  private itemsToString(items: RecommendableItemDetails[]): string {
    return items.map((e) =>
      `- "${e.name}" (ID: ${e.id}) | Tags: [${e.itemTags.join(", ")}] | ` +
      `Description: ${e.description}` +
      (e.location ? ` | Location: ${e.location}` : '') +
      (e.date ? ` | Date: ${e.date.toISOString()}` : '') +
      (e.duration ? ` | Duration: ${e.duration} min` : '')
    ).join("\n");
  }

  /**
   * Helper to construct the detailed prompt for the LLM.
   */
  private createRecommendationPrompt(userId: User, userTags: Set<string>, userContext: Record<string, unknown>, items: RecommendableItemDetails[]): string {
    const criticalRequirements = [
      "1. Recommend ALL candidate items that are relevant to the user's interests (do not pick just one).",
      "2. Consider the item's `itemTags` AND its `description` text to identify alignment with the user's interests.",
      "3. Prioritize based on overlap with the user's interests.",
      "4. Use the `ADDITIONAL USER CONTEXT` to adjust ranking (e.g., if context mentions 'networking', prioritize items with career or professional development aspects).",
      "5. Rank items chronologically by their `date` if they have equal relevance.",
      "6. Return ONLY valid item IDs that appear in the candidate list. These are strings like 'item:abc', 'event:xyz', etc. Do not invent new IDs.",
      "7. Return ONLY a comma-separated list of item IDs, no other text, JSON structure, or markdown formatting."
    ];

    return `You are a helpful AI assistant that recommends items to users based on their interests.

USER ID: ${userId}
USER INTERESTS (tags from UserInterest Concept): ${Array.from(userTags).join(", ")}

CANDIDATE ITEMS (ONLY CHOOSE FROM THESE. Return their IDs in the final ranked list):
${this.itemsToString(items)}

CRITICAL REQUIREMENTS:
${criticalRequirements.join('\n')}

ADDITIONAL USER CONTEXT:
${JSON.stringify(userContext, null, 2)}

Return ONLY a comma-separated list of item IDs in the ranked order, for example: "item:ID1, item:ID2, item:ID3".
If you cannot determine a ranking or find no relevant items, return an empty string.`;
  }

  /**
   * Query: Generates a list of AI-augmented recommended items.
   * This action leverages an external LLM service to provide more sophisticated and personalized rankings,
   * using the user's *own* interests managed by this concept.
   * @param userId The ID of the user requesting recommendations.
   * @param candidateItems An array of detailed item objects (e.g., from an 'Event' concept) to be considered.
   * @param userContext A record containing additional context about the user for the LLM (e.g., preferences, recent activity).
   * @param llmService An instance of an LLM client/service to call (e.g., `new GeminiLLMClient()`).
   * @param filterLocation An optional string to filter items by location before sending to LLM (and for fallback).
   * @returns An array of ranked item details, or an error object if a critical failure occurs.
   *
   * @requires userId is a valid user identifier. candidateItems is a set of items with full details.
   *           llmService is an operational LLM client/service.
   * @effects Retrieves userTags (personal interests) for userId from this concept's state.
   *          Filters candidateItems by filterLocation if provided.
   *          Constructs a detailed prompt for the llmService incorporating userId, the retrieved userTags,
   *          the detailed filtered candidateItems, and the userContext map.
   *          Invokes the llmService to analyze and rank the filtered candidateItems based on the provided data.
   *          If the llmService call is successful, returns an array of item details, ranked by the llmService.
   *          If llmService fails or is unavailable, or returns invalid results, it falls back to
   *          the logic of _getRecommendedItems using the provided inputs and the retrieved userTags,
   *          returning the non-augmented ranked items, or an error if that also fails.
   */
  async _getAugmentedRecommendedItems(
    { userId, candidateItems, userContext, llmService, filterLocation }: {
      userId: User;
      candidateItems: RecommendableItemDetails[];
      userContext: Record<string, unknown>; // Maps to SSF Map<String, Any>
      llmService: LLMService; // Generic 'Any' type in SSF is represented by specific interface here
      filterLocation?: string; // Optional location filter
    },
  ): Promise<RecommendableItemDetails[] | { error: string }> {
    // Retrieve userTags from this concept's state
    const userTagsResult = await this._getPersonalInterests({ user: userId });
    const userTags = new Set(userTagsResult.map(t => t.tag));

    if (!userId || userTags.size === 0 || !userContext || !llmService) {
      // Return an error if core inputs for augmented recommendations are missing/empty
      return { error: "Invalid input for augmented recommendations (userId, userTags, userContext, or llmService missing/empty)." };
    }
    if (!candidateItems || candidateItems.length === 0) {
      // If no candidate items, return empty array (consistent with _getRecommendedItems)
      return [];
    }

    let itemsToProcess = candidateItems;
    if (filterLocation) {
        itemsToProcess = candidateItems.filter(item => item.location?.toLowerCase() === filterLocation.toLowerCase());
    }
    if (itemsToProcess.length === 0) {
        console.warn(`No items found matching the location filter: ${filterLocation}. Falling back to empty recommendations.`);
        return []; // Return empty if no items match filter
    }

    // Construct a detailed prompt for the LLM using the helper
    const prompt = this.createRecommendationPrompt(userId, userTags, userContext, itemsToProcess);

    try {
      // Invoke the LLM service
      console.log('🤖 Requesting AI-augmented recommendations from LLM...');
      const llmResult = await llmService.invoke(prompt);
      console.log('✅ Received response from LLM!');
      
      if (llmResult.error) {
        console.warn(`LLM service error: ${llmResult.error}. Falling back to non-augmented recommendations.`);
        // Fallback: use non-augmented logic with the *filtered* items
        return await this._getRecommendedItems({ userId, candidateItems: itemsToProcess, filterLocation });
      }

      const rankedItemIdsString = llmResult.result?.trim();
      if (!rankedItemIdsString) {
        console.warn("LLM returned an empty or invalid ranking. Falling back to non-augmented recommendations.");
        // Fallback: use non-augmented logic with the *filtered* items
        return await this._getRecommendedItems({ userId, candidateItems: itemsToProcess, filterLocation });
      }

      // Parse LLM's comma-separated list of item IDs
      const rankedItemIds = rankedItemIdsString.split(',')
                                               .map(id => id.trim() as RecommendableItem)
                                               .filter(id => id !== ""); // Filter out any empty strings from split

      const augmentedRecommendations: RecommendableItemDetails[] = [];
      const itemMap = new Map<RecommendableItem, RecommendableItemDetails>(itemsToProcess.map(e => [e.id, e]));

      // Populate augmentedRecommendations based on LLM's order
      for (const itemId of rankedItemIds) {
        const item = itemMap.get(itemId);
        if (item) {
          augmentedRecommendations.push(item);
          itemMap.delete(itemId); // Remove from map to avoid duplication and track unranked
        } else {
            console.warn(`LLM recommended item ID "${itemId}" that was not in the candidate list. Skipping.`);
        }
      }
      
      // If the LLM did not rank all items (or skipped some),
      // add the remaining (unranked by LLM) items using the non-augmented logic,
      // preserving their relative order from the non-augmented sort.
      const unrankedRemainingItems = Array.from(itemMap.values());
      const nonAugmentedRemaining = await this._getRecommendedItems({
        userId, 
        candidateItems: unrankedRemainingItems,
        filterLocation, // Ensure location filter is reapplied for consistency
      });
      
      return [...augmentedRecommendations, ...nonAugmentedRemaining];

    } catch (e) {
      console.error(`Error communicating with LLM service: ${e instanceof Error ? e.message : String(e)}. Falling back to non-augmented recommendations.`);
      // Fallback: use non-augmented logic with the *filtered* items
      return await this._getRecommendedItems({ userId, candidateItems: itemsToProcess, filterLocation });
    }
  }
}
```
