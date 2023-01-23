# VZCode
Multiplayer code editor system

## Project Description

 * Open source code editor for JavaScript
 * Support for real-time collaboration
 * Invite collaborators over LAN or HTTP Tunneing
 * Focus on instant feedback during development
 * Core component of [VizHub](https://vizhub.com/) next generation editor
 
## Stack

 * [NodeJS](https://nodejs.org/en/)
 * [Express](https://expressjs.com/)
 * [ShareDB](https://github.com/share/sharedb)
 * [JSON1 Operational Transform](https://github.com/ottypes/json1)
 * [CodeMirror 6](https://codemirror.net/)
 * [React](https://reactjs.org/)
 * [Vite](https://vitejs.dev/)
 
## Goals

 * Create a usable alternative to VSCode + Live Share for use in front end development
 * Enable developers to "enable" the VSCode editor on their projects via NPM
 * Have the `npm run edit` command start a local server
 * Develop a sidebar panel that lists files in the file system
 * Develop a code editor panel using CodeMirror that lets users navigate between files
 * Have the server auto-save files to disk when changes are made
 * Synchronize code edits across multiple clients using Operational Transform (JSON1 and ShareDB)
 * Ensure that the editor works well on top of the Vite dev server
 * Dogfood the product to identify ways it can be improved
 * Iterate based on feedback
 * Share the project with the world
 
## Prior Work

This project is heavily based on prior work done in the [VizHub Project](https://github.com/vizhub-core/vizhub/). VizHub already has a code editor component that supports real-time collaboration. However, this was built using older versions of [CodeMirror](https://codemirror.net/5/) (version 5) and operational transform ([json0](https://github.com/ottypes/json0). Various prototypes were built as a proof-of-concept for building a similar editor using the latest CodeMirror (v6) and the latest operational transform library for ShareDB (json1).

There is a working demo at https://vizhub.community/ci/viz1 (try it in multiple tabs to see the real-time sync), whose source code lives at https://github.com/vizhub-core/vizhub/tree/main/vizhub-v3 . Also we'll draw from this standalone CodeMirror6 collaboration demo: https://github.com/vizhub-core/vizhub/tree/main/vizhub-v3/vizhub-codemirror. For this project we'll port components out of that demo so that the code editor is totally independent and isolated from anything specific to VizHub.

![image](https://user-images.githubusercontent.com/68416/213894278-51c7c9a9-dc11-42bc-ba10-c23109c473cd.png)

It will look something like this ☝️ once it's working. This VZCode project will draw inspiration (and possibly implementation) from the existing open source editor component of VizHub, and various prototypes that have been done with CodeMirror6.

## Milestones

February 2023
 * Get the first version working, including:
 * ShareDB server
 * Auto-save
 * Edit the content of multiple files (no support for folders initially)

March 2023
 * Make it usable, including:
 * UX for adding new files, renaming files, deleting files
 * Implement presence (the ability to see the cursors of others in real time)
 * Test out how it works using tunneling services such as NGrok

April 2023
 * Add support for nested directories, including:
 * Develop a tree-based sidebar UI allowing directory navigation
 * Dogfood the product and try to collaboratively develop something, maybe a data visualization
 * Gather feedback from early users and iterate based on that
 * Publish a YouTube video presentation of the work to date

## Team

 * Curran Kelleher
 * Students from [RPI RCOS](https://rcos.io/)
 * Additional external collaborators, TBD
 * Drop a line to Curran if interested in collaborating on this!

## Spaces

 * https://github.com/vizhub-core/vzcode
 * [Discord channel within RCOS](https://discord.com/channels/738593165438746634/1066068656045441044)
