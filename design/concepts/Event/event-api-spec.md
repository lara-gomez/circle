[@api-extraction-from-code](../../tools/api-extraction-from-code.md)

[@api-extraction-from-spec](../../tools/api-extraction-from-spec.md)

[@concept-definition](Event.md)

[@concept-implementation](implementation.md)

# prompt: generate the API documentation for the Event concept, use the implementation reference

# response:

# API Specification: Event Concept

**Purpose:** enable users to organize and track time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen

---

## API Endpoints

### POST /api/Event/createEvent

**Description:** Creates an event with the given details associated with the organizer, sets the status to "upcoming".

**Requirements:**
- date >= current\_time
- name != ""
- location != ""
- description != ""
- duration > 0

**Effects:**
- creates an event with the given details associated with the organizer, sets the status to "upcoming"
- returns the new event

**Request Body:**
```json
{
  "organizer": "string",
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
  "event": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Event/modifyEvent

**Description:** Modifies an existing event's details.

**Requirements:**
- organizer = event.organizer
- newName != ""
- newLocation != ""
- newDescription != ""
- newDate >= current\_time
- newDuration > 0
- at least one field must differ from the original event details

**Effects:**
- event.name := newName
- event.date := newDate
- event.duration := newDuration
- event.location := newLocation
- event.description := newDescription
- returns event

**Request Body:**
```json
{
  "organizer": "string",
  "event": "string",
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
  "event": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Event/cancelEvent

**Description:** Cancels an upcoming event.

**Requirements:**
- organizer = event.organizer and event.status = "upcoming"

**Effects:**
- event.status := "cancelled"

**Request Body:**
```json
{
  "organizer": "string",
  "event": "string"
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

---

### POST /api/Event/unCancelEvent

**Description:** Restores a cancelled event to "upcoming" status.

**Requirements:**
- organizer = event.organizer and event.status = "cancelled" and event.date + event.duration >= current\_time

**Effects:**
- event.status := "upcoming"
- returns event

**Request Body:**
```json
{
  "organizer": "string",
  "event": "string"
}
```

**Success Response Body (Action):**
```json
{
  "event": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Event/deleteEvent

**Description:** Removes an event from the set of all existing events.

**Requirements:**
- organizer = event.organizer

**Effects:**
- removes event from the set of all existing events

**Request Body:**
```json
{
  "organizer": "string",
  "event": "string"
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

---

### POST /api/Event/completeEvent

**Description:** Automatically marks an event as completed if its scheduled time has passed.

**Requirements:**
- event.status = "upcoming" and (event.date + event.duration <= current\_time)

**Effects:**
- event.status := "completed"

**Request Body:**
```json
{
  "event": "string"
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

---

### POST /api/Event/getEventById

**Description:** Retrieves a single event by its ID.

**Requirements:**
- true (existence check is handled by returning an empty array if not found)

**Effects:**
- returns the event document as an array, or an empty array if not found

**Request Body:**
```json
{
  "event": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string",
    "organizer": "string",
    "name": "string",
    "date": "string (ISO 8601 DateTime)",
    "duration": "number",
    "location": "string",
    "description": "string",
    "status": "string (enum: \"upcoming\" | \"cancelled\" | \"completed\")"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Event/getEventsByOrganizer

**Description:** Retrieves a list of all events organized by the given user.

**Requirements:**
- true

**Effects:**
- returns a list of all events organized by the given user

**Request Body:**
```json
{
  "organizer": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string",
    "organizer": "string",
    "name": "string",
    "date": "string (ISO 8601 DateTime)",
    "duration": "number",
    "location": "string",
    "description": "string",
    "status": "string (enum: \"upcoming\" | \"cancelled\" | \"completed\")"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Event/getEventsByStatus

**Description:** Retrieves a list of all events with the given status.

**Requirements:**
- status is one of the valid enum values

**Effects:**
- returns a list of all events with the given status

**Request Body:**
```json
{
  "status": "string (enum: \"upcoming\" | \"cancelled\" | \"completed\")"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string",
    "organizer": "string",
    "name": "string",
    "date": "string (ISO 8601 DateTime)",
    "duration": "number",
    "location": "string",
    "description": "string",
    "status": "string (enum: \"upcoming\" | \"cancelled\" | \"completed\")"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Event/getAllEvents

**Description:** Retrieves a list of all events in the system.

**Requirements:**
- true

**Effects:**
- returns a list of all events

**Request Body:**
```json
{}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string",
    "organizer": "string",
    "name": "string",
    "date": "string (ISO 8601 DateTime)",
    "duration": "number",
    "location": "string",
    "description": "string",
    "status": "string (enum: \"upcoming\" | \"cancelled\" | \"completed\")"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Event/getEventsByRecommendationContext

**Description:** Returns a list of events according to the given filters and priorities, sorted by relevance, utilizing AI-augmented recommendations.

**Requirements:**
- true

**Effects:**
- returns a list of events according to the given filters and priorities, sorted by relevance

**Request Body:**
```json
{
  "user": "string",
  "filters": "string",
  "priorities": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string",
    "organizer": "string",
    "name": "string",
    "date": "string (ISO 8601 DateTime)",
    "duration": "number",
    "location": "string",
    "description": "string",
    "status": "string (enum: \"upcoming\" | \"cancelled\" | \"completed\")"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```