# Final Design Document

## Overview
Throughout this project, my design evolved from a set of broad, overlapping concepts into a focused, modular architecture. Compared to *Assignment 2*, my final design emphasizes **single-responsibility concepts**, **clear contracts**, and **cross-concept coordination through syncs** rather than within individual implementations. Each concept now encapsulates one primary responsibility, improving testability, readability, and maintainability.

---

## Key Concept Changes

### **Event**
- **Refined scope:** Renamed from `EventManagement` to `Event` to better align with its singular purpose.  
- **Modular actions:** Split generic event edits from explicit status transitions such as *cancel*, *uncancel*, and *complete*.  
- **Improved testing:** Time-based guards initially complicated testing, so I adapted my approach to include more deterministic checks and mock data.  
- **Outcome:** The concept now supports clear state transitions and simpler unit testing without hidden dependencies.

---

### **Friending**
- **Extracted logic:** Originally part of a large `UserProfile` concept, now isolated into a standalone module.  
- **Defined flows:** Added explicit request, accept, and remove operations to make friendship management transparent and verifiable.  
- **Iterated on validation:** Naming conventions and validation logic were refined after feedback and multiple test failures.  
- **Outcome:** The friending process became predictable, with clearer action outcomes and improved error handling.

---

### **Reviewing**
- **Decoupled dependency:** Moved out of `EventParticipation` so that review functionality no longer depends on attendance logic.  
- **Shifted coordination:** Moved synchronization handling to the sync layer, aligning better with concept-based design principles.  
- **Outcome:** Created a cleaner separation between participation and feedback, reducing cross-dependencies and potential circular logic.

---

### **UserInterest**
- **Unified tracking:** Merged previously scattered interest-tracking behaviors (participation, bookmarks, personal interests) into a single coherent concept.  
- **Scoped purpose:** Avoided overextending this concept beyond its core function of supporting recommendations.  
- **Outcome:** Simplified recommendation queries and reduced redundancy across user-related features.

---

### **UserAuthentication**
- **Newly introduced:** Added an explicit authentication concept to handle login and registration.  
- **Separated concerns:** Isolated session state from authentication logic, ensuring modularity and clear boundaries.  
- **Outcome:** Simplified user-related flows and increased security clarity by keeping authentication concerns distinct.

### **Session**
- **Newly introduced** Created a completely new concept from assignment 4c. Previously relied on local storage management on the frontend, but found it more manageable to have a session concept for syncs and better security/authorization overall.

---

## Visual Design

While I did not change my **visual design** from *Assignment 4B* to this submission, I made meaningful improvements between my **initial 4B check-in** and the final version to make it more modular and visually balanced.  

- **Color palette:** I moved away from the overwhelmingly green tones of the earlier version and incorporated a more **neutral and modern palette**. This shift was inspired by modern websites that rely on **white backgrounds with subtle accents of color**, which feel cleaner and more approachable.  
- **Design refinement:** I used a **trending palette from Coolors** that struck a balance — not too vibrant, but colorful enough to maintain visual interest.  
- **Outcome:** The result was a calmer, more professional interface that better matched the tone of my application and reflected current design trends.

---

## Overall Takeaways

- **From Monolithic to Modular:** Each concept now stands independently, following single-responsibility principles.  
- **Clear Contracts:** Defined explicit actions and error handling for more predictable behavior.  
- **Cross-Concept Coordination:** Shifted policies and coordination logic into syncs instead of embedding them in concept code.  
- **Improved AI Integration:** By refining prompts and conceptual structure, AI tools like Cursor became more reliable in generating usable, high-quality code.

In short, this final design represents a transition from broad, interdependent implementations to **modular, testable, and maintainable concepts**—a shift that made both development and debugging far more efficient.
