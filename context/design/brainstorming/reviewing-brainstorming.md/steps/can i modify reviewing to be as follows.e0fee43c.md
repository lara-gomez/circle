---
timestamp: 'Thu Oct 16 2025 22:05:13 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_220513.e58f7067.md]]'
content_id: e0fee43c273e94a2b5de66e62c7c6267670f81f9732df4b312ae0b59276c7832
---

# can i modify reviewing to be as follows:

concept: UserActivity \[User, Item]

purpose: allow users to track activity relating to items and provide feedback

principle: a user shows interest in an item, and can choose to remove the shown interest in the item. a user can then creates a review for an item containing a written entry and numerical rating; modify the entry and rating for this review if needed; the user can also delete their review.

state:

a set of Activities with
a user User
an item Item
an interest Flag
a set of Reviews

a set of Reviews with
a reviewer User
a target Item
a rating Number
an entry String
