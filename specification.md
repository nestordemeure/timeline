# Specification

This is an interactive horizontal timeline displaying the progression of human civilization through historical events.

## Code Organization

The code is kept concise and focused. No premature optimization - we handle the problems we actually encounter.

The code is split across five files with clear separation of responsibilities:
* `index.html` - HTML structure with containers for title, timeline, and legend
* `style.css` - Dark theme styling and responsive layout
* `script.js` - Timeline class handling rendering and interactions
* `scroll.js` - Scrolling behavior and adaptive speed logic
* `data.js` - All timeline data plus configuration parameters

## Data Structure

### Events

Each event is characterized by:
* A type (see event types below)
* A date (year, can be negative for BC, can have `ca` prefix for approximation)
* A title (expected to be one line or less)
* An optional description paragraph
* An optional `hidden: true` flag to exclude from display while preserving in dataset

### Event Types

Event types are characterized by:
* A short name (used in events, eg "information")
* A full name (eg "Information Technologies")  
* A color (for visual coding)

The implemented types cover fundamental domains of human progress:
* **information** - Information Technologies (writing, printing, internet, computing)
* **religion** - Religion (monotheism, major religions, spiritual movements)
* **politics** - Politics (law codes, democracy, revolutions, governance)
* **economics** - Economics (money, banking, capitalism, trade systems)
* **science** - Science (mathematics, scientific method, major discoveries)
* **medicine** - Medicine (vaccines, antibiotics, gene editing, medical advances)
* **industry** - Industry (steam power, industrial revolution, manufacturing)

### Era Titles

There is one special kind of event with `type: "title"` that doesn't appear in the types list.

These are not displayed as events on the timeline itself. Instead, they appear as the main title at the top of the page when the timeline scrolls past their date (until the next title in chronology is reached).

Example era titles:
* Prehistory
* Antiquity  
* After Christ

## Appearance

This is a dark mode webpage designed for computer screen viewing.

The timeline flows horizontally from left to right. Since it spans millennia, only a portion is visible at once. Scrolling moves through time from left to right.

### Event Display
Events are displayed with colored circular markers on the timeline. Each event shows:
* The date on one side of the marker
* The title (in bold) and optional description on the other side
* Events alternate above and below the timeline to prevent overlap and create visual rhythm

### Era Transitions
When scrolling past a title's date, it smoothly fades in as the new main title at the top. The transition has a subtle animation - fade out the old title, change the text, then fade in the new one.

### Legend
Below the timeline is a legend showing each event type as a colored circle followed by its full name.

## Timeline Mechanics

### Positioning System
Events are positioned using a pixel-per-year scale (minimum 3 pixels per year). The timeline dynamically sizes itself based on the date range of all events.

### Collision Detection
Since events alternate above/below but can still overlap horizontally, the system implements two-pass collision detection:
1. **Forward pass**: Push overlapping events rightward with minimum padding
2. **Backward pass**: Pull events back toward their original chronological positions when possible

This ensures events stay as close as possible to their actual historical positions while remaining readable.

### Adaptive Scrolling
The timeline implements intelligent scrolling that adapts to event density:

**Normal Speed**: When events are visible or within a target distance
**Accelerated Speed**: When scrolling through empty millennia, speed increases proportionally to the distance to the nearest events

The formula: `1 + sqrt((closestDistance - targetScrollDistance) / targetScrollDistance) * scrollFactor`

This ensures consistent navigation effort - the same amount of scrolling moves you between any two consecutive events, whether they're 10 years or 1000 years apart.

### Additional Features
* **Time Markers**: Adaptive interval markers (5 to 1000 years) appear in empty areas to provide temporal reference
* **Event Indicators**: Small markers on the scrollbar show event density across the timeline
* **Scrollbar Navigation**: Click anywhere on the scrollbar to jump directly to that timeline position

## Configuration

All behavior is controlled through the `config` object in `data.js`:
* `fontFamily` - Typography choice (serif fonts for classical feel)
* `baseFontSize` - Base font size for all timeline elements
* `defaultTitle` - Title shown before any era titles are reached
* `targetScrollDistance` / `scrollFactor` - Control adaptive scrolling behavior
