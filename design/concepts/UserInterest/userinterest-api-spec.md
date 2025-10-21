[@api-extraction-from-code](../../tools/api-extraction-from-code.md)

[@api-extraction-from-spec](../../tools/api-extraction-from-spec.md)

[@concept-definition](UserInterest.md)

[@concept-implementation](implementation.md)

# prompt: generate the API documentation for the UserInterest concept, use the implementation reference

# response:

# API Specification: UserInterest Concept

**Purpose:** enable users to explicitly declare and manage their interests, both in specific items and in general topics, to personalize their experience and facilitate content discovery.

---

## API Endpoints

### POST /api/UserInterest/addPersonalInterest

**Description:** Adds a personal interest (tag) for a user.

**Requirements:**
- tag is a non-empty String
- there does not already exist a UserPersonalInterest associating the user to the given tag

**Effects:**
- Creates a UserPersonalInterest associating the user to the tag, and returns its ID.

**Request Body:**
```json
{
  "user": "ID",
  "tag": "string"
}
```

**Success Response Body (Action):**
```json
{
  "personalInterest": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserInterest/removePersonalInterest

**Description:** Removes a personal interest (tag) for a user.

**Requirements:**
- tag is a non-empty string
- there exists a UserPersonalInterest associating the user to the given tag

**Effects:**
- Removes the UserPersonalInterest associating the user to the tag.

**Request Body:**
```json
{
  "user": "ID",
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
---

### POST /api/UserInterest/addItemInterest

**Description:** Adds an interest in a specific item for a user.

**Requirements:**
- there does not already exist a UserItemInterest associating the user to the item

**Effects:**
- Creates a UserItemInterest associating the user to the item, and returns its ID.

**Request Body:**
```json
{
  "user": "ID",
  "item": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "itemInterest": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserInterest/removeItemInterest

**Description:** Removes an interest in a specific item for a user.

**Requirements:**
- there exists a UserItemInterest associating the user to the given item

**Effects:**
- Removes the UserItemInterest associating the user to the item.

**Request Body:**
```json
{
  "user": "ID",
  "item": "ID"
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
---

### POST /api/UserInterest/_getPersonalInterests

**Description:** Retrieves all personal interests (tags) for a given user.

**Requirements:**
- The user exists (implicitly handled by returning an empty array if no interests are found).

**Effects:**
- Returns an array of UserPersonalInterestDoc objects.

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "ID",
    "user": "ID",
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
---

### POST /api/UserInterest/_getItemInterests

**Description:** Retrieves all item interests for a given user.

**Requirements:**
- The user exists (implicitly handled by returning an empty array if no interests are found).

**Effects:**
- Returns an array of UserItemInterestDoc objects.

**Request Body:**
```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "ID",
    "user": "ID",
    "item": "ID"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---