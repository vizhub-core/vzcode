VZCode: Multiplayer Code Editor https://github.com/vizhub-core/vzcode
Description
VZCode is a state-of-the-art multiplayer code editing platform designed to provide a real-time collaborative development experience. It provides a browser-based environment where users can simultaneously edit, allowing for instant collaboration on projects. With features such as file listing, real-time collaboration, and syntax highlighting, VZCode is a formidable solution for teams looking to streamline their development workflows.

![VZCode Interface](https://user-images.githubusercontent.com/68416/224690259-293c75c5-5970-4066-80e4-b9dee568e10d.png)

Stack
Front End:
- React
- Vite
- CodeMirror 6

Backend:
- NodeJS
- Express
- ShareDB
- JSON1 Operational Transform

Goals
- Serve as a potent alternative to tools like VSCode + Live Share for frontend tasks.
- Allow for effortless project-specific IDE embedding.
- Continually improve user experience by adding advanced features.
- Provide instant feedback capabilities using hot reloading.
- Gather and implement feedback for continual improvement.
- Become the foundational core for [VizHub's](https://vizhub.com/) next-generation editor.

## VZCode Development Timeline:

---

### **Week 1 (Mid-September 2023 - End of September 2023):**

1. Split Pane Improvements
2. Expose all interactive widgets in codemirror-interact
3. Presence: Show Selections
4. Active file in URL
5. Desktop app

---

### **Week 2 (First Week of October 2023):**

6. Debounce auto-save with cursor movement
7. Keyboard Shortcut to Close Tab (good first issue)
8. Adopt codemirror-minimap (good first issue)
9. Adopt codemirror-indentation-markers (good first issue)
10. Adopt codemirror-vscode-keymap (good first issue)

---

### **Week 3 (Second Week of October 2023):**

11. Better UX for renaming files (good first issue)
12. Show TypeScript Errors
13. Provide Intelligent Autocompletions
14. Show Prettier Errors
15. Fix JSX syntax highlighting bug (good first issue)

---

### **Week 4 (Third Week of October 2023):**

16. VizHub Color Theme Option
17. Shrink when lines are long (good first issue)
18. Make it More Like VSCode (good first issue)
19. Presence: Show Selection (good first issue)
20. Make Port Configurable bug (good first issue)

---

### **Week 5 (Last Week of October 2023):**

21. Live Demo Site
22. Support node_modules bug
23. Breadcrumbs
24. Ignore node_modules
25. Presence: Follow user

---

### **Week 6 (First Week of November 2023):**

26. Live demo link in README
27. Drag & drop directories between directories
28. Drag & drop files between directories
29. Create directory UX
30. Rename directory

---

### **Week 7 (Second Week of November 2023):**

31. Delete directory
32. Deep Linking
33. Initialize the open folders
34. Ensure text selection doesn't happen when you open and close folders bug (good first issue)
35. Configurable auto-save time

---

### **Week 8 (Third Week of November 2023):**

36. Manual save
37. AI Assisted Coding
38. Presence: Usernames
39. Draggable split pane
40. Listen for changes from the file system

---

### **Week 9 (Last Week of November 2023):**

41. Draggable tabs to re-order
42. Handle file renames when extension changes (update syntax highlighting)
43. Delete file (good first issue)
44. Replay Code Changes Synchronized with Video Lectures
45. Presence: Notifications when someone joins or leaves the session

---


Team
Under the leadership of Curran Kelleher:
- Curran Kelleher (Founder and Lead Developer)
- Anooj Pai (Collaborator from [RPI RCOS](https://rcos.io/))

We are always open to contributions and collaboration.

Spaces
- GitHub Repository: https://github.com/vizhub-core/vzcode
- Discord Channel within RCOS: https://discord.com/channels/738593165438746634/1066068656045441044
