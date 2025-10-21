---
timestamp: 'Thu Oct 16 2025 23:29:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_232935.3ff09952.md]]'
content_id: de4bcbdcf31c84453da11e7fafec700ff9daab1ed293fae70df9ae4b6b5d31b6
---

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
  _id: Survey; // MongoDB _id for Survey ID
  author: Author;
  title: string;
  scaleMin: number;
  scaleMax: number;
}

/**
 * State: A set of Questions, each linked to a survey and containing text.
 */
interface QuestionDoc {
  _id: Question; // MongoDB _id for Question ID
  survey: Survey;
  text: string;
}

/**
 * State: A set of Responses, linking a respondent, a question, and their chosen value.
 */
interface ResponseDoc {
  _id: Response; // MongoDB _id for Response ID
  respondent: Respondent;
  question: Question;
  value: number;
}

/**
 * @concept LikertSurvey
 * @purpose To measure attitudes or opinions by asking respondents to rate their level of agreement with a series of statements on a predefined scale.
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
   *
   * @effects Creates a new survey with the given author, title, and scale. Returns the ID of the new survey.
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
   *
   * @effects Adds a new question to the specified survey. Returns the ID of the new question.
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
   * @requires The question must exist. The respondent must not have already submitted a response for this question. The value must be within the survey's scale.
   *
   * @effects Records the respondent's answer for the given question.
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
   * @requires The question must exist. The respondent must have already submitted a response for this question. The value must be within the survey's scale.
   *
   * @effects Updates the respondent's existing answer for the given question.
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
   * _getSurveyQuestions (survey: Survey) : (question: {id: Question, survey: Survey, text: string})
   *
   * @effects Returns an array of dictionaries, each with a 'question' field containing question details.
   */
  async _getSurveyQuestions({ survey }: { survey: Survey }): Promise<{ question: { id: Question, survey: Survey, text: string } }[]> {
    const questions = await this.questions.find({ survey }).toArray();
    return questions.map(q => ({ question: { id: q._id as Question, survey: q.survey, text: q.text } }));
  }

  /**
   * _getSurveyResponses (survey: Survey) : (response: {id: Response, respondent: Respondent, question: Question, value: number})
   *
   * @effects Returns an array of dictionaries, each with a 'response' field containing response details.
   */
  async _getSurveyResponses({ survey }: { survey: Survey }): Promise<{ response: { id: Response, respondent: Respondent, question: Question, value: number } }[]> {
    const surveyQuestions = await this.questions.find({ survey }).project({ _id: 1 }).toArray();
    const questionIds = surveyQuestions.map((q) => q._id as Question);
    const responses = await this.responses.find({ question: { $in: questionIds } }).toArray();
    return responses.map(r => ({ response: { id: r._id as Response, respondent: r.respondent, question: r.question, value: r.value } }));
  }

  /**
   * _getRespondentAnswers (respondent: Respondent) : (answer: {id: Response, respondent: Respondent, question: Question, value: number})
   *
   * @effects Returns an array of dictionaries, each with an 'answer' field containing response details.
   */
  async _getRespondentAnswers({ respondent }: { respondent: Respondent }): Promise<{ answer: { id: Response, respondent: Respondent, question: Question, value: number } }[]> {
    const responses = await this.responses.find({ respondent }).toArray();
    return responses.map(r => ({ answer: { id: r._id as Response, respondent: r.respondent, question: r.question, value: r.value } }));
  }
}
```

***

## Concept: UserInterest (with `recommendItems` action)

Here's the `UserInterest` concept, including the `recommendItems` action as requested. I've added a `problem` section to discuss the implications of placing `recommendItems` within this concept, and a `solution` to suggest how it could be better modeled.
