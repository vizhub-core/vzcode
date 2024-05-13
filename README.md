# forked purpose 🔨
<details>

<summary>Tips for forked</summary>

### pkg as execute program 

1) build web page out to folder 'dist' :
```
npm run build 
```
1.1) dev start server
```
npm run start-server
```

2) build socket server out to folder 'dist_server' :
```
npm run build-server
```

2) pkg  out to folder 'dist_server_bin' :

```
npm run pkg-go
 
```

then all executeable program was build in folder 'dist_server_bin'
 

</details>

# VZCode: Multiplayer Code Editor

VZCode offers a multiplayer code editing environment that caters to a real-time collaborative development experience. It's the code editor component of [VizHub](https://vizhub.com/), and can also be used independently from VizHub.

![VZCode Interface](https://github.com/vizhub-core/vzcode/assets/68416/1812f25c-66b4-49bb-a04f-4474eb30e32b)

## Table of Contents

- [Usage](#usage)
- [Development](#development)
- [Features](#features)
- [Use Cases](#use-cases)
- [Stack](#stack)
- [Goals](#goals)
- [Prior Work](#prior-work)
- [Milestones](#milestones)
- [Team](#team)
- [Spaces](#spaces)

## Usage

You can use VZCode as an editor for your current directory if you install it globally with:

```
npm install -g vzcode
```

To open it, navigate to the directory of your choice in the terminal, then run

```
vzcode
```

A new browser window should automatically pop open with the files in that directory exposed for interactive multiplayer editing.

**Note:** A known shortcoming of VZCode is that it does not (yet) watch for changes from the file system. VZCode assumes that no other programs are modifying the same files. If another program does modify the same files at the same time, each VZCode auto-save will clobber the changes made by the other program.

To invite others to edit with you in real time, share your IP in your LAN with them to access. You can also expose your VZCode instance publicly using a tunneling service such as [NGrok](https://ngrok.com/). In fact, if you set your `NGROK_TOKEN` environment variable, VZCode will automatically connect and log the public URL when it starts.

## Development

- **Backlog & Issues**: Use our [Kanban Board](https://github.com/orgs/vizhub-core/projects/2/views/1) to track the backlog, [good first issues](https://github.com/orgs/vizhub-core/projects/2/views/1?filterQuery=label%3A%22good+first+issue%22), and [known bugs](https://github.com/orgs/vizhub-core/projects/2/views/1?filterQuery=label%3Abug).

- **Local Setup**:

```bash
cd vzcode
npm install
npm run test-interactive
```

If you're on Windows, you'll also need to do this additional step:

```
npm install @rollup/rollup-win32-x64-msvc
```

For local development with hot reloading (for client-side changes only), _keep the server running, started by_ `npm run test-interactive`, and also in a separate terminal run this:

```bash
npm run dev
```

This will expose http://localhost:5173/ and proxy the requests for data to the server (running on port 3030).

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

## Spaces

- [VizHub Discord](https://discord.com/invite/wbtJ7SCtYr)
- [GitHub Repository](https://github.com/vizhub-core/vzcode)
- [Discord Channel within RCOS](https://discord.com/channels/738593165438746634/1066068656045441044)
