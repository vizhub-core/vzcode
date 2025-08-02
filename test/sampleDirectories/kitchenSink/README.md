# 3D Rotating Starfield

An interactive 3D starfield animation built with HTML5 Canvas and vanilla JavaScript. Features a rotating perspective view with colorful stars moving through 3D space.

## Features

- **3D Perspective**: Stars move through 3D space with realistic depth perception
- **Rotation Effect**: The entire starfield slowly rotates around the center
- **Colorful Stars**: Each star has a randomly generated color
- **Trail Effects**: Stars leave subtle trails as they move
- **Responsive Design**: Automatically adjusts to window size changes
- **Smooth Animation**: Uses `requestAnimationFrame` for optimal performance

## How it Works

- 2000 stars are generated with random positions, colors, sizes, and speeds
- Each star exists in 3D space (x, y, z coordinates)
- Stars rotate around the center using trigonometric functions
- Perspective projection creates the illusion of depth
- Stars that move off-screen are recycled to the back of the scene

## Usage

Simply open `index.html` in a web browser. The animation starts automatically and fills the entire viewport.

## Customization

You can adjust various parameters in `script.js`:

- `numStars`: Number of stars (default: 2000)
- `MIN_STAR_SIZE` / `MAX_STAR_SIZE`: Star size range
- `MIN_SPEED` / `MAX_SPEED`: Star movement speed range
- `PERSPECTIVE_FACTOR`: Controls depth effect intensity
- `ROTATION_SPEED`: How fast the starfield rotates

## Files

- `index.html`: Main HTML structure
- `script.js`: Animation logic and 3D calculations
- `styles.css`: Basic styling for full-screen display