# VZCode: Multiplayer Code Editor

VZCode offers a multiplayer code editing environment that caters to a real-time collaborative development experience.

![VZCode Interface](https://github.com/vizhub-core/vzcode/assets/68416/9ad56113-2992-49ff-b050-f5622fa5944c)

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

## Keyboard Shortcuts

1. Ctrl-Space: Starts the auto-completion process.
2. Escape: Closes the auto-completion menu.
3. Arrow Down: Moves the selection down in the auto-completion menu.
4. Arrow Up: Moves the selection up in the auto-completion menu.
5. Page Down: Moves the selection down by one page in the auto-completion menu.
6. Page Up: Moves the selection up by one page in the auto-completion menu.
7. Enter: Accepts the currently selected auto-completion suggestion.
8. Tab: Also accepts the currently selected auto-completion suggestion.
9. Mod-f (Ctrl-f or Cmd-f): Opens the search panel.
10. Escape: Closes the search panel (in the context of the search panel).
11. Alt-Enter: Selects all matches found in the search panel.
12. Mod-Alt-Enter (Ctrl-Alt-Enter or Cmd-Alt-Enter): Replaces all found matches in the search panel.
13. Ctrl-g: Goes to a specific line number.
14. Mod-d (Ctrl-d or Cmd-d): Selects the next occurrence of the current selection.
15. Shift-Mod-l (Shift-Ctrl-l or Shift-Cmd-l): Selects all instances of the current selection.
16. Enter: Inserts a new line and indents it (handled internally by the search panel plugin).
17. Shift-Enter: Also inserts a new line and indents it.
18. Arrow Left: Moves the cursor one character to the left.
19. Shift-Arrow Left: Selects the character to the left of the cursor.
20. Mod-Arrow Left (Ctrl-Arrow Left or Cmd-Arrow Left): Moves the cursor one word to the left.
21. Shift-Mod-Arrow Left (Shift-Ctrl-Arrow Left or Shift-Cmd-Arrow Left): Selects the word to the left of the cursor.
22. Arrow Right: Moves the cursor one character to the right.
23. Shift-Arrow Right: Selects the character to the right of the cursor.
24. Mod-Arrow Right (Ctrl-Arrow Right or Cmd-Arrow Right): Moves the cursor one word to the right.
25. Shift-Mod-Arrow Right (Shift-Ctrl-Arrow Right or Shift-Cmd-Arrow Right): Selects the word to the right of the cursor.
26. Arrow Up: Moves the cursor up one line.
27. Shift-Arrow Up: Selects the line above the cursor.
28. Arrow Down: Moves the cursor down one line.
29. Shift-Arrow Down: Selects the line below the cursor.
30. Home: Moves the cursor to the beginning of the current line.
31. Shift-Home: Selects from the current position to the beginning of the line.
32. Mod-Home (Ctrl-Home or Cmd-Home): Moves the cursor to the start of the document.
33. Shift-Mod-Home (Shift-Ctrl-Home or Shift-Cmd-Home): Selects from the current position to the start of the document.
34. Page Up: Moves the cursor up one page.
35. Shift-Page Up: Selects one page upwards from the current position.
36. Page Down: Moves the cursor down one page.
37. Shift-Page Down: Selects one page downwards from the current position.
38. End: Moves the cursor to the end of the current line.
39. Shift-End: Selects from the current position to the end of the line.
40. Mod-Alt-Arrow Up (Ctrl-Alt-Arrow Up or Cmd-Alt-Arrow Up): Adds a cursor above the current line.
41. Mod-Alt-Arrow Down (Ctrl-Alt-Arrow Down or Cmd-Alt-Arrow Down): Adds a cursor below the current line.
42. Shift-Alt-i: Adds a cursor at the start of each line in the current selection.
43. Mod-End (Ctrl-End or Cmd-End): Moves the cursor to the end of the document.
44. Shift-Mod-End (Shift-Ctrl-End or Shift-Cmd-End): Selects from the current position to the end of the document.
45. Mod-a (Ctrl-a or Cmd-a): Selects all text in the document.
46. Backspace: Deletes the character to the left of the cursor.
47. Shift-Backspace: Also deletes the character to the left of the cursor.
48. Delete: Deletes the character to the right of the cursor.
49. Mod-Backspace (Ctrl-Backspace or Alt-Backspace): Deletes the word to the left of the cursor.
50. Mod-Delete (Ctrl-Delete or Alt-Delete): Deletes the word to the right of the cursor.
51. Mod-Backspace (Cmd-Backspace): Deletes from the cursor to the start of the line (Mac).
52. Mod-Delete (Cmd-Delete): Deletes from the cursor to the end of the line (Mac).
53. Ctrl-b (Mac): Moves the cursor one character left (Mac).
54. Ctrl-f (Mac): Moves the cursor one character right (Mac).
55. Ctrl-p (Mac): Moves the cursor up one line (Mac).
56. Ctrl-n (Mac): Moves the cursor down one line (Mac).
57. Ctrl-a (Mac): Moves the cursor to the start of the line (Mac).
58. Ctrl-e (Mac): Moves the cursor to the end of the line (Mac).
59. Ctrl-d (Mac): Deletes the character to the right of the cursor (Mac).
60. Ctrl-h (Mac): Deletes the character to the left of the cursor (Mac).
61. Ctrl-k (Mac): Deletes from the cursor to the end of the line (Mac).
62. Ctrl-Alt-h (Mac): Deletes the word to the left of the cursor (Mac).
63. Ctrl-o (Mac): Splits the line at the cursor (Mac).
64. Ctrl-t (Mac): Transposes characters around the cursor (Mac).
65. Ctrl-v (Mac): Moves the cursor down one page (Mac).
66. Alt-v (Mac): Moves the cursor up one page (Mac).
67. Shift-Mod-k (Shift-Ctrl-k or Shift-Cmd-k): Deletes the current line.
68. Alt-Arrow Down: Moves the current line down.
69. Alt-Arrow Up: Moves the current line up.
70. Shift-Alt-Arrow Down (Win/Mac): Copies the current line down.
71. Shift-Alt-Arrow Up (Win/Mac): Copies the current line up.
72. Mod-l (Ctrl-l or Cmd-l): Selects the current line.
73. Shift-Mod-\ (Shift-Ctrl-\ or Shift-Cmd-\): Moves the cursor to the matching bracket.
74. Tab: Indents the current line or selection.
75. Shift-Tab: Reduces the indentation of the current line or selection.
76. Mod-[ (Ctrl-[ or Cmd-[): Reduces the indentation of the current line or selection.
77. Mod-] (Ctrl-] or Cmd-]): Increases the indentation of the current line or selection.
78. Ctrl-Shift-[ (Cmd-Alt-[ on Mac): Folds the code at the current line.
79. Ctrl-Shift-] (Cmd-Alt-] on Mac): Unfolds the folded code at the current line.
80. Mod-k Mod-0: Folds all the code in the document.
81. Mod-k Mod-j: Unfolds all the folded code in the document.
82. Mod-k Mod-c: Comments out the current line or selection.
83. Mod-k Mod-u: Uncomments the current line or selection.
84. Mod-/: Toggles commenting for the current line or selection.
85. Shift-Alt-a: Toggles block commenting for the current selection.
86. Mod-z (Ctrl-z or Cmd-z): Undoes the last action.
87. Mod-y (Ctrl-y or Cmd-y): Redoes the last undone action.
88. Mod-Shift-z (Ctrl-Shift-z or Cmd-Shift-z): Also redoes the last undone action.
89. Mod-u (Ctrl-u or Cmd-u): Undoes the last selection change.
90. Mod-Shift-m (Ctrl-Shift-m or Cmd-Shift-m): Opens the lint panel.
91. F8: Goes to the next diagnostic issue.

## Interactive Widgets

Number literals: alt-drag to change the number (right is positive)

Boolean literals: alt-click to toggle

Hex/rgb color: alt-click and then use color picker

Vec2: alt-drag horizontally to change x number (right is positive), alt-drag vertically to change y number (up is positive)

Rotate: alt-drag around the word rotate. The angle is set to the angle in degrees between the x-axis and a line from the point where the user first clicks to the current mouse position.

Links: alt-click to open link in new tab
