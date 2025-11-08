[@sync-background](../background/sync-background.md)

[@event-concept](../concepts/Event/implementation.md)

[@friending-concept](../concepts/Friending/implementation.md)

[@reviewing-concept](../concepts/Reviewing/implementation.md)

[@session-concept](../concepts/Session/implementation.md)

[@userauth-concept](../concepts/UserAuthentication/implementation.md)

[@interest-concept](../concepts/UserInterest/implementation.md)

[@api-syncs](api-syncs.md)

[@sync-design](sync-design.md)

[@sample-sync](../../src/syncs/auth.sync.ts)

# prompt: generate syncs related to the friending concept
# response:

Here are the synchronizations specifically related to the `Friending` concept, using the established helper functions for consistency. This includes handling username resolution for `sendFriendRequest` as detailed in your `api-syncs.md`.

First, let's ensure the `Friending` concept has the correct query definitions as implied by your `api-syncs.md` and standard use cases. I'll include the concept spec again with these queries.

## Updated Concept: Friending \[User]

*   **concept**: Friending \[User]
*   **purpose**: enable users to establish and manage mutual social connections
*   **principle**: a user can send a friend request to another user; they may choose to remove this request before the target user takes action; the recipient of a friend request can choose to accept or remove it; once a request is accepted, two users become friends; friendship may be revoked.
*   **state**:
    *   a set of Users with
        *   a set of friends Users
        *   a set of incomingRequests Users
        *   a set of outgoingRequests Users
*   **actions**:
    *   sendFriendRequest (user: User, target: User)
        *   requires: user and target are not existing friends, user has not already sent a request to target, target has not sent a request to user.
        *   effects: target is added to the set of the user's outgoing requests; user is added to the set of target's incoming requests.
    *   acceptFriendRequest (requester: User, target: User)
        *   requires: requester has sent a friend request to target, requester and target are not friends
        *   effects: requester and target are added to each other's set of friends, they are both removed from the other's set of incoming/outgoingRequests
    *   removeFriendRequest (requester: User, target: User)
        *   requires: requester has sent a friend request to target, requester and target are not friends
        *   effects: requester is removed from the target's set of incomingRequests, target is removed the requester's set of outgoingRequests
    *   removeFriend (user: User, friend: User): ()
        *   requires: user and friend are friends with each other
        *   effects: user and friends are both removed from each other's set of friends
*   **queries**:
    *   \_getFriends (user: User): (friend: User)
        *   effects: Returns a set of all friends for the given user.
    *   \_getIncomingRequests (user: User): (requester: User)
        *   effects: Returns a set of all users who have sent a friend request to the given user.
    *   \_getOutgoingRequests (user: User): (target: User)
        *   effects: Returns a set of all users to whom the given user has sent a friend request.

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

# prompt: do not use helpers and use the same format as the example for auth syncs without adding everything to a dictionary, make everything exportable, and do not include queries

# response:

Here's the updated `Friending` concept specification and the `app.sync.ts` file with all synchronizations for actions (excluding queries, and not using helper functions), followed by the updated `passthrough.ts` configuration.

First, let's confirm the `Friending` concept specification with explicit queries, as implied by the `api-syncs.md` document for consistency.

## Updated Concept: Friending \[User]

*   **concept**: Friending \[User]
*   **purpose**: enable users to establish and manage mutual social connections
*   **principle**: a user can send a friend request to another user; they may choose to remove this request before the target user takes action; the recipient of a friend request can choose to accept or remove it; once a request is accepted, two users become friends; friendship may be revoked.
*   **state**:
    *   a set of Users with
        *   a set of friends Users
        *   a set of incomingRequests Users
        *   a set of outgoingRequests Users
*   **actions**:
    *   sendFriendRequest (user: User, target: User)
        *   requires: user and target are not existing friends, user has not already sent a request to target, target has not sent a request to user.
        *   effects: target is added to the set of the user's outgoing requests; user is added to the set of target's incoming requests.
    *   acceptFriendRequest (requester: User, target: User)
        *   requires: requester has sent a friend request to target, requester and target are not friends
        *   effects: requester and target are added to each other's set of friends, they are both removed from the other's set of incoming/outgoingRequests
    *   removeFriendRequest (requester: User, target: User)
        *   requires: requester has sent a friend request to target, requester and target are not friends
        *   effects: requester is removed from the target's set of incomingRequests, target is removed the requester's set of outgoingRequests
    *   removeFriend (user: User, friend: User): ()
        *   requires: user and friend are friends with each other
        *   effects: user and friends are both removed from each other's set of friends
*   **queries**:
    *   \_getFriends (user: User): (friend: User)
        *   effects: Returns a set of all friends for the given user.
    *   \_getIncomingRequests (user: User): (requester: User)
        *   effects: Returns a set of all users who have sent a friend request to the given user.
    *   \_getOutgoingRequests (user: User): (target: User)
        *   effects: Returns a set of all users to whom the given user has sent a friend request.

---

## `src/syncs/app.sync.ts` (Full Implementation)

This file will contain all necessary synchronizations, including the specific `Friending` ones and the cascading deletion syncs for `Event`. Each sync is exported individually.

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

// --- UserAuthentication Syncs (Actions Only) ---

// register (username: String, password: String): (user: User)
export const RequestRegister: Sync = ({ request, username, password }) => ({
  when: actions([Requesting.request, { path: "/UserAuthentication/register", username, password }, { request }]),
  then: actions([Auth.register, { username, password }]),
});

export const RegisterSuccessResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [Auth.register, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

export const RegisterErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [Auth.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// authenticate (username: String, password: String): (user: User)
export const RequestAuthenticate: Sync = ({ request, username, password }) => ({
  when: actions([Requesting.request, { path: "/UserAuthentication/authenticate", username, password }, { request }]),
  then: actions([Auth.authenticate, { username, password }]),
});

export const AuthenticateSuccessResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/authenticate" }, { request }],
    [Auth.authenticate, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

export const AuthenticateErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/authenticate" }, { request }],
    [Auth.authenticate, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Sessioning Syncs (Actions Only, tied to Auth concepts) ---

// For createSession, assuming it's an internal action triggered by Auth, not a direct API request.
// (user: User): (session: Session)
export const CreateSessionAfterAuthenticate: Sync = ({ user, session }) => ({
    when: actions(
        [Auth.authenticate, {}, { user }],
    ),
    then: actions(
        [Session.createSession, { user }, { session }],
    ),
});

export const CreateSessionAfterRegister: Sync = ({ user, session }) => ({
    when: actions(
        [Auth.register, {}, { user }],
    ),
    then: actions(
        [Session.createSession, { user }, { session }],
    ),
});

// delete (session: Session): ()
export const RequestLogout: Sync = ({ request, session, user }) => ({
  when: actions([Requesting.request, { path: "/logout", session }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames(); // Invalid session
    return frames.filter(f => f.currentUser === f.user); // Ensure current user owns session
  },
  then: actions([Session.delete, { session }]),
});

export const LogoutSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Session.delete, {}, {}], // Match empty object for success
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const LogoutErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Session.delete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


// --- LikertSurvey Syncs (Actions Only) ---

// createSurvey (author: Author, title: String, scaleMin: Number, scaleMax: Number): (survey: Survey)
export const RequestCreateSurvey: Sync = ({ request, session, title, scaleMin, scaleMax }) => ({
  when: actions([Requesting.request, { path: "/LikertSurvey/createSurvey", session, title, scaleMin, scaleMax }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    return frames; // `currentUser` is `author` for createSurvey action
  },
  then: actions([Likert.createSurvey, { author: 'currentUser', title, scaleMin, scaleMax }]),
});

export const CreateSurveySuccessResponse: Sync = ({ request, survey }) => ({
  when: actions(
    [Requesting.request, { path: "/LikertSurvey/createSurvey" }, { request }],
    [Likert.createSurvey, {}, { survey }],
  ),
  then: actions([Requesting.respond, { request, survey }]),
});

export const CreateSurveyErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/LikertSurvey/createSurvey" }, { request }],
    [Likert.createSurvey, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// addQuestion (survey: Survey, text: String): (question: Question)
export const RequestAddQuestion: Sync = ({ request, session, survey, text }) => ({
  when: actions([Requesting.request, { path: "/LikertSurvey/addQuestion", session, survey, text }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    
    const surveyDoc = await Likert.surveys.findOne({ _id: frames[0].survey });
    return frames.filter(f => surveyDoc && f.currentUser === surveyDoc.author);
  },
  then: actions([Likert.addQuestion, { survey: 'survey', text: 'text' }]),
});

export const AddQuestionSuccessResponse: Sync = ({ request, question }) => ({
  when: actions(
    [Requesting.request, { path: "/LikertSurvey/addQuestion" }, { request }],
    [Likert.addQuestion, {}, { question }],
  ),
  then: actions([Requesting.respond, { request, question }]),
});

export const AddQuestionErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/LikertSurvey/addQuestion" }, { request }],
    [Likert.addQuestion, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// submitResponse (respondent: Respondent, question: Question, value: Number)
export const RequestSubmitResponse: Sync = ({ request, session, question, value }) => ({
  when: actions([Requesting.request, { path: "/LikertSurvey/submitResponse", session, question, value }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    return frames; // `currentUser` is `respondent` for submitResponse action
  },
  then: actions([Likert.submitResponse, { respondent: 'currentUser', question, value }]),
});

export const SubmitResponseSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/LikertSurvey/submitResponse" }, { request }],
    [Likert.submitResponse, {}, {}], // Matches empty success object
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const SubmitResponseErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/LikertSurvey/submitResponse" }, { request }],
    [Likert.submitResponse, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// updateResponse (respondent: Respondent, question: Question, value: Number)
export const RequestUpdateResponse: Sync = ({ request, session, question, value }) => ({
  when: actions([Requesting.request, { path: "/LikertSurvey/updateResponse", session, question, value }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    return frames; // `currentUser` is `respondent` for updateResponse action
  },
  then: actions([Likert.updateResponse, { respondent: 'currentUser', question, value }]),
});

export const UpdateResponseSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/LikertSurvey/updateResponse" }, { request }],
    [Likert.updateResponse, {}, {}], // Matches empty success object
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const UpdateResponseErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/LikertSurvey/updateResponse" }, { request }],
    [Likert.updateResponse, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


// --- Event Concept Syncs (Actions Only) ---

// createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)
export const RequestCreateEvent: Sync = ({ request, session, name, date, duration, location, description }) => ({
  when: actions([Requesting.request, { path: "/Event/createEvent", session, name, date, duration, location, description }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    return frames; // `currentUser` is `organizer`
  },
  then: actions([Event.createEvent, { organizer: 'currentUser', name, date, duration, location, description }]),
});

export const CreateEventSuccessResponse: Sync = ({ request, event }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/createEvent" }, { request }],
    [Event.createEvent, {}, { event }],
  ),
  then: actions([Requesting.respond, { request, event }]),
});

export const CreateEventErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/createEvent" }, { request }],
    [Event.createEvent, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)
export const RequestModifyEvent: Sync = ({ request, session, event, newName, newDate, newDuration, newLocation, newDescription }) => ({
  when: actions([Requesting.request, { path: "/Event/modifyEvent", session, event, newName, newDate, newDuration, newLocation, newDescription }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    
    const eventDoc = await Event.events.findOne({ _id: frames[0].event });
    return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer);
  },
  then: actions([Event.modifyEvent, { organizer: 'currentUser', event, newName, newDate, newDuration, newLocation, newDescription }]),
});

export const ModifyEventSuccessResponse: Sync = ({ request, event }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/modifyEvent" }, { request }],
    [Event.modifyEvent, {}, { event }],
  ),
  then: actions([Requesting.respond, { request, event }]),
});

export const ModifyEventErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/modifyEvent" }, { request }],
    [Event.modifyEvent, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// cancelEvent (organizer: User, event: Event)
export const RequestCancelEvent: Sync = ({ request, session, event }) => ({
  when: actions([Requesting.request, { path: "/Event/cancelEvent", session, event }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    
    const eventDoc = await Event.events.findOne({ _id: frames[0].event });
    return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer);
  },
  then: actions([Event.cancelEvent, { organizer: 'currentUser', event }]),
});

export const CancelEventSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/cancelEvent" }, { request }],
    [Event.cancelEvent, {}, {}], // Matches empty success object
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const CancelEventErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/cancelEvent" }, { request }],
    [Event.cancelEvent, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// unCancelEvent (organizer: User, event: Event): (event: Event)
export const RequestUnCancelEvent: Sync = ({ request, session, event }) => ({
  when: actions([Requesting.request, { path: "/Event/unCancelEvent", session, event }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    
    const eventDoc = await Event.events.findOne({ _id: frames[0].event });
    return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer);
  },
  then: actions([Event.unCancelEvent, { organizer: 'currentUser', event }]),
});

export const UnCancelEventSuccessResponse: Sync = ({ request, event }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/unCancelEvent" }, { request }],
    [Event.unCancelEvent, {}, { event }],
  ),
  then: actions([Requesting.respond, { request, event }]),
});

export const UnCancelEventErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/unCancelEvent" }, { request }],
    [Event.unCancelEvent, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// deleteEvent (organizer: User, event: Event)
export const RequestDeleteEvent: Sync = ({ request, session, event }) => ({
  when: actions([Requesting.request, { path: "/Event/deleteEvent", session, event }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    
    const eventDoc = await Event.events.findOne({ _id: frames[0].event });
    return frames.filter(f => eventDoc && f.currentUser === eventDoc.organizer);
  },
  then: actions([Event.deleteEvent, { organizer: 'currentUser', event }]),
});

export const DeleteEventSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/deleteEvent" }, { request }],
    [Event.deleteEvent, {}, {}], // Matches empty success object
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const DeleteEventErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/deleteEvent" }, { request }],
    [Event.deleteEvent, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// system completeEvent (event: Event) - This is a system action, not directly exposed via Requesting.
// Handled by the engine's internal timer/scheduler.

// --- Friending Concept Syncs (Actions Only) ---

// sendFriendRequest (user: User, target: User)
export const RequestSendFriendRequest: Sync = ({ request, session, targetUsername }) => ({
  when: actions([Requesting.request, { path: "/Friending/sendFriendRequest", session, targetUsername }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();

    // Resolve targetUsername to targetUser ID
    frames = await frames.query(Auth._getUserByUsername, { username: frames[0].targetUsername }, { user: 'targetUser' });
    if (frames.length === 0) return new Frames({ error: `User with username ${frames[0].targetUsername} not found.` });

    return frames.filter(f => f.currentUser !== f.targetUser); // Cannot friend self
  },
  then: actions([Friend.sendFriendRequest, { user: 'currentUser', target: 'targetUser' }]),
});

export const SendFriendRequestSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/sendFriendRequest" }, { request }],
    [Friend.sendFriendRequest, {}, {}], // Matches empty success object
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const SendFriendRequestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/sendFriendRequest" }, { request }],
    [Friend.sendFriendRequest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// acceptFriendRequest (requester: User, target: User)
export const RequestAcceptFriendRequest: Sync = ({ request, session, requester }) => ({
  when: actions([Requesting.request, { path: "/Friending/acceptFriendRequest", session, requester }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    // The current user (currentUser) is the 'target' in this action.
    // Ensure the requester is not the current user.
    return frames.filter(f => f.currentUser !== f.requester);
  },
  then: actions([Friend.acceptFriendRequest, { requester: 'requester', target: 'currentUser' }]),
});

export const AcceptFriendRequestSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/acceptFriendRequest" }, { request }],
    [Friend.acceptFriendRequest, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const AcceptFriendRequestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/acceptFriendRequest" }, { request }],
    [Friend.acceptFriendRequest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// removeFriendRequest (requester: User, target: User)
export const RequestRemoveFriendRequest: Sync = ({ request, session, requester, target }) => ({
  when: actions([Requesting.request, { path: "/Friending/removeFriendRequest", session, requester, target }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    // Authorization: The current user must be either the requester OR the target of the request.
    return frames.filter(f => f.currentUser === f.requester || f.currentUser === f.target);
  },
  then: actions([Friend.removeFriendRequest, { requester: 'requester', target: 'target' }]),
});

export const RemoveFriendRequestSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/removeFriendRequest" }, { request }],
    [Friend.removeFriendRequest, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const RemoveFriendRequestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/removeFriendRequest" }, { request }],
    [Friend.removeFriendRequest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// removeFriend (user: User, friend: User): ()
export const RequestRemoveFriend: Sync = ({ request, session, friend }) => ({
  when: actions([Requesting.request, { path: "/Friending/removeFriend", session, friend }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    // The current user is the 'user' in this action.
    return frames.filter(f => f.currentUser !== f.friend); // Cannot unfriend self
  },
  then: actions([Friend.removeFriend, { user: 'currentUser', friend: 'friend' }]),
});

export const RemoveFriendSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/removeFriend" }, { request }],
    [Friend.removeFriend, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const RemoveFriendErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/removeFriend" }, { request }],
    [Friend.removeFriend, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


// --- UserInterest Concept Syncs (Actions Only) ---

// addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)
export const RequestAddPersonalInterest: Sync = ({ request, session, tag }) => ({
  when: actions([Requesting.request, { path: "/UserInterest/addPersonalInterest", session, tag }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    return frames; // `currentUser` is `user`
  },
  then: actions([Interest.addPersonalInterest, { user: 'currentUser', tag }]),
});

export const AddPersonalInterestSuccessResponse: Sync = ({ request, personalInterest }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/addPersonalInterest" }, { request }],
    [Interest.addPersonalInterest, {}, { personalInterest }],
  ),
  then: actions([Requesting.respond, { request, personalInterest }]),
});

export const AddPersonalInterestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/addPersonalInterest" }, { request }],
    [Interest.addPersonalInterest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// removePersonalInterest (user: User, tag: String)
export const RequestRemovePersonalInterest: Sync = ({ request, session, tag }) => ({
  when: actions([Requesting.request, { path: "/UserInterest/removePersonalInterest", session, tag }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    return frames; // `currentUser` is `user`
  },
  then: actions([Interest.removePersonalInterest, { user: 'currentUser', tag }]),
});

export const RemovePersonalInterestSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/removePersonalInterest" }, { request }],
    [Interest.removePersonalInterest, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const RemovePersonalInterestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/removePersonalInterest" }, { request }],
    [Interest.removePersonalInterest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)
export const RequestAddItemInterest: Sync = ({ request, session, item }) => ({
  when: actions([Requesting.request, { path: "/UserInterest/addItemInterest", session, item }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    return frames; // `currentUser` is `user`
  },
  then: actions([Interest.addItemInterest, { user: 'currentUser', item }]),
});

export const AddItemInterestSuccessResponse: Sync = ({ request, itemInterest }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/addItemInterest" }, { request }],
    [Interest.addItemInterest, {}, { itemInterest }],
  ),
  then: actions([Requesting.respond, { request, itemInterest }]),
});

export const AddItemInterestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/addItemInterest" }, { request }],
    [Interest.addItemInterest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// removeItemInterest (user: User, item: Item)
export const RequestRemoveItemInterest: Sync = ({ request, session, item }) => ({
  when: actions([Requesting.request, { path: "/UserInterest/removeItemInterest", session, item }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    return frames; // `currentUser` is `user`
  },
  then: actions([Interest.removeItemInterest, { user: 'currentUser', item }]),
});

export const RemoveItemInterestSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/removeItemInterest" }, { request }],
    [Interest.removeItemInterest, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const RemoveItemInterestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/removeItemInterest" }, { request }],
    [Interest.removeItemInterest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


// --- Reviewing Concept Syncs (Actions Only) ---

// addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
export const RequestAddReview: Sync = ({ request, session, item, rating, entry }) => ({
  when: actions([Requesting.request, { path: "/Reviewing/addReview", session, item, rating, entry }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    return frames; // `currentUser` is `user`
  },
  then: actions([Review.addReview, { user: 'currentUser', item, rating, entry }]),
});

export const AddReviewSuccessResponse: Sync = ({ request, review }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/addReview" }, { request }],
    [Review.addReview, {}, { review }],
  ),
  then: actions([Requesting.respond, { request, review }]),
});

export const AddReviewErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/addReview" }, { request }],
    [Review.addReview, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// removeReview (user: User, item: Item)
export const RequestRemoveReview: Sync = ({ request, session, item }) => ({
  when: actions([Requesting.request, { path: "/Reviewing/removeReview", session, item }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    return frames; // `currentUser` is `user`
  },
  then: actions([Review.removeReview, { user: 'currentUser', item }]),
});

export const RemoveReviewSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/removeReview" }, { request }],
    [Review.removeReview, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const RemoveReviewErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/removeReview" }, { request }],
    [Review.removeReview, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
export const RequestModifyReview: Sync = ({ request, session, item, rating, entry }) => ({
  when: actions([Requesting.request, { path: "/Reviewing/modifyReview", session, item, rating, entry }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames();
    return frames; // `currentUser` is `user`
  },
  then: actions([Review.modifyReview, { user: 'currentUser', item, rating, entry }]),
});

export const ModifyReviewSuccessResponse: Sync = ({ request, review }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/modifyReview" }, { request }],
    [Review.modifyReview, {}, { review }],
  ),
  then: actions([Requesting.respond, { request, review }]),
});

export const ModifyReviewErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Reviewing/modifyReview" }, { request }],
    [Review.modifyReview, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});


// --- Cross-Concept Cascading Syncs (Actions Only) ---

// When an Event is deleted, remove it from all UserItemInterests
export const CascadeEventDeletionToUserInterest: Sync = ({ event }) => ({
    when: actions(
        [Event.deleteEvent, {}, { event }] // When an event is deleted
    ),
    where: async (frames) => {
        const eventId = frames[0].event;
        // Find all UserItemInterest documents where the item matches the deleted event
        const docsToModify = await Interest.userItemInterests.find({ item: eventId }).toArray();
        // Map these documents to frames that carry enough information for the 'then' clause
        return new Frames(...docsToModify.map(doc => ({
            item: eventId, // Pass `item` directly to removeItemInterest
            user: doc.user // User who expressed interest
        })));
    },
    then: actions(
        // Remove the specific user-item interest for each user/item pair found
        [Interest.removeItemInterest, { user: 'user', item: 'item' }]
    ),
});

// When an Event is deleted, all Reviews targeting it should be deleted.
export const CascadeEventDeletionToReviews: Sync = ({ event }) => ({
    when: actions(
        [Event.deleteEvent, {}, { event }] // When an event is deleted
    ),
    where: async (frames) => {
        const eventId = frames[0].event;
        // Find all Review documents where the target item matches the deleted event
        const docsToModify = await Review.reviews.find({ target: eventId }).toArray();
        // Map these documents to frames for the 'then' clause
        return new Frames(...docsToModify.map(doc => ({
            item: eventId, // Pass `item` directly to removeReview
            user: doc.reviewer // Reviewer ID
        })));
    },
    then: actions(
        // Remove the specific review for each user/item pair found
        [Review.removeReview, { user: 'user', item: 'item' }]
    ),
});
```

---

## `passthrough.ts` Configuration (Updated)

All user-facing API interactions (both actions and queries) are now handled by explicit synchronizations for proper authorization and custom logic. Therefore, they should all be in the `exclusions` list.

```typescript
// file: passthrough.ts

// These routes will bypass the synchronization engine and directly call
// the corresponding concept action/query. For security and consistent authorization,
// it's generally recommended to exclude all user-facing API endpoints
// and handle them through explicit synchronization rules.
export const inclusions = {
  // No public, non-sensitive, read-only endpoints are explicitly included
  // as all interactions are now routed through syncs for authorization.
  // If you *did* have truly public queries that need no authentication,
  // you would list them here, e.g.: "/Event/_getAllEvents": "Public listing of all events"
};

// These routes will be explicitly excluded from direct passthrough.
// Instead, a `Requesting.request` action will be fired, which needs to be
// handled by explicit synchronization rules. This is the recommended approach
// for all user-facing actions and queries that require authentication/authorization
// or custom response logic.
export const exclusions = [
  // UserAuthentication Concept (all actions and queries)
  "/UserAuthentication/register",
  "/UserAuthentication/authenticate",
  "/UserAuthentication/_getUsername",
  "/UserAuthentication/_getUserByUsername",
  // Custom login/logout paths
  "/login",
  "/logout",

  // LikertSurvey Concept (all actions and queries)
  "/LikertSurvey/createSurvey",
  "/LikertSurvey/addQuestion",
  "/LikertSurvey/submitResponse",
  "/LikertSurvey/updateResponse",
  "/LikertSurvey/_getSurveyQuestions",
  "/LikertSurvey/_getSurveyResponses",
  "/LikertSurvey/_getRespondentAnswers",

  // Event Concept (all actions and queries)
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

  // Friending Concept (all actions and queries)
  "/Friending/sendFriendRequest",
  "/Friending/acceptFriendRequest",
  "/Friending/removeFriendRequest",
  "/Friending/removeFriend",
  "/Friending/_getFriends",
  "/Friending/_getIncomingRequests",
  "/Friending/_getOutgoingRequests",

  // UserInterest Concept (all actions and queries)
  "/UserInterest/addPersonalInterest",
  "/UserInterest/removePersonalInterest",
  "/UserInterest/addItemInterest",
  "/UserInterest/removeItemInterest",
  "/UserInterest/_getPersonalInterests",
  "/UserInterest/_getItemInterests",
  "/UserInterest/_getUsersInterestedInItems",

  // Reviewing Concept (all actions and queries)
  "/Reviewing/addReview",
  "/Reviewing/removeReview",
  "/Reviewing/modifyReview",
  "/Reviewing/_getReview",
  "/Reviewing/_getReviewsByItem",
  "/Reviewing/_getReviewsByUser",
];
```

# prompt: use the [@files-syncs](@files.md) implementation of syncs as an example for the friend syncs. only output the friend related syncs, no other concepts or actions that are unrelated!
# response:

Here are the specific synchronizations for the `Friending` concept, following the requested format (no helpers, direct syntax as in the `auth.sync.ts` example, and only including actions, excluding queries).

First, let's ensure the `Friending` concept specification is clear on its actions and their arguments.

## Updated Concept: Friending \[User]

*   **concept**: Friending \[User]
*   **purpose**: enable users to establish and manage mutual social connections
*   **principle**: a user can send a friend request to another user; they may choose to remove this request before the target user takes action; the recipient of a friend request can choose to accept or remove it; once a request is accepted, two users become friends; friendship may be revoked.
*   **state**:
    *   a set of Users with
        *   a set of friends Users
        *   a set of incomingRequests Users
        *   a set of outgoingRequests Users
*   **actions**:
    *   sendFriendRequest (user: User, target: User)
        *   requires: user and target are not existing friends, user has not already sent a request to target, target has not sent a request to user.
        *   effects: target is added to the set of the user's outgoing requests; user is added to the set of target's incoming requests.
    *   acceptFriendRequest (requester: User, target: User)
        *   requires: requester has sent a friend request to target, requester and target are not friends
        *   effects: requester and target are added to each other's set of friends, they are both removed from the other's set of incoming/outgoingRequests
    *   removeFriendRequest (requester: User, target: User)
        *   requires: requester has sent a friend request to target, requester and target are not friends
        *   effects: requester is removed from the target's set of incomingRequests, target is removed the requester's set of outgoingRequests
    *   removeFriend (user: User, friend: User): ()
        *   requires: user and friend are friends with each other
        *   effects: user and friends are both removed from each other's set of friends
*   **queries**:
    *   `_getFriends (user: User): (friend: User)`
    *   `_getIncomingRequests (user: User): (requester: User)`
    *   `_getOutgoingRequests (user: User): (target: User)`

***

## `src/syncs/friending.sync.ts` - Friending Concept Synchronizations

This file should contain *only* the `Friending` related syncs.

```typescript
// file: src/syncs/friending.sync.ts
import { actions, Frames, Sync } from "@engine";
import { Requesting } from "@concepts/Requesting/RequestingConcept.ts";
import UserAuthenticationConcept from "@concepts/UserAuthentication/UserAuthenticationConcept.ts";
import SessioningConcept from "@concepts/Sessioning/SessioningConcept.ts";
import FriendingConcept from "@concepts/Friending/FriendingConcept.ts";

// Aliases for cleaner sync syntax
const Auth = UserAuthenticationConcept;
const Session = SessioningConcept;
const Friend = FriendingConcept;

// --- Friending Action Syncs ---

// sendFriendRequest (user: User, target: User)
// Frontend request will typically send a targetUsername, which needs to be resolved.
export const RequestSendFriendRequest: Sync = ({ request, session, targetUsername }) => ({
  when: actions([Requesting.request, { path: "/Friending/sendFriendRequest", session, targetUsername }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames(); // Unauthenticated request

    // Resolve targetUsername to targetUser ID
    frames = await frames.query(Auth._getUserByUsername, { username: frames[0].targetUsername }, { user: 'targetUser' });
    if (frames.length === 0) return new Frames({ error: `User with username '${frames[0].targetUsername}' not found.` });

    return frames.filter(f => f.currentUser !== f.targetUser); // Prevent self-friending
  },
  then: actions([Friend.sendFriendRequest, { user: 'currentUser', target: 'targetUser' }]),
});

export const SendFriendRequestSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/sendFriendRequest" }, { request }],
    [Friend.sendFriendRequest, {}, {}], // Friend.sendFriendRequest returns Empty {} on success
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const SendFriendRequestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/sendFriendRequest" }, { request }],
    [Friend.sendFriendRequest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// acceptFriendRequest (requester: User, target: User)
// The current user (from session) is the 'target' accepting the request.
export const RequestAcceptFriendRequest: Sync = ({ request, session, requester }) => ({
  when: actions([Requesting.request, { path: "/Friending/acceptFriendRequest", session, requester }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames(); // Unauthenticated request
    // Ensure requester is not the current user
    return frames.filter(f => f.currentUser !== f.requester);
  },
  then: actions([Friend.acceptFriendRequest, { requester: 'requester', target: 'currentUser' }]),
});

export const AcceptFriendRequestSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/acceptFriendRequest" }, { request }],
    [Friend.acceptFriendRequest, {}, {}], // Friend.acceptFriendRequest returns Empty {} on success
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const AcceptFriendRequestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/acceptFriendRequest" }, { request }],
    [Friend.acceptFriendRequest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// removeFriendRequest (requester: User, target: User)
// Allows either the requester (sender) or target (receiver) to cancel a pending request.
export const RequestRemoveFriendRequest: Sync = ({ request, session, requester, target }) => ({
  when: actions([Requesting.request, { path: "/Friending/removeFriendRequest", session, requester, target }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames(); // Unauthenticated request
    // Authorize: current user must be either the requester or the target
    return frames.filter(f => f.currentUser === f.requester || f.currentUser === f.target);
  },
  then: actions([Friend.removeFriendRequest, { requester: 'requester', target: 'target' }]),
});

export const RemoveFriendRequestSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/removeFriendRequest" }, { request }],
    [Friend.removeFriendRequest, {}, {}], // Friend.removeFriendRequest returns Empty {} on success
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const RemoveFriendRequestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/removeFriendRequest" }, { request }],
    [Friend.removeFriendRequest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// removeFriend (user: User, friend: User): ()
// The current user (from session) is the 'user' removing the 'friend'.
export const RequestRemoveFriend: Sync = ({ request, session, friend }) => ({
  when: actions([Requesting.request, { path: "/Friending/removeFriend", session, friend }, { request }]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: 'currentUser' });
    if (frames.length === 0) return new Frames(); // Unauthenticated request
    // Ensure current user is not trying to remove themselves as a friend (implicitly handled by concept)
    return frames.filter(f => f.currentUser !== f.friend);
  },
  then: actions([Friend.removeFriend, { user: 'currentUser', friend: 'friend' }]),
});

export const RemoveFriendSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/removeFriend" }, { request }],
    [Friend.removeFriend, {}, {}], // Friend.removeFriend returns Empty {} on success
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const RemoveFriendErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Friending/removeFriend" }, { request }],
    [Friend.removeFriend, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```

***

## `passthrough.ts` Configuration (Updated for Friending actions)

This configuration ensures that all `Friending` actions are routed through the synchronizations defined above, providing centralized authentication and authorization.

```typescript
// file: passthrough.ts

// These routes will bypass the synchronization engine and directly call
// the corresponding concept action/query. For security and consistent authorization,
// it's generally recommended to exclude all user-facing API endpoints
// and handle them through explicit synchronization rules.
export const inclusions = {
  // Add any truly public, non-sensitive, read-only endpoints here if they exist.
  // For this exercise, all user-facing paths require syncs.
};

// These routes will be explicitly excluded from direct passthrough.
// Instead, a `Requesting.request` action will be fired, which needs to be
// handled by explicit synchronization rules. This is the recommended approach
// for all user-facing actions and queries that require authentication/authorization
// or custom response logic.
export const exclusions = [
  // ... (Other Concept exclusions from previous responses) ...

  // Friending Concept (all actions and queries are typically authenticated/authorized)
  "/Friending/sendFriendRequest",
  "/Friending/acceptFriendRequest",
  "/Friending/removeFriendRequest",
  "/Friending/removeFriend",
  "/Friending/_getFriends", // Query requiring authentication to view own friends
  "/Friending/_getIncomingRequests", // Query requiring authentication to view own requests
  "/Friending/_getOutgoingRequests", // Query requiring authentication to view own requests

  // ... (Other Concept exclusions will follow this pattern) ...
];
```