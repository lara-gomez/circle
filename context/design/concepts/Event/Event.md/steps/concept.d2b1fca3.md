---
timestamp: 'Thu Oct 16 2025 04:13:07 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_041307.8ca0cfdf.md]]'
content_id: d2b1fca30fb7cf33c34e8bb9a9a49c425fd44c7ce1938044c2d7d01047258e64
---

# concept: Event \[User]

* **concept**: Event \[User]

* **purpose**: enable users to organize, track, and share time-bound occurrences with specific details

* **principle**: A user can create an event and provided relevant details including the event name, time, location, and description. The user who is organizing this event is the only person who can modify or cancel this event. Modifications can be made to any field of the selected event.

* **state**:
  * a set of Events with
    * an organizer User
    * a name String
    * a date Date
    * a duration Number
    * a location String
    * a description String
    * a status ("upcoming" | "cancelled" | "completed" )

* **actions**:
  * createEvent (organizer: User, name: String, date: Date, duration: Number, location: String, description: String): (event: Event)
    * requires: date has not already occurred; location, description, and name are non-empty strings
    * effects: creates an event with the given details associated to the organizer, and sets the status to "upcoming"; returns the new event

  * modifyEvent (organizer: User, event: Event, name: String, date: Date, duration: Number, location: String, description: String): (event: Event)
    * requires: date has not already occurred; location, description, and name are non-empty strings; the organizer is tied to the given event
    * effects: modifies the provided event and returns it

  * cancelEvent (organizer: User, event: Event)
    * requires: the organizer is the designated organizer for the event; event has not already occurred
    * effects: the status for the provided event is updated to "cancelled"

  * deleteEvent (organizer: User, event: Event)
    * requires: the organizer is the designated organizer for the event; event has not already occurred
    * effects: removes the event from the set of all existing events
