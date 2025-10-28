# Updated Design Doc

## Integrating AI-augmented Recommend Feature

The most significant change from my assignment 4a to 4b is the inclusion of the AI augmented feature which recommends events to users based on their interests and past event attendance. I previously was unsure of where to include this event since it is reliant on information about events and users, but I decided to keep it in the Event concept as a query, since it is getting events according to a specific, external context. I implemented the feature, mostly keeping it intact from assignment 3, with some changes to the parameters in order to adjust to my current concepts. I also added corresponding tests within the EventConcept test file.

## Adding _getUsersInterestedInItems Query

Within the UserInterest concept, I added a query to get all users that were interested in a specific item. For my friending feature, I wanted to allow users to have information on how many of their friends were also interested in attending the same event. Therefore, this query could be couple with information about friends to produce a user experience where on the discovery page, users can access which specific friends might attend a similar event which is recommended to the user.

## Modifying Event Concept Date Handling

My Event Concept initially took in Date objects, but after implementing the front end it was clear that it was difficult for both sides to send a Date object to each other, making it more cohesive to send a string object that could be casted as a Date object instead. This was a minor change which just required updates to the actions directly related to creating and modifying events since they dealt with event dates.
