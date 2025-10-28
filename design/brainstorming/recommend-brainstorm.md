[@concept-design-overview](../background/concept-design-overview.md)

[@concept-specifications](../background/concept-specifications.md)

[@assignment](../background/assignment.md)

[@concept-rubric](../background/detailed/concept-rubric.md)

[@application-pitch](../background/application-pitch.md)

[@reviewing-concept](../concepts/Reviewing/Reviewing.md)

[@event-concept](../concepts/Event/Event.md)

[@friending-concept](../concepts/Friending/Friending.md)

[@interest-concept](../concepts/UserInterest/UserInterest.md)


# prompt: i want to modify the event concept to include a query that recommends events when given a user. provide feedback for the following addition:

_getAugmentedRecommendedEvents(user: User, llm: GeminiLLM): Set of Events
# response:

This is an interesting idea to integrate AI-driven recommendations, but adding `_getAugmentedRecommendedEvents(user: User, llm: GeminiLLM): Set of Events` directly to the `Event` concept has several issues when evaluated against the principles of Concept Design:

### Feedback on the `_getAugmentedRecommendedEvents` Query

1.  **Violation of Concept Independence (Direct LLM Dependency)**:
    *   **Problem**: The query explicitly takes `llm: GeminiLLM` as a type parameter. This creates a direct dependency of the `Event` concept on a specific external technology (`GeminiLLM`). Concept independence is a cornerstone of concept design, stating that "Each concept is defined without reference to any other concepts, and can be understood in isolation." The `Event` concept should not know or care about the underlying LLM technology used for recommendations.
    *   **Rubric Check**: Fails "Concept does not refer to another concept by name" and "All external datatypes are either generic parameters or built-in types (such as String)." `GeminiLLM` is a specific external technology, not a generic parameter for the `Event` concept's core functionality.

2.  **Violation of Separation of Concerns (Recommendation Logic)**:
    *   **Problem**: The `Event` concept's purpose is "to organize and track time-bound occurrences." The act of "recommending" events, especially "augmented" ones using an LLM, is a distinct behavioral concern from simply managing the creation, modification, and status of events. Recommendation logic often involves complex algorithms, user profiling (from other concepts like `UserInterest`), item characteristics, and possibly external services. Conflating this with event management clutters the `Event` concept.
    *   **Rubric Check**: Fails "Concept does not conflate two concerns that could be broken into separate concepts that could be reused independently of one another." and "All components of the state work together for a single purpose." The `Event` state is for event details; it doesn't intrinsically hold data for recommendation algorithms.

3.  **Completeness of Functionality (Where's the Recommendation State?)**:
    *   **Problem**: For the `Event` concept to *actually* recommend events, it would need state about what makes an event "recommendable" to a particular user (e.g., event categories, user interests, past interactions, etc.). The current `Event` state only describes the event itself. While an LLM might *generate* recommendations, the `Event` concept itself lacks the internal state to robustly *manage* or *understand* recommendations as part of its core behavior.
    *   **Rubric Check**: Fails "Concept state is rich enough to support all the concept actions." The `Event` concept's state is not designed to support a sophisticated recommendation function.

4.  **Genericity and Reusability**:
    *   **Problem**: If the `Event` concept includes this specific recommendation query, it becomes less generic and harder to reuse in applications that have different recommendation needs (e.g., no LLM, a different LLM, a rule-based system, collaborative filtering, etc.). The `Event` concept should be usable wherever events need to be managed, regardless of how they are surfaced to users.

### Recommendation for Improvement

Instead of integrating recommendation logic into the `Event` concept, you should introduce a **separate concept** specifically for recommendations.

**Suggested Approach: A `Recommendation` Concept**

*   **concept**: `Recommendation` \[User, Item, LLMIntegration]
    *   **purpose**: To generate personalized recommendations of items for users based on various factors, potentially leveraging advanced AI models.
    *   **principle**: A user's interests, past interactions, and preferences, combined with a chosen AI model, can be used to generate a ranked list of relevant items, enabling personalized discovery.
    *   **state**: (Could include cached recommendations, or just be stateless and generate on demand). If you want to persist recommendations:
        *   `a set of UserRecommendations with`
            *   `a user User`
            *   `a recommendedItem Item`
            *   `a score Number`
            *   `a generatedAt DateTime`
            *   `an llmModelUsed String` (e.g., "gemini-pro", "gpt-4")
    *   **actions**:
        *   `generateRecommendations(user: User, llmIntegration: LLMIntegration): (recommendedItems: Set of Items)`
            *   **requires**: `user` exists, `llmIntegration` is valid.
            *   **effects**: Uses the `llmIntegration` to query other concepts (like `UserInterest`, `Event` for event details, `Reviewing` for item ratings) to construct a prompt for the LLM, then processes the LLM's response to return a set of `Item` IDs.
        *   `clearUserRecommendations(user: User)` (if you choose to persist state)
    *   **queries**:
        *   `_getLatestRecommendations(user: User): (item: Item)` (if you choose to persist state)

This `Recommendation` concept would:
1.  **Maintain Independence**: It would `query` the `Event` concept for available events and the `UserInterest` concept for user preferences, but `Event` itself would remain ignorant of how its data is used for recommendations.
2.  **Separate Concerns**: Recommendation logic, including LLM interaction details, is encapsulated within its own concept.
3.  **Be Reusable**: The `Recommendation` concept itself could be reused to recommend different `Item` types (events, posts, products) by instantiating `Item` as a generic parameter, and it could be adapted for different `LLMIntegration` strategies or even non-LLM strategies.
4.  **Polymorphism**: The `LLMIntegration` type parameter could be a generic ID that refers to an instance of an `LLMService` concept (which itself handles the actual API calls to Gemini, OpenAI, etc.), allowing for flexible LLM providers.

By structuring it this way, your `Event` concept remains clean and focused on event management, while recommendation capabilities are provided by a dedicated, independent, and reusable `Recommendation` concept.

# prompt: a recommendation concept would be stateless. give suggestions for an updated principle or purpose to fit this query within the events concept. also give suggestions for additional parameters that would help maintain concept independence. in application, another concept will provide the llm with user interests and past reviews of events.
# response:

Your goal to include a query that helps recommend events for a user is a great step towards a richer application. However, integrating it directly as `_getAugmentedRecommendedEvents(user: User, llm: GeminiLLM): Set of Events` into the `Event` concept, as proposed, introduces several issues with Concept Design principles, especially **Independence** and **Separation of Concerns**.

### Feedback on the Proposed Query `_getAugmentedRecommendedEvents`

1.  **Violation of Concept Independence (Direct LLM Dependency)**:
    *   **Problem**: Including `llm: GeminiLLM` as a parameter directly couples your `Event` concept to a specific external technology (`GeminiLLM`). Concepts must be independent and understandable in isolation, without knowledge of other concepts' internal workings or specific external services. The `Event` concept should not know *how* recommendations are generated (e.g., whether an LLM is used, or which one).
    *   **Rubric Check**: This directly violates "Concept does not rely on any properties of other concepts." and "All external datatypes are either generic parameters or built-in types (such as String)." `GeminiLLM` is a concrete external dependency, not a generic type for the `Event` concept's core domain.

2.  **Violation of Separation of Concerns (Recommendation Logic)**:
    *   **Problem**: The `Event` concept's primary purpose is "to organize and track time-bound occurrences." The sophisticated logic of "recommending" events, especially "augmented" ones requiring an LLM and user preferences (which you noted another concept will provide), is a distinct concern. Conflating event management with personalized recommendation generation makes the `Event` concept less focused and harder to reuse for systems that don't need recommendations, or use a different recommendation strategy.
    *   **Rubric Check**: Fails "Concept does not conflate two concerns that could be broken into separate concepts that could be reused independently of one another." The state of `Event` is about event details, not user interests or recommendation scores.

3.  **Completeness of Functionality (within the `Event` concept)**:
    *   **Problem**: For `Event` to "recommend" effectively for a `user`, it would internally need access to `user`'s interests and past reviews. You mentioned "another concept will provide the llm with user interests and past reviews of events." This implies `Event` itself shouldn't fetch or manage this data. If `Event` doesn't have this information in its state or through its own actions/queries, it cannot fulfill the "recommends" aspect of the query independently.

### Suggestions for an Updated Purpose/Principle and Parameters

To address these concerns while still enabling event discovery, the `Event` concept's role should be to **provide and filter event data based on generic criteria**, rather than performing the complex, AI-driven recommendation itself. The actual LLM invocation and synthesis of user data (interests, reviews) should reside in another concept or synchronization logic.

Here's how you can modify the `Event` concept to better align with concept design principles:

#### 1. Updated Purpose for the `Event` Concept

Expand the purpose to subtly include the facilitation of discovery, but emphasize that the `Event` concept itself focuses on the event data.

*   **Original Purpose**: "enable users to organize and track time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen"
*   **Revised Purpose Suggestion**: "enable users to organize, track, and *facilitate the discovery of* time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen, and supporting its retrieval based on externally provided contextual criteria."
    *   **Rationale**: This revision acknowledges the "discovery" aspect without implying the `Event` concept performs the full recommendation logic. It highlights that the concept provides *support* for retrieval based on *external criteria*.

#### 2. Updated Principle for the `Event` Concept

Adjust the principle to show how events can be surfaced based on external input.

*   **Original Principle**: "A user can schedule an event by providing essential details... This information ensures clarity for all involved... After the scheduled time, the event naturally transitions to a completed state... The organizer retains the ability to cancel an event... with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system."
*   **Revised Principle Suggestion**: "A user can schedule an event by providing essential details... Additionally, the system can surface relevant events by applying externally derived contextual filters and prioritizations to its stored event data, aiding in personalized discovery without the event concept itself managing user preferences or advanced recommendation algorithms."
    *   **Rationale**: This principle clearly states that filtering and prioritization are applied based on *externally derived* input, reinforcing independence and separation of concerns.

#### 3. Revised Query for `Event` (Maintaining Independence)

Instead of passing the LLM object, the query should receive *abstract, generic parameters* that represent the *outcome* of the LLM's processing of user interests and reviews. The "another concept" (or a synchronization) would be responsible for:
1.  Gathering `user` interests (from `UserInterest` concept) and reviews (from `Reviewing` concept).
2.  Calling the LLM with this data and perhaps a list of available `Event` IDs.
3.  Processing the LLM's output into a structured, generic format (e.g., a list of prioritized event IDs, keywords, categories, a sentiment score threshold, etc.).
4.  Calling this new query on the `Event` concept, passing these LLM-derived criteria.

Here are suggestions for how to restructure the query in the `Event` concept to maintain independence:

*   **Problematic Original Query**: `_getAugmentedRecommendedEvents(user: User, llm: GeminiLLM): Set of Events`

*   **Suggested Renamed Query & Parameters**:
    ```
    _getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: Event) | (error: String)
      requires: The `filters` and `priorities` strings, if provided, must be parsable and well-formed according to the concept's internal interpretation logic.
      effects: Returns a set of events, filtered and potentially ordered, based on the provided contextual criteria for the user. Returns an error if the criteria are malformed.
    ```
    *   **`user: User`**: This parameter is acceptable as it's an external identifier.
    *   **`filters: String`**: This string could be a JSON object (serialized as a string) containing keywords, categories, date ranges, location preferences, etc., that the *external LLM process* identified as relevant for the user. The `Event` concept would parse and apply these as filters.
    *   **`priorities: String`**: This string could be another JSON object (serialized as a string) indicating how events should be ranked or which specific event IDs should be elevated, based on the LLM's assessment. The `Event` concept would use this to sort or prioritize the filtered events.
    *   **Rationale**:
        *   **Independence**: The `Event` concept no longer knows about `GeminiLLM`. It only receives abstract string representations of filters and priorities. It doesn't care if an LLM, a human, or a simple rule engine generated these strings.
        *   **Separation of Concerns**: The complex logic of interpreting user interests, querying the LLM, and synthesizing a "recommendation context" is moved outside the `Event` concept. The `Event` concept focuses solely on efficiently querying and ordering its own event data based on the provided context.
        *   **Polymorphism**: The `Event` concept treats the `filters` and `priorities` as generic data to apply, making it reusable even if the underlying recommendation intelligence changes significantly.

By adopting this approach, your `Event` concept remains focused on its core responsibility (event management and retrieval), while the powerful LLM-driven recommendation capabilities are orchestrated by another layer or concept, adhering to the modularity principles of Concept Design.

# prompt: provide an implementation of the event concept with this query
# response:

Here are the concept specifications and their TypeScript implementations, incorporating the requested `_getEventsByRecommendationContext` query into the `Event` concept, and following the concept design principles and implementation guidelines.

---

# implement: LikertSurvey

# response:

# concept: LikertSurvey

*   **concept**: LikertSurvey \[Author, Respondent]
*   **purpose**: To measure attitudes or opinions by asking respondents to rate their level of agreement with a series of statements on a predefined scale.
*   **principle**: If an author creates a survey with several questions on a 1-5 scale, and a respondent submits their answers to those questions, then the author can view the collected responses to analyze the respondent's opinions.
*   **state**:
    *   A set of `Surveys` with
        *   an `author` of type `Author`
        *   a `title` of type `String`
        *   a `scaleMin` of type `Number`
        *   a `scaleMax` of type `Number`
    *   A set of `Questions` with
        *   a `survey` of type `Survey`
        *   a `text` of type `String`
    *   A set of `Responses` with
        *   a `respondent` of type `Respondent`
        *   a `question` of type `Question`
        *   a `value` of type `Number`
*   **actions**:
    *   `createSurvey (author: Author, title: String, scaleMin: Number, scaleMax: Number): (survey: Survey)`
        *   **requires**: `scaleMin < scaleMax`
        *   **effects**: Creates a new survey with the given author, title, and scale.
    *   `addQuestion (survey: Survey, text: String): (question: Question)`
        *   **requires**: The survey must exist.
        *   **effects**: Adds a new question to the specified survey.
    *   `submitResponse (respondent: Respondent, question: Question, value: Number)`
        *   **requires**: The question must exist. The respondent must not have already submitted a response for this question. The value must be within the survey's scale.
        *   **effects**: Records the respondent's answer for the given question.
    *   `updateResponse (respondent: Respondent, question: Question, value: Number)`
        *   **requires**: The question must exist. The respondent must have already submitted a response for this question. The value must be within the survey's scale.
        *   **effects**: Updates the respondent's existing answer for the given question.
*   **queries**:
    *   `_getSurveyQuestions (survey: Survey) : (question: {id: Question, survey: Survey, text: String})`
        *   **requires**: The survey must exist.
        *   **effects**: Returns all questions associated with the specified survey.
    *   `_getSurveyResponses (survey: Survey) : (response: {id: Response, respondent: Respondent, question: Question, value: Number})`
        *   **requires**: The survey must exist.
        *   **effects**: Returns all responses for the questions within the specified survey.
    *   `_getRespondentAnswers (respondent: Respondent) : (response: {id: Response, respondent: Respondent, question: Question, value: Number})`
        *   **requires**: The respondent must exist.
        *   **effects**: Returns all answers submitted by the specified respondent.

# file: src/likertsurvey/LikertSurveyConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "LikertSurvey" + ".";

// Generic types for the concept's external dependencies
type Author = ID;
type Respondent = ID;

// Internal entity types, represented as IDs
type Survey = ID;
type Question = ID;
type Response = ID;

/**
 * State: A set of Surveys with an author, title, and scale.
 */
interface SurveyDoc {
  _id: Survey; // MongoDB document ID
  author: Author;
  title: string;
  scaleMin: number;
  scaleMax: number;
}

/**
 * State: A set of Questions, each linked to a survey and containing text.
 */
interface QuestionDoc {
  _id: Question; // MongoDB document ID
  survey: Survey;
  text: string;
}

/**
 * State: A set of Responses, linking a respondent, a question, and their chosen value.
 */
interface ResponseDoc {
  _id: Response; // MongoDB document ID
  respondent: Respondent;
  question: Question;
  value: number;
}

/**
 * @concept LikertSurvey
 * @purpose To measure attitudes or opinions by asking respondents to rate their level of agreement with a series of statements on a predefined scale.
 * @principle If an author creates a survey with several questions on a 1-5 scale, and a respondent submits their answers to those questions, then the author can view the collected responses to analyze the respondent's opinions.
 */
export default class LikertSurveyConcept {
  surveys: Collection<SurveyDoc>;
  questions: Collection<QuestionDoc>;
  responses: Collection<ResponseDoc>;

  constructor(private readonly db: Db) {
    this.surveys = this.db.collection(PREFIX + "surveys");
    this.questions = this.db.collection(PREFIX + "questions");
    this.responses = this.db.collection(PREFIX + "responses");
  }

  /**
   * createSurvey (author: Author, title: String, scaleMin: Number, scaleMax: Number): (survey: Survey)
   *
   * @requires scaleMin must be less than scaleMax.
   * @effects A new survey is created and its ID is returned.
   */
  async createSurvey({ author, title, scaleMin, scaleMax }: { author: Author; title: string; scaleMin: number; scaleMax: number }): Promise<{ survey: Survey } | { error: string }> {
    if (scaleMin >= scaleMax) {
      return { error: "scaleMin must be less than scaleMax" };
    }

    const surveyId = freshID() as Survey;
    await this.surveys.insertOne({ _id: surveyId, author, title, scaleMin, scaleMax });
    return { survey: surveyId };
  }

  /**
   * addQuestion (survey: Survey, text: String): (question: Question)
   *
   * @requires The survey must exist.
   * @effects A new question is created and its ID is returned.
   */
  async addQuestion({ survey, text }: { survey: Survey; text: string }): Promise<{ question: Question } | { error: string }> {
    const existingSurvey = await this.surveys.findOne({ _id: survey });
    if (!existingSurvey) {
      return { error: `Survey with ID ${survey} not found.` };
    }

    const questionId = freshID() as Question;
    await this.questions.insertOne({ _id: questionId, survey, text });
    return { question: questionId };
  }

  /**
   * submitResponse (respondent: Respondent, question: Question, value: Number)
   *
   * @requires The question must exist.
   * @requires The respondent must not have already responded to this question.
   * @requires The response value must be within the survey's defined scale.
   * @effects A new response is recorded in the state.
   */
  async submitResponse({ respondent, question, value }: { respondent: Respondent; question: Question; value: number }): Promise<Empty | { error: string }> {
    const questionDoc = await this.questions.findOne({ _id: question });
    if (!questionDoc) {
      return { error: `Question with ID ${question} not found.` };
    }

    const surveyDoc = await this.surveys.findOne({ _id: questionDoc.survey });
    if (!surveyDoc) {
      // This indicates a data integrity issue but is a good safeguard.
      return { error: "Associated survey for the question not found." };
    }

    if (value < surveyDoc.scaleMin || value > surveyDoc.scaleMax) {
      return { error: `Response value ${value} is outside the survey's scale [${surveyDoc.scaleMin}, ${surveyDoc.scaleMax}].` };
    }

    const existingResponse = await this.responses.findOne({ respondent, question });
    if (existingResponse) {
      return { error: "Respondent has already answered this question. Use updateResponse to change it." };
    }

    const responseId = freshID() as Response;
    await this.responses.insertOne({ _id: responseId, respondent, question, value });

    return {};
  }

  /**
   * updateResponse (respondent: Respondent, question: Question, value: Number)
   *
   * @requires The question must exist.
   * @requires A response from the given respondent to the question must already exist.
   * @requires The new response value must be within the survey's defined scale.
   * @effects The existing response's value is updated.
   */
  async updateResponse({ respondent, question, value }: { respondent: Respondent; question: Question; value: number }): Promise<Empty | { error: string }> {
    const questionDoc = await this.questions.findOne({ _id: question });
    if (!questionDoc) {
      return { error: `Question with ID ${question} not found.` };
    }

    const surveyDoc = await this.surveys.findOne({ _id: questionDoc.survey });
    if (!surveyDoc) {
      return { error: "Associated survey for the question not found." };
    }

    if (value < surveyDoc.scaleMin || value > surveyDoc.scaleMax) {
      return { error: `Response value ${value} is outside the survey's scale [${surveyDoc.scaleMin}, ${surveyDoc.scaleMax}].` };
    }

    const result = await this.responses.updateOne({ respondent, question }, { $set: { value } });

    if (result.matchedCount === 0) {
      return { error: "No existing response found to update. Use submitResponse to create one." };
    }

    return {};
  }

  /**
   * _getSurveyQuestions (survey: Survey) : (question: {id: Question, survey: Survey, text: String})
   *
   * @requires The survey must exist.
   * @effects Returns all questions associated with the specified survey.
   */
  async _getSurveyQuestions({ survey }: { survey: Survey }): Promise<{ id: Question; survey: Survey; text: string }[]> {
    const questions = await this.questions.find({ survey }).toArray();
    return questions.map(q => ({ id: q._id, survey: q.survey, text: q.text }));
  }

  /**
   * _getSurveyResponses (survey: Survey) : (response: {id: Response, respondent: Respondent, question: Question, value: Number})
   *
   * @requires The survey must exist.
   * @effects Returns all responses for the questions within the specified survey.
   */
  async _getSurveyResponses({ survey }: { survey: Survey }): Promise<{ id: Response; respondent: Respondent; question: Question; value: number }[]> {
    const surveyQuestions = await this.questions.find({ survey }).project({ _id: 1 }).toArray();
    const questionIds = surveyQuestions.map((q) => q._id as Question);
    const responses = await this.responses.find({ question: { $in: questionIds } }).toArray();
    return responses.map(r => ({ id: r._id, respondent: r.respondent, question: r.question, value: r.value }));
  }

  /**
   * _getRespondentAnswers (respondent: Respondent) : (response: {id: Response, respondent: Respondent, question: Question, value: Number})
   *
   * @requires The respondent must exist.
   * @effects Returns all answers submitted by the specified respondent.
   */
  async _getRespondentAnswers({ respondent }: { respondent: Respondent }): Promise<{ id: Response; respondent: Respondent; question: Question; value: number }[]> {
    const responses = await this.responses.find({ respondent }).toArray();
    return responses.map(r => ({ id: r._id, respondent: r.respondent, question: r.question, value: r.value }));
  }
}
```

---

# concept: Reviewing \[User, Item]

*   **concept**: Reviewing \[User, Item]

*   **purpose**: enable users to provide qualitative and quantitative feedback on items

*   **principle**: a user creates a review for an item containing a written entry and numerical rating; modify the entry and rating for this review if needed; the user can also delete their review

*   **state**:
    *   a set of Reviews with
        *   a reviewer User
        *   a target Item
        *   a rating Number
        *   an entry String

*   **actions**:
    *   `addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)`
        *   **requires**: no review by user for this item exists, rating is a value between 0 and 10
        *   **effects**: create a review by the user for this item with the given rating and text entry, return the created review

    *   `removeReview (user: User, item: Item)`
        *   **requires**: a review by the user for this item exists
        *   **effects**: deletes the review that is associated with the given user and item

    *   `modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)`
        *   **requires**: a review by the user for this item exists, rating is a value between 0 and 10
        *   **effects**: modifies the review with the given fields for the rating and entry, returns the modified review

*   **queries**:
    *   `_getReview (user: User, item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})`
        *   **requires**: a review exists for the given user and item
        *   **effects**: returns the review associated with the given user and item

    *   `_getReviewsByItem (item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})`
        *   **effects**: returns all reviews targeting the given item

    *   `_getReviewsByUser (user: User) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})`
        *   **effects**: returns all reviews authored by the given user

# file: src/reviewing/ReviewingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "Reviewing" + ".";

// Generic types for the concept's external dependencies
type User = ID;
type Item = ID;

// Internal entity type, represented as ID
type Review = ID;

/**
 * State: A set of Reviews.
 * Each review links a reviewer (User), a target item (Item), a numerical rating, and a text entry.
 */
interface ReviewDoc {
  _id: Review; // MongoDB document ID
  reviewer: User;
  target: Item;
  rating: number;
  entry: string;
}

/**
 * @concept Reviewing
 * @purpose enable users to provide qualitative and quantitative feedback on items
 * @principle a user creates a review for an item containing a written entry and numerical rating; modify the entry and rating for this review if needed; the user can also delete their review
 */
export default class ReviewingConcept {
  reviews: Collection<ReviewDoc>;

  constructor(private readonly db: Db) {
    this.reviews = this.db.collection(PREFIX + "reviews");
  }

  /**
   * addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
   *
   * @requires no review by user for this item exists, rating is a value between 0 and 10
   * @effects create a review by the user for this item with the given rating and text entry, return the created review
   */
  async addReview({ user, item, rating, entry }: { user: User; item: Item; rating: number; entry: string }): Promise<{ review: Review } | { error: string }> {
    if (rating < 0 || rating > 10) {
      return { error: "Rating must be between 0 and 10." };
    }

    const existingReview = await this.reviews.findOne({ reviewer: user, target: item });
    if (existingReview) {
      return { error: `User ${user} has already reviewed item ${item}.` };
    }

    const reviewId = freshID() as Review;
    await this.reviews.insertOne({ _id: reviewId, reviewer: user, target: item, rating, entry });
    return { review: reviewId };
  }

  /**
   * removeReview (user: User, item: Item)
   *
   * @requires a review by the user for this item exists
   * @effects deletes the review that is associated with the given user and item
   */
  async removeReview({ user, item }: { user: User; item: Item }): Promise<Empty | { error: string }> {
    const result = await this.reviews.deleteOne({ reviewer: user, target: item });
    if (result.deletedCount === 0) {
      return { error: `No review found by user ${user} for item ${item}.` };
    }
    return {};
  }

  /**
   * modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
   *
   * @requires a review by the user for this item exists, rating is a value between 0 and 10
   * @effects modifies the review with the given fields for the rating and entry, returns the modified review
   */
  async modifyReview({ user, item, rating, entry }: { user: User; item: Item; rating: number; entry: string }): Promise<{ review: Review } | { error: string }> {
    if (rating < 0 || rating > 10) {
      return { error: "Rating must be between 0 and 10." };
    }

    const updatedReview = await this.reviews.findOneAndUpdate(
      { reviewer: user, target: item },
      { $set: { rating, entry } },
      { returnDocument: "after" }
    );

    if (!updatedReview.value) {
      return { error: `No review found by user ${user} for item ${item} to modify.` };
    }
    return { review: updatedReview.value._id };
  }

  /**
   * _getReview (user: User, item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @requires a review exists for the given user and item
   * @effects returns the review associated with the given user and item
   */
  async _getReview({ user, item }: { user: User; item: Item }): Promise<Array<{ id: Review; reviewer: User; target: Item; rating: number; entry: string }> | { error: string }> {
    const review = await this.reviews.findOne({ reviewer: user, target: item });
    if (!review) {
      return { error: `No review found by user ${user} for item ${item}.` };
    }
    return [{ id: review._id, reviewer: review.reviewer, target: review.target, rating: review.rating, entry: review.entry }];
  }

  /**
   * _getReviewsByItem (item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @effects returns all reviews targeting the given item
   */
  async _getReviewsByItem({ item }: { item: Item }): Promise<Array<{ id: Review; reviewer: User; target: Item; rating: number; entry: string }>> {
    const reviews = await this.reviews.find({ target: item }).toArray();
    return reviews.map(r => ({ id: r._id, reviewer: r.reviewer, target: r.target, rating: r.rating, entry: r.entry }));
  }

  /**
   * _getReviewsByUser (user: User) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @effects returns all reviews authored by the given user
   */
  async _getReviewsByUser({ user }: { user: User }): Promise<Array<{ id: Review; reviewer: User; target: Item; rating: number; entry: string }>> {
    const reviews = await this.reviews.find({ reviewer: user }).toArray();
    return reviews.map(r => ({ id: r._id, reviewer: r.reviewer, target: r.target, rating: r.rating, entry: r.entry }));
  }
}
```

---

# concept: Friending \[User]

*   **concept**: Friending \[User]

*   **purpose**: enable users to establish and manage mutual social connections

*   **principle**: a user can send a friend request to another user; they may choose to remove this request before the target user takes action; the recipient of a friend request can choose to accept or remove it; once a request is accepted, two users become friends; friendship may be revoked.

*   **state**:
    *   a set of Users with
        *   a set of friends Users
        *   a set of incomingRequests Users
        *   a set of outgoingRequests Users

*   **actions**:
    *   `sendFriendRequest (user: User, target: User)`
        *   **requires**: user and target are not existing friends, user has not already sent a request to target, user and target are not the same
        *   **effects**: target is added to the set of the user's outgoing requests; user is added to the set of target's incoming requests

    *   `acceptFriendRequest (requester: User, target: User)`
        *   **requires**: requester has sent a friend request to target, requester and target are not friends, requester and target are not the same
        *   **effects**: requester and target are added to each other's set of friends, they are both removed from the other's set of incoming/outgoingRequests

    *   `removeFriendRequest (requester: User, target: User)`
        *   **requires**: requester has sent a friend request to target, requester and target are not friends, requester and target are not the same
        *   **effects**: requester is removed from the target's set of incomingRequests, target is removed the requester's set of outgoingRequests

    *   `removeFriend (user: User, friend: User): ()`
        *   **requires**: user and friend are friends with each other, user and friend are not the same
        *   **effects**: user and friends are both removed from each other's set of friends

*   **queries**:
    *   `_getFriends (user: User) : (friend: User)`
        *   **requires**: user exists
        *   **effects**: returns all friends of the given user

    *   `_getIncomingRequests (user: User) : (requester: User)`
        *   **requires**: user exists
        *   **effects**: returns all users who sent a friend request to the given user

    *   `_getOutgoingRequests (user: User) : (target: User)`
        *   **requires**: user exists
        *   **effects**: returns all users to whom the given user sent a friend request

    *   `_areFriends (user1: User, user2: User) : (isFriend: Flag)`
        *   **requires**: user1 and user2 exist
        *   **effects**: returns true if user1 and user2 are friends, false otherwise

# file: src/friending/FriendingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
// Note: freshID is not directly used here as User IDs are external, but imported for completeness if internal entities were added.

// Collection prefix to ensure namespace separation
const PREFIX = "Friending" + ".";

// Generic type for the concept's external dependency
type User = ID;

/**
 * State: A set of Users with relations for friends, incoming requests, and outgoing requests.
 */
interface UserRelationsDoc {
  _id: User; // MongoDB document ID for the user
  friends: User[];
  incomingRequests: User[];
  outgoingRequests: User[];
}

/**
 * @concept Friending
 * @purpose enable users to establish and manage mutual social connections
 * @principle a user can send a friend request to another user; they may choose to remove this request before the target user takes action; the recipient of a friend request can choose to accept or remove it; once a request is accepted, two users become friends; friendship may be revoked.
 */
export default class FriendingConcept {
  userRelations: Collection<UserRelationsDoc>;

  constructor(private readonly db: Db) {
    this.userRelations = this.db.collection(PREFIX + "userRelations");
  }

  // Helper to ensure a user's document exists, initializing if not
  private async ensureUserExists(userId: User): Promise<Empty | { error: string }> {
    const userDoc = await this.userRelations.findOne({ _id: userId });
    if (!userDoc) {
      await this.userRelations.insertOne({ _id: userId, friends: [], incomingRequests: [], outgoingRequests: [] });
    }
    return {};
  }

  /**
   * sendFriendRequest (user: User, target: User)
   *
   * @requires user and target are not existing friends, user has not already sent a request to target, user and target are not the same
   * @effects target is added to the set of the user's outgoing requests; user is added to the set of target's incoming requests
   */
  async sendFriendRequest({ user, target }: { user: User; target: User }): Promise<Empty | { error: string }> {
    if (user === target) {
      return { error: "User cannot send a friend request to themselves." };
    }

    await this.ensureUserExists(user);
    await this.ensureUserExists(target);

    const userDoc = await this.userRelations.findOne({ _id: user });
    const targetDoc = await this.userRelations.findOne({ _id: target });

    if (userDoc?.friends.includes(target) || targetDoc?.friends.includes(user)) {
      return { error: `User ${user} and ${target} are already friends.` };
    }
    if (userDoc?.outgoingRequests.includes(target)) {
      return { error: `User ${user} has already sent a friend request to ${target}.` };
    }
    if (targetDoc?.outgoingRequests.includes(user)) { // If target sent a request to user, they should accept instead
      return { error: `User ${target} has already sent a friend request to ${user}. Accept it instead.` };
    }

    await this.userRelations.updateOne({ _id: user }, { $addToSet: { outgoingRequests: target } });
    await this.userRelations.updateOne({ _id: target }, { $addToSet: { incomingRequests: user } });

    return {};
  }

  /**
   * acceptFriendRequest (requester: User, target: User)
   *
   * @requires requester has sent a friend request to target, requester and target are not friends, requester and target are not the same
   * @effects requester and target are added to each other's set of friends, they are both removed from the other's set of incoming/outgoingRequests
   */
  async acceptFriendRequest({ requester, target }: { requester: User; target: User }): Promise<Empty | { error: string }> {
    if (requester === target) {
      return { error: "Cannot accept a request from oneself." };
    }

    await this.ensureUserExists(requester);
    await this.ensureUserExists(target);

    const targetDoc = await this.userRelations.findOne({ _id: target });
    const requesterDoc = await this.userRelations.findOne({ _id: requester });

    if (!targetDoc?.incomingRequests.includes(requester)) {
      return { error: `User ${requester} has not sent a friend request to ${target}.` };
    }
    if (targetDoc?.friends.includes(requester) || requesterDoc?.friends.includes(target)) {
      return { error: `User ${requester} and ${target} are already friends.` };
    }

    // Add to friends
    await this.userRelations.updateOne({ _id: target }, { $addToSet: { friends: requester }, $pull: { incomingRequests: requester } });
    await this.userRelations.updateOne({ _id: requester }, { $addToSet: { friends: target }, $pull: { outgoingRequests: target } });

    return {};
  }

  /**
   * removeFriendRequest (requester: User, target: User)
   *
   * @requires requester has sent a friend request to target, requester and target are not friends, requester and target are not the same
   * @effects requester is removed from the target's set of incomingRequests, target is removed the requester's set of outgoingRequests
   */
  async removeFriendRequest({ requester, target }: { requester: User; target: User }): Promise<Empty | { error: string }> {
    if (requester === target) {
      return { error: "Cannot remove a request to/from oneself." };
    }

    await this.ensureUserExists(requester);
    await this.ensureUserExists(target);

    const targetDoc = await this.userRelations.findOne({ _id: target });
    const requesterDoc = await this.userRelations.findOne({ _id: requester });

    if (!requesterDoc?.outgoingRequests.includes(target) && !targetDoc?.incomingRequests.includes(requester)) {
        return { error: `No pending friend request found from ${requester} to ${target}.` };
    }
    if (requesterDoc?.friends.includes(target) || targetDoc?.friends.includes(requester)) {
        return { error: `User ${requester} and ${target} are already friends. Use removeFriend instead.` };
    }

    await this.userRelations.updateOne({ _id: target }, { $pull: { incomingRequests: requester } });
    await this.userRelations.updateOne({ _id: requester }, { $pull: { outgoingRequests: target } });

    return {};
  }

  /**
   * removeFriend (user: User, friend: User): ()
   *
   * @requires user and friend are friends with each other, user and friend are not the same
   * @effects user and friends are both removed from each other's set of friends
   */
  async removeFriend({ user, friend }: { user: User; friend: User }): Promise<Empty | { error: string }> {
    if (user === friend) {
      return { error: "Cannot unfriend oneself." };
    }

    const userDoc = await this.userRelations.findOne({ _id: user });
    const friendDoc = await this.userRelations.findOne({ _id: friend });

    if (!userDoc?.friends.includes(friend) || !friendDoc?.friends.includes(user)) {
      return { error: `User ${user} and ${friend} are not friends.` };
    }

    await this.userRelations.updateOne({ _id: user }, { $pull: { friends: friend } });
    await this.userRelations.updateOne({ _id: friend }, { $pull: { friends: user } });

    return {};
  }

  /**
   * _getFriends (user: User) : (friend: User)
   *
   * @requires user exists
   * @effects returns all friends of the given user
   */
  async _getFriends({ user }: { user: User }): Promise<{ friend: User }[]> {
    const userDoc = await this.userRelations.findOne({ _id: user });
    if (!userDoc) {
        return []; // User not found, no friends
    }
    return userDoc.friends.map(friendId => ({ friend: friendId }));
  }

  /**
   * _getIncomingRequests (user: User) : (requester: User)
   *
   * @requires user exists
   * @effects returns all users who sent a friend request to the given user
   */
  async _getIncomingRequests({ user }: { user: User }): Promise<{ requester: User }[]> {
    const userDoc = await this.userRelations.findOne({ _id: user });
    if (!userDoc) {
        return []; // User not found, no incoming requests
    }
    return userDoc.incomingRequests.map(requesterId => ({ requester: requesterId }));
  }

  /**
   * _getOutgoingRequests (user: User) : (target: User)
   *
   * @requires user exists
   * @effects returns all users to whom the given user sent a friend request
   */
  async _getOutgoingRequests({ user }: { user: User }): Promise<{ target: User }[]> {
    const userDoc = await this.userRelations.findOne({ _id: user });
    if (!userDoc) {
        return []; // User not found, no outgoing requests
    }
    return userDoc.outgoingRequests.map(targetId => ({ target: targetId }));
  }

  /**
   * _areFriends (user1: User, user2: User) : (isFriend: Flag)
   *
   * @requires user1 and user2 exist
   * @effects returns true if user1 and user2 are friends, false otherwise
   */
  async _areFriends({ user1, user2 }: { user1: User; user2: User }): Promise<{ isFriend: boolean }> {
    if (user1 === user2) {
      return { isFriend: false }; // A user is not friends with themselves in this context
    }
    const user1Doc = await this.userRelations.findOne({ _id: user1 });
    const user2Doc = await this.userRelations.findOne({ _id: user2 });

    if (!user1Doc || !user2Doc) {
        // If either user doesn't exist, they can't be friends.
        return { isFriend: false };
    }

    const areIndeedFriends = user1Doc.friends.includes(user2) && user2Doc.friends.includes(user1);
    return { isFriend: areIndeedFriends };
  }
}
```

---

# concept: UserAuthentication \[User]

**concept**: UserAuthentication \[User]

**purpose**: enable users to register and verify their identity using a username and password.

**principle**: If a user registers with a unique username and password, they can then authenticate using those same credentials to be identified as the registered user.

**state**:

```
a set of Users with
  a username String
  a password String
```

**actions**:

```
register (username: String, password: String): (user: User)

  requires: the username must not already exist in the system

  effects: create a new User with this username and password, returns the user

authenticate (username: String, password: String): (user: User)

  requires: there exists a user with the given username and password

  effects: returns the registered user that matches with the given username and password
```

**queries**:

```
_getUsername (user: User) : (username: String)
  requires: user exists
  effects: returns the username associated with the user

_getUserByUsername (username: String) : (user: User) | (error: String)
  requires: a user with the given username exists
  effects: if a user with the given username exists, returns that user; otherwise returns an error
```

# file: src/userauthentication/UserAuthenticationConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import { createHash } from "node:crypto"; // For password hashing

// Collection prefix to ensure namespace separation
const PREFIX = "UserAuthentication" + ".";

// Generic type for the concept's external dependency
type User = ID;

/**
 * State: A set of Users with a username and a hashed password.
 */
interface UserAccountDoc {
  _id: User; // MongoDB document ID for the user
  username: string;
  passwordHash: string; // Storing hashed password for security
}

/**
 * @concept UserAuthentication
 * @purpose enable users to register and verify their identity using a username and password.
 * @principle If a user registers with a unique username and password, they can then authenticate using those same credentials to be identified as the registered user.
 */
export default class UserAuthenticationConcept {
  userAccounts: Collection<UserAccountDoc>;

  constructor(private readonly db: Db) {
    this.userAccounts = this.db.collection(PREFIX + "userAccounts");
    // Ensure username is unique for efficient lookup
    this.userAccounts.createIndex({ username: 1 }, { unique: true });
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  /**
   * register (username: String, password: String): (user: User)
   *
   * @requires the username must not already exist in the system
   * @effects create a new User with this username and password, returns the user
   */
  async register({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const existingUser = await this.userAccounts.findOne({ username });
    if (existingUser) {
      return { error: `Username "${username}" already exists.` };
    }

    const userId = freshID() as User;
    const passwordHash = this.hashPassword(password);
    await this.userAccounts.insertOne({ _id: userId, username, passwordHash });

    return { user: userId };
  }

  /**
   * authenticate (username: String, password: String): (user: User)
   *
   * @requires there exists a user with the given username and password
   * @effects returns the registered user that matches with the given username and password
   */
  async authenticate({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const passwordHash = this.hashPassword(password);
    const userAccount = await this.userAccounts.findOne({ username, passwordHash });

    if (!userAccount) {
      return { error: "Invalid username or password." };
    }

    return { user: userAccount._id };
  }

  /**
   * _getUsername (user: User) : (username: String)
   *
   * @requires user exists
   * @effects returns the username associated with the user
   */
  async _getUsername({ user }: { user: User }): Promise<Array<{ username: string }> | { error: string }> {
    const userAccount = await this.userAccounts.findOne({ _id: user });
    if (!userAccount) {
      return { error: `User with ID ${user} not found.` };
    }
    return [{ username: userAccount.username }];
  }

  /**
   * _getUserByUsername (username: String) : (user: User) | (error: String)
   *
   * @requires a user with the given username exists
   * @effects if a user with the given username exists, returns that user; otherwise returns an error
   */
  async _getUserByUsername({ username }: { username: string }): Promise<Array<{ user: User }> | { error: string }> {
    const userAccount = await this.userAccounts.findOne({ username });
    if (!userAccount) {
      return { error: `User with username "${username}" not found.` };
    }
    return [{ user: userAccount._id }];
  }
}
```

---

# concept: UserInterest \[User, Item]

*   **concept**: UserInterest \[User, Item]

*   **purpose**: enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience and facilitate content discovery.

*   **principle**: a user wants to add their personal interests through a specific tag; they can remove this tag or add more tags whenever; they may also indicate interest in specific items and can similarly remove or add more interests in the future.

*   **state**:
    *   A set of `UserItemInterests` with
        *   a user User
        *   an item Item

    *   A set of `UserPersonalInterests` with
        *   a user User
        *   a tag String

*   **actions**:
    *   `addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)`
        *   **requires**: tag is a non-empty String, there does not already exist a UserPersonalInterest associating the user to the given tag
        *   **effects**: creates a UserPersonalInterest associating the user to the tag, and returns it

    *   `removePersonalInterest (user: User, tag: String)`
        *   **requires**: tag is a non-empty string, there exists a UserPersonalInterest associating the user to the given tag
        *   **effects**: removes the UserPersonalInterest associating the user to the tag

    *   `addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)`
        *   **requires**: there does not already exist a UserItemInterest associating the user to the item
        *   **effects**: creates a UserItemInterest associating the user to the tag, and returns it

    *   `removeItemInterest (user: User, item: Item)`
        *   **requires**: there exists a UserItemInterest associating the user to the given item
        *   **effects**: removes the UserItemInterest associating the user to the item

*   **queries**:
    *   `_getPersonalInterests (user: User) : (tag: String)`
        *   **requires**: user exists
        *   **effects**: returns all personal interest tags associated with the user

    *   `_getItemInterests (user: User) : (item: Item)`
        *   **requires**: user exists
        *   **effects**: returns all items the user has expressed interest in

# file: src/userinterest/UserInterestConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "UserInterest" + ".";

// Generic types for the concept's external dependencies
type User = ID;
type Item = ID;

// Internal entity types, represented as IDs (though not strictly needed as relationships are direct)
type UserPersonalInterest = ID; // Represents the association record
type UserItemInterest = ID; // Represents the association record

/**
 * State: An association of a User with an Item they are interested in.
 */
interface UserItemInterestDoc {
  _id: UserItemInterest; // Unique ID for this specific interest record
  user: User;
  item: Item;
}

/**
 * State: An association of a User with a general tag/topic they are interested in.
 */
interface UserPersonalInterestDoc {
  _id: UserPersonalInterest; // Unique ID for this specific interest record
  user: User;
  tag: string;
}

/**
 * @concept UserInterest
 * @purpose enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience and facilitate content discovery.
 * @principle a user wants to add their personal interests through a specific tag; they can remove this tag or add more tags whenever; they may also indicate interest in specific items and can similarly remove or add more interests in the future.
 */
export default class UserInterestConcept {
  userItemInterests: Collection<UserItemInterestDoc>;
  userPersonalInterests: Collection<UserPersonalInterestDoc>;

  constructor(private readonly db: Db) {
    this.userItemInterests = this.db.collection(PREFIX + "userItemInterests");
    this.userPersonalInterests = this.db.collection(PREFIX + "userPersonalInterests");

    // Ensure uniqueness for interest records to prevent duplicates
    this.userItemInterests.createIndex({ user: 1, item: 1 }, { unique: true });
    this.userPersonalInterests.createIndex({ user: 1, tag: 1 }, { unique: true });
  }

  /**
   * addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)
   *
   * @requires tag is a non-empty String, there does not already exist a UserPersonalInterest associating the user to the given tag
   * @effects creates a UserPersonalInterest associating the user to the tag, and returns it
   */
  async addPersonalInterest({ user, tag }: { user: User; tag: string }): Promise<{ personalInterest: UserPersonalInterest } | { error: string }> {
    if (!tag.trim()) {
      return { error: "Tag cannot be empty." };
    }

    const existingInterest = await this.userPersonalInterests.findOne({ user, tag });
    if (existingInterest) {
      return { error: `User ${user} already has personal interest tag "${tag}".` };
    }

    const interestId = freshID() as UserPersonalInterest;
    await this.userPersonalInterests.insertOne({ _id: interestId, user, tag });
    return { personalInterest: interestId };
  }

  /**
   * removePersonalInterest (user: User, tag: String)
   *
   * @requires tag is a non-empty string, there exists a UserPersonalInterest associating the user to the given tag
   * @effects removes the UserPersonalInterest associating the user to the tag
   */
  async removePersonalInterest({ user, tag }: { user: User; tag: string }): Promise<Empty | { error: string }> {
    if (!tag.trim()) {
      return { error: "Tag cannot be empty." };
    }

    const result = await this.userPersonalInterests.deleteOne({ user, tag });
    if (result.deletedCount === 0) {
      return { error: `No personal interest tag "${tag}" found for user ${user}.` };
    }
    return {};
  }

  /**
   * addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)
   *
   * @requires there does not already exist a UserItemInterest associating the user to the item
   * @effects creates a UserItemInterest associating the user to the tag, and returns it
   */
  async addItemInterest({ user, item }: { user: User; item: Item }): Promise<{ itemInterest: UserItemInterest } | { error: string }> {
    const existingInterest = await this.userItemInterests.findOne({ user, item });
    if (existingInterest) {
      return { error: `User ${user} is already interested in item ${item}.` };
    }

    const interestId = freshID() as UserItemInterest;
    await this.userItemInterests.insertOne({ _id: interestId, user, item });
    return { itemInterest: interestId };
  }

  /**
   * removeItemInterest (user: User, item: Item)
   *
   * @requires there exists a UserItemInterest associating the user to the given item
   * @effects removes the UserItemInterest associating the user to the item
   */
  async removeItemInterest({ user, item }: { user: User; item: Item }): Promise<Empty | { error: string }> {
    const result = await this.userItemInterests.deleteOne({ user, item });
    if (result.deletedCount === 0) {
      return { error: `No item interest in ${item} found for user ${user}.` };
    }
    return {};
  }

  /**
   * _getPersonalInterests (user: User) : (tag: String)
   *
   * @requires user exists
   * @effects returns all personal interest tags associated with the user
   */
  async _getPersonalInterests({ user }: { user: User }): Promise<{ tag: string }[]> {
    const interests = await this.userPersonalInterests.find({ user }).toArray();
    return interests.map(i => ({ tag: i.tag }));
  }

  /**
   * _getItemInterests (user: User) : (item: Item)
   *
   * @requires user exists
   * @effects returns all items the user has expressed interest in
   */
  async _getItemInterests({ user }: { user: User }): Promise<{ item: Item }[]> {
    const interests = await this.userItemInterests.find({ user }).toArray();
    return interests.map(i => ({ item: i.item }));
  }
}
```

---

# concept: Event \[User]

**concept** Event \[User]

*   **purpose**: enable users to organize, track, and facilitate the discovery of time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen, and supporting its retrieval based on externally provided contextual criteria.

*   **principle**: A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system. Additionally, the system can surface relevant events by applying externally derived contextual filters and prioritizations to its stored event data, aiding in personalized discovery without the event concept itself managing user preferences or advanced recommendation algorithms.

*   **state**:
    *   a set of Events with
        *   an organizer User
        *   a name String
        *   a date DateTime
        *   a duration Number // Duration in minutes
        *   a location String
        *   a description String
        *   a status of "upcoming" or "cancelled" or "completed"

*   **actions**:
    *   `createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)`
        *   **requires**: date >= current\_time; name != ""; location != ""; description != ""; duration > 0
        *   **effects**: creates an event with the given details associated with the organizer, sets the status to "upcoming"; returns the new event

    *   `modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)`
        *   **requires**: organizer = event.organizer; newName != ""; newLocation != ""; newDescription != ""; newDate >= current\_time; newDuration > 0; at least one field must differ from the original event details
        *   **effects**: event.name := newName, event.date := newDate, event.duration := newDuration, event.location := newLocation, event.description := newDescription; returns event

    *   `cancelEvent (organizer: User, event: Event)`
        *   **requires**: organizer = event.organizer and event.status = "upcoming"
        *   **effects**: event.status := "cancelled"

    *   `unCancelEvent (organizer: User, event: Event): (event: Event)`
        *   **requires**: organizer = event.organizer and event.status = "cancelled" and event.date + event.duration (in minutes) >= current\_time
        *   **effects**: event.status := "upcoming"; returns event

    *   `deleteEvent (organizer: User, event: Event)`
        *   **requires**: organizer = event.organizer
        *   **effects**: removes event from the set of all existing events

    *   **system** `completeEvent (event: Event)`
        *   **requires**: event.status = "upcoming" and (event.date + event.duration (in minutes) <= current\_time)
        *   **effects**: event.status := "completed"

*   **queries**:
    *   `_getEvent (event: Event) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)`
        *   **requires**: The event must exist.
        *   **effects**: Returns the full details of the specified event.

    *   `_getEventsByOrganizer (organizer: User) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})`
        *   **requires**: The organizer must exist.
        *   **effects**: Returns all events organized by the specified user.

    *   `_getUpcomingEvents () : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})`
        *   **effects**: Returns all upcoming events (status "upcoming" and event end time is in the future).

    *   `_getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)`
        *   **requires**: The `filters` and `priorities` strings, if provided, must be parsable as JSON and their content understood by the concept for filtering/ordering events. The `user` parameter is used for context but the `Event` concept does not store user-specific recommendation data.
        *   **effects**: Returns a set of event details, filtered and potentially ordered, based on the provided contextual criteria. Returns an error if the criteria are malformed or cannot be applied internally.

# file: src/event/EventConcept.ts

```typescript
import { Collection, Db, Filter, Sort } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "Event" + ".";

// Generic type for the concept's external dependency
type User = ID;

// Internal entity type, represented as ID
type EventId = ID; // Renamed to EventId to avoid conflict with the interface name

/**
 * Enumerated type for event status.
 */
type EventStatus = "upcoming" | "cancelled" | "completed";

/**
 * State: A set of Events.
 */
interface EventDoc {
  _id: EventId; // MongoDB document ID
  organizer: User;
  name: string;
  date: Date; // Stored as ISODate in MongoDB
  duration: number; // Duration in minutes
  location: string;
  description: string;
  status: EventStatus;
}

/**
 * Output structure for event queries.
 */
interface EventOutput {
  id: EventId;
  organizer: User;
  name: string;
  date: Date;
  duration: number;
  location: string;
  description: string;
  status: EventStatus;
}

/**
 * @concept Event
 * @purpose enable users to organize, track, and facilitate the discovery of time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen, and supporting its retrieval based on externally provided contextual criteria.
 * @principle A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system. Additionally, the system can surface relevant events by applying externally derived contextual filters and prioritizations to its stored event data, aiding in personalized discovery without the event concept itself managing user preferences or advanced recommendation algorithms.
 */
export default class EventConcept {
  events: Collection<EventDoc>;

  constructor(private readonly db: Db) {
    this.events = this.db.collection(PREFIX + "events");
    // Optionally create indexes for frequently queried fields
    this.events.createIndex({ organizer: 1 });
    this.events.createIndex({ date: 1 });
    this.events.createIndex({ status: 1 });
  }

  /**
   * Helper to convert an EventDoc to EventOutput
   */
  private mapToEventOutput(doc: EventDoc): EventOutput {
    return {
      id: doc._id,
      organizer: doc.organizer,
      name: doc.name,
      date: doc.date,
      duration: doc.duration,
      location: doc.location,
      description: doc.description,
      status: doc.status,
    };
  }

  /**
   * createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)
   *
   * @requires date >= current_time; name != ""; location != ""; description != ""; duration > 0
   * @effects creates an event with the given details associated with the organizer, sets the status to "upcoming"; returns the new event
   */
  async createEvent({ organizer, name, date, duration, location, description }: { organizer: User; name: string; date: Date; duration: number; location: string; description: string }): Promise<{ event: EventId } | { error: string }> {
    const currentTime = new Date();
    if (date < currentTime) {
      return { error: "Event date cannot be in the past." };
    }
    if (!name.trim()) {
      return { error: "Event name cannot be empty." };
    }
    if (!location.trim()) {
      return { error: "Event location cannot be empty." };
    }
    if (!description.trim()) {
      return { error: "Event description cannot be empty." };
    }
    if (duration <= 0) {
      return { error: "Event duration must be greater than 0 minutes." };
    }

    const eventId = freshID() as EventId;
    await this.events.insertOne({ _id: eventId, organizer, name, date, duration, location, description, status: "upcoming" });
    return { event: eventId };
  }

  /**
   * modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)
   *
   * @requires organizer = event.organizer; newName != ""; newLocation != ""; newDescription != ""; newDate >= current_time; newDuration > 0; at least one field must differ from the original event details
   * @effects event.name := newName, event.date := newDate, event.duration := newDuration, event.location := newLocation, event.description := newDescription; returns event
   */
  async modifyEvent({ organizer, event, newName, newDate, newDuration, newLocation, newDescription }: { organizer: User; event: EventId; newName: string; newDate: Date; newDuration: number; newLocation: string; newDescription: string }): Promise<{ event: EventId } | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can modify the event." };
    }
    if (existingEvent.status === "completed") {
      return { error: "Cannot modify a completed event." };
    }

    const currentTime = new Date();
    if (newDate < currentTime) {
      return { error: "New event date cannot be in the past." };
    }
    if (!newName.trim()) {
      return { error: "New event name cannot be empty." };
    }
    if (!newLocation.trim()) {
      return { error: "New event location cannot be empty." };
    }
    if (!newDescription.trim()) {
      return { error: "New event description cannot be empty." };
    }
    if (newDuration <= 0) {
      return { error: "New event duration must be greater than 0 minutes." };
    }

    // Check if any field actually differs
    const hasChanges =
      existingEvent.name !== newName ||
      existingEvent.date.getTime() !== newDate.getTime() ||
      existingEvent.duration !== newDuration ||
      existingEvent.location !== newLocation ||
      existingEvent.description !== newDescription;

    if (!hasChanges) {
      return { error: "No changes detected. At least one field must differ from the original event details." };
    }

    const result = await this.events.updateOne(
      { _id: event },
      { $set: { name: newName, date: newDate, duration: newDuration, location: newLocation, description: newDescription, status: "upcoming" } } // Reset status to upcoming if modified
    );

    if (result.matchedCount === 0) {
      return { error: `Event with ID ${event} could not be updated.` };
    }
    return { event: event };
  }

  /**
   * cancelEvent (organizer: User, event: Event)
   *
   * @requires organizer = event.organizer and event.status = "upcoming"
   * @effects event.status := "cancelled"
   */
  async cancelEvent({ organizer, event }: { organizer: User; event: EventId }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can cancel the event." };
    }
    if (existingEvent.status !== "upcoming") {
      return { error: `Event with ID ${event} is not in "upcoming" status and cannot be cancelled.` };
    }

    await this.events.updateOne({ _id: event }, { $set: { status: "cancelled" } });
    return {};
  }

  /**
   * unCancelEvent (organizer: User, event: Event): (event: Event)
   *
   * @requires organizer = event.organizer and event.status = "cancelled" and event.date + event.duration (in minutes) >= current_time
   * @effects event.status := "upcoming"; returns event
   */
  async unCancelEvent({ organizer, event }: { organizer: User; event: EventId }): Promise<{ event: EventId } | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can uncanceled the event." };
    }
    if (existingEvent.status !== "cancelled") {
      return { error: `Event with ID ${event} is not in "cancelled" status.` };
    }

    const eventEndTime = new Date(existingEvent.date.getTime() + existingEvent.duration * 60 * 1000);
    const currentTime = new Date();
    if (eventEndTime < currentTime) {
      return { error: `Event with ID ${event} has already ended and cannot be uncanceled.` };
    }

    await this.events.updateOne({ _id: event }, { $set: { status: "upcoming" } });
    return { event: event };
  }

  /**
   * deleteEvent (organizer: User, event: Event)
   *
   * @requires organizer = event.organizer
   * @effects removes event from the set of all existing events
   */
  async deleteEvent({ organizer, event }: { organizer: User; event: EventId }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can delete the event." };
    }

    await this.events.deleteOne({ _id: event });
    return {};
  }

  /**
   * system completeEvent (event: Event)
   *
   * @requires event.status = "upcoming" and (event.date + event.duration (in minutes) <= current_time)
   * @effects event.status := "completed"
   */
  async completeEvent({ event }: { event: EventId }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.status !== "upcoming") {
      return { error: `Event with ID ${event} is not in "upcoming" status.` };
    }

    const eventEndTime = new Date(existingEvent.date.getTime() + existingEvent.duration * 60 * 1000);
    const currentTime = new Date();
    if (eventEndTime > currentTime) {
      return { error: `Event with ID ${event} has not yet ended.` };
    }

    await this.events.updateOne({ _id: event }, { $set: { status: "completed" } });
    return {};
  }

  /**
   * _getEvent (event: Event) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)
   *
   * @requires The event must exist.
   * @effects Returns the full details of the specified event.
   */
  async _getEvent({ event }: { event: EventId }): Promise<EventOutput[] | { error: string }> {
    const eventDoc = await this.events.findOne({ _id: event });
    if (!eventDoc) {
      return { error: `Event with ID ${event} not found.` };
    }
    return [this.mapToEventOutput(eventDoc)];
  }

  /**
   * _getEventsByOrganizer (organizer: User) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})
   *
   * @requires The organizer must exist.
   * @effects Returns all events organized by the specified user.
   */
  async _getEventsByOrganizer({ organizer }: { organizer: User }): Promise<EventOutput[]> {
    const events = await this.events.find({ organizer }).toArray();
    return events.map(this.mapToEventOutput);
  }

  /**
   * _getUpcomingEvents () : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})
   *
   * @effects Returns all upcoming events (status "upcoming" and event end time is in the future).
   */
  async _getUpcomingEvents(): Promise<EventOutput[]> {
    const currentTime = new Date();
    // Find events that are 'upcoming' AND their end time (date + duration) is in the future
    const events = await this.events.find({
      status: "upcoming",
      date: { $gt: currentTime } // Simplified to just check start date, as precise end date checking in mongo requires aggregation or a pre-calculated field
    }).toArray();
    
    // More precise filtering in memory to ensure event is truly upcoming
    return events
        .filter(event => (new Date(event.date.getTime() + event.duration * 60 * 1000)) > currentTime)
        .map(this.mapToEventOutput);
  }

  /**
   * _getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)
   *
   * @requires The `filters` and `priorities` strings, if provided, must be parsable as JSON and their content understood by the concept for filtering/ordering events. The `user` parameter is used for context but the `Event` concept does not store user-specific recommendation data.
   * @effects Returns a set of event details, filtered and potentially ordered, based on the provided contextual criteria. Returns an error if the criteria are malformed or cannot be applied internally.
   */
  async _getEventsByRecommendationContext({ user, filters, priorities }: { user: User; filters: string; priorities: string }): Promise<EventOutput[] | { error: string }> {
    let filterObj: any = {};
    let sortObj: Sort = { date: 1 }; // Default sort by date ascending
    let boostEventIds: EventId[] = [];
    const currentTime = new Date();

    try {
      if (filters) {
        const parsedFilters = JSON.parse(filters);
        // Example filters: categoryKeywords, locationKeywords, dateMin, dateMax
        if (parsedFilters.categoryKeywords && Array.isArray(parsedFilters.categoryKeywords) && parsedFilters.categoryKeywords.length > 0) {
          // Assuming event name or description might contain categories. For more robust, would need explicit category field.
          const keywordRegex = new RegExp(parsedFilters.categoryKeywords.join('|'), 'i');
          filterObj.$or = [
            { name: { $regex: keywordRegex } },
            { description: { $regex: keywordRegex } }
          ];
        }
        if (parsedFilters.locationKeywords && Array.isArray(parsedFilters.locationKeywords) && parsedFilters.locationKeywords.length > 0) {
            const locationRegex = new RegExp(parsedFilters.locationKeywords.join('|'), 'i');
            filterObj.location = { $regex: locationRegex };
        }
        if (parsedFilters.dateMin) {
          filterObj.date = { ...filterObj.date, $gte: new Date(parsedFilters.dateMin) };
        }
        if (parsedFilters.dateMax) {
          filterObj.date = { ...filterObj.date, $lte: new Date(parsedFilters.dateMax) };
        }
      }

      if (priorities) {
        const parsedPriorities = JSON.parse(priorities);
        if (parsedPriorities.boostEventIds && Array.isArray(parsedPriorities.boostEventIds)) {
          boostEventIds = parsedPriorities.boostEventIds as EventId[];
        }
        if (parsedPriorities.sortBy === "dateDesc") {
          sortObj = { date: -1 };
        } else if (parsedPriorities.sortBy === "nameAsc") {
          sortObj = { name: 1 };
        } // Add more sorting options as needed
      }
    } catch (e) {
      return { error: `Failed to parse filters or priorities: ${e.message}` };
    }

    // Always filter for upcoming or cancelled events (not completed unless specified)
    // For recommendations, usually we want upcoming events
    filterObj.status = "upcoming";
    filterObj.date = { ...filterObj.date, $gt: currentTime }; // Ensure event hasn't started yet

    let queryCursor = this.events.find(filterObj).sort(sortObj);

    // Apply boosting logic (this is a simple in-memory boosting example)
    // For large datasets, this might be better handled in an aggregation pipeline or in the external recommendation service.
    let filteredEvents = await queryCursor.toArray();

    if (boostEventIds.length > 0) {
      const boostedMap = new Map<EventId, EventDoc>();
      const nonBoostedEvents: EventDoc[] = [];

      for (const event of filteredEvents) {
        if (boostEventIds.includes(event._id)) {
          boostedMap.set(event._id, event);
        } else {
          nonBoostedEvents.push(event);
        }
      }

      const orderedBoostedEvents = boostEventIds
        .map(id => boostedMap.get(id))
        .filter((event): event is EventDoc => event !== undefined);

      filteredEvents = [...orderedBoostedEvents, ...nonBoostedEvents];
    }
    
    // The 'user' parameter is received, but the Event concept does not store or process
    // any user-specific recommendation metadata or history, demonstrating independence.
    // The actual "augmentation" of recommendations based on user interests/reviews
    // happens *before* this query is called, and is encoded in `filters` and `priorities`.

    return filteredEvents.map(this.mapToEventOutput);
  }
}
```
# response:

Here are the concept specifications and their TypeScript implementations, incorporating the requested `_getEventsByRecommendationContext` query into the `Event` concept, and following the concept design principles and implementation guidelines.

***

# concept: LikertSurvey

*   **concept**: LikertSurvey \[Author, Respondent]
*   **purpose**: To measure attitudes or opinions by asking respondents to rate their level of agreement with a series of statements on a predefined scale.
*   **principle**: If an author creates a survey with several questions on a 1-5 scale, and a respondent submits their answers to those questions, then the author can view the collected responses to analyze the respondent's opinions.
*   **state**:
    *   A set of `Surveys` with
        *   an `author` of type `Author`
        *   a `title` of type `String`
        *   a `scaleMin` of type `Number`
        *   a `scaleMax` of type `Number`
    *   A set of `Questions` with
        *   a `survey` of type `Survey`
        *   a `text` of type `String`
    *   A set of `Responses` with
        *   a `respondent` of type `Respondent`
        *   a `question` of type `Question`
        *   a `value` of type `Number`
*   **actions**:
    *   `createSurvey (author: Author, title: String, scaleMin: Number, scaleMax: Number): (survey: Survey)`
        *   **requires**: `scaleMin < scaleMax`
        *   **effects**: Creates a new survey with the given author, title, and scale.
    *   `addQuestion (survey: Survey, text: String): (question: Question)`
        *   **requires**: The survey must exist.
        *   **effects**: Adds a new question to the specified survey.
    *   `submitResponse (respondent: Respondent, question: Question, value: Number)`
        *   **requires**: The question must exist. The respondent must not have already submitted a response for this question. The value must be within the survey's scale.
        *   **effects**: Records the respondent's answer for the given question.
    *   `updateResponse (respondent: Respondent, question: Question, value: Number)`
        *   **requires**: The question must exist. The respondent must have already submitted a response for this question. The value must be within the survey's scale.
        *   **effects**: Updates the respondent's existing answer for the given question.
*   **queries**:
    *   `_getSurveyQuestions (survey: Survey) : (question: {id: Question, survey: Survey, text: String})`
        *   **requires**: The survey must exist.
        *   **effects**: Returns all questions associated with the specified survey.
    *   `_getSurveyResponses (survey: Survey) : (response: {id: Response, respondent: Respondent, question: Question, value: Number})`
        *   **requires**: The survey must exist.
        *   **effects**: Returns all responses for the questions within the specified survey.
    *   `_getRespondentAnswers (respondent: Respondent) : (response: {id: Response, respondent: Respondent, question: Question, value: Number})`
        *   **requires**: The respondent must exist.
        *   **effects**: Returns all answers submitted by the specified respondent.

# file: src/likertsurvey/LikertSurveyConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "LikertSurvey" + ".";

// Generic types for the concept's external dependencies
type Author = ID;
type Respondent = ID;

// Internal entity types, represented as IDs
type Survey = ID;
type Question = ID;
type Response = ID;

/**
 * State: A set of Surveys with an author, title, and scale.
 */
interface SurveyDoc {
  _id: Survey; // MongoDB document ID
  author: Author;
  title: string;
  scaleMin: number;
  scaleMax: number;
}

/**
 * State: A set of Questions, each linked to a survey and containing text.
 */
interface QuestionDoc {
  _id: Question; // MongoDB document ID
  survey: Survey;
  text: string;
}

/**
 * State: A set of Responses, linking a respondent, a question, and their chosen value.
 */
interface ResponseDoc {
  _id: Response; // MongoDB document ID
  respondent: Respondent;
  question: Question;
  value: number;
}

/**
 * @concept LikertSurvey
 * @purpose To measure attitudes or opinions by asking respondents to rate their level of agreement with a series of statements on a predefined scale.
 * @principle If an author creates a survey with several questions on a 1-5 scale, and a respondent submits their answers to those questions, then the author can view the collected responses to analyze the respondent's opinions.
 */
export default class LikertSurveyConcept {
  surveys: Collection<SurveyDoc>;
  questions: Collection<QuestionDoc>;
  responses: Collection<ResponseDoc>;

  constructor(private readonly db: Db) {
    this.surveys = this.db.collection(PREFIX + "surveys");
    this.questions = this.db.collection(PREFIX + "questions");
    this.responses = this.db.collection(PREFIX + "responses");
  }

  /**
   * createSurvey (author: Author, title: String, scaleMin: Number, scaleMax: Number): (survey: Survey)
   *
   * @requires scaleMin must be less than scaleMax.
   * @effects A new survey is created and its ID is returned.
   */
  async createSurvey({ author, title, scaleMin, scaleMax }: { author: Author; title: string; scaleMin: number; scaleMax: number }): Promise<{ survey: Survey } | { error: string }> {
    if (scaleMin >= scaleMax) {
      return { error: "scaleMin must be less than scaleMax" };
    }

    const surveyId = freshID() as Survey;
    await this.surveys.insertOne({ _id: surveyId, author, title, scaleMin, scaleMax });
    return { survey: surveyId };
  }

  /**
   * addQuestion (survey: Survey, text: String): (question: Question)
   *
   * @requires The survey must exist.
   * @effects A new question is created and its ID is returned.
   */
  async addQuestion({ survey, text }: { survey: Survey; text: string }): Promise<{ question: Question } | { error: string }> {
    const existingSurvey = await this.surveys.findOne({ _id: survey });
    if (!existingSurvey) {
      return { error: `Survey with ID ${survey} not found.` };
    }

    const questionId = freshID() as Question;
    await this.questions.insertOne({ _id: questionId, survey, text });
    return { question: questionId };
  }

  /**
   * submitResponse (respondent: Respondent, question: Question, value: Number)
   *
   * @requires The question must exist.
   * @requires The respondent must not have already responded to this question.
   * @requires The response value must be within the survey's defined scale.
   * @effects A new response is recorded in the state.
   */
  async submitResponse({ respondent, question, value }: { respondent: Respondent; question: Question; value: number }): Promise<Empty | { error: string }> {
    const questionDoc = await this.questions.findOne({ _id: question });
    if (!questionDoc) {
      return { error: `Question with ID ${question} not found.` };
    }

    const surveyDoc = await this.surveys.findOne({ _id: questionDoc.survey });
    if (!surveyDoc) {
      // This indicates a data integrity issue but is a good safeguard.
      return { error: "Associated survey for the question not found." };
    }

    if (value < surveyDoc.scaleMin || value > surveyDoc.scaleMax) {
      return { error: `Response value ${value} is outside the survey's scale [${surveyDoc.scaleMin}, ${surveyDoc.scaleMax}].` };
    }

    const existingResponse = await this.responses.findOne({ respondent, question });
    if (existingResponse) {
      return { error: "Respondent has already answered this question. Use updateResponse to change it." };
    }

    const responseId = freshID() as Response;
    await this.responses.insertOne({ _id: responseId, respondent, question, value });

    return {};
  }

  /**
   * updateResponse (respondent: Respondent, question: Question, value: Number)
   *
   * @requires The question must exist.
   * @requires A response from the given respondent to the question must already exist.
   * @requires The new response value must be within the survey's defined scale.
   * @effects The existing response's value is updated.
   */
  async updateResponse({ respondent, question, value }: { respondent: Respondent; question: Question; value: number }): Promise<Empty | { error: string }> {
    const questionDoc = await this.questions.findOne({ _id: question });
    if (!questionDoc) {
      return { error: `Question with ID ${question} not found.` };
    }

    const surveyDoc = await this.surveys.findOne({ _id: questionDoc.survey });
    if (!surveyDoc) {
      return { error: "Associated survey for the question not found." };
    }

    if (value < surveyDoc.scaleMin || value > surveyDoc.scaleMax) {
      return { error: `Response value ${value} is outside the survey's scale [${surveyDoc.scaleMin}, ${surveyDoc.scaleMax}].` };
    }

    const result = await this.responses.updateOne({ respondent, question }, { $set: { value } });

    if (result.matchedCount === 0) {
      return { error: "No existing response found to update. Use submitResponse to create one." };
    }

    return {};
  }

  /**
   * _getSurveyQuestions (survey: Survey) : (question: {id: Question, survey: Survey, text: String})
   *
   * @requires The survey must exist.
   * @effects Returns all questions associated with the specified survey.
   */
  async _getSurveyQuestions({ survey }: { survey: Survey }): Promise<{ id: Question; survey: Survey; text: string }[]> {
    const questions = await this.questions.find({ survey }).toArray();
    return questions.map(q => ({ id: q._id, survey: q.survey, text: q.text }));
  }

  /**
   * _getSurveyResponses (survey: Survey) : (response: {id: Response, respondent: Respondent, question: Question, value: Number})
   *
   * @requires The survey must exist.
   * @effects Returns all responses for the questions within the specified survey.
   */
  async _getSurveyResponses({ survey }: { survey: Survey }): Promise<{ id: Response; respondent: Respondent; question: Question; value: number }[]> {
    const surveyQuestions = await this.questions.find({ survey }).project({ _id: 1 }).toArray();
    const questionIds = surveyQuestions.map((q) => q._id as Question);
    const responses = await this.responses.find({ question: { $in: questionIds } }).toArray();
    return responses.map(r => ({ id: r._id, respondent: r.respondent, question: r.question, value: r.value }));
  }

  /**
   * _getRespondentAnswers (respondent: Respondent) : (response: {id: Response, respondent: Respondent, question: Question, value: Number})
   *
   * @requires The respondent must exist.
   * @effects Returns all answers submitted by the specified respondent.
   */
  async _getRespondentAnswers({ respondent }: { respondent: Respondent }): Promise<{ id: Response; respondent: Respondent; question: Question; value: number }[]> {
    const responses = await this.responses.find({ respondent }).toArray();
    return responses.map(r => ({ id: r._id, respondent: r.respondent, question: r.question, value: r.value }));
  }
}
```

***

# concept: Reviewing \[User, Item]

*   **concept**: Reviewing \[User, Item]

*   **purpose**: enable users to provide qualitative and quantitative feedback on items

*   **principle**: a user creates a review for an item containing a written entry and numerical rating; modify the entry and rating for this review if needed; the user can also delete their review

*   **state**:
    *   a set of Reviews with
        *   a reviewer User
        *   a target Item
        *   a rating Number
        *   an entry String

*   **actions**:
    *   `addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)`
        *   **requires**: no review by user for this item exists, rating is a value between 0 and 10
        *   **effects**: create a review by the user for this item with the given rating and text entry, return the created review

    *   `removeReview (user: User, item: Item)`
        *   **requires**: a review by the user for this item exists
        *   **effects**: deletes the review that is associated with the given user and item

    *   `modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)`
        *   **requires**: a review by the user for this item exists, rating is a value between 0 and 10
        *   **effects**: modifies the review with the given fields for the rating and entry, returns the modified review

*   **queries**:
    *   `_getReview (user: User, item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})`
        *   **requires**: a review exists for the given user and item
        *   **effects**: returns the review associated with the given user and item

    *   `_getReviewsByItem (item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})`
        *   **effects**: returns all reviews targeting the given item

    *   `_getReviewsByUser (user: User) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})`
        *   **effects**: returns all reviews authored by the given user

# file: src/reviewing/ReviewingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "Reviewing" + ".";

// Generic types for the concept's external dependencies
type User = ID;
type Item = ID;

// Internal entity type, represented as ID
type Review = ID;

/**
 * State: A set of Reviews.
 * Each review links a reviewer (User), a target item (Item), a numerical rating, and a text entry.
 */
interface ReviewDoc {
  _id: Review; // MongoDB document ID
  reviewer: User;
  target: Item;
  rating: number;
  entry: string;
}

/**
 * @concept Reviewing
 * @purpose enable users to provide qualitative and quantitative feedback on items
 * @principle a user creates a review for an item containing a written entry and numerical rating; modify the entry and rating for this review if needed; the user can also delete their review
 */
export default class ReviewingConcept {
  reviews: Collection<ReviewDoc>;

  constructor(private readonly db: Db) {
    this.reviews = this.db.collection(PREFIX + "reviews");
  }

  /**
   * addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
   *
   * @requires no review by user for this item exists, rating is a value between 0 and 10
   * @effects create a review by the user for this item with the given rating and text entry, return the created review
   */
  async addReview({ user, item, rating, entry }: { user: User; item: Item; rating: number; entry: string }): Promise<{ review: Review } | { error: string }> {
    if (rating < 0 || rating > 10) {
      return { error: "Rating must be between 0 and 10." };
    }

    const existingReview = await this.reviews.findOne({ reviewer: user, target: item });
    if (existingReview) {
      return { error: `User ${user} has already reviewed item ${item}.` };
    }

    const reviewId = freshID() as Review;
    await this.reviews.insertOne({ _id: reviewId, reviewer: user, target: item, rating, entry });
    return { review: reviewId };
  }

  /**
   * removeReview (user: User, item: Item)
   *
   * @requires a review by the user for this item exists
   * @effects deletes the review that is associated with the given user and item
   */
  async removeReview({ user, item }: { user: User; item: Item }): Promise<Empty | { error: string }> {
    const result = await this.reviews.deleteOne({ reviewer: user, target: item });
    if (result.deletedCount === 0) {
      return { error: `No review found by user ${user} for item ${item}.` };
    }
    return {};
  }

  /**
   * modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
   *
   * @requires a review by the user for this item exists, rating is a value between 0 and 10
   * @effects modifies the review with the given fields for the rating and entry, returns the modified review
   */
  async modifyReview({ user, item, rating, entry }: { user: User; item: Item; rating: number; entry: string }): Promise<{ review: Review } | { error: string }> {
    if (rating < 0 || rating > 10) {
      return { error: "Rating must be between 0 and 10." };
    }

    const updatedReview = await this.reviews.findOneAndUpdate(
      { reviewer: user, target: item },
      { $set: { rating, entry } },
      { returnDocument: "after" }
    );

    if (!updatedReview.value) {
      return { error: `No review found by user ${user} for item ${item} to modify.` };
    }
    return { review: updatedReview.value._id };
  }

  /**
   * _getReview (user: User, item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @requires a review exists for the given user and item
   * @effects returns the review associated with the given user and item
   */
  async _getReview({ user, item }: { user: User; item: Item }): Promise<Array<{ id: Review; reviewer: User; target: Item; rating: number; entry: string }> | { error: string }> {
    const review = await this.reviews.findOne({ reviewer: user, target: item });
    if (!review) {
      return { error: `No review found by user ${user} for item ${item}.` };
    }
    return [{ id: review._id, reviewer: review.reviewer, target: review.target, rating: review.rating, entry: review.entry }];
  }

  /**
   * _getReviewsByItem (item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @effects returns all reviews targeting the given item
   */
  async _getReviewsByItem({ item }: { item: Item }): Promise<Array<{ id: Review; reviewer: User; target: Item; rating: number; entry: string }>> {
    const reviews = await this.reviews.find({ target: item }).toArray();
    return reviews.map(r => ({ id: r._id, reviewer: r.reviewer, target: r.target, rating: r.rating, entry: r.entry }));
  }

  /**
   * _getReviewsByUser (user: User) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @effects returns all reviews authored by the given user
   */
  async _getReviewsByUser({ user }: { user: User }): Promise<Array<{ id: Review; reviewer: User; target: Item; rating: number; entry: string }>> {
    const reviews = await this.reviews.find({ reviewer: user }).toArray();
    return reviews.map(r => ({ id: r._id, reviewer: r.reviewer, target: r.target, rating: r.rating, entry: r.entry }));
  }
}
```

***

# concept: Friending \[User]

*   **concept**: Friending \[User]

*   **purpose**: enable users to establish and manage mutual social connections

*   **principle**: a user can send a friend request to another user; they may choose to remove this request before the target user takes action; the recipient of a friend request can choose to accept or remove it; once a request is accepted, two users become friends; friendship may be revoked.

*   **state**:
    *   a set of Users with
        *   a set of friends Users
        *   a set of incomingRequests Users
        *   a set of outgoingRequests Users

*   **actions**:
    *   `sendFriendRequest (user: User, target: User)`
        *   **requires**: user and target are not existing friends, user has not already sent a request to target, user and target are not the same
        *   **effects**: target is added to the set of the user's outgoing requests; user is added to the set of target's incoming requests

    *   `acceptFriendRequest (requester: User, target: User)`
        *   **requires**: requester has sent a friend request to target, requester and target are not friends, requester and target are not the same
        *   **effects**: requester and target are added to each other's set of friends, they are both removed from the other's set of incoming/outgoingRequests

    *   `removeFriendRequest (requester: User, target: User)`
        *   **requires**: requester has sent a friend request to target, requester and target are not friends, requester and target are not the same
        *   **effects**: requester is removed from the target's set of incomingRequests, target is removed the requester's set of outgoingRequests

    *   `removeFriend (user: User, friend: User): ()`
        *   **requires**: user and friend are friends with each other, user and friend are not the same
        *   **effects**: user and friends are both removed from each other's set of friends

*   **queries**:
    *   `_getFriends (user: User) : (friend: User)`
        *   **requires**: user exists
        *   **effects**: returns all friends of the given user

    *   `_getIncomingRequests (user: User) : (requester: User)`
        *   **requires**: user exists
        *   **effects**: returns all users who sent a friend request to the given user

    *   `_getOutgoingRequests (user: User) : (target: User)`
        *   **requires**: user exists
        *   **effects**: returns all users to whom the given user sent a friend request

    *   `_areFriends (user1: User, user2: User) : (isFriend: Flag)`
        *   **requires**: user1 and user2 exist
        *   **effects**: returns true if user1 and user2 are friends, false otherwise

# file: src/friending/FriendingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
// Note: freshID is not directly used here as User IDs are external, but imported for completeness if internal entities were added.

// Collection prefix to ensure namespace separation
const PREFIX = "Friending" + ".";

// Generic type for the concept's external dependency
type User = ID;

/**
 * State: A set of Users with relations for friends, incoming requests, and outgoing requests.
 */
interface UserRelationsDoc {
  _id: User; // MongoDB document ID for the user
  friends: User[];
  incomingRequests: User[];
  outgoingRequests: User[];
}

/**
 * @concept Friending
 * @purpose enable users to establish and manage mutual social connections
 * @principle a user can send a friend request to another user; they may choose to remove this request before the target user takes action; the recipient of a friend request can choose to accept or remove it; once a request is accepted, two users become friends; friendship may be revoked.
 */
export default class FriendingConcept {
  userRelations: Collection<UserRelationsDoc>;

  constructor(private readonly db: Db) {
    this.userRelations = this.db.collection(PREFIX + "userRelations");
  }

  // Helper to ensure a user's document exists, initializing if not
  private async ensureUserExists(userId: User): Promise<Empty | { error: string }> {
    const userDoc = await this.userRelations.findOne({ _id: userId });
    if (!userDoc) {
      await this.userRelations.insertOne({ _id: userId, friends: [], incomingRequests: [], outgoingRequests: [] });
    }
    return {};
  }

  /**
   * sendFriendRequest (user: User, target: User)
   *
   * @requires user and target are not existing friends, user has not already sent a request to target, user and target are not the same
   * @effects target is added to the set of the user's outgoing requests; user is added to the set of target's incoming requests
   */
  async sendFriendRequest({ user, target }: { user: User; target: User }): Promise<Empty | { error: string }> {
    if (user === target) {
      return { error: "User cannot send a friend request to themselves." };
    }

    await this.ensureUserExists(user);
    await this.ensureUserExists(target);

    const userDoc = await this.userRelations.findOne({ _id: user });
    const targetDoc = await this.userRelations.findOne({ _id: target });

    if (userDoc?.friends.includes(target) || targetDoc?.friends.includes(user)) {
      return { error: `User ${user} and ${target} are already friends.` };
    }
    if (userDoc?.outgoingRequests.includes(target)) {
      return { error: `User ${user} has already sent a friend request to ${target}.` };
    }
    if (targetDoc?.outgoingRequests.includes(user)) { // If target sent a request to user, they should accept instead
      return { error: `User ${target} has already sent a friend request to ${user}. Accept it instead.` };
    }

    await this.userRelations.updateOne({ _id: user }, { $addToSet: { outgoingRequests: target } });
    await this.userRelations.updateOne({ _id: target }, { $addToSet: { incomingRequests: user } });

    return {};
  }

  /**
   * acceptFriendRequest (requester: User, target: User)
   *
   * @requires requester has sent a friend request to target, requester and target are not friends, requester and target are not the same
   * @effects requester and target are added to each other's set of friends, they are both removed from the other's set of incoming/outgoingRequests
   */
  async acceptFriendRequest({ requester, target }: { requester: User; target: User }): Promise<Empty | { error: string }> {
    if (requester === target) {
      return { error: "Cannot accept a request from oneself." };
    }

    await this.ensureUserExists(requester);
    await this.ensureUserExists(target);

    const targetDoc = await this.userRelations.findOne({ _id: target });
    const requesterDoc = await this.userRelations.findOne({ _id: requester });

    if (!targetDoc?.incomingRequests.includes(requester)) {
      return { error: `User ${requester} has not sent a friend request to ${target}.` };
    }
    if (targetDoc?.friends.includes(requester) || requesterDoc?.friends.includes(target)) {
      return { error: `User ${requester} and ${target} are already friends.` };
    }

    // Add to friends
    await this.userRelations.updateOne({ _id: target }, { $addToSet: { friends: requester }, $pull: { incomingRequests: requester } });
    await this.userRelations.updateOne({ _id: requester }, { $addToSet: { friends: target }, $pull: { outgoingRequests: target } });

    return {};
  }

  /**
   * removeFriendRequest (requester: User, target: User)
   *
   * @requires requester has sent a friend request to target, requester and target are not friends, requester and target are not the same
   * @effects requester is removed from the target's set of incomingRequests, target is removed the requester's set of outgoingRequests
   */
  async removeFriendRequest({ requester, target }: { requester: User; target: User }): Promise<Empty | { error: string }> {
    if (requester === target) {
      return { error: "Cannot remove a request to/from oneself." };
    }

    await this.ensureUserExists(requester);
    await this.ensureUserExists(target);

    const targetDoc = await this.userRelations.findOne({ _id: target });
    const requesterDoc = await this.userRelations.findOne({ _id: requester });

    if (!requesterDoc?.outgoingRequests.includes(target) && !targetDoc?.incomingRequests.includes(requester)) {
        return { error: `No pending friend request found from ${requester} to ${target}.` };
    }
    if (requesterDoc?.friends.includes(target) || targetDoc?.friends.includes(requester)) {
        return { error: `User ${requester} and ${target} are already friends. Use removeFriend instead.` };
    }

    await this.userRelations.updateOne({ _id: target }, { $pull: { incomingRequests: requester } });
    await this.userRelations.updateOne({ _id: requester }, { $pull: { outgoingRequests: target } });

    return {};
  }

  /**
   * removeFriend (user: User, friend: User): ()
   *
   * @requires user and friend are friends with each other, user and friend are not the same
   * @effects user and friends are both removed from each other's set of friends
   */
  async removeFriend({ user, friend }: { user: User; friend: User }): Promise<Empty | { error: string }> {
    if (user === friend) {
      return { error: "Cannot unfriend oneself." };
    }

    const userDoc = await this.userRelations.findOne({ _id: user });
    const friendDoc = await this.userRelations.findOne({ _id: friend });

    if (!userDoc?.friends.includes(friend) || !friendDoc?.friends.includes(user)) {
      return { error: `User ${user} and ${friend} are not friends.` };
    }

    await this.userRelations.updateOne({ _id: user }, { $pull: { friends: friend } });
    await this.userRelations.updateOne({ _id: friend }, { $pull: { friends: user } });

    return {};
  }

  /**
   * _getFriends (user: User) : (friend: User)
   *
   * @requires user exists
   * @effects returns all friends of the given user
   */
  async _getFriends({ user }: { user: User }): Promise<{ friend: User }[]> {
    const userDoc = await this.userRelations.findOne({ _id: user });
    if (!userDoc) {
        return []; // User not found, no friends
    }
    return userDoc.friends.map(friendId => ({ friend: friendId }));
  }

  /**
   * _getIncomingRequests (user: User) : (requester: User)
   *
   * @requires user exists
   * @effects returns all users who sent a friend request to the given user
   */
  async _getIncomingRequests({ user }: { user: User }): Promise<{ requester: User }[]> {
    const userDoc = await this.userRelations.findOne({ _id: user });
    if (!userDoc) {
        return []; // User not found, no incoming requests
    }
    return userDoc.incomingRequests.map(requesterId => ({ requester: requesterId }));
  }

  /**
   * _getOutgoingRequests (user: User) : (target: User)
   *
   * @requires user exists
   * @effects returns all users to whom the given user sent a friend request
   */
  async _getOutgoingRequests({ user }: { user: User }): Promise<{ target: User }[]> {
    const userDoc = await this.userRelations.findOne({ _id: user });
    if (!userDoc) {
        return []; // User not found, no outgoing requests
    }
    return userDoc.outgoingRequests.map(targetId => ({ target: targetId }));
  }

  /**
   * _areFriends (user1: User, user2: User) : (isFriend: Flag)
   *
   * @requires user1 and user2 exist
   * @effects returns true if user1 and user2 are friends, false otherwise
   */
  async _areFriends({ user1, user2 }: { user1: User; user2: User }): Promise<{ isFriend: boolean }> {
    if (user1 === user2) {
      return { isFriend: false }; // A user is not friends with themselves in this context
    }
    const user1Doc = await this.userRelations.findOne({ _id: user1 });
    const user2Doc = await this.userRelations.findOne({ _id: user2 });

    if (!user1Doc || !user2Doc) {
        // If either user doesn't exist, they can't be friends.
        return { isFriend: false };
    }

    const areIndeedFriends = user1Doc.friends.includes(user2) && user2Doc.friends.includes(user1);
    return { isFriend: areIndeedFriends };
  }
}
```

***

# concept: UserAuthentication \[User]

**concept**: UserAuthentication \[User]

**purpose**: enable users to register and verify their identity using a username and password.

**principle**: If a user registers with a unique username and password, they can then authenticate using those same credentials to be identified as the registered user.

**state**:

```
a set of Users with
  a username String
  a password String
```

**actions**:

```
register (username: String, password: String): (user: User)

  requires: the username must not already exist in the system

  effects: create a new User with this username and password, returns the user

authenticate (username: String, password: String): (user: User)

  requires: there exists a user with the given username and password

  effects: returns the registered user that matches with the given username and password
```

**queries**:

```
_getUsername (user: User) : (username: String)
  requires: user exists
  effects: returns the username associated with the user

_getUserByUsername (username: String) : (user: User) | (error: String)
  requires: a user with the given username exists
  effects: if a user with the given username exists, returns that user; otherwise returns an error
```

# file: src/userauthentication/UserAuthenticationConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import { createHash } from "node:crypto"; // For password hashing

// Collection prefix to ensure namespace separation
const PREFIX = "UserAuthentication" + ".";

// Generic type for the concept's external dependency
type User = ID;

/**
 * State: A set of Users with a username and a hashed password.
 */
interface UserAccountDoc {
  _id: User; // MongoDB document ID for the user
  username: string;
  passwordHash: string; // Storing hashed password for security
}

/**
 * @concept UserAuthentication
 * @purpose enable users to register and verify their identity using a username and password.
 * @principle If a user registers with a unique username and password, they can then authenticate using those same credentials to be identified as the registered user.
 */
export default class UserAuthenticationConcept {
  userAccounts: Collection<UserAccountDoc>;

  constructor(private readonly db: Db) {
    this.userAccounts = this.db.collection(PREFIX + "userAccounts");
    // Ensure username is unique for efficient lookup
    this.userAccounts.createIndex({ username: 1 }, { unique: true });
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  /**
   * register (username: String, password: String): (user: User)
   *
   * @requires the username must not already exist in the system
   * @effects create a new User with this username and password, returns the user
   */
  async register({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const existingUser = await this.userAccounts.findOne({ username });
    if (existingUser) {
      return { error: `Username "${username}" already exists.` };
    }

    const userId = freshID() as User;
    const passwordHash = this.hashPassword(password);
    await this.userAccounts.insertOne({ _id: userId, username, passwordHash });

    return { user: userId };
  }

  /**
   * authenticate (username: String, password: String): (user: User)
   *
   * @requires there exists a user with the given username and password
   * @effects returns the registered user that matches with the given username and password
   */
  async authenticate({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const passwordHash = this.hashPassword(password);
    const userAccount = await this.userAccounts.findOne({ username, passwordHash });

    if (!userAccount) {
      return { error: "Invalid username or password." };
    }

    return { user: userAccount._id };
  }

  /**
   * _getUsername (user: User) : (username: String)
   *
   * @requires user exists
   * @effects returns the username associated with the user
   */
  async _getUsername({ user }: { user: User }): Promise<Array<{ username: string }> | { error: string }> {
    const userAccount = await this.userAccounts.findOne({ _id: user });
    if (!userAccount) {
      return { error: `User with ID ${user} not found.` };
    }
    return [{ username: userAccount.username }];
  }

  /**
   * _getUserByUsername (username: String) : (user: User) | (error: String)
   *
   * @requires a user with the given username exists
   * @effects if a user with the given username exists, returns that user; otherwise returns an error
   */
  async _getUserByUsername({ username }: { username: string }): Promise<Array<{ user: User }> | { error: string }> {
    const userAccount = await this.userAccounts.findOne({ username });
    if (!userAccount) {
      return { error: `User with username "${username}" not found.` };
    }
    return [{ user: userAccount._id }];
  }
}
```

***

# concept: UserInterest \[User, Item]

*   **concept**: UserInterest \[User, Item]

*   **purpose**: enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience and facilitate content discovery.

*   **principle**: a user wants to add their personal interests through a specific tag; they can remove this tag or add more tags whenever; they may also indicate interest in specific items and can similarly remove or add more interests in the future.

*   **state**:
    *   A set of `UserItemInterests` with
        *   a user User
        *   an item Item

    *   A set of `UserPersonalInterests` with
        *   a user User
        *   a tag String

*   **actions**:
    *   `addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)`
        *   **requires**: tag is a non-empty String, there does not already exist a UserPersonalInterest associating the user to the given tag
        *   **effects**: creates a UserPersonalInterest associating the user to the tag, and returns it

    *   `removePersonalInterest (user: User, tag: String)`
        *   **requires**: tag is a non-empty string, there exists a UserPersonalInterest associating the user to the given tag
        *   **effects**: removes the UserPersonalInterest associating the user to the tag

    *   `addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)`
        *   **requires**: there does not already exist a UserItemInterest associating the user to the item
        *   **effects**: creates a UserItemInterest associating the user to the tag, and returns it

    *   `removeItemInterest (user: User, item: Item)`
        *   **requires**: there exists a UserItemInterest associating the user to the given item
        *   **effects**: removes the UserItemInterest associating the user to the item

*   **queries**:
    *   `_getPersonalInterests (user: User) : (tag: String)`
        *   **requires**: user exists
        *   **effects**: returns all personal interest tags associated with the user

    *   `_getItemInterests (user: User) : (item: Item)`
        *   **requires**: user exists
        *   **effects**: returns all items the user has expressed interest in

# file: src/userinterest/UserInterestConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "UserInterest" + ".";

// Generic types for the concept's external dependencies
type User = ID;
type Item = ID;

// Internal entity types, represented as IDs (though not strictly needed as relationships are direct)
type UserPersonalInterest = ID; // Represents the association record
type UserItemInterest = ID; // Represents the association record

/**
 * State: An association of a User with an Item they are interested in.
 */
interface UserItemInterestDoc {
  _id: UserItemInterest; // Unique ID for this specific interest record
  user: User;
  item: Item;
}

/**
 * State: An association of a User with a general tag/topic they are interested in.
 */
interface UserPersonalInterestDoc {
  _id: UserPersonalInterest; // Unique ID for this specific interest record
  user: User;
  tag: string;
}

/**
 * @concept UserInterest
 * @purpose enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience and facilitate content discovery.
 * @principle a user wants to add their personal interests through a specific tag; they can remove this tag or add more tags whenever; they may also indicate interest in specific items and can similarly remove or add more interests in the future.
 */
export default class UserInterestConcept {
  userItemInterests: Collection<UserItemInterestDoc>;
  userPersonalInterests: Collection<UserPersonalInterestDoc>;

  constructor(private readonly db: Db) {
    this.userItemInterests = this.db.collection(PREFIX + "userItemInterests");
    this.userPersonalInterests = this.db.collection(PREFIX + "userPersonalInterests");

    // Ensure uniqueness for interest records to prevent duplicates
    this.userItemInterests.createIndex({ user: 1, item: 1 }, { unique: true });
    this.userPersonalInterests.createIndex({ user: 1, tag: 1 }, { unique: true });
  }

  /**
   * addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)
   *
   * @requires tag is a non-empty String, there does not already exist a UserPersonalInterest associating the user to the given tag
   * @effects creates a UserPersonalInterest associating the user to the tag, and returns it
   */
  async addPersonalInterest({ user, tag }: { user: User; tag: string }): Promise<{ personalInterest: UserPersonalInterest } | { error: string }> {
    if (!tag.trim()) {
      return { error: "Tag cannot be empty." };
    }

    const existingInterest = await this.userPersonalInterests.findOne({ user, tag });
    if (existingInterest) {
      return { error: `User ${user} already has personal interest tag "${tag}".` };
    }

    const interestId = freshID() as UserPersonalInterest;
    await this.userPersonalInterests.insertOne({ _id: interestId, user, tag });
    return { personalInterest: interestId };
  }

  /**
   * removePersonalInterest (user: User, tag: String)
   *
   * @requires tag is a non-empty string, there exists a UserPersonalInterest associating the user to the given tag
   * @effects removes the UserPersonalInterest associating the user to the tag
   */
  async removePersonalInterest({ user, tag }: { user: User; tag: string }): Promise<Empty | { error: string }> {
    if (!tag.trim()) {
      return { error: "Tag cannot be empty." };
    }

    const result = await this.userPersonalInterests.deleteOne({ user, tag });
    if (result.deletedCount === 0) {
      return { error: `No personal interest tag "${tag}" found for user ${user}.` };
    }
    return {};
  }

  /**
   * addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)
   *
   * @requires there does not already exist a UserItemInterest associating the user to the item
   * @effects creates a UserItemInterest associating the user to the tag, and returns it
   */
  async addItemInterest({ user, item }: { user: User; item: Item }): Promise<{ itemInterest: UserItemInterest } | { error: string }> {
    const existingInterest = await this.userItemInterests.findOne({ user, item });
    if (existingInterest) {
      return { error: `User ${user} is already interested in item ${item}.` };
    }

    const interestId = freshID() as UserItemInterest;
    await this.userItemInterests.insertOne({ _id: interestId, user, item });
    return { itemInterest: interestId };
  }

  /**
   * removeItemInterest (user: User, item: Item)
   *
   * @requires there exists a UserItemInterest associating the user to the given item
   * @effects removes the UserItemInterest associating the user to the item
   */
  async removeItemInterest({ user, item }: { user: User; item: Item }): Promise<Empty | { error: string }> {
    const result = await this.userItemInterests.deleteOne({ user, item });
    if (result.deletedCount === 0) {
      return { error: `No item interest in ${item} found for user ${user}.` };
    }
    return {};
  }

  /**
   * _getPersonalInterests (user: User) : (tag: String)
   *
   * @requires user exists
   * @effects returns all personal interest tags associated with the user
   */
  async _getPersonalInterests({ user }: { user: User }): Promise<{ tag: string }[]> {
    const interests = await this.userPersonalInterests.find({ user }).toArray();
    return interests.map(i => ({ tag: i.tag }));
  }

  /**
   * _getItemInterests (user: User) : (item: Item)
   *
   * @requires user exists
   * @effects returns all items the user has expressed interest in
   */
  async _getItemInterests({ user }: { user: User }): Promise<{ item: Item }[]> {
    const interests = await this.userItemInterests.find({ user }).toArray();
    return interests.map(i => ({ item: i.item }));
  }
}
```

***

# concept: Event \[User]

**concept** Event \[User]

*   **purpose**: enable users to organize, track, and facilitate the discovery of time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen, and supporting its retrieval based on externally provided contextual criteria.

*   **principle**: A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system. Additionally, the system can surface relevant events by applying externally derived contextual filters and prioritizations to its stored event data, aiding in personalized discovery without the event concept itself managing user preferences or advanced recommendation algorithms.

*   **state**:
    *   a set of Events with
        *   an organizer User
        *   a name String
        *   a date DateTime
        *   a duration Number // Duration in minutes
        *   a location String
        *   a description String
        *   a status of "upcoming" or "cancelled" or "completed"

*   **actions**:
    *   `createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)`
        *   **requires**: date >= current\_time; name != ""; location != ""; description != ""; duration > 0
        *   **effects**: creates an event with the given details associated with the organizer, sets the status to "upcoming"; returns the new event

    *   `modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)`
        *   **requires**: organizer = event.organizer; newName != ""; newLocation != ""; newDescription != ""; newDate >= current\_time; newDuration > 0; at least one field must differ from the original event details
        *   **effects**: event.name := newName, event.date := newDate, event.duration := newDuration, event.location := newLocation, event.description := newDescription; returns event

    *   `cancelEvent (organizer: User, event: Event)`
        *   **requires**: organizer = event.organizer and event.status = "upcoming"
        *   **effects**: event.status := "cancelled"

    *   `unCancelEvent (organizer: User, event: Event): (event: Event)`
        *   **requires**: organizer = event.organizer and event.status = "cancelled" and event.date + event.duration (in minutes) >= current\_time
        *   **effects**: event.status := "upcoming"; returns event

    *   `deleteEvent (organizer: User, event: Event)`
        *   **requires**: organizer = event.organizer
        *   **effects**: removes event from the set of all existing events

    *   **system** `completeEvent (event: Event)`
        *   **requires**: event.status = "upcoming" and (event.date + event.duration (in minutes) <= current\_time)
        *   **effects**: event.status := "completed"

*   **queries**:
    *   `_getEvent (event: Event) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)`
        *   **requires**: The event must exist.
        *   **effects**: Returns the full details of the specified event.

    *   `_getEventsByOrganizer (organizer: User) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})`
        *   **requires**: The organizer must exist.
        *   **effects**: Returns all events organized by the specified user.

    *   `_getUpcomingEvents () : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})`
        *   **effects**: Returns all upcoming events (status "upcoming" and event end time is in the future).

    *   `_getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)`
        *   **requires**: The `filters` and `priorities` strings, if provided, must be parsable as JSON and their content understood by the concept for filtering/ordering events. The `user` parameter is used for context but the `Event` concept does not store user-specific recommendation data.
        *   **effects**: Returns a set of event details, filtered and potentially ordered, based on the provided contextual criteria. Returns an error if the criteria are malformed or cannot be applied internally.

# file: src/event/EventConcept.ts

```typescript
import { Collection, Db, Filter, Sort } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "Event" + ".";

// Generic type for the concept's external dependency
type User = ID;

// Internal entity type, represented as ID
type EventId = ID; // Renamed to EventId to avoid conflict with the interface name

/**
 * Enumerated type for event status.
 */
type EventStatus = "upcoming" | "cancelled" | "completed";

/**
 * State: A set of Events.
 */
interface EventDoc {
  _id: EventId; // MongoDB document ID
  organizer: User;
  name: string;
  date: Date; // Stored as ISODate in MongoDB
  duration: number; // Duration in minutes
  location: string;
  description: string;
  status: EventStatus;
}

/**
 * Output structure for event queries.
 */
interface EventOutput {
  id: EventId;
  organizer: User;
  name: string;
  date: Date;
  duration: number;
  location: string;
  description: string;
  status: EventStatus;
}

/**
 * @concept Event
 * @purpose enable users to organize, track, and facilitate the discovery of time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen, and supporting its retrieval based on externally provided contextual criteria.
 * @principle A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system. Additionally, the system can surface relevant events by applying externally derived contextual filters and prioritizations to its stored event data, aiding in personalized discovery without the event concept itself managing user preferences or advanced recommendation algorithms.
 */
export default class EventConcept {
  events: Collection<EventDoc>;

  constructor(private readonly db: Db) {
    this.events = this.db.collection(PREFIX + "events");
    // Optionally create indexes for frequently queried fields
    this.events.createIndex({ organizer: 1 });
    this.events.createIndex({ date: 1 });
    this.events.createIndex({ status: 1 });
  }

  /**
   * Helper to convert an EventDoc to EventOutput
   */
  private mapToEventOutput(doc: EventDoc): EventOutput {
    return {
      id: doc._id,
      organizer: doc.organizer,
      name: doc.name,
      date: doc.date,
      duration: doc.duration,
      location: doc.location,
      description: doc.description,
      status: doc.status,
    };
  }

  /**
   * createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)
   *
   * @requires date >= current_time; name != ""; location != ""; description != ""; duration > 0
   * @effects creates an event with the given details associated with the organizer, sets the status to "upcoming"; returns the new event
   */
  async createEvent({ organizer, name, date, duration, location, description }: { organizer: User; name: string; date: Date; duration: number; location: string; description: string }): Promise<{ event: EventId } | { error: string }> {
    const currentTime = new Date();
    if (date < currentTime) {
      return { error: "Event date cannot be in the past." };
    }
    if (!name.trim()) {
      return { error: "Event name cannot be empty." };
    }
    if (!location.trim()) {
      return { error: "Event location cannot be empty." };
    }
    if (!description.trim()) {
      return { error: "Event description cannot be empty." };
    }
    if (duration <= 0) {
      return { error: "Event duration must be greater than 0 minutes." };
    }

    const eventId = freshID() as EventId;
    await this.events.insertOne({ _id: eventId, organizer, name, date, duration, location, description, status: "upcoming" });
    return { event: eventId };
  }

  /**
   * modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)
   *
   * @requires organizer = event.organizer; newName != ""; newLocation != ""; newDescription != ""; newDate >= current_time; newDuration > 0; at least one field must differ from the original event details
   * @effects event.name := newName, event.date := newDate, event.duration := newDuration, event.location := newLocation, event.description := newDescription; returns event
   */
  async modifyEvent({ organizer, event, newName, newDate, newDuration, newLocation, newDescription }: { organizer: User; event: EventId; newName: string; newDate: Date; newDuration: number; newLocation: string; newDescription: string }): Promise<{ event: EventId } | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can modify the event." };
    }
    if (existingEvent.status === "completed") {
      return { error: "Cannot modify a completed event." };
    }

    const currentTime = new Date();
    if (newDate < currentTime) {
      return { error: "New event date cannot be in the past." };
    }
    if (!newName.trim()) {
      return { error: "New event name cannot be empty." };
    }
    if (!newLocation.trim()) {
      return { error: "New event location cannot be empty." };
    }
    if (!newDescription.trim()) {
      return { error: "New event description cannot be empty." };
    }
    if (newDuration <= 0) {
      return { error: "New event duration must be greater than 0 minutes." };
    }

    // Check if any field actually differs
    const hasChanges =
      existingEvent.name !== newName ||
      existingEvent.date.getTime() !== newDate.getTime() ||
      existingEvent.duration !== newDuration ||
      existingEvent.location !== newLocation ||
      existingEvent.description !== newDescription;

    if (!hasChanges) {
      return { error: "No changes detected. At least one field must differ from the original event details." };
    }

    const result = await this.events.updateOne(
      { _id: event },
      { $set: { name: newName, date: newDate, duration: newDuration, location: newLocation, description: newDescription, status: "upcoming" } } // Reset status to upcoming if modified
    );

    if (result.matchedCount === 0) {
      return { error: `Event with ID ${event} could not be updated.` };
    }
    return { event: event };
  }

  /**
   * cancelEvent (organizer: User, event: Event)
   *
   * @requires organizer = event.organizer and event.status = "upcoming"
   * @effects event.status := "cancelled"
   */
  async cancelEvent({ organizer, event }: { organizer: User; event: EventId }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can cancel the event." };
    }
    if (existingEvent.status !== "upcoming") {
      return { error: `Event with ID ${event} is not in "upcoming" status and cannot be cancelled.` };
    }

    await this.events.updateOne({ _id: event }, { $set: { status: "cancelled" } });
    return {};
  }

  /**
   * unCancelEvent (organizer: User, event: Event): (event: Event)
   *
   * @requires organizer = event.organizer and event.status = "cancelled" and event.date + event.duration (in minutes) >= current_time
   * @effects event.status := "upcoming"; returns event
   */
  async unCancelEvent({ organizer, event }: { organizer: User; event: EventId }): Promise<{ event: EventId } | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can uncanceled the event." };
    }
    if (existingEvent.status !== "cancelled") {
      return { error: `Event with ID ${event} is not in "cancelled" status.` };
    }

    const eventEndTime = new Date(existingEvent.date.getTime() + existingEvent.duration * 60 * 1000);
    const currentTime = new Date();
    if (eventEndTime < currentTime) {
      return { error: `Event with ID ${event} has already ended and cannot be uncanceled.` };
    }

    await this.events.updateOne({ _id: event }, { $set: { status: "upcoming" } });
    return { event: event };
  }

  /**
   * deleteEvent (organizer: User, event: Event)
   *
   * @requires organizer = event.organizer
   * @effects removes event from the set of all existing events
   */
  async deleteEvent({ organizer, event }: { organizer: User; event: EventId }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can delete the event." };
    }

    await this.events.deleteOne({ _id: event });
    return {};
  }

  /**
   * system completeEvent (event: Event)
   *
   * @requires event.status = "upcoming" and (event.date + event.duration (in minutes) <= current_time)
   * @effects event.status := "completed"
   */
  async completeEvent({ event }: { event: EventId }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.status !== "upcoming") {
      return { error: `Event with ID ${event} is not in "upcoming" status.` };
    }

    const eventEndTime = new Date(existingEvent.date.getTime() + existingEvent.duration * 60 * 1000);
    const currentTime = new Date();
    if (eventEndTime > currentTime) {
      return { error: `Event with ID ${event} has not yet ended.` };
    }

    await this.events.updateOne({ _id: event }, { $set: { status: "completed" } });
    return {};
  }

  /**
   * _getEvent (event: Event) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)
   *
   * @requires The event must exist.
   * @effects Returns the full details of the specified event.
   */
  async _getEvent({ event }: { event: EventId }): Promise<EventOutput[] | { error: string }> {
    const eventDoc = await this.events.findOne({ _id: event });
    if (!eventDoc) {
      return { error: `Event with ID ${event} not found.` };
    }
    return [this.mapToEventOutput(eventDoc)];
  }

  /**
   * _getEventsByOrganizer (organizer: User) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})
   *
   * @requires The organizer must exist.
   * @effects Returns all events organized by the specified user.
   */
  async _getEventsByOrganizer({ organizer }: { organizer: User }): Promise<EventOutput[]> {
    const events = await this.events.find({ organizer }).toArray();
    return events.map(this.mapToEventOutput);
  }

  /**
   * _getUpcomingEvents () : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})
   *
   * @effects Returns all upcoming events (status "upcoming" and event end time is in the future).
   */
  async _getUpcomingEvents(): Promise<EventOutput[]> {
    const currentTime = new Date();
    // Find events that are 'upcoming' AND their start date is in the future
    const events = await this.events.find({
      status: "upcoming",
      date: { $gt: currentTime } 
    }).toArray();
    
    // More precise filtering in memory to ensure event is truly upcoming
    // The previous $gt: currentTime on 'date' is a good initial filter,
    // but the actual "end time in the future" check is done here.
    return events
        .filter(event => (new Date(event.date.getTime() + event.duration * 60 * 1000)) > currentTime)
        .map(this.mapToEventOutput);
  }

  /**
   * _getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)
   *
   * @requires The `filters` and `priorities` strings, if provided, must be parsable as JSON and their content understood by the concept for filtering/ordering events. The `user` parameter is used for context but the `Event` concept does not store user-specific recommendation data.
   * @effects Returns a set of event details, filtered and potentially ordered, based on the provided contextual criteria. Returns an error if the criteria are malformed or cannot be applied internally.
   */
  async _getEventsByRecommendationContext({ user, filters, priorities }: { user: User; filters: string; priorities: string }): Promise<EventOutput[] | { error: string }> {
    // The 'user' parameter is explicitly received for context but not used internally for data access
    // or to fetch user-specific state, maintaining the concept's independence.
    // All "user-specific augmentation" of recommendations must be encoded into 'filters' and 'priorities'.

    let filterQuery: Filter<EventDoc> = {};
    let sortOptions: Sort = { date: 1 }; // Default sort by date ascending
    let boostEventIds: EventId[] = [];
    const currentTime = new Date();

    try {
      if (filters) {
        const parsedFilters = JSON.parse(filters);
        
        // Always include upcoming events that haven't ended yet
        filterQuery.status = "upcoming";
        filterQuery.date = { ...filterQuery.date, $gt: currentTime }; // Events starting in the future
        
        if (parsedFilters.categoryKeywords && Array.isArray(parsedFilters.categoryKeywords) && parsedFilters.categoryKeywords.length > 0) {
          const keywordRegex = new RegExp(parsedFilters.categoryKeywords.join('|'), 'i');
          filterQuery.$or = [
            { name: { $regex: keywordRegex } },
            { description: { $regex: keywordRegex } }
          ];
        }
        if (parsedFilters.locationKeywords && Array.isArray(parsedFilters.locationKeywords) && parsedFilters.locationKeywords.length > 0) {
            const locationRegex = new RegExp(parsedFilters.locationKeywords.join('|'), 'i');
            filterQuery.location = { $regex: locationRegex };
        }
        if (parsedFilters.dateMin) {
          filterQuery.date = { ...filterQuery.date, $gte: new Date(parsedFilters.dateMin) };
        }
        if (parsedFilters.dateMax) {
          filterQuery.date = { ...filterQuery.date, $lte: new Date(parsedFilters.dateMax) };
        }
      } else {
        // If no filters provided, default to all upcoming events that haven't ended
        filterQuery.status = "upcoming";
        filterQuery.date = { $gt: currentTime };
      }

      if (priorities) {
        const parsedPriorities = JSON.parse(priorities);
        if (parsedPriorities.boostEventIds && Array.isArray(parsedPriorities.boostEventIds)) {
          boostEventIds = parsedPriorities.boostEventIds as EventId[];
        }
        if (parsedPriorities.sortBy === "dateDesc") {
          sortOptions = { date: -1 };
        } else if (parsedPriorities.sortBy === "nameAsc") {
          sortOptions = { name: 1 };
        } else if (parsedPriorities.sortBy === "nameDesc") {
          sortOptions = { name: -1 };
        }
        // Add more sorting options as needed based on event properties
      }
    } catch (e) {
      return { error: `Failed to parse filters or priorities: ${e.message}` };
    }

    // Initial query for events based on filters and default sorting
    let filteredEvents = await this.events.find(filterQuery).sort(sortOptions).toArray();

    // In-memory filter to ensure events haven't actually ended yet,
    // as $gt on `date` only checks start time, not end time + duration.
    filteredEvents = filteredEvents.filter(event => 
      (new Date(event.date.getTime() + event.duration * 60 * 1000)) > currentTime
    );

    // Apply boosting logic if boostEventIds are provided
    if (boostEventIds.length > 0) {
      const boostedMap = new Map<EventId, EventDoc>();
      const nonBoostedEvents: EventDoc[] = [];

      for (const event of filteredEvents) {
        if (boostEventIds.includes(event._id)) {
          boostedMap.set(event._id, event);
        } else {
          nonBoostedEvents.push(event);
        }
      }

      // Reconstruct the list: boosted events first, in the order specified by boostEventIds, then non-boosted events
      const orderedBoostedEvents = boostEventIds
        .map(id => boostedMap.get(id))
        .filter((event): event is EventDoc => event !== undefined); // Filter out undefined if an ID was boosted but not found in filteredEvents

      filteredEvents = [...orderedBoostedEvents, ...nonBoostedEvents];
    }
    
    return filteredEvents.map(this.mapToEventOutput);
  }
}
```
# response:

You're absolutely right to focus on maintaining concept independence and separation of concerns, especially when integrating advanced functionalities like recommendations. The revised `Event` concept specification and its implementation below follow the suggestions: the `Event` concept provides the raw event data and can filter/sort it based on *abstract, externally provided criteria* (JSON strings for filters and priorities), leaving the complex user-interest-to-criteria translation and LLM interaction to other concepts or orchestration logic.

Here are the updated concept specification and its TypeScript implementation for the `Event` concept, including the `_getEventsByRecommendationContext` query. I've also refined the other existing concept implementations (LikertSurvey, Reviewing, Friending, UserAuthentication) to ensure they adhere to the requirements.

---

# concept: LikertSurvey

*   **concept**: LikertSurvey \[Author, Respondent]
*   **purpose**: To measure attitudes or opinions by asking respondents to rate their level of agreement with a series of statements on a predefined scale.
*   **principle**: If an author creates a survey with several questions on a 1-5 scale, and a respondent submits their answers to those questions, then the author can view the collected responses to analyze the respondent's opinions.
*   **state**:
    *   A set of `Surveys` with
        *   an `author` of type `Author`
        *   a `title` of type `String`
        *   a `scaleMin` of type `Number`
        *   a `scaleMax` of type `Number`
    *   A set of `Questions` with
        *   a `survey` of type `Survey`
        *   a `text` of type `String`
    *   A set of `Responses` with
        *   a `respondent` of type `Respondent`
        *   a `question` of type `Question`
        *   a `value` of type `Number`
*   **actions**:
    *   `createSurvey (author: Author, title: String, scaleMin: Number, scaleMax: Number): (survey: Survey)`
        *   **requires**: `scaleMin < scaleMax`
        *   **effects**: Creates a new survey with the given author, title, and scale.
    *   `addQuestion (survey: Survey, text: String): (question: Question)`
        *   **requires**: The survey must exist.
        *   **effects**: Adds a new question to the specified survey.
    *   `submitResponse (respondent: Respondent, question: Question, value: Number)`
        *   **requires**: The question must exist. The respondent must not have already submitted a response for this question. The value must be within the survey's scale.
        *   **effects**: Records the respondent's answer for the given question.
    *   `updateResponse (respondent: Respondent, question: Question, value: Number)`
        *   **requires**: The question must exist. The respondent must have already submitted a response for this question. The value must be within the survey's scale.
        *   **effects**: Updates the respondent's existing answer for the given question.
*   **queries**:
    *   `_getSurveyQuestions (survey: Survey) : (question: {id: Question, survey: Survey, text: String})`
        *   **requires**: The survey must exist.
        *   **effects**: Returns all questions associated with the specified survey.
    *   `_getSurveyResponses (survey: Survey) : (response: {id: Response, respondent: Respondent, question: Question, value: Number})`
        *   **requires**: The survey must exist.
        *   **effects**: Returns all responses for the questions within the specified survey.
    *   `_getRespondentAnswers (respondent: Respondent) : (response: {id: Response, respondent: Respondent, question: Question, value: Number})`
        *   **requires**: The respondent must exist.
        *   **effects**: Returns all answers submitted by the specified respondent.

# file: src/likertsurvey/LikertSurveyConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "LikertSurvey" + ".";

// Generic types for the concept's external dependencies
type Author = ID;
type Respondent = ID;

// Internal entity types, represented as IDs
type Survey = ID;
type Question = ID;
type Response = ID;

/**
 * State: A set of Surveys with an author, title, and scale.
 */
interface SurveyDoc {
  _id: Survey; // MongoDB document ID
  author: Author;
  title: string;
  scaleMin: number;
  scaleMax: number;
}

/**
 * State: A set of Questions, each linked to a survey and containing text.
 */
interface QuestionDoc {
  _id: Question; // MongoDB document ID
  survey: Survey;
  text: string;
}

/**
 * State: A set of Responses, linking a respondent, a question, and their chosen value.
 */
interface ResponseDoc {
  _id: Response; // MongoDB document ID
  respondent: Respondent;
  question: Question;
  value: number;
}

/**
 * @concept LikertSurvey
 * @purpose To measure attitudes or opinions by asking respondents to rate their level of agreement with a series of statements on a predefined scale.
 * @principle If an author creates a survey with several questions on a 1-5 scale, and a respondent submits their answers to those questions, then the author can view the collected responses to analyze the respondent's opinions.
 */
export default class LikertSurveyConcept {
  surveys: Collection<SurveyDoc>;
  questions: Collection<QuestionDoc>;
  responses: Collection<ResponseDoc>;

  constructor(private readonly db: Db) {
    this.surveys = this.db.collection(PREFIX + "surveys");
    this.questions = this.db.collection(PREFIX + "questions");
    this.responses = this.db.collection(PREFIX + "responses");
  }

  /**
   * createSurvey (author: Author, title: String, scaleMin: Number, scaleMax: Number): (survey: Survey)
   *
   * @requires scaleMin must be less than scaleMax.
   * @effects A new survey is created and its ID is returned.
   */
  async createSurvey({ author, title, scaleMin, scaleMax }: { author: Author; title: string; scaleMin: number; scaleMax: number }): Promise<{ survey: Survey } | { error: string }> {
    if (scaleMin >= scaleMax) {
      return { error: "scaleMin must be less than scaleMax" };
    }

    const surveyId = freshID() as Survey;
    await this.surveys.insertOne({ _id: surveyId, author, title, scaleMin, scaleMax });
    return { survey: surveyId };
  }

  /**
   * addQuestion (survey: Survey, text: String): (question: Question)
   *
   * @requires The survey must exist.
   * @effects A new question is created and its ID is returned.
   */
  async addQuestion({ survey, text }: { survey: Survey; text: string }): Promise<{ question: Question } | { error: string }> {
    const existingSurvey = await this.surveys.findOne({ _id: survey });
    if (!existingSurvey) {
      return { error: `Survey with ID ${survey} not found.` };
    }

    const questionId = freshID() as Question;
    await this.questions.insertOne({ _id: questionId, survey, text });
    return { question: questionId };
  }

  /**
   * submitResponse (respondent: Respondent, question: Question, value: Number)
   *
   * @requires The question must exist.
   * @requires The respondent must not have already responded to this question.
   * @requires The response value must be within the survey's defined scale.
   * @effects A new response is recorded in the state.
   */
  async submitResponse({ respondent, question, value }: { respondent: Respondent; question: Question; value: number }): Promise<Empty | { error: string }> {
    const questionDoc = await this.questions.findOne({ _id: question });
    if (!questionDoc) {
      return { error: `Question with ID ${question} not found.` };
    }

    const surveyDoc = await this.surveys.findOne({ _id: questionDoc.survey });
    if (!surveyDoc) {
      // This indicates a data integrity issue but is a good safeguard.
      return { error: "Associated survey for the question not found." };
    }

    if (value < surveyDoc.scaleMin || value > surveyDoc.scaleMax) {
      return { error: `Response value ${value} is outside the survey's scale [${surveyDoc.scaleMin}, ${surveyDoc.scaleMax}].` };
    }

    const existingResponse = await this.responses.findOne({ respondent, question });
    if (existingResponse) {
      return { error: "Respondent has already answered this question. Use updateResponse to change it." };
    }

    const responseId = freshID() as Response;
    await this.responses.insertOne({ _id: responseId, respondent, question, value });

    return {};
  }

  /**
   * updateResponse (respondent: Respondent, question: Question, value: Number)
   *
   * @requires The question must exist.
   * @requires A response from the given respondent to the question must already exist.
   * @requires The new response value must be within the survey's defined scale.
   * @effects The existing response's value is updated.
   */
  async updateResponse({ respondent, question, value }: { respondent: Respondent; question: Question; value: number }): Promise<Empty | { error: string }> {
    const questionDoc = await this.questions.findOne({ _id: question });
    if (!questionDoc) {
      return { error: `Question with ID ${question} not found.` };
    }

    const surveyDoc = await this.surveys.findOne({ _id: questionDoc.survey });
    if (!surveyDoc) {
      return { error: "Associated survey for the question not found." };
    }

    if (value < surveyDoc.scaleMin || value > surveyDoc.scaleMax) {
      return { error: `Response value ${value} is outside the survey's scale [${surveyDoc.scaleMin}, ${surveyDoc.scaleMax}].` };
    }

    const result = await this.responses.updateOne({ respondent, question }, { $set: { value } });

    if (result.matchedCount === 0) {
      return { error: "No existing response found to update. Use submitResponse to create one." };
    }

    return {};
  }

  /**
   * _getSurveyQuestions (survey: Survey) : (question: {id: Question, survey: Survey, text: String})
   *
   * @requires The survey must exist.
   * @effects Returns all questions associated with the specified survey.
   */
  async _getSurveyQuestions({ survey }: { survey: Survey }): Promise<{ id: Question; survey: Survey; text: string }[]> {
    const questions = await this.questions.find({ survey }).toArray();
    return questions.map(q => ({ id: q._id, survey: q.survey, text: q.text }));
  }

  /**
   * _getSurveyResponses (survey: Survey) : (response: {id: Response, respondent: Respondent, question: Question, value: Number})
   *
   * @requires The survey must exist.
   * @effects Returns all responses for the questions within the specified survey.
   */
  async _getSurveyResponses({ survey }: { survey: Survey }): Promise<{ id: Response; respondent: Respondent; question: Question; value: number }[]> {
    const surveyQuestions = await this.questions.find({ survey }).project({ _id: 1 }).toArray();
    const questionIds = surveyQuestions.map((q) => q._id as Question);
    const responses = await this.responses.find({ question: { $in: questionIds } }).toArray();
    return responses.map(r => ({ id: r._id, respondent: r.respondent, question: r.question, value: r.value }));
  }

  /**
   * _getRespondentAnswers (respondent: Respondent) : (response: {id: Response, respondent: Respondent, question: Question, value: Number})
   *
   * @requires The respondent must exist.
   * @effects Returns all answers submitted by the specified respondent.
   */
  async _getRespondentAnswers({ respondent }: { respondent: Respondent }): Promise<{ id: Response; respondent: Respondent; question: Question; value: number }[]> {
    const responses = await this.responses.find({ respondent }).toArray();
    return responses.map(r => ({ id: r._id, respondent: r.respondent, question: r.question, value: r.value }));
  }
}
```

---

# concept: Reviewing \[User, Item]

*   **concept**: Reviewing \[User, Item]

*   **purpose**: enable users to provide qualitative and quantitative feedback on items

*   **principle**: a user creates a review for an item containing a written entry and numerical rating; modify the entry and rating for this review if needed; the user can also delete their review

*   **state**:
    *   a set of Reviews with
        *   a reviewer User
        *   a target Item
        *   a rating Number
        *   an entry String

*   **actions**:
    *   `addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)`
        *   **requires**: no review by user for this item exists, rating is a value between 0 and 10
        *   **effects**: create a review by the user for this item with the given rating and text entry, return the created review

    *   `removeReview (user: User, item: Item)`
        *   **requires**: a review by the user for this item exists
        *   **effects**: deletes the review that is associated with the given user and item

    *   `modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)`
        *   **requires**: a review by the user for this item exists, rating is a value between 0 and 10
        *   **effects**: modifies the review with the given fields for the rating and entry, returns the modified review

*   **queries**:
    *   `_getReview (user: User, item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})`
        *   **requires**: a review exists for the given user and item
        *   **effects**: returns the review associated with the given user and item

    *   `_getReviewsByItem (item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})`
        *   **effects**: returns all reviews targeting the given item

    *   `_getReviewsByUser (user: User) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})`
        *   **effects**: returns all reviews authored by the given user

# file: src/reviewing/ReviewingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "Reviewing" + ".";

// Generic types for the concept's external dependencies
type User = ID;
type Item = ID;

// Internal entity type, represented as ID
type Review = ID;

/**
 * State: A set of Reviews.
 * Each review links a reviewer (User), a target item (Item), a numerical rating, and a text entry.
 */
interface ReviewDoc {
  _id: Review; // MongoDB document ID
  reviewer: User;
  target: Item;
  rating: number;
  entry: string;
}

/**
 * @concept Reviewing
 * @purpose enable users to provide qualitative and quantitative feedback on items
 * @principle a user creates a review for an item containing a written entry and numerical rating; modify the entry and rating for this review if needed; the user can also delete their review
 */
export default class ReviewingConcept {
  reviews: Collection<ReviewDoc>;

  constructor(private readonly db: Db) {
    this.reviews = this.db.collection(PREFIX + "reviews");
  }

  /**
   * addReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
   *
   * @requires no review by user for this item exists, rating is a value between 0 and 10
   * @effects create a review by the user for this item with the given rating and text entry, return the created review
   */
  async addReview({ user, item, rating, entry }: { user: User; item: Item; rating: number; entry: string }): Promise<{ review: Review } | { error: string }> {
    if (rating < 0 || rating > 10) {
      return { error: "Rating must be between 0 and 10." };
    }

    const existingReview = await this.reviews.findOne({ reviewer: user, target: item });
    if (existingReview) {
      return { error: `User ${user} has already reviewed item ${item}.` };
    }

    const reviewId = freshID() as Review;
    await this.reviews.insertOne({ _id: reviewId, reviewer: user, target: item, rating, entry });
    return { review: reviewId };
  }

  /**
   * removeReview (user: User, item: Item)
   *
   * @requires a review by the user for this item exists
   * @effects deletes the review that is associated with the given user and item
   */
  async removeReview({ user, item }: { user: User; item: Item }): Promise<Empty | { error: string }> {
    const result = await this.reviews.deleteOne({ reviewer: user, target: item });
    if (result.deletedCount === 0) {
      return { error: `No review found by user ${user} for item ${item}.` };
    }
    return {};
  }

  /**
   * modifyReview (user: User, item: Item, rating: Number, entry: String): (review: Review)
   *
   * @requires a review by the user for this item exists, rating is a value between 0 and 10
   * @effects modifies the review with the given fields for the rating and entry, returns the modified review
   */
  async modifyReview({ user, item, rating, entry }: { user: User; item: Item; rating: number; entry: string }): Promise<{ review: Review } | { error: string }> {
    if (rating < 0 || rating > 10) {
      return { error: "Rating must be between 0 and 10." };
    }

    const updatedReview = await this.reviews.findOneAndUpdate(
      { reviewer: user, target: item },
      { $set: { rating, entry } },
      { returnDocument: "after" }
    );

    if (!updatedReview.value) {
      return { error: `No review found by user ${user} for item ${item} to modify.` };
    }
    return { review: updatedReview.value._id };
  }

  /**
   * _getReview (user: User, item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @requires a review exists for the given user and item
   * @effects returns the review associated with the given user and item
   */
  async _getReview({ user, item }: { user: User; item: Item }): Promise<Array<{ id: Review; reviewer: User; target: Item; rating: number; entry: string }> | { error: string }> {
    const review = await this.reviews.findOne({ reviewer: user, target: item });
    if (!review) {
      return { error: `No review found by user ${user} for item ${item}.` };
    }
    return [{ id: review._id, reviewer: review.reviewer, target: review.target, rating: review.rating, entry: review.entry }];
  }

  /**
   * _getReviewsByItem (item: Item) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @effects returns all reviews targeting the given item
   */
  async _getReviewsByItem({ item }: { item: Item }): Promise<Array<{ id: Review; reviewer: User; target: Item; rating: number; entry: string }>> {
    const reviews = await this.reviews.find({ target: item }).toArray();
    return reviews.map(r => ({ id: r._id, reviewer: r.reviewer, target: r.target, rating: r.rating, entry: r.entry }));
  }

  /**
   * _getReviewsByUser (user: User) : (review: {id: Review, reviewer: User, target: Item, rating: Number, entry: String})
   *
   * @effects returns all reviews authored by the given user
   */
  async _getReviewsByUser({ user }: { user: User }): Promise<Array<{ id: Review; reviewer: User; target: Item; rating: number; entry: string }>> {
    const reviews = await this.reviews.find({ reviewer: user }).toArray();
    return reviews.map(r => ({ id: r._id, reviewer: r.reviewer, target: r.target, rating: r.rating, entry: r.entry }));
  }
}
```

---

# concept: Friending \[User]

*   **concept**: Friending \[User]

*   **purpose**: enable users to establish and manage mutual social connections

*   **principle**: a user can send a friend request to another user; they may choose to remove this request before the target user takes action; the recipient of a friend request can choose to accept or remove it; once a request is accepted, two users become friends; friendship may be revoked.

*   **state**:
    *   a set of Users with
        *   a set of friends Users
        *   a set of incomingRequests Users
        *   a set of outgoingRequests Users

*   **actions**:
    *   `sendFriendRequest (user: User, target: User)`
        *   **requires**: user and target are not existing friends, user has not already sent a request to target, user and target are not the same
        *   **effects**: target is added to the set of the user's outgoing requests; user is added to the set of target's incoming requests

    *   `acceptFriendRequest (requester: User, target: User)`
        *   **requires**: requester has sent a friend request to target, requester and target are not friends, requester and target are not the same
        *   **effects**: requester and target are added to each other's set of friends, they are both removed from the other's set of incoming/outgoingRequests

    *   `removeFriendRequest (requester: User, target: User)`
        *   **requires**: requester has sent a friend request to target, requester and target are not friends, requester and target are not the same
        *   **effects**: requester is removed from the target's set of incomingRequests, target is removed the requester's set of outgoingRequests

    *   `removeFriend (user: User, friend: User): ()`
        *   **requires**: user and friend are friends with each other, user and friend are not the same
        *   **effects**: user and friends are both removed from each other's set of friends

*   **queries**:
    *   `_getFriends (user: User) : (friend: User)`
        *   **requires**: user exists
        *   **effects**: returns all friends of the given user

    *   `_getIncomingRequests (user: User) : (requester: User)`
        *   **requires**: user exists
        *   **effects**: returns all users who sent a friend request to the given user

    *   `_getOutgoingRequests (user: User) : (target: User)`
        *   **requires**: user exists
        *   **effects**: returns all users to whom the given user sent a friend request

    *   `_areFriends (user1: User, user2: User) : (isFriend: Flag)`
        *   **requires**: user1 and user2 exist
        *   **effects**: returns true if user1 and user2 are friends, false otherwise

# file: src/friending/FriendingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
// Note: freshID is not directly used here as User IDs are external, but imported for completeness if internal entities were added.

// Collection prefix to ensure namespace separation
const PREFIX = "Friending" + ".";

// Generic type for the concept's external dependency
type User = ID;

/**
 * State: A set of Users with relations for friends, incoming requests, and outgoing requests.
 */
interface UserRelationsDoc {
  _id: User; // MongoDB document ID for the user
  friends: User[];
  incomingRequests: User[];
  outgoingRequests: User[];
}

/**
 * @concept Friending
 * @purpose enable users to establish and manage mutual social connections
 * @principle a user can send a friend request to another user; they may choose to remove this request before the target user takes action; the recipient of a friend request can choose to accept or remove it; once a request is accepted, two users become friends; friendship may be revoked.
 */
export default class FriendingConcept {
  userRelations: Collection<UserRelationsDoc>;

  constructor(private readonly db: Db) {
    this.userRelations = this.db.collection(PREFIX + "userRelations");
  }

  // Helper to ensure a user's document exists, initializing if not
  private async ensureUserExists(userId: User): Promise<Empty | { error: string }> {
    const userDoc = await this.userRelations.findOne({ _id: userId });
    if (!userDoc) {
      await this.userRelations.insertOne({ _id: userId, friends: [], incomingRequests: [], outgoingRequests: [] });
    }
    return {};
  }

  /**
   * sendFriendRequest (user: User, target: User)
   *
   * @requires user and target are not existing friends, user has not already sent a request to target, user and target are not the same
   * @effects target is added to the set of the user's outgoing requests; user is added to the set of target's incoming requests
   */
  async sendFriendRequest({ user, target }: { user: User; target: User }): Promise<Empty | { error: string }> {
    if (user === target) {
      return { error: "User cannot send a friend request to themselves." };
    }

    await this.ensureUserExists(user);
    await this.ensureUserExists(target);

    const userDoc = await this.userRelations.findOne({ _id: user });
    const targetDoc = await this.userRelations.findOne({ _id: target });

    if (userDoc?.friends.includes(target) || targetDoc?.friends.includes(user)) {
      return { error: `User ${user} and ${target} are already friends.` };
    }
    if (userDoc?.outgoingRequests.includes(target)) {
      return { error: `User ${user} has already sent a friend request to ${target}.` };
    }
    if (targetDoc?.outgoingRequests.includes(user)) { // If target sent a request to user, they should accept instead
      return { error: `User ${target} has already sent a friend request to ${user}. Accept it instead.` };
    }

    await this.userRelations.updateOne({ _id: user }, { $addToSet: { outgoingRequests: target } });
    await this.userRelations.updateOne({ _id: target }, { $addToSet: { incomingRequests: user } });

    return {};
  }

  /**
   * acceptFriendRequest (requester: User, target: User)
   *
   * @requires requester has sent a friend request to target, requester and target are not friends, requester and target are not the same
   * @effects requester and target are added to each other's set of friends, they are both removed from the other's set of incoming/outgoingRequests
   */
  async acceptFriendRequest({ requester, target }: { requester: User; target: User }): Promise<Empty | { error: string }> {
    if (requester === target) {
      return { error: "Cannot accept a request from oneself." };
    }

    await this.ensureUserExists(requester);
    await this.ensureUserExists(target);

    const targetDoc = await this.userRelations.findOne({ _id: target });
    const requesterDoc = await this.userRelations.findOne({ _id: requester });

    if (!targetDoc?.incomingRequests.includes(requester)) {
      return { error: `User ${requester} has not sent a friend request to ${target}.` };
    }
    if (targetDoc?.friends.includes(requester) || requesterDoc?.friends.includes(target)) {
      return { error: `User ${requester} and ${target} are already friends.` };
    }

    // Add to friends
    await this.userRelations.updateOne({ _id: target }, { $addToSet: { friends: requester }, $pull: { incomingRequests: requester } });
    await this.userRelations.updateOne({ _id: requester }, { $addToSet: { friends: target }, $pull: { outgoingRequests: target } });

    return {};
  }

  /**
   * removeFriendRequest (requester: User, target: User)
   *
   * @requires requester has sent a friend request to target, requester and target are not friends, requester and target are not the same
   * @effects requester is removed from the target's set of incomingRequests, target is removed the requester's set of outgoingRequests
   */
  async removeFriendRequest({ requester, target }: { requester: User; target: User }): Promise<Empty | { error: string }> {
    if (requester === target) {
      return { error: "Cannot remove a request to/from oneself." };
    }

    await this.ensureUserExists(requester);
    await this.ensureUserExists(target);

    const targetDoc = await this.userRelations.findOne({ _id: target });
    const requesterDoc = await this.userRelations.findOne({ _id: requester });

    if (!requesterDoc?.outgoingRequests.includes(target) && !targetDoc?.incomingRequests.includes(requester)) {
        return { error: `No pending friend request found from ${requester} to ${target}.` };
    }
    if (requesterDoc?.friends.includes(target) || targetDoc?.friends.includes(requester)) {
        return { error: `User ${requester} and ${target} are already friends. Use removeFriend instead.` };
    }

    await this.userRelations.updateOne({ _id: target }, { $pull: { incomingRequests: requester } });
    await this.userRelations.updateOne({ _id: requester }, { $pull: { outgoingRequests: target } });

    return {};
  }

  /**
   * removeFriend (user: User, friend: User): ()
   *
   * @requires user and friend are friends with each other, user and friend are not the same
   * @effects user and friends are both removed from each other's set of friends
   */
  async removeFriend({ user, friend }: { user: User; friend: User }): Promise<Empty | { error: string }> {
    if (user === friend) {
      return { error: "Cannot unfriend oneself." };
    }

    const userDoc = await this.userRelations.findOne({ _id: user });
    const friendDoc = await this.userRelations.findOne({ _id: friend });

    if (!userDoc?.friends.includes(friend) || !friendDoc?.friends.includes(user)) {
      return { error: `User ${user} and ${friend} are not friends.` };
    }

    await this.userRelations.updateOne({ _id: user }, { $pull: { friends: friend } });
    await this.userRelations.updateOne({ _id: friend }, { $pull: { friends: user } });

    return {};
  }

  /**
   * _getFriends (user: User) : (friend: User)
   *
   * @requires user exists
   * @effects returns all friends of the given user
   */
  async _getFriends({ user }: { user: User }): Promise<{ friend: User }[]> {
    const userDoc = await this.userRelations.findOne({ _id: user });
    if (!userDoc) {
        return []; // User not found, no friends
    }
    return userDoc.friends.map(friendId => ({ friend: friendId }));
  }

  /**
   * _getIncomingRequests (user: User) : (requester: User)
   *
   * @requires user exists
   * @effects returns all users who sent a friend request to the given user
   */
  async _getIncomingRequests({ user }: { user: User }): Promise<{ requester: User }[]> {
    const userDoc = await this.userRelations.findOne({ _id: user });
    if (!userDoc) {
        return []; // User not found, no incoming requests
    }
    return userDoc.incomingRequests.map(requesterId => ({ requester: requesterId }));
  }

  /**
   * _getOutgoingRequests (user: User) : (target: User)
   *
   * @requires user exists
   * @effects returns all users to whom the given user sent a friend request
   */
  async _getOutgoingRequests({ user }: { user: User }): Promise<{ target: User }[]> {
    const userDoc = await this.userRelations.findOne({ _id: user });
    if (!userDoc) {
        return []; // User not found, no outgoing requests
    }
    return userDoc.outgoingRequests.map(targetId => ({ target: targetId }));
  }

  /**
   * _areFriends (user1: User, user2: User) : (isFriend: Flag)
   *
   * @requires user1 and user2 exist
   * @effects returns true if user1 and user2 are friends, false otherwise
   */
  async _areFriends({ user1, user2 }: { user1: User; user2: User }): Promise<{ isFriend: boolean }> {
    if (user1 === user2) {
      return { isFriend: false }; // A user is not friends with themselves in this context
    }
    const user1Doc = await this.userRelations.findOne({ _id: user1 });
    const user2Doc = await this.userRelations.findOne({ _id: user2 });

    if (!user1Doc || !user2Doc) {
        // If either user doesn't exist, they can't be friends.
        return { isFriend: false };
    }

    const areIndeedFriends = user1Doc.friends.includes(user2) && user2Doc.friends.includes(user1);
    return { isFriend: areIndeedFriends };
  }
}
```

---

# concept: UserAuthentication \[User]

**concept**: UserAuthentication \[User]

**purpose**: enable users to register and verify their identity using a username and password.

**principle**: If a user registers with a unique username and password, they can then authenticate using those same credentials to be identified as the registered user.

**state**:

```
a set of Users with
  a username String
  a password String
```

**actions**:

```
register (username: String, password: String): (user: User)

  requires: the username must not already exist in the system

  effects: create a new User with this username and password, returns the user

authenticate (username: String, password: String): (user: User)

  requires: there exists a user with the given username and password

  effects: returns the registered user that matches with the given username and password
```

**queries**:

```
_getUsername (user: User) : (username: String)
  requires: user exists
  effects: returns the username associated with the user

_getUserByUsername (username: String) : (user: User) | (error: String)
  requires: a user with the given username exists
  effects: if a user with the given username exists, returns that user; otherwise returns an error
```

# file: src/userauthentication/UserAuthenticationConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import { createHash } from "node:crypto"; // For password hashing

// Collection prefix to ensure namespace separation
const PREFIX = "UserAuthentication" + ".";

// Generic type for the concept's external dependency
type User = ID;

/**
 * State: A set of Users with a username and a hashed password.
 */
interface UserAccountDoc {
  _id: User; // MongoDB document ID for the user
  username: string;
  passwordHash: string; // Storing hashed password for security
}

/**
 * @concept UserAuthentication
 * @purpose enable users to register and verify their identity using a username and password.
 * @principle If a user registers with a unique username and password, they can then authenticate using those same credentials to be identified as the registered user.
 */
export default class UserAuthenticationConcept {
  userAccounts: Collection<UserAccountDoc>;

  constructor(private readonly db: Db) {
    this.userAccounts = this.db.collection(PREFIX + "userAccounts");
    // Ensure username is unique for efficient lookup
    this.userAccounts.createIndex({ username: 1 }, { unique: true });
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  /**
   * register (username: String, password: String): (user: User)
   *
   * @requires the username must not already exist in the system
   * @effects create a new User with this username and password, returns the user
   */
  async register({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const existingUser = await this.userAccounts.findOne({ username });
    if (existingUser) {
      return { error: `Username "${username}" already exists.` };
    }

    const userId = freshID() as User;
    const passwordHash = this.hashPassword(password);
    await this.userAccounts.insertOne({ _id: userId, username, passwordHash });

    return { user: userId };
  }

  /**
   * authenticate (username: String, password: String): (user: User)
   *
   * @requires there exists a user with the given username and password
   * @effects returns the registered user that matches with the given username and password
   */
  async authenticate({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const passwordHash = this.hashPassword(password);
    const userAccount = await this.userAccounts.findOne({ username, passwordHash });

    if (!userAccount) {
      return { error: "Invalid username or password." };
    }

    return { user: userAccount._id };
  }

  /**
   * _getUsername (user: User) : (username: String)
   *
   * @requires user exists
   * @effects returns the username associated with the user
   */
  async _getUsername({ user }: { user: User }): Promise<Array<{ username: string }> | { error: string }> {
    const userAccount = await this.userAccounts.findOne({ _id: user });
    if (!userAccount) {
      return { error: `User with ID ${user} not found.` };
    }
    return [{ username: userAccount.username }];
  }

  /**
   * _getUserByUsername (username: String) : (user: User) | (error: String)
   *
   * @requires a user with the given username exists
   * @effects if a user with the given username exists, returns that user; otherwise returns an error
   */
  async _getUserByUsername({ username }: { username: string }): Promise<Array<{ user: User }> | { error: string }> {
    const userAccount = await this.userAccounts.findOne({ username });
    if (!userAccount) {
      return { error: `User with username "${username}" not found.` };
    }
    return [{ user: userAccount._id }];
  }
}
```

---

# concept: UserInterest \[User, Item]

*   **concept**: UserInterest \[User, Item]

*   **purpose**: enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience and facilitate content discovery.

*   **principle**: a user wants to add their personal interests through a specific tag; they can remove this tag or add more tags whenever; they may also indicate interest in specific items and can similarly remove or add more interests in the future.

*   **state**:
    *   A set of `UserItemInterests` with
        *   a user User
        *   an item Item

    *   A set of `UserPersonalInterests` with
        *   a user User
        *   a tag String

*   **actions**:
    *   `addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)`
        *   **requires**: tag is a non-empty String, there does not already exist a UserPersonalInterest associating the user to the given tag
        *   **effects**: creates a UserPersonalInterest associating the user to the tag, and returns it

    *   `removePersonalInterest (user: User, tag: String)`
        *   **requires**: tag is a non-empty string, there exists a UserPersonalInterest associating the user to the given tag
        *   **effects**: removes the UserPersonalInterest associating the user to the tag

    *   `addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)`
        *   **requires**: there does not already exist a UserItemInterest associating the user to the item
        *   **effects**: creates a UserItemInterest associating the user to the tag, and returns it

    *   `removeItemInterest (user: User, item: Item)`
        *   **requires**: there exists a UserItemInterest associating the user to the given item
        *   **effects**: removes the UserItemInterest associating the user to the item

*   **queries**:
    *   `_getPersonalInterests (user: User) : (tag: String)`
        *   **requires**: user exists
        *   **effects**: returns all personal interest tags associated with the user

    *   `_getItemInterests (user: User) : (item: Item)`
        *   **requires**: user exists
        *   **effects**: returns all items the user has expressed interest in

# file: src/userinterest/UserInterestConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "UserInterest" + ".";

// Generic types for the concept's external dependencies
type User = ID;
type Item = ID;

// Internal entity types, represented as IDs (though not strictly needed as relationships are direct)
type UserPersonalInterest = ID; // Represents the association record
type UserItemInterest = ID; // Represents the association record

/**
 * State: An association of a User with an Item they are interested in.
 */
interface UserItemInterestDoc {
  _id: UserItemInterest; // Unique ID for this specific interest record
  user: User;
  item: Item;
}

/**
 * State: An association of a User with a general tag/topic they are interested in.
 */
interface UserPersonalInterestDoc {
  _id: UserPersonalInterest; // Unique ID for this specific interest record
  user: User;
  tag: string;
}

/**
 * @concept UserInterest
 * @purpose enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience and facilitate content discovery.
 * @principle a user wants to add their personal interests through a specific tag; they can remove this tag or add more tags whenever; they may also indicate interest in specific items and can similarly remove or add more interests in the future.
 */
export default class UserInterestConcept {
  userItemInterests: Collection<UserItemInterestDoc>;
  userPersonalInterests: Collection<UserPersonalInterestDoc>;

  constructor(private readonly db: Db) {
    this.userItemInterests = this.db.collection(PREFIX + "userItemInterests");
    this.userPersonalInterests = this.db.collection(PREFIX + "userPersonalInterests");

    // Ensure uniqueness for interest records to prevent duplicates
    this.userItemInterests.createIndex({ user: 1, item: 1 }, { unique: true });
    this.userPersonalInterests.createIndex({ user: 1, tag: 1 }, { unique: true });
  }

  /**
   * addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)
   *
   * @requires tag is a non-empty String, there does not already exist a UserPersonalInterest associating the user to the given tag
   * @effects creates a UserPersonalInterest associating the user to the tag, and returns it
   */
  async addPersonalInterest({ user, tag }: { user: User; tag: string }): Promise<{ personalInterest: UserPersonalInterest } | { error: string }> {
    if (!tag.trim()) {
      return { error: "Tag cannot be empty." };
    }

    const existingInterest = await this.userPersonalInterests.findOne({ user, tag });
    if (existingInterest) {
      return { error: `User ${user} already has personal interest tag "${tag}".` };
    }

    const interestId = freshID() as UserPersonalInterest;
    await this.userPersonalInterests.insertOne({ _id: interestId, user, tag });
    return { personalInterest: interestId };
  }

  /**
   * removePersonalInterest (user: User, tag: String)
   *
   * @requires tag is a non-empty string, there exists a UserPersonalInterest associating the user to the given tag
   * @effects removes the UserPersonalInterest associating the user to the tag
   */
  async removePersonalInterest({ user, tag }: { user: User; tag: string }): Promise<Empty | { error: string }> {
    if (!tag.trim()) {
      return { error: "Tag cannot be empty." };
    }

    const result = await this.userPersonalInterests.deleteOne({ user, tag });
    if (result.deletedCount === 0) {
      return { error: `No personal interest tag "${tag}" found for user ${user}.` };
    }
    return {};
  }

  /**
   * addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)
   *
   * @requires there does not already exist a UserItemInterest associating the user to the item
   * @effects creates a UserItemInterest associating the user to the tag, and returns it
   */
  async addItemInterest({ user, item }: { user: User; item: Item }): Promise<{ itemInterest: UserItemInterest } | { error: string }> {
    const existingInterest = await this.userItemInterests.findOne({ user, item });
    if (existingInterest) {
      return { error: `User ${user} is already interested in item ${item}.` };
    }

    const interestId = freshID() as UserItemInterest;
    await this.userItemInterests.insertOne({ _id: interestId, user, item });
    return { itemInterest: interestId };
  }

  /**
   * removeItemInterest (user: User, item: Item)
   *
   * @requires there exists a UserItemInterest associating the user to the given item
   * @effects removes the UserItemInterest associating the user to the item
   */
  async removeItemInterest({ user, item }: { user: User; item: Item }): Promise<Empty | { error: string }> {
    const result = await this.userItemInterests.deleteOne({ user, item });
    if (result.deletedCount === 0) {
      return { error: `No item interest in ${item} found for user ${user}.` };
    }
    return {};
  }

  /**
   * _getPersonalInterests (user: User) : (tag: String)
   *
   * @requires user exists
   * @effects returns all personal interest tags associated with the user
   */
  async _getPersonalInterests({ user }: { user: User }): Promise<{ tag: string }[]> {
    const interests = await this.userPersonalInterests.find({ user }).toArray();
    return interests.map(i => ({ tag: i.tag }));
  }

  /**
   * _getItemInterests (user: User) : (item: Item)
   *
   * @requires user exists
   * @effects returns all items the user has expressed interest in
   */
  async _getItemInterests({ user }: { user: User }): Promise<{ item: Item }[]> {
    const interests = await this.userItemInterests.find({ user }).toArray();
    return interests.map(i => ({ item: i.item }));
  }
}
```

---

# concept: Event \[User]

**concept** Event \[User]

*   **purpose**: enable users to organize, track, and facilitate the discovery of time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen, and supporting its retrieval based on externally provided contextual criteria.

*   **principle**: A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system. Additionally, the system can surface relevant events by applying externally derived contextual filters and prioritizations to its stored event data, aiding in personalized discovery without the event concept itself managing user preferences or advanced recommendation algorithms.

*   **state**:
    *   a set of Events with
        *   an organizer User
        *   a name String
        *   a date DateTime
        *   a duration Number // Duration in minutes
        *   a location String
        *   a description String
        *   a status of "upcoming" or "cancelled" or "completed"

*   **actions**:
    *   `createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)`
        *   **requires**: date >= current\_time; name != ""; location != ""; description != ""; duration > 0
        *   **effects**: creates an event with the given details associated with the organizer, sets the status to "upcoming"; returns the new event

    *   `modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)`
        *   **requires**: organizer = event.organizer; newName != ""; newLocation != ""; newDescription != ""; newDate >= current\_time; newDuration > 0; at least one field must differ from the original event details
        *   **effects**: event.name := newName, event.date := newDate, event.duration := newDuration, event.location := newLocation, event.description := newDescription; returns event

    *   `cancelEvent (organizer: User, event: Event)`
        *   **requires**: organizer = event.organizer and event.status = "upcoming"
        *   **effects**: event.status := "cancelled"

    *   `unCancelEvent (organizer: User, event: Event): (event: Event)`
        *   **requires**: organizer = event.organizer and event.status = "cancelled" and event.date + event.duration (in minutes) >= current\_time
        *   **effects**: event.status := "upcoming"; returns event

    *   `deleteEvent (organizer: User, event: Event)`
        *   **requires**: organizer = event.organizer
        *   **effects**: removes event from the set of all existing events

    *   **system** `completeEvent (event: Event)`
        *   **requires**: event.status = "upcoming" and (event.date + event.duration (in minutes) <= current\_time)
        *   **effects**: event.status := "completed"

*   **queries**:
    *   `_getEvent (event: Event) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)`
        *   **requires**: The event must exist.
        *   **effects**: Returns the full details of the specified event.

    *   `_getEventsByOrganizer (organizer: User) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})`
        *   **requires**: The organizer must exist.
        *   **effects**: Returns all events organized by the specified user.

    *   `_getUpcomingEvents () : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})`
        *   **effects**: Returns all upcoming events (status "upcoming" and event end time is in the future).

    *   `_getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)`
        *   **requires**: The `filters` and `priorities` strings, if provided, must be parsable as JSON and their content understood by the concept for filtering/ordering events. The `user` parameter is used for context but the `Event` concept does not store user-specific recommendation data.
        *   **effects**: Returns a set of event details, filtered and potentially ordered, based on the provided contextual criteria. Returns an error if the criteria are malformed or cannot be applied internally.

# file: src/event/EventConcept.ts

```typescript
import { Collection, Db, Filter, Sort } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "Event" + ".";

// Generic type for the concept's external dependency
type User = ID;

// Internal entity type, represented as ID
type EventId = ID; // Renamed to EventId to avoid conflict with the interface name

/**
 * Enumerated type for event status.
 */
type EventStatus = "upcoming" | "cancelled" | "completed";

/**
 * State: A set of Events.
 */
interface EventDoc {
  _id: EventId; // MongoDB document ID
  organizer: User;
  name: string;
  date: Date; // Stored as ISODate in MongoDB
  duration: number; // Duration in minutes
  location: string;
  description: string;
  status: EventStatus;
}

/**
 * Output structure for event queries.
 */
interface EventOutput {
  id: EventId;
  organizer: User;
  name: string;
  date: Date;
  duration: number;
  location: string;
  description: string;
  status: EventStatus;
}

/**
 * @concept Event
 * @purpose enable users to organize, track, and facilitate the discovery of time-bound occurrences, providing clear and up-to-date information about what, when, and where something will happen, and supporting its retrieval based on externally provided contextual criteria.
 * @principle A user can schedule an event by providing essential details such as its name, date, time, location, and description. This information ensures clarity for all involved about the planned occurrence. After the scheduled time, the event naturally transitions to a completed state, automatically reflecting its conclusion. The organizer retains the ability to cancel an event beforehand if plans change, with the flexibility to restore it if circumstances reverse. Organizers may also choose to delete events from the system. Additionally, the system can surface relevant events by applying externally derived contextual filters and prioritizations to its stored event data, aiding in personalized discovery without the event concept itself managing user preferences or advanced recommendation algorithms.
 */
export default class EventConcept {
  events: Collection<EventDoc>;

  constructor(private readonly db: Db) {
    this.events = this.db.collection(PREFIX + "events");
    // Optionally create indexes for frequently queried fields
    this.events.createIndex({ organizer: 1 });
    this.events.createIndex({ date: 1 });
    this.events.createIndex({ status: 1 });
  }

  /**
   * Helper to convert an EventDoc to EventOutput
   */
  private mapToEventOutput(doc: EventDoc): EventOutput {
    return {
      id: doc._id,
      organizer: doc.organizer,
      name: doc.name,
      date: doc.date,
      duration: doc.duration,
      location: doc.location,
      description: doc.description,
      status: doc.status,
    };
  }

  /**
   * createEvent (organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String): (event: Event)
   *
   * @requires date >= current_time; name != ""; location != ""; description != ""; duration > 0
   * @effects creates an event with the given details associated with the organizer, sets the status to "upcoming"; returns the new event
   */
  async createEvent({ organizer, name, date, duration, location, description }: { organizer: User; name: string; date: Date; duration: number; location: string; description: string }): Promise<{ event: EventId } | { error: string }> {
    const currentTime = new Date();
    if (date < currentTime) {
      return { error: "Event date cannot be in the past." };
    }
    if (!name.trim()) {
      return { error: "Event name cannot be empty." };
    }
    if (!location.trim()) {
      return { error: "Event location cannot be empty." };
    }
    if (!description.trim()) {
      return { error: "Event description cannot be empty." };
    }
    if (duration <= 0) {
      return { error: "Event duration must be greater than 0 minutes." };
    }

    const eventId = freshID() as EventId;
    await this.events.insertOne({ _id: eventId, organizer, name, date, duration, location, description, status: "upcoming" });
    return { event: eventId };
  }

  /**
   * modifyEvent (organizer: User, event: Event, newName: String, newDate: DateTime, newDuration: Number, newLocation: String, newDescription: String): (event: Event)
   *
   * @requires organizer = event.organizer; newName != ""; newLocation != ""; newDescription != ""; newDate >= current_time; newDuration > 0; at least one field must differ from the original event details
   * @effects event.name := newName, event.date := newDate, event.duration := newDuration, event.location := newLocation, event.description := newDescription; returns event
   */
  async modifyEvent({ organizer, event, newName, newDate, newDuration, newLocation, newDescription }: { organizer: User; event: EventId; newName: string; newDate: Date; newDuration: number; newLocation: string; newDescription: string }): Promise<{ event: EventId } | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can modify the event." };
    }
    if (existingEvent.status === "completed") {
      return { error: "Cannot modify a completed event." };
    }

    const currentTime = new Date();
    if (newDate < currentTime) {
      return { error: "New event date cannot be in the past." };
    }
    if (!newName.trim()) {
      return { error: "New event name cannot be empty." };
    }
    if (!newLocation.trim()) {
      return { error: "New event location cannot be empty." };
    }
    if (!newDescription.trim()) {
      return { error: "New event description cannot be empty." };
    }
    if (newDuration <= 0) {
      return { error: "New event duration must be greater than 0 minutes." };
    }

    // Check if any field actually differs
    const hasChanges =
      existingEvent.name !== newName ||
      existingEvent.date.getTime() !== newDate.getTime() ||
      existingEvent.duration !== newDuration ||
      existingEvent.location !== newLocation ||
      existingEvent.description !== newDescription;

    if (!hasChanges) {
      return { error: "No changes detected. At least one field must differ from the original event details." };
    }

    const result = await this.events.updateOne(
      { _id: event },
      { $set: { name: newName, date: newDate, duration: newDuration, location: newLocation, description: newDescription, status: "upcoming" } } // Reset status to upcoming if modified
    );

    if (result.matchedCount === 0) {
      return { error: `Event with ID ${event} could not be updated.` };
    }
    return { event: event };
  }

  /**
   * cancelEvent (organizer: User, event: Event)
   *
   * @requires organizer = event.organizer and event.status = "upcoming"
   * @effects event.status := "cancelled"
   */
  async cancelEvent({ organizer, event }: { organizer: User; event: EventId }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can cancel the event." };
    }
    if (existingEvent.status !== "upcoming") {
      return { error: `Event with ID ${event} is not in "upcoming" status and cannot be cancelled.` };
    }

    await this.events.updateOne({ _id: event }, { $set: { status: "cancelled" } });
    return {};
  }

  /**
   * unCancelEvent (organizer: User, event: Event): (event: Event)
   *
   * @requires organizer = event.organizer and event.status = "cancelled" and event.date + event.duration (in minutes) >= current_time
   * @effects event.status := "upcoming"; returns event
   */
  async unCancelEvent({ organizer, event }: { organizer: User; event: EventId }): Promise<{ event: EventId } | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can uncanceled the event." };
    }
    if (existingEvent.status !== "cancelled") {
      return { error: `Event with ID ${event} is not in "cancelled" status.` };
    }

    const eventEndTime = new Date(existingEvent.date.getTime() + existingEvent.duration * 60 * 1000);
    const currentTime = new Date();
    if (eventEndTime < currentTime) {
      return { error: `Event with ID ${event} has already ended and cannot be uncanceled.` };
    }

    await this.events.updateOne({ _id: event }, { $set: { status: "upcoming" } });
    return { event: event };
  }

  /**
   * deleteEvent (organizer: User, event: Event)
   *
   * @requires organizer = event.organizer
   * @effects removes event from the set of all existing events
   */
  async deleteEvent({ organizer, event }: { organizer: User; event: EventId }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.organizer !== organizer) {
      return { error: "Only the event organizer can delete the event." };
    }

    await this.events.deleteOne({ _id: event });
    return {};
  }

  /**
   * system completeEvent (event: Event)
   *
   * @requires event.status = "upcoming" and (event.date + event.duration (in minutes) <= current_time)
   * @effects event.status := "completed"
   */
  async completeEvent({ event }: { event: EventId }): Promise<Empty | { error: string }> {
    const existingEvent = await this.events.findOne({ _id: event });
    if (!existingEvent) {
      return { error: `Event with ID ${event} not found.` };
    }
    if (existingEvent.status !== "upcoming") {
      return { error: `Event with ID ${event} is not in "upcoming" status.` };
    }

    const eventEndTime = new Date(existingEvent.date.getTime() + existingEvent.duration * 60 * 1000);
    const currentTime = new Date();
    if (eventEndTime > currentTime) {
      return { error: `Event with ID ${event} has not yet ended.` };
    }

    await this.events.updateOne({ _id: event }, { $set: { status: "completed" } });
    return {};
  }

  /**
   * _getEvent (event: Event) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)
   *
   * @requires The event must exist.
   * @effects Returns the full details of the specified event.
   */
  async _getEvent({ event }: { event: EventId }): Promise<EventOutput[] | { error: string }> {
    const eventDoc = await this.events.findOne({ _id: event });
    if (!eventDoc) {
      return { error: `Event with ID ${event} not found.` };
    }
    return [this.mapToEventOutput(eventDoc)];
  }

  /**
   * _getEventsByOrganizer (organizer: User) : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})
   *
   * @requires The organizer must exist.
   * @effects Returns all events organized by the specified user.
   */
  async _getEventsByOrganizer({ organizer }: { organizer: User }): Promise<EventOutput[]> {
    const events = await this.events.find({ organizer }).toArray();
    return events.map(this.mapToEventOutput);
  }

  /**
   * _getUpcomingEvents () : (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"})
   *
   * @effects Returns all upcoming events (status "upcoming" and event end time is in the future).
   */
  async _getUpcomingEvents(): Promise<EventOutput[]> {
    const currentTime = new Date();
    // Find events that are 'upcoming' AND their start date is in the future
    const events = await this.events.find({
      status: "upcoming",
      date: { $gt: currentTime } 
    }).toArray();
    
    // More precise filtering in memory to ensure event is truly upcoming
    // The previous $gt: currentTime on `date` is a good initial filter,
    // but the actual "end time in the future" check is done here.
    return events
        .filter(event => (new Date(event.date.getTime() + event.duration * 60 * 1000)) > currentTime)
        .map(this.mapToEventOutput);
  }

  /**
   * _getEventsByRecommendationContext (user: User, filters: String, priorities: String): (event: {id: Event, organizer: User, name: String, date: DateTime, duration: Number, location: String, description: String, status: "upcoming" or "cancelled" or "completed"}) | (error: String)
   *
   * @requires The `filters` and `priorities` strings, if provided, must be parsable as JSON and their content understood by the concept for filtering/ordering events. The `user` parameter is used for context but the `Event` concept does not store user-specific recommendation data.
   * @effects Returns a set of event details, filtered and potentially ordered, based on the provided contextual criteria. Returns an error if the criteria are malformed or cannot be applied internally.
   */
  async _getEventsByRecommendationContext({ user, filters, priorities }: { user: User; filters: string; priorities: string }): Promise<EventOutput[] | { error: string }> {
    // The 'user' parameter is explicitly received for context but not used internally for data access
    // or to fetch user-specific state, maintaining the concept's independence.
    // All "user-specific augmentation" of recommendations must be encoded into 'filters' and 'priorities'.

    let filterQuery: Filter<EventDoc> = {};
    let sortOptions: Sort = { date: 1 }; // Default sort by date ascending
    let boostEventIds: EventId[] = [];
    const currentTime = new Date();

    try {
      if (filters) {
        const parsedFilters = JSON.parse(filters);
        
        // Always include upcoming events that haven't ended yet
        filterQuery.status = "upcoming";
        filterQuery.date = { ...filterQuery.date, $gt: currentTime }; // Events starting in the future
        
        if (parsedFilters.categoryKeywords && Array.isArray(parsedFilters.categoryKeywords) && parsedFilters.categoryKeywords.length > 0) {
          const keywordRegex = new RegExp(parsedFilters.categoryKeywords.join('|'), 'i');
          // Use $or for searching in multiple text fields like name and description
          filterQuery.$or = [
            { name: { $regex: keywordRegex } },
            { description: { $regex: keywordRegex } }
          ];
        }
        if (parsedFilters.locationKeywords && Array.isArray(parsedFilters.locationKeywords) && parsedFilters.locationKeywords.length > 0) {
            const locationRegex = new RegExp(parsedFilters.locationKeywords.join('|'), 'i');
            filterQuery.location = { $regex: locationRegex };
        }
        if (parsedFilters.dateMin) {
          filterQuery.date = { ...filterQuery.date, $gte: new Date(parsedFilters.dateMin) };
        }
        if (parsedFilters.dateMax) {
          filterQuery.date = { ...filterQuery.date, $lte: new Date(parsedFilters.dateMax) };
        }
      } else {
        // If no filters provided, default to all upcoming events that haven't ended
        filterQuery.status = "upcoming";
        filterQuery.date = { $gt: currentTime };
      }

      if (priorities) {
        const parsedPriorities = JSON.parse(priorities);
        if (parsedPriorities.boostEventIds && Array.isArray(parsedPriorities.boostEventIds)) {
          boostEventIds = parsedPriorities.boostEventIds as EventId[];
        }
        if (parsedPriorities.sortBy === "dateDesc") {
          sortOptions = { date: -1 };
        } else if (parsedPriorities.sortBy === "nameAsc") {
          sortOptions = { name: 1 };
        } else if (parsedPriorities.sortBy === "nameDesc") {
          sortOptions = { name: -1 };
        }
        // Add more sorting options as needed based on event properties
      }
    } catch (e) {
      return { error: `Failed to parse filters or priorities: ${e.message}` };
    }

    // Initial query for events based on filters and default sorting
    let filteredEvents = await this.events.find(filterQuery).sort(sortOptions).toArray();

    // In-memory filter to ensure events haven't actually ended yet,
    // as $gt on `date` only checks start time, not end time + duration.
    // This is more robust than relying solely on MongoDB's date filtering for dynamic "end time" calculation.
    filteredEvents = filteredEvents.filter(event => 
      (new Date(event.date.getTime() + event.duration * 60 * 1000)) > currentTime
    );

    // Apply boosting logic if boostEventIds are provided
    if (boostEventIds.length > 0) {
      const boostedMap = new Map<EventId, EventDoc>();
      const nonBoostedEvents: EventDoc[] = [];

      for (const event of filteredEvents) {
        if (boostEventIds.includes(event._id)) {
          boostedMap.set(event._id, event);
        } else {
          nonBoostedEvents.push(event);
        }
      }

      // Reconstruct the list: boosted events first, in the order specified by boostEventIds, then non-boosted events
      const orderedBoostedEvents = boostEventIds
        .map(id => boostedMap.get(id))
        .filter((event): event is EventDoc => event !== undefined); // Filter out undefined if an ID was boosted but not found in filteredEvents

      filteredEvents = [...orderedBoostedEvents, ...nonBoostedEvents];
    }
    
    return filteredEvents.map(this.mapToEventOutput);
  }
}
```