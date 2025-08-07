# Specification

This is an interactive horizontal timeline displaying the progression of human civilization through historical events.

## Code Organization

The code is kept concise and focused. No premature optimization - we handle the problems we actually encounter.

The code is split across six files with clear separation of responsibilities:
* `index.html` - HTML structure with containers for title, timeline, and legend
* `style.css` - Dark theme styling and responsive layout
* `script.js` - Timeline class handling rendering and interactions
* `scroll.js` - Dynamic scroll speed scaling based on event density
* `scrollbar.js` - Custom scrollbar with chronological position mapping
* `data.js` - All timeline data plus configuration parameters

## Data Structure

### Events

Each event is characterized by:
* A type (see event types below)
* A date (year, can be negative for BC, can have `ca` prefix for approximation)
* A title (expected to be one line or less)
* An optional description paragraph
* An optional `hidden: true` flag to exclude from display while preserving in dataset
* An optional `link: "URL"` field for clickable references to reputable sources (preferably Wikipedia)

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
* When an event has a link field, the title and description become clickable (maintaining visual appearance)

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

## Scrolling System

The timeline implements a sophisticated two-part scrolling system:

### Dynamic Speed Scaling (`scroll.js`)
Automatically adjusts scroll speed based on proximity to historical events:
* **Adaptive Speed**: Uses `computeScrollingFactor()` from timeline instance to scale scroll velocity
* **Multi-Input Support**: Handles mouse wheel, touch gestures, and keyboard navigation consistently  
* **Event Density Awareness**: Accelerates through empty millennia, maintains normal speed near events
* **Cross-Platform**: Touch scrolling uses vertical swipes for horizontal timeline navigation

Formula: `1 + sqrt((closestDistance - targetScrollDistance) / targetScrollDistance) * scrollFactor`

### Chronological Scrollbar (`scrollbar.js`)
Custom scrollbar where position represents chronological time rather than pixel distance:
* **Chronological Mapping**: Scrollbar position corresponds to historical dates, not timeline pixels
* **Bi-directional Interpolation**: Converts between timeline scroll position and chronological dates
* **Variable Thumb Size**: Thumb width reflects event density in the visible viewport
* **Event Indicators**: Visual markers show historical event distribution across full timeline
* **Interactive Navigation**: Click-to-jump and drag-to-scrub through historical periods

The scrollbar uses interpolation between adjacent events to maintain chronological accuracy:
- Maps viewport position to chronological dates using event boundaries
- Calculates thumb position and size based on date ranges rather than pixel positions  
- Handles edge cases (before first event, after last event, identical event positions)

### Additional Features
* **Time Markers**: Adaptive interval markers (5 to 1000 years) appear in empty areas to provide temporal reference
* **Consistent Navigation**: Same scrolling effort moves between any two consecutive events regardless of time span

## Configuration

All behavior is controlled through the `config` object in `data.js`:
* `fontFamily` - Typography choice (serif fonts for classical feel)
* `baseFontSize` - Base font size for all timeline elements
* `defaultTitle` - Title shown before any era titles are reached
* `targetScrollDistance` / `scrollFactor` - Control adaptive scrolling behavior
