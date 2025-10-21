---
timestamp: 'Sun Oct 19 2025 18:28:04 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_182804.e3ef01d5.md]]'
content_id: 30401f316d82ba8089d77fe90ea9bbeed5da04f590fdcc4c1710c79526d53191
---

# response:

````markdown
# 6.104 Assignment 4: Implementing Concepts

This repository serves as the working environment for 6.104 Assignment 4, focusing on implementing concepts in TypeScript using Deno and MongoDB. It leverages a custom CLI tool named `Context` for collaborative design with LLMs and maintaining a comprehensive history of design decisions and iterations.

## Table of Contents

1.  [Setup](#setup)
    *   [1. Install Deno](#1-install-deno)
    *   [2. Compile Context](#2-compile-context)
    *   [3. Setup Gemini](#3-setup-gemini)
    *   [4. Setup MongoDB Atlas](#4-setup-mongodb-atlas-free)
    *   [5. Install Obsidian (Recommended)](#5-install-obsidian-recommended)
2.  [Working with Context](#working-with-context)
    *   [Prompting LLMs](#prompting-llms)
    *   [Including Context](#including-context)
    *   [Viewing Context History](#viewing-context-history)
    *   [Manually Saving Context](#manually-saving-context)
3.  [Project Structure and Key Files](#project-structure-and-key-files)
    *   [Design Documents (`design/`)](#design-documents-design)
    *   [Concept Implementations (`src/concepts/`)](#concept-implementations-srcconcepts)
    *   [Tests (`src/tests/` or alongside concepts)](#tests-srctests-or-alongside-concepts)
    *   [Immutable History (`context/`)](#immutable-history-context)
4.  [Implementing Your Concepts](#implementing-your-concepts)
5.  [Running Tests](#running-tests)
6.  [Finding Interesting Moments](#finding-interesting-moments)
7.  [Sample Concept: LikertSurvey](#sample-concept-likertsurvey)

---

## Setup

Follow these steps to get your development environment ready.

### 0. Fork this repository

[Fork this repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo#forking-a-repository) and rename it to your desired project name.

### 1. Install Deno

Install Deno from [Deno's official website](https://deno.com). Deno simplifies TypeScript development with built-in tooling and enhanced security.

**Note for npm packages:** When importing npm packages, use the `npm:` prefix (e.g., `import { MongoClient } from "npm:mongo"`).

**VSCode Users:** Consider installing the Deno [extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno).

### 2. Compile Context

Compile the `Context` CLI tool for convenient use:

```shell
deno compile -A --output ctx .ctx/context.ts
````

This creates an executable named `ctx` in your project root.

### 3. Setup Gemini

1. Copy or rename `.env.template` to `.env`.
2. Insert your Gemini API key:
   ```env
   GEMINI_API_KEY=YOUR_KEY_HERE
   GEMINI_MODEL=gemini-2.5-flash
   ```
   You can adjust `GEMINI_MODEL` to `gemini-2.5-pro` for higher quality or `gemini-2.5-flash-lite` for faster responses.
3. Optionally, modify `./geminiConfig.json` to fine-tune `GenerationConfig` parameters.

### 4. Setup your MongoDB Atlas Cluster (free)

1. Create a [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register).
2. Choose the **free M0 tier**.
3. In the Security Quickstart, select your authentication method (username/password recommended) and ensure you **allow access from all IPs**.
4. Once the cluster is created, click **CONNECT**, select **driver**, and copy the `srv` connection string.
5. Add your connection URL to `.env`:
   ```env
   MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.p82ijqd.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=<your_database_name>
   ```
   (Remember to replace `<username>`, `<password>`, and `<your_database_name>` with your actual values.)

### 5. Install Obsidian (Recommended)

[Install Obsidian](https://obsidian.md). While not strictly required, Obsidian is highly recommended for navigating and structuring your design documents and generated context.

**Obsidian Settings Check:**
Go to Settings -> Files and links, and ensure:

* `New link format` is `Relative path to file`
* `Use [[Wikilinks]]` is disabled
* `Detect all file extensions` is enabled

## Working with Context

`Context` is a Markdown-based framework for design knowledge and LLM collaboration. It uses standard Markdown, breaking steps into `# Heading 1` sections.

### Prompting LLMs

To engage the LLM with the content of a Markdown file:

```shell
./ctx prompt <path_to_file>.md
```

The LLM's thinking appears in the terminal, and its completion is streamed directly into the file.

### Including Context

You can embed the content of other Markdown files by using `@` in the link text:

```markdown
[@MyIncludedDocument](design/concepts/MyIncludedDocument.md)
```

**Important:** Includes should be on their own paragraph, separated by empty lines. For embedded previews in Obsidian, prepend with `!` (e.g., `![@MyIncludedDocument](...)`).

### Viewing Context History

The `context/` directory stores an immutable, complete history of every file `Context` interacts with. Files are saved with timestamps and `hash_id` (a content-based hash), allowing you to trace changes and references. Each Markdown file becomes a directory (e.g., `context/design/concepts/MyConcept.md/`) containing timestamped versions. The `steps/` subdirectory within these contains individual `# Heading 1` blocks.

### Manually Saving Context

Any time you `ctx prompt`, both the before and after versions of the file are automatically saved. If you manually edit a file and want to save that state to the history, use:

```shell
./ctx save <path_to_file>.md
```

**Important:** Do not modify or delete files directly within the `context/` directory, as this can corrupt the content-based hashing and history.

***

## Project Structure and Key Files

This repository is organized to facilitate the design, implementation, and documentation of concepts.

### Design Documents (`design/`)

This directory is where all your design knowledge, brainstorming, concept specifications, and learning moments are stored.

* **`design/background/`**: Contains foundational knowledge and useful prompts regarding concept design and TypeScript implementation. Treat these as documentation and potential starting points for LLM conversations.
* **`design/brainstorming/`**: Your scratchpad for initial ideas, free-form discussions with LLMs, and early-stage concept development.
* **`design/concepts/`**: The home for your finalized concept specifications. Each concept should ideally have its own Markdown document here, detailing its purpose, structure, and behavior.
* **`design/learning/`**: A place to record significant insights, design decisions, challenges encountered, and lessons learned throughout the implementation process. This forms a narrative of your project's development.

### Concept Implementations (`src/concepts/`)

This directory will contain the TypeScript source code for your implemented concepts. Each concept typically resides in its own `.ts` file.

* **Example:** `src/concepts/MyConcept.ts`

### Tests (`src/tests/` or alongside concepts)

Test files (named `*.test.ts`) can be placed within `src/tests/` or directly alongside their respective concept implementations (e.g., `src/concepts/MyConcept.test.ts`).

### Immutable History (`context/`)

This directory is an automatically managed mirror of your design documents, preserving an immutable history of every interaction, prompt, and manual save. It is crucial for reviewing your design evolution and understanding the decisions made. **DO NOT MODIFY THIS DIRECTORY MANUALLY.**

***

## Implementing Your Concepts

You are tasked with implementing your chosen concepts. You can leverage LLM assistance via `ctx prompt` in your design documents, or implement by hand and document your progress using `ctx save`.

1. **Start in `design/brainstorming/`**: Explore ideas and chat with the LLM.
2. **Reference `design/background/`**: Consult documents like `implementing-concepts.md` and `testing-concepts.md` for technical guidance.
3. **Refine in `design/concepts/`**: Develop detailed specifications for each concept.
4. **Implement in `src/concepts/`**: Write your TypeScript code. Remember to include your code files in your design documents using repo-based links (e.g., `[@MyConceptImplementation](/src/concepts/MyConcept.ts)`) for Context to properly track them.
5. **Test**: Write corresponding `*.test.ts` files.

***

## Running Tests

To execute all tests defined in `*.test.ts` files:

```shell
deno test -A
```

The `-A` flag grants all permissions, which is convenient for development but consider more scoped permissions for production. Running tests will create temporary collections in your MongoDB Atlas cluster within the test database, which are automatically wiped after each test run.

## Finding Interesting Moments

The `design/learning/` directory is specifically designated for capturing "interesting moments." As you progress, record significant decisions, unexpected challenges, elegant solutions, or key insights you gain. You can use prompts like `# summarize: extract the important lessons from everything above` on your brainstorming documents, then `ctx prompt` to distill information into `design/learning/`. This practice helps build a narrative of your design process and highlights crucial learning points.

## Sample Concept: LikertSurvey

A sample `LikertSurvey` concept is included under `design/concepts/LikertSurvey`. This serves as a reference for a fully specified and implemented concept. You can inspect its design document (`design/concepts/LikertSurvey/LikertSurvey.md`), which even links to its specific generation step in `context`, and its implementation (`src/concepts/LikertSurvey.ts`) and tests (`src/concepts/LikertSurvey.test.ts`). Feel free to delete or modify this example as needed for your project.

```
```
