---
timestamp: 'Thu Nov 06 2025 21:34:13 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251106_213413.31b7ee57.md]]'
content_id: c83a4055e05025addc3c69b3aee198275d5425c5f6dc4b5bf3a6650042b329a2
---

# concept: Friending \[User]

* **concept**: Friending \[User]
* **purpose**: enable users to establish and manage mutual social connections
* **principle**: a user can send a friend request to another user; they may choose to remove this request before the target user takes action; the recipient of a friend request can choose to accept or remove it; once a request is accepted, two users become friends; friendship may be revoked.
* **state**:
  * a set of Users with
    * a set of friends Users
    * a set of incomingRequests Users
    * a set of outgoingRequests Users
* **actions**:
  * sendFriendRequest (user: User, target: User)
    * requires: user and target are not existing friends, user has not already sent a request to target, target has not sent a request to user.
    * effects: target is added to the set of the user's outgoing requests; user is added to the set of target's incoming requests.
  * acceptFriendRequest (requester: User, target: User)
    * requires: requester has sent a friend request to target, requester and target are not friends
    * effects: requester and target are added to each other's set of friends, they are both removed from the other's set of incoming/outgoingRequests
  * removeFriendRequest (requester: User, target: User)
    * requires: requester has sent a friend request to target, requester and target are not friends
    * effects: requester is removed from the target's set of incomingRequests, target is removed the requester's set of outgoingRequests
  * removeFriend (user: User, friend: User): ()
    * requires: user and friend are friends with each other
    * effects: user and friends are both removed from each other's set of friends
* **queries**:
  * \_getFriends (user: User): (friend: User)
  * \_getIncomingRequests (user: User): (requester: User)
  * \_getOutgoingRequests (user: User): (target: User)
