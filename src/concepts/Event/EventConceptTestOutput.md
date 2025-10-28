```
running 9 tests from ./src/concepts/Event/EventConcept.test.ts


EventConcept: Principle - User organizes, tracks, and manages event lifecycle (efficient) ...
------- output -------

--- Principle Test: Event Lifecycle (efficient) ---

1. Creating event1 (Team Meeting) by organizerA...
1a. Creating event2 (Past Workshop Candidate) for completion test by organizerA...
2. OrganizerA cancels event1...
3. OrganizerA un-cancels event1...
4. Manually updating event2 (0199efc4-9527-7ede-9746-cfd3f040cb8d) date to be in the past to simulate completion eligibility...
4a. System action: Completing event2 (now past its end time)...
5. OrganizerA deletes event1...

Principle test completed successfully.
----- output end -----

EventConcept: Principle - User organizes, tracks, and manages event lifecycle (efficient) ... ok (1s)


Action: createEvent - success and validation ...
------- output -------

Testing successful event creation...
Testing createEvent with past date (should fail)...
Testing createEvent with empty name (should fail)...
Testing createEvent with duration <= 0 (should fail)...

----- output end -----

Action: createEvent - success and validation ... ok (755ms)


Action: modifyEvent - success and validation ...

------- output -------

Testing successful event modification...
Testing modification by non-organizer (should fail)...
Testing modification without changing any fields (should fail)...
Testing modification with past date (should fail)...
Testing modification with empty new name (should fail)...
Testing modification with duration <= 0 (should fail)...

----- output end -----

Action: modifyEvent - success and validation ... ok (987ms)


Action: cancelEvent - success and validation ...

------- output -------

Testing successful event cancellation...
Testing cancellation of already cancelled event (should fail)...
Testing cancellation by non-organizer (should fail)...
Testing cancellation of a completed event (should fail)...

----- output end -----

Action: cancelEvent - success and validation ... ok (899ms)


Action: unCancelEvent - success and validation ...

------- output -------

Testing successful event un-cancellation (future event)...
Testing un-cancellation by non-organizer (should fail)...
Reset status of event to upcoming for the following tests.
Testing un-cancellation of an already upcoming event (should fail)...
Testing un-cancellation of a cancelled but already ended event (should fail)...

----- output end -----

Action: unCancelEvent - success and validation ... ok (1s)


Action: deleteEvent - success and validation ...

------- output -------

Testing successful event deletion...
Testing deletion of non-existent event (should fail)...
Testing deletion by non-organizer (should fail)...

----- output end -----

Action: deleteEvent - success and validation ... ok (867ms)


Action: system completeEvent - success and validation (efficient) ...

------- output -------

Testing system completeEvent for an event that has not yet ended (should fail)...
Manually updating Event1 (0199efc4-ac5d-73d6-83ee-57959385a9db) date to simulate it being ended...
Testing system completeEvent for Event1 after it has effectively 'ended' (via DB update)...
Testing completion of already completed event (should fail)...
Testing completion of cancelled event (should fail)...

----- output end -----

Action: system completeEvent - success and validation (efficient) ... ok (917ms)


Queries: _getEventById, _getEventsByOrganizer, _getEventsByStatus, _getAllEvents ...

------- output -------

Query: _getEventById - existent event
Query: _getEventById - non-existent event
Query: _getEventsByOrganizer - organizerA
Query: _getEventsByOrganizer - otherUserB
Query: _getEventsByStatus - upcoming
Query: _getEventsByStatus - cancelled
Query: _getEventsByStatus - completed (should be empty initially)
Simulating completion for eventA1 by manually updating its date...
Query: _getAllEvents

----- output end -----

Queries: _getEventById, _getEventsByOrganizer, _getEventsByStatus, _getAllEvents ... ok (1s)

Query: _getEventsByRecommendationContext - AI output verification ...

------- output -------

--- Testing _getEventsByRecommendationContext Query ---

Test Case 1: LLM recommends existing events.
🤖 Requesting AI-augmented recommendations from LLM...

--- MockLLM Called ---
MockLLM Response: {"recommendations":[{"name":"AI & ML Summit","reason":"Matches AI interest and virtual format."},{"name":"Tech Conference 2024","reason":"Relevant for tech and workshops."}]}
✅ Received response from LLM!

🤖 RAW LLM RESPONSE
======================
{"recommendations":[{"name":"AI & ML Summit","reason":"Matches AI interest and virtual format."},{"name":"Tech Conference 2024","reason":"Relevant for tech and workshops."}]}
======================

📝 Applying LLM recommendations...
✅ Recommended "AI & ML Summit" (Matches AI interest and virtual format.)
✅ Recommended "Tech Conference 2024" (Relevant for tech and workshops.)
Success: LLM correctly identified and returned existing events.

Test Case 2: LLM recommends non-existent event (should be filtered).
🤖 Requesting AI-augmented recommendations from LLM...

--- MockLLM Called ---
MockLLM Response: {"recommendations":[{"name":"Non-existent Gala","reason":"User might like galas."},{"name":"Web Dev Meetup","reason":"Relevant for web development."}]}
✅ Received response from LLM!

🤖 RAW LLM RESPONSE
======================
{"recommendations":[{"name":"Non-existent Gala","reason":"User might like galas."},{"name":"Web Dev Meetup","reason":"Relevant for web development."}]}
======================

📝 Applying LLM recommendations...
✅ Recommended "Web Dev Meetup" (Relevant for web development.)
LLM provided disallowed recommendations. Returning only valid ones. Issues:
- No available event named "Non-existent Gala" to recommend.
Success: Non-existent event from LLM output was filtered out.

Test Case 3: LLM returns malformed JSON.
🤖 Requesting AI-augmented recommendations from LLM...

--- MockLLM Called ---
MockLLM Response: This is not JSON.
✅ Received response from LLM!

🤖 RAW LLM RESPONSE
======================
This is not JSON.
======================

No JSON found in response: This is not JSON.
Failure: Malformed JSON from LLM handled gracefully. Message: {"error":"Failed to get recommendations: Failed to parse LLM response"}

Test Case 4: LLM returns valid JSON but with invalid 'recommendations' field.
🤖 Requesting AI-augmented recommendations from LLM...

--- MockLLM Called ---
MockLLM Response: {"invalidField":"some data","recommendations":"not an array"}
✅ Received response from LLM!

🤖 RAW LLM RESPONSE
======================
{"invalidField":"some data","recommendations":"not an array"}
======================

Invalid response format: "recommendations" array not found.
Failure: Invalid 'recommendations' field handled gracefully. Message: {"error":"Failed to get recommendations: Failed to parse LLM response"}

Test Case 5: LLM returns valid JSON but with missing 'name' in recommendation.
🤖 Requesting AI-augmented recommendations from LLM...

--- MockLLM Called ---
MockLLM Response: {"recommendations":[{"reason":"Missing name"},{"name":"Local Charity Run","reason":"Valid event"}]}
✅ Received response from LLM!

🤖 RAW LLM RESPONSE
======================
{"recommendations":[{"reason":"Missing name"},{"name":"Local Charity Run","reason":"Valid event"}]}
======================

📝 Applying LLM recommendations...
✅ Recommended "Local Charity Run" (Valid event)
LLM provided disallowed recommendations. Returning only valid ones. Issues:
- Recommendation is missing a valid event name.
Success: LLM recommendations with missing 'name' handled by returning only valid ones.
----- output end -----
Query: _getEventsByRecommendationContext - AI output verification ... ok (819ms)

ok | 9 passed | 0 failed (9s)

```