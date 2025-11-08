---
timestamp: 'Fri Nov 07 2025 17:42:17 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_174217.3a28eaf9.md]]'
content_id: 4387328fea4e3a36c9a9da475060c0e232adc52082cee1b38ea21bfb6f174429
---

# API Specification: Event Concept

**Purpose:** enable users to organize, track, and facilitate the discovery of time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen

***

## API Endpoints

### POST /api/Event/createEvent

**Description:** Creates a new event with the given details, associates it with the organizer, sets the status to "upcoming", and returns the new event's ID.

**Requirements:**

* date >= current\_time
* name != ""
* location != ""
* description != ""
* duration > 0

**Effects:**

* creates an event with the given details associated with the organizer
* sets the status to "upcoming"
* returns the new event

**Request Body:**

```json
{
  "organizer": "string (User ID)",
  "name": "string",
  "date": "string (ISO 8601 DateTime)",
  "duration": "number",
  "location": "string",
  "description": "string"
}
```

**Success Response Body (Action):**

```json
{
  "event": "string (Event ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Event/modifyEvent

**Description:** Modifies an existing event's details.

**Requirements:**

* organizer = event.organizer
* newName != ""
* newLocation != ""
* newDescription != ""
* newDate >= current\_time
* newDuration > 0
* at least one field must differ from the original event details

**Effects:**

* event.name := newName
* event.date := newDate
* event.duration := newDuration
* event.location := newLocation
* event.description := newDescription
* returns event

**Request Body:**

```json
{
  "organizer": "string (User ID)",
  "event": "string (Event ID)",
  "newName": "string",
  "newDate": "string (ISO 8601 DateTime)",
  "newDuration": "number",
  "newLocation": "string",
  "newDescription": "string"
}
```

**Success Response Body (Action):**

```json
{
  "event": "string (Event ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Event/cancelEvent

**Description:** Changes the status of an upcoming event to "cancelled".

**Requirements:**

* organizer = event.organizer
* event.status = "upcoming"

**Effects:**

* event.status := "cancelled"

**Request Body:**

```json
{
  "organizer": "string (User ID)",
  "event": "string (Event ID)"
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

### POST /api/Event/unCancelEvent

**Description:** Changes the status of a cancelled event back to "upcoming".

**Requirements:**

* organizer = event.organizer
* event.status = "cancelled"
* event.date + event.duration >= current\_time

**Effects:**

* event.status := "upcoming"
* returns event

**Request Body:**

```json
{
  "organizer": "string (User ID)",
  "event": "string (Event ID)"
}
```

**Success Response Body (Action):**

```json
{
  "event": "string (Event ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Event/deleteEvent

**Description:** Removes an event from the system.

**Requirements:**

* organizer = event.organizer

**Effects:**

* removes event from the set of all existing events

**Request Body:**

```json
{
  "organizer": "string (User ID)",
  "event": "string (Event ID)"
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

### POST /api/Event/completeEvent

**Description:** (System Action) Marks an event as "completed" if its scheduled end time has passed.

**Requirements:**

* event.status = "upcoming"
* (event.date + event.duration <= current\_time)

**Effects:**

* event.status := "completed"

**Request Body:**

```json
{
  "event": "string (Event ID)"
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

### POST /api/Event/\_getEventById

**Description:** Retrieves a single event document by its ID.

**Requirements:**

* true

**Effects:**

* returns the event document as an array, or an empty array if not found

**Request Body:**

```json
{
  "event": "string (Event ID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string (Event ID)",
    "organizer": "string (User ID)",
    "name": "string",
    "date": "string (ISO 8601 DateTime)",
    "duration": "number",
    "location": "string",
    "description": "string",
    "status": "string ('upcoming' | 'cancelled' | 'completed')"
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

### POST /api/Event/\_getEventsByOrganizer

**Description:** Retrieves a list of all events organized by a specific user.

**Requirements:**

* true

**Effects:**

* returns a list of all events organized by the given user

**Request Body:**

```json
{
  "organizer": "string (User ID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string (Event ID)",
    "organizer": "string (User ID)",
    "name": "string",
    "date": "string (ISO 8601 DateTime)",
    "duration": "number",
    "location": "string",
    "description": "string",
    "status": "string ('upcoming' | 'cancelled' | 'completed')"
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

### POST /api/Event/\_getEventsByStatus

**Description:** Retrieves a list of all events with a given status.

**Requirements:**

* status is one of the valid enum values

**Effects:**

* returns a list of all events with the given status

**Request Body:**

```json
{
  "status": "string ('upcoming' | 'cancelled' | 'completed')"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string (Event ID)",
    "organizer": "string (User ID)",
    "name": "string",
    "date": "string (ISO 8601 DateTime)",
    "duration": "number",
    "location": "string",
    "description": "string",
    "status": "string ('upcoming' | 'cancelled' | 'completed')"
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

### POST /api/Event/\_getAllEvents

**Description:** Retrieves a list of all events.

**Requirements:**

* true

**Effects:**

* returns a list of all events

**Request Body:**

```json
{}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string (Event ID)",
    "organizer": "string (User ID)",
    "name": "string",
    "date": "string (ISO 8601 DateTime)",
    "duration": "number",
    "location": "string",
    "description": "string",
    "status": "string ('upcoming' | 'cancelled' | 'completed')"
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

### POST /api/Event/\_getEventsByRecommendationContext

**Description:** Retrieves a list of events according to the given filters and priorities, sorted by relevance, using an AI-augmented recommendation system.

**Requirements:**

* true

**Effects:**

* returns a list of events according to the given filters and priorities, sorted by relevance

**Request Body:**

```json
{
  "user": "string (User ID)",
  "filters": "string",
  "priorities": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string (Event ID)",
    "organizer": "string (User ID)",
    "name": "string",
    "date": "string (ISO 8601 DateTime)",
    "duration": "number",
    "location": "string",
    "description": "string",
    "status": "string ('upcoming' | 'cancelled' | 'completed')"
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
