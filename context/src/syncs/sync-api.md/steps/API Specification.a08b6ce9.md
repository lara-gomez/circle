---
timestamp: 'Fri Nov 07 2025 17:42:17 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_174217.3a28eaf9.md]]'
content_id: a08b6ce944153c02c96b64996520712b67c7347c4f810456a9fda4ae1835ce2e
---

# API Specification: Reviewing Concept

**Purpose:** enable users to provide qualitative and quantitative feedback on items

***

## API Endpoints

### POST /api/Reviewing/addReview

**Description:** Adds a new review by a user for a specific item.

**Requirements:**

* no review by user for this item exists.
* rating is a value between 0 and 10.

**Effects:**

* creates a review by the user for this item with the given rating and text entry, returns the created review's ID.

**Request Body:**

```json
{
  "user": "string (User ID)",
  "item": "string (Item ID)",
  "rating": "number",
  "entry": "string"
}
```

**Success Response Body (Action):**

```json
{
  "review": "string (Review ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Reviewing/removeReview

**Description:** Removes an existing review by a user for a specific item.

**Requirements:**

* a review by the user for this item exists.

**Effects:**

* deletes the review that is associated with the given user and item.

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

### POST /api/Reviewing/modifyReview

**Description:** Modifies an existing review by a user for a specific item.

**Requirements:**

* a review by the user for this item exists.
* rating is a value between 0 and 10.

**Effects:**

* modifies the review with the given fields for the rating and entry, returns the modified review's ID.

**Request Body:**

```json
{
  "user": "string (User ID)",
  "item": "string (Item ID)",
  "rating": "number",
  "entry": "string"
}
```

**Success Response Body (Action):**

```json
{
  "review": "string (Review ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Reviewing/\_getReview

**Description:** Retrieves a single review by a user for a specific item.

**Requirements:**

* a review exists for the given user and item.

**Effects:**

* returns the structured review associated with the given user and item.

**Request Body:**

```json
{
  "user": "string (User ID)",
  "item": "string (Item ID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "review": {
      "id": "string (Review ID)",
      "reviewer": "string (User ID)",
      "target": "string (Item ID)",
      "rating": "number",
      "entry": "string"
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

***

### POST /api/Reviewing/\_getReviewsByItem

**Description:** Retrieves all reviews for a specific item.

**Requirements:**

* none

**Effects:**

* returns all reviews targeting the given item.

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
    "review": {
      "id": "string (Review ID)",
      "reviewer": "string (User ID)",
      "target": "string (Item ID)",
      "rating": "number",
      "entry": "string"
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

***

### POST /api/Reviewing/\_getReviewsByUser

**Description:** Retrieves all reviews authored by a specific user.

**Requirements:**

* none

**Effects:**

* returns all reviews authored by the given user.

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
    "review": {
      "id": "string (Review ID)",
      "reviewer": "string (User ID)",
      "target": "string (Item ID)",
      "rating": "number",
      "entry": "string"
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

***
