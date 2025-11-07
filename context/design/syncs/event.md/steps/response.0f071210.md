---
timestamp: 'Fri Nov 07 2025 14:29:16 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_142916.0d2691da.md]]'
content_id: 0f0712108faede209cbf9ca49832cf7a128e4a9dcfb4c18826f3e095ade96d95
---

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
