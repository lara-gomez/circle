---
timestamp: 'Thu Oct 16 2025 23:20:28 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_232028.5f6eb5b2.md]]'
content_id: 626f1806beb2ef432961d586dc07533b7892bf71ffd1911356ad3eb7d6fa8d81
---

# concept: Event \[User]

**concept** Event \[User]

* **purpose**: enable users to organize and track time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen

* **principle**: A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system. Users can also access relevant events according to a given context.

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
    * **requires**: date >= current\_time; name != ""; location != ""; description != ""; duration > 0
    * **effects**: creates an event with the given details associated with the organizer, sets the status to "upcoming"; returns the new event

  * modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)
    * **requires**: organizer = event.organizer; newName != ""; newLocation != ""; newDescription != ""; newDate >= current\_time; newDuration > 0; at least one field must differ from the original event details
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

  * recommendEvents (user: User, context: Context): (events: Event\[])
    * **effects**: returns a list of all events related to the context, which are sorted according to relevance to the provided context
