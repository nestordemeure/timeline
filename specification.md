# Timeline Specification

An interactive horizontal timeline displaying the progression of human civilization through historical events.

## Philosophy

This timeline embodies the concept of human progress as a continuous flow from left to right, where time itself becomes a navigable dimension. The design emphasizes the interconnectedness of different domains of human achievement - from the invention of writing to quantum computing, from democracy to gene editing.

## Design Principles

### Temporal Navigation
Time flows horizontally from left to right. Users navigate through millennia by scrolling, creating an immersive sense of traveling through history. The timeline implements **logarithmic scrolling** that adapts speed based on historical context - faster navigation through sparse ancient periods, more precise control around dense modern times. Era transitions are marked by smooth title changes that reflect our journey through different periods of civilization.

### Visual Hierarchy
- **Timeline as Foundation**: A prominent horizontal line serves as the backbone of history
- **Event Alternation**: Events alternate above and below the timeline to create visual rhythm and prevent overlap
- **Color Coding**: Each domain of human achievement has its distinct color, creating visual patterns that reveal the density and distribution of progress across different fields

### Dark Mode Aesthetic
Designed for comfortable computer screen viewing with a sophisticated dark theme that emphasizes content over interface, allowing the historical narrative to take center stage.

## Content Structure

### Event Domains
Events are categorized into fundamental domains of human progress:
- **Information Technologies**: From writing to the internet
- **Religion**: Spiritual and philosophical developments
- **Politics**: Governance and social organization
- **Economics**: Trade, commerce, and financial systems  
- **Science**: Knowledge and understanding of the natural world
- **Medicine**: Health and biological sciences
- **Industry**: Technology and manufacturing

### Temporal Organization
- **Events**: Specific historical moments with dates, titles, and descriptions. Events can be marked as `hidden: true` to exclude them from display while preserving them in the dataset
- **Era Titles**: Broad historical periods (Prehistory, Antiquity, After Christ) that provide context as users navigate

### Typography and Readability
Serif fonts provide classical elegance and enhanced readability, reinforcing the historical nature of the content while maintaining modern usability standards.

## Interaction Model

### Logarithmic Scrolling System
The timeline employs an adaptive scrolling system that matches the density of historical events:

**Reference Point**: The system centers around a configurable reference year (default: 1969, marking the birth of the Internet) where scrolling behaves at "normal" speed.

**Adaptive Speed**: 
- **Ancient periods** (far from reference): Faster scrolling enables rapid traversal of millennia where events are sparse
- **Modern era** (near reference ± linear scale): Slower, more precise scrolling for detailed navigation through dense periods of innovation
- **Transition zone**: Smooth speed gradients prevent jarring changes in scroll behavior

**Mathematical Foundation**: Uses logarithmic functions to calculate scroll multipliers, ensuring intuitive navigation that respects both historical timeline density and user expectations.

### Configuration Parameters
The system's behavior is controlled through `data.js` configuration:

- **`referenceYear`** (default: 1969): The temporal anchor point where scrolling speed normalizes
- **`linearScale`** (default: 50): Defines the "linear zone" in years around the reference where scrolling behaves uniformly  
- **`logMultiplier`** (default: 100): Overall scaling factor that controls timeline width and scroll sensitivity
- **`hidden`** (event property): Boolean flag to exclude specific events from display while preserving data integrity

### Visual Consistency
Despite variable scrolling speeds, event positioning remains strictly linear - maintaining accurate historical proportions and ensuring visual coherence across the entire timeline.