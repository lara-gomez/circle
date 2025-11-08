---
timestamp: 'Fri Nov 07 2025 15:30:31 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_153031.3dab49c9.md]]'
content_id: 383b0fd9cedabd07e2c17a8e3c898c93691504bec9df1b40c9c33a2373d57197
---

# response:

Here are the synchronizations specifically related to the `Friending` concept, using the established helper functions for consistency. This includes handling username resolution for `sendFriendRequest` as detailed in your `api-syncs.md`.

First, let's ensure the `Friending` concept has the correct query definitions as implied by your `api-syncs.md` and standard use cases. I'll include the concept spec again with these queries.

## Updated Concept: Friending \[User]

* **concept**: Friending \[User]
* **purpose**: enable users to establish and manage mutual social connections
* **principle**: a user can send a friend request to another user; they may choose to remove this request before the target user takes action; the recipient of a friend request can choose to accept or remove it; once a request is accepted, two users become friends; friendship may be revoked.
* **state**:
  * a set of Users with
    * a set of friends Users
    * a set of incomingRequests Users
    * a set of outgoingRequests Users
* **actions**:
  * sendFriendRequest (user: User, target: User)
    * requires: user and target are not existing friends, user has not already sent a request to target, target has not sent a request to user.
    * effects: target is added to the set of the user's outgoing requests; user is added to the set of target's incoming requests.
  * acceptFriendRequest (requester: User, target: User)
    * requires: requester has sent a friend request to target, requester and target are not friends
    * effects: requester and target are added to each other's set of friends, they are both removed from the other's set of incoming/outgoingRequests
  * removeFriendRequest (requester: User, target: User)
    * requires: requester has sent a friend request to target, requester and target are not friends
    * effects: requester is removed from the target's set of incomingRequests, target is removed the requester's set of outgoingRequests
  * removeFriend (user: User, friend: User): ()
    * requires: user and friend are friends with each other
    * effects: user and friends are both removed from each other's set of friends
* **queries**:
  * \_getFriends (user: User): (friend: User)
    * effects: Returns a set of all friends for the given user.
  * \_getIncomingRequests (user: User): (requester: User)
    * effects: Returns a set of all users who have sent a friend request to the given user.
  * \_getOutgoingRequests (user: User): (target: User)
    * effects: Returns a set of all users to whom the given user has sent a friend request.

***

### **`src/syncs/app.sync.ts` - Friending Concept Synchronizations**

Adding these to your `allSyncs` object.

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

// --- Helper Functions for standard request/response patterns (as provided previously) ---

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


// Define the global syncs object - including previously defined ones for context
export const allSyncs: { [key: string]: Sync } = {};

// --- UserAuthentication Syncs ---
// (Previously defined)
allSyncs.RequestRegister = createRequestSync(Auth.register, "/UserAuthentication/register", { username: 'username', password: 'password' }, (frames, { username, password }) => ({ username, password }), 'user', async (frames) => frames);
allSyncs.RegisterResponse = createActionSuccessResponseSync(Auth.register, "/UserAuthentication/register", "user");
allSyncs.RegisterErrorResponse = createErrorResponseSync(Auth.register, "/UserAuthentication/register");

allSyncs.RequestAuthenticate = createRequestSync(Auth.authenticate, "/UserAuthentication/authenticate", { username: 'username', password: 'password' }, (frames, { username, password }) => ({ username, password }), 'user', async (frames) => frames);
allSyncs.AuthenticateResponse = createActionSuccessResponseSync(Auth.authenticate, "/UserAuthentication/authenticate", "user");
allSyncs.AuthenticateErrorResponse = createErrorResponseSync(Auth.authenticate, "/UserAuthentication/authenticate");

allSyncs.RequestGetUsername = createRequestSync(Auth._getUsername, "/UserAuthentication/_getUsername", { user: 'user' }, (frames, { user }) => ({ user }), 'username', async (frames) => frames.filter(f => f.currentUser));
allSyncs.GetUsernameResponse = createQuerySuccessResponseSync(Auth._getUsername, "/UserAuthentication/_getUsername", "username");
allSyncs.GetUsernameErrorResponse = createErrorResponseSync(Auth._getUsername, "/UserAuthentication/_getUsername");

allSyncs.RequestGetUserByUsername = createRequestSync(Auth._getUserByUsername, "/UserAuthentication/_getUserByUsername", { username: 'username' }, (frames, { username }) => ({ username }), 'user', async (frames) => frames.filter(f => f.currentUser));
allSyncs.GetUserByUsernameResponse = createQuerySuccessResponseSync(Auth._getUserByUsername, "/UserAuthentication/_getUserByUsername", "user");
allSyncs.GetUserByUsernameErrorResponse = createErrorResponseSync(Auth._getUserByUsername, "/UserAuthentication/_getUserByUsername");

// --- Sessioning Syncs ---
// (Previously defined)
allSyncs.CreateSessionAfterAuthenticate = ({ user, session }: any) => ({
    when: actions([Auth.authenticate, {}, { user }]),
    then: actions([Session.createSession, { user }, { session }]),
});

allSyncs.CreateSessionAfterRegister = ({ user, session }: any) => ({
    when: actions([Auth.register, {}, { user }]),
    then: actions([Session.createSession, { user }, { session }]),
});

allSyncs.LogoutRequest = ({ request, session, user }) => ({
  when: actions([Requesting.request, { path: "/logout", session }, { request }]),
  where: (frames) => frames.query(Session._getUser, { session }, { user }),
  then: actions([Session.delete, { session }]),
});

allSyncs.LogoutResponse = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Session.delete, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "logged_out" }]),
});


// --- LikertSurvey Syncs ---
// (Previously defined)
allSyncs.RequestCreateSurvey = createRequestSync(Likert.createSurvey, "/LikertSurvey/createSurvey", { title: 'title', scaleMin: 'scaleMin', scaleMax: 'scaleMax' }, (frames, { title, scaleMin, scaleMax }) => ({ author: frames[0].currentUser, title, scaleMin, scaleMax }), 'survey', async (frames) => frames.filter(f => f.currentUser));
allSyncs.CreateSurveyResponse = createActionSuccessResponseSync(Likert.createSurvey, "/LikertSurvey/createSurvey", "survey");
allSyncs.CreateSurveyErrorResponse = createErrorResponseSync(Likert.createSurvey, "/LikertSurvey/createSurvey");

allSyncs.RequestAddQuestion = createRequestSync(Likert.addQuestion, "/LikertSurvey/addQuestion", { survey: 'survey', text: 'text' }, (frames, { survey, text }) => ({ survey, text }), 'question', async (frames) => { frames = frames.filter(f => f.currentUser); if (frames.length === 0) return new Frames(); const surveyId = frames[0].survey; const surveyDoc = await Likert.surveys.findOne({ _id: surveyId }); return frames.filter(f => surveyDoc && f.currentUser === surveyDoc.author); });
allSyncs.AddQuestionResponse = createActionSuccessResponseSync(Likert.addQuestion, "/LikertSurvey/addQuestion", "question");
allSyncs.AddQuestionErrorResponse = createErrorResponseSync(Likert.addQuestion, "/LikertSurvey/addQuestion");

allSyncs.RequestSubmitResponse = createRequestSync(Likert.submitResponse, "/LikertSurvey/submitResponse", { question: 'question', value: 'value' }, (frames, { question, value }) => ({ respondent: frames[0].currentUser, question, value }), 'empty', async (frames) => frames.filter(f => f.currentUser));
allSyncs.SubmitResponseResponse = createEmptySuccessResponseSync(Likert.submitResponse, "/LikertSurvey/submitResponse");
allSyncs.SubmitResponseErrorResponse = createErrorResponseSync(Likert.submitResponse, "/LikertSurvey/submitResponse");

allSyncs.RequestUpdateResponse = createRequestSync(Likert.updateResponse, "/LikertSurvey/updateResponse", { question: 'question', value: 'value' }, (frames, { question, value }) => ({ respondent: frames[0].currentUser, question, value }), 'empty', async (frames) => frames.filter(f => f.currentUser));
allSyncs.UpdateResponseResponse = createEmptySuccessResponseSync(Likert.updateResponse, "/LikertSurvey/updateResponse");
allSyncs.UpdateResponseErrorResponse = createErrorResponseSync(Likert.updateResponse, "/LikertSurvey/updateResponse");

allSyncs.RequestGetSurveyQuestions = createRequestSync(Likert._getSurveyQuestions, "/LikertSurvey/_getSurveyQuestions", { survey: 'survey' }, (frames, { survey }) => ({ survey }), 'questionDoc', async (frames) => frames.filter(f => f.currentUser));
allSyncs.GetSurveyQuestionsResponse = createQuerySuccessResponseSync(Likert._getSurveyQuestions, "/LikertSurvey/_getSurveyQuestions", "questionDoc");
allSyncs.GetSurveyQuestionsErrorResponse = createErrorResponseSync(Likert._getSurveyQuestions, "/LikertSurvey/_getSurveyQuestions");

allSyncs.RequestGetSurveyResponses = createRequestSync(Likert._getSurveyResponses, "/LikertSurvey/_getSurveyResponses", { survey: 'survey' }, (frames, { survey }) => ({ survey }), 'responseDoc', async (frames) => { frames = frames.filter(f => f.currentUser); if (frames.length === 0) return new Frames(); const surveyId = frames[0].survey; const surveyDoc = await Likert.surveys.findOne({ _id: surveyId }); return frames.filter(f => surveyDoc && f.currentUser === surveyDoc.author); });
allSyncs.GetSurveyResponsesResponse = createQuerySuccessResponseSync(Likert._getSurveyResponses, "/LikertSurvey/_getSurveyResponses", "responseDoc");
allSyncs.GetSurveyResponsesErrorResponse = createErrorResponseSync(Likert._getSurveyResponses, "/LikertSurvey/_getSurveyResponses");

allSyncs.RequestGetRespondentAnswers = createRequestSync(Likert._getRespondentAnswers, "/LikertSurvey/_getRespondentAnswers", { respondent: 'respondent' }, (frames, { respondent }) => ({ respondent }), 'responseDoc', async (frames) => { frames = frames.filter(f => f.currentUser); if (frames.length === 0) return new Frames(); return frames.filter(f => f.currentUser === f.respondent); });
allSyncs.GetRespondentAnswersResponse = createQuerySuccessResponseSync(Likert._getRespondentAnswers, "/LikertSurvey/_getRespondentAnswers", "responseDoc");
allSyncs.GetRespondentAnswersErrorResponse = createErrorResponseSync(Likert._getRespondentAnswers, "/LikertSurvey/_getRespondentAnswers");


// --- Event Concept Syncs ---
// (Previously defined, but adding _getEventsByStatus and _getAllEvents)
allSyncs.RequestCreateEvent = createRequestSync(Event.createEvent, "/Event/createEvent", { name: 'name', date: 'date', duration: 'duration', location: 'location', description: 'description' }, (frames, { name, date, duration, location, description }) => ({ organizer: frames[0].currentUser, name, date, duration, location, description }), 'event', async (frames) => frames.filter(f => f.currentUser));
allSyncs.CreateEventResponse = createActionSuccessResponseSync(Event.createEvent, "/Event/createEvent", "event");
allSyncs.CreateEventErrorResponse = createErrorResponseSync(Event.createEvent, "/Event/createEvent");

allSyncs.RequestModifyEvent = createRequestSync(Event.modifyEvent, "/Event/modifyEvent", { event: 'event', newName: 'newName', newDate: 'newDate', newDuration: 'newDuration', newLocation: 'newLocation', newDescription: 'newDescription' }, (frames, { event, newName, newDate, newDuration, newLocation, newDescription }) => ({ organizer: frames[0].currentUser, event, newName, newDate, newDuration, newLocation, newDescription }), 'event', async (frames) => { frames = frames.filter(f => f.currentUser); if (frames.length === 0) return new Frames(); const eventId = frames[0].event; const eventDoc = await Event.events.findOne({ _id: eventId }); return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer); });
allSyncs.ModifyEventResponse = createActionSuccessResponseSync(Event.modifyEvent, "/Event/modifyEvent", "event");
allSyncs.ModifyEventErrorResponse = createErrorResponseSync(Event.modifyEvent, "/Event/modifyEvent");

allSyncs.RequestCancelEvent = createRequestSync(Event.cancelEvent, "/Event/cancelEvent", { event: 'event' }, (frames, { event }) => ({ organizer: frames[0].currentUser, event }), 'empty', async (frames) => { frames = frames.filter(f => f.currentUser); if (frames.length === 0) return new Frames(); const eventId = frames[0].event; const eventDoc = await Event.events.findOne({ _id: eventId }); return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer); });
allSyncs.CancelEventResponse = createEmptySuccessResponseSync(Event.cancelEvent, "/Event/cancelEvent");
allSyncs.CancelEventErrorResponse = createErrorResponseSync(Event.cancelEvent, "/Event/cancelEvent");

allSyncs.RequestUnCancelEvent = createRequestSync(Event.unCancelEvent, "/Event/unCancelEvent", { event: 'event' }, (frames, { event }) => ({ organizer: frames[0].currentUser, event }), 'event', async (frames) => { frames = frames.filter(f => f.currentUser); if (frames.length === 0) return new Frames(); const eventId = frames[0].event; const eventDoc = await Event.events.findOne({ _id: eventId }); return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer); });
allSyncs.UnCancelEventResponse = createActionSuccessResponseSync(Event.unCancelEvent, "/Event/unCancelEvent", "event");
allSyncs.UnCancelEventErrorResponse = createErrorResponseSync(Event.unCancelEvent, "/Event/unCancelEvent");

allSyncs.RequestDeleteEvent = createRequestSync(Event.deleteEvent, "/Event/deleteEvent", { event: 'event' }, (frames, { event }) => ({ organizer: frames[0].currentUser, event }), 'empty', async (frames) => { frames = frames.filter(f => f.currentUser); if (frames.length === 0) return new Frames(); const eventId = frames[0].event; const eventDoc = await Event.events.findOne({ _id: eventId }); return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer); });
allSyncs.DeleteEventResponse = createEmptySuccessResponseSync(Event.deleteEvent, "/Event/deleteEvent");
allSyncs.DeleteEventErrorResponse = createErrorResponseSync(Event.deleteEvent, "/Event/deleteEvent");

allSyncs.RequestGetEventsByOrganizer = createRequestSync(Event._getEventsByOrganizer, "/Event/_getEventsByOrganizer", { organizer: 'organizer' }, (frames, { organizer }) => ({ organizer }), 'eventDoc', async (frames) => frames.filter(f => f.currentUser));
allSyncs.GetEventsByOrganizerResponse = createQuerySuccessResponseSync(Event._getEventsByOrganizer, "/Event/_getEventsByOrganizer", "eventDoc");
allSyncs.GetEventsByOrganizerErrorResponse = createErrorResponseSync(Event._getEventsByOrganizer, "/Event/_getEventsByOrganizer");

allSyncs.RequestGetEventById = createRequestSync(Event._getEventById, "/Event/_getEventById", { event: 'event' }, (frames, { event }) => ({ event }), 'eventDoc', async (frames) => frames.filter(f => f.currentUser));
allSyncs.GetEventByIdResponse = createQuerySuccessResponseSync(Event._getEventById, "/Event/_getEventById", "eventDoc");
allSyncs.GetEventByIdErrorResponse = createErrorResponseSync(Event._getEventById, "/Event/_getEventById");

allSyncs.RequestGetEventsByRecommendationContext = createRequestSync(Event._getEventsByRecommendationContext, "/Event/_getEventsByRecommendationContext", { filters: 'filters', priorities: 'priorities' }, (frames, { filters, priorities }) => ({ user: frames[0].currentUser, filters, priorities }), 'eventDoc', async (frames) => frames.filter(f => f.currentUser));
allSyncs.GetEventsByRecommendationContextResponse = createQuerySuccessResponseSync(Event._getEventsByRecommendationContext, "/Event/_getEventsByRecommendationContext", "eventDoc");
allSyncs.GetEventsByRecommendationContextErrorResponse = createErrorResponseSync(Event._getEventsByRecommendationContext, "/Event/_getEventsByRecommendationContext");

allSyncs.RequestGetEventsByStatus = createRequestSync(Event._getEventsByStatus, "/Event/_getEventsByStatus", { status: 'status' }, (frames, { status }) => ({ status }), 'eventDoc', async (frames) => frames.filter(f => f.currentUser));
allSyncs.GetEventsByStatusResponse = createQuerySuccessResponseSync(Event._getEventsByStatus, "/Event/_getEventsByStatus", "eventDoc");
allSyncs.GetEventsByStatusErrorResponse = createErrorResponseSync(Event._getEventsByStatus, "/Event/_getEventsByStatus");

allSyncs.RequestGetAllEvents = createRequestSync(Event._getAllEvents, "/Event/_getAllEvents", {}, (frames, {}) => ({}), 'eventDoc', async (frames) => frames.filter(f => f.currentUser));
allSyncs.GetAllEventsResponse = createQuerySuccessResponseSync(Event._getAllEvents, "/Event/_getAllEvents", "eventDoc");
allSyncs.GetAllEventsErrorResponse = createErrorResponseSync(Event._getAllEvents, "/Event/_getAllEvents");

// --- Friending Concept Syncs ---

// sendFriendRequest (user: User, target: User)
allSyncs.RequestSendFriendRequest = createRequestSync(
    Friend.sendFriendRequest,
    "/Friending/sendFriendRequest",
    { targetUsername: 'targetUsername' }, // Frontend sends username
    (frames) => ({ user: frames[0].currentUser, target: frames[0].targetUser }), // `targetUser` from where clause
    'empty', // Concept returns {} for success
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();

        // Resolve targetUsername to targetUser ID
        frames = await frames.query(Auth._getUserByUsername, { username: frames[0].targetUsername }, { user: 'targetUser' });
        if (frames.length === 0) return new Frames(); // Target user not found

        // Additional precondition checks from concept definition
        const { currentUser, targetUser } = frames[0];
        if (currentUser === targetUser) {
            return new Frames({ error: "Cannot send a friend request to self." });
        }
        // These checks are ideally within the concept, but for robust syncs, can duplicate here for early exit
        // or ensure concept logic handles it gracefully. Assuming concept handles it robustly.

        return frames;
    }
);
allSyncs.SendFriendRequestResponse = createEmptySuccessResponseSync(Friend.sendFriendRequest, "/Friending/sendFriendRequest");
allSyncs.SendFriendRequestErrorResponse = createErrorResponseSync(Friend.sendFriendRequest, "/Friending/sendFriendRequest");

// acceptFriendRequest (requester: User, target: User)
allSyncs.RequestAcceptFriendRequest = createRequestSync(
    Friend.acceptFriendRequest,
    "/Friending/acceptFriendRequest",
    { requester: 'requester' },
    (frames, { requester }) => ({ requester, target: frames[0].currentUser }), // Current user is the target
    'empty', // Concept returns {} for success
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Additional precondition checks (e.g., if a request from 'requester' to 'currentUser' actually exists)
        // These are handled by the concept's own `requires` clause, but a quick check here could make the sync more efficient.
        // For now, delegate to concept's internal checks.
        return frames;
    }
);
allSyncs.AcceptFriendRequestResponse = createEmptySuccessResponseSync(Friend.acceptFriendRequest, "/Friending/acceptFriendRequest");
allSyncs.AcceptFriendRequestErrorResponse = createErrorResponseSync(Friend.acceptFriendRequest, "/Friending/acceptFriendRequest");

// removeFriendRequest (requester: User, target: User)
allSyncs.RequestRemoveFriendRequest = createRequestSync(
    Friend.removeFriendRequest,
    "/Friending/removeFriendRequest",
    { requester: 'requester', target: 'target' }, // Both IDs provided in request
    (frames, { requester, target }) => ({ requester, target }),
    'empty', // Concept returns {} for success
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Authorization: The current user must be either the requester OR the target of the request.
        return frames.filter(f => f.currentUser === f.requester || f.currentUser === f.target);
    }
);
allSyncs.RemoveFriendRequestResponse = createEmptySuccessResponseSync(Friend.removeFriendRequest, "/Friending/removeFriendRequest");
allSyncs.RemoveFriendRequestErrorResponse = createErrorResponseSync(Friend.removeFriendRequest, "/Friending/removeFriendRequest");

// removeFriend (user: User, friend: User)
allSyncs.RequestRemoveFriend = createRequestSync(
    Friend.removeFriend,
    "/Friending/removeFriend",
    { friend: 'friend' }, // ID of the friend to remove
    (frames, { friend }) => ({ user: frames[0].currentUser, friend }), // Current user is the `user`
    'empty', // Concept returns {} for success
    async (frames) => frames.filter(f => f.currentUser) // Requires authentication
);
allSyncs.RemoveFriendResponse = createEmptySuccessResponseSync(Friend.removeFriend, "/Friending/removeFriend");
allSyncs.RemoveFriendErrorResponse = createErrorResponseSync(Friend.removeFriend, "/Friending/removeFriend");

// _getFriends (user: User): (friend: User)[]
allSyncs.RequestGetFriends = createRequestSync(
    Friend._getFriends,
    "/Friending/_getFriends",
    { user: 'user' }, // User ID for whom to get friends
    (frames, { user }) => ({ user }),
    'friend', // Output property is 'friend' (returns Array<{friend: User}>)
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Authorization: Only the current user can query their own friends
        return frames.filter(f => f.currentUser === f.user);
    }
);
allSyncs.GetFriendsResponse = createQuerySuccessResponseSync(Friend._getFriends, "/Friending/_getFriends", "friend");
allSyncs.GetFriendsErrorResponse = createErrorResponseSync(Friend._getFriends, "/Friending/_getFriends");

// _getIncomingRequests (user: User): (requester: User)[]
allSyncs.RequestGetIncomingRequests = createRequestSync(
    Friend._getIncomingRequests,
    "/Friending/_getIncomingRequests",
    { user: 'user' }, // User ID for whom to get incoming requests
    (frames, { user }) => ({ user }),
    'requester', // Output property is 'requester' (returns Array<{requester: User}>)
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Authorization: Only the current user can query their own incoming requests
        return frames.filter(f => f.currentUser === f.user);
    }
);
allSyncs.GetIncomingRequestsResponse = createQuerySuccessResponseSync(Friend._getIncomingRequests, "/Friending/_getIncomingRequests", "requester");
allSyncs.GetIncomingRequestsErrorResponse = createErrorResponseSync(Friend._getIncomingRequests, "/Friending/_getIncomingRequests");

// _getOutgoingRequests (user: User): (target: User)[]
allSyncs.RequestGetOutgoingRequests = createRequestSync(
    Friend._getOutgoingRequests,
    "/Friending/_getOutgoingRequests",
    { user: 'user' }, // User ID for whom to get outgoing requests
    (frames, { user }) => ({ user }),
    'target', // Output property is 'target' (returns Array<{target: User}>)
    async (frames) => {
        frames = frames.filter(f => f.currentUser); // Requires authentication
        if (frames.length === 0) return new Frames();
        // Authorization: Only the current user can query their own outgoing requests
        return frames.filter(f => f.currentUser === f.user);
    }
);
allSyncs.GetOutgoingRequestsResponse = createQuerySuccessResponseSync(Friend._getOutgoingRequests, "/Friending/_getOutgoingRequests", "target");
allSyncs.GetOutgoingRequestsErrorResponse = createErrorResponseSync(Friend._getOutgoingRequests, "/Friending/_getOutgoingRequests");


// --- UserInterest Concept Syncs ---
// (Previously defined)
allSyncs.RequestAddPersonalInterest = createRequestSync(Interest.addPersonalInterest, "/UserInterest/addPersonalInterest", { tag: 'tag' }, (frames, { tag }) => ({ user: frames[0].currentUser, tag }), 'personalInterest', async (frames) => frames.filter(f => f.currentUser));
allSyncs.AddPersonalInterestResponse = createActionSuccessResponseSync(Interest.addPersonalInterest, "/UserInterest/addPersonalInterest", "personalInterest");
allSyncs.AddPersonalInterestErrorResponse = createErrorResponseSync(Interest.addPersonalInterest, "/UserInterest/addPersonalInterest");

allSyncs.RequestRemovePersonalInterest = createRequestSync(Interest.removePersonalInterest, "/UserInterest/removePersonalInterest", { tag: 'tag' }, (frames, { tag }) => ({ user: frames[0].currentUser, tag }), 'empty', async (frames) => frames.filter(f => f.currentUser));
allSyncs.RemovePersonalInterestResponse = createEmptySuccessResponseSync(Interest.removePersonalInterest, "/UserInterest/removePersonalInterest");
allSyncs.RemovePersonalInterestErrorResponse = createErrorResponseSync(Interest.removePersonalInterest, "/UserInterest/removePersonalInterest");

allSyncs.RequestAddItemInterest = createRequestSync(Interest.addItemInterest, "/UserInterest/addItemInterest", { item: 'item' }, (frames, { item }) => ({ user: frames[0].currentUser, item }), 'itemInterest', async (frames) => frames.filter(f => f.currentUser));
allSyncs.AddItemInterestResponse = createActionSuccessResponseSync(Interest.addItemInterest, "/UserInterest/addItemInterest", "itemInterest");
allSyncs.AddItemInterestErrorResponse = createErrorResponseSync(Interest.addItemInterest, "/UserInterest/addItemInterest");

allSyncs.RequestRemoveItemInterest = createRequestSync(Interest.removeItemInterest, "/UserInterest/removeItemInterest", { item: 'item' }, (frames, { item }) => ({ user: frames[0].currentUser, item }), 'empty', async (frames) => frames.filter(f => f.currentUser));
allSyncs.RemoveItemInterestResponse = createEmptySuccessResponseSync(Interest.removeItemInterest, "/UserInterest/removeItemInterest");
allSyncs.RemoveItemInterestErrorResponse = createErrorResponseSync(Interest.removeItemInterest, "/UserInterest/removeItemInterest");

allSyncs.RequestGetPersonalInterests = createRequestSync(Interest._getPersonalInterests, "/UserInterest/_getPersonalInterests", { user: 'user' }, (frames, { user }) => ({ user }), 'personalInterestDoc', async (frames) => { frames = frames.filter(f => f.currentUser); if (frames.length === 0) return new Frames(); return frames.filter(f => f.currentUser === f.user); });
allSyncs.GetPersonalInterestsResponse = createQuerySuccessResponseSync(Interest._getPersonalInterests, "/UserInterest/_getPersonalInterests", "personalInterestDoc");
allSyncs.GetPersonalInterestsErrorResponse = createErrorResponseSync(Interest._getPersonalInterests, "/UserInterest/_getPersonalInterests");

allSyncs.RequestGetItemInterests = createRequestSync(Interest._getItemInterests, "/UserInterest/_getItemInterests", { user: 'user' }, (frames, { user }) => ({ user }), 'itemInterestDoc', async (frames) => { frames = frames.filter(f => f.currentUser); if (frames.length === 0) return new Frames(); return frames.filter(f => f.currentUser === f.user); });
allSyncs.GetItemInterestsResponse = createQuerySuccessResponseSync(Interest._getItemInterests, "/UserInterest/_getItemInterests", "itemInterestDoc");
allSyncs.GetItemInterestsErrorResponse = createErrorResponseSync(Interest._getItemInterests, "/UserInterest/_getItemInterests");

allSyncs.RequestGetUsersInterestedInItems = createRequestSync(Interest._getUsersInterestedInItems, "/UserInterest/_getUsersInterestedInItems", { item: 'item' }, (frames, { item }) => ({ item }), 'user', async (frames) => frames.filter(f => f.currentUser));
allSyncs.GetUsersInterestedInItemsResponse = createQuerySuccessResponseSync(Interest._getUsersInterestedInItems, "/UserInterest/_getUsersInterestedInItems", "user");
allSyncs.GetUsersInterestedInItemsErrorResponse = createErrorResponseSync(Interest._getUsersInterestedInItems, "/UserInterest/_getUsersInterestedInItems");


// --- Reviewing Concept Syncs ---
// (Previously defined)
allSyncs.RequestAddReview = createRequestSync(Review.addReview, "/Reviewing/addReview", { item: 'item', rating: 'rating', entry: 'entry' }, (frames, { item, rating, entry }) => ({ user: frames[0].currentUser, item, rating, entry }), 'review', async (frames) => frames.filter(f => f.currentUser));
allSyncs.AddReviewResponse = createActionSuccessResponseSync(Review.addReview, "/Reviewing/addReview", "review");
allSyncs.AddReviewErrorResponse = createErrorResponseSync(Review.addReview, "/Reviewing/addReview");

allSyncs.RequestRemoveReview = createRequestSync(Review.removeReview, "/Reviewing/removeReview", { item: 'item' }, (frames, { item }) => ({ user: frames[0].currentUser, item }), 'empty', async (frames) => frames.filter(f => f.currentUser));
allSyncs.RemoveReviewResponse = createEmptySuccessResponseSync(Review.removeReview, "/Reviewing/removeReview");
allSyncs.RemoveReviewErrorResponse = createErrorResponseSync(Review.removeReview, "/Reviewing/removeReview");

allSyncs.RequestModifyReview = createRequestSync(Review.modifyReview, "/Reviewing/modifyReview", { item: 'item', rating: 'rating', entry: 'entry' }, (frames, { item, rating, entry }) => ({ user: frames[0].currentUser, item, rating, entry }), 'review', async (frames) => frames.filter(f => f.currentUser));
allSyncs.ModifyReviewResponse = createActionSuccessResponseSync(Review.modifyReview, "/Reviewing/modifyReview", "review");
allSyncs.ModifyReviewErrorResponse = createErrorResponseSync(Review.modifyReview, "/Reviewing/modifyReview");

allSyncs.RequestGetReview = createRequestSync(Review._getReview, "/Reviewing/_getReview", { user: 'user', item: 'item' }, (frames, { user, item }) => ({ user, item }), 'review', async (frames) => frames.filter(f => f.currentUser));
allSyncs.GetReviewResponse = createQuerySuccessResponseSync(Review._getReview, "/Reviewing/_getReview", "review");
allSyncs.GetReviewErrorResponse = createErrorResponseSync(Review._getReview, "/Reviewing/_getReview");

allSyncs.RequestGetReviewsByItem = createRequestSync(Review._getReviewsByItem, "/Reviewing/_getReviewsByItem", { item: 'item' }, (frames, { item }) => ({ item }), 'review', async (frames) => frames.filter(f => f.currentUser));
allSyncs.GetReviewsByItemResponse = createQuerySuccessResponseSync(Review._getReviewsByItem, "/Reviewing/_getReviewsByItem", "review");
allSyncs.GetReviewsByItemErrorResponse = createErrorResponseSync(Review._getReviewsByItem, "/Reviewing/_getReviewsByItem");

allSyncs.RequestGetReviewsByUser = createRequestSync(Review._getReviewsByUser, "/Reviewing/_getReviewsByUser", { user: 'user' }, (frames, { user }) => ({ user }), 'review', async (frames) => { frames = frames.filter(f => f.currentUser); if (frames.length === 0) return new Frames(); return frames.filter(f => f.currentUser === f.user); });
allSyncs.GetReviewsByUserResponse = createQuerySuccessResponseSync(Review._getReviewsByUser, "/Reviewing/_getReviewsByUser", "review");
allSyncs.GetReviewsByUserErrorResponse = createErrorResponseSync(Review._getReviewsByUser, "/Reviewing/_getReviewsByUser");


// --- Cross-Concept Cascading Syncs (Updated with new `Event` deletion cascades) ---

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

### **`passthrough.ts` Configuration (Updated to reflect full sync coverage)**

All paths for actions and queries on `UserAuthentication`, `LikertSurvey`, `Event`, `Friending`, `UserInterest`, and `Reviewing` are now explicitly handled by synchronizations for proper authorization and custom logic. Therefore, they should all be in the `exclusions` list.

```typescript
// file: passthrough.ts

// These routes will bypass the synchronization engine and directly call
// the corresponding concept action/query. For security and consistent authorization,
// it's generally recommended to exclude all user-facing API endpoints
// and handle them through explicit synchronization rules.
export const inclusions = {
  // No public, non-sensitive, read-only endpoints are explicitly included
  // as all interactions are now routed through syncs for authorization.
};

// These routes will be explicitly excluded from direct passthrough.
// Instead, a `Requesting.request` action will be fired, which needs to be
// handled by explicit synchronization rules. This is the recommended approach
// for all user-facing actions and queries that require authentication/authorization
// or custom response logic.
export const exclusions = [
  // UserAuthentication Concept
  "/UserAuthentication/register",
  "/UserAuthentication/authenticate",
  "/UserAuthentication/_getUsername",
  "/UserAuthentication/_getUserByUsername",
  // Login/Logout are custom paths handled by Requesting and then Auth/Session syncs
  "/login",
  "/logout",

  // LikertSurvey Concept
  "/LikertSurvey/createSurvey",
  "/LikertSurvey/addQuestion",
  "/LikertSurvey/submitResponse",
  "/LikertSurvey/updateResponse",
  "/LikertSurvey/_getSurveyQuestions",
  "/LikertSurvey/_getSurveyResponses",
  "/LikertSurvey/_getRespondentAnswers",

  // Event Concept
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

  // Friending Concept
  "/Friending/sendFriendRequest", // Frontend sends targetUsername, resolved in sync
  "/Friending/acceptFriendRequest",
  "/Friending/removeFriendRequest",
  "/Friending/removeFriend",
  "/Friending/_getFriends",
  "/Friending/_getIncomingRequests",
  "/Friending/_getOutgoingRequests",

  // UserInterest Concept
  "/UserInterest/addPersonalInterest",
  "/UserInterest/removePersonalInterest",
  "/UserInterest/addItemInterest",
  "/UserInterest/removeItemInterest",
  "/UserInterest/_getPersonalInterests",
  "/UserInterest/_getItemInterests",
  "/UserInterest/_getUsersInterestedInItems",

  // Reviewing Concept
  "/Reviewing/addReview",
  "/Reviewing/removeReview",
  "/Reviewing/modifyReview",
  "/Reviewing/_getReview",
  "/Reviewing/_getReviewsByItem",
  "/Reviewing/_getReviewsByUser",
];
```
