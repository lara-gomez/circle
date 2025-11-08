---
timestamp: 'Fri Nov 07 2025 15:41:11 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_154111.ac1d91f1.md]]'
content_id: 585050d48905b2dedf871caaf22a723791098f05ff87e36d5e2659f321a22fb9
---

# response:

Here are the specific synchronizations for the `Friending` concept, following the requested format (no helpers, direct syntax as in the `auth.sync.ts` example, and only including actions, excluding queries).

First, let's ensure the `Friending` concept specification is clear on its actions and their arguments.

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
  * `_getFriends (user: User): (friend: User)`
  * `_getIncomingRequests (user: User): (requester: User)`
  * `_getOutgoingRequests (user: User): (target: User)`

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
