# 3D Wiggling Starfield (Dark Mode)

An interactive 3D starfield animation built with HTML5 Canvas and vanilla JavaScript. Features a rotating perspective view with wiggling colorful stars moving through 3D space in a dark cosmic environment.

## Features

- **Dark Mode**: Features a deep space background with vibrant stars
- **3D Perspective**: Stars move through 3D space with realistic depth perception
- **Wiggle Motion**: Stars wiggle and undulate in mesmerizing wave patterns
- **Rotation Effect**: The entire starfield slowly rotates around the center
- **Colorful Stars**: Each star has a vibrant hue generated using HSL colors
- **Glow Effects**: Stars have luminous glow effects for an ethereal appearance
- **Responsive Design**: Automatically adjusts to window size changes
- **Smooth Animation**: Uses `requestAnimationFrame` for optimal performance

## How it Works

- 800 stars are generated with random positions, colors, sizes, and speeds
- Each star exists in 3D space (x, y, z coordinates) with wiggle properties
- Stars wiggle using sinusoidal wave functions with unique phases and intensities
- Stars rotate around the center using trigonometric functions
- Perspective projection creates the illusion of depth
- Stars that move off-screen are recycled to the back of the scene

## Usage

Simply open `index.html` in a web browser. The animation starts automatically and fills the entire viewport.

## Customization

You can adjust various parameters in `constants.js`:

- `NUM_STARS`: Number of stars (default: 800)
- `MIN_STAR_SIZE` / `MAX_STAR_SIZE`: Star size range
- `MIN_SPEED` / `MAX_SPEED`: Star movement speed range
- `PERSPECTIVE_FACTOR`: Controls depth effect intensity
- `ROTATION_SPEED`: How fast the starfield rotates
- `BG_COLOR`: Background color (dark space theme)
- `WIGGLE_AMPLITUDE`: How far stars wiggle from their base position
- `WIGGLE_FREQUENCY`: How fast the wiggle oscillates
- `WIGGLE_PHASE_VARIATION`: Creates different wiggle patterns for each star

## Files

- `index.html`: Main HTML structure
- `index.js`: Animation controller
- `renderer.js`: Canvas rendering logic
- `star.js`: Star generation and properties
- `constants.js`: Configuration parameters
- `styles.css`: Basic styling for full-screen display