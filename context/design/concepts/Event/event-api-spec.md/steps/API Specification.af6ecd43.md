---
timestamp: 'Sun Oct 19 2025 18:07:31 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_180731.6d83be90.md]]'
content_id: af6ecd43b618284154c82cf851bb5c93a9bde45025135d4c1d158ae4ef89a841
---

# API Specification: Event Concept

**Purpose:** enable users to organize and track time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen

***

## API Endpoints

### POST /api/Event/createEvent

**Description:** Creates a new event with the specified details.

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
  "organizer": "string",
  "name": "string",
  "date": "string",
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

***

### POST /api/Event/modifyEvent

**Description:** Modifies the details of an existing event.

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
  "organizer": "string",
  "event": "string",
  "newName": "string",
  "newDate": "string",
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

***

### POST /api/Event/cancelEvent

**Description:** Cancels an upcoming event.

**Requirements:**

* organizer = event.organizer and event.status = "upcoming"

**Effects:**

* event.status := "cancelled"

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

***

### POST /api/Event/unCancelEvent

**Description:** Restores a cancelled event to an upcoming status.

**Requirements:**

* organizer = event.organizer and event.status = "cancelled" and event.date + event.duration >= current\_time

**Effects:**

* event.status := "upcoming"
* returns event

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

***

### POST /api/Event/deleteEvent

**Description:** Permanently removes an event from the system.

**Requirements:**

* organizer = event.organizer

**Effects:**

* removes event from the set of all existing events

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

***

### POST /api/Event/completeEvent

**Description:** Automatically marks an event as completed once its scheduled duration has passed.

**Requirements:**

* event.status = "upcoming" and (event.date + event.duration <= current\_time)

**Effects:**

* event.status := "completed"

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

***
