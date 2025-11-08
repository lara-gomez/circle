/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */

export const inclusions: Record<string, string> = {
  // Feel free to delete these example inclusions
  "/api/LikertSurvey/_getSurveyQuestions": "this is a public query",
  "/api/LikertSurvey/_getSurveyResponses": "responses are public",
  "/api/LikertSurvey/_getRespondentAnswers": "answers are visible",
  "/api/LikertSurvey/submitResponse": "allow anyone to submit response",
  "/api/LikertSurvey/updateResponse": "allow anyone to update their response",
  "/api/Session/_getUser": "allow anyone to get a user by session id (public query)",
  "/api/UserAuthentication/_getUserByUsername":
    "allow anyone to get a user by username (public query)",
  "/api/UserAuthentication/_getUsername":
    "allow anyone to get a username by user id (public query)",
  "/api/Friending/_getFriends": "allow anyone to get friends (public query)",
  "/api/Friending/_getIncomingRequests":
    "allow anyone to get incoming requests (public query)",
  "/api/Friending/_getOutgoingRequests":
    "allow anyone to get outgoing requests(public query)",
  "/api/Reviewing/_getReview": "allow anyone to access a specific review (public query)",
  "/api/Reviewing/_getReviewsByItem":
    "allow anyone to access all reviews for an event (public query)",
  "/api/Reviewing/_getReviewsByUser":
    "allow anyone to access reviews by a given user (public query)",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  // Feel free to delete these example exclusions
  "/api/LikertSurvey/createSurvey",
  "/api/LikertSurvey/addQuestion",
  "/api/Event/createEvent",
  "/api/Event/modifyEvent",
  "/api/Event/cancelEvent",
  "/api/Event/unCancelEvent",
  "/api/Event/deleteEvent",
  "/api/Event/completeEvent",
  "/api/Event/_getEventById",
  "/api/Event/_getEventsByOrganizer",
  "/api/Event/_getEventsByStatus",
  "/api/Event/_getAllEvents",
  "/api/Event/_getEventsByRecommendationContext",
  "/api/Event/createRecommendationPrompt",
  "/api/Event/parseAndApplyRecommendations",
  "/api/Event/eventsToString",
  "/api/Event/displayRecommendations",
  "/api/Session/create",
  "/api/Session/delete",
  "/api/UserAuthentication/register",
  "/api/UserAuthentication/authenticate",
  "/api/Friending/ensureUserExists",
  "/api/Friending/sendFriendRequest",
  "/api/Friending/acceptFriendRequest",
  "/api/Friending/removeFriendRequest",
  "/api/Friending/removeFriend",
  "/api/Reviewing/addReview",
  "/api/Reviewing/removeReview",
  "/api/Reviewing/modifyReview",
  "/api/UserInterest/addPersonalInterest",
  "/api/UserInterest/removePersonalInterest",
  "/api/UserInterest/addItemInterest",
  "/api/UserInterest/removeItemInterest",
  "/api/UserInterest/_getPersonalInterests",
  "/api/UserInterest/_getItemInterests",
  "/api/UserInterest/_getUsersInterestedInItems"
];
