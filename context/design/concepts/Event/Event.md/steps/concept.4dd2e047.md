---
timestamp: 'Thu Oct 16 2025 04:09:54 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_040954.77072302.md]]'
content_id: 4dd2e0470891686aef3a478e07f01ec30236be0f06f4a7884115f41ba253b648
---

# concept: Event \[User]

* **concept**: Event \[User]

* **purpose**: manage the creation, deletion, and modification for any events.

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
