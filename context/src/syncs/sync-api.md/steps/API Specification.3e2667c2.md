---
timestamp: 'Fri Nov 07 2025 17:42:17 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_174217.3a28eaf9.md]]'
content_id: 3e2667c249f6e8173e01c16c78244ae423a04b3fbb2310ba1402303ff2169412
---

# API Specification: Friending Concept

**Purpose:** enable users to establish and manage mutual social connections

***

## API Endpoints

### POST /api/Friending/sendFriendRequest

**Description:** Allows a user to send a friend request to another user.

**Requirements:**

* user and target are not existing friends
* user has not already sent a request to target
* target has not sent a request to user.

**Effects:**

* target is added to the set of the user's outgoing requests
* user is added to the set of target's incoming requests

**Request Body:**

```json
{
  "user": "string (User ID)",
  "target": "string (User ID)"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Friending/acceptFriendRequest

**Description:** Allows a user to accept a friend request from another user.

**Requirements:**

* requester has sent a friend request to target
* requester and target are not friends

**Effects:**

* requester and target are added to each other's set of friends
* they are both removed from the other's set of incoming/outgoingRequests

**Request Body:**

```json
{
  "requester": "string (User ID)",
  "target": "string (User ID)"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Friending/removeFriendRequest

**Description:** Allows a user to remove a pending friend request they sent or received.

**Requirements:**

* requester has sent a friend request to target
* requester and target are not friends

**Effects:**

* requester is removed from the target's set of incomingRequests
* target is removed the requester's set of outgoingRequests

**Request Body:**

```json
{
  "requester": "string (User ID)",
  "target": "string (User ID)"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Friending/removeFriend

**Description:** Allows a user to remove an existing friend connection.

**Requirements:**

* user and friend are friends with each other

**Effects:**

* user and friends are both removed from each other's set of friends

**Request Body:**

```json
{
  "user": "string (User ID)",
  "friend": "string (User ID)"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Friending/\_getFriends

**Description:** Retrieves the list of friends for a given user.

**Requirements:**

* none

**Effects:**

* returns a list of all friends for a given user.

**Request Body:**

```json
{
  "user": "string (User ID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "friend": "string (User ID)"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Friending/\_getIncomingRequests

**Description:** Retrieves the list of incoming friend requests for a given user.

**Requirements:**

* none

**Effects:**

* returns a list of all incoming friend requests for a given user.

**Request Body:**

```json
{
  "user": "string (User ID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "requester": "string (User ID)"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Friending/\_getOutgoingRequests

**Description:** Retrieves the list of outgoing friend requests for a given user.

**Requirements:**

* none

**Effects:**

* returns a list of all outgoing friend requests for a given user.

**Request Body:**

```json
{
  "user": "string (User ID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "target": "string (User ID)"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
