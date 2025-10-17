---
timestamp: 'Thu Oct 16 2025 19:50:02 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_195002.8070a630.md]]'
content_id: e093ac9d57744e5b4ab53cd7a42d323223c34d25d9cd2812d6d311c9531b1187
---

# file: src/event/EventConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import EventConcept from "./EventConcept.ts";

const organizerAlice = "user:Alice" as ID;
const organizerBob = "user:Bob" as ID;

Deno.test("Principle: User schedules, event completes, organizer cancels/uncancels/deletes", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- Principle Test Trace ---");

    // 1. A user (Alice) schedules an event
    console.log("Action: Alice creates an upcoming event for tomorrow.");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Set event for tomorrow
    tomorrow.setHours(10, 0, 0, 0); // Normalize time to avoid subtle date issues
    const createResult = await eventConcept.createEvent({
      organizer: organizerAlice,
      name: "Team Meeting",
      date: tomorrow,
      duration: 60,
      location: "Conference Room A",
      description: "Discuss Q3 strategy",
    });
    assertNotEquals("error" in createResult, true, `createEvent should succeed: ${JSON.stringify(createResult)}`);
    const { event: event1Id } = createResult as { event: ID };
    assertExists(event1Id, "Event ID should be returned.");
    console.log(`Event created: ${event1Id}`);

    const getEvent1Result1 = await eventConcept._getEventById({ event: event1Id });
    assertEquals(getEvent1Result1.length, 1, "Event should be found after creation.");
    let event1 = getEvent1Result1[0];
    assertEquals(event1.status, "upcoming", "Event status should be 'upcoming' initially.");

    // Simulate event passing and system completes it
    // For testing, we create an event that is already in the past, then complete it.
    console.log("Action: System completes an event that has passed.");
    const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    pastDate.setHours(8, 0, 0, 0); // Normalize time
    const pastEventCreateResult = await eventConcept.createEvent({
      organizer: organizerAlice,
      name: "Past Workshop",
      date: pastDate,
      duration: 30, // Ended 1.5 hours ago
      location: "Online",
      description: "Past event for completion test",
    });
    assertNotEquals("error" in pastEventCreateResult, true, "Past event creation should succeed.");
    const { event: pastEventId } = pastEventCreateResult as { event: ID };

    const completeResult = await eventConcept.completeEvent({ event: pastEventId });
    assertNotEquals("error" in completeResult, true, `completeEvent should succeed: ${JSON.stringify(completeResult)}`);
    const getPastEventResult = await eventConcept._getEventById({ event: pastEventId });
    assertEquals(getPastEventResult.length, 1, "Past event should be found after completion.");
    let pastEvent = getPastEventResult[0];
    assertEquals(pastEvent.status, "completed", "Past event status should be 'completed'.");
    console.log(`Past event ${pastEventId} completed.`);

    // Organizer cancels an event
    console.log(`Action: Alice cancels event ${event1Id}.`);
    const cancelResult = await eventConcept.cancelEvent({ organizer: organizerAlice, event: event1Id });
    assertEquals("error" in cancelResult, false, `cancelEvent should succeed: ${JSON.stringify(cancelResult)}`);
    const getEvent1Result2 = await eventConcept._getEventById({ event: event1Id });
    assertEquals(getEvent1Result2.length, 1, "Event should be found after cancellation.");
    event1 = getEvent1Result2[0];
    assertEquals(event1.status, "cancelled", "Event status should be 'cancelled' after cancellation.");
    console.log(`Event ${event1Id} cancelled.`);

    // Organizer un-cancels the event
    console.log(`Action: Alice un-cancels event ${event1Id}.`);
    const unCancelResult = await eventConcept.unCancelEvent({ organizer: organizerAlice, event: event1Id });
    assertNotEquals("error" in unCancelResult, true, `unCancelEvent should succeed: ${JSON.stringify(unCancelResult)}`);
    const getEvent1Result3 = await eventConcept._getEventById({ event: event1Id });
    assertEquals(getEvent1Result3.length, 1, "Event should be found after un-cancellation.");
    event1 = getEvent1Result3[0];
    assertEquals(event1.status, "upcoming", "Event status should be 'upcoming' after un-cancellation.");
    console.log(`Event ${event1Id} un-cancelled.`);

    // Organizer deletes an event
    console.log(`Action: Alice deletes event ${event1Id}.`);
    const deleteResult = await eventConcept.deleteEvent({ organizer: organizerAlice, event: event1Id });
    assertEquals("error" in deleteResult, false, `deleteEvent should succeed: ${JSON.stringify(deleteResult)}`);
    const deletedEvent = await eventConcept._getEventById({ event: event1Id });
    assertEquals(deletedEvent.length, 0, "Deleted event should no longer be found."); // Check for empty array
    console.log(`Event ${event1Id} deleted.`);

    console.log("--- End Principle Test Trace ---");
  } finally {
    await client.close();
  }
});

Deno.test("Action: createEvent - success and preconditions", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- createEvent Tests ---");
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours from now
    futureDate.setHours(10, 0, 0, 0); // Normalize time
    const validEventDetails = {
      organizer: organizerAlice,
      name: "New Event",
      date: futureDate,
      duration: 90,
      location: "Virtual",
      description: "A new event for testing.",
    };

    console.log("Test: Successful creation.");
    const result = await eventConcept.createEvent(validEventDetails);
    assertNotEquals("error" in result, true, `Expected successful creation, got error: ${JSON.stringify(result)}`);
    const { event: newEventId } = result as { event: ID };
    assertExists(newEventId, "A new event ID should be returned.");
    const fetchedEventResult = await eventConcept._getEventById({ event: newEventId });
    assertEquals(fetchedEventResult.length, 1, "The created event should be retrievable.");
    const fetchedEvent = fetchedEventResult[0];
    assertEquals(fetchedEvent.name, validEventDetails.name);
    assertEquals(fetchedEvent.organizer, validEventDetails.organizer);
    assertEquals(fetchedEvent.status, "upcoming");
    console.log("Success: Event created and verified.");

    console.log("Test: Failure - date in the past.");
    const pastDate = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes ago
    pastDate.setHours(8, 0, 0, 0); // Normalize time
    const pastDateResult = await eventConcept.createEvent({ ...validEventDetails, date: pastDate });
    assertEquals("error" in pastDateResult, true, "Should not create event with past date.");
    assertEquals((pastDateResult as { error: string }).error, "Event date cannot be in the past.");
    console.log("Success: Rejected past date.");

    console.log("Test: Failure - empty name.");
    const emptyNameResult = await eventConcept.createEvent({ ...validEventDetails, name: " " });
    assertEquals("error" in emptyNameResult, true, "Should not create event with empty name.");
    assertEquals((emptyNameResult as { error: string }).error, "Event name cannot be empty.");
    console.log("Success: Rejected empty name.");

    console.log("Test: Failure - empty location.");
    const emptyLocationResult = await eventConcept.createEvent({ ...validEventDetails, location: "" });
    assertEquals("error" in emptyLocationResult, true, "Should not create event with empty location.");
    assertEquals((emptyLocationResult as { error: string }).error, "Event location cannot be empty.");
    console.log("Success: Rejected empty location.");

    console.log("Test: Failure - empty description.");
    const emptyDescriptionResult = await eventConcept.createEvent({ ...validEventDetails, description: " " });
    assertEquals("error" in emptyDescriptionResult, true, "Should not create event with empty description.");
    assertEquals((emptyDescriptionResult as { error: string }).error, "Event description cannot be empty.");
    console.log("Success: Rejected empty description.");

    console.log("Test: Failure - non-positive duration.");
    const zeroDurationResult = await eventConcept.createEvent({ ...validEventDetails, duration: 0 });
    assertEquals("error" in zeroDurationResult, true, "Should not create event with zero duration.");
    assertEquals((zeroDurationResult as { error: string }).error, "Event duration must be a positive number of minutes.");
    const negativeDurationResult = await eventConcept.createEvent({ ...validEventDetails, duration: -30 });
    assertEquals("error" in negativeDurationResult, true, "Should not create event with negative duration.");
    assertEquals((negativeDurationResult as { error: string }).error, "Event duration must be a positive number of minutes.");
    console.log("Success: Rejected non-positive duration.");

    console.log("--- End createEvent Tests ---");
  } finally {
    await client.close();
  }
});

Deno.test("Action: modifyEvent - success and preconditions", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- modifyEvent Tests ---");
    const initialDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
    initialDate.setHours(11, 0, 0, 0); // Normalize time
    const createResult = await eventConcept.createEvent({
      organizer: organizerAlice,
      name: "Old Name",
      date: initialDate,
      duration: 30,
      location: "Old Location",
      description: "Old Description",
    });
    assertNotEquals("error" in createResult, true, `createEvent should succeed: ${JSON.stringify(createResult)}`);
    const { event: eventId } = createResult as { event: ID };

    console.log("Test: Successful modification.");
    const newDate = new Date(Date.now() + 1000 * 60 * 90); // 1.5 hours from now
    newDate.setHours(12, 0, 0, 0); // Normalize time
    const modifyResult = await eventConcept.modifyEvent({
      organizer: organizerAlice,
      event: eventId,
      newName: "New Name",
      newDate: newDate,
      newDuration: 45,
      newLocation: "New Location",
      newDescription: "New Description",
    });
    assertNotEquals("error" in modifyResult, true, `Expected successful modification, got error: ${JSON.stringify(modifyResult)}`);
    const modifiedEventResult = await eventConcept._getEventById({ event: eventId });
    assertEquals(modifiedEventResult.length, 1);
    const modifiedEvent = modifiedEventResult[0];
    assertEquals(modifiedEvent.name, "New Name");
    assertEquals(modifiedEvent.date.getTime(), newDate.getTime());
    assertEquals(modifiedEvent.duration, 45);
    assertEquals(modifiedEvent.location, "New Location");
    assertEquals(modifiedEvent.description, "New Description");
    console.log("Success: Event modified and verified.");

    console.log("Test: Failure - non-existent event.");
    const nonExistentId = "event:fake" as ID;
    const nonExistentResult = await eventConcept.modifyEvent({
      organizer: organizerAlice,
      event: nonExistentId,
      newName: "x", newDate: new Date(Date.now() + 1000 * 60 * 5), newDuration: 1, newLocation: "y", newDescription: "z",
    });
    assertEquals("error" in nonExistentResult, true, "Should fail for non-existent event.");
    assertEquals((nonExistentResult as { error: string }).error, `Event with ID ${nonExistentId} not found.`);
    console.log("Success: Rejected non-existent event.");

    console.log("Test: Failure - unauthorized organizer.");
    const unauthorizedResult = await eventConcept.modifyEvent({
      organizer: organizerBob, // Different organizer
      event: eventId,
      newName: "x", newDate: new Date(Date.now() + 1000 * 60 * 5), newDuration: 1, newLocation: "y", newDescription: "z",
    });
    assertEquals("error" in unauthorizedResult, true, "Should fail for unauthorized organizer.");
    assertEquals((unauthorizedResult as { error: string }).error, "Only the event organizer can modify the event.");
    console.log("Success: Rejected unauthorized modification.");

    console.log("Test: Failure - new date in the past.");
    const pastNewDate = new Date(Date.now() - 1000 * 60 * 10); // 10 minutes ago
    pastNewDate.setHours(8, 0, 0, 0); // Normalize time
    const pastNewDateResult = await eventConcept.modifyEvent({
      organizer: organizerAlice,
      event: eventId,
      newName: "Valid Name", newDate: pastNewDate, newDuration: 60, newLocation: "Valid Location", newDescription: "Valid Description",
    });
    assertEquals("error" in pastNewDateResult, true, "Should fail with past new date.");
    assertEquals((pastNewDateResult as { error: string }).error, "New event date cannot be in the past.");
    console.log("Success: Rejected past new date.");

    console.log("Test: Failure - no actual changes (precondition: at least one field must differ).");
    const noChangeResult = await eventConcept.modifyEvent({
      organizer: organizerAlice,
      event: eventId,
      newName: modifiedEvent.name,
      newDate: modifiedEvent.date,
      newDuration: modifiedEvent.duration,
      newLocation: modifiedEvent.location,
      newDescription: modifiedEvent.description,
    });
    assertEquals("error" in noChangeResult, true, "Should indicate no changes were applied if all fields are identical.");
    assertEquals((noChangeResult as { error: string }).error, "At least one field must differ from the original event details to modify.");
    console.log("Success: Indicated no changes applied.");

    console.log("Test: Failure - non-positive new duration.");
    const invalidDurationResult = await eventConcept.modifyEvent({
      organizer: organizerAlice,
      event: eventId,
      newName: "Modified Name", newDate: new Date(Date.now() + 1000 * 60 * 5), newDuration: 0, newLocation: "Test Loc", newDescription: "Test Desc",
    });
    assertEquals("error" in invalidDurationResult, true, "Should fail with non-positive duration.");
    assertEquals((invalidDurationResult as { error: string }).error, "New event duration must be a positive number of minutes.");
    console.log("Success: Rejected non-positive new duration.");

    console.log("--- End modifyEvent Tests ---");
  } finally {
    await client.close();
  }
});

Deno.test("Action: cancelEvent - success and preconditions", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- cancelEvent Tests ---");
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 2);
    futureDate.setHours(10, 0, 0, 0); // Normalize time
    const createResult = await eventConcept.createEvent({
      organizer: organizerAlice,
      name: "Meeting to Cancel",
      date: futureDate,
      duration: 60,
      location: "Office",
      description: "Important talk",
    });
    assertNotEquals("error" in createResult, true, `createEvent should succeed: ${JSON.stringify(createResult)}`);
    const { event: eventId } = createResult as { event: ID };

    console.log("Test: Successful cancellation.");
    const cancelResult = await eventConcept.cancelEvent({ organizer: organizerAlice, event: eventId });
    assertEquals("error" in cancelResult, false, `Expected successful cancellation, got error: ${JSON.stringify(cancelResult)}`);
    const cancelledEventResult = await eventConcept._getEventById({ event: eventId });
    assertEquals(cancelledEventResult.length, 1);
    const cancelledEvent = cancelledEventResult[0];
    assertEquals(cancelledEvent.status, "cancelled");
    console.log("Success: Event cancelled and verified.");

    console.log("Test: Failure - non-existent event.");
    const nonExistentId = "event:fake" as ID;
    const nonExistentResult = await eventConcept.cancelEvent({ organizer: organizerAlice, event: nonExistentId });
    assertEquals("error" in nonExistentResult, true, "Should fail for non-existent event.");
    assertEquals((nonExistentResult as { error: string }).error, `Event with ID ${nonExistentId} not found.`);
    console.log("Success: Rejected non-existent event.");

    console.log("Test: Failure - unauthorized organizer.");
    const unauthorizedResult = await eventConcept.cancelEvent({ organizer: organizerBob, event: eventId });
    assertEquals("error" in unauthorizedResult, true, "Should fail for unauthorized organizer.");
    assertEquals((unauthorizedResult as { error: string }).error, "Only the event organizer can cancel the event.");
    console.log("Success: Rejected unauthorized cancellation.");

    console.log("Test: Failure - already cancelled event.");
    const alreadyCancelledResult = await eventConcept.cancelEvent({ organizer: organizerAlice, event: eventId });
    assertEquals("error" in alreadyCancelledResult, true, "Should fail if event is already cancelled.");
    assertEquals((alreadyCancelledResult as { error: string }).error, "Event cannot be cancelled as its status is not 'upcoming'.");
    console.log("Success: Rejected re-cancellation.");

    console.log("Test: Failure - completed event.");
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 2); // 2 hours ago
    pastDate.setHours(8, 0, 0, 0); // Normalize time
    const pastEventCreateResult = await eventConcept.createEvent({
      organizer: organizerAlice, name: "Completed Event", date: pastDate, duration: 1, location: "Here", description: "Desc",
    });
    assertNotEquals("error" in pastEventCreateResult, true);
    const { event: completedEventId } = pastEventCreateResult as { event: ID };
    await eventConcept.completeEvent({ event: completedEventId });
    const completedEventResult = await eventConcept._getEventById({ event: completedEventId });
    assertEquals(completedEventResult.length, 1);
    const completedEvent = completedEventResult[0];
    assertEquals(completedEvent.status, "completed", "Setup: Event should be completed.");
    const cancelCompletedResult = await eventConcept.cancelEvent({ organizer: organizerAlice, event: completedEventId });
    assertEquals("error" in cancelCompletedResult, true, "Should fail to cancel a completed event.");
    assertEquals((cancelCompletedResult as { error: string }).error, "Event cannot be cancelled as its status is not 'upcoming'.");
    console.log("Success: Rejected cancellation of a completed event.");

    console.log("--- End cancelEvent Tests ---");
  } finally {
    await client.close();
  }
});

Deno.test("Action: unCancelEvent - success and preconditions", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- unCancelEvent Tests ---");
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 3);
    futureDate.setHours(10, 0, 0, 0); // Normalize time
    const createResult = await eventConcept.createEvent({
      organizer: organizerAlice,
      name: "Meeting to Uncancel",
      date: futureDate,
      duration: 60,
      location: "Online",
      description: "Re-plan meeting",
    });
    assertNotEquals("error" in createResult, true);
    const { event: eventId } = createResult as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerAlice, event: eventId });
    const eventToUncancelResult1 = await eventConcept._getEventById({ event: eventId });
    assertEquals(eventToUncancelResult1.length, 1);
    let eventToUncancel = eventToUncancelResult1[0];
    assertEquals(eventToUncancel.status, "cancelled", "Setup: Event should be cancelled.");

    console.log("Test: Successful un-cancellation.");
    const unCancelResult = await eventConcept.unCancelEvent({ organizer: organizerAlice, event: eventId });
    assertNotEquals("error" in unCancelResult, true, `Expected successful un-cancellation, got error: ${JSON.stringify(unCancelResult)}`);
    const eventToUncancelResult2 = await eventConcept._getEventById({ event: eventId });
    assertEquals(eventToUncancelResult2.length, 1);
    eventToUncancel = eventToUncancelResult2[0];
    assertEquals(eventToUncancel.status, "upcoming");
    console.log("Success: Event un-cancelled and verified.");

    // Re-cancel for further tests
    await eventConcept.cancelEvent({ organizer: organizerAlice, event: eventId });
    const eventToUncancelResult3 = await eventConcept._getEventById({ event: eventId });
    assertEquals(eventToUncancelResult3.length, 1);
    eventToUncancel = eventToUncancelResult3[0];
    assertEquals(eventToUncancel.status, "cancelled", "Setup: Event should be cancelled again.");

    console.log("Test: Failure - non-existent event.");
    const nonExistentId = "event:fake" as ID;
    const nonExistentResult = await eventConcept.unCancelEvent({ organizer: organizerAlice, event: nonExistentId });
    assertEquals("error" in nonExistentResult, true, "Should fail for non-existent event.");
    assertEquals((nonExistentResult as { error: string }).error, `Event with ID ${nonExistentId} not found.`);
    console.log("Success: Rejected non-existent event.");

    console.log("Test: Failure - unauthorized organizer.");
    const unauthorizedResult = await eventConcept.unCancelEvent({ organizer: organizerBob, event: eventId });
    assertEquals("error" in unauthorizedResult, true, "Should fail for unauthorized organizer.");
    assertEquals((unauthorizedResult as { error: string }).error, "Only the event organizer can un-cancel the event.");
    console.log("Success: Rejected unauthorized un-cancellation.");

    console.log("Test: Failure - event not cancelled (upcoming).");
    const createUpcomingResult = await eventConcept.createEvent({
      organizer: organizerAlice, name: "Another upcoming", date: futureDate, duration: 60, location: "Venue", description: "Talk",
    });
    assertNotEquals("error" in createUpcomingResult, true);
    const { event: upcomingEventId } = createUpcomingResult as { event: ID };
    const uncancelUpcomingResult = await eventConcept.unCancelEvent({ organizer: organizerAlice, event: upcomingEventId });
    assertEquals("error" in uncancelUpcomingResult, true, "Should fail to un-cancel an upcoming event.");
    assertEquals((uncancelUpcomingResult as { error: string }).error, "Event cannot be un-cancelled as its status is not 'cancelled'.");
    console.log("Success: Rejected un-cancellation of an upcoming event.");

    console.log("Test: Failure - event has already ended (in the past).");
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 2); // 2 hours ago
    pastDate.setHours(8, 0, 0, 0); // Normalize time
    const pastEventDuration = 30;
    const pastEventCreateResult = await eventConcept.createEvent({
      organizer: organizerAlice, name: "Past Event to Uncancel", date: pastDate, duration: pastEventDuration, location: "Online", description: "Review",
    });
    assertNotEquals("error" in pastEventCreateResult, true);
    const { event: pastEventId } = pastEventCreateResult as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerAlice, event: pastEventId });
    const pastCancelledEventResult = await eventConcept._getEventById({ event: pastEventId });
    assertEquals(pastCancelledEventResult.length, 1);
    let pastCancelledEvent = pastCancelledEventResult[0];
    assertEquals(pastCancelledEvent.status, "cancelled", "Setup: Past event should be cancelled.");

    const uncancelPastResult = await eventConcept.unCancelEvent({ organizer: organizerAlice, event: pastEventId });
    assertEquals("error" in uncancelPastResult, true, "Should fail to un-cancel an event that has already ended.");
    assertEquals((uncancelPastResult as { error: string }).error, "Cannot un-cancel an event that has already ended.");
    console.log("Success: Rejected un-cancellation of an already ended event.");

    console.log("--- End unCancelEvent Tests ---");
  } finally {
    await client.close();
  }
});

Deno.test("Action: deleteEvent - success and preconditions", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- deleteEvent Tests ---");
    const futureDate = new Date(Date.now() + 1000 * 60 * 60);
    futureDate.setHours(10, 0, 0, 0); // Normalize time
    const createResult = await eventConcept.createEvent({
      organizer: organizerAlice,
      name: "Event to Delete",
      date: futureDate,
      duration: 60,
      location: "Library",
      description: "Study session",
    });
    assertNotEquals("error" in createResult, true);
    const { event: eventId } = createResult as { event: ID };

    console.log("Test: Successful deletion.");
    const deleteResult = await eventConcept.deleteEvent({ organizer: organizerAlice, event: eventId });
    assertEquals("error" in deleteResult, false, `Expected successful deletion, got error: ${JSON.stringify(deleteResult)}`);
    const deletedEvent = await eventConcept._getEventById({ event: eventId });
    assertEquals(deletedEvent.length, 0, "Deleted event should no longer be found."); // Check for empty array
    console.log("Success: Event deleted and verified.");

    console.log("Test: Failure - non-existent event.");
    const nonExistentId = "event:fake" as ID;
    const nonExistentResult = await eventConcept.deleteEvent({ organizer: organizerAlice, event: nonExistentId });
    assertEquals("error" in nonExistentResult, true, "Should fail for non-existent event.");
    assertEquals((nonExistentResult as { error: string }).error, `Event with ID ${nonExistentId} not found.`);
    console.log("Success: Rejected non-existent event.");

    console.log("Test: Failure - unauthorized organizer.");
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerAlice, name: "Event to Delete 2", date: futureDate, duration: 60, location: "Park", description: "Picnic",
    });
    assertNotEquals("error" in createResult2, true);
    const { event: eventId2 } = createResult2 as { event: ID };
    const unauthorizedResult = await eventConcept.deleteEvent({ organizer: organizerBob, event: eventId2 });
    assertEquals("error" in unauthorizedResult, true, "Should fail for unauthorized organizer.");
    assertEquals((unauthorizedResult as { error: string }).error, "Only the event organizer can delete the event.");
    console.log("Success: Rejected unauthorized deletion.");

    console.log("--- End deleteEvent Tests ---");
  } finally {
    await client.close();
  }
});

Deno.test("Action: completeEvent - success and preconditions (system action)", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- completeEvent Tests ---");
    // Create an event that just ended (1 minute ago)
    const pastDate = new Date(Date.now() - 1000 * 60 * 30); // 30 minutes ago
    pastDate.setHours(9, 0, 0, 0); // Normalize time
    const duration = 29; // Event ended 1 minute ago
    const createResult = await eventConcept.createEvent({
      organizer: organizerAlice,
      name: "Recently Ended Event",
      date: pastDate,
      duration: duration,
      location: "Server Room",
      description: "Maintenance window",
    });
    assertNotEquals("error" in createResult, true);
    const { event: eventId } = createResult as { event: ID };
    const eventToCompleteResult1 = await eventConcept._getEventById({ event: eventId });
    assertEquals(eventToCompleteResult1.length, 1);
    let eventToComplete = eventToCompleteResult1[0];
    assertEquals(eventToComplete.status, "upcoming", "Setup: Event should be upcoming.");

    console.log("Test: Successful completion.");
    const completeResult = await eventConcept.completeEvent({ event: eventId });
    assertEquals("error" in completeResult, false, `Expected successful completion, got error: ${JSON.stringify(completeResult)}`);
    const eventToCompleteResult2 = await eventConcept._getEventById({ event: eventId });
    assertEquals(eventToCompleteResult2.length, 1);
    eventToComplete = eventToCompleteResult2[0];
    assertEquals(eventToComplete.status, "completed");
    console.log("Success: Event completed and verified.");

    console.log("Test: Failure - non-existent event.");
    const nonExistentId = "event:fake" as ID;
    const nonExistentResult = await eventConcept.completeEvent({ event: nonExistentId });
    assertEquals("error" in nonExistentResult, true, "Should fail for non-existent event.");
    assertEquals((nonExistentResult as { error: string }).error, `Event with ID ${nonExistentId} not found.`);
    console.log("Success: Rejected non-existent event.");

    console.log("Test: Failure - already completed event.");
    const alreadyCompletedResult = await eventConcept.completeEvent({ event: eventId });
    assertEquals("error" in alreadyCompletedResult, true, "Should fail if event is already completed.");
    assertEquals((alreadyCompletedResult as { error: string }).error, "Event cannot be completed as its status is not 'upcoming'.");
    console.log("Success: Rejected re-completion.");

    console.log("Test: Failure - cancelled event.");
    const futureDate = new Date(Date.now() + 1000 * 60 * 60);
    futureDate.setHours(10, 0, 0, 0); // Normalize time
    const cancelledEventCreateResult = await eventConcept.createEvent({
      organizer: organizerAlice, name: "Cancelled event", date: futureDate, duration: 60, location: "Desk", description: "Break",
    });
    assertNotEquals("error" in cancelledEventCreateResult, true);
    const { event: cancelledEventId } = cancelledEventCreateResult as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerAlice, event: cancelledEventId });
    const cancelledEventResult = await eventConcept._getEventById({ event: cancelledEventId });
    assertEquals(cancelledEventResult.length, 1);
    const cancelledEvent = cancelledEventResult[0];
    assertEquals(cancelledEvent.status, "cancelled", "Setup: Event should be cancelled.");
    const completeCancelledResult = await eventConcept.completeEvent({ event: cancelledEventId });
    assertEquals("error" in completeCancelledResult, true, "Should fail to complete a cancelled event.");
    assertEquals((completeCancelledResult as { error: string }).error, "Event cannot be completed as its status is not 'upcoming'.");
    console.log("Success: Rejected completion of a cancelled event.");

    console.log("Test: Failure - event has not yet ended.");
    const futureEventCreateResult = await eventConcept.createEvent({
      organizer: organizerAlice, name: "Future event", date: new Date(Date.now() + 1000 * 60 * 5), duration: 10, location: "Cloud", description: "Meeting",
    });
    assertNotEquals("error" in futureEventCreateResult, true);
    const { event: futureEventId } = futureEventCreateResult as { event: ID };
    const completeFutureResult = await eventConcept.completeEvent({ event: futureEventId });
    assertEquals("error" in completeFutureResult, true, "Should fail to complete an event that has not yet ended.");
    assertEquals((completeFutureResult as { error: string }).error, "Event cannot be completed as it has not yet ended.");
    console.log("Success: Rejected completion of a future event.");

    console.log("--- End completeEvent Tests ---");
  } finally {
    await client.close();
  }
});

Deno.test("Queries: _getEventById, _getEventsByOrganizer, _getEventsByStatus, _getAllEvents", async () => {
  const [

```
