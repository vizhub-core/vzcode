# VZCode: Multiplayer Code Editor

VZCode offers a multiplayer code editing environment that caters to a real-time collaborative development experience.

![VZCode Interface](https://user-images.githubusercontent.com/68416/224690259-293c75c5-5970-4066-80e4-b9dee568e10d.png)

## Table of Contents

- [Development](#development)
- [Features](#features)
- [Use Cases](#use-cases)
- [Stack](#stack)
- [Goals](#goals)
- [Prior Work](#prior-work)
- [Milestones](#milestones)
- [Team](#team)
- [Spaces](#spaces)

## Development

- **Backlog & Issues**: Use our [Kanban Board](https://github.com/orgs/vizhub-core/projects/2/views/1) to track the backlog, [good first issues](https://github.com/orgs/vizhub-core/projects/2/views/1?filterQuery=label%3A%22good+first+issue%22), and [known bugs](https://github.com/orgs/vizhub-core/projects/2/views/1?filterQuery=label%3Abug).

- **Local Setup**:

  ```bash
  cd vzcode
  npm install
  npm run test-interactive
  ```

  For hot reloading (client-side only), run:

  ```bash
  npm run dev
  ```

  You can also use [npm link](https://docs.npmjs.com/cli/v8/commands/npm-link) to set up the `vzcode` NPM package in another project to point to your clone of the repository. This can be useful when testing out how `vzcode` functions as a dependency.

## Features

- Browser-based editing environment
- Sidebar with file listings (directories support pending)
- Real-time collaboration via LAN or using services like [NGrok](https://ngrok.com/)
- File management through tabs
- Basic file operations: create, rename, delete
- Syntax highlighting for web languages
- Interactive widgets for editing numbers (Alt+drag on numbers)
- Auto-save, debounced after code changes
- Auto-save, throttled while using interactive widgets to support hot reloading environments

## Use Cases

- **Local Editor**:
  Use VZCode like VSCode or Vim:

  ```bash
  npm install -g vzcode
  cd myProject
  vzcode
  ```

- **Project-specific Editor**:
  Embed VZCode within your project for developers who might not have a preferred IDE, or to provide an editing experience that seamlessly integrates with hot reloading.

  ```json
  {
    "name": "example-project",
    "scripts": {
      "edit": "vzcode"
    },
    "dependencies": {
      "vzcode": "^0.1.0"
    }
  }
  ```

  Run using `npm run edit`.

  For example, as the editor of [Vite D3 Template](https://github.com/curran/vite-d3-template), which showcases the throttled auto-save behavior of VZCode while using the interactive widgets in the context of editing files served by the Vite dev server which supports hot reloading.

- **Hosting with Ngrok**: Allow external collaborators to join your VZCode session.

  - **With Ngrok Globally Installed**: (Requires authenticated Ngrok account)

    ```bash
    vzcode
    ngrok http 3030
    ```

  - **Through VZCode**: Coming soon!

- **Staging Site Editor (Experimental)**:
  Use VZCode on a persistent server, making code changes with multiplayer mode remotely, reflecting instantly on a staging site.

## Stack

Built using technologies such as:

- [NodeJS](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [ShareDB](https://github.com/share/sharedb)
- [JSON1 Operational Transform](https://github.com/ottypes/json1)
- [CodeMirror 6](https://codemirror.net/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)

## Goals

The project aims to:

- Offer a feasible alternative to VSCode + Live Share for frontend development
- Facilitate easy project-specific IDE embedding
- Enhance user experience with advanced features
- Support instant feedback through hot reloading
- Keep improving based on feedback
- Serve as a core for [VizHub's](https://vizhub.com/) next-gen editor

## Prior Work

VZCode is inspired by [VizHub v2](https://github.com/vizhub-core/vizhub/). VizHub V2's code editor supports real-time collaboration using older versions of libraries such as CodeMirror 5 and JSON0 OT. For VZCode, the aim is to leverage the latest technologies to deliver a more streamlined experience.

![Prior Work Image](https://user-images.githubusercontent.com/68416/213894278-51c7c9a9-dc11-42bc-ba10-c23109c473cd.png)

## Milestones

For detailed progress, visit the [VZCode Kanban Board](https://github.com/orgs/vizhub-core/projects/2/views/1)

- **February 2023**: Initial setup, server, and basic features
- **March 2023**: Enhancements, UX improvements, and NPM release
- **April 2023**: Directory support, feedback iterations, and promotion
- **May - August 2023**: Themes, overhaul CSS, adopt TypeScript, interactive widgets
- **September 2023**: Auto-run Prettier, AI-Assisted coding, TypeScript Autocomplete
- **October 2023**: Draggable split pane, deep linking, presence enhancements
- **November 2023**: Directory manipulation UX, implementing VSCode features

## Team

- **Curran Kelleher**
- **Anooj Pai** from [RPI RCOS](https://rcos.io/)

  We welcome contributions!

## Spaces

- [GitHub Repository](https://github.com/vizhub-core/vzcode)
- [Discord Channel within RCOS](https://discord.com/channels/738593165438746634/1066068656045441044)
