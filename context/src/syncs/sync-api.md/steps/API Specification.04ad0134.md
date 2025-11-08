---
timestamp: 'Fri Nov 07 2025 17:42:17 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_174217.3a28eaf9.md]]'
content_id: 04ad0134689d58e93aff46c27b2592df3f80f86802479bc14539298f5bee2b82
---

# API Specification: UserAuthentication Concept

**Purpose:** enable users to register and verify their identity using a username and password.

***

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Creates a new user with the provided username and password.

**Requirements:**

* the username must not already exist in the system

**Effects:**

* creates a new User with this username and password
* returns the user

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**

```json
{
  "user": "string (User ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserAuthentication/authenticate

**Description:** Verifies user credentials and returns the user ID if authenticated.

**Requirements:**

* there exists a user with the given username and password

**Effects:**

* returns the registered user that matches with the given username and password

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**

```json
{
  "user": "string (User ID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserAuthentication/\_getUsername

**Description:** Retrieves the username associated with a given user ID.

**Requirements:**

* user exists

**Effects:**

* returns the username associated with the user

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
    "username": "string"
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

### POST /api/UserAuthentication/\_getUserByUsername

**Description:** Retrieves the user ID associated with a given username.

**Requirements:**

* a user with the given username exists

**Effects:**

* if a user with the given username exists, returns that user; otherwise returns an error

**Request Body:**

```json
{
  "username": "string"
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
