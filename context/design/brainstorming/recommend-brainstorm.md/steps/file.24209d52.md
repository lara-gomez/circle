---
timestamp: 'Mon Oct 27 2025 02:04:16 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_020416.96c7a6a1.md]]'
content_id: 24209d52b3619738a0f1e1472f5981ab8fda4334ca5e5f0c81fa693e43068895
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
