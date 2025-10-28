---
timestamp: 'Mon Oct 27 2025 01:27:02 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_012702.38bf62f4.md]]'
content_id: 2e1eaa011356576e99557f51994994cccb996c97b795d99feed0baec1f51e8bd
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
type Event = ID; // Represents an Event ID from an external Event concept

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
 * Interface for event details that are passed to the recommendation queries.
 * This structure should reflect the data needed from an 'Event' concept.
 * It's adapted from the user's provided `Event` interface with an added `id`.
 */
interface EventDetailsForRecommendation {
  id: Event; // The unique ID of the event
  name: string; // Corresponds to eventName
  date: Date; // Corresponds to eventTime
  duration: number; // Duration in minutes
  location: string;
  description: string;
  relevantInterests: string[];
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
 * and receive tailored event recommendations.
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
   * Helper function to calculate a relevance score for an event
   * based on the overlap between user interests and event interests.
   * @param userTags A set of strings representing the user's personal interests.
   * @param eventInterests An array of strings representing the event's relevant interests.
   * @returns A numerical score indicating relevance.
   */
  private calculateRelevance(userTags: Set<string>, eventInterests: string[]): number {
    let score = 0;
    for (const tag of userTags) {
      if (eventInterests.includes(tag)) {
        score++;
      }
    }
    return score;
  }

  /**
   * Query: Generates a list of recommended events based on a user's *own* tags and candidate events,
   * with optional filtering by location.
   * @param userId The ID of the user requesting recommendations.
   * @param candidateEvents An array of detailed event objects from the 'Event' concept to be considered.
   * @param filterLocation An optional string to filter events by their location.
   * @returns An array of ranked event details. Returns an empty array if inputs are invalid or no matching events.
   *
   * @requires userId is a valid user identifier. candidateEvents is a set of events with their details.
   * @effects Retrieves userTags (personal interests) for userId from this concept's state.
   *          Filters candidateEvents by filterLocation if provided.
   *          Calculates a relevance score for each filtered event based on the overlap between retrieved userTags
   *          and each event's relevantInterests.
   *          Returns an array of event details, sorted by relevance (highest first), then by date (earliest first).
   *          If candidateEvents is empty or userId has no associated personal interests, returns an empty array.
   */
  async _getRecommendedEvents(
    { userId, candidateEvents, filterLocation }: {
      userId: User;
      candidateEvents: EventDetailsForRecommendation[];
      filterLocation?: string; // Optional location filter
    },
  ): Promise<EventDetailsForRecommendation[]> {
    // Retrieve userTags from this concept's state
    const userTagsResult = await this._getPersonalInterests({ user: userId });
    const userTags = new Set(userTagsResult.map(t => t.tag));

    if (!userId || userTags.size === 0) {
      console.warn(`User ${userId} has no personal interests for non-augmented recommendations.`);
      return [];
    }
    if (!candidateEvents || candidateEvents.length === 0) {
      return [];
    }

    let filteredEvents = candidateEvents;
    if (filterLocation) {
      filteredEvents = candidateEvents.filter(event => event.location.toLowerCase() === filterLocation.toLowerCase());
    }
    if (filteredEvents.length === 0) {
        return []; // No events left after filtering
    }
    
    const recommendations = filteredEvents.map((event) => ({
      event,
      relevanceScore: this.calculateRelevance(userTags, event.relevantInterests),
    }));

    // Sort by relevance (descending), then by date (ascending for upcoming events)
    recommendations.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return a.event.date.getTime() - b.event.date.getTime();
    });

    return recommendations.map((r) => r.event);
  }

  /**
   * Helper to serialize events for the LLM prompt.
   */
  private eventsToString(events: EventDetailsForRecommendation[]): string {
    return events.map((e) =>
      `- "${e.name}" (ID: ${e.id}) | Interests: [${e.relevantInterests.join(", ")}] | ` +
      `Duration: ${e.duration} min | Description: ${e.description}`
    ).join("\n");
  }

  /**
   * Helper to construct the detailed prompt for the LLM.
   */
  private createRecommendationPrompt(userId: User, userTags: Set<string>, userContext: Record<string, unknown>, events: EventDetailsForRecommendation[]): string {
    const criticalRequirements = [
      "1. Recommend ALL candidate events that are relevant to the user's interests (do not pick just one).",
      "2. Consider the event's relevantInterests AND its description text to identify alignment with the user's interests.",
      "3. Prioritize based on overlap with the user's interests.",
      "4. Use the context to adjust ranking (e.g., if context mentions networking, prioritize events with career or professional development).",
      "5. Rank events chronologically if they have equal relevance.",
      "6. Return ONLY valid event IDs that appear in the candidate list. These are strings like 'event:abc'.",
      "7. Return ONLY a comma-separated list of event IDs, no other text or JSON structure."
    ];

    return `You are a helpful AI assistant that recommends events to users based on their interests.

USER ID: ${userId}
USER INTERESTS (tags from UserInterest Concept): ${Array.from(userTags).join(", ")}

CANDIDATE EVENTS (ONLY CHOOSE FROM THESE. Return their IDs in the final ranked list):
${this.eventsToString(events)}

CRITICAL REQUIREMENTS:
${criticalRequirements.join('\n')}

ADDITIONAL USER CONTEXT:
${JSON.stringify(userContext, null, 2)}

Return ONLY a comma-separated list of event IDs in the ranked order, for example: "event:ID1, event:ID2, event:ID3".
If you cannot determine, return an empty string.`;
  }

  /**
   * Query: Generates a list of AI-augmented recommended events.
   * This action leverages an external LLM service to provide more sophisticated and personalized rankings,
   * using the user's *own* interests managed by this concept.
   * @param userId The ID of the user requesting recommendations.
   * @param candidateEvents An array of detailed event objects from the 'Event' concept to be considered.
   * @param userContext A record containing additional context about the user for the LLM (e.g., preferences, recent activity).
   * @param llmService An instance of an LLM client/service to call (e.g., `new GeminiLLMClient()`).
   * @param filterLocation An optional string to filter events by location before sending to LLM (and for fallback).
   * @returns An array of ranked event details, or an error object if a critical failure occurs.
   *
   * @requires userId is a valid user identifier. candidateEvents is a set of events with full details.
   *           llmService is an operational LLM client/service.
   * @effects Retrieves userTags (personal interests) for userId from this concept's state.
   *          Filters candidateEvents by filterLocation if provided.
   *          Constructs a detailed prompt for the llmService incorporating userId, the retrieved userTags,
   *          the detailed filtered candidateEvents, and the userContext map.
   *          Invokes the llmService to analyze and rank the filtered candidateEvents based on the provided data.
   *          If the llmService call is successful, returns an array of event details, ranked by the llmService.
   *          If llmService fails or is unavailable, or returns invalid results, it falls back to
   *          the logic of _getRecommendedEvents using the provided inputs and the retrieved userTags,
   *          returning the non-augmented ranked events, or an error if that also fails.
   */
  async _getAugmentedRecommendedEvents(
    { userId, candidateEvents, userContext, llmService, filterLocation }: {
      userId: User;
      candidateEvents: EventDetailsForRecommendation[];
      userContext: Record<string, unknown>; // Maps to SSF Map<String, Any>
      llmService: LLMService; // Generic 'Any' type in SSF is represented by specific interface here
      filterLocation?: string; // Optional location filter
    },
  ): Promise<EventDetailsForRecommendation[] | { error: string }> {
    // Retrieve userTags from this concept's state
    const userTagsResult = await this._getPersonalInterests({ user: userId });
    const userTags = new Set(userTagsResult.map(t => t.tag));

    if (!userId || userTags.size === 0 || !userContext || !llmService) {
      // Return an error if core inputs for augmented recommendations are missing
      return { error: "Invalid input for augmented recommendations (userId, userTags, userContext, or llmService missing/empty)." };
    }
    if (!candidateEvents || candidateEvents.length === 0) {
      // If no candidate events, return empty array (consistent with _getRecommendedEvents)
      return [];
    }

    let eventsToProcess = candidateEvents;
    if (filterLocation) {
        eventsToProcess = candidateEvents.filter(event => event.location.toLowerCase() === filterLocation.toLowerCase());
    }
    if (eventsToProcess.length === 0) {
        console.warn(`No events found matching the location filter: ${filterLocation}. Falling back to empty recommendations.`);
        return []; // Return empty if no events match filter
    }

    // Construct a detailed prompt for the LLM using the helper
    const prompt = this.createRecommendationPrompt(userId, userTags, userContext, eventsToProcess);

    try {
      // Invoke the LLM service
      console.log('🤖 Requesting AI-augmented recommendations from LLM...');
      const llmResult = await llmService.invoke(prompt);
      console.log('✅ Received response from LLM!');
      
      if (llmResult.error) {
        console.warn(`LLM service error: ${llmResult.error}. Falling back to non-augmented recommendations.`);
        // Fallback: use non-augmented logic with the *filtered* events
        return await this._getRecommendedEvents({ userId, candidateEvents: eventsToProcess, filterLocation });
      }

      const rankedEventIdsString = llmResult.result?.trim();
      if (!rankedEventIdsString) {
        console.warn("LLM returned an empty or invalid ranking. Falling back to non-augmented recommendations.");
        // Fallback: use non-augmented logic with the *filtered* events
        return await this._getRecommendedEvents({ userId, candidateEvents: eventsToProcess, filterLocation });
      }

      // Parse LLM's comma-separated list of event IDs
      const rankedEventIds = rankedEventIdsString.split(',')
                                               .map(id => id.trim() as Event)
                                               .filter(id => id !== ""); // Filter out any empty strings from split

      const augmentedRecommendations: EventDetailsForRecommendation[] = [];
      const eventMap = new Map<Event, EventDetailsForRecommendation>(eventsToProcess.map(e => [e.id, e]));

      // Populate augmentedRecommendations based on LLM's order
      for (const eventId of rankedEventIds) {
        const event = eventMap.get(eventId);
        if (event) {
          augmentedRecommendations.push(event);
          eventMap.delete(eventId); // Remove from map to avoid duplication and track unranked
        } else {
            console.warn(`LLM recommended event ID "${eventId}" that was not in the candidate list. Skipping.`);
        }
      }
      
      // If the LLM did not rank all events (or skipped some),
      // add the remaining (unranked by LLM) events using the non-augmented logic,
      // preserving their relative order from the non-augmented sort.
      const unrankedRemainingEvents = Array.from(eventMap.values());
      const nonAugmentedRemaining = await this._getRecommendedEvents({
        userId, 
        candidateEvents: unrankedRemainingEvents,
        filterLocation, // Ensure location filter is reapplied for consistency
      });
      
      return [...augmentedRecommendations, ...nonAugmentedRemaining];

    } catch (e) {
      console.error(`Error communicating with LLM service: ${e instanceof Error ? e.message : String(e)}. Falling back to non-augmented recommendations.`);
      // Fallback: use non-augmented logic with the *filtered* events
      return await this._getRecommendedEvents({ userId, candidateEvents: eventsToProcess, filterLocation });
    }
  }
}
```
