---
timestamp: 'Mon Oct 27 2025 00:40:11 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_004011.26803adf.md]]'
content_id: 13dfe3095de026bd3a002092b294413fda0027e94a2608857a2aa31da7e65e83
---

# file: src/eventrecommendation/EventRecommendationConcept.ts

```typescript
import { Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";

// Generic types for the concept's external dependencies
type User = ID;
type Event = ID;

/**
 * Interface for event details that are passed to the recommendation queries.
 * This structure should reflect the data needed from the 'Event' concept.
 */
interface EventDetailsForRecommendation {
  id: Event;
  name: string;
  date: Date; // Use Date object for chronological sorting
  location: string;
  description: string;
  relevantInterests: string[];
}

/**
 * Placeholder for an LLM service interface.
 * In a real application, this would be an actual client for an LLM API (e.g., Google Gemini).
 */
interface LLMService {
  invoke(prompt: string): Promise<{ result: string } | { error: string }>;
}

/**
 * @concept EventRecommendation
 * @purpose To provide personalized event recommendations to users by assessing relevance based on explicit user preferences and event characteristics, with the option for AI-driven refinement.
 *
 * This concept is designed to be stateless, performing computations on input data
 * rather than managing its own persistent collections. It serves as a computational engine
 * for generating and refining event recommendations.
 */
export default class EventRecommendationConcept {
  // The 'db' parameter is kept for consistency with concept class structure,
  // but not directly used for state management within this specific concept,
  // as it is designed to be stateless and operate on input parameters.
  constructor(private readonly db: Db) {}

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
   * Query: Generates a list of recommended events based on user tags and candidate events,
   * with optional filtering by location.
   * @param userId The ID of the user requesting recommendations.
   * @param userTags A set of strings representing the user's personal interests (e.g., from UserInterest concept).
   * @param candidateEvents An array of detailed event objects from the 'Event' concept to be considered.
   * @param filterLocation An optional string to filter events by their location.
   * @returns An array of ranked event details. Returns an empty array if inputs are invalid or no matching events.
   *
   * @requires userId is a valid user identifier. candidateEvents is a non-empty set of events with their details.
   *           filterLocation is an optional string.
   * @effects Filters candidateEvents by filterLocation if provided.
   *          Calculates a relevance score for each filtered event based on user tags and event interests.
   *          Returns an array of event details, sorted by relevance (highest first), then by date (earliest first).
   *          If candidateEvents is empty or userId is invalid, returns an empty array.
   */
  async _getRecommendedEvents(
    { userId, userTags, candidateEvents, filterLocation }: {
      userId: User;
      userTags: Set<string>;
      candidateEvents: EventDetailsForRecommendation[];
      filterLocation?: string; // Optional location filter
    },
  ): Promise<EventDetailsForRecommendation[]> {
    // Basic validation for critical inputs. Full validation for 'userId' would typically be handled upstream.
    if (!userId || !userTags) { 
      console.warn("Invalid userId or userTags for non-augmented recommendations.");
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
   * Query: Generates a list of AI-augmented recommended events.
   * This action leverages an external LLM service to provide more sophisticated and personalized rankings.
   * @param userId The ID of the user requesting recommendations.
   * @param userTags A set of strings representing the user's personal interests.
   * @param candidateEvents An array of detailed event objects from the 'Event' concept to be considered.
   * @param userContext A record containing additional context about the user for the LLM (e.g., preferences, recent activity).
   * @param llmService An instance of an LLM client/service to call (e.g., `new GeminiLLMClient()`).
   * @param filterLocation An optional string to filter events by location before sending to LLM (and for fallback).
   * @returns An array of ranked event details, or an error object if a critical failure occurs.
   *
   * @requires userId is a valid user identifier. candidateEvents is a non-empty set of events with full details.
   *           llmService is an operational LLM client/service. filterLocation is an optional string.
   * @effects Filters candidateEvents by filterLocation if provided.
   *          Constructs a detailed prompt for the llmService incorporating userId, userTags,
   *          the detailed filtered candidateEvents, and the userContext map.
   *          Invokes the llmService to analyze and rank the filtered candidateEvents based on the provided data.
   *          If the llmService call is successful, returns an array of event details, ranked by the llmService.
   *          If llmService fails or is unavailable, or returns invalid results, it falls back to
   *          the logic of _getRecommendedEvents using the provided inputs, returning the non-augmented ranked events,
   *          or an error if that also fails.
   */
  async _getAugmentedRecommendedEvents(
    { userId, userTags, candidateEvents, userContext, llmService, filterLocation }: {
      userId: User;
      userTags: Set<string>;
      candidateEvents: EventDetailsForRecommendation[];
      userContext: Record<string, unknown>; // Maps to SSF Map<String, Any>
      llmService: LLMService; // Generic 'Any' type in SSF is represented by specific interface here
      filterLocation?: string; // Optional location filter
    },
  ): Promise<EventDetailsForRecommendation[] | { error: string }> {
    if (!userId || !userTags || !userContext || !llmService) {
      return { error: "Invalid input for augmented recommendations (userId, userTags, userContext, or llmService missing)." };
    }
    if (!candidateEvents || candidateEvents.length === 0) {
      return { error: "Empty candidateEvents for augmented recommendations." };
    }

    let eventsToProcess = candidateEvents;
    if (filterLocation) {
        eventsToProcess = candidateEvents.filter(event => event.location.toLowerCase() === filterLocation.toLowerCase());
    }
    if (eventsToProcess.length === 0) {
        console.warn(`No events found matching the location filter: ${filterLocation}. Falling back to empty recommendations.`);
        return []; // Return empty if no events match filter
    }

    // Construct a detailed prompt for the LLM.
    const prompt = `User ID: ${userId}\n` +
                   `User Interests (tags): ${Array.from(userTags).join(", ")}\n` +
                   `Additional User Context: ${JSON.stringify(userContext, null, 2)}\n\n` +
                   `Candidate Events (ID, Name, Date, Location, Description, Interests):\n` +
                   eventsToProcess.map(e => `  - ID: ${e.id}, Name: ${e.name}, Date: ${e.date.toISOString()}, Location: ${e.location}, Description: ${e.description}, Interests: ${e.relevantInterests.join(", ")}`).join('\n') +
                   `\n\nPlease rank these events from most to least relevant for the user. Return only a comma-separated list of event IDs in the ranked order, for example: "event:ID1, event:ID2, event:ID3".` +
                   ` If you cannot determine, return an empty string.`;

    try {
      const llmResult = await llmService.invoke(prompt);

      if (llmResult.error) {
        console.warn(`LLM service error: ${llmResult.error}. Falling back to non-augmented recommendations.`);
        // Pass filtered events to fallback
        return await this._getRecommendedEvents({ userId, userTags, candidateEvents: eventsToProcess, filterLocation });
      }

      const rankedEventIdsString = llmResult.result?.trim();
      if (!rankedEventIdsString) {
        console.warn("LLM returned an empty or invalid ranking. Falling back to non-augmented recommendations.");
        // Pass filtered events to fallback
        return await this._getRecommendedEvents({ userId, userTags, candidateEvents: eventsToProcess, filterLocation });
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
        }
      }
      
      // If the LLM did not rank all events (or skipped some),
      // add the remaining (unranked by LLM) events using the non-augmented logic,
      // preserving their relative order from the non-augmented sort.
      const unrankedRemainingEvents = Array.from(eventMap.values());
      const nonAugmentedRemaining = await this._getRecommendedEvents({
        userId, 
        userTags, 
        candidateEvents: unrankedRemainingEvents,
        filterLocation, // Ensure location filter is reapplied for consistency
      });
      
      return [...augmentedRecommendations, ...nonAugmentedRemaining];

    } catch (e) {
      console.error(`Error communicating with LLM service: ${e instanceof Error ? e.message : String(e)}. Falling back to non-augmented recommendations.`);
      // Pass filtered events to fallback
      return await this._getRecommendedEvents({ userId, userTags, candidateEvents: eventsToProcess, filterLocation });
    }
  }
}
```
