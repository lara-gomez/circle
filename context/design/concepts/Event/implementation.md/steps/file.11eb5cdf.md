---
timestamp: 'Mon Oct 27 2025 02:12:22 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_021222.f8a32b0b.md]]'
content_id: 11eb5cdf547b8b80208246dd1209c1246261189cddf6d65084f2fc63ca2d08f0
---

# file: src/event/EventConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID, LLM } from "@utils/types.ts"; // Import LLM interface
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "Event" + ".";

// Generic types for the concept's external dependencies
type User = ID; // The concept is parameterized by User

// Internal entity types, represented as IDs
type Event = ID;

/**
 * State: a set of Events with organizer, name, date, duration, location, description, and status.
 */
interface EventDoc {
  _id: Event; // MongoDB document ID
  organizer: User;
  name: string;
  date: Date; // Stored as BSON Date in MongoDB, handled as JS Date in TypeScript
  duration: number; // Duration in minutes
  location: string;
  description: string;
  status: "upcoming" | "cancelled" | "completed";
}

/**
 * @concept Event
 * @purpose enable users to organize, track, and facilitate the discovery of time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen
 *
 * @principle A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system. Additionally, the system can surface relevant events by applying contextual filters and prioritizations to its stored event data, aiding in personalized discovery.
 */
export default class EventConcept {
  events: Collection<EventDoc>;

  constructor(private readonly db: Db) {
    this.events = this.db.collection(PREFIX + "events");
    // Add indexes for frequently queried fields to improve performance
    this.events.createIndexes([
      { key: { _id: 1 } },
      { key: { organizer: 1 } },
      { key: { status: 1 } },
      { key: { location: 1 } }, // Added index for location to speed up recommendation queries
    ]);
  }

  // --- Actions ---

  /**
   * createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)
   *
   * **requires**: date >= current_time; name != ""; location != ""; description != ""; duration > 0
   *
   * **effects**: creates an event with the given details associated with the organizer, sets the status to "upcoming"; returns the new event
   */
  async createEvent({
    organizer,
    name,
    date,
    duration,
    location,
    description,
  }: {
    organizer: User;
    name: string;
    date: Date;
    duration: number;
    location: string;
    description: string;
  }): Promise<{ event: Event } | { error: string }> {
    const currentTime = new Date();
    if (date.getTime() < currentTime.getTime()) {
      return { error: "Event date cannot be in the past." };
    }
    if (!name.trim()) {
      return { error: "Event name cannot be empty." };
    }
    if (!location.trim()) {
      return { error: "Event location cannot be empty." };
    }
    if (!description.trim()) {
      return { error: "Event description cannot be empty." };
    }
    if (duration <= 0) {
      return { error: "Event duration must be a positive number of minutes." };
    }

    const eventId = freshID() as Event;
    const newEvent: EventDoc = {
      _id: eventId,
      organizer,
      name,
      date,
      duration,
      location,
      description,
      status: "upcoming",
    };
    await this.events.insertOne(newEvent);
    return { event: eventId };
  }

  /**
   * modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)
   *
   * **requires**: organizer = event.organizer; newName != ""; newLocation != ""; newDescription != ""; newDate >= current_time; newDuration > 0; at least one field must differ from the original event details
   *
   * **effects**: event.name := newName, event.date := newDate, event.duration := newDuration, event.location := newLocation, event.description := newDescription; returns event
   */
  async modifyEvent({
    organizer,
    event: eventId,
    newName,
    newDate,
    newDuration,
    newLocation,
    newDescription,
  }: {
    organizer: User;
    event: Event;
    newName: string;
    newDate: Date;
    newDuration: number;
    newLocation: string;
    newDescription: string;
  }): Promise<{ event: Event } | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: eventId });
    if (!existingEvent) {
      return { error: `Event with ID ${eventId} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can modify the event." };
    }
    if (!newName.trim()) {
      return { error: "New event name cannot be empty." };
    }
    if (!newLocation.trim()) {
      return { error: "New event location cannot be empty." };
    }
    if (!newDescription.trim()) {
      return { error: "New event description cannot be empty." };
    }
    if (newDuration <= 0) {
      return { error: "New event duration must be a positive number of minutes." };
    }
    const currentTime = new Date();
    if (newDate.getTime() < currentTime.getTime()) {
      return { error: "New event date cannot be in the past." };
    }

    // Check if at least one field differs from the original event details
    // Note: Date comparison needs to be precise.
    if (
      newName === existingEvent.name &&
      newDate.getTime() === existingEvent.date.getTime() &&
      newDuration === existingEvent.duration &&
      newLocation === existingEvent.location &&
      newDescription === existingEvent.description
    ) {
      return { error: "At least one field must differ from the original event details to modify." };
    }

    const updateResult = await this.events.updateOne(
      { _id: eventId },
      {
        $set: {
          name: newName,
          date: newDate,
          duration: newDuration,
          location: newLocation,
          description: newDescription,
        },
      },
    );

    if (updateResult.matchedCount === 0) {
      return { error: `Event with ID ${eventId} could not be updated.` };
    }

    return { event: eventId };
  }

  /**
   * cancelEvent (organizer: User, event: Event)
   *
   * **requires**: organizer = event.organizer and event.status = "upcoming"
   *
   * **effects**: event.status := "cancelled"
   */
  async cancelEvent({ organizer, event: eventId }: { organizer: User; event: Event }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: eventId });
    if (!existingEvent) {
      return { error: `Event with ID ${eventId} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can cancel the event." };
    }
    if (existingEvent.status !== "upcoming") {
      return { error: "Event cannot be cancelled as its status is not 'upcoming'." };
    }

    const updateResult = await this.events.updateOne({ _id: eventId }, { $set: { status: "cancelled" } });
    if (updateResult.modifiedCount === 0) {
      return { error: `Event with ID ${eventId} could not be cancelled.` };
    }
    return {};
  }

  /**
   * unCancelEvent (organizer: User, event: Event): (event: Event)
   *
   * **requires**: organizer = event.organizer and event.status = "cancelled" and event.date + event.duration >= current_time
   *
   * **effects**: event.status := "upcoming"; returns event
   */
  async unCancelEvent({ organizer, event: eventId }: { organizer: User; event: Event }): Promise<{ event: Event } | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: eventId });
    if (!existingEvent) {
      return { error: `Event with ID ${eventId} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can un-cancel the event." };
    }
    if (existingEvent.status !== "cancelled") {
      return { error: "Event cannot be un-cancelled as its status is not 'cancelled'." };
    }

    const currentTime = new Date();
    const eventEndTime = new Date(existingEvent.date.getTime() + existingEvent.duration * 60 * 1000); // duration in minutes to milliseconds
    if (eventEndTime.getTime() < currentTime.getTime()) {
      return { error: "Cannot un-cancel an event that has already ended." };
    }

    const updateResult = await this.events.updateOne({ _id: eventId }, { $set: { status: "upcoming" } });
    if (updateResult.modifiedCount === 0) {
      return { error: `Event with ID ${eventId} could not be un-cancelled.` };
    }
    return { event: eventId };
  }

  /**
   * deleteEvent (organizer: User, event: Event)
   *
   * **requires**: organizer = event.organizer
   *
   * **effects**: removes event from the set of all existing events
   */
  async deleteEvent({ organizer, event: eventId }: { organizer: User; event: Event }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: eventId });
    if (!existingEvent) {
      return { error: `Event with ID ${eventId} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can delete the event." };
    }

    const deleteResult = await this.events.deleteOne({ _id: eventId });
    if (deleteResult.deletedCount === 0) {
      return { error: `Event with ID ${eventId} could not be deleted.` };
    }
    return {};
  }

  /**
   * **system** completeEvent (event: Event)
   *
   * **requires**: event.status = "upcoming" and (event.date + event.duration <= current_time)
   *
   * **effects**: event.status := "completed"
   */
  async completeEvent({ event: eventId }: { event: Event }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: eventId });
    if (!existingEvent) {
      return { error: `Event with ID ${eventId} not found.` };
    }
    if (existingEvent.status !== "upcoming") {
      return { error: "Event cannot be completed as its status is not 'upcoming'." };
    }

    const currentTime = new Date();
    const eventEndTime = new Date(existingEvent.date.getTime() + existingEvent.duration * 60 * 1000); // duration in minutes to milliseconds
    if (eventEndTime.getTime() > currentTime.getTime()) {
      return { error: "Event cannot be completed as it has not yet ended." };
    }

    const updateResult = await this.events.updateOne({ _id: eventId }, { $set: { status: "completed" } });
    if (updateResult.modifiedCount === 0) {
      return { error: `Event with ID ${eventId} could not be marked as completed.` };
    }
    return {};
  }

  // --- Queries ---

  /**
   * Query: _getEventById (event: Event): (event: EventDoc)
   *
   * **requires**: true (existence check is handled by returning an empty array if not found)
   *
   * **effects**: returns the event document as an array, or an empty array if not found
   */
  async _getEventById({ event: eventId }: { event: Event }): Promise<EventDoc[]> {
    const event = await this.events.findOne({ _id: eventId });
    if (!event) {
      return [];
    }
    return [event];
  }

  /**
   * Query: _getEventsByOrganizer (organizer: User): (event: EventDoc)
   *
   * **requires**: true
   *
   * **effects**: returns a list of all events organized by the given user
   */
  async _getEventsByOrganizer({ organizer }: { organizer: User }): Promise<EventDoc[]> {
    return await this.events.find({ organizer }).toArray();
  }

  /**
   * Query: _getEventsByStatus (status: "upcoming" | "cancelled" | "completed"): (event: EventDoc)
   *
   * **requires**: status is one of the valid enum values
   *
   * **effects**: returns a list of all events with the given status
   */
  async _getEventsByStatus({ status }: { status: "upcoming" | "cancelled" | "completed" }): Promise<EventDoc[]> {
    return await this.events.find({ status }).toArray();
  }

  /**
   * Query: _getAllEvents (): (event: EventDoc)
   *
   * **requires**: true
   *
   * **effects**: returns a list of all events
   */
  async _getAllEvents(): Promise<EventDoc[]> {
    return await this.events.find({}).toArray();
  }

  /**
   * Query: _getEventsByRecommendationContext (user: User, llm: LLM, filters: String, priorities: String): (event: EventDoc) | (error: String)
   *
   * **requires**: `llm` is provided, `filters` and `priorities` are valid JSON strings.
   *             `filters` must contain a `location` field.
   *
   * **effects**: Returns a list of recommended events (EventDoc) based on user interests,
   *              context, and location, as determined by the provided LLM.
   *              Returns an error if inputs are invalid or LLM interaction fails.
   */
  async _getEventsByRecommendationContext({ user, llm, filters, priorities }: {
    user: User;
    llm: LLM;
    filters: string;
    priorities: string;
  }): Promise<EventDoc[] | { error: string }> {
    // Parse filters
    let parsedFilters: { interests?: string[]; location?: string };
    try {
      parsedFilters = JSON.parse(filters);
    } catch (e) {
      return { error: `Invalid filters JSON: ${e.message}` };
    }
    const userInterests = parsedFilters.interests || [];
    const userLocation = parsedFilters.location;

    if (!userLocation || userLocation.trim() === "") {
      return { error: "Location must be provided in filters for recommendations." };
    }

    // Parse priorities
    let parsedPriorities: { context?: Record<string, any> };
    try {
      parsedPriorities = JSON.parse(priorities);
    } catch (e) {
      return { error: `Invalid priorities JSON: ${e.message}` };
    }
    const recommendationContext = parsedPriorities.context || {};

    try {
      console.log('🤖 Requesting AI-augmented recommendations from LLM...');

      // Only consider upcoming or cancelled events for recommendations, excluding completed ones.
      const candidateEvents = await this.events.find({
        location: userLocation,
        status: { $in: ["upcoming", "cancelled"] },
      }).toArray();

      if (candidateEvents.length === 0) {
        console.log("⚠️ No candidate events available in this location for recommendations.");
        return []; // As per query convention, return empty array if no results.
      }

      const prompt = this.createRecommendationPrompt(userInterests, recommendationContext, candidateEvents);
      const text = await llm.executeLLM(prompt);

      console.log('✅ Received response from LLM!');
      console.log('\n🤖 RAW LLM RESPONSE');
      console.log('======================');
      console.log(text);
      console.log('======================\n');

      // Parse and apply the assignments
      const recommendations = this.parseAndApplyRecommendations(text, candidateEvents);
      if ('error' in recommendations) {
        return recommendations; // Propagate the error object
      }
      return recommendations;

    } catch (error) {
      console.error('❌ Error calling LLM API:', (error as Error).message);
      return { error: `Error during LLM recommendation process: ${(error as Error).message}` };
    }
  }

  /**
   * Helper: Formats a list of EventDoc objects into a string for the LLM prompt.
   * @param events The list of candidate events.
   * @returns A formatted string representation of events.
   */
  private eventsToString(events: EventDoc[]): string {
    // When providing events to the LLM, we use name, description, date, and location.
    // The prompt asks the LLM to consider relevance from the event's 'Description' and 'Name' fields.
    return events.map(event =>
      `Event Name: "${event.name}"\n` +
      `Description: "${event.description}"\n` +
      `Date: ${event.date.toISOString()}\n` +
      `Location: ${event.location}`
    ).join('\n---\n'); // Use a clear separator for distinct events
  }

  /**
   * Helper: Creates the prompt for the LLM with hardwired preferences.
   * @param interests User's interests.
   * @param context Additional contextual information.
   * @param events Candidate events.
   * @returns The formatted prompt string.
   */
  private createRecommendationPrompt(interests: string[], context: Record<string, any>, events: EventDoc[]): string {
    const criticalRequirements = [
      "1. Recommend ALL candidate events that are relevant to the user's interests (do not pick just one).",
      "2. Identify alignment with the user's interests primarily from the event's 'Description' and 'Name' fields.",
      "3. Prioritize based on overlap with the user's interests.",
      "4. Use the context to adjust ranking (e.g., if context mentions networking, prioritize events with career or professional development as well).",
      "5. Rank events chronologically if they have equal relevance.",
      "6. Return ONLY valid event names EXACTLY as they appear in the 'Event Name: \"...\"' field in the candidate list."
    ];

    return `
You are a helpful AI assistant that recommends events to users based on their interests.

USER INTERESTS:
${interests.join(", ")}

CANDIDATE EVENTS (ONLY CHOOSE FROM THESE):
${this.eventsToString(events)}

CRITICAL REQUIREMENTS:
${criticalRequirements.join('\n')}

CONTEXT:
${JSON.stringify(context)}

Return your response as a JSON object with this exact structure:
{
  "recommendations": [
    {
      "name": "exact event name from the list above",
      "reason": "short explanation of why this event aligns with the user's interests"
    }
  ]
}

Return ONLY the JSON object, no additional text.`;
  }

  /**
   * Helper: Parses the LLM response and validates the recommendations against candidate events.
   * @param responseText The raw text response from the LLM.
   * @param candidateEvents The original list of candidate EventDoc objects.
   * @returns An array of recommended EventDoc objects or an error object.
   */
  private parseAndApplyRecommendations(responseText: string, candidateEvents: EventDoc[]): EventDoc[] | { error: string } {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { error: 'LLM response did not contain a valid JSON object.' };
      }

      const response = JSON.parse(jsonMatch[0]);

      if (!response.recommendations || !Array.isArray(response.recommendations)) {
        return { error: 'Invalid response format from LLM: "recommendations" array is missing or malformed.' };
      }

      console.log('📝 Applying LLM recommendations...');

      const eventsByName = new Map<string, EventDoc[]>();
      for (const event of candidateEvents) {
        const list = eventsByName.get(event.name) ?? [];
        list.push(event);
        eventsByName.set(event.name, list);
      }

      const issues: string[] = [];
      const validatedRecommendations: EventDoc[] = [];

      for (const rawRec of response.recommendations) {
        // validator 1
        if (typeof rawRec !== 'object' || rawRec === null) {
          issues.push('Encountered a recommendation entry that is not an object.');
          continue;
        }

        const { name, reason } = rawRec as { name?: unknown; reason?: unknown };

        // validator 2
        if (typeof name !== 'string' || !name.trim()) {
          issues.push('Recommendation is missing a valid event name.');
          continue;
        }

        // validator 3
        const pool = eventsByName.get(name);
        if (!pool || pool.length === 0) {
          issues.push(`No available candidate event named "${name}" to recommend. LLM suggested an invalid event name.`);
          continue;
        }

        // Use shift to get and remove one instance if multiple events have the same name.
        const event = pool.shift() as EventDoc;

        validatedRecommendations.push(event);
        console.log(`✅ Recommended "${event.name}" (Reason: ${reason ?? "no reason provided"})`);
      }

      if (issues.length > 0) {
        // Log all issues but return a single error message
        console.error('❌ LLM provided disallowed recommendations or had parsing issues:', issues.join('\n- '));
        return { error: `LLM provided disallowed recommendations or had parsing issues: ${issues.join('; ')}` };
      }

      return validatedRecommendations;

    } catch (error) {
      console.error('❌ Error parsing LLM response or validating recommendations:', (error as Error).message);
      // If parsing fails completely, catch and return a general error.
      return { error: `Internal error during LLM response processing: ${(error as Error).message}` };
    }
  }
}
```
