---
timestamp: 'Sun Oct 19 2025 18:09:37 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_180937.05b53dec.md]]'
content_id: f3e9c9faeef90e02f8cdeebec26951889e0dd0891f0a21c3839b26c713875fd2
---

# API Specification: Event Concept

**Purpose:** enable users to organize and track time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen

***

## API Endpoints

### POST /api/Event/createEvent

**Description:** Creates a new event.

**Requirements:**

* date >= current\_time
* name != ""
* location != ""
* description != ""
* duration > 0

**Effects:**

* creates an event with the given details associated with the organizer, sets the status to "upcoming"
* returns the new event

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
```
