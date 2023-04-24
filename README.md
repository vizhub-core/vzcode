# VZCode

Multiplayer code editor system | [Kanban](https://github.com/orgs/vizhub-core/projects/2/views/1)

![image](https://user-images.githubusercontent.com/68416/224690259-293c75c5-5970-4066-80e4-b9dee568e10d.png)

## Features

This project is nascent but has enough features to actually use, a minimum viable product (MVP):

- Browser-based code editing environment
- Sidebar listing files from the file system
  - Note: directories are not yet supported
- Real-time collaboration (multiplayer mode)
  - Invite collaborators over LAN, or
  - Use a service like [NGrok](https://ngrok.com/) for remote collaboration
- Tabs on the top for managing open files
- Operatons on files (create file, rename file, delete file)
- Syntax highlighting for several Web languages
- Auto-saves changes back to the file system

## Use Cases

### Local Editor

One way to use this is as an editor on your system, taking the place of an existing editor like VSCode or Vim:

- Install with `npm install -g vzcode`
- Launch with `cd myProject; vzcode`

### Project-specific Editor

Another way to use this is to set up this editor within your project. This gives developers of your project a quick way to start editing code, in case they do not already have a preferred IDE, or they want to take advantage of VZCode features.

This can be done introducing a new npm script and dependency like this:

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

Then run `npm run edit` to start the editor.

# Host Server With Ngrok

How to host your VZCode session with Ngrok. Hosting with Ngrok will allow users that are not on your network to join your session.

## Host With Ngrok Globally Installed

- Warning - This will only work if you have an Ngrok account and your machine is authenticated

To host Ngrok, first set up a VZcode instance by moving into your directory, then in the terminal run

```bash
  vzcode
```

Next while the local host session is running, in the terminal run

```bash
  ngrok http 3030
```

This will give you a link that can be shared to collaborators who then can join from anywhere.

## Host With Ngrok Through VZCode

Coming Soon

### Staging Site Editor

[Experimental idea]

VZCode could be hosted on a long-running server. The idea here is that an individual or team that is developing a product can make code changes, leveraging multiplayer mode remotely, and have those changes appear instantly on a "staging site" (a server hosting the latest version of the work) running something like the Vite dev server. This would allow collaborators to, for example, make minor tweaks live on client calls and have the client see the updates in real time.

## Stack

- [NodeJS](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [ShareDB](https://github.com/share/sharedb)
- [JSON1 Operational Transform](https://github.com/ottypes/json1)
- [CodeMirror 6](https://codemirror.net/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)

## Goals

- Create a usable alternative to VSCode + Live Share for use in front end development
- Enable developers to "enable" the VSCode editor on their projects via NPM
- Have the `npm run edit` command start a local server
- Develop a sidebar panel that lists files in the file system
- Develop a code editor panel using CodeMirror that lets users navigate between files
- Have the server auto-save files to disk when changes are made
- Synchronize code edits across multiple clients using Operational Transform (JSON1 and ShareDB)
- Ensure that the editor works well on top of the Vite dev server
- Dogfood the product to identify ways it can be improved
- Iterate based on feedback
- Share the project with the world
- Core component of [VizHub](https://vizhub.com/) next generation editor

## Prior Work

This project is heavily based on prior work done in the [VizHub Project](https://github.com/vizhub-core/vizhub/). VizHub already has a code editor component that supports real-time collaboration. However, this was built using older versions of [CodeMirror](https://codemirror.net/5/) (version 5) and operational transform ([json0](https://github.com/ottypes/json0). Various prototypes were built as a proof-of-concept for building a similar editor using the latest CodeMirror (v6) and the latest operational transform library for ShareDB (json1).

There is a working demo at https://vizhub.community/ci/viz1 (try it in multiple tabs to see the real-time sync), whose source code lives at https://github.com/vizhub-core/vizhub/tree/main/vizhub-v3 . Also we'll draw from this standalone CodeMirror6 collaboration demo: https://github.com/vizhub-core/vizhub/tree/main/vizhub-v3/vizhub-codemirror. For this project we'll port components out of that demo so that the code editor is totally independent and isolated from anything specific to VizHub.

![image](https://user-images.githubusercontent.com/68416/213894278-51c7c9a9-dc11-42bc-ba10-c23109c473cd.png)

It will look something like this ☝️ once it's working. This VZCode project will draw inspiration (and possibly implementation) from the existing open source editor component of VizHub, and various prototypes that have been done with CodeMirror6.

## Milestones

See also [VZCode Kanban Board](https://github.com/orgs/vizhub-core/projects/2/views/1).

February 2023

- [x] Get the first version working, including:
  - [x] ShareDB server
  - [x] Auto-save
  - [x] Edit the content of multiple files (no support for folders initially)

March 2023

- [x] Make it usable, including:
  - [x] UX for adding new files, renaming files, deleting files
  - [x] Implement presence (the ability to see the cursors of others in real time)
  - [x] Publish an early release to NPM
- [ ] Test out how it works using tunneling services such as NGrok

April 2023

- [ ] Add support for nested directories, including:
- [ ] Develop a tree-based sidebar UI allowing directory navigation
- [ ] Dogfood the product and try to collaboratively develop something, maybe a data visualization
- [ ] Gather feedback from early users and iterate based on that
- [ ] Publish a YouTube video presentation of the work to date

## Team

- Curran Kelleher
- Students from [RPI RCOS](https://rcos.io/)
- Additional external collaborators, TBD
- Contributions welcome!

## Spaces

- https://github.com/vizhub-core/vzcode
- [Discord channel within RCOS](https://discord.com/channels/738593165438746634/1066068656045441044)
