---
timestamp: 'Wed Oct 15 2025 00:41:03 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_004103.3a1ef196.md]]'
content_id: 433b4a9666501b7a650f514f440e4e98a17a53fc173d68e3bdea43c59f233493
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
```

**actions**:

```
register (username: String, password: String): (user: User)
register (username: String, password: String): (error: String)

login (username: String, password: String): (user: User)
login (username: String, password: String): (error: String)
```

**queries**:

```
_getUsername (user: User) : (username: String)
_getUserByUsername (username: String) : (user: User)
```
