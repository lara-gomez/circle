---
timestamp: 'Mon Oct 27 2025 02:04:16 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_020416.96c7a6a1.md]]'
content_id: 5dee7b91da807f89efdc707c6203da9edc6bf7456223d0146f2bf0bebbe54540
---

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
