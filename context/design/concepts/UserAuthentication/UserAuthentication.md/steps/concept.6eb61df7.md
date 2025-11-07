---
timestamp: 'Fri Nov 07 2025 13:04:19 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_130419.c5cf38b2.md]]'
content_id: 6eb61df714710410fc52fd2d4aeaf7fc5c0d5ee318e29b12d3ba65c34e8de9e7
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
  an isAuthenticated Flag
```

**actions**:

```
register (username: String, password: String): (user: User)

  requires: the username must not already exist in the system

  effects: create a new User with this username and password, returns the user

authenticate (username: String, password: String): (user: User)

  requires: there exists a user with the given username and password, the isAuthenticated flag must be False

  effects: returns the registered user that matches with the given username and password, sets the isAuthenticated flag to True

logout (username: String): (user: User)

  requires: there exists a user with the given username, the isAuthenticated flag must be True

  effects: sets the isAuthenticated flag to False, returns the user corresponding to the username
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
