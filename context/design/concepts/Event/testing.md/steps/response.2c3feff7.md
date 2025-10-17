---
timestamp: 'Thu Oct 16 2025 20:54:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_205435.e662a2fd.md]]'
content_id: 2c3feff74a8ef80c15a545b914bd16087d8001ed6a83274dad3e59a9ca5224da
---

# response:

```typescript
import { assertEquals, assertExists, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import EventConcept from "./EventConcept.ts";

const organizerA = "user:Alice" as ID;
const otherUserB = "user:Bob" as ID;

Deno.test("Action: unCancelEvent - success and validation", async () => {
  const [db, client] = await testDb();
  const eventConcept = new EventConcept(db);

  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 5 * 1000); // Future event, 5s from now
    const durationShort = 1; // 1 minute

    // Test Case 1: Un-cancelling a non-existent event
    console.log("Testing un-cancellation of a non-existent event (should fail)...");
    const nonExistentEventId = "event:nonexistent" as ID;
    const nonExistentResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: nonExistentEventId });
    assertEquals("error" in nonExistentResult, true, "Expected an error when un-cancelling a non-existent event.");
    assertEquals((nonExistentResult as { error: string }).error, `Event with ID ${nonExistentEventId} not found.`, "Error message for non-existent event is incorrect.");

    // Setup an event to be cancelled and then uncancelled
    const createResult = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Uncancel Test",
      date: futureDate,
      duration: durationShort,
      location: "Online",
      description: "Desc",
    });
    const { event: eventId } = createResult as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventId }); // Cancel it first

    // Test Case 2: Successful event un-cancellation (future event)
    console.log("Testing successful event un-cancellation (future event) by organizer...");
    const uncancelResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: eventId });
    assertNotEquals("error" in uncancelResult, true, `Expected success for un-cancellation, but received error: ${JSON.stringify(uncancelResult)}`);
    const uncancelledEvent = (await eventConcept._getEventById({ event: eventId }))[0];
    assertEquals(uncancelledEvent.status, "upcoming", "Event status should be 'upcoming' after successful un-cancellation.");

    // Test Case 3: Un-cancellation by non-organizer (should fail)
    console.log("Testing un-cancellation by non-organizer (should fail)...");
    await eventConcept.cancelEvent({ organizer: organizerA, event: eventId }); // Re-cancel for this test
    const nonOrganizerUncancelResult = await eventConcept.unCancelEvent({ organizer: otherUserB, event: eventId });
    assertEquals("error" in nonOrganizerUncancelResult, true, "Expected an error when a non-organizer attempts to un-cancel an event.");
    assertEquals((nonOrganizerUncancelResult as { error: string }).error, "Only the event organizer can un-cancel the event.", "Error message for non-organizer un-cancellation is incorrect.");

    // Test Case 4: Un-cancellation of an already 'upcoming' event (should fail)
    // The event 'eventId' is currently in 'cancelled' state after the previous test.
    // Let's uncancel it first to put it in 'upcoming' state for this test.
    await eventConcept.unCancelEvent({ organizer: organizerA, event: eventId });
    const alreadyUpcomingResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: eventId }); // Event is currently upcoming
    assertEquals("error" in alreadyUpcomingResult, true, "Expected an error when attempting to un-cancel an event that is already 'upcoming'.");
    assertEquals((alreadyUpcomingResult as { error: string }).error, "Event cannot be un-cancelled as its status is not 'cancelled'.", "Error message for un-cancelling an upcoming event is incorrect.");

    // Test Case 5: Un-cancellation of a cancelled but already ended event (should fail)
    // Create an event that starts in the future, then cancel it, then manually update its date to be in the past.
    const pastEndTestStart = new Date(now.getTime() + 1000); // Starts 1s from now
    const pastEndTestDuration = 1; // 1 minute
    const createResult2 = await eventConcept.createEvent({
      organizer: organizerA,
      name: "Past Ended Event",
      date: pastEndTestStart,
      duration: pastEndTestDuration,
      location: "Test",
      description: "Test",
    });
    const { event: pastEndedEventId } = createResult2 as { event: ID };
    await eventConcept.cancelEvent({ organizer: organizerA, event: pastEndedEventId }); // Cancel it

    // Manually set event's date to be in the past to make it appear ended
    console.log(`Manually updating event (${pastEndedEventId}) date to simulate it being ended...`);
    const pastEndTimeForEvent2 = new Date(now.getTime() - (pastEndTestDuration + 1) * 60 * 1000);
    await eventConcept.events.updateOne({ _id: pastEndedEventId }, { $set: { date: pastEndTimeForEvent2 } });

    const uncancelEndedResult = await eventConcept.unCancelEvent({ organizer: organizerA, event: pastEndedEventId });
    assertEquals("error" in uncancelEndedResult, true, "Expected an error when attempting to un-cancel an event that has already ended.");
    assertEquals((uncancelEndedResult as { error: string }).error, "Cannot un-cancel an event that has already ended.", "Error message for un-cancelling an already ended event is incorrect.");

  } finally {
    await client.close();
  }
});
```
