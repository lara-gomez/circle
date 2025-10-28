---
timestamp: 'Mon Oct 27 2025 22:19:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251027_221952.47d8dd5d.md]]'
content_id: 868bdfbfba6a3e9cec1930bc8bfcfce9eddcd102b985f1cdd0e910b8b051728f
---

# response:

### POST /api/UserInterest/\_getUsersInterestedInItems

**Description:** Retrieves all users interested in a given item.

**Requirements:**

* The item exists (implicitly, as the query will return an empty array if no interests are found for it).

**Effects:**

* Returns an array of dictionaries, each containing a 'user' field with the ID of a user interested in the item.

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
    "user": "ID"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
