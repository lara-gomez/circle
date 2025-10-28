---
timestamp: 'Mon Oct 27 2025 02:04:16 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_020416.96c7a6a1.md]]'
content_id: 7aefda7cc55cb4136b7f07a910156840a1bd705741c3110969859b8fc0218323
---

# file: src/event/EventConcept.ts

```typescript
import { Collection, Db, Filter, Sort } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "Event" + ".";

// Generic type for the concept's external dependency
type User = ID;

// Internal entity type, represented as ID
type EventId = ID; // Renamed to EventId to avoid conflict with the interface name

/**
 * Enumerated type for event status.
 */
type EventStatus = "upcoming" | "cancelled" | "completed";

/**
 * State: A set of Events.
 */
interface EventDoc {
  _id: EventId; // MongoDB document ID
  organizer: User;
  name: string;
  date: Date; // Stored as ISODate in MongoDB
  duration: number; // Duration in minutes
  location: string;
  description: string;
  status: EventStatus;
}

/**
 * Output structure for event queries.
 */
interface EventOutput {
  id: EventId;
  organizer: User;
  name: string;
  date: Date;
  duration: number;
  location: string;
  description: string;
  status: EventStatus;
}

/**
 * @concept Event
 * @purpose enable users to organize, track, and facilitate the discovery of time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen, and supporting its retrieval based on externally provided contextual criteria.
 * @principle A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system. Additionally, the system can surface relevant events by applying externally derived contextual filters and prioritizations to its stored event data, aiding in personalized discovery without the event concept itself managing user preferences or advanced recommendation algorithms.
 */
export default class EventConcept {
  events: Collection<EventDoc>;

  constructor(private readonly db: Db) {
    this.events = this.db.collection(PREFIX + "events");
    // Optionally create indexes for frequently queried fields
    this.events.createIndex({ organizer: 1 });
    this.events.createIndex({ date: 1 });
    this.events.createIndex({ status: 1 });
  }

  /**
   * Helper to convert an EventDoc to EventOutput
   */
  private mapToEventOutput(doc: EventDoc): EventOutput {
    return {
      id: doc._id,
      organizer: doc.organizer,
      name: doc.name,
      date: doc.date,
      duration: doc.duration,
      location: doc.location,
      description: doc.description,
      status: doc.status,
    };
  }

  /**
   * createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)
   *
   * @requires date >= current_time; name != ""; location != ""; description != ""; duration > 0
   * @effects creates an event with the given details associated with the organizer, sets the status to "upcoming"; returns the new event
   */
  async createEvent({ organizer, name, date, duration, location, description }: { organizer: User; name: string; date: Date; duration: number; location: string; description: string }): Promise<{ event: EventId } | { error: string }> {
    const currentTime = new Date();
    if (date < currentTime) {
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
      return { error: "Event duration must be greater than 0 minutes." };
    }

    const eventId = freshID() as EventId;
    await this.events.insertOne({ _id: eventId, organizer, name, date, duration, location, description, status: "upcoming" });
    return { event: eventId };
  }

  /**
   * modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)
   *
   * @requires organizer = event.organizer; newName != ""; newLocation != ""; newDescription != ""; newDate >= current_time; newDuration > 0; at least one field must differ from the original event details
   * @effects event.name := newName, event.date := newDate, event.duration := newDuration, event.location := newLocation, event.description := newDescription; returns event
   */
  async modifyEvent({ organizer, event, newName, newDate, newDuration, newLocation, newDescription }: { organizer: User; event: EventId; newName: string; newDate: Date; newDuration: number; newLocation: string; newDescription: string }): Promise<{ event: EventId } | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can modify the event." };
    }
    if (existingEvent.status === "completed") {
      return { error: "Cannot modify a completed event." };
    }

    const currentTime = new Date();
    if (newDate < currentTime) {
      return { error: "New event date cannot be in the past." };
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
      return { error: "New event duration must be greater than 0 minutes." };
    }

    // Check if any field actually differs
    const hasChanges =
      existingEvent.name !== newName ||
      existingEvent.date.getTime() !== newDate.getTime() ||
      existingEvent.duration !== newDuration ||
      existingEvent.location !== newLocation ||
      existingEvent.description !== newDescription;

    if (!hasChanges) {
      return { error: "No changes detected. At least one field must differ from the original event details." };
    }

    const result = await this.events.updateOne(
      { _id: event },
      { $set: { name: newName, date: newDate, duration: newDuration, location: newLocation, description: newDescription, status: "upcoming" } } // Reset status to upcoming if modified
    );

    if (result.matchedCount === 0) {
      return { error: `Event with ID ${event} could not be updated.` };
    }
    return { event: event };
  }

  /**
   * cancelEvent (organizer: User, event: Event)
   *
   * @requires organizer = event.organizer and event.status = "upcoming"
   * @effects event.status := "cancelled"
   */
  async cancelEvent({ organizer, event }: { organizer: User; event: EventId }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can cancel the event." };
    }
    if (existingEvent.status !== "upcoming") {
      return { error: `Event with ID ${event} is not in "upcoming" status and cannot be cancelled.` };
    }

    await this.events.updateOne({ _id: event }, { $set: { status: "cancelled" } });
    return {};
  }

  /**
   * unCancelEvent (organizer: User, event: Event): (event: Event)
   *
   * @requires organizer = event.organizer and event.status = "cancelled" and event.date + event.duration (in minutes) >= current_time
   * @effects event.status := "upcoming"; returns event
   */
  async unCancelEvent({ organizer, event }: { organizer: User; event: EventId }): Promise<{ event: EventId } | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can uncanceled the event." };
    }
    if (existingEvent.status !== "cancelled") {
      return { error: `Event with ID ${event} is not in "cancelled" status.` };
    }

    const eventEndTime = new Date(existingEvent.date.getTime() + existingEvent.duration * 60 * 1000);
    const currentTime = new Date();
    if (eventEndTime < currentTime) {
      return { error: `Event with ID ${event} has already ended and cannot be uncanceled.` };
    }

    await this.events.updateOne({ _id: event }, { $set: { status: "upcoming" } });
    return { event: event };
  }

  /**
   * deleteEvent (organizer: User, event: Event)
   *
   * @requires organizer = event.organizer
   * @effects removes event from the set of all existing events
   */
  async deleteEvent({ organizer, event }: { organizer: User; event: EventId }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can delete the event." };
    }

    await this.events.deleteOne({ _id: event });
    return {};
  }

  /**
   * system completeEvent (event: Event)
   *
   * @requires event.status = "upcoming" and (event.date + event.duration (in minutes) <= current_time)
   * @effects event.status := "completed"
   */
  async completeEvent({ event }: { event: EventId }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.status !== "upcoming") {
      return { error: `Event with ID ${event} is not in "upcoming" status.` };
    }

    const eventEndTime = new Date(existingEvent.date.getTime() + existingEvent.duration * 60 * 1000);
    const currentTime = new Date();
    if (eventEndTime > currentTime) {
      return { error: `Event with ID ${event} has not yet ended.` };
    }

    await this.events.updateOne({ _id: event }, { $set: { status: "completed" } });
    return {};
  }

  /**
   * _getEvent (event: Event) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)
   *
   * @requires The event must exist.
   * @effects Returns the full details of the specified event.
   */
  async _getEvent({ event }: { event: EventId }): Promise<EventOutput[] | { error: string }> {
    const eventDoc = await this.events.findOne({ _id: event });
    if (!eventDoc) {
      return { error: `Event with ID ${event} not found.` };
    }
    return [this.mapToEventOutput(eventDoc)];
  }

  /**
   * _getEventsByOrganizer (organizer: User) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})
   *
   * @requires The organizer must exist.
   * @effects Returns all events organized by the specified user.
   */
  async _getEventsByOrganizer({ organizer }: { organizer: User }): Promise<EventOutput[]> {
    const events = await this.events.find({ organizer }).toArray();
    return events.map(this.mapToEventOutput);
  }

  /**
   * _getUpcomingEvents () : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})
   *
   * @effects Returns all upcoming events (status "upcoming" and event end time is in the future).
   */
  async _getUpcomingEvents(): Promise<EventOutput[]> {
    const currentTime = new Date();
    // Find events that are 'upcoming' AND their end time (date + duration) is in the future
    const events = await this.events.find({
      status: "upcoming",
      date: { $gt: currentTime } // Simplified to just check start date, as precise end date checking in mongo requires aggregation or a pre-calculated field
    }).toArray();
    
    // More precise filtering in memory to ensure event is truly upcoming
    return events
        .filter(event => (new Date(event.date.getTime() + event.duration * 60 * 1000)) > currentTime)
        .map(this.mapToEventOutput);
  }

  /**
   * _getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)
   *
   * @requires The `filters` and `priorities` strings, if provided, must be parsable as JSON and their content understood by the concept for filtering/ordering events. The `user` parameter is used for context but the `Event` concept does not store user-specific recommendation data.
   * @effects Returns a set of event details, filtered and potentially ordered, based on the provided contextual criteria. Returns an error if the criteria are malformed or cannot be applied internally.
   */
  async _getEventsByRecommendationContext({ user, filters, priorities }: { user: User; filters: string; priorities: string }): Promise<EventOutput[] | { error: string }> {
    let filterObj: any = {};
    let sortObj: Sort = { date: 1 }; // Default sort by date ascending
    let boostEventIds: EventId[] = [];
    const currentTime = new Date();

    try {
      if (filters) {
        const parsedFilters = JSON.parse(filters);
        // Example filters: categoryKeywords, locationKeywords, dateMin, dateMax
        if (parsedFilters.categoryKeywords && Array.isArray(parsedFilters.categoryKeywords) && parsedFilters.categoryKeywords.length > 0) {
          // Assuming event name or description might contain categories. For more robust, would need explicit category field.
          const keywordRegex = new RegExp(parsedFilters.categoryKeywords.join('|'), 'i');
          filterObj.$or = [
            { name: { $regex: keywordRegex } },
            { description: { $regex: keywordRegex } }
          ];
        }
        if (parsedFilters.locationKeywords && Array.isArray(parsedFilters.locationKeywords) && parsedFilters.locationKeywords.length > 0) {
            const locationRegex = new RegExp(parsedFilters.locationKeywords.join('|'), 'i');
            filterObj.location = { $regex: locationRegex };
        }
        if (parsedFilters.dateMin) {
          filterObj.date = { ...filterObj.date, $gte: new Date(parsedFilters.dateMin) };
        }
        if (parsedFilters.dateMax) {
          filterObj.date = { ...filterObj.date, $lte: new Date(parsedFilters.dateMax) };
        }
      }

      if (priorities) {
        const parsedPriorities = JSON.parse(priorities);
        if (parsedPriorities.boostEventIds && Array.isArray(parsedPriorities.boostEventIds)) {
          boostEventIds = parsedPriorities.boostEventIds as EventId[];
        }
        if (parsedPriorities.sortBy === "dateDesc") {
          sortObj = { date: -1 };
        } else if (parsedPriorities.sortBy === "nameAsc") {
          sortObj = { name: 1 };
        } // Add more sorting options as needed
      }
    } catch (e) {
      return { error: `Failed to parse filters or priorities: ${e.message}` };
    }

    // Always filter for upcoming or cancelled events (not completed unless specified)
    // For recommendations, usually we want upcoming events
    filterObj.status = "upcoming";
    filterObj.date = { ...filterObj.date, $gt: currentTime }; // Ensure event hasn't started yet

    let queryCursor = this.events.find(filterObj).sort(sortObj);

    // Apply boosting logic (this is a simple in-memory boosting example)
    // For large datasets, this might be better handled in an aggregation pipeline or in the external recommendation service.
    let filteredEvents = await queryCursor.toArray();

    if (boostEventIds.length > 0) {
      const boostedMap = new Map<EventId, EventDoc>();
      const nonBoostedEvents: EventDoc[] = [];

      for (const event of filteredEvents) {
        if (boostEventIds.includes(event._id)) {
          boostedMap.set(event._id, event);
        } else {
          nonBoostedEvents.push(event);
        }
      }

      const orderedBoostedEvents = boostEventIds
        .map(id => boostedMap.get(id))
        .filter((event): event is EventDoc => event !== undefined);

      filteredEvents = [...orderedBoostedEvents, ...nonBoostedEvents];
    }
    
    // The 'user' parameter is received, but the Event concept does not store or process
    // any user-specific recommendation metadata or history, demonstrating independence.
    // The actual "augmentation" of recommendations based on user interests/reviews
    // happens *before* this query is called, and is encoded in `filters` and `priorities`.

    return filteredEvents.map(this.mapToEventOutput);
  }
}
```
