---
timestamp: 'Thu Oct 16 2025 03:09:32 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_030932.255c91cd.md]]'
content_id: 90e9ca880f73ebdf4717e9ec1ff3f0fe6dcdeda6a2e9e329b7e28f35d4f2c64c
---

# prompt: I am testing my friending concept below, but failing some of my tests due to the specific order of error messages. would it be valid to rewrite my tests to succeed if there is an error, instead of checking which error comes first, or should i modify my test or the order my code is written in. the specific test failure is below:

Action: acceptFriendRequest preconditions and effects ... Fails when users are already friends => ./src/concepts/Friending/FriendingConcept.test.ts:165:13
error: AssertionError: Values are not equal.

```
[Diff] Actual / Expected
```

* No pending friend request from requester to target.

- Users are already friends.
