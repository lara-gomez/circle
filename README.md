# Circle

**Circle** is a social event discovery platform that connects users with meaningful experiences through mutual friendships and shared interests.

## Project Overview

Circle helps users discover and organize events within their social network. Users can create events, connect with friends, express interests in activities and topics, and provide reviews on events they've attended. The application leverages concept-based design to create modular, reusable components that work together to deliver a cohesive user experience.

## Project Structure

- **`design/concepts/`** - Detailed concept specifications for all concepts
- **`design/learning/`** - Design documentation and learning notes for each concept
- **`design/interesting-moments.md`** - Key insights and challenges encountered during development
- **`design/updated-design.md`** - Design updates between Assignment 4a and 4b
- **`src/concepts/`** - TypeScript implementation of all concepts
- **`src/concept_server.ts`** - Main server file for running the application

## User Journey

A link to a demonstration of the user journey is found [here](https://drive.google.com/file/d/1n8MWCR2p7Wama9PSc3nkUXv12WkODf4s/view?usp=sharing). On this repo, it can be found at [final-user-journey.mp4](final-user-journey.mp4).

An associated trace can be found at [user-journey-trace.md](user-journey-trace.md).

## Design and Reflection

The final design doc is at [final-design-doc.md](final-design-doc.md).

My reflection is located in the file [reflection.md](reflection.md).


## Quick Start

### Deployed Application

The application has been deployed and can be accessed at [https://circle-0hd0.onrender.com](https://circle-0hd0.onrender.com).

### Running the Application
```shell
deno task concepts
```
The server will start on `localhost:8000`

### Running Tests
```shell
deno test -A
```
This will run all concept tests with all permissions enabled.

## Concepts

Circle is built on six core concepts that work together to create a comprehensive social event platform:

### Event [User]
**Purpose**: Enable users to organize, track, and facilitate the discovery of time-bound occurrences.

Events allow users to create, modify, cancel, and delete social gatherings. Each event has essential details like name, date, time, location, and description. Events automatically transition to "completed" status after they occur, and organizers can cancel and restore events as needed.

**Key Actions**:
- `createEvent` - Create a new event with details
- `modifyEvent` - Update event information
- `cancelEvent` / `unCancelEvent` - Manage event cancellation
- `deleteEvent` - Remove an event from the system
- `completeEvent` (system) - Automatically mark past events as completed

**Implementation**: [`src/concepts/Event/EventConcept.ts`](src/concepts/Event/EventConcept.ts)  
**Specification**: [`design/concepts/Event/Event.md`](design/concepts/Event/Event.md)  
**Design Notes**: [`design/learning/EventDesign.md`](design/learning/EventDesign.md)

---

### Friending [User]
**Purpose**: Enable users to establish and manage mutual social connections.

The Friending concept implements a request-based friendship system where users can send, accept, and remove friend requests. Once accepted, users become friends and can view each other's content and activities.

**Key Actions**:
- `sendFriendRequest` - Send a friend request to another user
- `acceptFriendRequest` - Accept an incoming friend request
- `removeFriendRequest` - Remove a pending friend request
- `removeFriend` - End a friendship

**Implementation**: [`src/concepts/Friending/FriendingConcept.ts`](src/concepts/Friending/FriendingConcept.ts)  
**Specification**: [`design/concepts/Friending/Friending.md`](design/concepts/Friending/Friending.md)  
**Design Notes**: [`design/learning/FriendingDesign.md`](design/learning/FriendingDesign.md)

---

### UserInterest [User, Item]
**Purpose**: Enable users to explicitly declare and manage their interests to personalize their experience.

Users can express interests in two ways: through personal interest tags (like "music", "sports") and by marking interest in specific items (events). This dual approach enables both broad and specific interest tracking.

**Key Actions**:
- `addPersonalInterest` / `removePersonalInterest` - Manage interest tags
- `addItemInterest` / `removeItemInterest` - Mark interest in specific items

**Implementation**: [`src/concepts/UserInterest/UserInterestConcept.ts`](src/concepts/UserInterest/UserInterestConcept.ts)  
**Specification**: [`design/concepts/UserInterest/UserInterest.md`](design/concepts/UserInterest/UserInterest.md)  
**Design Notes**: [`design/learning/UserInterestDesign.md`](design/learning/UserInterestDesign.md)

---

### Reviewing [User, Item]
**Purpose**: Enable users to provide qualitative and quantitative feedback on items.

Users can create, modify, and delete reviews for items (such as events) with both a numerical rating (0-10) and written feedback. This helps other users make informed decisions about attending events.

**Key Actions**:
- `addReview` - Create a review with rating and text
- `modifyReview` - Update an existing review
- `removeReview` - Delete a review

**Implementation**: [`src/concepts/Reviewing/ReviewingConcept.ts`](src/concepts/Reviewing/ReviewingConcept.ts)  
**Specification**: [`design/concepts/Reviewing/Reviewing.md`](design/concepts/Reviewing/Reviewing.md)  
**Design Notes**: [`design/learning/ReviewingDesign.md`](design/learning/ReviewingDesign.md)

---

### UserAuthentication [User]
**Purpose**: Enable users to register and verify their identity using a username and password.

Handles user registration and authentication, ensuring unique usernames and secure credential verification.

**Key Actions**:
- `register` - Create a new user account
- `authenticate` - Verify user credentials

**Implementation**: [`src/concepts/UserAuthentication/UserAuthenticationConcept.ts`](src/concepts/UserAuthentication/UserAuthenticationConcept.ts)  
**Specification**: [`design/concepts/UserAuthentication/UserAuthentication.md`](design/concepts/UserAuthentication/UserAuthentication.md)  
**Design Notes**: [`design/learning/UserAuthenticationDesign.md`](design/learning/UserAuthenticationDesign.md)

---

### LikertSurvey (Sample Concept)
**Purpose**: Enable collection of opinion data using Likert-scale questions.

This is a sample concept included for demonstration purposes. It shows how to implement survey-style data collection with scale-based responses.

**Implementation**: [`src/concepts/LikertSurvey/LikertSurveyConcept.ts`](src/concepts/LikertSurvey/LikertSurveyConcept.ts)  
**Specification**: [`design/concepts/LikertSurvey/LikertSurvey.md`](design/concepts/LikertSurvey/LikertSurvey.md)

---

## Documentation & Resources

### Design Evolution
- **`design/updated-design.md`** - Documents the design refinements made between Assignment 4a and 4b
- **`design/interesting-moments.md`** - Chronicles key insights and challenges from the development process, including:
  - TypeScript type resolution issues
  - Testing strategy refinements
  - Precondition ordering considerations
  - Event testing with date handling
  - Recommending concept brainstorming

### API Specifications
Each concept has a detailed API specification document:
- [`design/concepts/Event/event-api-spec.md`](design/concepts/Event/event-api-spec.md)
- [`design/concepts/Friending/friending-api-spec.md`](design/concepts/Friending/friending-api-spec.md)
- [`design/concepts/Reviewing/reviewing-api-spec.md`](design/concepts/Reviewing/reviewing-api-spec.md)
- [`design/concepts/UserAuthentication/userauth-api-spec.md`](design/concepts/UserAuthentication/userauth-api-spec.md)
- [`design/concepts/UserInterest/userinterest-api-spec.md`](design/concepts/UserInterest/userinterest-api-spec.md)

---

# Setup (Prep)

This project was created as part of 6.104 Assignment 4: Implementing Concepts. Below are the setup instructions for working with the Context tool and running the Circle application.

## 0. Fork this repository

First, [fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo#forking-a-repository) this repository, and **rename** it to your desired project name, and give a description of your project.

## 1. Install Deno

[Install from Deno's website](https://deno.com)

Deno is a successor to Node.js (by the same creator, Ryan Dahl) that greatly simplifies tooling, is more secure by default, and is backwards-compatible with the larger ecosystem. Check out Deno's [extensive documentation](https://docs.deno.com/runtime/) for various helpful guides on a wide variety of common application needs and [integrations](https://docs.deno.com/examples/).

**Note:** when importing from `npm` packages, prefix with `npm:` as in: 
```typescript
import { MongoClient } from "npm:mongo"
```

For VSCode users, consider also installing the Deno [extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) and referring to the [docs](https://docs.deno.com/runtime/reference/vscode/) if you'd like to configure behavior.
## 2. Compile Context

To create a convenient binary, run the following command from the root of the directory:
```shell
deno compile -A --output ctx .ctx/context.ts
```

## 3. Setup Gemini

Copy or change `.env.template` to the environment file: `.env` and insert your Gemini API key:

```env
GEMINI_API_KEY=YOUR_KEY_HERE
GEMINI_MODEL=gemini-2.5-flash
```
You can choose any [models](https://ai.google.dev/gemini-api/docs/models) using `GEMINI_MODEL`, such as `gemini-2.5-flash-lite` for faster responses, or `gemini-2.5-pro` for higher quality.

You may also edit the `./geminiConfig.json` file to change the parameters according to any of the [GenerationConfig](https://ai.google.dev/api/generate-content#v1beta.GenerationConfig) options, including turning on/off thinking, limiting tokens, etc.

## 4. Setup your MongoDB Atlas Cluster (free)

For this project, we'll be using MongoDB as the database. To get started, use either the slides or the instructions:
### Slides
[MongoDB Setup](https://docs.google.com/presentation/d/1DBOWIQ2AAGQPDRgmnad8wN9S9M955LcHYZQlnbu-QCs/edit?usp=sharing)
### Instructions
1. Create your [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account.
2. When selecting a template, choose the __free__ option, M0.
4. At the Security Quickstart page, select how you want to authenticate your connection and keep the rest of the defaults. Make sure to allow access to all IPs as shown in [this slide](https://docs.google.com/presentation/d/1DBOWIQ2AAGQPDRgmnad8wN9S9M955LcHYZQlnbu-QCs/edit?usp=sharing).
5. Once created, click the __CONNECT__ button, select __driver__, and copy the srv connection string. If using username and password, the url should look something like this: `mongodb+srv://<username>:<password>@cluster0.p82ijqd.mongodb.net/?retryWrites=true&w=majority`. Make sure to replace username and password with your actual values.
6. Add your connection url (without `<` and `>`) to `MONGODB_URL=<connection url>` to your `.env` file. 
7. Give your database a name under `DB_NAME=<your database name>`.

## 5. Install Obsidian

[Obsidian](https://obsidian.md)

Obsidian is an open-source Markdown editor and personal knowledge management solution. The Context tool **does not** require use of Obsidian, and you may use any preferred editor, but we highly recommend using Obsidian to navigate your assignment and the generated context to write, view, and structure your prompts and design documents. 

### Link settings

This should be correctly set already, but under Obsidian -> Settings -> Files and links, make sure that:
1. `New link format` is set to `Relative path to file`
2. `Use [[Wikilinks]]` is disabled
3. `Detect all file extensions` is enabled (so you can easily view code and drop links to code files)

![](media/obsidian_settings.png)

# Exercise 0 

Context is a simple Markdown-based framework for building design knowledge and collaborating with an LLM. There is no additional syntax: any text-based repository with code of any language with documentation written as Markdown is compatible.

## 0. Note

**Important:** do not delete or modify anything from the `context` directory. Content is hashed by ID, meaning that corruption can be detected, but not recovered from automatically. This pairs nicely with git in case you mess up, so don't forget to commit once in a while!

## 1. Getting started with Context

Context allows you to treat any Markdown document as a conversation with an LLM: everything in the document is exactly what both you and the LLM sees. Each step is broken up by `# Heading 1` sections, and you should begin every new prompt or chunk of interesting information using a new section 1 heading. 

### Task:

In `design/brainstorming/questioning.md`, complete the `# prompt: Why ... ?` with your burning question for the universe. Then, from the root of the repository, run this command in the terminal (if you're using Obsidian, you should be able to copy the command by clicking on `Shell` in the top right):

```shell
./ctx prompt design/brainstorming/questioning.md
```

You should see any thinking appear in the terminal, with the rest of the completion streamed into the file. In general, you can `prompt` a LLM to chime in with 

```shell
./ctx prompt <path_to_file>.md
```

where `<path_to_file>` is also a link **relative to the root** of the repository.

## 2. Including context

You can **include** other documents to embed their contents, allowing you to compose exactly the context that you want. In Obsidian's file explorer on the left, expand the `design/background` and `design/learning` folders, then click on `understanding-concepts`. This should open a blank document.

### Task:

Drag and drop `concept-design-overview` into the body of `understanding-concepts`. This should show up as a normal link. Then, to make it a link that Context will include, simply add the `@` sign to the beginning of the link text (the part in the brackets), like so:

![](media/linking.png)

**Important:** includes should be on their own paragraph - make sure that there's an empty line between them and other content. 

Next, type `# question: ...` and fill in any question you have about concepts, then prompt through Context. 

**Tip:** you can easily get the relative link you need to paste into a terminal after `./ctx prompt` by right/ctrl clicking the file in the explorer directly:

![](media/relative_linking.png)

## 3. Viewing context

The `context` directory is an immutable and complete history of every file that the tool interacts with - this means that you shouldn't be afraid of editing or deleting files! This directory is a mirror of the rest of the repository, just nested one layer deeper. In addition, files such as `understanding-concepts.md` become a directory, as in `understanding-concepts.md/` and contain a timestamped version of its entire history. 

### Context folders

Each Markdown file within these directories have the format `timestamp.hash_id.md`, where the `hash_id` is a **content-based hash** that helps you identify, across the entire repository, usages of the same document or content. 

### Individual steps

Inside the `steps` directory one layer deeper are granular files of the form `step.hash_id.md` that contain all the unique steps (`# heading 1` blocks) ever present in the file. This helps identify at-a-glance what the contents of each document are, such as prompts or responses. By default, the `step` in the file name is a `_` character, unless the heading contains a prefix of the form `# prefix: ...`, which can be a useful way to break up a document (that you can follow yourself, or prompt an LLM to do so).

**Important:** this is the reason for the previous warning about not modifying the `context` directory. The content-based hashes means we can detect such edits/deletes, but the more important point is that you keep a legible history of your design choices and explorations (which can be invaluable for prompting!)

### Task:

1. Consider again `design/brainstorming/questioning`, and **find** the version of the document in `context` containing the LLM's response. Note that `ctx prompt` will save both a before and after version. Drag or insert a link to this in `design/learning/exercise-0`
2. Go back to `questioning`, and **edit** the response to put in your own typed answer. **Tip:** you can collapse the entire response heading (hover to the left of the heading, and click the downwards arrow) and select it quickly to delete the entire block.
3. Use `./ctx save <link_to_questioning.md>` to manually **save** the file to `context`, then find the updated version and link to it in the `exercise-0` document.
4. Use Context to save `exercise-0` as well. (Optional): delete any of these files - if you've properly saved/prompted, we'll be able to find it in the context. We encourage you to continue to prompt/save your brainstorming and learning, and they will help with finding interesting moments for your assignment!

**Note:** `ctx save` is only necessary if you manually edit files, such as your second response to `questioning` or your solutions that you copy paste into `exercise-0`. Any time you `ctx prompt`, both the before and after versions are automatically saved.
# Working with Circle

This project uses the Context tool for design and development. All design documents and implementation notes are organized in the `design/` directory and can be explored using the Context CLI.

## Design Documentation

- **`design/background`**: Background knowledge about concept design and TypeScript implementation
- **`design/brainstorming`**: Early brainstorming and ideation for each concept
- **`design/concepts`**: Formal concept specifications for all implemented concepts
- **`design/learning`**: Key learnings and design decisions for each concept
- **`design/interesting-moments.md`**: Important insights from the development process
- **`design/updated-design.md`**: Changes made between Assignment 4a and 4b

## Development Process

Circle was developed using concept-based design with LLM assistance through the Context tool. Each concept follows a rigorous design-to-implementation process:

1. **Specification** - Define the concept's purpose, state, actions, and principles
2. **Implementation** - Translate the specification to TypeScript with MongoDB
3. **Testing** - Create comprehensive tests to validate the concept's behavior

### Testing

All concepts include comprehensive test suites that verify:
- Basic operations and CRUD functionality
- Precondition enforcement
- Edge cases and error handling
- Operational principles

To run all tests:

```shell
deno test -A
```

The `-A` flag grants all permissions. For more granular permission control, see [Deno's security documentation](https://docs.deno.com/runtime/fundamentals/security/).

To run tests for a specific concept:

```shell
deno test -A src/concepts/Event/EventConcept.test.ts
deno test -A src/concepts/Friending/FriendingConcept.test.ts
deno test -A src/concepts/Reviewing/ReviewingConcept.test.ts
deno test -A src/concepts/UserAuthentication/UserAuthenticationConcept.test.ts
deno test -A src/concepts/UserInterest/UserInterestConcept.test.ts
```

**Note**: Tests use temporary MongoDB collections that are wiped clean before each test run.

### Tips for including code in Context

Since `.ts` files don't show up in Obsidian, VSCode has a similar option where you can right/ctrl click a code file, and `Copy Relative Path` to get a repo-based link to include in your context. 

Context understands both the relative links generated by default when dragging files in Obsidian, as well as repo-based links. When you copy-paste these kinds of links from outside sources, you'll need to additionally prepend the link with a `/` to tell Context that it should look it up from the repo root:
```md
[@MyConceptImplementation](/src/concepts/MyConcept.ts)
```

This also turns out to be the same convention that Github uses, so you'll be able to navigate your links there too!

