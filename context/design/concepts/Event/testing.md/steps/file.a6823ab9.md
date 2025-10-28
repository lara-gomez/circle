---
timestamp: 'Mon Oct 27 2025 02:58:40 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_025840.81c3d218.md]]'
content_id: a6823ab989841915897ca1d50f5324c71bd8840706f60f36b6dd72df65b16dc1
---

# file: src/event/EventConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import EventConcept from "./EventConcept.ts";

const organizerA = "user:Alice" as ID;
const otherUserB = "user:Bob" as ID;

Deno.test("EventConcept: Principle - User organizes, tracks, and manages event lifecycle", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- Principle Test: Event Lifecycle ---");

    const now = new Date();
    // Use dates slightly in the future to ensure validity for initial creation
    const futureDate1 = new Date(now.getTime() + 1 * 60 * 1000); // 1 minute from now
    const duration1 = 30; // 30 minutes
    const futureDate2 = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
    const duration2 = 60; // 60 minutes

    // 1. A user can schedule an event by providing essential details
    console.log("Trace: OrganizerA creates Event 1 (Team Meeting).");
    const createResult1 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Team Meeting",
      date: futureDate1.toISOString(),
      duration: duration1,
      location: "Online",
      description: "Discuss Q3 strategy.",
    });
    assertNotEquals("error" in createResult1, true, `Event 1 creation failed: ${JSON.stringify(createResult1)}`);
    const { event: event1Id } = createResult1 as { event: ID };
    assertExists(event1Id, "Event 1 ID should be returned.");

    let event1Doc = (await eventConcept._getEventById({ event: event1Id }))[0];
    assertEquals(event1Doc.status, "upcoming", "Event 1 initial status should be 'upcoming'.");
    assertEquals(event1Doc.organizer, organizerA, "Event 1 organizer should be correct.");
    console.log(`Event 1 created: ID=${event1Id}, Status=${event1Doc.status}`);

    console.log("Trace: OrganizerA creates Event 2 (Workshop).");
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Workshop: Deno & MongoDB",
      date: futureDate2.toISOString(),
      duration: duration2,
      location: "Main Auditorium",
      description: "Hands-on session for Deno and MongoDB.",
    });
    assertNotEquals("error" in createResult2, true, `Event 2 creation failed: ${JSON.stringify(createResult2)}`);
    const { event: event2Id } = createResult2 as { event: ID };
    assertExists(event2Id, "Event 2 ID should be returned.");
    let event2Doc = (await eventConcept._getEventById({ event: event2Id }))[0];
    assertEquals(event2Doc.status, "upcoming", "Event 2 initial status should be 'upcoming'.");
    console.log(`Event 2 created: ID=${event2Id}, Status=${event2Doc.status}`);


    // 2. The organizer retains the ability to cancel an event beforehand
    console.log(`Trace: OrganizerA cancels Event 1 (${event1Id}).`);
    const cancelResult = await eventConcept.cancelEvent({ organizer: organizerA, event: event1Id });
    assertEquals("error" in cancelResult, false, `Event 1 cancellation failed: ${JSON.stringify(cancelResult)}`);
    event1Doc = (await eventConcept._getEventById({ event: event1Id }))[0];
    assertEquals(event1Doc.status, "cancelled", "Event 1 status should be 'cancelled'.");
    console.log(`Event 1 status after cancellation: ${event1Doc.status}`);

    // 3. The organizer has the flexibility to restore it if circumstances reverse
    console.log(`Trace: OrganizerA un-cancels Event 1 (${event1Id}).`);
    const uncancelResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: event1Id });
    assertNotEquals("error" in uncancelResult, true, `Event 1 un-cancellation failed: ${JSON.stringify(uncancelResult)}`);
    event1Doc = (await eventConcept._getEventById({ event: event1Id }))[0];
    assertEquals(event1Doc.status, "upcoming", "Event 1 status should be restored to 'upcoming'.");
    console.log(`Event 1 status after un-cancellation: ${event1Doc.status}`);

    // 4. After the scheduled time, the event naturally transitions to a completed state
    // Simulate Event 2 being in the past for completion check
    console.log(`Trace: Simulating Event 2 (${event2Id}) being in the past for completion.`);
    const pastEndTimeForEvent2 = new Date(now.getTime() - (duration2 + 1) * 60 * 1000); // 1 minute + 1 second ago
    await eventConcept.events.updateOne({ _id: event2Id }, { $set: { date: pastEndTimeForEvent2 } });
    console.log(`Event 2 date manually set to: ${pastEndTimeForEvent2.toISOString()}`);

    console.log(`Trace: System action: completeEvent for Event 2 (${event2Id}).`);
    const completeResult = await eventConcept.completeEvent({ event: event2Id });
    assertEquals("error" in completeResult, false, `Event 2 completion failed: ${JSON.stringify(completeResult)}`);
    event2Doc = (await eventConcept._getEventById({ event: event2Id }))[0];
    assertEquals(event2Doc.status, "completed", "Event 2 status should be 'completed'.");
    console.log(`Event 2 status after completion: ${event2Doc.status}`);

    // 5. Organizers may also choose to delete events from the system
    console.log(`Trace: OrganizerA deletes Event 1 (${event1Id}).`);
    const deleteResult = await eventConcept.deleteEvent({ organizer: organizerA, event: event1Id });
    assertEquals("error" in deleteResult, false, `Event 1 deletion failed: ${JSON.stringify(deleteResult)}`);
    const deletedEvent1 = await eventConcept._getEventById({ event: event1Id });
    assertEquals(deletedEvent1.length, 0, "Event 1 should no longer exist after deletion.");
    console.log(`Event 1 deleted. Count for Event 1: ${deletedEvent1.length}`);

    console.log("Principle test completed successfully: The event lifecycle (create, cancel, uncancel, complete, delete) is correctly modeled.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: createEvent - success and validation checks", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- Testing createEvent Action ---");
    const now = new Date();
    const futureDate = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes in the future

    console.log("Test Case: Successful event creation.");
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Planning Session",
      date: futureDate.toISOString(),
      duration: 60,
      location: "Zoom Call",
      description: "Weekly planning for sprints.",
    });
    assertNotEquals("error" in createResult, true, `Expected success, got error: ${JSON.stringify(createResult)}`);
    const { event: newEventId } = createResult as { event: ID };
    assertExists(newEventId, "A new event ID should be generated.");

    const event = (await eventConcept._getEventById({ event: newEventId }))[0];
    assertEquals(event.name, "Planning Session");
    assertEquals(event.organizer, organizerA);
    assertEquals(event.status, "upcoming");
    assertEquals(event.date.getTime(), futureDate.getTime(), "Event date should match input.");
    assertEquals(event.duration, 60);
    console.log(`Success: Event ${newEventId} created.`);

    console.log("Test Case: Failure - creating event with a past date.");
    const pastDate = new Date(now.getTime() - 1 * 60 * 1000); // 1 minute in the past
    const pastDateResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Past Event Attempt",
      date: pastDate.toISOString(),
      duration: 30,
      location: "Anywhere",
      description: "Should fail.",
    });
    assertEquals("error" in pastDateResult, true, "Expected error for past date.");
    assertEquals((pastDateResult as { error: string }).error, "Event date cannot be in the past.", "Error message for past date should be correct.");
    console.log(`Failure: Past date creation prevented. Message: ${(pastDateResult as { error: string }).error}`);

    console.log("Test Case: Failure - creating event with an empty name.");
    const emptyNameResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "",
      date: futureDate.toISOString(),
      duration: 30,
      location: "Online",
      description: "Valid description.",
    });
    assertEquals("error" in emptyNameResult, true, "Expected error for empty name.");
    assertEquals((emptyNameResult as { error: string }).error, "Event name cannot be empty.", "Error message for empty name should be correct.");
    console.log(`Failure: Empty name creation prevented. Message: ${(emptyNameResult as { error: string }).error}`);

    console.log("Test Case: Failure - creating event with non-positive duration.");
    const zeroDurationResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Zero Duration Event",
      date: futureDate.toISOString(),
      duration: 0,
      location: "Location",
      description: "Description",
    });
    assertEquals("error" in zeroDurationResult, true, "Expected error for zero duration.");
    assertEquals((zeroDurationResult as { error: string }).error, "Event duration must be a positive number of minutes.", "Error message for zero duration should be correct.");
    console.log(`Failure: Zero duration creation prevented. Message: ${(zeroDurationResult as { error: string }).error}`);

  } finally {
    await client.close();
  }
});

Deno.test("Action: modifyEvent - success and validation checks", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- Testing modifyEvent Action ---");
    const now = new Date();
    const initialDate = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    const newDate = new Date(now.getTime() + 20 * 60 * 1000); // 20 minutes from now

    // Setup: create an event
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Initial Event",
      date: initialDate.toISOString(),
      duration: 60,
      location: "Initial Location",
      description: "Initial Description",
    });
    const { event: eventId } = createResult as { event: ID };
    console.log(`Setup: Event ${eventId} created for modification tests.`);

    console.log("Test Case: Successful event modification.");
    const modifyResult = await eventConcept.modifyEvent({
      organizer: organizerA,
      event: eventId,
      newName: "Updated Event Name",
      newDate: newDate.toISOString(),
      newDuration: 90,
      newLocation: "Updated Location",
      newDescription: "Updated Description.",
    });
    assertNotEquals("error" in modifyResult, true, `Expected success, got error: ${JSON.stringify(modifyResult)}`);

    const updatedEvent = (await eventConcept._getEventById({ event: eventId }))[0];
    assertEquals(updatedEvent.name, "Updated Event Name", "Event name should be updated.");
    assertEquals(updatedEvent.date.getTime(), newDate.getTime(), "Event date should be updated.");
    assertEquals(updatedEvent.duration, 90, "Event duration should be updated.");
    assertEquals(updatedEvent.location, "Updated Location", "Event location should be updated.");
    assertEquals(updatedEvent.description, "Updated Description.", "Event description should be updated.");
    console.log(`Success: Event ${eventId} modified.`);

    console.log("Test Case: Failure - modification by non-organizer.");
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
    assertEquals((nonOrganizerModifyResult as { error: string }).error, "Only the event organizer can modify the event.", "Error message for non-organizer should be correct.");
    console.log(`Failure: Non-organizer modification prevented. Message: ${(nonOrganizerModifyResult as { error: string }).error}`);

    console.log("Test Case: Failure - modification with no actual changes.");
    const currentEventState = (await eventConcept._getEventById({ event: eventId }))[0]; // Fetch current state
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
    assertEquals((noChangeResult as { error: string }).error, "At least one field must differ from the original event details to modify.", "Error message for no changes should be correct.");
    console.log(`Failure: No changes modification prevented. Message: ${(noChangeResult as { error: string }).error}`);

    console.log("Test Case: Failure - modification with a new date in the past.");
    const pastNewDate = new Date(now.getTime() - 1 * 60 * 1000); // 1 minute in the past
    const pastNewDateResult = await eventConcept.modifyEvent({
      organizer: organizerA,
      event: eventId,
      newName: "Still Valid Name",
      newDate: pastNewDate.toISOString(),
      newDuration: currentEventState.duration,
      newLocation: currentEventState.location,
      newDescription: currentEventState.description,
    });
    assertEquals("error" in pastNewDateResult, true, "Expected error for new date in the past.");
    assertEquals((pastNewDateResult as { error: string }).error, "New event date cannot be in the past.", "Error message for past new date should be correct.");
    console.log(`Failure: Past new date modification prevented. Message: ${(pastNewDateResult as { error: string }).error}`);

    console.log("Test Case: Failure - modification with empty new name.");
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
    console.log(`Failure: Empty new name modification prevented. Message: ${(emptyNewNameResult as { error: string }).error}`);

  } finally {
    await client.close();
  }
});

Deno.test("Action: cancelEvent - success and validation checks", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- Testing cancelEvent Action ---");
    const futureDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes in future

    // Setup: Create an event
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Cancellation Test Event",
      date: futureDate.toISOString(),
      duration: 60,
      location: "Online",
      description: "Event to test cancellation.",
    });
    const { event: eventId } = createResult as { event: ID };
    console.log(`Setup: Event ${eventId} created for cancellation tests.`);

    console.log("Test Case: Successful event cancellation.");
    const cancelResult = await eventConcept.cancelEvent({ organizer: organizerA, event: eventId });
    assertEquals("error" in cancelResult, false, "Expected success for cancellation.");
    const cancelledEvent = (await eventConcept._getEventById({ event: eventId }))[0];
    assertEquals(cancelledEvent.status, "cancelled", "Event status should be 'cancelled'.");
    console.log(`Success: Event ${eventId} cancelled. Status: ${cancelledEvent.status}`);

    console.log("Test Case: Failure - cancellation of an already cancelled event.");
    const alreadyCancelledResult = await eventConcept.cancelEvent({ organizer: organizerA, event: eventId });
    assertEquals("error" in alreadyCancelledResult, true, "Expected error for cancelling already cancelled event.");
    assertEquals((alreadyCancelledResult as { error: string }).error, "Event cannot be cancelled as its status is not 'upcoming'.", "Error message for already cancelled should be correct.");
    console.log(`Failure: Already cancelled event prevented. Message: ${(alreadyCancelledResult as { error: string }).error}`);

    console.log("Test Case: Failure - cancellation by non-organizer.");
    const nonOrganizerCancelResult = await eventConcept.cancelEvent({ organizer: otherUserB, event: eventId });
    assertEquals("error" in nonOrganizerCancelResult, true, "Expected error for non-organizer.");
    assertEquals((nonOrganizerCancelResult as { error: string }).error, "Only the event organizer can cancel the event.", "Error message for non-organizer should be correct.");
    console.log(`Failure: Non-organizer cancellation prevented. Message: ${(nonOrganizerCancelResult as { error: string }).error}`);

    console.log("Test Case: Failure - cancellation of a completed event.");
    const now = new Date();
    const eventForCompletionDate = new Date(now.getTime() + 1 * 1000); // Starts 1 second from now
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
    console.log(`Setup: Event ${eventId2} created for completion then cancellation.`);

    // Manually set event's date to be in the past to make it eligible for completion
    const pastEndTimeForEvent2 = new Date(now.getTime() - (eventForCompletionDuration + 1) * 60 * 1000);
    await eventConcept.events.updateOne({ _id: eventId2 }, { $set: { date: pastEndTimeForEvent2 } });
    console.log(`Event ${eventId2} manually set to 'past' for completion.`);

    await eventConcept.completeEvent({ event: eventId2 }); // Complete it first
    const completedEvent = (await eventConcept._getEventById({ event: eventId2 }))[0];
    assertEquals(completedEvent.status, "completed", `Event ${eventId2} should be completed.`);
    console.log(`Event ${eventId2} completed.`);

    const cancelCompletedResult = await eventConcept.cancelEvent({ organizer: organizerA, event: eventId2 });
    assertEquals("error" in cancelCompletedResult, true, "Expected error for cancelling a completed event.");
    assertEquals((cancelCompletedResult as { error: string }).error, "Event cannot be cancelled as its status is not 'upcoming'.", "Error message for cancelling completed should be correct.");
    console.log(`Failure: Cancelling a completed event prevented. Message: ${(cancelCompletedResult as { error: string }).error}`);

  } finally {
    await client.close();
  }
});

Deno.test("Action: unCancelEvent - success and validation checks", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- Testing unCancelEvent Action ---");
    const now = new Date();
    const futureDate = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes in future
    const durationShort = 1; // 1 minute

    // Setup: Create and cancel an event
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Uncancel Test Event",
      date: futureDate.toISOString(),
      duration: durationShort,
      location: "Online",
      description: "Event to test un-cancellation.",
    });
    const { event: eventId } = createResult as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventId });
    console.log(`Setup: Event ${eventId} created and cancelled.`);

    console.log("Test Case: Successful event un-cancellation (future event).");
    const uncancelResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: eventId });
    assertNotEquals("error" in uncancelResult, true, "Expected success for un-cancellation.");
    const uncancelledEvent = (await eventConcept._getEventById({ event: eventId }))[0];
    assertEquals(uncancelledEvent.status, "upcoming", "Event status should be 'upcoming'.");
    console.log(`Success: Event ${eventId} un-cancelled. Status: ${uncancelledEvent.status}`);

    console.log("Test Case: Failure - un-cancellation by non-organizer.");
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventId }); // Re-cancel for this test
    const nonOrganizerUncancelResult = await eventConcept.unCancelEvent({ organizer: otherUserB, event: eventId });
    assertEquals("error" in nonOrganizerUncancelResult, true, "Expected error for non-organizer.");
    assertEquals((nonOrganizerUncancelResult as { error: string }).error, "Only the event organizer can un-cancel the event.", "Error message for non-organizer should be correct.");
    console.log(`Failure: Non-organizer un-cancellation prevented. Message: ${(nonOrganizerUncancelResult as { error: string }).error}`);

    console.log("Test Case: Failure - un-cancellation of an already upcoming event.");
    await eventConcept.unCancelEvent({ organizer: organizerA, event: eventId }); // Ensure it's upcoming
    const alreadyUpcomingResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: eventId });
    assertEquals("error" in alreadyUpcomingResult, true, `Expected error for un-cancelling an upcoming event.`);
    assertEquals((alreadyUpcomingResult as { error: string }).error, "Event cannot be un-cancelled as its status is not 'cancelled'.", "Error message for already upcoming should be correct.");
    console.log(`Failure: Already upcoming event un-cancellation prevented. Message: ${(alreadyUpcomingResult as { error: string }).error}`);

    console.log("Test Case: Failure - un-cancellation of a cancelled but already ended event.");
    // Create, cancel, then manually set date to be in the past
    const pastEndTestStart = new Date(now.getTime() + 1 * 1000); // Starts 1s from now
    const pastEndTestDuration = 1; // 1 minute
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Past Ended Cancelled Event",
      date: pastEndTestStart.toISOString(),
      duration: pastEndTestDuration,
      location: "Test Location",
      description: "Should not be un-cancellable.",
    });
    const { event: pastEndedEventId } = createResult2 as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerA, event: pastEndedEventId }); // Cancel it
    console.log(`Setup: Event ${pastEndedEventId} created and cancelled.`);

    // Manually set event's date to be in the past to make it appear ended
    const pastEndTimeForEvent2 = new Date(now.getTime() - (pastEndTestDuration + 1) * 60 * 1000);
    await eventConcept.events.updateOne({ _id: pastEndedEventId }, { $set: { date: pastEndTimeForEvent2 } });
    console.log(`Event ${pastEndedEventId} manually set to 'past' end time.`);

    const uncancelEndedResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: pastEndedEventId });
    assertEquals("error" in uncancelEndedResult, true, "Expected error for un-cancelling an event that has already ended.");
    assertEquals((uncancelEndedResult as { error: string }).error, "Cannot un-cancel an event that has already ended.", "Error message for already ended cancelled event should be correct.");
    console.log(`Failure: Un-cancelling ended event prevented. Message: ${(uncancelEndedResult as { error: string }).error}`);

  } finally {
    await client.close();
  }
});

Deno.test("Action: deleteEvent - success and validation checks", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- Testing deleteEvent Action ---");
    const futureDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes in future

    // Setup: Create an event
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Deletion Test Event",
      date: futureDate.toISOString(),
      duration: 60,
      location: "Offline",
      description: "Event to test deletion.",
    });
    const { event: eventId } = createResult as { event: ID };
    console.log(`Setup: Event ${eventId} created for deletion tests.`);

    let events = await eventConcept._getEventById({ event: eventId });
    assertEquals(events.length, 1, "Event should exist before deletion.");

    console.log("Test Case: Successful event deletion.");
    const deleteResult = await eventConcept.deleteEvent({ organizer: organizerA, event: eventId });
    assertEquals("error" in deleteResult, false, "Expected success for deletion.");

    events = await eventConcept._getEventById({ event: eventId });
    assertEquals(events.length, 0, "Event should no longer exist after deletion.");
    console.log(`Success: Event ${eventId} deleted.`);

    console.log("Test Case: Failure - deletion of a non-existent event.");
    const nonExistentId = "event:nonexistent" as ID;
    const nonExistentDeleteResult = await eventConcept.deleteEvent({ organizer: organizerA, event: nonExistentId });
    assertEquals("error" in nonExistentDeleteResult, true, "Expected error for deleting non-existent event.");
    assertEquals((nonExistentDeleteResult as { error: string }).error, `Event with ID ${nonExistentId} not found.`, "Error message for non-existent event should be correct.");
    console.log(`Failure: Deletion of non-existent event prevented. Message: ${(nonExistentDeleteResult as { error: string }).error}`);

    console.log("Test Case: Failure - deletion by non-organizer.");
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Another Deletion Test Event",
      date: futureDate.toISOString(),
      duration: 60,
      location: "Offline",
      description: "Another test event.",
    });
    const { event: event2Id } = createResult2 as { event: ID };
    console.log(`Setup: Event ${event2Id} created for non-organizer deletion test.`);

    const nonOrganizerDeleteResult = await eventConcept.deleteEvent({ organizer: otherUserB, event: event2Id });
    assertEquals("error" in nonOrganizerDeleteResult, true, "Expected error for non-organizer deletion.");
    assertEquals((nonOrganizerDeleteResult as { error: string }).error, "Only the event organizer can delete the event.", "Error message for non-organizer should be correct.");
    console.log(`Failure: Non-organizer deletion prevented. Message: ${(nonOrganizerDeleteResult as { error: string }).error}`);
  } finally {
    await client.close();
  }
});

Deno.test("Action: system completeEvent - success and validation checks", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- Testing system completeEvent Action ---");
    const now = new Date();
    const futureEventTimeShort = new Date(now.getTime() + 5 * 60 * 1000); // Starts 5 minutes from now
    const shortDuration = 1; // 1 minute

    // Setup: Create an event that will be eligible for completion
    const createResult1 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Event to Be Completed",
      date: futureEventTimeShort.toISOString(),
      duration: shortDuration,
      location: "Virtual",
      description: "This event will be marked completed.",
    });
    const { event: eventId1 } = createResult1 as { event: ID };
    assertExists(eventId1);
    let event1Doc = (await eventConcept._getEventById({ event: eventId1 }))[0];
    assertEquals(event1Doc.status, "upcoming", "Initial status should be upcoming for event1.");
    console.log(`Setup: Event ${eventId1} created as 'upcoming'.`);

    console.log("Test Case: Failure - attempting to complete an event that has not yet ended.");
    const incompleteResult = await eventConcept.completeEvent({ event: eventId1 });
    assertEquals("error" in incompleteResult, true, "Expected error for completing event that has not yet ended.");
    assertEquals((incompleteResult as { error: string }).error, "Event cannot be completed as it has not yet ended.", "Error message for not yet ended should be correct.");
    console.log(`Failure: Completing un-ended event prevented. Message: ${(incompleteResult as { error: string }).error}`);

    // Manually update event1's date to be in the past to make it eligible for completion
    console.log(`Simulating: Manually updating Event ${eventId1}'s date to simulate it being ended.`);
    const pastEndTimeForEvent1 = new Date(now.getTime() - (shortDuration + 1) * 60 * 1000); // Ended 1 minute + 1 second ago
    await eventConcept.events.updateOne({ _id: eventId1 }, { $set: { date: pastEndTimeForEvent1 } });

    console.log("Test Case: Successful system completeEvent after event has effectively 'ended'.");
    const completeResult1 = await eventConcept.completeEvent({ event: eventId1 });
    assertEquals("error" in completeResult1, false, `Expected success for completion after 'waiting': ${JSON.stringify(completeResult1)}`);
    event1Doc = (await eventConcept._getEventById({ event: eventId1 }))[0];
    assertEquals(event1Doc.status, "completed", "Event status should be 'completed'.");
    console.log(`Success: Event ${eventId1} completed. Status: ${event1Doc.status}`);

    console.log("Test Case: Failure - attempting to complete an already completed event.");
    const alreadyCompletedResult = await eventConcept.completeEvent({ event: eventId1 });
    assertEquals("error" in alreadyCompletedResult, true, "Expected error for completing already completed event.");
    assertEquals((alreadyCompletedResult as { error: string }).error, "Event cannot be completed as its status is not 'upcoming'.", "Error message for already completed should be correct.");
    console.log(`Failure: Completing already completed event prevented. Message: ${(alreadyCompletedResult as { error: string }).error}`);

    console.log("Test Case: Failure - attempting to complete a cancelled event.");
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Cancelled Event for Completion",
      date: new Date(now.getTime() + 1 * 60 * 1000).toISOString(), // In the future initially
      duration: 1,
      location: "Anywhere",
      description: "This event will be cancelled then completion attempted.",
    });
    const { event: eventId2 } = createResult2 as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventId2 }); // Cancel it
    console.log(`Setup: Event ${eventId2} created and cancelled.`);

    // Manually set event2's date to be in the past (still cancelled)
    const pastEndTimeForEvent2 = new Date(now.getTime() - (1 + 1) * 60 * 1000);
    await eventConcept.events.updateOne({ _id: eventId2 }, { $set: { date: pastEndTimeForEvent2 } });
    console.log(`Event ${eventId2} manually set to 'past' end time.`);

    const cancelledCompleteResult = await eventConcept.completeEvent({ event: eventId2 });
    assertEquals("error" in cancelledCompleteResult, true, "Expected error for completing cancelled event.");
    assertEquals((cancelledCompleteResult as { error: string }).error, "Event cannot be completed as its status is not 'upcoming'.", "Error message for completing cancelled should be correct.");
    console.log(`Failure: Completing cancelled event prevented. Message: ${(cancelledCompleteResult as { error: string }).error}`);
  } finally {
    await client.close();
  }
});

Deno.test("Queries: _getEventById, _getEventsByOrganizer, _getEventsByStatus, _getAllEvents", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    console.log("\n--- Testing Concept Queries ---");
    const now = new Date();
    const event1Date = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    const event2Date = new Date(now.getTime() + 20 * 60 * 1000); // 20 minutes from now
    const event3Date = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
    const event4Date = new Date(now.getTime() + 40 * 60 * 1000); // 40 minutes from now

    // Create multiple events
    const createRes1 = await eventConcept.createEvent({ organizer: organizerA, name: "A's Event 1", date: event1Date.toISOString(), duration: 30, location: "L1", description: "D1" });
    const { event: eventA1 } = createRes1 as { event: ID };
    const createRes2 = await eventConcept.createEvent({ organizer: organizerA, name: "A's Event 2", date: event2Date.toISOString(), duration: 60, location: "L2", description: "D2" });
    const { event: eventA2 } = createRes2 as { event: ID };
    const createRes3 = await eventConcept.createEvent({ organizer: otherUserB, name: "B's Event 1", date: event3Date.toISOString(), duration: 45, location: "L3", description: "D3" });
    const { event: eventB1 } = createRes3 as { event: ID };
    const createRes4 = await eventConcept.createEvent({ organizer: organizerA, name: "A's Event 3", date: event4Date.toISOString(), duration: 75, location: "L4", description: "D4" });
    const { event: eventA3 } = createRes4 as { event: ID };

    // Modify statuses for testing _getEventsByStatus
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventA2 }); // A's Event 2 is cancelled

    // Manually set A's Event 1 to be past and complete it
    const pastEndTimeForA1 = new Date(now.getTime() - (30 + 1) * 60 * 1000); // 30 mins duration + 1 min buffer in past
    await eventConcept.events.updateOne({ _id: eventA1 }, { $set: { date: pastEndTimeForA1 } });
    await eventConcept.completeEvent({ event: eventA1 }); // A's Event 1 is completed

    console.log("Query: _getEventById - existent event.");
    const retrievedEventA3 = await eventConcept._getEventById({ event: eventA3 });
    assertEquals(retrievedEventA3.length, 1, "Should find one event by ID.");
    assertEquals(retrievedEventA3[0].name, "A's Event 3", "Retrieved event name should match.");
    console.log(`Success: Found event by ID: ${retrievedEventA3[0].name}`);

    console.log("Query: _getEventById - non-existent event.");
    const nonExistentEvent = await eventConcept._getEventById({ event: "event:nonexistent" as ID });
    assertEquals(nonExistentEvent.length, 0, "Should return empty array for non-existent event.");
    console.log("Success: Correctly returned empty for non-existent event.");

    console.log("Query: _getEventsByOrganizer - organizerA.");
    const eventsByA = await eventConcept._getEventsByOrganizer({ organizer: organizerA });
    assertEquals(eventsByA.length, 3, "OrganizerA should have 3 events.");
    assertArrayIncludes(eventsByA.map(e => e._id), [eventA1, eventA2, eventA3], "All of organizerA's event IDs should be present.");
    console.log(`Success: OrganizerA has ${eventsByA.length} events.`);

    console.log("Query: _getEventsByOrganizer - otherUserB.");
    const eventsByB = await eventConcept._getEventsByOrganizer({ organizer: otherUserB });
    assertEquals(eventsByB.length, 1, "OtherUserB should have 1 event.");
    assertEquals(eventsByB[0]._id, eventB1, "otherUserB's event ID should match.");
    console.log(`Success: OtherUserB has ${eventsByB.length} events.`);

    console.log("Query: _getEventsByStatus - upcoming.");
    const upcomingEvents = await eventConcept._getEventsByStatus({ status: "upcoming" });
    assertEquals(upcomingEvents.length, 2, "There should be 2 upcoming events (eventB1, eventA3).");
    assertArrayIncludes(upcomingEvents.map(e => e._id), [eventB1, eventA3], "Upcoming event IDs should be correct.");
    console.log(`Success: Found ${upcomingEvents.length} upcoming events.`);

    console.log("Query: _getEventsByStatus - cancelled.");
    const cancelledEvents = await eventConcept._getEventsByStatus({ status: "cancelled" });
    assertEquals(cancelledEvents.length, 1, "There should be 1 cancelled event (eventA2).");
    assertEquals(cancelledEvents[0]._id, eventA2, "Cancelled event ID should be correct.");
    console.log(`Success: Found ${cancelledEvents.length} cancelled events.`);

    console.log("Query: _getEventsByStatus - completed.");
    const completedEvents = await eventConcept._getEventsByStatus({ status: "completed" });
    assertEquals(completedEvents.length, 1, "There should be 1 completed event (eventA1).");
    assertEquals(completedEvents[0]._id, eventA1, "Completed event ID should be correct.");
    console.log(`Success: Found ${completedEvents.length} completed events.`);

    console.log("Query: _getAllEvents.");
    const allEvents = await eventConcept._getAllEvents();
    assertEquals(allEvents.length, 4, "Should retrieve all 4 events.");
    assertArrayIncludes(allEvents.map(e => e._id), [eventA1, eventA2, eventB1, eventA3], "All event IDs should be present.");
    console.log(`Success: Found total ${allEvents.length} events.`);

    // --- Note on _getEventsByRecommendationContext testing ---
    console.log("\nNote: The _getEventsByRecommendationContext query relies on an external LLM (Gemini).");
    console.log("Full integration testing of this query would require mocking the LLM interaction or a live API key.");
    console.log("For a unit test focusing on the concept's logic, direct LLM interaction is generally avoided.");
    console.log("Manual verification or a dedicated integration test for this feature would be appropriate.");
    // Example of calling it to ensure it doesn't crash, but not asserting specific LLM output
    // const recommended = await eventConcept._getEventsByRecommendationContext({
    //   user: organizerA,
    //   filters: "tech conference",
    //   priorities: "networking, learning",
    // });
    // console.log("Example LLM call result (not asserted):", recommended);

  } finally {
    await client.close();
  }
});
```
