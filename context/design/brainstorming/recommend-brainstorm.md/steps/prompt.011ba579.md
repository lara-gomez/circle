---
timestamp: 'Mon Oct 27 2025 01:25:48 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_012548.acdd3c99.md]]'
content_id: 011ba5794722e87ed85ba4e2b47e577ea71173f0cda2c520f24bb81e80cfbc0a
---

# prompt: my previous implementation for the recommend is down below. use it in the implementation. it is reliant on the gemini llm. is this ai augmented feature essentially a queue?

/\*\*

* EventRecommendation Concept - AI Augmented Version
  \*/

import { GeminiLLM } from './gemini-llm';

// A single event that can be recommended
export interface Event {
eventName: string;
eventTime: Date,
duration: number; // corresponds to minutes
location: String,
description: String,
relevantInterests: String\[]
}

export class EventRecommendation {
private events: Event\[] = \[];

```
addEvent(eventName: string, eventTime: Date, duration: number, location: String, description: String, relevantInterests: String[]): Event {
    const event: Event = {
        eventName,
        eventTime,
        duration,
        location,
        description,
        relevantInterests
    };
    this.events.push(event);
    return event;
}

removeEvent(event: Event): void {
    // Remove the event
    this.events = this.events.filter(a => a !== event);
}

filterEventsByInterest(interests: String[], interest: String, events: Event[]): Event[] {
    if (!interest) {
        throw new Error("Invalid user interest.");
    }

    const filtered = events.filter(event => event.relevantInterests.includes(interest));

    filtered.sort((a, b) => {
        const overlapA = a.relevantInterests.filter(i => interests.includes(i)).length;
        const overlapB = b.relevantInterests.filter(i => interests.includes(i)).length;

        if (overlapB !== overlapA) {
            return overlapB - overlapA; // descending by overlap
        } else {
            return a.eventTime.getTime() - b.eventTime.getTime(); // tie-breaker: chronological
        }
    });

    return filtered;

}

filterEventsByTime(events: Event[], startTime: Date, endTime: Date): Event[] {
    const now = new Date()
    if (!(startTime instanceof Date) || !(endTime instanceof Date) || startTime >= endTime) {
        throw new Error("Invalid time range.");
    }

    if (startTime <= now || endTime <= now) {
        throw new Error("Time range must be in the future.");
    }
    
    const filtered = events.filter(event => {
        const eventEnd = new Date(event.eventTime.getTime() + event.duration * 60 * 1000);
        return event.eventTime >= startTime && eventEnd <= endTime;
    });

    filtered.sort((a, b) => a.eventTime.getTime() - b.eventTime.getTime());

    return filtered
}

async getAugmentedRecommendedEvents(interests: String[], context: Record<string, any>, location: string, llm: GeminiLLM): Promise<Event[]> {
    try {
        console.log('🤖 Requesting AI-augmented recommendations from Gemini AI...');
        
        const candidateEvents = this.events.filter(event => event.location === location);

        if (candidateEvents.length === 0) {
            console.log("⚠️ No events available in this location.");
            return [];
        }

        const prompt = this.createRecommendationPrompt(interests, context, candidateEvents);
        const text = await llm.executeLLM(prompt);
        
        console.log('✅ Received response from Gemini AI!');
        console.log('\n🤖 RAW GEMINI RESPONSE');
        console.log('======================');
        console.log(text);
        console.log('======================\n');
        
        // Parse and apply the assignments
        return this.parseAndApplyRecommendations(text, candidateEvents);
        
    } catch (error) {
        console.error('❌ Error calling Gemini API:', (error as Error).message);
        return [];
    }
}


/**
 * Create the prompt for Gemini with hardwired preferences
 */
private createRecommendationPrompt(interests: String[], context: Record<string, any>, events: Event[]): string {
    const criticalRequirements = [
        "1. Recommend ALL candidate events that are relevant to the user's interests (do not pick just one).",
        "2. Consider the event's relevantInterests AND its description text to identify alignment with the user's interests.",
        "3. Prioritize based on overlap with the user's interests",
        "4. Use the context to adjust ranking (e.g., if context mentions networking, prioritize events with career or professional development as well",
        "5. Rank events chronologically if they have equal relevance",
        "6. Return ONLY valid event names that appear in the candidate list"
    ];

    return `
```

You are a helpful AI assistant that recommends events to users based on their interests.

USER INTERESTS:
${interests.join(", ")}

CANDIDATE EVENTS (ONLY CHOOSE FROM THESE):
${this.eventsToString(events)}

CRITICAL REQUIREMENTS:
${criticalRequirements.join('\n')}

CONTEXT:
${JSON.stringify(context)}

Return your response as a JSON object with this exact structure:
{
"recommendations": \[
{
"name": "exact event name from the list above",
"reason": "short explanation of why this event aligns with the user's interests"
}
]
}

Return ONLY the JSON object, no additional text.\`;

```
}

/**
 * Parses the LLM response and applies the recommendations
 */
private parseAndApplyRecommendations(responseText: string, candidateEvents: Event[]): Event[] {
    try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const response = JSON.parse(jsonMatch[0]);
        
        if (!response.recommendations || !Array.isArray(response.recommendations)) {
            throw new Error('Invalid response format');
        }

        console.log('📝 Applying LLM recommendations...');

        const eventsByName = new Map<string, Event[]>();
        for (const event of candidateEvents) {
            const list = eventsByName.get(event.eventName) ?? [];
            list.push(event);
            eventsByName.set(event.eventName, list);
        }

        const issues: string[] = [];
        const validatedRecommendations: Event[] = [];

        for (const rawRec of response.recommendations) {
            // validator 1
            if (typeof rawRec !== 'object' || !rawRec) {
                issues.push('Encountered a recommendation entry that is not an object.');
                continue;
            }

            const { name, reason } = rawRec as { name?: unknown; reason?: unknown };

            // validator 2
            if (typeof name !== 'string' || !name.trim()) {
                issues.push('Recommendation is missing a valid event name.');
                continue;
            }
            
            // validator 3
            const pool = eventsByName.get(name);
            if (!pool || pool.length === 0) {
                issues.push(`No available event named "${name}" to recommend.`);
                continue;
            }

            const event = pool.shift() as Event;

            validatedRecommendations.push(event);
            console.log(`✅ Recommended "${event.eventName}" (${reason ?? "no reason provided"})`);
        }

        if (issues.length > 0) {
            throw new Error(`LLM provided disallowed recommendations:\n- ${issues.join('\n- ')}`);
        }

        return validatedRecommendations
        
    } catch (error) {
        console.error('❌ Error parsing LLM response:', (error as Error).message);
        console.log('Response was:', responseText);
        throw error;
    }
}

/** * Helper to serialize events for the prompt. */ 
private eventsToString(events: Event[]): string { 
    return events.map( (e) => 
        `- "${e.eventName}" | Interests: [${e.relevantInterests.join(", ")}] | 
    Duration: ${ e.duration } min | Description: ${e.description}` ) .join("\n"); }

getEvents(): Event[] {
    return this.events;
}

/**
 * Display the recommended events in a readable format
 */
displayRecommendations(events: Event[]): void {
    console.log('\n🎉 Recommended Events');
    console.log('==================');
    
    if (events.length === 0) { console.log("No events recommended."); return; }
    
    events.forEach((event, index) => { 
        const startTime = event.eventTime.toLocaleString(); 
        const durationHours = (event.duration / 60).toFixed(1); 
        console.log( `${index + 1}. ${event.eventName} - ${event.location}\n 📅 ${startTime} (${durationHours}h)\n 📝 ${event.description}` ); });
}
```

}
