---
timestamp: 'Mon Oct 27 2025 00:38:27 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_003827.d6ddd8b1.md]]'
content_id: 7f7880c30d4820b731bc3984c422dd8b4ff1b63f3bf1748f5a2972dbc5b42bed
---

# prompt: i am trying to incorporate this recommedning concept into one of my existing concepts: event, reviewing, friending, userinterest. it is only one action to recommend an event. focus on the getaugmentedrecommend action, which is simply a query that utilizes ai. here is my previous work:

concept EventRecommendation

purpose
provide personalized event recommendations to users

principle
Recommendations are generated from a pool of events. Events are prioritized by relevance,
which is determined according to overlap with a provided set of interests.
Filters by location, time, or specific interests are supported.
An LLM can take in event characteristics and user interests to produce ranked recommendations.
Recommendations remain available without AI, but AI augmentation improves prioritization
without requiring direct input.

state
a set of Events with
an eventName String
an eventTime Date
a duration Number
a location String
a description String
a set of relevantInterests Strings

```
invariants
    every recommended event corresponds to an event in the Events set
    every filtered event corresponds to an event in the Events set
    startTime < endTime for any time-based filtering
    eventTime for recommended or filtered events is in the future
```

actions
addEvent (eventName: String, eventTime: Date, duration: Number, location: String, description: String, relevantInterests: Set of Strings): (event: Event)
requires: eventName and location are non-empty Strings, eventTime is in the future
effects: creates an event with the given information, and returns this event

```
removeEvent (event: Event) 
    requires: event exists
    effects: removes this event from the set of all events

getRecommendedEvents (interests: Set of Strings, location: String): (events: Set of Events)
    requires: location is a non-empty string
    effects: returns events in the location, ranked by overlap between the given interests 
    and the relevant interests of all events; ties broken chronologically

filterEventsByInterest (interests: Set of Strings, interest: String, events: Set of Events): (events: Set of Events)
    requires: events is a subset of all existing Events, interest is a non-empty String
    effects: returns events that include the given interest, ranked first by the number 
        of overlapping interests with interests, then chronologically.

filterEventsByTime (events: Set of Events, startTime: Date, endTime: Date): (events: Set of Events)
    requires: startTime < endTime (both in the future), events is a subset of all existing Events
    effects: returns the subset of events from the given set which fall between the given time frame, 
        sorted first by the number of overlapping interests with interests, then chronologically.

async getAugmentedRecommendedEvents (interests: Set of Strings, context: Map<String, Any>, location: String, llm: GeminiLLM): (events: Set of Events)
    requires: location is a non-empty String
    effects: Calls an LLM with the provided context and the set of candidate events for the 
        given location. The LLM analyzes intersection between the context and event characteristics, 
        returning a ranked set of recommended events. If the AI component is unavailable, 
        the system defaults to getRecommendedEvents.
```
