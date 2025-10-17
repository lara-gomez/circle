---
timestamp: 'Thu Oct 16 2025 04:22:39 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_042239.dea6d00c.md]]'
content_id: f2446bb96fd2e06140dace7eb846545bdb5bc2ae6175a626d88b74252c34808c
---

# concept: Event \[User]

**concept** Event \[User]

* **purpose**: enable users to organize and track time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen

* **principle**: A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system.

* **state**:
  * a set of Events with
    * an organizer User
    * a name String
    * a date DateTime
    * a duration Number // Duration in minutes
    * a location String
    * a description String
    * a status of "upcoming" or "cancelled" or "completed"

* **actions**:
  * createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)
    * **requires**: date >= current\_time; name != ""; location != ""; description != ""
    * **effects**: creates an event with the given details associated with the organizer, sets the status to "upcoming"; returns the new event

  * modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)
    * **requires**: organizer = event.organizer; newName != ""; newLocation != ""; newDescription != ""; newDate >= current\_time
    * **effects**: event.name := newName, event.date := newDate, event.duration := newDuration, event.location := newLocation, event.description := newDescription; returns event

  * cancelEvent (organizer: User, event: Event)
    * **requires**: organizer = event.organizer and event.status = "upcoming"
    * **effects**: event.status := "cancelled"

  * unCancelEvent (organizer: User, event: Event): (event: Event)
    * **requires**: organizer = event.organizer and event.status = "cancelled" and event.date + event.duration >= current\_time
    * **effects**: event.status := "upcoming"; returns event

  * deleteEvent (organizer: User, event: Event)
    * **requires**: organizer = event.organizer
    * **effects**: removes event from the set of all existing events

  * **system** completeEvent (event: Event)
    * **requires**: event.status = "upcoming" and (event.date + event.duration <= current\_time)
    * **effects**: event.status := "completed"
