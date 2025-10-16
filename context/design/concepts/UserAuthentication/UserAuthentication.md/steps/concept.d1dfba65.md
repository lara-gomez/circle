---
timestamp: 'Wed Oct 15 2025 18:41:29 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_184129.f85289e9.md]]'
content_id: d1dfba65a59e142aafffb227c8ade26ef53a991ee73dbee05ffc68318c7e2b8e
---

# concept: UserAuthentication \[User]

**concept**: UserAuthentication \[User]

**purpose**: enable users to register and verify their identity using a username and password.

**principle**: If a user registers with a unique username and password, they can then log in using those same credentials to be identified as the registered user.

**state**:

```
a set of Users with
  a username String
  a password String
  a loggedIn Flag
```

**actions**:

```
register (username: String, password: String): (user: User)

  requires: the username must not already exist in the system

  effects: create a new User with this username and password, returns the user


login (username: String, password: String): (user: User)

  requires: there exists a user with the given username and password, loggedIn is set to false

  effects: the user is logged in and will be treated each time as the same user, the loggedIn flag is set to true


logout (user: User)

  requires: the given user exists, the loggedIn flag is set to true

  effects: the user is logged out, the loggedIn flag is set to false
```

**queries**:

```
_getUsername (user: User) : (username: String)
_getUserByUsername (username: String) : (user: User)
```
