import { assertEquals, assertExists, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import EventConcept from "./EventConcept.ts";

const organizerA = "user:Alice" as ID;
const otherUserB = "user:Bob" as ID;

// Removed sleep helper for long durations.
// For time-sensitive tests, we'll manipulate the event's 'date' in the DB directly.

Deno.test("EventConcept: Principle - User organizes, tracks, and manages event lifecycle (efficient)", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("--- Principle Test: Event Lifecycle (efficient) ---");

    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 10 * 1000); // Event 1 starts 10 seconds from now
    const duration1 = 1; // 1 minute
    const futureDate2 = new Date(now.getTime() + 20 * 1000); // Event 2 starts 20 seconds from now
    const duration2 = 1; // 1 minute

    // 1. A user can schedule an event by providing essential details
    console.log("1. Creating event1 (Team Meeting) by organizerA...");
    const createResult1 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Team Meeting",
      date: futureDate1.toISOString(),
      duration: duration1,
      location: "Online",
      description: "Discuss Q3 strategy.",
    });
    assertNotEquals("error" in createResult1, true, `Event1 creation failed: ${JSON.stringify(createResult1)}`);
    const { event: event1 } = createResult1 as { event: ID };
    assertExists(event1, "Event1 ID should be returned.");

    let events = await eventConcept._getEventById({ event: event1 });
    assertEquals(events.length, 1, "Event1 should be found.");
    assertEquals(events[0].status, "upcoming", "Event1 initial status should be 'upcoming'.");
    assertEquals(events[0].organizer, organizerA, "Event1 organizer should be correct.");

    console.log("1a. Creating event2 (Past Workshop Candidate) for completion test by organizerA...");
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Past Workshop Candidate",
      date: futureDate2.toISOString(), // Created in the future
      duration: duration2,
      location: "Conference Room",
      description: "Review last quarter's performance.",
    });
    assertNotEquals("error" in createResult2, true, `Event2 creation failed: ${JSON.stringify(createResult2)}`);
    const { event: event2 } = createResult2 as { event: ID };
    assertExists(event2, "Event2 ID should be returned.");
    const event2Doc = (await eventConcept._getEventById({ event: event2 }))[0];
    assertEquals(event2Doc.status, "upcoming", "Event2 initial status should be 'upcoming'.");


    // 2. The organizer retains the ability to cancel an event beforehand
    console.log("2. OrganizerA cancels event1...");
    const cancelResult = await eventConcept.cancelEvent({ organizer: organizerA, event: event1 });
    assertEquals("error" in cancelResult, false, `Event1 cancellation failed: ${JSON.stringify(cancelResult)}`);

    events = await eventConcept._getEventById({ event: event1 });
    assertEquals(events[0].status, "cancelled", "Event1 status should be 'cancelled'.");

    // 3. The organizer has the flexibility to restore it if circumstances reverse
    console.log("3. OrganizerA un-cancels event1...");
    const uncancelResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: event1 });
    assertNotEquals("error" in uncancelResult, true, `Event1 un-cancellation failed: ${JSON.stringify(uncancelResult)}`);

    events = await eventConcept._getEventById({ event: event1 });
    assertEquals(events[0].status, "upcoming", "Event1 status should be restored to 'upcoming'.");

    // 4. After the scheduled time, the event naturally transitions to a completed state
    // To test completion immediately, we must make event2's end time appear in the past NOW.
    console.log(`4. Manually updating event2 (${event2}) date to be in the past to simulate completion eligibility...`);
    const pastEndTimeForEvent2 = new Date(new Date().getTime() - (duration2 + 1) * 60 * 1000); // 1 minute + 1 second in the past
    await eventConcept.events.updateOne({ _id: event2 }, { $set: { date: pastEndTimeForEvent2 } });

    console.log("4a. System action: Completing event2 (now past its end time)...");
    const completeResult = await eventConcept.completeEvent({ event: event2 });
    assertEquals("error" in completeResult, false, `Event2 completion failed: ${JSON.stringify(completeResult)}`);

    events = await eventConcept._getEventById({ event: event2 });
    assertEquals(events[0].status, "completed", "Event2 status should be 'completed'.");

    // 5. Organizers may also choose to delete events from the system
    console.log("5. OrganizerA deletes event1...");
    const deleteResult = await eventConcept.deleteEvent({ organizer: organizerA, event: event1 });
    assertEquals("error" in deleteResult, false, `Event1 deletion failed: ${JSON.stringify(deleteResult)}`);

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
    const futureDate = new Date(now.getTime() + 5 * 1000); // 5 seconds in the future for buffer

    console.log("Testing successful event creation...");
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "New Event",
      date: futureDate.toISOString(),
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
      date: pastDate.toISOString(),
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
      date: futureDate.toISOString(),
      duration: 30,
      location: "Here",
      description: "Details",
    });
    assertEquals("error" in emptyNameResult, true, "Expected error for empty name.");
    assertEquals((emptyNameResult as { error: string }).error, "Event name cannot be empty.");


    console.log("Testing createEvent with duration <= 0 (should fail)...");
    const zeroDurationResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Test",
      date: futureDate.toISOString(),
      duration: 0,
      location: "Here",
      description: "Details",
    });
    assertEquals("error" in zeroDurationResult, true, "Expected error for zero duration.");
    assertEquals((zeroDurationResult as { error: string }).error, "Event duration must be a positive number of minutes.");

    const negativeDurationResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Test",
      date: futureDate.toISOString(),
      duration: -10,
      location: "Here",
      description: "Details",
    });
    assertEquals("error" in negativeDurationResult, true, "Expected error for negative duration.");
    assertEquals((negativeDurationResult as { error: string }).error, "Event duration must be a positive number of minutes.");


  } finally {
    await client.close();
  }
});

Deno.test("Action: modifyEvent - success and validation", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const now = new Date();
    const initialDate = new Date(now.getTime() + 5 * 1000); // 5 seconds from now
    const newDate = new Date(now.getTime() + 10 * 1000); // 10 seconds from now

    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Old Name",
      date: initialDate.toISOString(),
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
      newDate: newDate.toISOString(),
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
      newDate: newDate.toISOString(),
      newDuration: 90,
      newLocation: "New Location",
      newDescription: "New Description",
    });
    assertEquals("error" in nonOrganizerModifyResult, true, "Expected error for non-organizer modification.");
    assertEquals((nonOrganizerModifyResult as { error: string }).error, "Only the event organizer can modify the event.");

    console.log("Testing modification without changing any fields (should fail)...");
    // Retrieve the latest state of the event to ensure no actual change is detected
    const currentEventState = (await eventConcept._getEventById({ event: eventId }))[0];
    const noChangeResult = await eventConcept.modifyEvent({
      organizer: organizerA,
      event: eventId,
      newName: currentEventState.name,
      newDate: currentEventState.date.toISOString(),
      newDuration: currentEventState.duration,
      newLocation: currentEventState.location,
      newDescription: currentEventState.description,
    });
    assertEquals("error" in noChangeResult, true, "Expected error when no fields are changed.");
    assertEquals((noChangeResult as { error: string }).error, "At least one field must differ from the original event details to modify.");

    console.log("Testing modification with past date (should fail)...");
    const pastNewDate = new Date(now.getTime() - 1000);
    const pastNewDateResult = await eventConcept.modifyEvent({
      organizer: organizerA,
      event: eventId,
      newName: "Name",
      newDate: pastNewDate.toISOString(),
      newDuration: 90,
      newLocation: "Location",
      newDescription: "Description",
    });
    assertEquals("error" in pastNewDateResult, true, "Expected error for new date in the past.");
    assertEquals((pastNewDateResult as { error: string }).error, "New event date cannot be in the past.");


    console.log("Testing modification with empty new name (should fail)...");
    const emptyNewNameResult = await eventConcept.modifyEvent({
      organizer: organizerA,
      event: eventId,
      newName: "",
      newDate: newDate.toISOString(),
      newDuration: 90,
      newLocation: "Location",
      newDescription: "Description",
    });
    assertEquals("error" in emptyNewNameResult, true, "Expected error for empty new name.");
    assertEquals((emptyNewNameResult as { error: string }).error, "New event name cannot be empty.");

    console.log("Testing modification with duration <= 0 (should fail)...");
    const zeroDurationModifyResult = await eventConcept.modifyEvent({
      organizer: organizerA,
      event: eventId,
      newName: "Name",
      newDate: newDate.toISOString(),
      newDuration: 0,
      newLocation: "Location",
      newDescription: "Description",
    });
    assertEquals("error" in zeroDurationModifyResult, true, "Expected error for zero duration in modify.");
    assertEquals((zeroDurationModifyResult as { error: string }).error, "New event duration must be a positive number of minutes.");


  } finally {
    await client.close();
  }
});

Deno.test("Action: cancelEvent - success and validation", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const futureDate = new Date(Date.now() + 5 * 1000); // 5 seconds in future
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Cancel Test",
      date: futureDate.toISOString(),
      duration: 60,
      location: "Online",
      description: "Desc",
    });
    const { event: eventId } = createResult as { event: ID };

    const events = await eventConcept._getEventById({ event: eventId });
    assertEquals(events.length, 1, "Event should exist before cancellation.");

    console.log("Testing successful event cancellation...");
    const cancelResult = await eventConcept.cancelEvent({ organizer: organizerA, event: eventId });
    assertEquals("error" in cancelResult, false, "Expected success for cancellation.");
    const cancelledEvent = (await eventConcept._getEventById({ event: eventId }))[0];
    assertEquals(cancelledEvent.status, "cancelled", "Event status should be 'cancelled'.");

    console.log("Testing cancellation of already cancelled event (should fail)...");
    const alreadyCancelledResult = await eventConcept.cancelEvent({ organizer: organizerA, event: eventId });
    assertEquals("error" in alreadyCancelledResult, true, "Expected error for cancelling already cancelled event.");
    assertEquals((alreadyCancelledResult as { error: string }).error, "Event cannot be cancelled as its status is not 'upcoming'.");


    console.log("Testing cancellation by non-organizer (should fail)...");
    const nonOrganizerCancelResult = await eventConcept.cancelEvent({ organizer: otherUserB, event: eventId });
    assertEquals("error" in nonOrganizerCancelResult, true, "Expected error for non-organizer.");
    assertEquals((nonOrganizerCancelResult as { error: string }).error, "Only the event organizer can cancel the event.");

    console.log("Testing cancellation of a completed event (should fail)...");
    const now = new Date();
    const eventForCompletionDate = new Date(now.getTime() + 1000); // starts 1 second from now
    const eventForCompletionDuration = 1; // 1 minute
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Event for completing before cancelling",
      date: eventForCompletionDate.toISOString(),
      duration: eventForCompletionDuration,
      location: "Somewhere",
      description: "Past",
    });
    const { event: eventId2 } = createResult2 as { event: ID };

    // Manually set event's date to be in the past to make it eligible for completion
    const pastEndTimeForEvent2 = new Date(now.getTime() - (eventForCompletionDuration + 1) * 60 * 1000);
    await eventConcept.events.updateOne({ _id: eventId2 }, { $set: { date: pastEndTimeForEvent2 } });

    await eventConcept.completeEvent({ event: eventId2 }); // Complete it first
    const completedEvent = (await eventConcept._getEventById({ event: eventId2 }))[0];
    assertEquals(completedEvent.status, "completed", "Event should be completed.");

    const cancelCompletedResult = await eventConcept.cancelEvent({ organizer: organizerA, event: eventId2 });
    assertEquals("error" in cancelCompletedResult, true, "Expected error for cancelling a completed event.");
    assertEquals((cancelCompletedResult as { error: string }).error, "Event cannot be cancelled as its status is not 'upcoming'.");

  } finally {
    await client.close();
  }
});

Deno.test("Action: unCancelEvent - success and validation", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 5 * 1000); // Future event, 5s from now
    const durationShort = 1; // 1 minute

    // Setup an event to be cancelled and then uncancelled
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Uncancel Test",
      date: futureDate.toISOString(),
      duration: durationShort,
      location: "Online",
      description: "Desc",
    });
    const { event: eventId } = createResult as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventId }); // Cancel it first

    console.log("Testing successful event un-cancellation (future event)...");
    const uncancelResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: eventId });
    assertNotEquals("error" in uncancelResult, true, "Expected success for un-cancellation.");
    const uncancelledEvent = (await eventConcept._getEventById({ event: eventId }))[0];
    assertEquals(uncancelledEvent.status, "upcoming", "Event status should be 'upcoming'.");

    console.log("Testing un-cancellation by non-organizer (should fail)...");
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventId }); // Re-cancel for this test
    const nonOrganizerUncancelResult = await eventConcept.unCancelEvent({ organizer: otherUserB, event: eventId });
    assertEquals("error" in nonOrganizerUncancelResult, true, "Expected error for non-organizer.");
    assertEquals((nonOrganizerUncancelResult as { error: string }).error, "Only the event organizer can un-cancel the event.");

    console.log("Reset status of event to upcoming for the following tests.")
    await eventConcept.unCancelEvent({ organizer: organizerA, event: eventId });

    console.log("Testing un-cancellation of an already upcoming event (should fail)...");
    const alreadyUpcomingResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: eventId }); // Event is currently upcoming
    assertEquals("error" in alreadyUpcomingResult, true, `Expected error for un-cancelling an upcoming event.`);
    assertEquals((alreadyUpcomingResult as { error: string }).error, "Event cannot be un-cancelled as its status is not 'cancelled'.");


    console.log("Testing un-cancellation of a cancelled but already ended event (should fail)...");
    // Create an event that starts in the future, then cancel it, then manually update its date to be in the past.
    const pastEndTestStart = new Date(now.getTime() + 1000); // Starts 1s from now
    const pastEndTestDuration = 1; // 1 minute
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Past Ended Event",
      date: pastEndTestStart.toISOString(),
      duration: pastEndTestDuration,
      location: "Test",
      description: "Test",
    });
    const { event: pastEndedEventId } = createResult2 as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerA, event: pastEndedEventId }); // Cancel it

    // Manually set event's date to be in the past to make it appear ended
    const pastEndTimeForEvent2 = new Date(now.getTime() - (pastEndTestDuration + 1) * 60 * 1000);
    await eventConcept.events.updateOne({ _id: pastEndedEventId }, { $set: { date: pastEndTimeForEvent2 } });

    const uncancelEndedResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: pastEndedEventId });
    assertEquals("error" in uncancelEndedResult, true, "Expected error for un-cancelling an event that has already ended.");
    assertEquals((uncancelEndedResult as { error: string }).error, "Cannot un-cancel an event that has already ended.");

  } finally {
    await client.close();
  }
});

Deno.test("Action: deleteEvent - success and validation", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const futureDate = new Date(Date.now() + 5 * 1000); // 5 seconds in future
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Delete Test",
      date: futureDate.toISOString(),
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
    assertEquals((nonExistentDeleteResult as { error: string }).error, `Event with ID ${nonExistentId} not found.`);

    console.log("Testing deletion by non-organizer (should fail)...");
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Another Delete Test",
      date: futureDate.toISOString(),
      duration: 60,
      location: "Offline",
      description: "Desc",
    });
    const { event: event2Id } = createResult2 as { event: ID };
    const nonOrganizerDeleteResult = await eventConcept.deleteEvent({ organizer: otherUserB, event: event2Id });
    assertEquals("error" in nonOrganizerDeleteResult, true, "Expected error for non-organizer deletion.");
    assertEquals((nonOrganizerDeleteResult as { error: string }).error, "Only the event organizer can delete the event.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: system completeEvent - success and validation (efficient)", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const now = new Date();
    // Event 1: for testing `not yet ended` failure. Starts 5 seconds from now, lasts 1 minute.
    const futureEventTimeShort = new Date(now.getTime() + 5 * 1000);
    const shortDuration = 1; // 1 minute

    // Create an event that will be eligible for completion after a short sleep
    const createResult1 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Future Event to Complete",
      date: futureEventTimeShort.toISOString(),
      duration: shortDuration,
      location: "Virtual",
      description: "Wait and complete",
    });
    const { event: eventId1 } = createResult1 as { event: ID };
    assertExists(eventId1);
    let event1Doc = (await eventConcept._getEventById({ event: eventId1 }))[0];
    assertEquals(event1Doc.status, "upcoming", "Initial status should be upcoming for event1.");

    console.log("Testing system completeEvent for an event that has not yet ended (should fail)...");
    const incompleteResult = await eventConcept.completeEvent({ event: eventId1 });
    assertEquals("error" in incompleteResult, true, "Expected error for completing event that has not yet ended.");
    assertEquals((incompleteResult as { error: string }).error, "Event cannot be completed as it has not yet ended.");

    // Manually update event1's date to be in the past to make it eligible for completion
    console.log(`Manually updating Event1 (${eventId1}) date to simulate it being ended...`);
    const pastEndTimeForEvent1 = new Date(now.getTime() - (shortDuration + 1) * 60 * 1000); // Ended 1 minute + 1 second ago
    await eventConcept.events.updateOne({ _id: eventId1 }, { $set: { date: pastEndTimeForEvent1 } });

    console.log("Testing system completeEvent for Event1 after it has effectively 'ended' (via DB update)...");
    const completeResult1 = await eventConcept.completeEvent({ event: eventId1 });
    assertEquals("error" in completeResult1, false, `Expected success for completion after 'waiting': ${JSON.stringify(completeResult1)}`);
    event1Doc = (await eventConcept._getEventById({ event: eventId1 }))[0];
    assertEquals(event1Doc.status, "completed", "Event status should be 'completed' after 'waiting'.");

    console.log("Testing completion of already completed event (should fail)...");
    const alreadyCompletedResult = await eventConcept.completeEvent({ event: eventId1 });
    assertEquals("error" in alreadyCompletedResult, true, "Expected error for completing already completed event.");
    assertEquals((alreadyCompletedResult as { error: string }).error, "Event cannot be completed as its status is not 'upcoming'.");

    console.log("Testing completion of cancelled event (should fail)...");
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Cancelled Event",
      date: (new Date(now.getTime() + 1 * 1000)).toISOString(), // In the future initially
      duration: 1,
      location: "Anywhere",
      description: "Cancelled test",
    });
    const { event: eventId2 } = createResult2 as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventId2 }); // Cancel it

    // Manually set event2's date to be in the past (still cancelled)
    const pastEndTimeForEvent2 = new Date(now.getTime() - (1 + 1) * 60 * 1000);
    await eventConcept.events.updateOne({ _id: eventId2 }, { $set: { date: pastEndTimeForEvent2 } });

    const cancelledCompleteResult = await eventConcept.completeEvent({ event: eventId2 });
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
    const event1Date = new Date(now.getTime() + 10 * 1000); // 10 seconds from now
    const event2Date = new Date(now.getTime() + 20 * 1000); // 20 seconds from now
    const event3Date = new Date(now.getTime() + 30 * 1000); // 30 seconds from now

    // Create multiple events
    const createRes1 = await eventConcept.createEvent({ organizer: organizerA, name: "A's Event 1", date: event1Date.toISOString(), duration: 30, location: "L1", description: "D1" });
    const { event: eventA1 } = createRes1 as { event: ID };
    const createRes2 = await eventConcept.createEvent({ organizer: organizerA, name: "A's Event 2", date: event2Date.toISOString(), duration: 60, location: "L2", description: "D2" });
    const { event: eventA2 } = createRes2 as { event: ID };
    const createRes3 = await eventConcept.createEvent({ organizer: otherUserB, name: "B's Event 1", date: event3Date.toISOString(), duration: 45, location: "L3", description: "D3" });
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

    // Simulate completion for an event without sleeping
    console.log("Simulating completion for eventA1 by manually updating its date...");
    const pastStartTimeForA1 = new Date(new Date().getTime() - 31 * 60 * 1000);
    await eventConcept.events.updateOne({ _id: eventA1 }, { $set: { date: pastStartTimeForA1 } });

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