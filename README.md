# VZCode: Multiplayer Code Editor System

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

- **Backlog & Issues**: Use our [Kanban Board](https://github.com/orgs/vizhub-core/projects/2/views/1) to track the backlog. It's also the place to find [good first issues](https://github.com/orgs/vizhub-core/projects/2/views/1?filterQuery=label%3A%22good+first+issue%22) and [known bugs](https://github.com/orgs/vizhub-core/projects/2/views/1?filterQuery=label%3Abug).

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

## Features

- Browser-based editing environment
- Sidebar with file listings (directories support pending)
- Real-time collaboration via LAN or using services like [NGrok](https://ngrok.com/)
- File management through tabs
- Basic file operations: create, rename, delete
- Syntax highlighting for web languages
- Auto-save feature

## Use Cases

- **Local Editor**:
    Use VZCode like VSCode or Vim:
    ```bash
    npm install -g vzcode
    cd myProject
    vzcode
    ```

- **Project-specific Editor**: 
    Embed VZCode within your project for developers who might not have a preferred IDE. 
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

- Built using technologies such as:
  - [NodeJS](https://nodejs.org/en/)
  - [Express](https://expressjs.com/)
  - [ShareDB](https://github.com/share/sharedb)
  - [JSON1 Operational Transform](https://github.com/ottypes/json1)
  - [CodeMirror 6](https://codemirror.net/)
  - [React](https://reactjs.org/)
  - [Vite](https://vitejs.dev/)

## Goals

The project aims to:

- Offer a feasible alternative to VSCode + Live Share for frontend development.
- Facilitate easy project-specific IDE embedding.
- Enhance user experience with advanced features.
- Keep improving based on feedback.
- Serve as a core for [VizHub's](https://vizhub.com/) next-gen editor.

## Prior Work

VZCode is inspired by the [VizHub Project](https://github.com/vizhub-core/vizhub/). VizHub's editor supports real-time collaboration using older versions of libraries. For VZCode, the aim is to leverage the latest technologies to deliver a more streamlined experience. 

![Prior Work Image](https://user-images.githubusercontent.com/68416/213894278-51c7c9a9-dc11-42bc-ba10-c23109c473cd.png)

## Milestones

For detailed progress, visit the [VZCode Kanban Board](https://github.com/orgs/vizhub-core/projects/2/views/1). 
- **February 2023**: Initial setup, server, and basic features.
- **March 2023**: Enhancements, UX improvements, and NPM release.
- **April 2023**: Directory support, feedback iterations, and promotion.

## Team

- **Curran Kelleher**
- **Anooj Pai** from [RPI RCOS](https://rcos.io/)
  
  We welcome contributions!

## Spaces

- [GitHub Repository](https://github.com/vizhub-core/vzcode)
- [Discord Channel within RCOS](https://discord.com/channels/738593165438746634/1066068656045441044)
