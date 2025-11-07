---
timestamp: 'Fri Nov 07 2025 01:27:54 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_012754.ce363c5e.md]]'
content_id: 268f0d3acabd9c4eb3127e164a7a09f89484aca471ff852dacac0f3e4d40df6d
---

# response:

Okay, here are the synchronizations specifically for the `Event` concept, structured similarly to your `sample.sync.ts` file. These include the request forwarding, success response, and error response syncs for each action and query, along with the cascading deletion syncs.

For this file, I'll re-include the helper functions to make it self-contained, but in a real application, you might put these helpers in a shared `sync-helpers.ts` file.

**Important Considerations:**

* **Authentication (`Sessioning`):** All request syncs assume a `session` argument in the incoming `Requesting.request` and use `Sessioning._getUser` to resolve it to `currentUser` for authorization.
* **Authorization Logic:**
  * For `createEvent`, `currentUser` becomes the `organizer`.
  * For `modifyEvent`, `cancelEvent`, `unCancelEvent`, `deleteEvent`, `currentUser` must be the event's `organizer`.
  * For queries like `_getEventsByOrganizer`, `_getEventById`, `_getEventsByRecommendationContext`, `_getEventsByStatus`, `_getAllEvents`, any authenticated user (`currentUser`) is allowed to make the query. Adjust if you need more restrictive access control (e.g., only organizers can view their own past events).

***

**1. `src/syncs/event.sync.ts`**

```typescript
// file: src/syncs/event.sync.ts
import { actions, Frames, Sync } from "@engine";
import { Requesting } from "@concepts/Requesting/RequestingConcept.ts";
import EventConcept from "@concepts/Event/EventConcept.ts";
import SessioningConcept from "@concepts/Sessioning/SessioningConcept.ts";
import UserInterestConcept from "@concepts/UserInterest/UserInterestConcept.ts"; // Needed for cascading deletion
import ReviewingConcept from "@concepts/Reviewing/ReviewingConcept.ts";     // Needed for cascading deletion

// Aliases for cleaner sync syntax
const Session = SessioningConcept;
const Event = EventConcept;
const Interest = UserInterestConcept;
const Review = ReviewingConcept;

// Define the global syncs object for events
export const eventSyncs: { [key: string]: Sync } = {};

// --- Helper Functions for standard request/response patterns (copied for self-containment) ---

// Helper to create a request sync for an action/query
function createRequestSync(
    conceptActionOrQuery: Function, // e.g., Event.createEvent, Event._getEventById
    requestPath: string,
    requestInputPattern: any, // Pattern for Requesting.request, e.g., { name: 'name', ... }
    conceptCallInputMap: (frames: Frames, requestArgs: any) => any, // Function to map frame/request args to concept call args
    conceptCallOutputBinding: string, // Variable name to bind concept output to (e.g., 'event' or 'eventDoc')
    authWhereClause: (frames: Frames) => Promise<Frames>, // Authentication/authorization logic
) {
    return ({ request, session, ...reqArgs }: any): Sync => ({
        when: actions(
            [Requesting.request, { path: requestPath, session, ...requestInputPattern }, { request }]
        ),
        where: async (frames) => {
            // Attempt to bind `currentUser` from session if available
            if (session) {
                frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
                if (frames.length === 0) return new Frames(); // Invalid session implies no authentication
            }
            // Add requestArgs to frames so conceptCallInputMap can access them
            frames = new Frames(...frames.map(f => ({ ...f, ...reqArgs })));
            return authWhereClause(frames);
        },
        then: actions(
            // Map request args and `currentUser` to concept action/query arguments
            [conceptActionOrQuery, conceptCallInputMap(frames, reqArgs), { [conceptCallOutputBinding]: 'conceptOutput' }], // Bind concept output to 'conceptOutput'
        ),
    });
}

// Helper for action success responses (returns { key: value })
function createActionSuccessResponseSync(
    conceptAction: Function,
    requestPath: string,
    conceptOutputProperty: string, // The property *inside* the concept's success output, e.g., "event" from `{event: Event}`
    conceptOutputBinding: string = 'conceptOutput', // The variable name used in createRequestSync for the *full* output
) {
    return ({ request, [conceptOutputBinding]: conceptResult }: any): Sync => ({
        when: actions(
            [Requesting.request, { path: requestPath }, { request }],
            [conceptAction, {}, { [conceptOutputProperty]: conceptResult }], // Match the concept's success output directly
        ),
        then: actions(
            [Requesting.respond, { request, [conceptOutputProperty]: conceptResult }], // Respond with the specific object
        ),
    });
}

// Helper for action success responses (returns Empty {})
function createEmptySuccessResponseSync(
    conceptAction: Function,
    requestPath: string,
    conceptOutputBinding: string = 'conceptOutput', // Used for matching in `when` clause, but its value is ignored as it's empty
) {
    return ({ request }: any): Sync => ({
        when: actions(
            [Requesting.request, { path: requestPath }, { request }],
            [conceptAction, {}, {}], // Match empty object for success
        ),
        then: actions(
            [Requesting.respond, { request, success: true }], // Explicitly indicate success
        ),
    });
}

// Helper for query success responses (returns Array<{ key: value }>)
function createQuerySuccessResponseSync(
    conceptQuery: Function,
    requestPath: string,
    conceptOutputProperty: string, // The property name that holds the values in the query's direct return, e.g., "event" in `_getEventsByOrganizer` returns `[{event: EventDoc}]`
    conceptOutputBinding: string = 'conceptOutput', // The variable name used in createRequestSync for the *full* output
) {
    return ({ request, [conceptOutputBinding]: conceptResult }: any): Sync => ({
        when: actions(
            [Requesting.request, { path: requestPath }, { request }],
            [conceptQuery, {}, { [conceptOutputProperty]: conceptResult }], // Match the array under the specific property name
        ),
        then: actions(
            [Requesting.respond, { request, data: conceptResult }], // Respond with the array directly under 'data'
        ),
    });
}

// Helper for error responses (for both actions and queries)
function createErrorResponseSync(
    conceptActionOrQuery: Function,
    requestPath: string,
    conceptOutputBinding: string = 'conceptOutput',
) {
    return ({ request, [conceptOutputBinding]: { error } }: any): Sync => ({
        when: actions(
            [Requesting.request, { path: requestPath }, { request }],
            [conceptActionOrQuery, {}, { error }], // Match the error output
        ),
        then: actions(
            [Requesting.respond, { request, error }], // Respond with the error
        ),
    });
}

// --- Event Concept Syncs ---

// Action: createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)
eventSyncs.RequestCreateEvent = createRequestSync(
    Event.createEvent,
    "/Event/createEvent",
    { name: 'name', date: 'date', duration: 'duration', location: 'location', description: 'description' },
    (frames, { name, date, duration, location, description }) => ({ organizer: frames[0].currentUser, name, date, duration, location, description }),
    'event', // Concept returns { event: Event }
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
eventSyncs.CreateEventResponse = createActionSuccessResponseSync(Event.createEvent, "/Event/createEvent", "event");
eventSyncs.CreateEventErrorResponse = createErrorResponseSync(Event.createEvent, "/Event/createEvent");

// Action: modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)
eventSyncs.RequestModifyEvent = createRequestSync(
    Event.modifyEvent,
    "/Event/modifyEvent",
    { event: 'event', newName: 'newName', newDate: 'newDate', newDuration: 'newDuration', newLocation: 'newLocation', newDescription: 'newDescription' },
    (frames, { event, newName, newDate, newDuration, newLocation, newDescription }) => ({ organizer: frames[0].currentUser, event, newName, newDate, newDuration, newLocation, newDescription }),
    'event', // Concept returns { event: Event }
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        const eventId = frames[0].event;
        const eventDoc = (await Event._getEventById({ event: eventId }))[0]; // Fetch event to check organizer
        // Only organizer can modify
        return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer);
    }
);
eventSyncs.ModifyEventResponse = createActionSuccessResponseSync(Event.modifyEvent, "/Event/modifyEvent", "event");
eventSyncs.ModifyEventErrorResponse = createErrorResponseSync(Event.modifyEvent, "/Event/modifyEvent");

// Action: cancelEvent (organizer: User, event: Event)
eventSyncs.RequestCancelEvent = createRequestSync(
    Event.cancelEvent,
    "/Event/cancelEvent",
    { event: 'event' },
    (frames, { event }) => ({ organizer: frames[0].currentUser, event }),
    'empty', // Concept returns {} for success
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        const eventId = frames[0].event;
        const eventDoc = (await Event._getEventById({ event: eventId }))[0]; // Fetch event to check organizer
        // Only organizer can cancel
        return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer);
    }
);
eventSyncs.CancelEventResponse = createEmptySuccessResponseSync(Event.cancelEvent, "/Event/cancelEvent");
eventSyncs.CancelEventErrorResponse = createErrorResponseSync(Event.cancelEvent, "/Event/cancelEvent");

// Action: unCancelEvent (organizer: User, event: Event): (event: Event)
eventSyncs.RequestUnCancelEvent = createRequestSync(
    Event.unCancelEvent,
    "/Event/unCancelEvent",
    { event: 'event' },
    (frames, { event }) => ({ organizer: frames[0].currentUser, event }),
    'event', // Concept returns { event: Event }
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        const eventId = frames[0].event;
        const eventDoc = (await Event._getEventById({ event: eventId }))[0]; // Fetch event to check organizer
        // Only organizer can uncancel
        return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer);
    }
);
eventSyncs.UnCancelEventResponse = createActionSuccessResponseSync(Event.unCancelEvent, "/Event/unCancelEvent", "event");
eventSyncs.UnCancelEventErrorResponse = createErrorResponseSync(Event.unCancelEvent, "/Event/unCancelEvent");

// Action: deleteEvent (organizer: User, event: Event)
eventSyncs.RequestDeleteEvent = createRequestSync(
    Event.deleteEvent,
    "/Event/deleteEvent",
    { event: 'event' },
    (frames, { event }) => ({ organizer: frames[0].currentUser, event }),
    'empty', // Concept returns {} for success
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        const eventId = frames[0].event;
        const eventDoc = (await Event._getEventById({ event: eventId }))[0]; // Fetch event to check organizer
        // Only organizer can delete
        return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer);
    }
);
eventSyncs.DeleteEventResponse = createEmptySuccessResponseSync(Event.deleteEvent, "/Event/deleteEvent");
eventSyncs.DeleteEventErrorResponse = createErrorResponseSync(Event.deleteEvent, "/Event/deleteEvent");

// Query: _getEventsByOrganizer (organizer: User): (event: EventDoc)[]
eventSyncs.RequestGetEventsByOrganizer = createRequestSync(
    Event._getEventsByOrganizer,
    "/Event/_getEventsByOrganizer",
    { organizer: 'organizer' },
    (frames, { organizer }) => ({ organizer }),
    'event', // Output property is 'event' as an array of EventDocs
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
eventSyncs.GetEventsByOrganizerResponse = createQuerySuccessResponseSync(Event._getEventsByOrganizer, "/Event/_getEventsByOrganizer", "event");
eventSyncs.GetEventsByOrganizerErrorResponse = createErrorResponseSync(Event._getEventsByOrganizer, "/Event/_getEventsByOrganizer");

// Query: _getEventById (event: Event): (event: EventDoc)[]
eventSyncs.RequestGetEventById = createRequestSync(
    Event._getEventById,
    "/Event/_getEventById",
    { event: 'event' },
    (frames, { event }) => ({ event }),
    'event', // Output property is 'event' as an array of EventDocs
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
eventSyncs.GetEventByIdResponse = createQuerySuccessResponseSync(Event._getEventById, "/Event/_getEventById", "event");
eventSyncs.GetEventByIdErrorResponse = createErrorResponseSync(Event._getEventById, "/Event/_getEventById");

// Query: _getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: EventDoc)[]
eventSyncs.RequestGetEventsByRecommendationContext = createRequestSync(
    Event._getEventsByRecommendationContext,
    "/Event/_getEventsByRecommendationContext",
    { filters: 'filters', priorities: 'priorities' },
    (frames, { filters, priorities }) => ({ user: frames[0].currentUser, filters, priorities }),
    'event', // Output property is 'event' as an array of EventDocs
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
eventSyncs.GetEventsByRecommendationContextResponse = createQuerySuccessResponseSync(Event._getEventsByRecommendationContext, "/Event/_getEventsByRecommendationContext", "event");
eventSyncs.GetEventsByRecommendationContextErrorResponse = createErrorResponseSync(Event._getEventsByRecommendationContext, "/Event/_getEventsByRecommendationContext");

// Query: _getEventsByStatus (status: "upcoming" | "cancelled" | "completed"): (event: EventDoc)[]
eventSyncs.RequestGetEventsByStatus = createRequestSync(
    Event._getEventsByStatus,
    "/Event/_getEventsByStatus",
    { status: 'status' },
    (frames, { status }) => ({ status }),
    'event', // Output property is 'event' as an array of EventDocs
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
eventSyncs.GetEventsByStatusResponse = createQuerySuccessResponseSync(Event._getEventsByStatus, "/Event/_getEventsByStatus", "event");
eventSyncs.GetEventsByStatusErrorResponse = createErrorResponseSync(Event._getEventsByStatus, "/Event/_getEventsByStatus");

// Query: _getAllEvents (): (event: EventDoc)[]
eventSyncs.RequestGetAllEvents = createRequestSync(
    Event._getAllEvents,
    "/Event/_getAllEvents",
    {}, // No input parameters for this query
    (frames, {}) => ({}), // No input parameters for the concept call
    'event', // Output property is 'event' as an array of EventDocs
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
eventSyncs.GetAllEventsResponse = createQuerySuccessResponseSync(Event._getAllEvents, "/Event/_getAllEvents", "event");
eventSyncs.GetAllEventsErrorResponse = createErrorResponseSync(Event._getAllEvents, "/Event/_getAllEvents");

// System Action: completeEvent (event: Event) - No direct HTTP request, triggered internally
eventSyncs.SystemCompleteEvent = ({ event }: any) => ({
    when: actions(
        [Event.completeEvent, {}, {}], // System action fires and returns empty
    ),
    then: actions(), // No direct user-facing response needed for a system action completion
});
eventSyncs.SystemCompleteEventError = createErrorResponseSync(Event.completeEvent, "/Event/completeEvent"); // Still useful for logging/monitoring if system action fails


// --- Cascading Syncs Related to Event Deletion ---

// When an Event is deleted, remove it from all UserItemInterests
eventSyncs.CascadeEventDeletionToUserInterest = ({ event }: any) => ({
    when: actions(
        [Event.deleteEvent, {}, { event }] // When an event is deleted (successful action)
    ),
    where: async (frames) => {
        const eventId = frames[0].event;
        // Find all UserItemInterest documents where the item matches the deleted event
        const docsToModify = await Interest.userItemInterests.find({ item: eventId }).toArray();
        // Map these documents to frames that carry enough information for the 'then' clause
        return new Frames(...docsToModify.map(doc => ({
            userToDeleteInterest: doc.user, // User who expressed interest
            itemToDeleteInterest: doc.item  // The item (event) they were interested in
        })));
    },
    then: actions(
        // Remove the specific user-item interest.
        [Interest.removeItemInterest, { user: 'userToDeleteInterest', item: 'itemToDeleteInterest' }]
    ),
});

// When an Event is deleted, all Reviews targeting it should be deleted.
eventSyncs.CascadeEventDeletionToReviews = ({ event }: any) => ({
    when: actions(
        [Event.deleteEvent, {}, { event }] // When an event is deleted (successful action)
    ),
    where: async (frames) => {
        const eventId = frames[0].event;
        // Find all Review documents where the target item matches the deleted event
        const docsToModify = await Review.reviews.find({ target: eventId }).toArray();
        // Map these documents to frames for the 'then' clause
        return new Frames(...docsToModify.map(doc => ({
            userReviewer: doc.reviewer, // Reviewer ID
            itemReviewed: doc.target    // Target item (event) ID
        })));
    },
    then: actions(
        // Remove the specific review.
        [Review.removeReview, { user: 'userReviewer', item: 'itemReviewed' }]
    ),
});

// Export all event-related syncs for the engine to discover
export const syncs = eventSyncs;
```

***

**2. List of API Calls (Included and Excluded for `passthrough.ts`)**

Given the strategy to handle almost all user-facing interactions via explicit synchronizations for authorization and centralized logic, the `exclusions` list will be comprehensive, and `inclusions` will typically remain empty unless there are truly public, unauthenticated, read-only endpoints.

**`passthrough.ts` Configuration:**

```typescript
// file: passthrough.ts

// These routes will bypass the synchronization engine and directly call
// the corresponding concept action/query. Use with extreme caution for public/unauthorized access.
// For this application design, almost all API calls require session-based authorization,
// so this list will typically be empty.
export const inclusions = {
  // If there were truly public read-only endpoints without any user context, they would go here.
  // For example, if you wanted a list of ALL events without needing to be logged in:
  // "/Event/_getAllEvents": "This provides a public list of all events for browsing."
  // However, given the current design, we are assuming authentication for all event queries too.
};

// These routes will be explicitly excluded from direct passthrough.
// Instead, a `Requesting.request` action will be fired, which needs to be
// handled by explicit synchronization rules in `src/syncs/`.
// This is the recommended approach for virtually all user-facing actions and queries
// that require authorization or custom logic/orchestration.
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

  // Event - All actions and queries are explicitly handled by syncs for auth/control
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
  // Note: The 'system' action `completeEvent` is not a passthrough route,
  // as it's triggered internally, not by an external HTTP request.

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

***

This setup fully externalizes the HTTP API routing logic into explicit `Requesting` synchronizations, allowing for fine-grained control, authorization, and easy extension of cross-concept behaviors like cascading deletions.
