---
timestamp: 'Thu Oct 16 2025 02:08:46 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_020846.d51fa65b.md]]'
content_id: b6a6e6f78dcd051dc0ac8495569fc566458418a700bb6afcde87a6d5bfc5be86
---

# concept: Friending \[User]

* **concept**: Friending \[User]

* **purpose**:

* **principle**:

* **state**:
  * a set of Users with
    * a set of friends Users
    * a set of incomingRequests Users
    * a set of outgoingRequests Users

* **actions**:
  * sendFriendRequest (user: User, target: User)
    * requires: user and target are not existing friends, user has not already sent a request to target
    * effects: target is added to the set of the user's outgoing requests; user is added to the set of target's incoming requests

  * acceptFriendRequest (user: User, target: User)
    * requires: user has sent a friend request to target, user and target are not friends
    * effects: user and target are added to each other's set of friends, they are both removed from the other's set of incoming/outgoingRequests

  * revokeFriendRequest (user: User, target: User): ()
    * requires: user has sent a friend request to target, user and target are not friends
    * effects: user is removed from the target's set of incomingRequests, target is removed the user's set of outgoingRequests

  * removeFriend (user: User, friend: User): ()
    * requires: user and friend are friends with each other
    * effects: user and friends are both removed from each other's set of friends
