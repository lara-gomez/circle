---
timestamp: 'Wed Oct 15 2025 19:22:34 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_192234.6fc7b064.md]]'
content_id: aa52196a1126bf2d692a6190dab7fc53422a2eae8a7c27f970372499a8022496
---

# concept: UserAuthentication \[User] (Revised Specification for Hashing)

**concept**: UserAuthentication \[User]

**purpose**: enable users to register and verify their identity using a username and password.

**principle**: If a user registers with a unique username, salt, and hashed password, they can then authenticate using their original plain-text username and password to be identified as the registered user.

**state**:

```
a set of Users with
  a username String
  a hashedPassword String
  a salt String
```

**actions**:

```
register (username: String, password: String): (user: User) | (error: String)

  requires: the username must not already exist in the system

  effects: create a new User; generate a unique salt; hash the provided password with the salt; store the username, hashed password, and salt; returns the user ID

authenticate (username: String, password: String): (user: User) | (error: String)

  requires: there exists a user with the given username and the provided password matches the stored hashed password (after re-hashing with the stored salt)

  effects: if credentials are valid, returns the ID of the registered user; otherwise, returns an error.
```

**queries**:

```
_getUsername (user: User) : (username: String) | (error: String)
  requires: user exists
  effects: returns the username associated with the user, or an error if the user is not found

_getUserByUsername (username: String) : (user: User) | (error: String)
  requires: a user with the given username exists
  effects: if a user with the given username exists, returns that user's ID; otherwise returns an error
```

***
