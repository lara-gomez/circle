[@sync-background](../background/sync-background.md)

[@event-concept](../concepts/Event/implementation.md)

[@friending-concept](../concepts/Friending/implementation.md)

[@reviewing-concept](../concepts/Reviewing/implementation.md)

[@session-concept](../concepts/Session/implementation.md)

[@userauth-concept](../concepts/UserAuthentication/implementation.md)

[@interest-concept](../concepts/UserInterest/implementation.md)

[@api-syncs](api-syncs.md)

[@sync-design](sync-design.md)

[@sample-sync](../../src/syncs/sample.sync.ts)

# prompt: provide the implementation for event related syncs. do not use helpers and model this after the sample sync file
# response:

### `src/syncs/event.sync.ts` - Event Synchronizations

```typescript
// file: src/syncs/event.sync.ts
import { actions, Frames, Sync } from "@engine";
import { Requesting } from "@concepts/Requesting/RequestingConcept.ts";
import EventConcept from "@concepts/Event/EventConcept.ts";
import SessioningConcept from "@concepts/Sessioning/SessionConcept.ts";
import UserInterestConcept from "@concepts/UserInterest/UserInterestConcept.ts"; // Needed for cascading deletion
import ReviewingConcept from "@concepts/Reviewing/ReviewingConcept.ts";     // Needed for cascading deletion

// Aliases for cleaner sync syntax
const Session = SessionConcept;
const Event = EventConcept;
const Interest = UserInterestConcept;
const Review = ReviewingConcept;

// A single object to hold all event-related syncs for export
export const eventSyncs: { [key: string]: Sync } = {};

// --- Action Syncs (Require Authentication and Authorization) ---

// REQUEST: Create an Event
eventSyncs.RequestCreateEvent = ({ request, name, date, duration, location, description, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/createEvent", name, date, duration, location, description, session },
        { request },
    ]),
    where: async (frames) => {
        // Authenticate the user from the session
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        // If authentication fails, no frames proceed
        return frames;
    },
    then: actions([
        Event.createEvent,
        { organizer: 'currentUser', name, date, duration, location, description }
    ]),
});

// RESPONSE: Successful Event Creation
eventSyncs.CreateEventResponse = ({ request, event }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/createEvent" }, { request }],
        [Event.createEvent, {}, { event }], // Match the success output from the concept action
    ),
    then: actions([Requesting.respond, { request, event }]),
});

// RESPONSE: Error during Event Creation
eventSyncs.CreateEventErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/createEvent" }, { request }],
        [Event.createEvent, {}, { error }], // Match the error output from the concept action
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// REQUEST: Modify an Event
eventSyncs.RequestModifyEvent = ({ request, event, newName, newDate, newDuration, newLocation, newDescription, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/modifyEvent", event, newName, newDate, newDuration, newLocation, newDescription, session },
        { request },
    ]),
    where: async (frames) => {
        // Authenticate the user from the session
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        if (frames.length === 0) return new Frames(); // Invalid session implies no authentication

        // Authorize: Only the event organizer can modify
        // Fetch event details to check organizer. The Event concept's _getEventById returns EventDoc[]
        frames = await frames.query(Event._getEventById, { event }, { eventDocs: 'eventDetail' });
        // Filter frames to only include those where the currentUser is the event's organizer
        return frames.filter(f => f.eventDetail && f.eventDetail.length > 0 && f.currentUser === f.eventDetail[0].organizer);
    },
    then: actions([
        Event.modifyEvent,
        { organizer: 'currentUser', event: 'event', newName, newDate, newDuration, newLocation, newDescription }
    ]),
});

// RESPONSE: Successful Event Modification
eventSyncs.ModifyEventResponse = ({ request, event }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/modifyEvent" }, { request }],
        [Event.modifyEvent, {}, { event }],
    ),
    then: actions([Requesting.respond, { request, event }]),
});

// RESPONSE: Error during Event Modification
eventSyncs.ModifyEventErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/modifyEvent" }, { request }],
        [Event.modifyEvent, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// REQUEST: Cancel an Event
eventSyncs.RequestCancelEvent = ({ request, event, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/cancelEvent", event, session },
        { request },
    ]),
    where: async (frames) => {
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        if (frames.length === 0) return new Frames();

        frames = await frames.query(Event._getEventById, { event }, { eventDocs: 'eventDetail' });
        return frames.filter(f => f.eventDetail && f.eventDetail.length > 0 && f.currentUser === f.eventDetail[0].organizer);
    },
    then: actions([
        Event.cancelEvent,
        { organizer: 'currentUser', event }
    ]),
});

// RESPONSE: Successful Event Cancellation (Empty response from concept)
eventSyncs.CancelEventResponse = ({ request }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/cancelEvent" }, { request }],
        [Event.cancelEvent, {}, {}], // Concept returns Empty {} on success
    ),
    then: actions([Requesting.respond, { request, success: true }]), // Explicit success message
});

// RESPONSE: Error during Event Cancellation
eventSyncs.CancelEventErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/cancelEvent" }, { request }],
        [Event.cancelEvent, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// REQUEST: Uncancel an Event
eventSyncs.RequestUnCancelEvent = ({ request, event, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/unCancelEvent", event, session },
        { request },
    ]),
    where: async (frames) => {
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        if (frames.length === 0) return new Frames();

        frames = await frames.query(Event._getEventById, { event }, { eventDocs: 'eventDetail' });
        return frames.filter(f => f.eventDetail && f.eventDetail.length > 0 && f.currentUser === f.eventDetail[0].organizer);
    },
    then: actions([
        Event.unCancelEvent,
        { organizer: 'currentUser', event }
    ]),
});

// RESPONSE: Successful Event Uncancellation
eventSyncs.UnCancelEventResponse = ({ request, event }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/unCancelEvent" }, { request }],
        [Event.unCancelEvent, {}, { event }],
    ),
    then: actions([Requesting.respond, { request, event }]),
});

// RESPONSE: Error during Event Uncancellation
eventSyncs.UnCancelEventErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/unCancelEvent" }, { request }],
        [Event.unCancelEvent, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// REQUEST: Delete an Event
eventSyncs.RequestDeleteEvent = ({ request, event, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/deleteEvent", event, session },
        { request },
    ]),
    where: async (frames) => {
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        if (frames.length === 0) return new Frames();

        frames = await frames.query(Event._getEventById, { event }, { eventDocs: 'eventDetail' });
        return frames.filter(f => f.eventDetail && f.eventDetail.length > 0 && f.currentUser === f.eventDetail[0].organizer);
    },
    then: actions([
        Event.deleteEvent,
        { organizer: 'currentUser', event }
    ]),
});

// RESPONSE: Successful Event Deletion (Empty response from concept)
eventSyncs.DeleteEventResponse = ({ request }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/deleteEvent" }, { request }],
        [Event.deleteEvent, {}, {}], // Concept returns Empty {} on success
    ),
    then: actions([Requesting.respond, { request, success: true }]),
});

// RESPONSE: Error during Event Deletion
eventSyncs.DeleteEventErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/deleteEvent" }, { request }],
        [Event.deleteEvent, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// --- Query Syncs (Authentication status as per prompt: public for most, auth for recommendation) ---

// REQUEST: Get Events by Organizer (Public)
eventSyncs.RequestGetEventsByOrganizer = ({ request, organizer }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/_getEventsByOrganizer", organizer },
        { request },
    ]),
    where: async (frames) => frames, // No authentication required for this query
    then: actions([
        Event._getEventsByOrganizer,
        { organizer },
        { event: 'eventDocs' } // EventConcept returns EventDoc[], so bind as 'eventDocs'
    ]),
});

// RESPONSE: Successful Get Events by Organizer
eventSyncs.GetEventsByOrganizerResponse = ({ request, eventDocs }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventsByOrganizer" }, { request }],
        [Event._getEventsByOrganizer, {}, { event: eventDocs }], // Match the array output as 'event' (per concept spec)
    ),
    then: actions([Requesting.respond, { request, data: eventDocs }]),
});

// RESPONSE: Error during Get Events by Organizer
eventSyncs.GetEventsByOrganizerErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventsByOrganizer" }, { request }],
        [Event._getEventsByOrganizer, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});

// REQUEST: Get Event by ID (Public)
eventSyncs.RequestGetEventById = ({ request, event }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/_getEventById", event },
        { request },
    ]),
    where: async (frames) => frames, // No authentication required
    then: actions([
        Event._getEventById,
        { event },
        { event: 'eventDocs' } // EventConcept returns EventDoc[], bind as 'eventDocs'
    ]),
});

// RESPONSE: Successful Get Event by ID
eventSyncs.GetEventByIdResponse = ({ request, eventDocs }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventById" }, { request }],
        [Event._getEventById, {}, { event: eventDocs }],
    ),
    then: actions([Requesting.respond, { request, data: eventDocs }]),
});

// RESPONSE: Error during Get Event by ID
eventSyncs.GetEventByIdErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventById" }, { request }],
        [Event._getEventById, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});

// REQUEST: Get Events by Recommendation Context (Requires Authentication)
eventSyncs.RequestGetEventsByRecommendationContext = ({ request, filters, priorities, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/_getEventsByRecommendationContext", filters, priorities, session },
        { request },
    ]),
    where: async (frames) => {
        // Authenticate the user from the session as this query is personalized
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        return frames;
    },
    then: actions([
        Event._getEventsByRecommendationContext,
        { user: 'currentUser', filters, priorities },
        { event: 'eventDocs' } // EventConcept returns EventDoc[], bind as 'eventDocs'
    ]),
});

// RESPONSE: Successful Get Events by Recommendation Context
eventSyncs.GetEventsByRecommendationContextResponse = ({ request, eventDocs }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventsByRecommendationContext" }, { request }],
        [Event._getEventsByRecommendationContext, {}, { event: eventDocs }],
    ),
    then: actions([Requesting.respond, { request, data: eventDocs }]),
});

// RESPONSE: Error during Get Events by Recommendation Context
eventSyncs.GetEventsByRecommendationContextErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventsByRecommendationContext" }, { request }],
        [Event._getEventsByRecommendationContext, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});

// REQUEST: Get Events by Status (Public)
eventSyncs.RequestGetEventsByStatus = ({ request, status }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/_getEventsByStatus", status },
        { request },
    ]),
    where: async (frames) => frames, // No authentication required
    then: actions([
        Event._getEventsByStatus,
        { status },
        { event: 'eventDocs' } // EventConcept returns EventDoc[], bind as 'eventDocs'
    ]),
});

// RESPONSE: Successful Get Events by Status
eventSyncs.GetEventsByStatusResponse = ({ request, eventDocs }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventsByStatus" }, { request }],
        [Event._getEventsByStatus, {}, { event: eventDocs }],
    ),
    then: actions([Requesting.respond, { request, data: eventDocs }]),
});

// RESPONSE: Error during Get Events by Status
eventSyncs.GetEventsByStatusErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventsByStatus" }, { request }],
        [Event._getEventsByStatus, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});

// REQUEST: Get All Events (Public)
eventSyncs.RequestGetAllEvents = ({ request }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/_getAllEvents" }, // No parameters
        { request },
    ]),
    where: async (frames) => frames, // No authentication required
    then: actions([
        Event._getAllEvents,
        {}, // No parameters for the concept action
        { event: 'eventDocs' } // EventConcept returns EventDoc[], bind as 'eventDocs'
    ]),
});

// RESPONSE: Successful Get All Events
eventSyncs.GetAllEventsResponse = ({ request, eventDocs }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getAllEvents" }, { request }],
        [Event._getAllEvents, {}, { event: eventDocs }],
    ),
    then: actions([Requesting.respond, { request, data: eventDocs }]),
});

// RESPONSE: Error during Get All Events
eventSyncs.GetAllEventsErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getAllEvents" }, { request }],
        [Event._getAllEvents, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// --- System Action Syncs (Not triggered by HTTP Requesting.request) ---

// RESPONSE: Error during system completeEvent (for internal logging/monitoring)
eventSyncs.SystemCompleteEventError = ({ event, error }) => ({
    when: actions(
        [Event.completeEvent, { event }, { error }], // When the system action itself results in an error
    ),
    then: actions(), // No direct user-facing response needed, but this sync catches the error for potential logging
});


// --- Cross-Concept Cascading Syncs ---

// When an Event is successfully deleted, remove it from all UserItemInterests
eventSyncs.CascadeEventDeletionToUserInterest = ({ event: deletedEventId }) => ({
    when: actions(
        [Event.deleteEvent, {}, { event: deletedEventId }] // When an event is successfully deleted (output 'event' is the ID)
    ),
    where: async (frames) => {
        // The `deletedEventId` is available in the current frame.
        const eventId = frames[0].deletedEventId;
        // Find all UserItemInterest documents where the item matches the deleted event
        const docsToModify = await Interest.userItemInterests.find({ item: eventId }).toArray();
        // Map these documents to new frames, one for each interest to be removed.
        // We need 'user' and 'item' from the UserItemInterestDoc to call removeItemInterest.
        return new Frames(...docsToModify.map(doc => ({
            userToUpdate: doc.user, // User who expressed interest
            itemToRemove: doc.item  // The item (event) they were interested in
        })));
    },
    then: actions(
        // Call removeItemInterest for each affected user-item pair.
        // Note: The variable names 'userToUpdate' and 'itemToRemove' are used directly here
        // as they are bound in the `where` clause frames.
        [Interest.removeItemInterest, { user: 'userToUpdate', item: 'itemToRemove' }]
    ),
});

// When an Event is successfully deleted, delete all Reviews targeting it
eventSyncs.CascadeEventDeletionToReviews = ({ event: deletedEventId }) => ({
    when: actions(
        [Event.deleteEvent, {}, { event: deletedEventId }] // When an event is successfully deleted
    ),
    where: async (frames) => {
        const eventId = frames[0].deletedEventId;
        // Find all Review documents where the target item matches the deleted event
        const docsToModify = await Review.reviews.find({ target: eventId }).toArray();
        // Map these documents to new frames, one for each review to be removed.
        // We need 'reviewer' and 'target' from the ReviewDoc to call removeReview.
        return new Frames(...docsToModify.map(doc => ({
            reviewerId: doc.reviewer, // Reviewer ID
            itemReviewed: doc.target    // Target item (event) ID
        })));
    },
    then: actions(
        // Call removeReview for each affected review.
        [Review.removeReview, { user: 'reviewerId', item: 'itemReviewed' }]
    ),
});


// Export all defined event-related syncs as a collection
export const syncs = eventSyncs;
```

***

### Updated `passthrough.ts` Configuration

Given the detailed implementation of syncs for all `Event` actions and queries (with selective authentication as requested), all these routes should be explicitly excluded from passthrough.

```typescript
// file: passthrough.ts

// These routes will bypass the synchronization engine and directly call
// the corresponding concept action/query. For this application design,
// almost all API calls are handled by explicit synchronizations for control
// and authorization, so this list will be very small, often empty.
export const inclusions = {
  // Add any routes here that should be DIRECTLY accessible WITHOUT any
  // synchronization logic, custom authorization, or request/response mapping.
  // For example, if you explicitly wanted ALL events to be visible without authentication
  // directly through a passthrough route:
  // "/Event/_getAllEvents": "Provides a public, unauthenticated list of all events."
  // However, the current setup processes even public queries through syncs for consistency.
};

// These routes will be explicitly excluded from direct passthrough.
// Instead, a `Requesting.request` action will be fired, which needs to be
// handled by explicit synchronization rules in `src/syncs/`.
// This list should include ALL public-facing API endpoints for which you
// have defined `Request...` synchronizations.
export const exclusions = [
  // UserAuthentication
  "/UserAuthentication/register",
  "/UserAuthentication/authenticate",
  "/UserAuthentication/_getUsername",
  "/UserAuthentication/_getUserByUsername",

  // LikertSurvey (All user-facing LikertSurvey API routes should be excluded from passthrough)
  "/LikertSurvey/createSurvey",
  "/LikertSurvey/addQuestion",
  "/LikertSurvey/submitResponse",
  "/LikertSurvey/updateResponse",
  "/LikertSurvey/_getSurveyQuestions",
  "/LikertSurvey/_getSurveyResponses",
  "/LikertSurvey/_getRespondentAnswers",

  // Event - ALL actions and queries are explicitly handled by syncs
  "/Event/createEvent",
  "/Event/modifyEvent",
  "/Event/cancelEvent",
  "/Event/unCancelEvent",
  "/Event/deleteEvent",
  "/Event/_getEventsByOrganizer",
  "/Event/_getEventById",
  "/Event/_getEventsByRecommendationContext",
  "/Event/_getEventsByStatus",
  "/Event/_getAllEvents",
  // Note: The 'system' action `completeEvent` is not listed here
  // because it's triggered internally, not by an external HTTP request.

  // Friending (All user-facing Friending API routes should be excluded from passthrough)
  "/Friending/sendFriendRequest",
  "/Friending/acceptFriendRequest",
  "/Friending/removeFriendRequest",
  "/Friending/removeFriend",
  "/Friending/_getFriends",
  "/Friending/_getIncomingRequests",
  "/Friending/_getOutgoingRequests",

  // UserInterest (All user-facing UserInterest API routes should be excluded from passthrough)
  "/UserInterest/addPersonalInterest",
  "/UserInterest/removePersonalInterest",
  "/UserInterest/addItemInterest",
  "/UserInterest/removeItemInterest",
  "/UserInterest/_getPersonalInterests",
  "/UserInterest/_getItemInterests",
  "/UserInterest/_getUsersInterestedInItems",

  // Reviewing (All user-facing Reviewing API routes should be excluded from passthrough)
  "/Reviewing/addReview",
  "/Reviewing/removeReview",
  "/Reviewing/modifyReview",
  "/Reviewing/_getReview",
  "/Reviewing/_getReviewsByItem",
  "/Reviewing/_getReviewsByUser",
];
```
# response:

Here's the updated `Event` concept specification and the full `event.sync.ts` implementation adhering to the specified constraints (no helpers, modeled after `sample.sync.ts`), including the new cascading deletion logic. Finally, the explicit list of included/excluded API calls for `passthrough.ts` is provided.

---

## Updated Concept: Event \[User]

The `_getEventsByRecommendationContext` query and a few other standard queries (`_getEventsByStatus`, `_getAllEvents`) need to be explicitly added to the `Event` concept specification for completeness, as they are used in the frontend and syncs.

*   **concept**: Event \[User]
*   **purpose**: enable users to organize, track, and facilitate the discovery of time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen
*   **principle**: A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system. Additionally, the system can surface relevant events by applying contextual filters and prioritizations to its stored event data, aiding in personalized discovery.
*   **state**:
    *   a set of Events with
        *   an organizer User
        *   a name String
        *   a date DateTime
        *   a duration Number // Duration in minutes
        *   a location String
        *   a description String
        *   a status of "upcoming" or "cancelled" or "completed"
*   **actions**:
    *   createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)
        *   **requires**: date >= current\_time; name != ""; location != ""; description != ""; duration > 0
        *   **effects**: creates an event with the given details associated with the organizer, sets the status to "upcoming"; returns the new event
    *   modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)
        *   **requires**: organizer = event.organizer; newName != ""; newLocation != ""; newDescription != ""; newDate >= current\_time; newDuration > 0; at least one field must differ from the original event details
        *   **effects**: event.name := newName, event.date := newDate, event.duration := newDuration, event.location := newLocation, event.description := newDescription; returns event
    *   cancelEvent (organizer: User, event: Event)
        *   **requires**: organizer = event.organizer and event.status = "upcoming"
        *   **effects**: event.status := "cancelled"
    *   unCancelEvent (organizer: User, event: Event): (event: Event)
        *   **requires**: organizer = event.organizer and event.status = "cancelled" and event.date + event.duration >= current\_time
        *   **effects**: event.status := "upcoming"; returns event
    *   deleteEvent (organizer: User, event: Event)
        *   **requires**: organizer = event.organizer
        *   **effects**: removes event from the set of all existing events
    *   **system** completeEvent (event: Event)
        *   **requires**: event.status = "upcoming" and (event.date + event.duration <= current\_time)
        *   **effects**: event.status := "completed"
*   **queries**:
    *   `_getEventsByOrganizer (organizer: User): (event: EventDoc)`
        *   **effects**: Returns all events organized by the given user.
    *   `_getEventById (event: Event): (event: EventDoc)`
        *   **effects**: Returns the event with the given ID.
    *   `_getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: EventDoc)`
        *   **effects**: Returns a filtered and prioritized set of events based on context (e.g., matching tags from `filters`, sorted by `priorities`).
    *   `_getEventsByStatus (status: "upcoming" or "cancelled" or "completed"): (event: EventDoc)`
        *   **effects**: Returns a list of all events with the given status.
    *   `_getAllEvents (): (event: EventDoc)`
        *   **effects**: Returns a list of all events.

---

### `src/syncs/event.sync.ts` - Event Synchronizations Implementation

```typescript
// file: src/syncs/event.sync.ts
import { actions, Frames, Sync } from "@engine";
import { Requesting } from "@concepts/Requesting/RequestingConcept.ts";
import EventConcept from "@concepts/Event/EventConcept.ts";
import SessioningConcept from "@concepts/Sessioning/SessioningConcept.ts"; // Assuming SessioningConcept.ts is the correct filename
import UserInterestConcept from "@concepts/UserInterest/UserInterestConcept.ts";
import ReviewingConcept from "@concepts/Reviewing/ReviewingConcept.ts";

// Aliases for cleaner sync syntax
const Session = SessioningConcept;
const Event = EventConcept;
const Interest = UserInterestConcept;
const Review = ReviewingConcept;

// A single object to hold all event-related syncs for export
export const eventSyncs: { [key: string]: Sync } = {};

// --- Action Syncs (Require Authentication and Authorization) ---

// REQUEST: Create an Event
eventSyncs.RequestCreateEvent = ({ request, name, date, duration, location, description, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/createEvent", name, date, duration, location, description, session },
        { request },
    ]),
    where: async (frames) => {
        // Authenticate the user from the session
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        // If authentication fails, frames will be empty and the 'then' clause will not fire.
        return frames;
    },
    then: actions([
        Event.createEvent,
        { organizer: 'currentUser', name, date, duration, location, description } // 'currentUser' is bound in 'where'
    ]),
});

// RESPONSE: Successful Event Creation
eventSyncs.CreateEventResponse = ({ request, event }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/createEvent" }, { request }],
        [Event.createEvent, {}, { event }], // Match the success output from the concept action
    ),
    then: actions([Requesting.respond, { request, event }]),
});

// RESPONSE: Error during Event Creation
eventSyncs.CreateEventErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/createEvent" }, { request }],
        [Event.createEvent, {}, { error }], // Match the error output from the concept action
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// REQUEST: Modify an Event
eventSyncs.RequestModifyEvent = ({ request, event: eventId, newName, newDate, newDuration, newLocation, newDescription, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/modifyEvent", event: eventId, newName, newDate, newDuration, newLocation, newDescription, session },
        { request },
    ]),
    where: async (frames) => {
        // Authenticate the user from the session
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        if (frames.length === 0) return new Frames(); // Invalid session

        // Authorize: Only the event organizer can modify
        // Fetch event details. _getEventById returns an array of EventDoc.
        frames = await frames.query(Event._getEventById, { event: eventId }, { event: 'eventDetail' });
        // Check if event was found and retrieve the first (and only) EventDoc.
        if (frames.length === 0 || !frames[0].eventDetail || frames[0].eventDetail.length === 0) return new Frames();

        const eventOrganizer = frames[0].eventDetail[0].organizer; // Access the organizer ID
        // Filter frames to only include those where the currentUser matches the event's organizer
        return frames.filter(f => f.currentUser === eventOrganizer);
    },
    then: actions([
        Event.modifyEvent,
        { organizer: 'currentUser', event: eventId, newName, newDate, newDuration, newLocation, newDescription }
    ]),
});

// RESPONSE: Successful Event Modification
eventSyncs.ModifyEventResponse = ({ request, event }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/modifyEvent" }, { request }],
        [Event.modifyEvent, {}, { event }],
    ),
    then: actions([Requesting.respond, { request, event }]),
});

// RESPONSE: Error during Event Modification
eventSyncs.ModifyEventErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/modifyEvent" }, { request }],
        [Event.modifyEvent, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// REQUEST: Cancel an Event
eventSyncs.RequestCancelEvent = ({ request, event: eventId, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/cancelEvent", event: eventId, session },
        { request },
    ]),
    where: async (frames) => {
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        if (frames.length === 0) return new Frames();

        frames = await frames.query(Event._getEventById, { event: eventId }, { event: 'eventDetail' });
        if (frames.length === 0 || !frames[0].eventDetail || frames[0].eventDetail.length === 0) return new Frames();

        const eventOrganizer = frames[0].eventDetail[0].organizer;
        return frames.filter(f => f.currentUser === eventOrganizer);
    },
    then: actions([
        Event.cancelEvent,
        { organizer: 'currentUser', event: eventId }
    ]),
});

// RESPONSE: Successful Event Cancellation (Empty response from concept)
eventSyncs.CancelEventResponse = ({ request }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/cancelEvent" }, { request }],
        [Event.cancelEvent, {}, {}], // Concept returns Empty {} on success
    ),
    then: actions([Requesting.respond, { request, success: true }]), // Explicit success message
});

// RESPONSE: Error during Event Cancellation
eventSyncs.CancelEventErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/cancelEvent" }, { request }],
        [Event.cancelEvent, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// REQUEST: Uncancel an Event
eventSyncs.RequestUnCancelEvent = ({ request, event: eventId, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/unCancelEvent", event: eventId, session },
        { request },
    ]),
    where: async (frames) => {
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        if (frames.length === 0) return new Frames();

        frames = await frames.query(Event._getEventById, { event: eventId }, { event: 'eventDetail' });
        if (frames.length === 0 || !frames[0].eventDetail || frames[0].eventDetail.length === 0) return new Frames();

        const eventOrganizer = frames[0].eventDetail[0].organizer;
        return frames.filter(f => f.currentUser === eventOrganizer);
    },
    then: actions([
        Event.unCancelEvent,
        { organizer: 'currentUser', event: eventId }
    ]),
});

// RESPONSE: Successful Event Uncancellation
eventSyncs.UnCancelEventResponse = ({ request, event }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/unCancelEvent" }, { request }],
        [Event.unCancelEvent, {}, { event }],
    ),
    then: actions([Requesting.respond, { request, event }]),
});

// RESPONSE: Error during Event Uncancellation
eventSyncs.UnCancelEventErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/unCancelEvent" }, { request }],
        [Event.unCancelEvent, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// REQUEST: Delete an Event
eventSyncs.RequestDeleteEvent = ({ request, event: eventId, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/deleteEvent", event: eventId, session },
        { request },
    ]),
    where: async (frames) => {
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        if (frames.length === 0) return new Frames();

        frames = await frames.query(Event._getEventById, { event: eventId }, { event: 'eventDetail' });
        if (frames.length === 0 || !frames[0].eventDetail || frames[0].eventDetail.length === 0) return new Frames();

        const eventOrganizer = frames[0].eventDetail[0].organizer;
        return frames.filter(f => f.currentUser === eventOrganizer);
    },
    then: actions([
        Event.deleteEvent,
        { organizer: 'currentUser', event: eventId }
    ]),
});

// RESPONSE: Successful Event Deletion (Empty response from concept)
eventSyncs.DeleteEventResponse = ({ request }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/deleteEvent" }, { request }],
        [Event.deleteEvent, {}, {}], // Concept returns Empty {} on success
    ),
    then: actions([Requesting.respond, { request, success: true }]),
});

// RESPONSE: Error during Event Deletion
eventSyncs.DeleteEventErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/deleteEvent" }, { request }],
        [Event.deleteEvent, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// --- System Action Syncs ---

// RESPONSE: Error during system completeEvent (for internal logging/monitoring)
// This sync is not triggered by an HTTP request but captures errors from the internal system action.
eventSyncs.SystemCompleteEventError = ({ event, error }) => ({
    when: actions(
        [Event.completeEvent, { event }, { error }], // When the system action itself results in an error
    ),
    then: actions(), // No direct user-facing response needed, but this sync catches the error for potential logging
});


// --- Query Syncs (Authentication required for all queries as per previous discussion) ---

// REQUEST: Get Events by Organizer
eventSyncs.RequestGetEventsByOrganizer = ({ request, organizer, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/_getEventsByOrganizer", organizer, session },
        { request },
    ]),
    where: async (frames) => {
        // Authenticate the user from the session; any authenticated user can query events by organizer
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        return frames;
    },
    then: actions([
        Event._getEventsByOrganizer,
        { organizer },
        { event: 'eventDocs' } // The query returns an array of EventDoc, bound to 'eventDocs'
    ]),
});

// RESPONSE: Successful Get Events by Organizer
eventSyncs.GetEventsByOrganizerResponse = ({ request, eventDocs }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventsByOrganizer" }, { request }],
        [Event._getEventsByOrganizer, {}, { event: eventDocs }], // Match the array output as 'event' (per concept spec return signature)
    ),
    then: actions([Requesting.respond, { request, data: eventDocs }]), // Respond with the array under 'data'
});

// RESPONSE: Error during Get Events by Organizer
eventSyncs.GetEventsByOrganizerErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventsByOrganizer" }, { request }],
        [Event._getEventsByOrganizer, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// REQUEST: Get Event by ID
eventSyncs.RequestGetEventById = ({ request, event: eventId, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/_getEventById", event: eventId, session },
        { request },
    ]),
    where: async (frames) => {
        // Authenticate the user from the session; any authenticated user can query event by ID
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        return frames;
    },
    then: actions([
        Event._getEventById,
        { event: eventId },
        { event: 'eventDocs' }
    ]),
});

// RESPONSE: Successful Get Event by ID
eventSyncs.GetEventByIdResponse = ({ request, eventDocs }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventById" }, { request }],
        [Event._getEventById, {}, { event: eventDocs }],
    ),
    then: actions([Requesting.respond, { request, data: eventDocs }]),
});

// RESPONSE: Error during Get Event by ID
eventSyncs.GetEventByIdErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventById" }, { request }],
        [Event._getEventById, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// REQUEST: Get Events by Recommendation Context
eventSyncs.RequestGetEventsByRecommendationContext = ({ request, filters, priorities, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/_getEventsByRecommendationContext", filters, priorities, session },
        { request },
    ]),
    where: async (frames) => {
        // Authenticate the user from the session, as this is a personalized query
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        return frames;
    },
    then: actions([
        Event._getEventsByRecommendationContext,
        { user: 'currentUser', filters, priorities }, // 'currentUser' is bound in 'where'
        { event: 'eventDocs' }
    ]),
});

// RESPONSE: Successful Get Events by Recommendation Context
eventSyncs.GetEventsByRecommendationContextResponse = ({ request, eventDocs }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventsByRecommendationContext" }, { request }],
        [Event._getEventsByRecommendationContext, {}, { event: eventDocs }],
    ),
    then: actions([Requesting.respond, { request, data: eventDocs }]),
});

// RESPONSE: Error during Get Events by Recommendation Context
eventSyncs.GetEventsByRecommendationContextErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventsByRecommendationContext" }, { request }],
        [Event. _getEventsByRecommendationContext, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});

// REQUEST: Get Events by Status
eventSyncs.RequestGetEventsByStatus = ({ request, status, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/_getEventsByStatus", status, session },
        { request },
    ]),
    where: async (frames) => {
        // Authenticate the user from the session; any authenticated user can query
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        return frames;
    },
    then: actions([
        Event._getEventsByStatus,
        { status },
        { event: 'eventDocs' }
    ]),
});

// RESPONSE: Successful Get Events by Status
eventSyncs.GetEventsByStatusResponse = ({ request, eventDocs }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventsByStatus" }, { request }],
        [Event._getEventsByStatus, {}, { event: eventDocs }],
    ),
    then: actions([Requesting.respond, { request, data: eventDocs }]),
});

// RESPONSE: Error during Get Events by Status
eventSyncs.GetEventsByStatusErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getEventsByStatus" }, { request }],
        [Event._getEventsByStatus, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});

// REQUEST: Get All Events
eventSyncs.RequestGetAllEvents = ({ request, session }) => ({
    when: actions([
        Requesting.request,
        { path: "/Event/_getAllEvents", session },
        { request },
    ]),
    where: async (frames) => {
        // Authenticate the user from the session; any authenticated user can query
        frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
        return frames;
    },
    then: actions([
        Event._getAllEvents,
        {}, // No input parameters for this query
        { event: 'eventDocs' }
    ]),
});

// RESPONSE: Successful Get All Events
eventSyncs.GetAllEventsResponse = ({ request, eventDocs }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getAllEvents" }, { request }],
        [Event._getAllEvents, {}, { event: eventDocs }],
    ),
    then: actions([Requesting.respond, { request, data: eventDocs }]),
});

// RESPONSE: Error during Get All Events
eventSyncs.GetAllEventsErrorResponse = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: "/Event/_getAllEvents" }, { request }],
        [Event._getAllEvents, {}, { error }],
    ),
    then: actions([Requesting.respond, { request, error }]),
});


// --- Cross-Concept Cascading Syncs (Triggered by successful Event.deleteEvent) ---

// CASCADE: When an Event is successfully deleted, remove it from all UserItemInterests
eventSyncs.CascadeEventDeletionToUserInterest = ({ event: deletedEventId }) => ({
    when: actions(
        [Event.deleteEvent, {}, { event: deletedEventId }] // Matches the successful output of deleteEvent
    ),
    where: async (frames) => {
        const eventId = frames[0].deletedEventId; // Get the ID of the event that was just deleted
        // Find all UserItemInterest documents where the 'item' field matches the deleted event ID
        const interestedDocs = await Interest.userItemInterests.find({ item: eventId }).toArray();
        // Create a new set of frames, one for each interested user-item pair found.
        // Each frame will contain the 'user' and 'item' needed by Interest.removeItemInterest.
        return new Frames(...interestedDocs.map(doc => ({
            userToUpdateInterest: doc.user,   // The user whose interest needs to be removed
            itemToRemoveInterest: doc.item,   // The item (event) to remove interest from
        })));
    },
    then: actions(
        // For each frame generated in the 'where' clause, call UserInterest.removeItemInterest
        // using the bound variables from that frame.
        [Interest.removeItemInterest, { user: 'userToUpdateInterest', item: 'itemToRemoveInterest' }]
    ),
});

// CASCADE: When an Event is successfully deleted, delete all Reviews targeting it
eventSyncs.CascadeEventDeletionToReviews = ({ event: deletedEventId }) => ({
    when: actions(
        [Event.deleteEvent, {}, { event: deletedEventId }] // Matches the successful output of deleteEvent
    ),
    where: async (frames) => {
        const eventId = frames[0].deletedEventId; // Get the ID of the event that was just deleted
        // Find all Review documents where the 'target' field matches the deleted event ID
        const reviewDocs = await Review.reviews.find({ target: eventId }).toArray();
        // Create a new set of frames, one for each review document found.
        // Each frame will contain the 'reviewer' and 'target' needed by Review.removeReview.
        return new Frames(...reviewDocs.map(doc => ({
            reviewerOfDeletedEvent: doc.reviewer, // The user who made the review
            deletedEventTarget: doc.target,      // The item (event) that was reviewed
        })));
    },
    then: actions(
        // For each frame generated in the 'where' clause, call Reviewing.removeReview
        // using the bound variables from that frame.
        [Review.removeReview, { user: 'reviewerOfDeletedEvent', item: 'deletedEventTarget' }]
    ),
});

// Export all defined event-related syncs as a collection
export const syncs = eventSyncs;
```

---

### Explicit List of API Calls (Included/Excluded for `passthrough.ts`)

Given the detailed implementation of syncs for all `Event` actions and queries (with explicit authentication/authorization handled in the `where` clauses), **all these routes should be explicitly excluded from passthrough**. This ensures that the custom logic and security checks defined in your synchronizations are always applied.

```typescript
// file: passthrough.ts

// These routes will bypass the synchronization engine and directly call
// the corresponding concept action/query. For this application design,
// almost all API calls are handled by explicit synchronizations for control
// and authorization, so this list (`inclusions`) will typically be empty
// or contain only truly public, non-sensitive, read-only endpoints (if any).
export const inclusions = {
  // Example: If you had an absolutely public, unauthenticated health check, it might go here.
  // "/health": "Public health check endpoint."
};

// These routes will be explicitly excluded from direct passthrough.
// Instead, an incoming HTTP request for any of these paths will trigger
// a `Requesting.request` action, which is then processed by explicit
// synchronization rules defined in your `src/syncs/` directory.
// This list should include ALL public-facing API endpoints for which you
// have defined `Request...` synchronizations.
export const exclusions = [
  // UserAuthentication
  "/UserAuthentication/register",
  "/UserAuthentication/authenticate",
  "/UserAuthentication/_getUsername",
  "/UserAuthentication/_getUserByUsername",

  // LikertSurvey
  "/LikertSurvey/createSurvey",
  "/LikertSurvey/addQuestion",
  "/LikertSurvey/submitResponse",
  "/LikertSurvey/updateResponse",
  "/LikertSurvey/_getSurveyQuestions",
  "/LikertSurvey/_getSurveyResponses",
  "/LikertSurvey/_getRespondentAnswers",

  // Event - ALL actions and queries are explicitly handled by syncs
  "/Event/createEvent",
  "/Event/modifyEvent",
  "/Event/cancelEvent",
  "/Event/unCancelEvent",
  "/Event/deleteEvent",
  "/Event/_getEventsByOrganizer",
  "/Event/_getEventById",
  "/Event/_getEventsByRecommendationContext",
  "/Event/_getEventsByStatus",
  "/Event/_getAllEvents",
  // Note: The 'system' action `completeEvent` is not triggered by external
  // HTTP requests, so it is not listed in passthrough configuration.

  // Friending
  "/Friending/sendFriendRequest",
  "/Friending/acceptFriendRequest",
  "/Friending/removeFriendRequest",
  "/Friending/removeFriend",
  "/Friending/_getFriends",
  "/Friending/_getIncomingRequests",
  "/Friending/_getOutgoingRequests",

  // UserInterest
  "/UserInterest/addPersonalInterest",
  "/UserInterest/removePersonalInterest",
  "/UserInterest/addItemInterest",
  "/UserInterest/removeItemInterest",
  "/UserInterest/_getPersonalInterests",
  "/UserInterest/_getItemInterests",
  "/UserInterest/_getUsersInterestedInItems",

  // Reviewing
  "/Reviewing/addReview",
  "/Reviewing/removeReview",
  "/Reviewing/modifyReview",
  "/Reviewing/_getReview",
  "/Reviewing/_getReviewsByItem",
  "/Reviewing/_getReviewsByUser",
];
```
