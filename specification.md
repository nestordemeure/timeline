# Timeline Specification

An interactive horizontal timeline displaying the progression of human civilization through historical events.

## Philosophy

This timeline embodies the concept of human progress as a continuous flow from left to right, where time itself becomes a navigable dimension. The design emphasizes the interconnectedness of different domains of human achievement - from the invention of writing to quantum computing, from democracy to gene editing.

## Design Principles

### Temporal Navigation
Time flows horizontally from left to right. Users navigate through millennia by scrolling, creating an immersive sense of traveling through history. Era transitions are marked by smooth title changes that reflect our journey through different periods of civilization.

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

### Scrolling Dynamics
The timeline implements an adaptive scrolling system that optimizes navigation through dense and sparse historical periods:

- **Event-Present Mode**: When events are visible on screen, scrolling operates at normal speed for detailed exploration
- **Gap-Bridging Mode**: When no events are on screen (during large temporal gaps), scroll speed automatically increases proportionally to the distance between the previous and next events
- **Consistent Navigation**: This adaptive approach ensures users require the same number of scroll actions to traverse between any two consecutive events, regardless of the temporal gap between them

This creates an intuitive navigation experience where users can efficiently move through both densely populated historical periods and vast temporal gaps with equal ease.

### Configuration Parameters
The system's behavior is controlled through `data.js` configuration:

- **`hidden`** (event property): Boolean flag to exclude specific events from display while preserving data integrity