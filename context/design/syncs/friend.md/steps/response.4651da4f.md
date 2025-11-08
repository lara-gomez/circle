---
timestamp: 'Fri Nov 07 2025 15:29:29 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_152929.49b76208.md]]'
content_id: 4651da4fa361de92bd394656edb17117dd37b49671e08a319e26043b8f79ac69
---

# response:

Here's the updated `Event` concept specification, the full `app.sync.ts` implementation with comprehensive synchronizations (including the new cascading deletions), and the explicit list of included/excluded API calls for `passthrough.ts`.

First, let's update the `Event` concept.

## Updated Concept: Event \[User]

The `_getEventsByRecommendationContext` query needs to be explicitly added to the `Event` concept specification.

* **concept**: Event \[User]
* **purpose**: enable users to organize, track, and facilitate the discovery of time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen
* **principle**: A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system. Additionally, the system can surface relevant events by applying contextual filters and prioritizations to its stored event data, aiding in personalized discovery.
* **state**:
  * a set of Events with
    * an organizer User
    * a name String
    * a date DateTime
    * a duration Number // Duration in minutes
    * a location String
    * a description String
    * a status of "upcoming" or "cancelled" or "completed"
* **actions**:
  * createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)
    * **requires**: date >= current\_time; name != ""; location != ""; description != ""; duration > 0
    * **effects**: creates an event with the given details associated with the organizer, sets the status to "upcoming"; returns the new event
  * modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)
    * **requires**: organizer = event.organizer; newName != ""; newLocation != ""; newDescription != ""; newDate >= current\_time; newDuration > 0; at least one field must differ from the original event details
    * **effects**: event.name := newName, event.date := newDate, event.duration := newDuration, event.location := newLocation, event.description := newDescription; returns event
  * cancelEvent (organizer: User, event: Event)
    * **requires**: organizer = event.organizer and event.status = "upcoming"
    * **effects**: event.status := "cancelled"
  * unCancelEvent (organizer: User, event: Event): (event: Event)
    * **requires**: organizer = event.organizer and event.status = "cancelled" and event.date + event.duration >= current\_time
    * **effects**: event.status := "upcoming"; returns event
  * deleteEvent (organizer: User, event: Event)
    * **requires**: organizer = event.organizer
    * **effects**: removes event from the set of all existing events
  * **system** completeEvent (event: Event)
    * **requires**: event.status = "upcoming" and (event.date + event.duration <= current\_time)
    * **effects**: event.status := "completed"
* **queries**:
  * \_getEventsByOrganizer (organizer: User): (event: EventDoc)
    * **effects**: Returns all events organized by the given user.
  * \_getEventById (event: Event): (event: EventDoc)
    * **effects**: Returns the event with the given ID.
  * \_getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: EventDoc)
    * **effects**: Returns a filtered and prioritized set of events based on context (e.g., matching tags from `filters`, sorted by `priorities`).
  * \_getEventsByStatus (status: "upcoming" or "cancelled" or "completed"): (event: EventDoc)
    * **effects**: Returns a list of all events with the given status.
  * \_getAllEvents (): (event: EventDoc)
    * **effects**: Returns a list of all events.

***

### **`src/concepts/Sessioning/SessioningConcept.ts` (Minimal Implementation)**

This concept is assumed for authentication in syncs.

```typescript
// src/concepts/Sessioning/SessioningConcept.ts
import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "Sessioning" + ".";

type User = ID; // Generic parameter for the user ID
type Session = ID; // Session ID

/**
 * @concept Sessioning [User]
 * @purpose To provide a mechanism for creating, managing, and validating user sessions
 *          after successful authentication, allowing for persistent login states.
 * @principle After a user successfully authenticates, a unique session is created
 *             and associated with their user ID. This session can then be used
 *             to authorize subsequent actions without re-authenticating, until
 *             the session is explicitly destroyed or expires.
 */
interface SessionDoc {
  _id: Session;
  user: User; // The user ID associated with this session
  // In a real system, you'd add:
  // createdAt: Date;
  // expiresAt: Date;
  // lastActivity: Date;
}

export default class SessioningConcept {
  sessions: Collection<SessionDoc>;

  constructor(private readonly db: Db) {
    this.sessions = this.db.collection(PREFIX + "sessions");
    // Add index on user for quick lookup of user's sessions (if needed for logout all, etc.)
    // Add index on _id for quick session validation
    this.sessions.createIndexes([{ key: { _id: 1 } }, { key: { user: 1 } }]);
  }

  /**
   * createSession (user: User): (session: Session)
   *
   * @requires A user ID must be provided.
   * @effects Creates a new session associated with the given user and returns its ID.
   */
  async createSession({ user }: { user: User }): Promise<{ session: Session }> {
    const sessionId = freshID() as Session;
    const newSession: SessionDoc = {
      _id: sessionId,
      user: user,
    };
    await this.sessions.insertOne(newSession);
    return { session: sessionId };
  }

  /**
   * _getUser (session: Session): (user: User)[] | (error: String)
   *
   * @requires A valid session ID must be provided.
   * @effects Returns the user ID associated with the given session, or an error if not found.
   */
  async _getUser({ session }: { session: Session }): Promise<{ user: User }[] | { error: string }> {
    const sessionDoc = await this.sessions.findOne({ _id: session });
    if (!sessionDoc) {
      return { error: `Session with ID '${session}' not found or expired.` };
    }
    // In a real system, also check session expiry here.
    return [{ user: sessionDoc.user }];
  }

  /**
   * _getSessionById (session: Session): (session: SessionDoc)[]
   *
   * @requires A valid session ID must be provided.
   * @effects Returns the session document, or an empty array if not found.
   */
  async _getSessionById({ session }: { session: Session }): Promise<SessionDoc[]> {
    const sessionDoc = await this.sessions.findOne({ _id: session });
    if (!sessionDoc) {
      return [];
    }
    return [sessionDoc];
  }
}
```

***

### **`src/syncs/app.sync.ts` - All Synchronizations**

```typescript
// file: src/syncs/app.sync.ts
import { actions, Frames, Sync } from "@engine";
import { Requesting } from "@concepts/Requesting/RequestingConcept.ts";
import UserAuthenticationConcept from "@concepts/UserAuthentication/UserAuthenticationConcept.ts";
import SessioningConcept from "@concepts/Sessioning/SessioningConcept.ts";
import LikertSurveyConcept from "@concepts/LikertSurvey/LikertSurveyConcept.ts";
import EventConcept from "@concepts/Event/EventConcept.ts";
import FriendingConcept from "@concepts/Friending/FriendingConcept.ts";
import UserInterestConcept from "@concepts/UserInterest/UserInterestConcept.ts";
import ReviewingConcept from "@concepts/Reviewing/ReviewingConcept.ts";

// Aliases for cleaner sync syntax
const Auth = UserAuthenticationConcept;
const Session = SessioningConcept;
const Likert = LikertSurveyConcept;
const Event = EventConcept;
const Friend = FriendingConcept;
const Interest = UserInterestConcept;
const Review = ReviewingConcept;

// --- Helper Functions for standard request/response patterns ---

// Helper to create a request sync for an action/query
function createRequestSync(
    conceptActionOrQuery: Function, // e.g., Auth.register, Event._getEventsByOrganizer
    requestPath: string,
    requestInputPattern: any, // Pattern for Requesting.request
    conceptCallInputMap: (frames: Frames, requestArgs: any) => any, // Function to map frame/request args to concept call args
    conceptCallOutputBinding: string, // Variable name to bind concept output to (e.g., 'actionResult' or 'queryResult')
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
            // Use the original requestArgs, not the destructured { ...reqArgs } from the sync function signature
            // This ensures all arguments from the original Requesting.request are available.
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
    conceptOutputProperty: string, // The property *inside* the concept's success output, e.g., "user" from `{user: User}`
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
    conceptOutputArrayPropertyName: string, // The property name that holds the array in the query's direct return, e.g., "username" in `_getUsername` returns `[{username: string}]`
    conceptOutputBinding: string = 'conceptOutput', // The variable name used in createRequestSync for the *full* output
) {
    return ({ request, [conceptOutputBinding]: conceptResult }: any): Sync => ({
        when: actions(
            [Requesting.request, { path: requestPath }, { request }],
            [conceptQuery, {}, { [conceptOutputArrayPropertyName]: conceptResult }], // Match the array under the specific property name
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

// Define the global syncs object
export const allSyncs: { [key: string]: Sync } = {};

// --- UserAuthentication Syncs ---
// register (username: String, password: String): (user: User)
allSyncs.RequestRegister = createRequestSync(
    Auth.register,
    "/UserAuthentication/register",
    { username: 'username', password: 'password' },
    (frames, { username, password }) => ({ username, password }),
    'user',
    async (frames) => frames // No auth needed for registration
);
allSyncs.RegisterResponse = createActionSuccessResponseSync(Auth.register, "/UserAuthentication/register", "user");
allSyncs.RegisterErrorResponse = createErrorResponseSync(Auth.register, "/UserAuthentication/register");

// authenticate (username: String, password: String): (user: User)
allSyncs.RequestAuthenticate = createRequestSync(
    Auth.authenticate,
    "/UserAuthentication/authenticate",
    { username: 'username', password: 'password' },
    (frames, { username, password }) => ({ username, password }),
    'user',
    async (frames) => frames // No pre-auth for authentication
);
allSyncs.AuthenticateResponse = createActionSuccessResponseSync(Auth.authenticate, "/UserAuthentication/authenticate", "user");
allSyncs.AuthenticateErrorResponse = createErrorResponseSync(Auth.authenticate, "/UserAuthentication/authenticate");

// _getUsername (user: User) : (username: String)[]
allSyncs.RequestGetUsername = createRequestSync(
    Auth._getUsername,
    "/UserAuthentication/_getUsername",
    { user: 'user' },
    (frames, { user }) => ({ user }),
    'username', // Output property is 'username', returning array of {username: string}
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.GetUsernameResponse = createQuerySuccessResponseSync(Auth._getUsername, "/UserAuthentication/_getUsername", "username");
allSyncs.GetUsernameErrorResponse = createErrorResponseSync(Auth._getUsername, "/UserAuthentication/_getUsername");

// _getUserByUsername (username: String) : (user: User)[]
allSyncs.RequestGetUserByUsername = createRequestSync(
    Auth._getUserByUsername,
    "/UserAuthentication/_getUserByUsername",
    { username: 'username' },
    (frames, { username }) => ({ username }),
    'user', // Output property is 'user', returning array of {user: User}
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.GetUserByUsernameResponse = createQuerySuccessResponseSync(Auth._getUserByUsername, "/UserAuthentication/_getUserByUsername", "user");
allSyncs.GetUserByUsernameErrorResponse = createErrorResponseSync(Auth._getUserByUsername, "/UserAuthentication/_getUserByUsername");

// --- Sessioning Syncs (triggered by Auth concept) ---
allSyncs.CreateSessionAfterAuthenticate = ({ user, session }: any) => ({
    when: actions(
        [Auth.authenticate, {}, { user }],
    ),
    then: actions(
        [Session.createSession, { user }, { session }],
    ),
});

allSyncs.CreateSessionAfterRegister = ({ user, session }: any) => ({
    when: actions(
        [Auth.register, {}, { user }],
    ),
    then: actions(
        [Session.createSession, { user }, { session }],
    ),
});

// --- LikertSurvey Syncs ---
// createSurvey (author: Author, title: String, scaleMin: Number, scaleMax: Number): (survey: Survey)
allSyncs.RequestCreateSurvey = createRequestSync(
    Likert.createSurvey,
    "/LikertSurvey/createSurvey",
    { title: 'title', scaleMin: 'scaleMin', scaleMax: 'scaleMax' },
    (frames, { title, scaleMin, scaleMax }) => ({ author: frames[0].currentUser, title, scaleMin, scaleMax }),
    'survey',
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.CreateSurveyResponse = createActionSuccessResponseSync(Likert.createSurvey, "/LikertSurvey/createSurvey", "survey");
allSyncs.CreateSurveyErrorResponse = createErrorResponseSync(Likert.createSurvey, "/LikertSurvey/createSurvey");

// addQuestion (survey: Survey, text: String): (question: Question)
allSyncs.RequestAddQuestion = createRequestSync(
    Likert.addQuestion,
    "/LikertSurvey/addQuestion",
    { survey: 'survey', text: 'text' },
    (frames, { survey, text }) => ({ survey, text }),
    'question',
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        const surveyId = frames[0].survey;
        const surveyDoc = await Likert.surveys.findOne({ _id: surveyId });
        // Only survey author can add questions
        return frames.filter(f => surveyDoc && f.currentUser === surveyDoc.author);
    }
);
allSyncs.AddQuestionResponse = createActionSuccessResponseSync(Likert.addQuestion, "/LikertSurvey/addQuestion", "question");
allSyncs.AddQuestionErrorResponse = createErrorResponseSync(Likert.addQuestion, "/LikertSurvey/addQuestion");

// submitResponse (respondent: Respondent, question: Question, value: Number)
allSyncs.RequestSubmitResponse = createRequestSync(
    Likert.submitResponse,
    "/LikertSurvey/submitResponse",
    { question: 'question', value: 'value' },
    (frames, { question, value }) => ({ respondent: frames[0].currentUser, question, value }),
    'empty', // Concept returns {} for success
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.SubmitResponseResponse = createEmptySuccessResponseSync(Likert.submitResponse, "/LikertSurvey/submitResponse");
allSyncs.SubmitResponseErrorResponse = createErrorResponseSync(Likert.submitResponse, "/LikertSurvey/submitResponse");

// updateResponse (respondent: Respondent, question: Question, value: Number)
allSyncs.RequestUpdateResponse = createRequestSync(
    Likert.updateResponse,
    "/LikertSurvey/updateResponse",
    { question: 'question', value: 'value' },
    (frames, { question, value }) => ({ respondent: frames[0].currentUser, question, value }),
    'empty', // Concept returns {} for success
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.UpdateResponseResponse = createEmptySuccessResponseSync(Likert.updateResponse, "/LikertSurvey/updateResponse");
allSyncs.UpdateResponseErrorResponse = createErrorResponseSync(Likert.updateResponse, "/LikertSurvey/updateResponse");

// _getSurveyQuestions (survey: Survey): (question: QuestionDoc)[]
allSyncs.RequestGetSurveyQuestions = createRequestSync(
    Likert._getSurveyQuestions,
    "/LikertSurvey/_getSurveyQuestions",
    { survey: 'survey' },
    (frames, { survey }) => ({ survey }),
    'questionDoc', // Output property is 'questionDoc'
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.GetSurveyQuestionsResponse = createQuerySuccessResponseSync(Likert._getSurveyQuestions, "/LikertSurvey/_getSurveyQuestions", "questionDoc");
allSyncs.GetSurveyQuestionsErrorResponse = createErrorResponseSync(Likert._getSurveyQuestions, "/LikertSurvey/_getSurveyQuestions");

// _getSurveyResponses (survey: Survey): (response: ResponseDoc)[]
allSyncs.RequestGetSurveyResponses = createRequestSync(
    Likert._getSurveyResponses,
    "/LikertSurvey/_getSurveyResponses",
    { survey: 'survey' },
    (frames, { survey }) => ({ survey }),
    'responseDoc', // Output property is 'responseDoc'
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        const surveyId = frames[0].survey;
        const surveyDoc = await Likert.surveys.findOne({ _id: surveyId });
        // Only survey author can view responses
        return frames.filter(f => surveyDoc && f.currentUser === surveyDoc.author);
    }
);
allSyncs.GetSurveyResponsesResponse = createQuerySuccessResponseSync(Likert._getSurveyResponses, "/LikertSurvey/_getSurveyResponses", "responseDoc");
allSyncs.GetSurveyResponsesErrorResponse = createErrorResponseSync(Likert._getSurveyResponses, "/LikertSurvey/_getSurveyResponses");

// _getRespondentAnswers (respondent: Respondent): (response: ResponseDoc)[]
allSyncs.RequestGetRespondentAnswers = createRequestSync(
    Likert._getRespondentAnswers,
    "/LikertSurvey/_getRespondentAnswers",
    { respondent: 'respondent' },
    (frames, { respondent }) => ({ respondent }),
    'responseDoc', // Output property is 'responseDoc'
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Only user can view their own responses
        return frames.filter(f => f.currentUser === f.respondent);
    }
);
allSyncs.GetRespondentAnswersResponse = createQuerySuccessResponseSync(Likert._getRespondentAnswers, "/LikertSurvey/_getRespondentAnswers", "responseDoc");
allSyncs.GetRespondentAnswersErrorResponse = createErrorResponseSync(Likert._getRespondentAnswers, "/LikertSurvey/_getRespondentAnswers");

// --- Event Concept Syncs ---
// createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)
allSyncs.RequestCreateEvent = createRequestSync(
    Event.createEvent,
    "/Event/createEvent",
    { name: 'name', date: 'date', duration: 'duration', location: 'location', description: 'description' },
    (frames, { name, date, duration, location, description }) => ({ organizer: frames[0].currentUser, name, date, duration, location, description }),
    'event',
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.CreateEventResponse = createActionSuccessResponseSync(Event.createEvent, "/Event/createEvent", "event");
allSyncs.CreateEventErrorResponse = createErrorResponseSync(Event.createEvent, "/Event/createEvent");

// modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)
allSyncs.RequestModifyEvent = createRequestSync(
    Event.modifyEvent,
    "/Event/modifyEvent",
    { event: 'event', newName: 'newName', newDate: 'newDate', newDuration: 'newDuration', newLocation: 'newLocation', newDescription: 'newDescription' },
    (frames, { event, newName, newDate, newDuration, newLocation, newDescription }) => ({ organizer: frames[0].currentUser, event, newName, newDate, newDuration, newLocation, newDescription }),
    'event',
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        const eventId = frames[0].event;
        const eventDoc = await Event.events.findOne({ _id: eventId });
        // Only organizer can modify
        return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer);
    }
);
allSyncs.ModifyEventResponse = createActionSuccessResponseSync(Event.modifyEvent, "/Event/modifyEvent", "event");
allSyncs.ModifyEventErrorResponse = createErrorResponseSync(Event.modifyEvent, "/Event/modifyEvent");

// cancelEvent (organizer: User, event: Event)
allSyncs.RequestCancelEvent = createRequestSync(
    Event.cancelEvent,
    "/Event/cancelEvent",
    { event: 'event' },
    (frames, { event }) => ({ organizer: frames[0].currentUser, event }),
    'empty', // Concept returns {} for success
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        const eventId = frames[0].event;
        const eventDoc = await Event.events.findOne({ _id: eventId });
        // Only organizer can cancel
        return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer);
    }
);
allSyncs.CancelEventResponse = createEmptySuccessResponseSync(Event.cancelEvent, "/Event/cancelEvent");
allSyncs.CancelEventErrorResponse = createErrorResponseSync(Event.cancelEvent, "/Event/cancelEvent");

// unCancelEvent (organizer: User, event: Event): (event: Event)
allSyncs.RequestUnCancelEvent = createRequestSync(
    Event.unCancelEvent,
    "/Event/unCancelEvent",
    { event: 'event' },
    (frames, { event }) => ({ organizer: frames[0].currentUser, event }),
    'event',
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        const eventId = frames[0].event;
        const eventDoc = await Event.events.findOne({ _id: eventId });
        // Only organizer can uncancel
        return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer);
    }
);
allSyncs.UnCancelEventResponse = createActionSuccessResponseSync(Event.unCancelEvent, "/Event/unCancelEvent", "event");
allSyncs.UnCancelEventErrorResponse = createErrorResponseSync(Event.unCancelEvent, "/Event/unCancelEvent");

// deleteEvent (organizer: User, event: Event)
allSyncs.RequestDeleteEvent = createRequestSync(
    Event.deleteEvent,
    "/Event/deleteEvent",
    { event: 'event' },
    (frames, { event }) => ({ organizer: frames[0].currentUser, event }),
    'empty', // Concept returns {} for success
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        const eventId = frames[0].event;
        const eventDoc = await Event.events.findOne({ _id: eventId });
        // Only organizer can delete
        return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer);
    }
);
allSyncs.DeleteEventResponse = createEmptySuccessResponseSync(Event.deleteEvent, "/Event/deleteEvent");
allSyncs.DeleteEventErrorResponse = createErrorResponseSync(Event.deleteEvent, "/Event/deleteEvent");

// _getEventsByOrganizer (organizer: User): (event: EventDoc)[]
allSyncs.RequestGetEventsByOrganizer = createRequestSync(
    Event._getEventsByOrganizer,
    "/Event/_getEventsByOrganizer",
    { organizer: 'organizer' },
    (frames, { organizer }) => ({ organizer }),
    'eventDoc', // Output property is 'eventDoc'
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.GetEventsByOrganizerResponse = createQuerySuccessResponseSync(Event._getEventsByOrganizer, "/Event/_getEventsByOrganizer", "eventDoc");
allSyncs.GetEventsByOrganizerErrorResponse = createErrorResponseSync(Event._getEventsByOrganizer, "/Event/_getEventsByOrganizer");

// _getEventById (event: Event): (event: EventDoc)[]
allSyncs.RequestGetEventById = createRequestSync(
    Event._getEventById,
    "/Event/_getEventById",
    { event: 'event' },
    (frames, { event }) => ({ event }),
    'eventDoc', // Output property is 'eventDoc'
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.GetEventByIdResponse = createQuerySuccessResponseSync(Event._getEventById, "/Event/_getEventById", "eventDoc");
allSyncs.GetEventByIdErrorResponse = createErrorResponseSync(Event._getEventById, "/Event/_getEventById");

// _getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: EventDoc)[]
allSyncs.RequestGetEventsByRecommendationContext = createRequestSync(
    Event._getEventsByRecommendationContext,
    "/Event/_getEventsByRecommendationContext",
    { filters: 'filters', priorities: 'priorities' },
    (frames, { filters, priorities }) => ({ user: frames[0].currentUser, filters, priorities }),
    'eventDoc', // Output property is 'eventDoc'
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.GetEventsByRecommendationContextResponse = createQuerySuccessResponseSync(Event._getEventsByRecommendationContext, "/Event/_getEventsByRecommendationContext", "eventDoc");
allSyncs.GetEventsByRecommendationContextErrorResponse = createErrorResponseSync(Event._getEventsByRecommendationContext, "/Event/_getEventsByRecommendationContext");

// _getEventsByStatus (status: "upcoming" | "cancelled" | "completed"): (event: EventDoc)[]
allSyncs.RequestGetEventsByStatus = createRequestSync(
    Event._getEventsByStatus,
    "/Event/_getEventsByStatus",
    { status: 'status' },
    (frames, { status }) => ({ status }),
    'eventDoc',
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.GetEventsByStatusResponse = createQuerySuccessResponseSync(Event._getEventsByStatus, "/Event/_getEventsByStatus", "eventDoc");
allSyncs.GetEventsByStatusErrorResponse = createErrorResponseSync(Event._getEventsByStatus, "/Event/_getEventsByStatus");

// _getAllEvents (): (event: EventDoc)[]
allSyncs.RequestGetAllEvents = createRequestSync(
    Event._getAllEvents,
    "/Event/_getAllEvents",
    {},
    (frames, {}) => ({}),
    'eventDoc',
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.GetAllEventsResponse = createQuerySuccessResponseSync(Event._getAllEvents, "/Event/_getAllEvents", "eventDoc");
allSyncs.GetAllEventsErrorResponse = createErrorResponseSync(Event._getAllEvents, "/Event/_getAllEvents");

// --- Friending Concept Syncs ---
// sendFriendRequest (user: User, target: User) - Note: `targetUsername` in request, `target` ID in concept
allSyncs.RequestSendFriendRequest = createRequestSync(
    Friend.sendFriendRequest,
    "/Friending/sendFriendRequest",
    { targetUsername: 'targetUsername' },
    (frames, { targetUser }) => ({ user: frames[0].currentUser, target: targetUser }), // Map targetUser from where clause
    'empty', // Concept returns {} for success
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Resolve targetUsername to targetUser ID
        frames = await frames.query(Auth._getUserByUsername, { username: frames[0].targetUsername }, { user: 'targetUser' });
        if (frames.length === 0) return new Frames(); // Target user not found
        // Ensure user is not trying to friend themselves
        return frames.filter(f => f.currentUser !== f.targetUser);
    }
);
allSyncs.SendFriendRequestResponse = createEmptySuccessResponseSync(Friend.sendFriendRequest, "/Friending/sendFriendRequest");
allSyncs.SendFriendRequestErrorResponse = createErrorResponseSync(Friend.sendFriendRequest, "/Friending/sendFriendRequest");

// acceptFriendRequest (requester: User, target: User) - Note: `target` is current user
allSyncs.RequestAcceptFriendRequest = createRequestSync(
    Friend.acceptFriendRequest,
    "/Friending/acceptFriendRequest",
    { requester: 'requester' },
    (frames, { requester }) => ({ requester, target: frames[0].currentUser }),
    'empty', // Concept returns {} for success
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.AcceptFriendRequestResponse = createEmptySuccessResponseSync(Friend.acceptFriendRequest, "/Friending/acceptFriendRequest");
allSyncs.AcceptFriendRequestErrorResponse = createErrorResponseSync(Friend.acceptFriendRequest, "/Friending/acceptFriendRequest");

// removeFriendRequest (requester: User, target: User) - `user` in session is `u`
allSyncs.RequestRemoveFriendRequest = createRequestSync(
    Friend.removeFriendRequest,
    "/Friending/removeFriendRequest",
    { requester: 'requester', target: 'target' },
    (frames, { requester, target }) => ({ requester, target }),
    'empty', // Concept returns {} for success
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Authorize: Only requester OR target can remove the request
        return frames.filter(f => f.currentUser === f.requester || f.currentUser === f.target);
    }
);
allSyncs.RemoveFriendRequestResponse = createEmptySuccessResponseSync(Friend.removeFriendRequest, "/Friending/removeFriendRequest");
allSyncs.RemoveFriendRequestErrorResponse = createErrorResponseSync(Friend.removeFriendRequest, "/Friending/removeFriendRequest");

// removeFriend (user: User, friend: User) - `user` in session is `u`
allSyncs.RequestRemoveFriend = createRequestSync(
    Friend.removeFriend,
    "/Friending/removeFriend",
    { friend: 'friend' },
    (frames, { friend }) => ({ user: frames[0].currentUser, friend }),
    'empty', // Concept returns {} for success
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.RemoveFriendResponse = createEmptySuccessResponseSync(Friend.removeFriend, "/Friending/removeFriend");
allSyncs.RemoveFriendErrorResponse = createErrorResponseSync(Friend.removeFriend, "/Friending/removeFriend");

// _getFriends (user: User): (friend: User)[]
allSyncs.RequestGetFriends = createRequestSync(
    Friend._getFriends,
    "/Friending/_getFriends",
    { user: 'user' },
    (frames, { user }) => ({ user }),
    'friend', // Output property is 'friend'
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Only user can query their own friends
        return frames.filter(f => f.currentUser === f.user);
    }
);
allSyncs.GetFriendsResponse = createQuerySuccessResponseSync(Friend._getFriends, "/Friending/_getFriends", "friend");
allSyncs.GetFriendsErrorResponse = createErrorResponseSync(Friend._getFriends, "/Friending/_getFriends");

// _getIncomingRequests (user: User): (requester: User)[]
allSyncs.RequestGetIncomingRequests = createRequestSync(
    Friend._getIncomingRequests,
    "/Friending/_getIncomingRequests",
    { user: 'user' },
    (frames, { user }) => ({ user }),
    'requester', // Output property is 'requester'
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Only user can see their own incoming requests
        return frames.filter(f => f.currentUser === f.user);
    }
);
allSyncs.GetIncomingRequestsResponse = createQuerySuccessResponseSync(Friend._getIncomingRequests, "/Friending/_getIncomingRequests", "requester");
allSyncs.GetIncomingRequestsErrorResponse = createErrorResponseSync(Friend._getIncomingRequests, "/Friending/_getIncomingRequests");

// _getOutgoingRequests (user: User): (target: User)[]
allSyncs.RequestGetOutgoingRequests = createRequestSync(
    Friend._getOutgoingRequests,
    "/Friending/_getOutgoingRequests",
    { user: 'user' },
    (frames, { user }) => ({ user }),
    'target', // Output property is 'target'
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Only user can see their own outgoing requests
        return frames.filter(f => f.currentUser === f.user);
    }
);
allSyncs.GetOutgoingRequestsResponse = createQuerySuccessResponseSync(Friend._getOutgoingRequests, "/Friending/_getOutgoingRequests", "target");
allSyncs.GetOutgoingRequestsErrorResponse = createErrorResponseSync(Friend._getOutgoingRequests, "/Friending/_getOutgoingRequests");

// --- UserInterest Concept Syncs ---
// addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)
allSyncs.RequestAddPersonalInterest = createRequestSync(
    Interest.addPersonalInterest,
    "/UserInterest/addPersonalInterest",
    { tag: 'tag' },
    (frames, { tag }) => ({ user: frames[0].currentUser, tag }),
    'personalInterest',
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.AddPersonalInterestResponse = createActionSuccessResponseSync(Interest.addPersonalInterest, "/UserInterest/addPersonalInterest", "personalInterest");
allSyncs.AddPersonalInterestErrorResponse = createErrorResponseSync(Interest.addPersonalInterest, "/UserInterest/addPersonalInterest");

// removePersonalInterest (user: User, tag: String)
allSyncs.RequestRemovePersonalInterest = createRequestSync(
    Interest.removePersonalInterest,
    "/UserInterest/removePersonalInterest",
    { tag: 'tag' },
    (frames, { tag }) => ({ user: frames[0].currentUser, tag }),
    'empty', // Concept returns {} for success
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.RemovePersonalInterestResponse = createEmptySuccessResponseSync(Interest.removePersonalInterest, "/UserInterest/removePersonalInterest");
allSyncs.RemovePersonalInterestErrorResponse = createErrorResponseSync(Interest.removePersonalInterest, "/UserInterest/removePersonalInterest");

// addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)
allSyncs.RequestAddItemInterest = createRequestSync(
    Interest.addItemInterest,
    "/UserInterest/addItemInterest",
    { item: 'item' },
    (frames, { item }) => ({ user: frames[0].currentUser, item }),
    'itemInterest',
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.AddItemInterestResponse = createActionSuccessResponseSync(Interest.addItemInterest, "/UserInterest/addItemInterest", "itemInterest");
allSyncs.AddItemInterestErrorResponse = createErrorResponseSync(Interest.addItemInterest, "/UserInterest/addItemInterest");

// removeItemInterest (user: User, item: Item)
allSyncs.RequestRemoveItemInterest = createRequestSync(
    Interest.removeItemInterest,
    "/UserInterest/removeItemInterest",
    { item: 'item' },
    (frames, { item }) => ({ user: frames[0].currentUser, item }),
    'empty', // Concept returns {} for success
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.RemoveItemInterestResponse = createEmptySuccessResponseSync(Interest.removeItemInterest, "/UserInterest/removeItemInterest");
allSyncs.RemoveItemInterestErrorResponse = createErrorResponseSync(Interest.removeItemInterest, "/UserInterest/removeItemInterest");

// _getPersonalInterests (user: User): (personalInterest: UserPersonalInterestDoc)[]
allSyncs.RequestGetPersonalInterests = createRequestSync(
    Interest._getPersonalInterests,
    "/UserInterest/_getPersonalInterests",
    { user: 'user' },
    (frames, { user }) => ({ user }),
    'personalInterestDoc', // Output property is 'personalInterestDoc'
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Only user can see their own personal interests
        return frames.filter(f => f.currentUser === f.user);
    }
);
allSyncs.GetPersonalInterestsResponse = createQuerySuccessResponseSync(Interest._getPersonalInterests, "/UserInterest/_getPersonalInterests", "personalInterestDoc");
allSyncs.GetPersonalInterestsErrorResponse = createErrorResponseSync(Interest._getPersonalInterests, "/UserInterest/_getPersonalInterests");

// _getItemInterests (user: User): (itemInterest: UserItemInterestDoc)[]
allSyncs.RequestGetItemInterests = createRequestSync(
    Interest._getItemInterests,
    "/UserInterest/_getItemInterests",
    { user: 'user' },
    (frames, { user }) => ({ user }),
    'itemInterestDoc', // Output property is 'itemInterestDoc'
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Only user can see their own item interests
        return frames.filter(f => f.currentUser === f.user);
    }
);
allSyncs.GetItemInterestsResponse = createQuerySuccessResponseSync(Interest._getItemInterests, "/UserInterest/_getItemInterests", "itemInterestDoc");
allSyncs.GetItemInterestsErrorResponse = createErrorResponseSync(Interest._getItemInterests, "/UserInterest/_getItemInterests");

// _getUsersInterestedInItems (item: Item): (user: User)[]
allSyncs.RequestGetUsersInterestedInItems = createRequestSync(
    Interest._getUsersInterestedInItems,
    "/UserInterest/_getUsersInterestedInItems",
    { item: 'item' },
    (frames, { item }) => ({ item }),
    'user', // Output property is 'user' (returns Array<{user: User}>)
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.GetUsersInterestedInItemsResponse = createQuerySuccessResponseSync(Interest._getUsersInterestedInItems, "/UserInterest/_getUsersInterestedInItems", "user");
allSyncs.GetUsersInterestedInItemsErrorResponse = createErrorResponseSync(Interest._getUsersInterestedInItems, "/UserInterest/_getUsersInterestedInItems");


// --- Reviewing Concept Syncs ---
// addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
allSyncs.RequestAddReview = createRequestSync(
    Review.addReview,
    "/Reviewing/addReview",
    { item: 'item', rating: 'rating', entry: 'entry' },
    (frames, { item, rating, entry }) => ({ user: frames[0].currentUser, item, rating, entry }),
    'review',
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.AddReviewResponse = createActionSuccessResponseSync(Review.addReview, "/Reviewing/addReview", "review");
allSyncs.AddReviewErrorResponse = createErrorResponseSync(Review.addReview, "/Reviewing/addReview");

// removeReview (user: User, item: Item)
allSyncs.RequestRemoveReview = createRequestSync(
    Review.removeReview,
    "/Reviewing/removeReview",
    { item: 'item' },
    (frames, { item }) => ({ user: frames[0].currentUser, item }),
    'empty', // Concept returns {} for success
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.RemoveReviewResponse = createEmptySuccessResponseSync(Review.removeReview, "/Reviewing/removeReview");
allSyncs.RemoveReviewErrorResponse = createErrorResponseSync(Review.removeReview, "/Reviewing/removeReview");

// modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
allSyncs.RequestModifyReview = createRequestSync(
    Review.modifyReview,
    "/Reviewing/modifyReview",
    { item: 'item', rating: 'rating', entry: 'entry' },
    (frames, { item, rating, entry }) => ({ user: frames[0].currentUser, item, rating, entry }),
    'review',
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.ModifyReviewResponse = createActionSuccessResponseSync(Review.modifyReview, "/Reviewing/modifyReview", "review");
allSyncs.ModifyReviewErrorResponse = createErrorResponseSync(Review.modifyReview, "/Reviewing/modifyReview");

// _getReview (user: User, item: Item) : (review: ReviewOutput)[]
allSyncs.RequestGetReview = createRequestSync(
    Review._getReview,
    "/Reviewing/_getReview",
    { user: 'user', item: 'item' },
    (frames, { user, item }) => ({ user, item }),
    'review', // Output property is 'review' (returns Array<{review: ReviewOutput}>)
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication (public for now, as per rubric analysis)
);
allSyncs.GetReviewResponse = createQuerySuccessResponseSync(Review._getReview, "/Reviewing/_getReview", "review");
allSyncs.GetReviewErrorResponse = createErrorResponseSync(Review._getReview, "/Reviewing/_getReview");

// _getReviewsByItem (item: Item) : (review: ReviewOutput)[]
allSyncs.RequestGetReviewsByItem = createRequestSync(
    Review._getReviewsByItem,
    "/Reviewing/_getReviewsByItem",
    { item: 'item' },
    (frames, { item }) => ({ item }),
    'review', // Output property is 'review' (returns Array<{review: ReviewOutput}>)
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.GetReviewsByItemResponse = createQuerySuccessResponseSync(Review._getReviewsByItem, "/Reviewing/_getReviewsByItem", "review");
allSyncs.GetReviewsByItemErrorResponse = createErrorResponseSync(Review._getReviewsByItem, "/Reviewing/_getReviewsByItem");

// _getReviewsByUser (user: User) : (review: ReviewOutput)[]
allSyncs.RequestGetReviewsByUser = createRequestSync(
    Review._getReviewsByUser,
    "/Reviewing/_getReviewsByUser",
    { user: 'user' },
    (frames, { user }) => ({ user }),
    'review', // Output property is 'review' (returns Array<{review: ReviewOutput}>)
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Only user can see their own reviews
        return frames.filter(f => f.currentUser === f.user);
    }
);
allSyncs.GetReviewsByUserResponse = createQuerySuccessResponseSync(Review._getReviewsByUser, "/Reviewing/_getReviewsByUser", "review");
allSyncs.GetReviewsByUserErrorResponse = createErrorResponseSync(Review._getReviewsByUser, "/Reviewing/_getReviewsByUser");


// --- Cross-Concept Cascading Syncs ---

// When an Event is deleted, remove it from all UserItemInterests
allSyncs.CascadeEventDeletionToUserInterest = ({ event }: any) => ({
    when: actions(
        [Event.deleteEvent, {}, { event }] // When an event is deleted
    ),
    where: async (frames) => {
        const eventId = frames[0].event;
        // Find all UserItemInterest documents where the item matches the deleted event
        const docsToModify = await Interest.userItemInterests.find({ item: eventId }).toArray();
        // Map these documents to frames that carry enough information for the 'then' clause
        return new Frames(...docsToModify.map(doc => ({
            eventToDelete: eventId,
            userInterestId: doc._id,
            user: doc.user, // User who expressed interest
            item: doc.item // The item (event) they were interested in
        })));
    },
    then: actions(
        // Remove the specific user-item interest.
        // UserInterest.removeItemInterest takes (user: User, item: Item)
        [Interest.removeItemInterest, { user: 'user', item: 'item' }]
    ),
});

// When an Event is deleted, all Reviews targeting it should be deleted.
allSyncs.CascadeEventDeletionToReviews = ({ event }: any) => ({
    when: actions(
        [Event.deleteEvent, {}, { event }] // When an event is deleted
    ),
    where: async (frames) => {
        const eventId = frames[0].event;
        // Find all Review documents where the target item matches the deleted event
        const docsToModify = await Review.reviews.find({ target: eventId }).toArray();
        // Map these documents to frames for the 'then' clause
        return new Frames(...docsToModify.map(doc => ({
            eventToDelete: eventId,
            reviewId: doc._id,
            user: doc.reviewer, // Reviewer ID
            item: doc.target // Target item (event) ID
        })));
    },
    then: actions(
        // Remove the specific review.
        // Reviewing.removeReview takes (user: User, item: Item)
        [Review.removeReview, { user: 'user', item: 'item' }]
    ),
});
```

***

### **`passthrough.ts` Configuration (Updated)**

Based on the decision that all user-facing API interactions will go through explicit synchronizations for authorization and control, the `passthrough.ts` file should be configured to **exclude all paths that correspond to the actions and queries for which `Request...` syncs are defined.**

This ensures that custom authorization and request processing logic defined in the syncs is always applied.

```typescript
// file: passthrough.ts

// These routes will bypass the synchronization engine and directly call
// the corresponding concept action/query. Use with caution for public/unauthorized access.
export const inclusions = {
  // Example: if there were truly public read-only endpoints without any user context
  // "/public/data": "A completely open endpoint."
};

// These routes will be explicitly excluded from direct passthrough.
// Instead, a `Requesting.request` action will be fired, which needs to be
// handled by explicit synchronization rules. This is the recommended approach
// for most user-facing actions and queries that require authorization or custom logic.
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

  // Event
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
