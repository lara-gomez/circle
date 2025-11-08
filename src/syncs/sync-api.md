# API Specification

Base URL: `http://localhost:8000/api`

Unless otherwise noted, requests expect a JSON body and responses are JSON. Endpoints handled through the Requesting concept require a valid `session` identifier in the request body. Obtain a session via `POST /api/login` and include it on subsequent calls.

---

## Authentication & Session Management

### POST /api/UserAuthentication/register
- **Description:** Create a new account.
- **Requirements:**
  - Username does not already exist.
- **Effects:**
  - Persists a new user and returns its ID.
- **Body:** `{ "username": string, "password": string }`
- **Success:** `{ "user": string }`
- **Error:** `{ "error": string }`

### POST /api/login
- **Description:** Authenticate credentials and start a session.
- **Requirements:**
  - Provided credentials match an existing user.
- **Effects:**
  - Authenticates the user.
  - Creates a new session associated with the user.
- **Body:** `{ "username": string, "password": string }`
- **Success:** `{ "session": string }`
- **Error:** `{ "error": string }`

### POST /api/logout
- **Description:** Terminate an existing session.
- **Requirements:**
  - Session exists and belongs to the caller.
- **Effects:**
  - Deletes the session from the system.
- **Body:** `{ "session": string }`
- **Success:** `{ "status": "logged_out" }`
- **Error:** `{ "error": string }`

### POST /api/Session/_getUser *(passthrough)*
- **Description:** Retrieve the user ID for a session.
- **Requirements:**
  - Session exists.
- **Effects:**
  - Returns the user bound to the session.
- **Body:** `{ "session": string }`
- **Success:** `[ { "user": string } ]`
- **Error:** `{ "error": string }`

### POST /api/UserAuthentication/_getUsername *(passthrough)*
- **Description:** Lookup username by user ID.
- **Requirements:**
  - User exists.
- **Effects:**
  - Returns the username.
- **Body:** `{ "user": string }`
- **Success:** `[ { "username": string } ]`
- **Error:** `{ "error": string }`

### POST /api/UserAuthentication/_getUserByUsername *(passthrough)*
- **Description:** Lookup user ID by username.
- **Requirements:**
  - Username exists.
- **Effects:**
  - Returns the user ID.
- **Body:** `{ "username": string }`
- **Success:** `[ { "user": string } ]`
- **Error:** `{ "error": string }`

---

## Event Endpoints
All Event routes require a valid `session`. The server automatically marks overdue “upcoming” events as `completed` whenever events are fetched.

### POST /api/Event/createEvent
- **Description:** Create a new event.
- **Requirements:**
  - Caller owns an active session.
  - `name`, `location`, `description` are non-empty.
  - `duration` > 0.
  - `date` is in the future.
- **Effects:**
  - Stores the event with status `upcoming` and returns its ID.
- **Body:** `{ "session": string, "name": string, "date": string (ISO 8601), "duration": number (minutes), "location": string, "description": string }`
- **Success:** `{ "event": string }`
- **Error:** `{ "error": string }`

### POST /api/Event/modifyEvent
- **Description:** Update an existing event.
- **Requirements:**
  - Caller has an active session as the event organizer.
  - At least one field differs from the original values.
  - Same validations as `createEvent` for new values.
- **Effects:**
  - Updates the stored event fields and returns the event ID.
- **Body:** `{ "session": string, "event": string, "newName": string, "newDate": string, "newDuration": number, "newLocation": string, "newDescription": string }`
- **Success:** `{ "event": string }`
- **Error:** `{ "error": string }`

### POST /api/Event/cancelEvent
- **Description:** Cancel an upcoming event.
- **Requirements:**
  - Caller is the organizer.
  - Event status is `upcoming`.
- **Effects:**
  - Sets status to `cancelled`.
- **Body:** `{ "session": string, "event": string }`
- **Success:** `{ "success": true }`
- **Error:** `{ "error": string }`

### POST /api/Event/unCancelEvent
- **Description:** Restore a cancelled event.
- **Requirements:**
  - Caller is the organizer.
  - Event status is `cancelled`.
  - Event has not yet finished.
- **Effects:**
  - Sets status to `upcoming` and returns the event ID.
- **Body:** `{ "session": string, "event": string }`
- **Success:** `{ "event": string }`
- **Error:** `{ "error": string }`

### POST /api/Event/deleteEvent
- **Description:** Permanently delete an event.
- **Requirements:**
  - Caller is the organizer.
- **Effects:**
  - Removes the event and triggers cascading clean-up (user interests and reviews).
- **Body:** `{ "session": string, "event": string }`
- **Success:** `{ "success": true }`
- **Error:** `{ "error": string }`

### POST /api/Event/_getEventById
- **Description:** Retrieve a single event.
- **Requirements:**
  - Valid session.
- **Effects:**
  - Completes overdue events in the same flow.
  - Returns the event or `null`.
- **Body:** `{ "session": string, "event": string }`
- **Success:** `{ "event": Event | null }`
- **Error:** `{ "error": string }`

### POST /api/Event/_getEventsByOrganizer
- **Description:** List events for an organizer.
- **Requirements:**
  - Valid session.
- **Effects:**
  - Completes overdue events.
  - Returns matching events.
- **Body:** `{ "session": string, "organizer": string }`
- **Success:** `{ "results": Event[] }`
- **Error:** `{ "error": string }`

### POST /api/Event/_getEventsByStatus
- **Description:** List events by status.
- **Requirements:**
  - Valid session.
  - `status` is `upcoming`, `cancelled`, or `completed`.
- **Effects:**
  - Completes overdue events.
  - Returns matching events.
- **Body:** `{ "session": string, "status": "upcoming" | "cancelled" | "completed" }`
- **Success:** `{ "results": Event[] }`
- **Error:** `{ "error": string }`

### POST /api/Event/_getAllEvents
- **Description:** List all events.
- **Requirements:**
  - Valid session.
- **Effects:**
  - Completes overdue events.
  - Returns every event.
- **Body:** `{ "session": string }`
- **Success:** `{ "results": Event[] }`
- **Error:** `{ "error": string }`

### POST /api/Event/_getEventsByRecommendationContext
- **Description:** AI-assisted recommendations.
- **Requirements:**
  - Valid session.
  - Provide filters/priorities strings.
- **Effects:**
  - Runs recommendation flow, completing overdue events before returning.
- **Body:** `{ "session": string, "filters": string, "priorities": string }`
- **Success:** `{ "results": Event[], "error": undefined }`
- **Error:** `{ "results": [], "error": string }`

*`Event` objects contain `_id`, `organizer`, `name`, `date`, `duration`, `location`, `description`, `status`.*

---

## Friending Endpoints
All Friending routes require a valid `session`.

### POST /api/Friending/sendFriendRequest
- **Description:** Send a friend request by username.
- **Requirements:**
  - Valid session.
  - Target username exists.
  - Users are not already friends or in a pending request.
- **Effects:**
  - Adds entries to outgoing/incoming queues.
- **Body:** `{ "session": string, "targetUsername": string }`
- **Success:** `{ "success": true }`
- **Error:** `{ "error": string }`

### POST /api/Friending/acceptFriendRequest
- **Description:** Accept a pending request.
- **Requirements:**
  - Valid session.
  - Requester previously sent a request.
- **Effects:**
  - Removes the pending request and adds a mutual friendship.
- **Body:** `{ "session": string, "requester": string }`
- **Success:** `{ "success": true }`
- **Error:** `{ "error": string }`

### POST /api/Friending/removeFriendRequest
- **Description:** Withdraw or decline a request.
- **Requirements:**
  - Valid session.
  - Caller is requester or target of the request.
- **Effects:**
  - Removes the pending request from both users.
- **Body:** `{ "session": string, "requester": string, "target": string }`
- **Success:** `{ "success": true }`
- **Error:** `{ "error": string }`

### POST /api/Friending/removeFriend
- **Description:** Break an existing friendship.
- **Requirements:**
  - Valid session.
  - Users are friends.
- **Effects:**
  - Removes each user from the other’s friend list.
- **Body:** `{ "session": string, "friend": string }`
- **Success:** `{ "success": true }`
- **Error:** `{ "error": string }`

### Friending Queries *(passthrough)*
- `/api/Friending/_getFriends`
- `/api/Friending/_getIncomingRequests`
- `/api/Friending/_getOutgoingRequests`

Each requires `{ "user": string }`. Effects are read-only listings returning arrays of IDs; errors use `{ "error": string }`.

---

## Reviewing Endpoints
All Reviewing routes require `session`.

### POST /api/Reviewing/addReview
- **Description:** Create a review.
- **Requirements:**
  - Valid session.
  - No existing review for the user-item pair.
  - `rating` is between 0 and 10.
- **Effects:**
  - Stores the review and returns its ID.
- **Body:** `{ "session": string, "item": string, "rating": number, "entry": string }`
- **Success:** `{ "review": string }`
- **Error:** `{ "error": string }`

### POST /api/Reviewing/modifyReview
- **Description:** Update an existing review.
- **Requirements:**
  - Valid session.
  - Review exists.
  - `rating` remains between 0 and 10.
- **Effects:**
  - Updates rating/entry and returns the review ID.
- **Body:** `{ "session": string, "item": string, "rating": number, "entry": string }`
- **Success:** `{ "review": string }`
- **Error:** `{ "error": string }`

### POST /api/Reviewing/removeReview
- **Description:** Delete a review.
- **Requirements:**
  - Valid session.
  - Review exists for the user-item pair.
- **Effects:**
  - Removes the review.
- **Body:** `{ "session": string, "item": string }`
- **Success:** `{ "success": true }`
- **Error:** `{ "error": string }`

### Review Queries *(passthrough)*
- `_getReview`, `_getReviewsByItem`, `_getReviewsByUser`
- **Effects:** Return review information in array form; no session required.

---

## User Interest Endpoints
All User Interest routes require `session`.

### POST /api/UserInterest/addPersonalInterest
- **Description:** Add a personal tag.
- **Requirements:**
  - Valid session.
  - Tag is non-empty and unique for the user (validated by the concept).
- **Effects:**
  - Creates a personal interest association.
- **Body:** `{ "session": string, "tag": string }`
- **Success:** `{ "personalInterest": string }`
- **Error:** `{ "error": string }`

### POST /api/UserInterest/removePersonalInterest
- **Description:** Remove a personal tag.
- **Requirements:**
  - Valid session.
  - Association exists.
- **Effects:**
  - Deletes the association.
- **Body:** `{ "session": string, "tag": string }`
- **Success:** `{ "success": true }`
- **Error:** `{ "error": string }`

### POST /api/UserInterest/addItemInterest
- **Description:** Mark interest in an item.
- **Requirements:**
  - Valid session.
  - No existing interest for the user-item pair.
- **Effects:**
  - Creates the interest association.
- **Body:** `{ "session": string, "item": string }`
- **Success:** `{ "itemInterest": string }`
- **Error:** `{ "error": string }`

### POST /api/UserInterest/removeItemInterest
- **Description:** Remove interest in an item.
- **Requirements:**
  - Valid session.
  - Association exists.
- **Effects:**
  - Deletes the association.
- **Body:** `{ "session": string, "item": string }`
- **Success:** `{ "success": true }`
- **Error:** `{ "error": string }`

### POST /api/UserInterest/_getPersonalInterests
- **Description:** Retrieve personal tags for the current user.
- **Requirements:**
  - Valid session.
- **Effects:**
  - Returns personal interest records.
- **Body:** `{ "session": string }`
- **Success:** `{ "results": UserPersonalInterest[] }`
- **Error:** `{ "error": string }`

### POST /api/UserInterest/_getItemInterests
- **Description:** Retrieve item interests for the current user.
- **Requirements:**
  - Valid session.
- **Effects:**
  - Returns item-interest records.
- **Body:** `{ "session": string }`
- **Success:** `{ "results": UserItemInterest[] }`
- **Error:** `{ "error": string }`

### POST /api/UserInterest/_getUsersInterestedInItems
- **Description:** List users interested in an item.
- **Requirements:**
  - Valid session.
  - Item ID provided.
- **Effects:**
  - Returns user IDs that reference the item.
- **Body:** `{ "session": string, "item": string }`
- **Success:** `{ "results": Array<{ user: string }> }`
- **Error:** `{ "error": string }`

*`UserPersonalInterest` objects expose `_id`, `user`, and `tag`; `UserItemInterest` objects expose `_id`, `user`, and `item`.*

---

## Summary of Access Control
- Endpoints marked *passthrough* do not require a session and map directly to concept queries.
- All other endpoints require `{ "session": string }` and run through synchronizations that enforce authentication and business rules.
- Error responses consistently use `{ "error": string }`; success payloads follow the structures above.

This specification reflects the current synchronizations in `src/syncs/` and the passthrough configuration. Use it as the authoritative reference for Circle’s API surface.