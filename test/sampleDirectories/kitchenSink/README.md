# React & D3 Vibecoding Starter

This viz serves as a starter example specifically designed
for "Vibecoding" - a workflow where you ask AI to edit and
enhance your code. It provides a simple yet functional
foundation that demonstrates React and D3 working together.
The reason it works so well with AI is because it's broken
down into lots of small files, and uses well known patterns.

## Key Features

- **AI-Friendly Structure**: Organized in a way that makes
  it easy for AI to understand and modify
- **Responsive Visualization**: Automatically adapts to
  window size changes using ResizeObserver
- **Interactive Elements**:
  - Hover interactions that change bar colors
  - Click interactions that select/deselect bars
- **Data Loading**: Demonstrates how to load and process
  data from CSV files
- **Component Architecture**: Clean separation between React
  for state and D3 for DOM manipulation

## How It Works

The application follows a clean pattern:

1. React manages the component lifecycle and state
2. D3 handles the SVG rendering and visualization logic
3. The main visualization updates in response to state
   changes
4. Interactive elements respond to user input (hover, click)

This structure makes it easy to ask AI to:

- Change the visualization type
- Add new interactive features
- Modify the styling and appearance
- Implement more complex data processing

## Getting Started with Vibecoding

To use this starter with AI:

1. Fork this viz
2. Understand the basic structure (React app with D3
   visualization)
3. Ask the AI to modify if by clicking "Edit with AI"
4. The AI can analyze the code structure and make
   appropriate changes
5. If it messes up, click "Revision History", click on the
   previous revision, then click "Restore to this version"

Built with React and D3.js - perfect for experimenting with
AI-assisted coding!