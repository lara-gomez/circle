[@sync-background](../background/sync-background.md)

[@event-concept](../concepts/Event/implementation.md)

[@friending-concept](../concepts/Friending/implementation.md)

[@reviewing-concept](../concepts/Reviewing/implementation.md)

[@userauth-concept](../concepts/UserAuthentication/implementation.md)

[@interest-concept](../concepts/UserInterest/implementation.md)

[@api-syncs](api-syncs.md)

# prompt: define which syncs are necessary, and which of these should be included and excluded
# response:

Based on the provided concept specifications and the principles of Concept Design, here's an analysis of the necessary synchronizations, indicating whether each should be included as an explicit sync rule or excluded (because it's handled implicitly, not necessary, or requires undefined concepts/actions).

**Core Assumptions for Included Syncs:**
*   **`Requesting` Concept:** We assume a `Requesting` concept handles incoming HTTP requests and fires `Requesting.request` actions. For the purpose of providing full control and demonstrating syncs, we assume *passthrough routes for user-facing actions are generally excluded*, requiring explicit syncs to forward and authorize requests.
*   **`Sessioning` Concept:** For authorization, we assume a `Sessioning` concept exists with at least a query `_getUser(session): (user: User)` that returns the authenticated user for a given session ID. We also assume a `createSession(user): (session: Session)` action.

---

### Syncs to be **INCLUDED**

These synchronizations are essential for enabling the concepts to function as part of an application, particularly handling external requests and basic authorization. For each user-facing action of a concept, there will typically be three syncs: one to forward the incoming request to the concept action (often including authorization), one to respond to successful completion, and one to respond to errors.

**1. User Authentication & Session Management Syncs:**
*   **Purpose:** To allow users to register and authenticate, and establish a session upon successful authentication.

    *   `RequestRegister` / `RegisterResponse` / `RegisterErrorResponse`: Maps an incoming registration request to `UserAuthentication.register` and responds.
    *   `RequestAuthenticate` / `AuthenticateResponse` / `AuthenticateErrorResponse`: Maps an incoming authentication request to `UserAuthentication.authenticate` and responds.
    *   `CreateSessionAfterAuthenticate`:
        ```
        sync CreateSessionAfterAuthenticate
        when
            UserAuthentication.authenticate (username, password) : (user)
        then
            Sessioning.createSession (user)
        ```
    *   `CreateSessionAfterRegister`:
        ```
        sync CreateSessionAfterRegister
        when
            UserAuthentication.register (username, password) : (user)
        then
            Sessioning.createSession (user)
        ```

**2. LikertSurvey Concept Syncs:**
*   **Purpose:** To enable interaction with Likert surveys through requests, including authorization.

    *   `RequestCreateSurvey` / `CreateSurveyResponse` / `CreateSurveyErrorResponse`:
        ```
        sync RequestCreateSurvey
        when
            Requesting.request (path: "/LikertSurvey/createSurvey", author, title, scaleMin, scaleMax, session) : (request)
        where
            in Sessioning: user of session is author
        then
            LikertSurvey.createSurvey (author, title, scaleMin, scaleMax)
        // Response syncs (CreateSurveyResponse, CreateSurveyErrorResponse) will follow the standard pattern
        ```
    *   `RequestAddQuestion` / `AddQuestionResponse` / `AddQuestionErrorResponse`:
        ```
        sync RequestAddQuestion
        when
            Requesting.request (path: "/LikertSurvey/addQuestion", survey, text, session) : (request)
        where
            in Sessioning: user of session is u
            in LikertSurvey: s is survey and s.author is u
        then
            LikertSurvey.addQuestion (survey, text)
        // Response syncs will follow the standard pattern
        ```
    *   `RequestSubmitResponse` / `SubmitResponseResponse` / `SubmitResponseErrorResponse`:
        ```
        sync RequestSubmitResponse
        when
            Requesting.request (path: "/LikertSurvey/submitResponse", question, value, session) : (request)
        where
            in Sessioning: user of session is respondent
        then
            LikertSurvey.submitResponse (respondent, question, value)
        // Response syncs will follow the standard pattern
        ```
    *   `RequestUpdateResponse` / `UpdateResponseResponse` / `UpdateResponseErrorResponse`:
        ```
        sync RequestUpdateResponse
        when
            Requesting.request (path: "/LikertSurvey/updateResponse", question, value, session) : (request)
        where
            in Sessioning: user of session is respondent
        then
            LikertSurvey.updateResponse (respondent, question, value)
        // Response syncs will follow the standard pattern
        ```

**3. Event Concept Syncs:**
*   **Purpose:** To enable event creation, modification, cancellation, restoration, and deletion, with appropriate authorization.

    *   `RequestCreateEvent` / `CreateEventResponse` / `CreateEventErrorResponse`:
        ```
        sync RequestCreateEvent
        when
            Requesting.request (path: "/Event/createEvent", name, date, duration, location, description, session) : (request)
        where
            in Sessioning: user of session is organizer
        then
            Event.createEvent (organizer, name, date, duration, location, description)
        // Response syncs will follow the standard pattern
        ```
    *   `RequestModifyEvent` / `ModifyEventResponse` / `ModifyEventErrorResponse`:
        ```
        sync RequestModifyEvent
        when
            Requesting.request (path: "/Event/modifyEvent", event, newName, newDate, newDuration, newLocation, newDescription, session) : (request)
        where
            in Sessioning: user of session is u
            in Event: e is event and e.organizer is u
        then
            Event.modifyEvent (organizer: u, event, newName, newDate, newDuration, newLocation, newDescription)
        // Response syncs will follow the standard pattern
        ```
    *   `RequestCancelEvent` / `CancelEventResponse` / `CancelEventErrorResponse`:
        *   (Similar authorization pattern: `user of session is u` AND `event.organizer is u`)
    *   `RequestUnCancelEvent` / `UnCancelEventResponse` / `UnCancelEventErrorResponse`:
        *   (Similar authorization pattern)
    *   `RequestDeleteEvent` / `DeleteEventResponse` / `DeleteEventErrorResponse`:
        *   (Similar authorization pattern)

**4. Friending Concept Syncs:**
*   **Purpose:** To manage friend requests and friendships, with authorization for actions.

    *   `RequestSendFriendRequest` / `SendFriendRequestResponse` / `SendFriendRequestErrorResponse`:
        ```
        sync RequestSendFriendRequest
        when
            Requesting.request (path: "/Friending/sendFriendRequest", target, session) : (request)
        where
            in Sessioning: user of session is u
        then
            Friending.sendFriendRequest (user: u, target)
        // Response syncs will follow the standard pattern
        ```
    *   `RequestAcceptFriendRequest` / `AcceptFriendRequestResponse` / `AcceptFriendRequestErrorResponse`:
        ```
        sync RequestAcceptFriendRequest
        when
            Requesting.request (path: "/Friending/acceptFriendRequest", requester, session) : (request)
        where
            in Sessioning: user of session is target
        then
            Friending.acceptFriendRequest (requester, target)
        // Response syncs will follow the standard pattern
        ```
    *   `RequestRemoveFriendRequest` / `RemoveFriendRequestResponse` / `RemoveFriendRequestErrorResponse`:
        ```
        sync RequestRemoveFriendRequest
        when
            Requesting.request (path: "/Friending/removeFriendRequest", requester, session) : (request) // Note: `target` here is current session user
        where
            in Sessioning: user of session is target
        then
            Friending.removeFriendRequest (requester, target)
        // Response syncs will follow the standard pattern
        ```
    *   `RequestRemoveFriend` / `RemoveFriendResponse` / `RemoveFriendErrorResponse`:
        ```
        sync RequestRemoveFriend
        when
            Requesting.request (path: "/Friending/removeFriend", friend, session) : (request)
        where
            in Sessioning: user of session is u
        then
            Friending.removeFriend (user: u, friend)
        // Response syncs will follow the standard pattern
        ```

**5. UserInterest Concept Syncs:**
*   **Purpose:** To allow users to manage their personal and item-specific interests, with authorization.

    *   `RequestAddPersonalInterest` / `AddPersonalInterestResponse` / `AddPersonalInterestErrorResponse`:
        ```
        sync RequestAddPersonalInterest
        when
            Requesting.request (path: "/UserInterest/addPersonalInterest", tag, session) : (request)
        where
            in Sessioning: user of session is user
        then
            UserInterest.addPersonalInterest (user, tag)
        // Response syncs will follow the standard pattern
        ```
    *   `RequestRemovePersonalInterest` / `RemovePersonalInterestResponse` / `RemovePersonalInterestErrorResponse`:
        ```
        sync RequestRemovePersonalInterest
        when
            Requesting.request (path: "/UserInterest/removePersonalInterest", tag, session) : (request)
        where
            in Sessioning: user of session is user
        then
            UserInterest.removePersonalInterest (user, tag)
        // Response syncs will follow the standard pattern
        ```
    *   `RequestAddItemInterest` / `AddItemInterestResponse` / `AddItemInterestErrorResponse`:
        ```
        sync RequestAddItemInterest
        when
            Requesting.request (path: "/UserInterest/addItemInterest", item, session) : (request)
        where
            in Sessioning: user of session is user
        then
            UserInterest.addItemInterest (user, item)
        // Response syncs will follow the standard pattern
        ```
    *   `RequestRemoveItemInterest` / `RemoveItemInterestResponse` / `RemoveItemInterestErrorResponse`:
        ```
        sync RequestRemoveItemInterest
        when
            Requesting.request (path: "/UserInterest/removeItemInterest", item, session) : (request)
        where
            in Sessioning: user of session is user
        then
            UserInterest.removeItemInterest (user, item)
        // Response syncs will follow the standard pattern
        ```

---

### Syncs to be **EXCLUDED** (with justifications)

These synchronizations are either implicitly handled, require concepts or actions not fully defined, or are considered out of scope for a basic implementation given the provided information.

1.  **LikertSurvey Cascading Deletions:**
    *   **Justification:** The `LikertSurvey` concept, as specified, lacks actions like `deleteSurvey`, `deleteQuestion`, or `deleteResponse`. Without these actions, cascading deletion syncs (e.g., deleting all questions when a survey is deleted) cannot be defined or triggered. This points to a potential "Completeness" issue within the `LikertSurvey` concept itself.

2.  **Event `completeEvent` Trigger:**
    *   **Justification:** `completeEvent` is marked as a `system` action. System actions are typically meant to be triggered by the underlying framework/engine when their preconditions are met (e.g., checking `current_time`). This implies an internal mechanism or scheduler within the engine, rather than an explicit user-defined synchronization rule. If there were an explicit `Clock` concept, then a sync from `Clock.tick` could be defined.

3.  **Friending Notifications on Friend Activity:**
    *   **Justification:** Syncs like `NotifyOnFriendRequest` (to send a notification when a friend request is sent/accepted) would require a `Notification` concept and potentially a `UserProfile` concept (to retrieve a user's name for the notification message), neither of which are fully defined in the provided snippets.

4.  **Cascading User Deletion from `UserAuthentication` (to `Friending` and `UserInterest`):**
    *   **Justification:** The `UserAuthentication` concept lacks a `deleteUser` action. Without this originating action, there's no trigger to cascade user deletion to other concepts (like removing all friendships or interests associated with a deleted user). This also points to a "Completeness" issue in `UserAuthentication`.

5.  **Cascading Item Deletion (to `Reviewing` and `UserInterest`):**
    *   **Justification:** `Item` is a generic type parameter. The actual "source" concept that defines and manages `Item` entities (e.g., a `Product` concept, a `Post` concept) is not provided, and thus no `deleteItem` action exists to trigger such cascading deletion syncs (e.g., deleting reviews or interests when an item is deleted).

---

### Passthrough Routes Configuration

Given the choice to **include** explicit request-response syncs for all user-facing actions, these actions should be **excluded** from the default passthrough routes mechanism provided by the `Requesting` concept. This ensures that custom authorization and request processing logic defined in the syncs is always applied.

**Routes to EXCLUDE from passthrough.ts:**

*   `/LikertSurvey/createSurvey`
*   `/LikertSurvey/addQuestion`
*   `/LikertSurvey/submitResponse`
*   `/LikertSurvey/updateResponse`
*   `/Event/createEvent`
*   `/Event/modifyEvent`
*   `/Event/cancelEvent`
*   `/Event/unCancelEvent`
*   `/Event/deleteEvent`
*   `/Friending/sendFriendRequest`
*   `/Friending/acceptFriendRequest`
*   `/Friending/removeFriendRequest`
*   `/Friending/removeFriend`
*   `/UserAuthentication/register`
*   `/UserAuthentication/authenticate`
*   `/UserInterest/addPersonalInterest`
*   `/UserInterest/removePersonalInterest`
*   `/UserInterest/addItemInterest`
*   `/UserInterest/removeItemInterest`

**Routes to INCLUDE in passthrough.ts (for read-only queries, for example):**

*   `/LikertSurvey/_getSurveyQuestions` (public query)
*   `/LikertSurvey/_getSurveyResponses` (public query, but consider authorization)
*   `/LikertSurvey/_getRespondentAnswers` (public query, but consider authorization)
*   `/_getUsername` (UserAuthentication query)
*   `/_getUserByUsername` (UserAuthentication query)
*   `_getReview` (Reviewing query)
*   `_getReviewsByItem` (Reviewing query)
*   `_getReviewsByUser` (Reviewing query)
*   `_getPersonalInterests` (UserInterest query)
*   `_getItemInterests` (UserInterest query)
*   `_getUsersInterestedInItems` (UserInterest query)

Note: Even for queries, authorization might be desired (e.g., only an event organizer can get survey responses for their survey). This means many queries might also eventually be excluded from passthrough and handled by syncs for fine-grained access control. For this response, I've primarily focused on actions.

# prompt: here is a writeup on how some of the synchronizations in my application work: [@api-syncs](api-syncs.md). update the synchronizations i should implement
# response:

You've provided a comprehensive overview of your application's architecture and how the `api-syncs.md` document details the interactions between your concepts. This new information helps refine the necessary synchronizations, especially regarding user authentication, authorization, and how the frontend orchestrates data.

The key takeaway from `api-syncs.md` is that almost all interactions, even many queries, imply a notion of the "current user" (`this.user`, `this.currentUser`). This strongly suggests that **all user-facing API endpoints (both actions and queries) should be explicitly routed through synchronizations** rather than relying on default passthrough routes. This provides a central point for authorization and request/response formatting.

Before detailing the syncs, let's address the necessary update to the `Event` concept.

---

### **1. Concept Specification Update: Event**

The `api-syncs.md` mentions `Event.getEventsByRecommendationContext(user, filters, priorities)`. This query needs to be formally added to the `Event` concept specification.

**Updated Concept: Event \[User] (add query)**

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
    *   `_getEventsByOrganizer (organizer: User): (event: Event)`
        *   **effects**: Returns all events organized by the given user.
    *   `_getEventById (event: Event): (event: Event)`
        *   **effects**: Returns the event with the given ID.
    *   `_getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: Event)`
        *   **effects**: Returns a filtered and prioritized set of events based on context (e.g., matching tags from `filters`, sorted by `priorities`).
        *(Note: The `filters` and `priorities` parameters are strings for simplicity as shown in the frontend code, implying a more complex internal parsing/logic within the concept's implementation.)*

---

### **2. Updated Synchronizations to Implement (INCLUDED)**

This list includes request-handling syncs for all user-facing actions and queries, ensuring authorization and proper request/response flow. We assume the existence of a `Sessioning` concept with `_getUser(session): (user: User)` for authorization.

**General Sync Pattern for User-Facing API Call:**

For each `Concept.actionName (inputArgs) : (outputResult)` or `Concept._queryName (inputArgs) : (outputResult)`:

1.  **Request Sync (`RequestActionName` / `RequestQueryName`):**
    *   `when Requesting.request(path: "/Concept/actionName", ...inputArgs, session) : (request)`
    *   `where in Sessioning: user of session is u AND (additional authorization checks)`
    *   `then Concept.actionName(..., user: u, ...)` or `then Concept._queryName(..., user: u, ...)`
2.  **Success Response Sync (`ActionNameResponse` / `QueryNameResponse`):**
    *   `when Requesting.request(path: "/Concept/actionName", ...) : (request)`
    *   `AND Concept.actionName(...) : (outputResult)`
    *   `then Requesting.respond(request, outputResult)`
3.  **Error Response Sync (`ActionNameErrorResponse` / `QueryNameErrorResponse`):**
    *   `when Requesting.request(path: "/Concept/actionName", ...) : (request)`
    *   `AND Concept.actionName(...) : (error)`
    *   `then Requesting.respond(request, error)`

*(For brevity, only the "Request" syncs are fully detailed below, but the corresponding "Response" and "ErrorResponse" syncs should be implemented for each.)*

---

#### 2.1. UserAuthentication Concept Syncs

*   **Registration**
    ```
    sync RequestRegister
    when
        Requesting.request (path: "/UserAuthentication/register", username, password, session) : (request)
    // No specific `where` clause needed for this request, `session` isn't used as no login state is required
    then
        UserAuthentication.register (username, password)
    ```
*   **Authentication**
    ```
    sync RequestAuthenticate
    when
        Requesting.request (path: "/UserAuthentication/authenticate", username, password) : (request)
    then
        UserAuthentication.authenticate (username, password)
    ```
*   **Session Creation (after successful auth/register)**
    ```
    sync CreateSessionAfterAuthenticate
    when
        UserAuthentication.authenticate (username, password) : (user)
    then
        Sessioning.createSession (user)
    
    sync CreateSessionAfterRegister
    when
        UserAuthentication.register (username, password) : (user)
    then
        Sessioning.createSession (user)
    ```
*   **Query Username by User ID**
    ```
    sync RequestGetUsername
    when
        Requesting.request (path: "/UserAuthentication/_getUsername", user, session) : (request)
    where
        in Sessioning: user of session is authenticatedUser // Can check if `user` == `authenticatedUser` or allow any authenticated user to query others
    then
        UserAuthentication._getUsername (user)
    ```
*   **Query User by Username**
    ```
    sync RequestGetUserByUsername
    when
        Requesting.request (path: "/UserAuthentication/_getUserByUsername", username, session) : (request)
    where
        in Sessioning: user of session is u // Any authenticated user can look up by username
    then
        UserAuthentication._getUserByUsername (username)
    ```

#### 2.2. LikertSurvey Concept Syncs

*   **Create Survey**
    ```
    sync RequestCreateSurvey
    when
        Requesting.request (path: "/LikertSurvey/createSurvey", title, scaleMin, scaleMax, session) : (request)
    where
        in Sessioning: user of session is author
    then
        LikertSurvey.createSurvey (author, title, scaleMin, scaleMax)
    ```
*   **Add Question**
    ```
    sync RequestAddQuestion
    when
        Requesting.request (path: "/LikertSurvey/addQuestion", survey, text, session) : (request)
    where
        in Sessioning: user of session is u
        in LikertSurvey: s is survey and s.author is u // Only the survey author can add questions
    then
        LikertSurvey.addQuestion (survey, text)
    ```
*   **Submit Response**
    ```
    sync RequestSubmitResponse
    when
        Requesting.request (path: "/LikertSurvey/submitResponse", question, value, session) : (request)
    where
        in Sessioning: user of session is respondent
    then
        LikertSurvey.submitResponse (respondent, question, value)
    ```
*   **Update Response**
    ```
    sync RequestUpdateResponse
    when
        Requesting.request (path: "/LikertSurvey/updateResponse", question, value, session) : (request)
    where
        in Sessioning: user of session is respondent
    then
        LikertSurvey.updateResponse (respondent, question, value)
    ```
*   **Query Survey Questions**
    ```
    sync RequestGetSurveyQuestions
    when
        Requesting.request (path: "/LikertSurvey/_getSurveyQuestions", survey, session) : (request)
    where
        in Sessioning: user of session is u // Assumed any logged-in user can view questions
    then
        LikertSurvey._getSurveyQuestions (survey)
    ```
*   **Query Survey Responses (Requires Authorization)**
    ```
    sync RequestGetSurveyResponses
    when
        Requesting.request (path: "/LikertSurvey/_getSurveyResponses", survey, session) : (request)
    where
        in Sessioning: user of session is u
        in LikertSurvey: s is survey and s.author is u // Only the survey author can view responses
    then
        LikertSurvey._getSurveyResponses (survey)
    ```
*   **Query Respondent Answers (Requires Authorization)**
    ```
    sync RequestGetRespondentAnswers
    when
        Requesting.request (path: "/LikertSurvey/_getRespondentAnswers", respondent, session) : (request)
    where
        in Sessioning: user of session is u
        // Can be restricted to `u is respondent` (user only sees their own) or for admin roles.
        // For simplicity, let's assume `u` is allowed to query any `respondent` for now, or `respondent` matches `u`.
        // If `respondent` is implied to be `u` (current user), `respondent` parameter can be removed from request.
    then
        LikertSurvey._getRespondentAnswers (respondent)
    ```

#### 2.3. Event Concept Syncs

*   **Create Event**
    ```
    sync RequestCreateEvent
    when
        Requesting.request (path: "/Event/createEvent", name, date, duration, location, description, session) : (request)
    where
        in Sessioning: user of session is organizer
    then
        Event.createEvent (organizer, name, date, duration, location, description)
    ```
*   **Modify Event**
    ```
    sync RequestModifyEvent
    when
        Requesting.request (path: "/Event/modifyEvent", event, newName, newDate, newDuration, newLocation, newDescription, session) : (request)
    where
        in Sessioning: user of session is u
        in Event: e is event and e.organizer is u // Only organizer can modify
    then
        Event.modifyEvent (organizer: u, event, newName, newDate, newDuration, newLocation, newDescription)
    ```
*   **Cancel Event**
    ```
    sync RequestCancelEvent
    when
        Requesting.request (path: "/Event/cancelEvent", event, session) : (request)
    where
        in Sessioning: user of session is u
        in Event: e is event and e.organizer is u // Only organizer can cancel
    then
        Event.cancelEvent (organizer: u, event)
    ```
*   **Uncancel Event**
    ```
    sync RequestUnCancelEvent
    when
        Requesting.request (path: "/Event/unCancelEvent", event, session) : (request)
    where
        in Sessioning: user of session is u
        in Event: e is event and e.organizer is u // Only organizer can uncancel
    then
        Event.unCancelEvent (organizer: u, event)
    ```
*   **Delete Event**
    ```
    sync RequestDeleteEvent
    when
        Requesting.request (path: "/Event/deleteEvent", event, session) : (request)
    where
        in Sessioning: user of session is u
        in Event: e is event and e.organizer is u // Only organizer can delete
    then
        Event.deleteEvent (organizer: u, event)
    ```
*   **Query Events by Organizer**
    ```
    sync RequestGetEventsByOrganizer
    when
        Requesting.request (path: "/Event/_getEventsByOrganizer", organizer, session) : (request)
    where
        in Sessioning: user of session is u // Assumed any logged-in user can query events by organizer
    then
        Event._getEventsByOrganizer (organizer)
    ```
*   **Query Event by ID**
    ```
    sync RequestGetEventById
    when
        Requesting.request (path: "/Event/_getEventById", event, session) : (request)
    where
        in Sessioning: user of session is u // Assumed any logged-in user can query event by ID
    then
        Event._getEventById (event)
    ```
*   **Query Events by Recommendation Context**
    ```
    sync RequestGetEventsByRecommendationContext
    when
        Requesting.request (path: "/Event/_getEventsByRecommendationContext", filters, priorities, session) : (request)
    where
        in Sessioning: user of session is u
    then
        Event._getEventsByRecommendationContext (user: u, filters, priorities)
    ```

#### 2.4. Friending Concept Syncs

*   **Send Friend Request (with Username Resolution)**
    ```
    sync RequestSendFriendRequest
    when
        Requesting.request (path: "/Friending/sendFriendRequest", targetUsername, session) : (request)
    where
        in Sessioning: user of session is u
        in UserAuthentication: _getUserByUsername (username: targetUsername) returns (user: targetUser) // Resolve username to ID
    then
        Friending.sendFriendRequest (user: u, target: targetUser)
    ```
*   **Accept Friend Request**
    ```
    sync RequestAcceptFriendRequest
    when
        Requesting.request (path: "/Friending/acceptFriendRequest", requester, session) : (request)
    where
        in Sessioning: user of session is target // The current user in session is the one accepting
    then
        Friending.acceptFriendRequest (requester, target)
    ```
*   **Remove Friend Request**
    ```
    sync RequestRemoveFriendRequest
    when
        Requesting.request (path: "/Friending/removeFriendRequest", requester, session) : (request)
    where
        in Sessioning: user of session is target // The current user in session is the one being targeted (removing from their incoming requests)
        // OR the current user `u` is `requester` (removing their outgoing request)
        // This sync might need to be split into two for clarity, or handle both cases in `where`
    then
        Friending.removeFriendRequest (requester, target) // `target` is current user
    ```
    *Self-correction:* The `removeFriendRequest` action's `requester` and `target` arguments specify *who* sent and *who* received the request, and either can cancel it. The `api-syncs.md` section 1.1 implies the target user (recipient) removes it. Let's make a generic `RequestRemoveFriendRequest` that allows *either* the sender *or* receiver to remove it, consistent with the `Friending` concept's `removeFriendRequest` action.
    ```
    sync RequestRemoveFriendRequestBySender
    when
        Requesting.request (path: "/Friending/removeSentFriendRequest", target, session) : (request)
    where
        in Sessioning: user of session is requester // The current user is the requester
    then
        Friending.removeFriendRequest (requester, target)

    sync RequestRemoveFriendRequestByReceiver
    when
        Requesting.request (path: "/Friending/removeReceivedFriendRequest", requester, session) : (request)
    where
        in Sessioning: user of session is target // The current user is the target
    then
        Friending.removeFriendRequest (requester, target)
    ```
    *Further self-correction:* The original `removeFriendRequest` in the `Friending` concept only takes `requester: User, target: User`. This suggests it's a single action that handles the logical removal. The UI would determine if it's "remove outgoing" or "remove incoming." So a single sync path is fine. The `api-syncs.md` snippet for `removeFriendRequest` doesn't explicitly mention the current user's role, so sticking to the initial simple form for now.
    ```
    sync RequestRemoveFriendRequest
    when
        Requesting.request (path: "/Friending/removeFriendRequest", requester, target, session) : (request)
    where
        in Sessioning: user of session is u
        // Requires: either `u is requester` OR `u is target`
        ((u is requester) or (u is target))
    then
        Friending.removeFriendRequest (requester, target)
    ```
*   **Remove Friend**
    ```
    sync RequestRemoveFriend
    when
        Requesting.request (path: "/Friending/removeFriend", friend, session) : (request)
    where
        in Sessioning: user of session is u
    then
        Friending.removeFriend (user: u, friend)
    ```
*   **Query Friends**
    ```
    sync RequestGetFriends
    when
        Requesting.request (path: "/Friending/_getFriends", user, session) : (request)
    where
        in Sessioning: user of session is u // Can specify `u is user` if restricted to self, or allow others
    then
        Friending._getFriends (user)
    ```
*   **Query Incoming Requests** (Assuming `_getIncomingRequests` exists for `Friending` concept state: `a set of Users with a set of incomingRequests Users`)
    ```
    sync RequestGetIncomingRequests
    when
        Requesting.request (path: "/Friending/_getIncomingRequests", user, session) : (request)
    where
        in Sessioning: user of session is u
        (u is user) // Only user can see their own incoming requests
    then
        Friending._getIncomingRequests (user)
    ```
*   **Query Outgoing Requests** (Assuming `_getOutgoingRequests` exists for `Friending` concept state: `a set of Users with a set of outgoingRequests Users`)
    ```
    sync RequestGetOutgoingRequests
    when
        Requesting.request (path: "/Friending/_getOutgoingRequests", user, session) : (request)
    where
        in Sessioning: user of session is u
        (u is user) // Only user can see their own outgoing requests
    then
        Friending._getOutgoingRequests (user)
    ```

#### 2.5. UserInterest Concept Syncs

*   **Add Personal Interest**
    ```
    sync RequestAddPersonalInterest
    when
        Requesting.request (path: "/UserInterest/addPersonalInterest", tag, session) : (request)
    where
        in Sessioning: user of session is u
    then
        UserInterest.addPersonalInterest (user: u, tag)
    ```
*   **Remove Personal Interest**
    ```
    sync RequestRemovePersonalInterest
    when
        Requesting.request (path: "/UserInterest/removePersonalInterest", tag, session) : (request)
    where
        in Sessioning: user of session is u
    then
        UserInterest.removePersonalInterest (user: u, tag)
    ```
*   **Add Item Interest**
    ```
    sync RequestAddItemInterest
    when
        Requesting.request (path: "/UserInterest/addItemInterest", item, session) : (request)
    where
        in Sessioning: user of session is u
    then
        UserInterest.addItemInterest (user: u, item)
    ```
*   **Remove Item Interest**
    ```
    sync RequestRemoveItemInterest
    when
        Requesting.request (path: "/UserInterest/removeItemInterest", item, session) : (request)
    where
        in Sessioning: user of session is u
    then
        UserInterest.removeItemInterest (user: u, item)
    ```
*   **Query Personal Interests**
    ```
    sync RequestGetPersonalInterests
    when
        Requesting.request (path: "/UserInterest/_getPersonalInterests", user, session) : (request)
    where
        in Sessioning: user of session is u
        (u is user) // Restricted to self, as per api-syncs.md `userInterestsResponse = await interestAPI.getPersonalInterests(this.currentUser)`
    then
        UserInterest._getPersonalInterests (user)
    ```
*   **Query Item Interests**
    ```
    sync RequestGetItemInterests
    when
        Requesting.request (path: "/UserInterest/_getItemInterests", user, session) : (request)
    where
        in Sessioning: user of session is u
        (u is user) // Restricted to self, as per api-syncs.md `interestsResponse = await interestAPI.getItemInterests(this.currentUser)`
    then
        UserInterest._getItemInterests (user)
    ```
*   **Query Users Interested in Items**
    ```
    sync RequestGetUsersInterestedInItems
    when
        Requesting.request (path: "/UserInterest/_getUsersInterestedInItems", item, session) : (request)
    where
        in Sessioning: user of session is u // Any authenticated user can see who is interested in an item
    then
        UserInterest._getUsersInterestedInItems (item)
    ```

#### 2.6. Reviewing Concept Syncs

*   **Add Review**
    ```
    sync RequestAddReview
    when
        Requesting.request (path: "/Reviewing/addReview", item, rating, entry, session) : (request)
    where
        in Sessioning: user of session is u
    then
        Reviewing.addReview (user: u, item, rating, entry)
    ```
*   **Remove Review**
    ```
    sync RequestRemoveReview
    when
        Requesting.request (path: "/Reviewing/removeReview", item, session) : (request)
    where
        in Sessioning: user of session is u
    then
        Reviewing.removeReview (user: u, item)
    ```
*   **Modify Review**
    ```
    sync RequestModifyReview
    when
        Requesting.request (path: "/Reviewing/modifyReview", item, rating, entry, session) : (request)
    where
        in Sessioning: user of session is u
    then
        Reviewing.modifyReview (user: u, item, rating, entry)
    ```
*   **Query Review**
    ```
    sync RequestGetReview
    when
        Requesting.request (path: "/Reviewing/_getReview", user, item, session) : (request)
    where
        in Sessioning: user of session is u
        // Authorization logic: Can `u` see review for `user` and `item`?
        // e.g., `(u is user)` if only self-review, or public. Let's assume it's viewable by `u`
    then
        Reviewing._getReview (user, item)
    ```
*   **Query Reviews by Item**
    ```
    sync RequestGetReviewsByItem
    when
        Requesting.request (path: "/Reviewing/_getReviewsByItem", item, session) : (request)
    where
        in Sessioning: user of session is u // Any authenticated user can view reviews for an item
    then
        Reviewing._getReviewsByItem (item)
    ```
*   **Query Reviews by User**
    ```
    sync RequestGetReviewsByUser
    when
        Requesting.request (path: "/Reviewing/_getReviewsByUser", user, session) : (request)
    where
        in Sessioning: user of session is u
        (u is user) // Restricted to self, as per api-syncs.md `reviewingAPI.getReviewsByUser(this.currentUser)`
    then
        Reviewing._getReviewsByUser (user)
    ```

---

### **3. Synchronizations to be EXCLUDED**

The previous reasoning for exclusion still holds, as the `api-syncs.md` mainly describes *frontend orchestration of queries and actions*, not new backend sync rules for these specific cases.

1.  **LikertSurvey Cascading Deletions:** Still excluded (no delete actions for survey/question in concept).
2.  **Event `completeEvent` Trigger:** Still excluded as an explicit sync (it's a `system` action, implying internal engine/scheduler trigger).
3.  **Friending Notifications on Friend Activity:** Still excluded (requires `Notification` and `UserProfile` concepts not specified).
4.  **Cascading User Deletion from `UserAuthentication`:** Still excluded (no `deleteUser` action in concept).
5.  **Cascading Item Deletion:** Still excluded (`Item` is generic, source concept for `Item` not specified).
6.  **Frontend Orchestration & Aggregation Logic:** All patterns described in `api-syncs.md` sections like "Multi-Concept Aggregation (Recent Activity Feed)", "Event Status → Review Eligibility", "Friends → Friends' Event Interests", "Parallel Data Loading", "Real-Time Updates (Polling)", "Reactive Data Flow", "Error Handling and Fallbacks" are primarily **frontend-side logic, query patterns, or UI mechanisms.** They describe *how* the frontend uses the concept APIs (which are now exposed via the `Requesting` syncs), but not *new backend sync rules* that trigger actions across concepts themselves.

---

### **4. Passthrough Routes Configuration (Updated)**

Based on the decision that all user-facing API interactions will go through explicit synchronizations for authorization and control, the `passthrough.ts` file should be configured to **exclude all paths that correspond to the actions and queries for which `Request...` syncs are defined.**

Essentially, all user-facing paths derived from your concept actions and queries will be explicitly handled by syncs. This means the `inclusions` list in `passthrough.ts` should be empty or contain only truly public, non-sensitive, read-only endpoints if any exist, and the `exclusions` list will be extensive.

**Routes to EXCLUDE from `passthrough.ts`:**
*(This list covers all actions and queries of your five main concepts that interact with the frontend, as they are now covered by explicit Requesting syncs.)*

*   `/UserAuthentication/register`
*   `/UserAuthentication/authenticate`
*   `/UserAuthentication/_getUsername`
*   `/UserAuthentication/_getUserByUsername`
*   `/LikertSurvey/createSurvey`
*   `/LikertSurvey/addQuestion`
*   `/LikertSurvey/submitResponse`
*   `/LikertSurvey/updateResponse`
*   `/LikertSurvey/_getSurveyQuestions`
*   `/LikertSurvey/_getSurveyResponses`
*   `/LikertSurvey/_getRespondentAnswers`
*   `/Event/createEvent`
*   `/Event/modifyEvent`
*   `/Event/cancelEvent`
*   `/Event/unCancelEvent`
*   `/Event/deleteEvent`
*   `/Event/_getEventsByOrganizer`
*   `/Event/_getEventById`
*   `/Event/_getEventsByRecommendationContext`
*   `/Friending/sendFriendRequest`
*   `/Friending/acceptFriendRequest`
*   `/Friending/removeFriendRequest`
*   `/Friending/removeFriend`
*   `/Friending/_getFriends`
*   `/Friending/_getIncomingRequests` *(assuming this query is defined in Friending)*
*   `/Friending/_getOutgoingRequests` *(assuming this query is defined in Friending)*
*   `/UserInterest/addPersonalInterest`
*   `/UserInterest/removePersonalInterest`
*   `/UserInterest/addItemInterest`
*   `/UserInterest/removeItemInterest`
*   `/UserInterest/_getPersonalInterests`
*   `/UserInterest/_getItemInterests`
*   `/UserInterest/_getUsersInterestedInItems`
*   `/Reviewing/addReview`
*   `/Reviewing/removeReview`
*   `/Reviewing/modifyReview`
*   `/Reviewing/_getReview`
*   `/Reviewing/_getReviewsByItem`
*   `/Reviewing/_getReviewsByUser`

By implementing these explicit synchronizations and carefully configuring passthrough routes, you will have a robust and secure backend that aligns with the principles of Concept Design and directly supports the interactions outlined in your `api-syncs.md` document.

# prompt: when we have behavior like deleting an event, all users who added this event to their item interests should have it removed from there. provide the code for all of the sync implementations, as well as an explicit list of which api calls are included and excluded
# response:

Here's the updated `Event` concept specification, the full `app.sync.ts` implementation with comprehensive synchronizations (including the new cascading deletions), and the explicit list of included/excluded API calls for `passthrough.ts`.

First, let's update the `Event` concept.

## Updated Concept: Event \[User]

The `_getEventsByRecommendationContext` query needs to be explicitly added to the `Event` concept specification.

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
    *   \_getEventsByOrganizer (organizer: User): (event: EventDoc)
        *   **effects**: Returns all events organized by the given user.
    *   \_getEventById (event: Event): (event: EventDoc)
        *   **effects**: Returns the event with the given ID.
    *   \_getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: EventDoc)
        *   **effects**: Returns a filtered and prioritized set of events based on context (e.g., matching tags from `filters`, sorted by `priorities`).
    *   \_getEventsByStatus (status: "upcoming" or "cancelled" or "completed"): (event: EventDoc)
        *   **effects**: Returns a list of all events with the given status.
    *   \_getAllEvents (): (event: EventDoc)
        *   **effects**: Returns a list of all events.

---

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

---

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

---

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