---
timestamp: 'Mon Oct 27 2025 02:11:29 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_021129.0233fa16.md]]'
content_id: 81438029e00a1091b8028b50032607ab8b53c3e7718584f4069ffe3c4a96a89a
---

# file: src/event/EventConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
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
    // These indexes will speed up queries by organizer (e.g., _getEventsByOrganizer)
    // and by status (e.g., _getEventsByStatus), as well as findOne operations on _id
    this.events.createIndexes([
      { key: { _id: 1 } }, // MongoDB typically has a default _id index, but explicit is fine.
      { key: { organizer: 1 } },
      { key: { status: 1 } },
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
    if (duration <= 0) { // Added precondition check
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
    if (newDuration <= 0) { // Added precondition check
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
      // This implies an internal DB issue if matchedCount was > 0 but modifiedCount was 0
      // after the explicit check above, so we keep this as a general safeguard.
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
    // As per query convention, return an empty array if not found, not an error object.
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
}
```
