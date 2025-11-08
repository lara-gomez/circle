---
timestamp: 'Fri Nov 07 2025 17:42:17 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_174217.3a28eaf9.md]]'
content_id: 38b9cf90c744552133d49de70d389106ee3503d8750932f399744b0bb872dbf2
---

# API Specification: UserInterest Concept

**Purpose:** enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience and facilitate content discovery.

***

## API Endpoints

### POST /api/UserInterest/addPersonalInterest

**Description:** Adds a personal interest (tag) for a user.

**Requirements:**

* tag is a non-empty String
* there does not already exist a UserPersonalInterest associating the user to the given tag.

**Effects:**

* Creates a UserPersonalInterest associating the user to the tag, and returns its ID.

**Request Body:**

```json
{
  "user": "string (User ID)",
  "tag": "string"
}
```

**Success Response Body (Action):**

```json
{
  "personalInterest": "string (UserPersonalInterest ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserInterest/removePersonalInterest

**Description:** Removes a personal interest (tag) for a user.

**Requirements:**

* tag is a non-empty string
* there exists a UserPersonalInterest associating the user to the given tag.

**Effects:**

* Removes the UserPersonalInterest associating the user to the tag.

**Request Body:**

```json
{
  "user": "string (User ID)",
  "tag": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserInterest/addItemInterest

**Description:** Adds an interest in a specific item for a user.

**Requirements:**

* there does not already exist a UserItemInterest associating the user to the item.

**Effects:**

* Creates a UserItemInterest associating the user to the item, and returns its ID.

**Request Body:**

```json
{
  "user": "string (User ID)",
  "item": "string (Item ID)"
}
```

**Success Response Body (Action):**

```json
{
  "itemInterest": "string (UserItemInterest ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserInterest/removeItemInterest

**Description:** Removes an interest in a specific item for a user.

**Requirements:**

* there exists a UserItemInterest associating the user to the given item.

**Effects:**

* Removes the UserItemInterest associating the user to the item.

**Request Body:**

```json
{
  "user": "string (User ID)",
  "item": "string (Item ID)"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserInterest/\_getPersonalInterests

**Description:** Retrieves all personal interests (tags) for a given user.

**Requirements:**

* The user exists (implicitly handled by returning an empty array if no interests are found).

**Effects:**

* Returns an array of UserPersonalInterestDoc objects.

**Request Body:**

```json
{
  "user": "string (User ID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string (UserPersonalInterest ID)",
    "user": "string (User ID)",
    "tag": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserInterest/\_getItemInterests

**Description:** Retrieves all item interests for a given user.

**Requirements:**

* The user exists (implicitly handled by returning an empty array if no interests are found).

**Effects:**

* Returns an array of UserItemInterestDoc objects.

**Request Body:**

```json
{
  "user": "string (User ID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string (UserItemInterest ID)",
    "user": "string (User ID)",
    "item": "string (Item ID)"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserInterest/\_getUsersInterestedInItems

**Description:** Retrieves all users interested in a given item.

**Requirements:**

* The item exists (implicitly, as the query will return an empty array if no interests are found for it).

**Effects:**

* Returns an array of dictionaries, each containing a 'user' field with the ID of a user interested in the item.

**Request Body:**

```json
{
  "item": "string (Item ID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "user": "string (User ID)"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
