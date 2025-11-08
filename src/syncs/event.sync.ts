// file: src/syncs/event.sync.ts
import { actions, Frames, Sync } from "@engine";
import { Requesting, Event, Session, UserInterest, Reviewing } from "@concepts";
import type { ID } from "@utils/types.ts";

const INVALID_SESSION_ERROR = "Invalid session. Please sign in.";
const EVENT_NOT_FOUND_ERROR = "Event not found.";
const NOT_ORGANIZER_ERROR = "Only the event organizer can perform this action.";

const markCompletedInArray = async (events: unknown[]) => {
  const now = Date.now();
  for (const maybeDoc of events) {
    if (maybeDoc == null || typeof maybeDoc !== "object") continue;
    const doc = maybeDoc as { [key: string]: unknown };
    const status = doc.status as string | undefined;
    const dateValue = doc.date instanceof Date
      ? doc.date.getTime()
      : typeof doc.date === "string"
        ? Date.parse(doc.date)
        : undefined;
    const duration = typeof doc.duration === "number" ? doc.duration : undefined;
    if (status !== "upcoming" || dateValue === undefined || duration === undefined) {
      continue;
    }
    const endTime = dateValue + duration * 60_000;
    if (endTime <= now) {
      const eventId = doc._id as ID | undefined;
      if (eventId !== undefined) {
        await Event.completeEvent({ event: eventId });
        doc.status = "completed";
      }
    }
  }
};

const markCompletedIfNeeded = async (
  frames: Frames,
  eventDocs: symbol,
) => {
  for (const frame of frames) {
    const docs = frame[eventDocs] as unknown[] | undefined;
    if (!Array.isArray(docs) || docs.length === 0) continue;
    await markCompletedInArray(docs);
  }
};

const flattenEventDoc = (
  frames: Frames,
  eventDocs: symbol,
  eventDoc: symbol,
): Frames => {
  const populated = frames.filter(($) => {
    const docs = $[eventDocs];
    return Array.isArray(docs) && docs.length > 0;
  });
  return populated.map(($) => {
    const docs = $[eventDocs] as Array<Record<string, unknown>>;
    return { ...$, [eventDoc]: docs[0] };
  });
};

// ---------------------------------------------------------------------------
// Create Event
// ---------------------------------------------------------------------------

export const RequestCreateEvent: Sync = ({
  request,
  session,
  name,
  date,
  duration,
  location,
  description,
  currentUser,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/createEvent", name, date, duration, location, description, session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: currentUser });
    return frames.filter(($) => $[currentUser] !== undefined);
  },
  then: actions([
    Event.createEvent,
    { organizer: currentUser, name, date, duration, location, description },
  ]),
});

export const CreateEventGuardResponse: Sync = ({
  request,
  session,
  name,
  date,
  duration,
  location,
  description,
  currentUser,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/createEvent", name, date, duration, location, description, session },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = (frames[0] ?? {}) as Record<symbol, unknown>;

    let working = await frames.query(Session._getUser, { session }, { user: currentUser });
    working = working.filter(($) => $[currentUser] !== undefined);
    if (working.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: INVALID_SESSION_ERROR });
    }

    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: errorMessage }]),
});

export const CreateEventResponse: Sync = ({ request, event }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/createEvent" }, { request }],
    [Event.createEvent, {}, { event }],
  ),
  then: actions([Requesting.respond, { request, event }]),
});

export const CreateEventErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/createEvent" }, { request }],
    [Event.createEvent, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// ---------------------------------------------------------------------------
// Modify Event
// ---------------------------------------------------------------------------

export const RequestModifyEvent: Sync = ({
  request,
  session,
  event: eventId,
  newName,
  newDate,
  newDuration,
  newLocation,
  newDescription,
  currentUser,
  eventDocs,
  eventDoc,
}) => ({
  when: actions([
    Requesting.request,
    {
      path: "/Event/modifyEvent",
      event: eventId,
      newName,
      newDate,
      newDuration,
      newLocation,
      newDescription,
      session,
    },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: currentUser });
    frames = await frames.query(Event._getEventById, { event: eventId }, { event: eventDocs });
    frames = flattenEventDoc(frames, eventDocs, eventDoc);
    return frames.filter(($) => {
      const doc = $[eventDoc] as { organizer?: unknown } | undefined;
      return doc?.organizer === $[currentUser];
    });
  },
  then: actions([
    Event.modifyEvent,
    {
      organizer: currentUser,
      event: eventId,
      newName,
      newDate,
      newDuration,
      newLocation,
      newDescription,
    },
  ]),
});

export const ModifyEventGuardResponse: Sync = ({
  request,
  session,
  event: eventId,
  newName,
  newDate,
  newDuration,
  newLocation,
  newDescription,
  currentUser,
  eventDocs,
  eventDoc,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    {
      path: "/Event/modifyEvent",
      event: eventId,
      newName,
      newDate,
      newDuration,
      newLocation,
      newDescription,
      session,
    },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = (frames[0] ?? {}) as Record<symbol, unknown>;

    let working = await frames.query(Session._getUser, { session }, { user: currentUser });
    working = working.filter(($) => $[currentUser] !== undefined);
    if (working.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: INVALID_SESSION_ERROR });
    }

    working = await working.query(Event._getEventById, { event: eventId }, { event: eventDocs });
    const withEvent = flattenEventDoc(working, eventDocs, eventDoc);
    if (withEvent.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: EVENT_NOT_FOUND_ERROR });
    }

    const authorized = withEvent.filter(($) => {
      const doc = $[eventDoc] as { organizer?: unknown } | undefined;
      return doc?.organizer === $[currentUser];
    });
    if (authorized.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: NOT_ORGANIZER_ERROR });
    }

    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: errorMessage }]),
});

export const ModifyEventResponse: Sync = ({ request, event }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/modifyEvent" }, { request }],
    [Event.modifyEvent, {}, { event }],
  ),
  then: actions([Requesting.respond, { request, event }]),
});

export const ModifyEventErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/modifyEvent" }, { request }],
    [Event.modifyEvent, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// ---------------------------------------------------------------------------
// Cancel Event
// ---------------------------------------------------------------------------

export const RequestCancelEvent: Sync = ({
  request,
  session,
  event: eventId,
  currentUser,
  eventDocs,
  eventDoc,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/cancelEvent", event: eventId, session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: currentUser });
    frames = await frames.query(Event._getEventById, { event: eventId }, { event: eventDocs });
    frames = flattenEventDoc(frames, eventDocs, eventDoc);
    return frames.filter(($) => {
      const doc = $[eventDoc] as { organizer?: unknown } | undefined;
      return doc?.organizer === $[currentUser];
    });
  },
  then: actions([
    Event.cancelEvent,
    { organizer: currentUser, event: eventId },
  ]),
});

export const CancelEventGuardResponse: Sync = ({
  request,
  session,
  event: eventId,
  currentUser,
  eventDocs,
  eventDoc,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/cancelEvent", event: eventId, session },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = (frames[0] ?? {}) as Record<symbol, unknown>;

    let working = await frames.query(Session._getUser, { session }, { user: currentUser });
    working = working.filter(($) => $[currentUser] !== undefined);
    if (working.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: INVALID_SESSION_ERROR });
    }

    working = await working.query(Event._getEventById, { event: eventId }, { event: eventDocs });
    const withEvent = flattenEventDoc(working, eventDocs, eventDoc);
    if (withEvent.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: EVENT_NOT_FOUND_ERROR });
    }

    const authorized = withEvent.filter(($) => {
      const doc = $[eventDoc] as { organizer?: unknown } | undefined;
      return doc?.organizer === $[currentUser];
    });
    if (authorized.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: NOT_ORGANIZER_ERROR });
    }

    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: errorMessage }]),
});

export const CancelEventResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/cancelEvent" }, { request }],
    [Event.cancelEvent, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const CancelEventErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/cancelEvent" }, { request }],
    [Event.cancelEvent, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// ---------------------------------------------------------------------------
// Uncancel Event
// ---------------------------------------------------------------------------

export const RequestUnCancelEvent: Sync = ({
  request,
  session,
  event: eventId,
  currentUser,
  eventDocs,
  eventDoc,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/unCancelEvent", event: eventId, session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: currentUser });
    frames = await frames.query(Event._getEventById, { event: eventId }, { event: eventDocs });
    frames = flattenEventDoc(frames, eventDocs, eventDoc);
    return frames.filter(($) => {
      const doc = $[eventDoc] as { organizer?: unknown } | undefined;
      return doc?.organizer === $[currentUser];
    });
  },
  then: actions([
    Event.unCancelEvent,
    { organizer: currentUser, event: eventId },
  ]),
});

export const UnCancelEventGuardResponse: Sync = ({
  request,
  session,
  event: eventId,
  currentUser,
  eventDocs,
  eventDoc,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/unCancelEvent", event: eventId, session },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = (frames[0] ?? {}) as Record<symbol, unknown>;

    let working = await frames.query(Session._getUser, { session }, { user: currentUser });
    working = working.filter(($) => $[currentUser] !== undefined);
    if (working.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: INVALID_SESSION_ERROR });
    }

    working = await working.query(Event._getEventById, { event: eventId }, { event: eventDocs });
    const withEvent = flattenEventDoc(working, eventDocs, eventDoc);
    if (withEvent.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: EVENT_NOT_FOUND_ERROR });
    }

    const authorized = withEvent.filter(($) => {
      const doc = $[eventDoc] as { organizer?: unknown } | undefined;
      return doc?.organizer === $[currentUser];
    });
    if (authorized.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: NOT_ORGANIZER_ERROR });
    }

    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: errorMessage }]),
});

export const UnCancelEventResponse: Sync = ({ request, event }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/unCancelEvent" }, { request }],
    [Event.unCancelEvent, {}, { event }],
  ),
  then: actions([Requesting.respond, { request, event }]),
});

export const UnCancelEventErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/unCancelEvent" }, { request }],
    [Event.unCancelEvent, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// ---------------------------------------------------------------------------
// Delete Event
// ---------------------------------------------------------------------------

export const RequestDeleteEvent: Sync = ({
  request,
  session,
  event: eventId,
  currentUser,
  eventDocs,
  eventDoc,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/deleteEvent", event: eventId, session },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Session._getUser, { session }, { user: currentUser });
    frames = await frames.query(Event._getEventById, { event: eventId }, { event: eventDocs });
    frames = flattenEventDoc(frames, eventDocs, eventDoc);
    return frames.filter(($) => {
      const doc = $[eventDoc] as { organizer?: unknown } | undefined;
      return doc?.organizer === $[currentUser];
    });
  },
  then: actions([
    Event.deleteEvent,
    { organizer: currentUser, event: eventId },
  ]),
});

export const DeleteEventGuardResponse: Sync = ({
  request,
  session,
  event: eventId,
  currentUser,
  eventDocs,
  eventDoc,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/deleteEvent", event: eventId, session },
    { request },
  ]),
  where: async (frames) => {
    const originalFrame = (frames[0] ?? {}) as Record<symbol, unknown>;

    let working = await frames.query(Session._getUser, { session }, { user: currentUser });
    working = working.filter(($) => $[currentUser] !== undefined);
    if (working.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: INVALID_SESSION_ERROR });
    }

    working = await working.query(Event._getEventById, { event: eventId }, { event: eventDocs });
    const withEvent = flattenEventDoc(working, eventDocs, eventDoc);
    if (withEvent.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: EVENT_NOT_FOUND_ERROR });
    }

    const authorized = withEvent.filter(($) => {
      const doc = $[eventDoc] as { organizer?: unknown } | undefined;
      return doc?.organizer === $[currentUser];
    });
    if (authorized.length === 0) {
      return new Frames({ ...originalFrame, [errorMessage]: NOT_ORGANIZER_ERROR });
    }

    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: errorMessage }]),
});

export const DeleteEventResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/deleteEvent" }, { request }],
    [Event.deleteEvent, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const DeleteEventErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Event/deleteEvent" }, { request }],
    [Event.deleteEvent, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// ---------------------------------------------------------------------------
// Query Syncs
// ---------------------------------------------------------------------------

const emptyResultsFrame = (
  original: Record<symbol, unknown>,
  target: symbol,
  extras: Array<[symbol, unknown]> = [],
) => {
  const frame = { ...original, [target]: [] } as Record<symbol, unknown>;
  for (const [sym, value] of extras) {
    frame[sym] = value;
  }
  return new Frames(frame);
};

export const RequestGetEventsByOrganizer: Sync = ({
  request,
  session,
  organizer,
  currentUser,
  results,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/_getEventsByOrganizer", organizer, session },
    { request },
  ]),
  where: async (frames) => {
    const baseFrame = (frames[0] ?? {}) as Record<symbol, unknown>;
    const authed = await frames.query(Session._getUser, { session }, { user: currentUser });
    if (authed.length === 0) {
      return emptyResultsFrame(baseFrame, results);
    }

    const outputs = new Frames();
    for (const frame of authed) {
      const organizerId = frame[organizer] as ID | undefined;
      if (organizerId === undefined) {
        outputs.push({ ...frame, [results]: [] });
        continue;
      }

      const docs = await Event._getEventsByOrganizer({ organizer: organizerId });
      await markCompletedInArray(docs);
      outputs.push({ ...frame, [results]: docs });
    }
    return outputs;
  },
  then: actions([Requesting.respond, { request, results }]),
});

export const GetEventsByOrganizerGuardResponse: Sync = ({
  request,
  session,
  organizer,
  currentUser,
  results,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/_getEventsByOrganizer", organizer, session },
    { request },
  ]),
  where: async (frames) => {
    const original = (frames[0] ?? {}) as Record<symbol, unknown>;
    const authenticated = await frames.query(Session._getUser, { session }, { user: currentUser });
    if (authenticated.length === 0) {
      return new Frames({ ...original, [errorMessage]: INVALID_SESSION_ERROR });
    }
    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: errorMessage }]),
});

export const RequestGetEventById: Sync = ({
  request,
  session,
  event: eventId,
  currentUser,
  result,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/_getEventById", event: eventId, session },
    { request },
  ]),
  where: async (frames) => {
    const baseFrame = (frames[0] ?? {}) as Record<symbol, unknown>;
    const authed = await frames.query(Session._getUser, { session }, { user: currentUser });
    if (authed.length === 0) {
      return new Frames({ ...baseFrame, [result]: null });
    }

    const outputs = new Frames();
    for (const frame of authed) {
      const eventIdValue = frame[eventId] as ID | undefined;
      if (eventIdValue === undefined) {
        outputs.push({ ...frame, [result]: null });
        continue;
      }

      const docs = await Event._getEventById({ event: eventIdValue });
      if (docs.length === 0) {
        outputs.push({ ...frame, [result]: null });
        continue;
      }
      await markCompletedInArray(docs);
      outputs.push({ ...frame, [result]: docs[0] });
    }
    return outputs;
  },
  then: actions([Requesting.respond, { request, event: result }]),
});

export const GetEventByIdGuardResponse: Sync = ({
  request,
  session,
  event: eventId,
  currentUser,
  eventDoc,
  result,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/_getEventById", event: eventId, session },
    { request },
  ]),
  where: async (frames) => {
    const original = (frames[0] ?? {}) as Record<symbol, unknown>;
    const authenticated = await frames.query(Session._getUser, { session }, { user: currentUser });
    if (authenticated.length === 0) {
      return new Frames({ ...original, [errorMessage]: INVALID_SESSION_ERROR });
    }
    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: errorMessage }]),
});

export const RequestGetEventsByRecommendationContext: Sync = ({
  request,
  session,
  filters,
  priorities,
  currentUser,
  results,
  recommendationError,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/_getEventsByRecommendationContext", session, filters, priorities },
    { request },
  ]),
  where: async (frames) => {
    const authed = await frames.query(Session._getUser, { session }, { user: currentUser });
    const base = (authed[0] ?? frames[0] ?? {}) as Record<symbol, unknown>;
    if (authed.length === 0) {
      return emptyResultsFrame(base, results, [[recommendationError, "Session required."]]);
    }

    const outputs = new Frames();
    for (const frame of authed) {
      const baseFrame = {
        ...frame,
        [results]: [] as unknown,
        [recommendationError]: null as unknown,
      } as Record<symbol, unknown>;

      const userId = frame[currentUser] as ID | undefined;
      const filterValue = frame[filters] as string | undefined;
      const priorityValue = frame[priorities] as string | undefined;

      if (userId === undefined || filterValue === undefined || priorityValue === undefined) {
        outputs.push({
          ...baseFrame,
          [results]: [],
          [recommendationError]: "Missing recommendation parameters.",
        });
        continue;
      }

      const result = await Event._getEventsByRecommendationContext({
        user: userId,
        filters: filterValue,
        priorities: priorityValue,
      });

      if (Array.isArray(result)) {
        await markCompletedInArray(result);
        outputs.push({ ...baseFrame, [results]: result, [recommendationError]: null });
      } else {
        outputs.push({ ...baseFrame, [results]: [], [recommendationError]: result.error });
      }
    }
    if (outputs.length === 0) {
      return emptyResultsFrame(base, results, [[recommendationError, null]]);
    }

    return outputs;
  },
  then: actions([Requesting.respond, { request, results, error: recommendationError }]),
});

export const GetEventsByRecommendationContextGuardResponse: Sync = ({
  request,
  session,
  filters,
  priorities,
  currentUser,
  results,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/_getEventsByRecommendationContext", session, filters, priorities },
    { request },
  ]),
  where: async (frames) => {
    const original = (frames[0] ?? {}) as Record<symbol, unknown>;
    const authenticated = await frames.query(Session._getUser, { session }, { user: currentUser });
    if (authenticated.length === 0) {
      return new Frames({ ...original, [errorMessage]: INVALID_SESSION_ERROR });
    }
    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: errorMessage }]),
});

export const RequestGetEventsByStatus: Sync = ({
  request,
  session,
  status,
  currentUser,
  results,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/_getEventsByStatus", session, status },
    { request },
  ]),
  where: async (frames) => {
    const baseFrame = (frames[0] ?? {}) as Record<symbol, unknown>;
    const authed = await frames.query(Session._getUser, { session }, { user: currentUser });
    if (authed.length === 0) {
      return emptyResultsFrame(baseFrame, results);
    }

    const outputs = new Frames();
    for (const frame of authed) {
      const statusValue = frame[status] as "upcoming" | "cancelled" | "completed" | undefined;
      if (statusValue === undefined) {
        outputs.push({ ...frame, [results]: [] });
        continue;
      }

      const docs = await Event._getEventsByStatus({ status: statusValue });
      await markCompletedInArray(docs);
      outputs.push({ ...frame, [results]: docs });
    }
    return outputs;
  },
  then: actions([Requesting.respond, { request, results }]),
});

export const GetEventsByStatusGuardResponse: Sync = ({
  request,
  session,
  status,
  currentUser,
  results,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/_getEventsByStatus", session, status },
    { request },
  ]),
  where: async (frames) => {
    const original = (frames[0] ?? {}) as Record<symbol, unknown>;
    const authenticated = await frames.query(Session._getUser, { session }, { user: currentUser });
    if (authenticated.length === 0) {
      return new Frames({ ...original, [errorMessage]: INVALID_SESSION_ERROR });
    }
    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: errorMessage }]),
});

export const RequestGetAllEvents: Sync = ({
  request,
  session,
  currentUser,
  results,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/_getAllEvents", session },
    { request },
  ]),
  where: async (frames) => {
    const baseFrame = (frames[0] ?? {}) as Record<symbol, unknown>;
    const authed = await frames.query(Session._getUser, { session }, { user: currentUser });
    if (authed.length === 0) {
      return emptyResultsFrame(baseFrame, results);
    }

    const outputs = new Frames();
    for (const frame of authed) {
      const docs = await Event._getAllEvents();
      await markCompletedInArray(docs);
      outputs.push({ ...frame, [results]: docs });
    }
    return outputs;
  },
  then: actions([Requesting.respond, { request, results }]),
});

export const GetAllEventsGuardResponse: Sync = ({
  request,
  session,
  currentUser,
  results,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/Event/_getAllEvents", session },
    { request },
  ]),
  where: async (frames) => {
    const original = (frames[0] ?? {}) as Record<symbol, unknown>;
    const authenticated = await frames.query(Session._getUser, { session }, { user: currentUser });
    if (authenticated.length === 0) {
      return new Frames({ ...original, [errorMessage]: INVALID_SESSION_ERROR });
    }
    return new Frames();
  },
  then: actions([Requesting.respond, { request, error: errorMessage }]),
});

// ---------------------------------------------------------------------------
// System action monitoring
// ---------------------------------------------------------------------------

export const SystemCompleteEventError: Sync = ({ event, error }) => ({
  when: actions([Event.completeEvent, { event }, { error }]),
  then: actions(),
});

// ---------------------------------------------------------------------------
// Cascading deletions
// ---------------------------------------------------------------------------

export const CascadeEventDeletionToUserInterest: Sync = ({
  event: deletedEventId,
  userToUpdateInterest,
  itemToRemoveInterest,
}) => ({
  when: actions([Event.deleteEvent, {}, { event: deletedEventId }]),
  where: async (frames) => {
    const results = new Frames();
    for (const frame of frames) {
      const eventId = frame[deletedEventId] as ID | undefined;
      if (eventId === undefined) continue;

      const interestedDocs = await UserInterest.userItemInterests.find({ item: eventId }).toArray();
      for (const doc of interestedDocs) {
        results.push({
          ...frame,
          [userToUpdateInterest]: doc.user,
          [itemToRemoveInterest]: doc.item,
        });
      }
    }
    return results;
  },
  then: actions([UserInterest.removeItemInterest, { user: userToUpdateInterest, item: itemToRemoveInterest }]),
});

export const CascadeEventDeletionToReviews: Sync = ({
  event: deletedEventId,
  reviewerOfDeletedEvent,
  deletedEventTarget,
}) => ({
  when: actions([Event.deleteEvent, {}, { event: deletedEventId }]),
  where: async (frames) => {
    const results = new Frames();
    for (const frame of frames) {
      const eventId = frame[deletedEventId] as ID | undefined;
      if (eventId === undefined) continue;

      const reviewDocs = await Reviewing.reviews.find({ target: eventId }).toArray();
      for (const doc of reviewDocs) {
        results.push({
          ...frame,
          [reviewerOfDeletedEvent]: doc.reviewer,
          [deletedEventTarget]: doc.target,
        });
      }
    }
    return results;
  },
  then: actions([Reviewing.removeReview, { user: reviewerOfDeletedEvent, item: deletedEventTarget }]),
});