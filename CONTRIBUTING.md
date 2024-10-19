# Contributing to VZCode

Thank you for your interest in contributing to VZCode! We truly appreciate the time and effort you're putting into this. Here's a set of guidelines to ensure smooth collaboration:

## Getting Started

- **Team Member Access**:
  - **New Contributors**: If you're new to the project, please fork the repository and submit your pull requests from your fork.
  - **Regular Contributors**: Regular contributors will be added directly to the VZCode repository. Once added, there's no need to fork the repository to create a pull request (PR).

## Picking Up Issues

We use [issues](https://github.com/vizhub-core/vzcode/issues) to communicate around new development tasks. Please don't start working on something until there is an issue for it, and the need for it has been validated. If you have an idea, please [create an issue](https://github.com/vizhub-core/vzcode/issues/new) before creating its corresponding PR.

- **Self-Assign**: If you decide to work on an issue, please self-assign it. This is to make sure no two contributors end up working on the same issue and duplicating efforts.
- **Kanban Board**: Once you've picked up an issue, make sure you move it to the "In Progress" column on our Kanban board. This gives everyone real-time visibility into who is actively working on what.

## Pull Requests

- **Draft PRs**: It's encouraged to open a draft PR as early as possible (first code change towards an issue). This helps the team see your progress and can also lead to early feedback, improving the overall quality and consistency of contributions. Please don't forget to mark it as "Ready for review" when the development work is complete.

- **Prettier**: Make sure to run Prettier on your code before committing. This ensures that our codebase maintains a consistent style. We have a script for this: `npm run prettier`. There's also a `.prettierrc` in the repo so your IDE should be able to pick that up and use it (e.g. VSCode with Prettier extension can run Prettier on save).

- **1:1 Mapping**: Ideally, there should be a one-to-one mapping between issues and pull requests. If your PR addresses multiple issues, please reconsider splitting it for clarity.

- **No Associated Issue**: If you're enthusiastic about something that doesn't have an associated issue, that's great! But make sure you create an issue first, mainly to validate your idea before spending time on a PR. This ensures we track all changes and discussions.

- **Documentation & Sources**: It's always beneficial to include links to any relevant documentation or sources in your pull requests or issues. It helps others understand your thought process and validate your changes.

## Code Reviews

- **Peer Review**: Team members, especially students, are encouraged to review each other’s PRs. This is a learning opportunity and helps ensure code quality.

- **Final Review**: Curran will be responsible for the final review, any necessary cleanup, and merging the PR into the main branch.

- **Auto-Close Issues**: To make our lives a bit easier, use the “Closes #241” syntax (replace '241' with your issue number) in your PRs. This ensures the related issue is automatically closed when the PR is merged.

## Wrapping Up

Communication is key. If you have a question or want to start a discussion, please create a new issue for it. This way, all topics get the attention they deserve and can be tracked efficiently. If you're ever unsure about anything else, don't hesitate to reach out! We're all here to help each other and make VZCode the best it can be. Happy coding!
