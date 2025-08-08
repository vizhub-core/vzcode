# d3-rosetta

Docs included here for LLM context, so it knows how to use
the API.

- **A utility library** for simplifying
  [D3](https://d3js.org/) rendering logic with
  unidirectional data flow.

### The Problem: Re-using D3 Rendering Logic Across Frameworks

While frameworks like React, Svelte, Vue, and Angular offer
state management and DOM manipulation solutions, D3 excels
in data transformation and visualization, particularly with
axes, transitions, and behaviors (e.g. zoom, drag, and
brush). These D3 features require direct access to the DOM,
making it challenging to replicate them effectively within
frameworks.

### The Solution: Unidirectional Data Flow

Unidirectional data flow is a pattern that can be cleanly
invoked from multiple frameworks. In this paradigm, a single
function is responsible for updating the DOM or rendering
visuals based on a single, central state. As the state
updates, the function re-renders the visualization in an
idempotent manner, meaning it can run multiple times without
causing side effects. Here's what the entry point function
looks like for a D3-based visualization that uses
unidirectional data flow: