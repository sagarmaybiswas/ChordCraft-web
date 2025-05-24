# ChordCraft

ChordCraft is an interactive web application that helps musicians and music enthusiasts create, visualize, and experiment with chord progressions. Built with React and Tone.js, it provides an intuitive interface for musical composition and learning.

## Features

- Interactive piano roll interface
- Real-time audio playback using Tone.js
- Multiple chord progression presets:
  - Pop Basic (I-IV-V-I)
  - Pop Alternative (I-V-vi-IV)
  - Jazz Turnaround (ii-V-i)
  - Minor Classic (i-iv-v)
- Support for different musical scales
- Visual chord progression builder
- Various chord types (major, minor)

## Technologies Used

- React
- Tone.js - Web Audio framework
- Konva - Canvas graphics library
- React Konva - React components for canvas manipulation

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd chordcraft
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

## Usage

1. Select a musical key from the key selector
2. Choose a scale type (e.g., Ionian/Major)
3. Select a chord progression preset or create your own
4. Use the piano roll interface to visualize and modify your progression
5. Click play to hear your creation

## Development

To run the development environment:
```bash
npm start
```

To run tests:
```bash
npm test
```

To create a production build:
```bash
npm run build
```

## License

This project is private and not licensed for public use.

## Acknowledgments

- Built with React and modern web technologies
- Uses Tone.js for high-quality audio synthesis
- Implements music theory concepts for chord progressions and scales
