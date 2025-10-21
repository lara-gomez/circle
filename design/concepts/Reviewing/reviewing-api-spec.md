[@api-extraction-from-code](../../tools/api-extraction-from-code.md)

[@api-extraction-from-spec](../../tools/api-extraction-from-spec.md)

[@concept-definition](Reviewing.md)

[@concept-implementation](implementation.md)

# prompt: generate the API documentation for the Reviewing concept, use the implementation reference
# response:

# API Specification: Reviewing Concept

**Purpose:** enable users to provide qualitative and quantitative feedback on items

---

## API Endpoints

### POST /api/Reviewing/addReview

**Description:** Adds a new review by a user for a specific item.

**Requirements:**
- no review by user for this item exists.
- rating is a value between 0 and 10.

**Effects:**
- creates a review by the user for this item with the given rating and text entry, returns the created review's ID.

**Request Body:**
```json
{
  "user": "ID",
  "item": "ID",
  "rating": "Number",
  "entry": "String"
}
```

**Success Response Body (Action):**
```json
{
  "review": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Reviewing/removeReview

**Description:** Removes an existing review by a user for a specific item.

**Requirements:**
- a review by the user for this item exists.

**Effects:**
- deletes the review that is associated with the given user and item.

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

### POST /api/Reviewing/modifyReview

**Description:** Modifies an existing review by a user for a specific item.

**Requirements:**
- a review by the user for this item exists.
- rating is a value between 0 and 10.

**Effects:**
- modifies the review with the given fields for the rating and entry, returns the modified review's ID.

**Request Body:**
```json
{
  "user": "ID",
  "item": "ID",
  "rating": "Number",
  "entry": "String"
}
```

**Success Response Body (Action):**
```json
{
  "review": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Reviewing/_getReview

**Description:** Retrieves a single review by a user for a specific item.

**Requirements:**
- a review exists for the given user and item.

**Effects:**
- returns the structured review associated with the given user and item.

**Request Body:**
```json
{
  "user": "ID",
  "item": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "review": {
      "id": "ID",
      "reviewer": "ID",
      "target": "ID",
      "rating": "Number",
      "entry": "String"
    }
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

### POST /api/Reviewing/_getReviewsByItem

**Description:** Retrieves all reviews for a specific item.

**Requirements:**
- (None)

**Effects:**
- returns all reviews targeting the given item.

**Request Body:**
```json
{
  "item": "ID"
}
```

**Success Response Body (Query):**
```json
[
  {
    "review": {
      "id": "ID",
      "reviewer": "ID",
      "target": "ID",
      "rating": "Number",
      "entry": "String"
    }
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

### POST /api/Reviewing/_getReviewsByUser

**Description:** Retrieves all reviews authored by a specific user.

**Requirements:**
- (None)

**Effects:**
- returns all reviews authored by the given user.

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
    "review": {
      "id": "ID",
      "reviewer": "ID",
      "target": "ID",
      "rating": "Number",
      "entry": "String"
    }
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