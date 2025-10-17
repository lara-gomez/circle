---
timestamp: 'Thu Oct 16 2025 22:49:36 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_224936.e2a265d7.md]]'
content_id: 48807f7ca1cee00dee1d4691024464be4bf8f02133b0a26ad53d27d310081b4c
---

# concept: UserInterest \[User]

* **concept**: UserInterest \[User, Item]

* **purpose**: enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience and facilitate content discovery.

* **principle**: a user wants to add their personal interests through a specific tag; they can remove this tag or add more tags whenever; they may also indicate interest in specific items and can similarly remove or add more interests in the future.

* **state**:
  * A set of `UserItemInterests` with
    * a user User
    * an item Item

  * A set of `UserPersonalInterests` with
    * a user User
    * a tag String

* **actions**:
  * addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)
    * requires: tag is a non-empty String, there does not already exist a UserPersonalInterest associating the user to the given tag
    * effects: creates a UserPersonalInterest associating the user to the tag, and returns it

  * removePersonalInterest (user: User, tag: String)
    * requires: tag is a non-empty string, there exists a UserPersonalInterest associating the user to the given tag
    * effects: removes the UserPersonalInterest associating the user to the tag

  * addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)
    * requires: there does not already exist a UserItemInterest associating the user to the item
    * effects: creates a UserItemInterest associating the user to the tag, and returns it

  * removeItemInterest (user: User, item: Item)
    * requires: there exists a UserItemInterest associating the user to the given item
    * effects: removes the UserItemInterest associating the user to the item
