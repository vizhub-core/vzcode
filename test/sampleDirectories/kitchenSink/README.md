# Creating Circles with D3

This project demonstrates how to create colorful circles
using D3.js with modern ES6 modules and HTML import maps.
Creating circles with D3! To use code like this in various
frameworks or vanilla HTML, see
[d3-rosetta](https://github.com/curran/d3-rosetta).

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/4DEx2M0auMc?si=L7JAtcLJQ6ieIt8c" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

[Full Playlist: Constructing Visualizations](https://www.youtube.com/playlist?list=PL9yYRbwpkykthTFJl9vYr_C0FCjRIn_7G)

## What We'll Build

We will create an SVG element containing multiple colorful
circles with varying sizes and positions. The visualization
demonstrates key D3 concepts including data binding, the
General Update Pattern, method chaining, and dynamic
styling. Each circle is positioned using data-driven
coordinates and styled with vibrant colors and transparency
effects.

## Project Structure

### Files Overview

- **index.html** - The main HTML file that sets up the page
  structure, import maps, and basic styling
- **index.js** - The entry point that selects the container
  element and initializes the visualization
- **viz.js** - Contains the main visualization logic using
  D3's data binding and SVG rendering
- **README.md** - This documentation file explaining the
  project and D3 concepts

## Understanding Import Maps

This project leverages modern **HTML Import Maps** to load
D3.js directly from a CDN without requiring a complex build
process or bundler. Import maps provide a clean way to
specify module dependencies in the browser.

### What are Import Maps?

Import maps are a web standard that allows you to control
how module specifiers are resolved when importing ES6
modules. Instead of writing: