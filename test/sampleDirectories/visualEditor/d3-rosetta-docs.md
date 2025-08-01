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

```js
export const viz = (container, state, setState) => {
  // Your reusable D3-based rendering logic goes here
};
```

- **`container`**: A DOM element where the visualization
  will be rendered.
- **`state`**: An object representing the current state of
  the application. It is initialized as an empty object `{}`
  by `unidirectionalDataFlow`.
- **`setState`**: A function to update the state. It accepts
  a callback function that receives the previous state and
  should return the new state (e.g.,
  `setState(prevState => ({ ...prevState, newProperty: 'value' }))`).
  Invoking `setState` triggers `unidirectionalDataFlow` to
  re-execute the `viz` function with the updated state.

Whenever `setState` is invoked, `viz` re-executes with the
new state, ensuring that the rendering logic is both dynamic
and responsive. This pattern is implemented in the
[VizHub](https://vizhub.com/) runtime environment and can be
invoked from different frameworks as needed.

## Utilities

`d3-rosetta` provides several utilities designed to enhance
the unidirectional data flow pattern by optimizing
performance and simplifying common tasks in D3-based
visualizations.

- [`one`](#one) - Simplifies the management of single DOM
  elements within a D3 selection.
- [`createMemoize`](#creatememoize) - Optimizes expensive
  calculations by caching results and reusing them when the
  same inputs are encountered.
- [`createStateField`](#createstatefield) - Simplifies
  creating getters and setters for individual state
  properties.
- [`unidirectionalDataFlow`](#unidirectionaldataflow) -
  Establishes the unidirectional data flow pattern.

---

### `one`

**`one(selection, tagName[, className])`**

The `one` function is a convenience utility designed to
simplify the management of single DOM elements within a D3
selection. It ensures that only one element of the specified
`tagName` (e.g., 'g', 'rect') exists within the given
`selection`. Optionally, it can also apply a `className` to
disambiguate between siblings of the same tag.

#### Example:

Consider the following traditional D3 logic for managing an
axis container:

```js
const xAxisG = selection
  .selectAll('g.x-axis')
  .data([null])
  .join('g')
  .attr('class', 'x-axis');
```

This can be expressed more concisely using `one`:

```js
const xAxisG = one(selection, 'g', 'x-axis');
```

In this example, `one` simplifies the creation and
management of a single `g` element with the class `x-axis`
within the `selection`. This utility reduces boilerplate
code and enhances the clarity of your D3 logic, particularly
when dealing with elements that should only have a single
instance within a selection.

---

### `createMemoize`

**`createMemoize(node)`**

The `createMemoize` function creates a memoize function that
stores memoized values on a given `node` (typically a DOM
element). This utility is designed to optimize expensive
calculations within D3 rendering logic by caching their
results. The cache is associated with the `node`, and
results are reused when the same inputs (dependencies) are
encountered again, minimizing unnecessary recalculations and
enhancing visualization performance.

The `node` parameter is the DOM element on which memoized
values will be stored. Each call to the returned `memoize`
function will use a unique property on this `node` to store
its memoized value and dependencies.

```js
// `container` is typically a DOM element
const memoize = createMemoize(container);
```

**`memoize(callback, dependencies)`**

The `memoize` function, returned by `createMemoize`, accepts
a `callback` function (which performs the expensive
computation) and an array of `dependencies`.

- `callback`: A function that computes the value to be
  memoized.
- `dependencies`: An array of values. If these dependency
  values are strictly equal (`===`) to the dependencies from
  the previous call for this specific memoization instance,
  the cached value is returned. Otherwise, the `callback` is
  executed, and its result is cached and returned.

This pattern is similar to React's `useMemo` hook and is
particularly useful for computationally intensive data
processing or DOM rendering operations.

#### Example:

```js
import { createMemoize } from 'd3-rosetta';

export const viz = (container, state, setState) => {
  const { a, b } = state;
  const memoize = createMemoize(container); // `container` is the DOM node here
  const computed = memoize(() => {
    // Imagine that this is a very expensive calculation
    return a + b;
  }, [a, b]);
  console.log(computed); // Outputs the sum of a and b
};
```

---

### `createStateField`

**`createStateField(state, setState)`**

The `createStateField` function is a higher-order function
that simplifies the creation of getters and setters for
individual properties within a state object. This is
particularly useful when working with the unidirectional
data flow pattern, where components need to read from and
write to specific parts of the application state.

It takes the current `state` object and the `setState`
function as arguments and returns a `stateField` function.

- `state`: The current state object of your application.
- `setState`: The function used to update the state. It
  should follow the pattern
  `setState(prevState => newState)`.

**`stateField(propertyName)`**

The `stateField` function (returned by `createStateField`)
takes a `propertyName` (string) corresponding to a key in
the `state` object. It returns a two-element array:

1.  **`value`**: The current value of `state[propertyName]`.
2.  **`setterForProperty`**: A function that, when called
    with a new value, will invoke `setState` to update only
    that specific `propertyName` in the state, preserving
    the rest of the state.

This utility helps reduce boilerplate code when managing
multiple state properties, making component logic cleaner
and more focused on the specific fields being handled.

---

### `unidirectionalDataFlow`

**`unidirectionalDataFlow(container, viz)`**

The `unidirectionalDataFlow` function is a core utility that
establishes and manages the unidirectional data flow pattern
for a visualization. It handles state initialization and
updates, and ensures the visualization (`viz` function) is
re-rendered whenever the state changes.

- **`container`**: A DOM element (or a mock object in tests)
  where the visualization will be rendered or attached. This
  `container` is passed through to the `viz` function.
- **`viz`**: A function that encapsulates the rendering
  logic of the visualization. This function is called by
  `unidirectionalDataFlow` initially and every time the
  state is updated. It receives three arguments:
  - `container`: The same `container` object passed to
    `unidirectionalDataFlow`.
  - `state`: An object representing the current state of the
    application. It is initialized as an empty object `{}`
    by `unidirectionalDataFlow`.
  - `setState`: A function to update the state. It accepts a
    callback function that receives the previous state and
    should return the new state using
    [immutable update patterns](https://redux.js.org/usage/structuring-reducers/immutable-update-patterns)
    (e.g.,
    `setState(prevState => ({ ...prevState, newProperty: 'value' }))`).
    Invoking `setState` triggers `unidirectionalDataFlow` to
    re-execute the `viz` function with the updated state.

#### How it Works:

1.  `unidirectionalDataFlow` initializes an internal `state`
    variable to an empty object (`{}`).
2.  It defines a `setState` function. When this
    `setState(nextStateFn)` is called: a. The new state is
    computed: `state = nextStateFn(state)`. b. The `viz`
    function is called again with the `container`, the newly
    updated `state`, and the same (stable) `setState`
    function: `viz(container, state, setState)`.
3.  Initially, `unidirectionalDataFlow` calls
    `viz(container, state, setState)` once to perform the
    first render with the initial empty state.

This utility is fundamental for structuring D3 (or other
rendering library) visualizations in a way that is
self-contained and can be easily integrated into various
JavaScript frameworks or run in a vanilla JavaScript
environment.
