---
timestamp: 'Thu Oct 16 2025 03:36:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_033653.213ad30c.md]]'
content_id: 47b3d417b027013b1e1ea1c11b5de9a3895f918353bf6140c96ee299449fa1ad
---

# Assignment 4a: Backend Concept Coding

## Overview

The big picture. Over the next four weeks, you’ll build the implementation of your personal project, with two weeks on the back end and then two weeks on the front end (four separate assignments in total). In order to lead you gradually through all the skills you will need to learn (and the complex technologies involved), we have devised a plan for you that will allow you to focus on a few key skills at a time, and to avoid having to become familiar with too many technologies at once. For the back end, this first assignment will involve building implementations of the individual concepts; the second assignment will involve building the synchronizations that bring the concepts together into a fully working back-end service.

## What you’ll learn

There are two learning goals for this assignment. One is to learn how to implement concepts as back-end services (using a simple pattern in which each concept will be a class whose methods are the concept actions, with the concept state persisted using a database). The other is to hone your skills as a developer by practicing programming in an intentional and incremental fashion, using an LLM to augment your own skills in a thoughtful and constructive way.

## Evolving your design

As you implement your design, you will likely find opportunities to improve it, either because you encounter implementation challenges, or because you realize, as you play with the running code, that different behaviors would be better. Or perhaps you will discover that your understanding of concept design was imperfect, and that the concepts you specified did not embody sufficiently rich functionality (for example, because you specified a concept that was little more than a data structure) or violated concept modularity rules (for example, because one concept relied on making calls to another concept). However well you might have designed your concepts, some evolutions is likely. You are free to make changes as you see fit, so long as (a) you ensure that the concept specifications (which will be included in your repo as files in their own right) are kept up to date with the code, and (b) you record any significant design changes in files in your repo also (as explained below), summarizing not only the changes but also your rationale for making them. At the end of this project, you will be asked to write a brief reflection on your experience and how your project evolved, and these design notes will prove to be very helpful in this reflection.

## The Philosophy Behind This Assignment

Please read this. Before explaining the very particular way in which we expect you to work on this assignment, we’d like to explain our rationale: what we’re trying to accomplish and why we believe this is a good approach. We hope you will read this carefully so that the requirements of the assignment will make sense to you. Make sure to read the advice section before you start too, and to ask questions if anything is unclear. As always, we welcome your ideas and feedback, in the post-assignment survey and on Piazza or by email to the lecturers.

### Working incrementally

In our experience of teaching software development to undergraduates at MIT for many years, we have found that the single most common cause of frustration and lack of progress that students sometimes experience is a failure to work incrementally. A student will excitedly write 50 or 100 lines of code, or even more, find that it doesn’t work as expected, and then get trapped in an endless cycle of debugging, often to discover (after much wasted time) that the problem was a simple mistake early on, or a basic misunderstanding about how some mechanism works. The risk of this happening is dramatically increased when writing in an unfamiliar language or when using a new platform or API. And having an LLM spew out volumes of code that you don’t understand fully makes it even worse.

The best protection against these outcomes is to work incrementally, one tiny bit at a time, treating each step as a hypothesis (that your understanding is correct) that you can test before you continue. To novices eager to make quick progress, this incremental approach can seem too slow, but in practice, working incrementally turns out to be the way to make progress as rapidly as possible, since it eliminates a lot of wasted work, and ensures that you develop a strong understanding as you go that corresponds to the state of the artifact you’re producing. That’s why expert programmers usually work in this way, and only increase the size of the increments when they are very confident that they know what they’re doing.

Software development organizations have used incremental development practices for decades, and the benefits are well-documented. If you’re not already working incrementally, we strongly encourage you to try it. You might be surprised at how much more productive and confident you feel.

### Intentionality and reflective practice

What sets expert apart is that they work intentionally, always clear on what they are doing and why they are doing it. This doesn’t mean they don’t play or brainstorm or try things out, but that when they do those things, they know they are doing them, and they are acting out of a conscious choice. Experts also work reflectively, thinking not only about the artifacts that they are producing but also about their process, always looking for ways to improve how they work: how they approach problems, how they evaluate their solutions, how they overcome their own blindspots and biases, and so on. (The best known formulation of this notion of reflective practice comes from Donald Schon, who was a professor of urban planning at MIT and wrote an influential book in 1983 called The Reflective Practitioner.)

### Why LLMs matter

We believe that learning how to use an LLM productively is important, whether or not you intend to have a career in software development. Most companies are already encouraging their programmers to use LLMs to help them code, and many programmers report that using an LLM allows them to be more productive and to focus on more enjoyable aspects of their work. LLMs will likely be prominent in other fields too, and end-user programming tools will become more popular, so even people who never viewed themselves as software developers will be playing that role.

### The risks of LLMs

LLMs are very imperfect tools. They are non-deterministic and unpredictable. When they work well (for example when an LLM writes a bug-free implementation of a complex function, or builds a professional-looking front end in seconds), they seem like magic. But when they fail, they can be frustrating. LLMs can introduce serious security vulnerabilities; they can break existing functionality when adding new functionality; they can hit a functionality brick wall and be unable to code the requested requirements; and they can damage the quality of a codebase with bad coding practices, making it messy and incomprehensible. There is also a pedagogical risk that if you rely too heavily on an LLM you may never acquire essential programming skills, and will be unable to evaluate the code an LLM produces or fix things when it screws up.

### The costs of LLM coders

Another serious concern, especially in an educational setting like ours, is that LLM usage can be expensive. Vibe coding tools (such as Copilot, Cursor, Replit, Windsurf, etc) that offer an agentic workflow usually work by examining a large part of the code in a repo before making a decision about what to do. Passing an entire codebase as a context to an LLM can require a very large number of tokens. Heavy users of these tools may spend several hundred dollars per month. Some of the companies offer free plans for students, but it seems unlikely that these plans would be sufficient to cover the usage required in a class like this. Clearly it would be unacceptable for some students who were willing to pay higher prices to have an advantage in the class.

### A principled approach

For all these reasons, you will be using LLMs in a more principled way than is typical nowadays. We hope that this will give you a richer and more educational experience than you would get from using a vibe coding tool. We also believe that this approach represents one plausible future for LLM-driven software development. At the same time, of course, nobody really knows what will happen over the next few years. LLMs and LLM-based coding tools will continue to advance, and what seem to be fundamental limitations today may disappear. Do remember that in embracing LLMs our class is necessarily experimental, and not everything will go smoothly. We will do our very best to mitigate any problems that arise, and we will depend on you, the students, to let us know when you need help and to share your ideas and concerns with us constructively.

## A Software Development Workflow

### Context: the 6104 tool

Rather than using an agentic workflow with a vibe coding tool, you will be using a tool that we built specially for the class following an incremental and reflective workflow. The tool, which we call Context, and which is invoked on the command line as ctx, wraps the Google Gemini LLMs, and allows you to choose which model to use. Even if you choose the more expensive models, we doubt that you will exceed your credits using the tool (although you might do so if you’re not careful with any AI-augmented features that you build).

### Managing context

The main purpose of the Context tool is to help you manage the context presented to the LLM (hence the name), by making it easy to aggregate documents and present them via relative URLs. Managing context is perhaps the most important skill in LLM usage; in fact, Anthropic just last week released a post on the subject of context engineering.

### Context and concept design

Although you will be using the Context tool along with concept design, the two are strictly speaking entirely independent of one another. You can use the Context tool with any software development approach (or indeed for managing context for any LLM usage), and you can build a app using concept design with a vibe coding tool (such as Cursor) which makes context decisions for you and gives you little control over them.

Nevertheless, the Context tool and concept design have an important synergy, in that the modularity of concept design allows the contexts presented to the LLM in coding tasks to be dramatically smaller than in conventional developments. The general workflow will be to implement concepts one at a time. Since concepts are independent of one another, the context for the LLM need only include the concept’s specification and documents containing whatever other guidance you want to provide; the rest of the codebase is irrelevant. Concepts are thus particularly well suited to LLM-based development.

### Repository organization

Your repository will be organized into three main areas.

* Source code. One area will contain your source code and will resemble a conventional codebase. You will be free to modify these files as you please, and to insert code generated by the LLM.

* Design documents. A second area will contain your design documents, which will include notes that you write about your design work, prompts that you present to the LLM, background documents that you include as context in your LLM queries, and concept specifications. Just like the code files, you are expected to modify these files as you please. For example, you might have a file that represents a prompt for generating some code, and you may want to run it repeatedly, adjusting it after each run in order to get better results.

* Context records. A third area will contain files that are generated automatically by the tool. Every time you run the tool to call the LLM, it will create a master file containing the inputs and outputs, including all the context that you provided. The various components will be recorded in their own files, with links to them from the master file. When your LLM call refers to source code files and design documents from the first two areas, context files will be created that are snapshots corresponding to their contents at the time of the call. You should never modify, move, delete or rename any of the files in this area. They will comprise a complete record of your development history, with multiple useful purposes. By linking to one of these snapshots, will be able to cite a particular version of a design document or source code file in your design notes. Should you need an old version of a spec or a code file or a prompt, you will be able to retrieve it easily. And your teaching staff will be able to examine this area to evaluate the work you have done and give you feedback.

### Markdown documentation

All the files in the design area (the design documents, background documents, specifications and LLM prompts) will be written in markdown. This brings three key advantages. First, it allows documents to be structured using relative links; you can build an LLM prompt, for example, with a link to background documents and a link to a concept specification to be implemented. Second, it allows structuring of documents for more effective LLM processing. And third, it makes more documents more readable (and is compatible with many tools, including Github). You can use a markdown editor in combination with an IDE (we recommend using Obsidian with Visual Studio Code) but you can also use a markdown plugin in your IDE if you prefer.

### Documenting each step

As a byproduct of running the tool, the key steps of your work will be recorded automatically. For example, a series of steps might include: asking the LLM to generate code for a concept spec; asking the LLM to generate test cases for the generated implementation; running the test cases; changing the concept design; modifying the concept specification; rerunning the LLM to generate code; and so on. In this sequence, each of the LLM calls will be recorded, along with its context, in particular each version of the concept spec and the generated code. To take advantage of the snapshotting facility when you are working without the LLM (for example, if you choose to implement the concept yourself), you can run the tool with the “save” rather than the “prompt” option, which will snapshot the file given without running the LLM.

## Tasks

### Template repo

Start by completing the prep, in which you will fork the template repo we are providing, install and configure your development environment (Visual Studio Code, Obsidian, Deno, MongoDB), and check that you can successfully execute the LLM tool. (Note that the fork/clone instructions are slightly different from the previous assignment.)

### Deliverables

Your job in this assignment is to implement and test all the concepts that your application requires. The final version of your repo should include for each concept:

* a specification file (in markdown, using our structured specification notation);
* an implementation file (in TypeScript);
* a test script file (in TypeScript);
* a copy of the console output showing the execution of the test script (in markdown);
* a design file explaining changes you made to the concept as specified in Assignment 2 and any other issues that came up (in markdown).

For the application as a whole, there should be:

* a design file that explains changes that you made to the design of the application as a whole, and that includes 5-10 pointers to interesting moments (explained below) in your development, each with a couple of sentences explaining it.

Note that your specifications must be complete and consistent with your implementations. Your grade will suffer if you hand in specifications that are vague or out-of-step with the implementations, even if you have working implementations. If you have not fully grasped the state and action specification notation, now is the time to master it (and to use the LLM to help you, by providing feedback and even asking for help generating specifications). Also, ensure that you do not modify the context folder of your repo, so that it will include a full and unmodified history of all your LLM calls and saved snapshots.

### Refactoring your concepts

Until now, you have been defining concepts in the abstract. In this assignment, as you implement and test your concepts, they will become more concrete and you will more easily be able to see any flaws. You should therefore take this opportunity to refactor your concepts as you see fit, taking into account feedback you received on the design assignment, and evolving them as you work. You should pay particular attention to correcting these common flaws:

* Composite objects. Make sure that all of the arguments and results of your actions are either primitive values (strings, numbers, etc) or object identifiers (actually document identifiers in MongoDB). Composite objects should be used only inside concept implementations and never exposed.
* Conflation of concerns. Make sure that your concepts separate concerns, and that each one embodies only one concern and does not conflate multiple, unrelated concerns. You may want to review the lectures on modularity if you are not confident that you understand this idea.
* Data structures. A concept that is nothing more than a data structure without any interesting behavior is suspect, and is usually a sign that the data structure should have been incorporated into another concept.
* Dependencies. Make sure that your concepts are fully independent. There should be no function calls between concepts, and no reference in one concept to the database state of another concept.

### Testing concepts

Your tests should cover the basic behavior of the concept but should also include some more interesting cases. Your tests should use the Deno testing framework and should be programmatic (that is, determining in the code whether they succeeded or failed, and not requiring a human to interpret console messages). They should also print helpful messages to the console with action inputs and outputs so that a human reader can make sense of the test execution when it runs in the console. Some more details about the test cases you should include:

* Operational principle. A sequence of action executions that corresponds to the operational principle, representing the common expected usage of the concept. These sequence is not required to use all the actions; operational principles often do not include a deletion action, for example.
* Interesting scenarios. Sequences of action executions that correspond to less common cases: probing interesting corners of the functionality, undoing actions with deletions and cancellations, repeating actions with the same arguments, etc. In some of these scenarios actions may be expected to throw errors.
* Number required. For each concept, you should have one test sequence for the operational principle, and 3-5 additional interesting scenarios. Every action should be executed successfully in at least one of the scenarios.
* No state setup. Your test cases should not require any setting up of the concept state except by calling concept actions. When you are testing one action at a time, this means that you will want to order your actions carefully (for example, by the operational principle) to avoid having to set up state.
* Saving test execution output. Save the test execution output by copy-pasting from the console to a markdown file.

### Interesting moments

As you work on your implementation, some moments will be worth recording. For example, you might discover that your concept specification was wrong in some way; a test run might expose a subtle bug in a concept implementation; the LLM might generate some code that is unexpectedly good or bad in some way; you might discover a way to simplify your design; and so on. When any such moment arises, you should save a link to the relevant file and place it in your design document. Make sure to save a link to a snapshot in the context area, not a link to a file in the design or source code areas (since those are mutable). If this moment did not arise from running the LLM, you should save the relevant files by creating a little design document to record your observations, and then run the tool with the save option to snapshot the files first.

### Required technologies and structure

Your repo should preserve the structure of the template repo, although you are free to add additional structure for code files or design documents. You should never modify the files in the context area. You should use the Deno platform and MongoDB as the database, with the database deployed to the cloud using the MongoDB Community Server. Your code should be written in TypeScript and your test cases should use the Deno testing facility. As usual, your codebase should be pushed to a GitHub repository. For programming tools, we recommend the Visual Studio Code IDE and Obsidian for markdown editing, but you can use different tools if you prefer.
