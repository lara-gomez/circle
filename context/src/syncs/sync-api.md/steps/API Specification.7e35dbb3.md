---
timestamp: 'Fri Nov 07 2025 17:42:17 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_174217.3a28eaf9.md]]'
content_id: 7e35dbb32aed831036bd447bb487db209b6b9b37e7f0b11d2de3cc86b28bace6
---

# API Specification: Sessioning Concept

**Purpose:** To maintain a user's logged-in state across multiple requests without re-sending credentials.

***

## API Endpoints

### POST /api/Sessioning/create

**Description:** Creates a new session and associates it with the given user.

**Requirements:**

* true.

**Effects:**

* creates a new Session `s`;
* associates it with the given `user`;
* returns `s` as `session`.

**Request Body:**

```json
{
  "user": "string (User ID)"
}
```

**Success Response Body (Action):**

```json
{
  "session": "string (Session ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Sessioning/delete

**Description:** Removes an existing session.

**Requirements:**

* the given `session` exists.

**Effects:**

* removes the session `s`.

**Request Body:**

```json
{
  "session": "string (Session ID)"
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

### POST /api/Sessioning/\_getUser

**Description:** Retrieves the user associated with a given session.

**Requirements:**

* the given `session` exists.

**Effects:**

* returns the user associated with the session.

**Request Body:**

```json
{
  "session": "string (Session ID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "user": "string (User ID)"
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
