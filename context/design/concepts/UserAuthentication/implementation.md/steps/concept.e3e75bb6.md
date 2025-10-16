---
timestamp: 'Wed Oct 15 2025 19:34:19 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_193419.00a50414.md]]'
content_id: e3e75bb6a321c7154a4f82ab4b7efe8ec8c72f0be2e69cda0ecde97fde215270
---

# concept: UserAuthentication \[User]

**concept**: UserAuthentication \[User]

**purpose**: enable users to register and verify their identity using a username and password.

**principle**: If a user registers with a unique username and password, they can then authenticate using those same credentials to be identified as the registered user.

**state**:

```
a set of Users with
  a username String
  a password String
```

**actions**:

```
register (username: String, password: String): (user: User)

  requires: the username must not already exist in the system

  effects: create a new User with this username and password, returns the user

authenticate (username: String, password: String): (user: User)

  requires: there exists a user with the given username and password

  effects: the user is authenticated and will be treated each time as the same user; returns the registered user that matches with the given username and password
```

**queries**:

```
_getUsername (user: User) : (username: String)
  requires: user exists
  effects: returns the username associated with the user

_getUserByUsername (username: String) : (user: User) | (error: String)
  requires: a user with the given username exists
  effects: if a user with the given username exists, returns that user; otherwise returns an error
```
