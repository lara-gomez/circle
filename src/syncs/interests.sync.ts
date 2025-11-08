import { actions, Frames, Sync } from "@engine";
import { Requesting, Session, UserInterest } from "@concepts";
import type { ID } from "@utils/types.ts";

const INVALID_SESSION_ERROR = "Invalid session. Please sign in.";

// ---------------------------------------------------------------------------
// Personal Interests
// ---------------------------------------------------------------------------

export const RequestAddPersonalInterest: Sync = ({
  request,
  session,
  tag,
  currentUser,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/addPersonalInterest", session, tag },
    { request },
  ]),
  where: async (frames) => await frames.query(Session._getUser, { session }, { user: currentUser }),
  then: actions([
    UserInterest.addPersonalInterest,
    { user: currentUser, tag },
  ]),
});

export const AddPersonalInterestGuardResponse: Sync = ({
  request,
  session,
  tag,
  currentUser,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/addPersonalInterest", session, tag },
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

export const AddPersonalInterestResponse: Sync = ({ request, personalInterest }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/addPersonalInterest" }, { request }],
    [UserInterest.addPersonalInterest, {}, { personalInterest }],
  ),
  then: actions([Requesting.respond, { request, personalInterest }]),
});

export const AddPersonalInterestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/addPersonalInterest" }, { request }],
    [UserInterest.addPersonalInterest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const RequestRemovePersonalInterest: Sync = ({
  request,
  session,
  tag,
  currentUser,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/removePersonalInterest", session, tag },
    { request },
  ]),
  where: async (frames) => await frames.query(Session._getUser, { session }, { user: currentUser }),
  then: actions([
    UserInterest.removePersonalInterest,
    { user: currentUser, tag },
  ]),
});

export const RemovePersonalInterestGuardResponse: Sync = ({
  request,
  session,
  tag,
  currentUser,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/removePersonalInterest", session, tag },
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

export const RemovePersonalInterestResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/removePersonalInterest" }, { request }],
    [UserInterest.removePersonalInterest, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const RemovePersonalInterestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/removePersonalInterest" }, { request }],
    [UserInterest.removePersonalInterest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// ---------------------------------------------------------------------------
// Item Interests
// ---------------------------------------------------------------------------

export const RequestAddItemInterest: Sync = ({
  request,
  session,
  item,
  currentUser,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/addItemInterest", session, item },
    { request },
  ]),
  where: async (frames) =>
    await frames.query(Session._getUser, { session }, { user: currentUser }),
  then: actions([
    UserInterest.addItemInterest,
    { user: currentUser, item },
  ]),
});

export const AddItemInterestGuardResponse: Sync = ({
  request,
  session,
  item,
  currentUser,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/addItemInterest", session, item },
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

export const AddItemInterestResponse: Sync = ({ request, itemInterest }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/addItemInterest" }, { request }],
    [UserInterest.addItemInterest, {}, { itemInterest }],
  ),
  then: actions([Requesting.respond, { request, itemInterest }]),
});

export const AddItemInterestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/addItemInterest" }, { request }],
    [UserInterest.addItemInterest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const RequestRemoveItemInterest: Sync = ({
  request,
  session,
  item,
  currentUser,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/removeItemInterest", session, item },
    { request },
  ]),
  where: async (frames) =>
    await frames.query(Session._getUser, { session }, { user: currentUser }),
  then: actions([
    UserInterest.removeItemInterest,
    { user: currentUser, item },
  ]),
});

export const RemoveItemInterestGuardResponse: Sync = ({
  request,
  session,
  item,
  currentUser,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/removeItemInterest", session, item },
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

export const RemoveItemInterestResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/removeItemInterest" }, { request }],
    [UserInterest.removeItemInterest, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const RemoveItemInterestErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserInterest/removeItemInterest" }, { request }],
    [UserInterest.removeItemInterest, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const emptyResultsFrame = (
  original: Record<symbol, unknown>,
  target: symbol,
) => new Frames({ ...original, [target]: [] });

export const RequestGetPersonalInterests: Sync = ({
  request,
  session,
  currentUser,
  results,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/_getPersonalInterests", session },
    { request },
  ]),
  where: async (frames) => {
    const authed = await frames.query(Session._getUser, { session }, { user: currentUser });
    if (authed.length === 0) {
      return emptyResultsFrame(frames[0] ?? {}, results);
    }

    const outputs = new Frames();
    for (const frame of authed) {
      const userId = frame[currentUser] as ID | undefined;
      if (userId === undefined) {
        outputs.push({ ...frame, [results]: [] });
        continue;
      }

      const docs = await UserInterest._getPersonalInterests({ user: userId });
      outputs.push({
        ...frame,
        [results]: docs.map((doc) => ({ _id: doc._id, user: doc.user, tag: doc.tag })),
      });
    }
    return outputs;
  },
  then: actions([Requesting.respond, { request, results }]),
});

export const GetPersonalInterestsGuardResponse: Sync = ({
  request,
  session,
  currentUser,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/_getPersonalInterests", session },
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

export const RequestGetItemInterests: Sync = ({
  request,
  session,
  currentUser,
  results,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/_getItemInterests", session },
    { request },
  ]),
  where: async (frames) => {
    const authed = await frames.query(Session._getUser, { session }, { user: currentUser });
    if (authed.length === 0) {
      return emptyResultsFrame(frames[0] ?? {}, results);
    }

    const outputs = new Frames();
    for (const frame of authed) {
      const userId = frame[currentUser] as ID | undefined;
      if (userId === undefined) {
        outputs.push({ ...frame, [results]: [] });
        continue;
      }

      const docs = await UserInterest._getItemInterests({ user: userId });
      outputs.push({
        ...frame,
        [results]: docs.map((doc) => ({ _id: doc._id, user: doc.user, item: doc.item })),
      });
    }
    return outputs;
  },
  then: actions([Requesting.respond, { request, results }]),
});

export const GetItemInterestsGuardResponse: Sync = ({
  request,
  session,
  currentUser,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/_getItemInterests", session },
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

export const RequestGetUsersInterestedInItem: Sync = ({
  request,
  session,
  item,
  currentUser,
  results,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/_getUsersInterestedInItems", session, item },
    { request },
  ]),
  where: async (frames) => {
    const authed = await frames.query(Session._getUser, { session }, { user: currentUser });
    if (authed.length === 0) {
      return emptyResultsFrame(frames[0] ?? {}, results);
    }

    const outputs = new Frames();
    for (const frame of authed) {
      const itemId = frame[item] as ID | undefined;
      if (itemId === undefined) {
        outputs.push({ ...frame, [results]: [] });
        continue;
      }

      const docs = await UserInterest._getUsersInterestedInItems({ item: itemId });
      outputs.push({
        ...frame,
        [results]: docs.map((doc) => ({ user: doc.user })),
      });
    }
    return outputs;
  },
  then: actions([Requesting.respond, { request, results }]),
});

export const GetUsersInterestedInItemGuardResponse: Sync = ({
  request,
  session,
  item,
  currentUser,
  errorMessage,
}) => ({
  when: actions([
    Requesting.request,
    { path: "/UserInterest/_getUsersInterestedInItems", session, item },
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
