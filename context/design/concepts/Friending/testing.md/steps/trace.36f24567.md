---
timestamp: 'Thu Oct 16 2025 02:49:56 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_024956.c7b1910a.md]]'
content_id: 36f24567f434994a877bf6b0e17bcadbd8b9c1ad22945c7fb7aeb059ad5088e1
---

# trace:

The following trace demonstrates how the **principle** of the `Friending` concept is fulfilled by a sequence of actions.

1. **Given**: Three users: `userAlice`, `userBob`, and `userCharlie`.

2. **Action**: `userAlice` sends a friend request to `userBob`.
   ```
   Friending.sendFriendRequest({ user: "user:Alice", target: "user:Bob" })
   ```

3. **State after Action 2**:
   * `userAlice`'s `outgoingRequests` contains `userBob`.
   * `userBob`'s `incomingRequests` contains `userAlice`.
   * No one is friends yet.
   * (Query `_getOutgoingRequests({ user: "user:Alice" })` returns `[{ target: "user:Bob" }]`)
   * (Query `_getIncomingRequests({ user: "user:Bob" })` returns `[{ requester: "user:Alice" }]`)

4. **Action**: (Optional) `userAlice` decides to remove the request before `userBob` takes action.
   ```
   Friending.removeFriendRequest({ requester: "user:Alice", target: "user:Bob" })
   ```

5. **State after Action 4**:
   * `userAlice`'s `outgoingRequests` is empty.
   * `userBob`'s `incomingRequests` is empty.
   * (Query `_getOutgoingRequests({ user: "user:Alice" })` returns `[]`)
   * (Query `_getIncomingRequests({ user: "user:Bob" })` returns `[]`)
   * *This demonstrates the ability to remove a request before acceptance.*

6. **Action**: Re-establish the request for the acceptance flow. `userAlice` sends a friend request to `userBob` again.
   ```
   Friending.sendFriendRequest({ user: "user:Alice", target: "user:Bob" })
   ```

7. **State after Action 6**: (Same as State after Action 3)
   * `userAlice`'s `outgoingRequests` contains `userBob`.
   * `userBob`'s `incomingRequests` contains `userAlice`.

8. **Action**: `userBob` accepts the friend request from `userAlice`.
   ```
   Friending.acceptFriendRequest({ requester: "user:Alice", target: "user:Bob" })
   ```

9. **State after Action 8**:
   * `userAlice`'s `friends` contains `userBob`.
   * `userBob`'s `friends` contains `userAlice`.
   * `userAlice`'s `outgoingRequests` is empty.
   * `userBob`'s `incomingRequests` is empty.
   * (Query `_getFriends({ user: "user:Alice" })` returns `[{ friend: "user:Bob" }]`)
   * (Query `_getFriends({ user: "user:Bob" })` returns `[{ friend: "user:Alice" }]`)
   * *This demonstrates forming a mutual friendship.*

10. **Action**: `userAlice` revokes the friendship with `userBob`.
    ```
    Friending.removeFriend({ user: "user:Alice", friend: "user:Bob" })
    ```

11. **State after Action 10**:
    * `userAlice`'s `friends` is empty.
    * `userBob`'s `friends` is empty.
    * (Query `_getFriends({ user: "user:Alice" })` returns `[]`)
    * (Query `_getFriends({ user: "user:Bob" })` returns `[]`)
    * *This demonstrates the revocation of friendship.*
