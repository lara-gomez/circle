---
timestamp: 'Fri Nov 07 2025 14:21:16 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_142116.04f1d92b.md]]'
content_id: 0239902c8069c15abe3051e887913955e70037a93e01a7a3efe93954870275df
---

# concept: Event \[User]

**concept** Event \[User]

* **purpose**: enable users to organize, track, and facilitate the discovery of time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen

* **principle**: A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system. Additionally, the system can surface relevant events by applying contextual filters and prioritizations to its stored event data, aiding in personalized discovery.

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

* **queries**:
  * \_getEventsByOrganizer (organizer: User): (event: Event)
    * **requires**: the given event exists
    * **effects**: returns a list of all events organized by the given user
  * \_getEventsByStatus (status: "upcoming" | "cancelled" | "completed"): (event: Event)
    * **requires**: status is one of the valid enum values
    * **effects**: returns a list of all events with the given status
  * \_getAllEvents (): (event: Event)
    * **effects**: returns a list of all events
  * \_getEventsByRecommendationContext (user: User, filters: String, priorities: String): (events: Event\[])
    * **effects**: returns a list of events according to the given filters and priorities, sorted by relevance
