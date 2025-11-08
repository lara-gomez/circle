---
timestamp: 'Fri Nov 07 2025 15:32:39 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_153239.109090cc.md]]'
content_id: faa203538158fb762c9f75707d9148a2d3505fc4970be825b6e0c8ef8267b5fc
---

# response:

Here's the updated `Friending` concept specification and the `app.sync.ts` file with all synchronizations for actions (excluding queries, and not using helper functions), followed by the updated `passthrough.ts` configuration.

First, let's confirm the `Friending` concept specification with explicit queries, as implied by the `api-syncs.md` document for consistency.

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

***

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
