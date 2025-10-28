---
timestamp: 'Mon Oct 27 2025 16:39:38 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_163938.3f5f6c93.md]]'
content_id: 412a03bb64b9205ef6bea9ce75659658426a541d9c79f0206cd0d0b66ecd459c
---

# response:

```typescript
import { assertEquals, assertExists, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import EventConcept from "./EventConcept.ts"; // Assuming EventConcept is in the same directory
// Assuming gemini-llm.ts is in the same directory as EventConcept.ts
// For testing, we mock the LLM, so the actual GeminiLLM import is not directly used here.

const organizerA = "user:Alice" as ID;
const otherUserB = "user:Bob" as ID;

// Define a basic interface for the LLM to allow mocking
interface LLM {
  executeLLM(prompt: string): Promise<string>;
}

// Mock LLM class for testing purposes
class MockLLM implements LLM {
  private mockResponses: string[] = [];
  
  setResponse(response: string | string[]) {
    this.mockResponses = Array.isArray(response) ? response : [response];
  }

  async executeLLM(prompt: string): Promise<string> {
    console.log("\n--- MockLLM Called ---");
    // console.log("Prompt (truncated):", prompt.substring(0, 200) + "..."); // Useful for debugging prompts
    if (this.mockResponses.length > 0) {
      const response = this.mockResponses.shift()!; // Return and remove the first mock response
      console.log("MockLLM Response:", response);
      return Promise.resolve(response);
    }
    console.log("MockLLM: No specific response set, returning empty recommendations.");
    return Promise.resolve(JSON.stringify({ recommendations: [] })); // Default empty response
  }
}

// All previous tests remain unchanged, only the LLM-specific tests are added below.

Deno.test("Query: _getEventsByRecommendationContext - AI output verification", async () => {
  const [db, client] = await testDb();
  const mockLLM = new MockLLM();
  // Inject the mock LLM into the EventConcept constructor
  const eventConcept = new EventConcept(db, mockLLM);

  try {
    console.log("\n--- Testing _getEventsByRecommendationContext Query ---");

    const now = new Date();
    // Create several candidate events
    const event1Date = new Date(now.getTime() + 10 * 60 * 1000);
    const event2Date = new Date(now.getTime() + 20 * 60 * 1000);
    const event3Date = new Date(now.getTime() + 30 * 60 * 1000);
    const event4Date = new Date(now.getTime() + 40 * 60 * 1000);

    const createRes1 = await eventConcept.createEvent({ organizer: organizerA, name: "Tech Conference 2024", date: event1Date.toISOString(), duration: 180, location: "Convention Center", description: "Annual tech conference with workshops." });
    const { event: event1Id } = createRes1 as { event: ID };
    const createRes2 = await eventConcept.createEvent({ organizer: organizerA, name: "Local Charity Run", date: event2Date.toISOString(), duration: 60, location: "City Park", description: "Fun run for a good cause." });
    const { event: event2Id } = createRes2 as { event: ID };
    const createRes3 = await eventConcept.createEvent({ organizer: otherUserB, name: "Web Dev Meetup", date: event3Date.toISOString(), duration: 90, location: "Tech Hub", description: "Monthly meetup on front-end development." });
    const { event: event3Id } = createRes3 as { event: ID };
    const createRes4 = await eventConcept.createEvent({ organizer: organizerA, name: "AI & ML Summit", date: event4Date.toISOString(), duration: 240, location: "Virtual", description: "Explore the latest in Artificial Intelligence." });
    const { event: event4Id } = createRes4 as { event: ID };

    const allEvents = await eventConcept._getAllEvents();
    assertEquals(allEvents.length, 4, "Setup: Should have 4 events in DB.");

    // Test Case 1: Valid recommendation from LLM
    console.log("Test Case 1: LLM recommends existing events based on filters/priorities.");
    const llmResponse1 = JSON.stringify({
      recommendations: [
        { name: "AI & ML Summit", reason: "Matches AI interest and virtual format." },
        { name: "Tech Conference 2024", reason: "Relevant for tech and workshops." },
      ],
    });
    mockLLM.setResponse(llmResponse1);

    const recommendations1 = await eventConcept._getEventsByRecommendationContext({
      user: organizerA,
      filters: "AI, tech",
      priorities: "virtual, workshops",
    });
    assertNotEquals("error" in recommendations1, true, `Expected success, got error: ${JSON.stringify(recommendations1)}`);
    assertEquals((recommendations1 as any[]).length, 2, "Should return 2 recommended events.");
    assertEquals((recommendations1 as any[])[0].name, "AI & ML Summit", "First recommendation should be AI & ML Summit.");
    assertEquals((recommendations1 as any[])[1].name, "Tech Conference 2024", "Second recommendation should be Tech Conference 2024.");
    console.log("Success: LLM correctly identified and returned existing events.");

    // Test Case 2: LLM recommends a non-existent event (should be filtered out)
    console.log("Test Case 2: LLM recommends a non-existent event, which should be filtered.");
    const llmResponse2 = JSON.stringify({
      recommendations: [
        { name: "Non-existent Gala", reason: "User might like galas." }, // This event does not exist in our DB
        { name: "Web Dev Meetup", reason: "Relevant for web development." },
      ],
    });
    mockLLM.setResponse(llmResponse2);

    const recommendations2 = await eventConcept._getEventsByRecommendationContext({
      user: organizerA,
      filters: "web dev",
      priorities: "meetups",
    });
    assertNotEquals("error" in recommendations2, true, `Expected success, got error: ${JSON.stringify(recommendations2)}`);
    assertEquals((recommendations2 as any[]).length, 1, "Should return only 1 valid recommended event (non-existent ignored).");
    assertEquals((recommendations2 as any[])[0].name, "Web Dev Meetup", "Only the existing event should be recommended.");
    console.log("Success: Non-existent event from LLM output was filtered out gracefully.");

    // Test Case 3: LLM returns malformed JSON (error handled at parseAndApplyRecommendations)
    console.log("Test Case 3: LLM returns malformed JSON.");
    const llmResponse3 = "This is not JSON at all, it's just plain text.";
    mockLLM.setResponse(llmResponse3);

    const recommendations3 = await eventConcept._getEventsByRecommendationContext({
      user: organizerA,
      filters: "any",
      priorities: "any",
    });
    // The parseAndApplyRecommendations method now returns [] for parsing failures,
    // so the query method itself will return an empty array here, not an error object.
    assertEquals(Array.isArray(recommendations3), true, "Expected an array for malformed JSON.");
    assertEquals((recommendations3 as any[]).length, 0, "Should return an empty array for malformed LLM response.");
    console.log(`Success: Malformed JSON from LLM handled gracefully, returning empty recommendations. Result: ${JSON.stringify(recommendations3)}`);

    // Test Case 4: LLM returns valid JSON but with invalid 'recommendations' field (not an array)
    console.log("Test Case 4: LLM returns valid JSON but with invalid 'recommendations' field type.");
    const llmResponse4 = JSON.stringify({
      invalidField: "some data",
      recommendations: "this is not an array, it's a string", // Invalid type
    });
    mockLLM.setResponse(llmResponse4);

    const recommendations4 = await eventConcept._getEventsByRecommendationContext({
      user: organizerA,
      filters: "any",
      priorities: "any",
    });
    // Similar to Test Case 3, parsing logic in parseAndApplyRecommendations returns []
    assertEquals(Array.isArray(recommendations4), true, "Expected an array for invalid recommendations field.");
    assertEquals((recommendations4 as any[]).length, 0, "Should return an empty array for invalid recommendations field.");
    console.log(`Success: Invalid 'recommendations' field handled gracefully, returning empty recommendations. Result: ${JSON.stringify(recommendations4)}`);

    // Test Case 5: LLM returns valid JSON but a recommendation entry is missing 'name'
    console.log("Test Case 5: LLM returns valid JSON but one recommendation entry is missing 'name'.");
    const llmResponse5 = JSON.stringify({
      recommendations: [
        { reason: "Missing name for this one." }, // Missing 'name' field
        { name: "Local Charity Run", reason: "Valid event for community." }
      ],
    });
    mockLLM.setResponse(llmResponse5);

    const recommendations5 = await eventConcept._getEventsByRecommendationContext({
      user: organizerA,
      filters: "charity",
      priorities: "community",
    });
    // This case logs a warning internally but should return the valid subset of recommendations.
    assertNotEquals("error" in recommendations5, true, `Expected success with partial recommendations, got error: ${JSON.stringify(recommendations5)}`);
    assertEquals((recommendations5 as any[]).length, 1, "Should return only the valid recommendation.");
    assertEquals((recommendations5 as any[])[0].name, "Local Charity Run", "Only the event with a valid name should be returned.");
    console.log("Success: LLM recommendations with missing 'name' handled by returning only valid ones.");

  } finally {
    await client.close();
  }
});
```
