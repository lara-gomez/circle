---
timestamp: 'Mon Oct 27 2025 02:04:16 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_020416.96c7a6a1.md]]'
content_id: 6f5a74a5fe8134c384f391598d537216a9c57c11cc2087b168bf0267ff924978
---

# concept: UserInterest \[User, Item]

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
  * `addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)`
    * **requires**: tag is a non-empty String, there does not already exist a UserPersonalInterest associating the user to the given tag
    * **effects**: creates a UserPersonalInterest associating the user to the tag, and returns it

  * `removePersonalInterest (user: User, tag: String)`
    * **requires**: tag is a non-empty string, there exists a UserPersonalInterest associating the user to the given tag
    * **effects**: removes the UserPersonalInterest associating the user to the tag

  * `addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)`
    * **requires**: there does not already exist a UserItemInterest associating the user to the item
    * **effects**: creates a UserItemInterest associating the user to the tag, and returns it

  * `removeItemInterest (user: User, item: Item)`
    * **requires**: there exists a UserItemInterest associating the user to the given item
    * **effects**: removes the UserItemInterest associating the user to the item

* **queries**:
  * `_getPersonalInterests (user: User) : (tag: String)`
    * **requires**: user exists
    * **effects**: returns all personal interest tags associated with the user

  * `_getItemInterests (user: User) : (item: Item)`
    * **requires**: user exists
    * **effects**: returns all items the user has expressed interest in
