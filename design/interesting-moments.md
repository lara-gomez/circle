# Interesting Moments

## Interesting Moment 1: Incorrect TypeScript

[@incorrect-typescript](../context/design/concepts/UserAuthentication/implementation.md/steps/response.c80a5747.md)

I first began with my UserAuthentication concept in order to familiarize myself with the Context tool, since the UserAuthentication concept had already heavily been worked upon in past assignments and lecture. However, the queries it provided incorrectly provided arrays of records, when they should have provided promises instead. This was resolved with the generated tests, where an error was clearly prompted and resolved the type issue. I fed it the LikertConcept implementation file as an example, which was also helpfulf for future concept implementations as well.

## Interesting Moment 2: Using a private function to test Friending concept

[private-function-misuse](../context/design/concepts/Friending/testing.md/steps/response.624276d4.md)

In the friending concept, context originally generated a private ensureUserExist function before performing actions involving sending, accepting, and responding to friend requests. However, the actions should have already taken care of this precondition since the majority of the actions for this concept involved checking that an existing request already existed, thus avoiding the need to direcltly check the existence of a user. I originally kept this function in, and when I used context to generate tests for the implementation, it attempted to use the private function on its first attempt. I asked context to rewrite without the function, and the tests significantly improved while still testing operation principles and interesting scenarios.

## Interesting Moment 3: Order of preconditions for Friending

[]()

In the friending concept, some of the actions had multiple requires clauses, such as ensuring that users are already existing friends, and that there is not already an existing request between them. The existing friendship should overshadow the existing requests since it guarantees that there is no request, so the implementation originally missed the order of the preconditions, causing the tests to fail. It became clear that the implementation should be modified to preserve the strength of the preconditions since the order was relevant.

## Interesting Moment 4: Event testing

In the event testing, the majority of it was originally reliant on using the Date.now() function. Originally, context had prompted me to wait 1 minute in real time to test the duration and ability to cancel and uncancel events due to the precondition. It interestingly didn't direct me to modify my requires to only allow modifying events that have not already occured. I suggested finding a way to work around using past dates, which prompted the context to direclty modify the database and the dates that were input in association to events.


## Interest Moment 5: Brainstomring Recommending

I provided the llm with access to my previous application pitch, which was helpful in giving overall feedback for all of my concepts in unison. One major component of my application is recommending events, and i was unsure where to include them. Providing the rubric greatly helped think about which concept the recommend action would fit into, and it recommedning creating a new concept which i will implement in the next iteration, basing it on my assignment 3 implementation.