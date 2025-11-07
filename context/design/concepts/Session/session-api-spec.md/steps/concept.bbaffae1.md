---
timestamp: 'Fri Nov 07 2025 14:05:59 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_140559.17f1615e.md]]'
content_id: bbaffae14826082c04ea186ae258e60e888c8628190a0997f35bea0b45540a5e
---

# concept: Session \[User]

* **concept**: Sessioning \[User]

* **purpose**: maintain a user's logged-in state across multiple requests without re-sending credentials.

* **principle**: if a session is created for a user, then that user's identity can be consistently retrieved via the session in subsequent interactions, until the session is deleted.

* **state**:
  * a set of Sessions with
    * a user User

* **actions**:
  * create (user: User): (session: Session)
    * effects: a new session is created; the session is associated with the given user; returns the session created

  * delete (session: Session)
    * requires: the given session exists
    * effects: the session is removed

* **queries**:
  * \_getUser (session: Session): (user: User)
    * requires: the given session exists
    * effects: returns the user associated with the session.
