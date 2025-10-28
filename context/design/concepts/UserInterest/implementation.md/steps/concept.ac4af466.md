---
timestamp: 'Mon Oct 27 2025 22:00:56 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_220056.5bd9883c.md]]'
content_id: ac4af4662e02fe9bd55f520c2739c8e460cdc3f12d64d512c9e26b6564ea75cf
---

# concept: UserInterest (updated)

* **concept**: UserInterest \[User, Item]
* **purpose**: enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience and facilitate content discovery.
* **principle**: a user wants to add their personal interests through a specific tag; they can remove this tag or add more tags whenever; they may also indicate interest in specific items and can similarly remove or add more interests in the future.
* **state**:
  * A set of `UserItemInterests` with
    * a `user` User
    * an `item` Item
  * A set of `UserPersonalInterests` with
    * a `user` User
    * a `tag` String
* **actions**:
  * `addPersonalInterest (user: User, tag: String): (personalInterest: UserPersonalInterest)`
    * **requires**: `tag` is a non-empty String, there does not already exist a `UserPersonalInterest` associating the user to the given tag
    * **effects**: creates a `UserPersonalInterest` associating the user to the tag, and returns it
  * `removePersonalInterest (user: User, tag: String)`
    * **requires**: `tag` is a non-empty string, there exists a `UserPersonalInterest` associating the user to the given tag
    * **effects**: removes the `UserPersonalInterest` associating the user to the tag
  * `addItemInterest (user: User, item: Item): (itemInterest: UserItemInterest)`
    * **requires**: there does not already exist a `UserItemInterest` associating the user to the item
    * **effects**: creates a `UserItemInterest` associating the user to the item, and returns it
  * `removeItemInterest (user: User, item: Item)`
    * **requires**: there exists a `UserItemInterest` associating the user to the given item
    * **effects**: removes the `UserItemInterest` associating the user to the item
* **queries**:
  * `_getPersonalInterests (user: User): (personalInterest: UserPersonalInterestDoc)`
    * **requires**: The user exists.
    * **effects**: Returns a set of all personal interests (tags) associated with the given user.
  * `_getItemInterests (user: User): (itemInterest: UserItemInterestDoc)`
    * **requires**: The user exists.
    * **effects**: Returns a set of all item interests associated with the given user.
  * `_getUsersInterestedInItems (item: Item): (user: User)`
    * **requires**: The item exists (implicitly, as the query will return an empty array if no interests are found for it).
    * **effects**: Returns a set of all users who have expressed interest in the given item.
