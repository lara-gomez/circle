---
timestamp: 'Thu Oct 16 2025 20:24:28 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_202428.7f0364af.md]]'
content_id: ace42e0de9ff88c650fbfa78225c6778f5543bf48a1b0122c7fb254c91f6f4b4
---

# file: src/event/EventConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import EventConcept from "./EventConcept.ts";

const organizerA = "user:Alice" as ID;
const otherUserB = "user:Bob" as ID;

// Helper to simulate waiting for an event to end
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

Deno.test("EventConcept: Principle - User organizes, tracks, and manages event lifecycle", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("--- Principle Test: Event Lifecycle ---");

    // Scenario setup: Current time for relative date calculations
    const now = new Date();
    const futureDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const pastDateForCompletion = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    const durationShort = 30; // 30 minutes

    // 1. A user can schedule an event by providing essential details
    console.log("1. Creating an event by organizerA...");
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Team Meeting",
      date: futureDate,
      duration: durationShort,
      location: "Online",
      description: "Discuss Q3 strategy.",
    });
    assertNotEquals("error" in createResult, true, `Event creation failed: ${JSON.stringify(createResult)}`);
    const { event: event1 } = createResult as { event: ID };
    assertExists(event1, "Event ID should be returned.");

    let events = await eventConcept._getEventById({ event: event1 });
    assertEquals(events.length, 1, "Event should be found.");
    assertEquals(events[0].status, "upcoming", "Initial status should be 'upcoming'.");
    assertEquals(events[0].organizer, organizerA, "Organizer should be correct.");

    // 2. The organizer retains the ability to cancel an event beforehand
    console.log("2. OrganizerA cancels event1...");
    const cancelResult = await eventConcept.cancelEvent({ organizer: organizerA, event: event1 });
    assertEquals("error" in cancelResult, false, `Event cancellation failed: ${JSON.stringify(cancelResult)}`);

    events = await eventConcept._getEventById({ event: event1 });
    assertEquals(events[0].status, "cancelled", "Event status should be 'cancelled'.");

    // 3. The organizer has the flexibility to restore it if circumstances reverse
    console.log("3. OrganizerA un-cancels event1...");
    const uncancelResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: event1 });
    assertNotEquals("error" in uncancelResult, true, `Event un-cancellation failed: ${JSON.stringify(uncancelResult)}`);

    events = await eventConcept._getEventById({ event: event1 });
    assertEquals(events[0].status, "upcoming", "Event status should be restored to 'upcoming'.");

    // Create a second event that is designed to be completed
    console.log("4. Creating event2 with a past date for completion testing...");
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Past Workshop",
      date: pastDateForCompletion,
      duration: durationShort,
      location: "Conference Room",
      description: "Review last quarter's performance.",
    });
    assertNotEquals("error" in createResult2, true, `Event2 creation failed: ${JSON.stringify(createResult2)}`);
    const { event: event2 } = createResult2 as { event: ID };
    assertExists(event2, "Event2 ID should be returned.");

    // 5. After the scheduled time, the event naturally transitions to a completed state
    // We created event2 with a past date, so it's ready for completion.
    console.log("5. System action: Completing event2 (which is in the past)...");
    const completeResult = await eventConcept.completeEvent({ event: event2 });
    assertEquals("error" in completeResult, false, `Event completion failed: ${JSON.stringify(completeResult)}`);

    events = await eventConcept._getEventById({ event: event2 });
    assertEquals(events[0].status, "completed", "Event2 status should be 'completed'.");

    // 6. Organizers may also choose to delete events from the system
    console.log("6. OrganizerA deletes event1...");
    const deleteResult = await eventConcept.deleteEvent({ organizer: organizerA, event: event1 });
    assertEquals("error" in deleteResult, false, `Event deletion failed: ${JSON.stringify(deleteResult)}`);

    events = await eventConcept._getEventById({ event: event1 });
    assertEquals(events.length, 0, "Event1 should no longer exist after deletion.");

    console.log("Principle test completed successfully.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: createEvent - success and validation", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 1000); // slightly in the future

    console.log("Testing successful event creation...");
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "New Event",
      date: futureDate,
      duration: 60,
      location: "Venue",
      description: "Description",
    });
    assertNotEquals("error" in createResult, true, `Expected success, got error: ${JSON.stringify(createResult)}`);
    const { event: newEventId } = createResult as { event: ID };
    assertExists(newEventId);

    const event = (await eventConcept._getEventById({ event: newEventId }))[0];
    assertEquals(event.name, "New Event");
    assertEquals(event.organizer, organizerA);
    assertEquals(event.status, "upcoming");
    assertEquals(event.date.getTime(), futureDate.getTime());
    assertEquals(event.duration, 60);

    console.log("Testing createEvent with past date (should fail)...");
    const pastDate = new Date(now.getTime() - 1000);
    const pastDateResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Past Event",
      date: pastDate,
      duration: 30,
      location: "Here",
      description: "Details",
    });
    assertEquals("error" in pastDateResult, true, "Expected error for past date.");
    assertEquals((pastDateResult as { error: string }).error, "Event date cannot be in the past.");

    console.log("Testing createEvent with empty name (should fail)...");
    const emptyNameResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "",
      date: futureDate,
      duration: 30,
      location: "Here",
      description: "Details",
    });
    assertEquals("error" in emptyNameResult, true, "Expected error for empty name.");

    console.log("Testing createEvent with duration <= 0 (should fail)...");
    const zeroDurationResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Test",
      date: futureDate,
      duration: 0,
      location: "Here",
      description: "Details",
    });
    assertEquals("error" in zeroDurationResult, true, "Expected error for zero duration.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: modifyEvent - success and validation", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const now = new Date();
    const initialDate = new Date(now.getTime() + 60 * 60 * 1000);
    const newDate = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Old Name",
      date: initialDate,
      duration: 60,
      location: "Old Location",
      description: "Old Description",
    });
    const { event: eventId } = createResult as { event: ID };

    console.log("Testing successful event modification...");
    const modifyResult = await eventConcept.modifyEvent({
      organizer: organizerA,
      event: eventId,
      newName: "New Name",
      newDate: newDate,
      newDuration: 90,
      newLocation: "New Location",
      newDescription: "New Description",
    });
    assertNotEquals("error" in modifyResult, true, `Expected success, got error: ${JSON.stringify(modifyResult)}`);

    const updatedEvent = (await eventConcept._getEventById({ event: eventId }))[0];
    assertEquals(updatedEvent.name, "New Name", "Event name should be updated.");
    assertEquals(updatedEvent.date.getTime(), newDate.getTime(), "Event date should be updated.");
    assertEquals(updatedEvent.duration, 90, "Event duration should be updated.");
    assertEquals(updatedEvent.location, "New Location", "Event location should be updated.");
    assertEquals(updatedEvent.description, "New Description", "Event description should be updated.");

    console.log("Testing modification by non-organizer (should fail)...");
    const nonOrganizerModifyResult = await eventConcept.modifyEvent({
      organizer: otherUserB, // Different user
      event: eventId,
      newName: "Attempted Name",
      newDate: newDate,
      newDuration: 90,
      newLocation: "New Location",
      newDescription: "New Description",
    });
    assertEquals("error" in nonOrganizerModifyResult, true, "Expected error for non-organizer modification.");
    assertEquals((nonOrganizerModifyResult as { error: string }).error, "Only the event organizer can modify the event.");

    console.log("Testing modification without changing any fields (should fail)...");
    const noChangeResult = await eventConcept.modifyEvent({
      organizer: organizerA,
      event: eventId,
      newName: "New Name",
      newDate: newDate,
      newDuration: 90,
      newLocation: "New Location",
      newDescription: "New Description",
    });
    assertEquals("error" in noChangeResult, true, "Expected error when no fields are changed.");
    assertEquals((noChangeResult as { error: string }).error, "At least one field must differ from the original event details to modify.");

    console.log("Testing modification with past date (should fail)...");
    const pastNewDate = new Date(now.getTime() - 1000);
    const pastNewDateResult = await eventConcept.modifyEvent({
      organizer: organizerA,
      event: eventId,
      newName: "Name",
      newDate: pastNewDate,
      newDuration: 90,
      newLocation: "Location",
      newDescription: "Description",
    });
    assertEquals("error" in pastNewDateResult, true, "Expected error for new date in the past.");

    console.log("Testing modification with empty new name (should fail)...");
    const emptyNewNameResult = await eventConcept.modifyEvent({
      organizer: organizerA,
      event: eventId,
      newName: "",
      newDate: newDate,
      newDuration: 90,
      newLocation: "Location",
      newDescription: "Description",
    });
    assertEquals("error" in emptyNewNameResult, true, "Expected error for empty new name.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: cancelEvent - success and validation", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Cancel Test",
      date: futureDate,
      duration: 60,
      location: "Online",
      description: "Desc",
    });
    const { event: eventId } = createResult as { event: ID };

    console.log("Testing successful event cancellation...");
    const cancelResult = await eventConcept.cancelEvent({ organizer: organizerA, event: eventId });
    assertEquals("error" in cancelResult, false, "Expected success for cancellation.");
    const cancelledEvent = (await eventConcept._getEventById({ event: eventId }))[0];
    assertEquals(cancelledEvent.status, "cancelled", "Event status should be 'cancelled'.");

    console.log("Testing cancellation of already cancelled event (should fail)...");
    const alreadyCancelledResult = await eventConcept.cancelEvent({ organizer: organizerA, event: eventId });
    assertEquals("error" in alreadyCancelledResult, true, "Expected error for cancelling already cancelled event.");

    console.log("Testing cancellation by non-organizer (should fail)...");
    const nonOrganizerCancelResult = await eventConcept.cancelEvent({ organizer: otherUserB, event: eventId });
    assertEquals("error" in nonOrganizerCancelResult, true, "Expected error for non-organizer.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: unCancelEvent - success and validation", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000); // Future event
    const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // Past event (already ended)

    // Setup an event to be cancelled and then uncancelled
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Uncancel Test",
      date: futureDate,
      duration: 60,
      location: "Online",
      description: "Desc",
    });
    const { event: eventId } = createResult as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventId }); // Cancel it first

    console.log("Testing successful event un-cancellation...");
    const uncancelResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: eventId });
    assertNotEquals("error" in uncancelResult, true, "Expected success for un-cancellation.");
    const uncancelledEvent = (await eventConcept._getEventById({ event: eventId }))[0];
    assertEquals(uncancelledEvent.status, "upcoming", "Event status should be 'upcoming'.");

    console.log("Testing un-cancellation by non-organizer (should fail)...");
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventId }); // Re-cancel for this test
    const nonOrganizerUncancelResult = await eventConcept.unCancelEvent({ organizer: otherUserB, event: eventId });
    assertEquals("error" in nonOrganizerUncancelResult, true, "Expected error for non-organizer.");

    console.log("Testing un-cancellation of an already completed event (should fail)...");
    // Create an event that is past and then mark as completed
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Past Event for Uncancel",
      date: pastDate,
      duration: 30,
      location: "Somewhere",
      description: "Past",
    });
    const { event: pastEventId } = createResult2 as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerA, event: pastEventId }); // Cancel it
    await eventConcept.completeEvent({ event: pastEventId }); // Mark as completed (even if cancelled, system action can change it if logic allows or it's a separate path)

    const uncancelPastResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: pastEventId });
    assertEquals("error" in uncancelPastResult, true, "Expected error for un-cancelling a completed event.");
    assertEquals((uncancelPastResult as { error: string }).error, "Event cannot be un-cancelled as its status is not 'cancelled'.");

    console.log("Testing un-cancellation of a cancelled but already ended event (should fail)...");
    // Event `pastEventId` is cancelled and its end time is in the past.
    // It should now correctly fail the `event.date + event.duration >= current_time` check.
    const uncancelEndedResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: pastEventId });
    assertEquals("error" in uncancelEndedResult, true, "Expected error for un-cancelling an event that has already ended.");
    assertEquals((uncancelEndedResult as { error: string }).error, "Event cannot be un-cancelled as its status is not 'cancelled'.");
    // Correction: the previous check failed for status. Let's make sure the *time* check also works.
    await eventConcept.events.updateOne({_id: pastEventId}, {$set: {status: "cancelled"}}); // Force status to cancelled
    const uncancelEndedTimeCheckResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: pastEventId });
    assertEquals("error" in uncancelEndedTimeCheckResult, true, "Expected error for un-cancelling an event that has already ended (time check).");
    assertEquals((uncancelEndedTimeCheckResult as { error: string }).error, "Cannot un-cancel an event that has already ended.");

  } finally {
    await client.close();
  }
});

Deno.test("Action: deleteEvent - success and validation", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Delete Test",
      date: futureDate,
      duration: 60,
      location: "Online",
      description: "Desc",
    });
    const { event: eventId } = createResult as { event: ID };

    let events = await eventConcept._getEventById({ event: eventId });
    assertEquals(events.length, 1, "Event should exist before deletion.");

    console.log("Testing successful event deletion...");
    const deleteResult = await eventConcept.deleteEvent({ organizer: organizerA, event: eventId });
    assertEquals("error" in deleteResult, false, "Expected success for deletion.");

    events = await eventConcept._getEventById({ event: eventId });
    assertEquals(events.length, 0, "Event should no longer exist after deletion.");

    console.log("Testing deletion of non-existent event (should fail)...");
    const nonExistentId = "event:nonexistent" as ID;
    const nonExistentDeleteResult = await eventConcept.deleteEvent({ organizer: organizerA, event: nonExistentId });
    assertEquals("error" in nonExistentDeleteResult, true, "Expected error for deleting non-existent event.");

    console.log("Testing deletion by non-organizer (should fail)...");
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Another Delete Test",
      date: futureDate,
      duration: 60,
      location: "Offline",
      description: "Desc",
    });
    const { event: event2Id } = createResult2 as { event: ID };
    const nonOrganizerDeleteResult = await eventConcept.deleteEvent({ organizer: otherUserB, event: event2Id });
    assertEquals("error" in nonOrganizerDeleteResult, true, "Expected error for non-organizer deletion.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: system completeEvent - success and validation", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const futureEventTime = new Date(Date.now() + 1000); // 1 second in the future
    const shortDuration = 1; // 1 minute
    const pastEventTime = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
    const pastEventDuration = 1; // 1 minute

    // Event 1: Create an event that is in the future and will become eligible for completion
    const createResult1 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Future Event to Complete",
      date: futureEventTime,
      duration: shortDuration,
      location: "Virtual",
      description: "Wait and complete",
    });
    const { event: eventId1 } = createResult1 as { event: ID };
    assertExists(eventId1);
    let event1Doc = (await eventConcept._getEventById({ event: eventId1 }))[0];
    assertEquals(event1Doc.status, "upcoming");

    // Event 2: Create an event that is already in the past when created
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Already Past Event",
      date: pastEventTime,
      duration: pastEventDuration,
      location: "Physical",
      description: "Should be completable immediately",
    });
    const { event: eventId2 } = createResult2 as { event: ID };
    assertExists(eventId2);
    let event2Doc = (await eventConcept._getEventById({ event: eventId2 }))[0];
    assertEquals(event2Doc.status, "upcoming"); // Still 'upcoming' initially

    console.log("Testing system completeEvent for an event whose end time is already in the past...");
    const completeResult2 = await eventConcept.completeEvent({ event: eventId2 });
    assertEquals("error" in completeResult2, false, `Expected success for immediate completion of past event: ${JSON.stringify(completeResult2)}`);
    event2Doc = (await eventConcept._getEventById({ event: eventId2 }))[0];
    assertEquals(event2Doc.status, "completed", "Event status should be 'completed' for past event.");

    console.log("Testing system completeEvent for an event that has not yet ended (should fail)...");
    const incompleteResult = await eventConcept.completeEvent({ event: eventId1 });
    assertEquals("error" in incompleteResult, true, "Expected error for completing event that has not yet ended.");
    assertEquals((incompleteResult as { error: string }).error, "Event cannot be completed as it has not yet ended.");

    console.log("Waiting for Event1 to become eligible for completion...");
    // Wait for event1 to pass its end time (futureEventTime + shortDuration)
    // 1 minute duration = 60 * 1000 ms
    // We created it 1 second in the future, so wait 1 min + 1 sec + buffer
    await sleep(shortDuration * 60 * 1000 + 1000 + 100);

    console.log("Testing system completeEvent for Event1 after it has ended...");
    const completeResult1 = await eventConcept.completeEvent({ event: eventId1 });
    assertEquals("error" in completeResult1, false, `Expected success for completion after waiting: ${JSON.stringify(completeResult1)}`);
    event1Doc = (await eventConcept._getEventById({ event: eventId1 }))[0];
    assertEquals(event1Doc.status, "completed", "Event status should be 'completed' after waiting.");

    console.log("Testing completion of already completed event (should fail)...");
    const alreadyCompletedResult = await eventConcept.completeEvent({ event: eventId1 });
    assertEquals("error" in alreadyCompletedResult, true, "Expected error for completing already completed event.");
    assertEquals((alreadyCompletedResult as { error: string }).error, "Event cannot be completed as its status is not 'upcoming'.");

    console.log("Testing completion of cancelled event (should fail)...");
    const createResult3 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Cancelled Event",
      date: new Date(Date.now() - 3 * 60 * 1000), // In the past
      duration: 30,
      location: "Anywhere",
      description: "Cancelled test",
    });
    const { event: eventId3 } = createResult3 as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventId3 }); // Cancel it
    const cancelledCompleteResult = await eventConcept.completeEvent({ event: eventId3 });
    assertEquals("error" in cancelledCompleteResult, true, "Expected error for completing cancelled event.");
    assertEquals((cancelledCompleteResult as { error: string }).error, "Event cannot be completed as its status is not 'upcoming'.");
  } finally {
    await client.close();
  }
});

Deno.test("Queries: _getEventById, _getEventsByOrganizer, _getEventsByStatus, _getAllEvents", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const now = new Date();
    const event1Date = new Date(now.getTime() + 10 * 60 * 1000); // 10 mins from now
    const event2Date = new Date(now.getTime() + 20 * 60 * 1000); // 20 mins from now
    const event3Date = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins from now

    // Create multiple events
    const createRes1 = await eventConcept.createEvent({ organizer: organizerA, name: "A's Event 1", date: event1Date, duration: 30, location: "L1", description: "D1" });
    const { event: eventA1 } = createRes1 as { event: ID };
    const createRes2 = await eventConcept.createEvent({ organizer: organizerA, name: "A's Event 2", date: event2Date, duration: 60, location: "L2", description: "D2" });
    const { event: eventA2 } = createRes2 as { event: ID };
    const createRes3 = await eventConcept.createEvent({ organizer: otherUserB, name: "B's Event 1", date: event3Date, duration: 45, location: "L3", description: "D3" });
    const { event: eventB1 } = createRes3 as { event: ID };

    // Cancel an event
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventA2 });

    console.log("Query: _getEventById - existent event");
    const retrievedEventA1 = await eventConcept._getEventById({ event: eventA1 });
    assertEquals(retrievedEventA1.length, 1);
    assertEquals(retrievedEventA1[0].name, "A's Event 1");

    console.log("Query: _getEventById - non-existent event");
    const nonExistentEvent = await eventConcept._getEventById({ event: "event:nonexistent" as ID });
    assertEquals(nonExistentEvent.length, 0);

    console.log("Query: _getEventsByOrganizer - organizerA");
    const eventsByA = await eventConcept._getEventsByOrganizer({ organizer: organizerA });
    assertEquals(eventsByA.length, 2);
    assertArrayIncludes(eventsByA.map(e => e._id), [eventA1, eventA2]);
    assertArrayIncludes(eventsByA.map(e => e.name), ["A's Event 1", "A's Event 2"]);

    console.log("Query: _getEventsByOrganizer - otherUserB");
    const eventsByB = await eventConcept._getEventsByOrganizer({ organizer: otherUserB });
    assertEquals(eventsByB.length, 1);
    assertEquals(eventsByB[0]._id, eventB1);

    console.log("Query: _getEventsByStatus - upcoming");
    const upcomingEvents = await eventConcept._getEventsByStatus({ status: "upcoming" });
    assertEquals(upcomingEvents.length, 2);
    assertArrayIncludes(upcomingEvents.map(e => e._id), [eventA1, eventB1]);

    console.log("Query: _getEventsByStatus - cancelled");
    const cancelledEvents = await eventConcept._getEventsByStatus({ status: "cancelled" });
    assertEquals(cancelledEvents.length, 1);
    assertEquals(cancelledEvents[0]._id, eventA2);

    console.log("Query: _getEventsByStatus - completed (should be empty initially)");
    const completedEvents = await eventConcept._getEventsByStatus({ status: "completed" });
    assertEquals(completedEvents.length, 0);

    // Simulate completion for an event
    await sleep(event1Date.getTime() - now.getTime() + 30 * 60 * 1000 + 100); // Wait for A's Event 1 to end + buffer
    await eventConcept.completeEvent({ event: eventA1 });
    const completedEventsAfterAction = await eventConcept._getEventsByStatus({ status: "completed" });
    assertEquals(completedEventsAfterAction.length, 1);
    assertEquals(completedEventsAfterAction[0]._id, eventA1);


    console.log("Query: _getAllEvents");
    const allEvents = await eventConcept._getAllEvents();
    assertEquals(allEvents.length, 3);
    assertArrayIncludes(allEvents.map(e => e._id), [eventA1, eventA2, eventB1]);
  } finally {
    await client.close();
  }
});
```
