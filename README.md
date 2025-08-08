# Historical Timeline

Interactive horizontal timeline displaying historical events.
Made to illustrate the exponential rate of human progress within a larger presentation.

See [this page](https://www.historicaltechtree.com/) for an alternative, significantly more complete, take on a historical tech tree.

## Code

The code is organized as follows:
- [`index.html`](index.html) - HTML structure
- [`style.css`](style.css) - Styling and layout  
- [`script.js`](script.js) - Timeline class and interactions
- [`scroll.js`](scroll.js) - Dynamic scroll speed scaling for adaptive navigation
- [`scrollbar.js`](scrollbar.js) - Custom scrollbar with chronological position mapping
- [`data.js`](data.js) - All timeline data and configuration

It features specialized navigation to smooth out the historical experience:
- Events are spread on screen to avoid overlap
- Dynamic speed scaling accelerates through empty millennia for consistent navigation
- Custom scrollbar position maps to historical dates (not pixels) with event indicators and click-to-jump navigation

## Usage

**Display**: Open [`index.html`](index.html) in browser

**Add content**: Edit [`data.js`](data.js) arrays:
- Event types: `name`, `fullName`, `color`
- Events: `type`, `date`, `title`, `description`, optional `hidden: true`, optional `link: "URL"`, optional `undated: true`
- Era titles: `type: "title"` for section headers
- Undated events: Set `undated: true` to display events without date markers or timeline positioning

**Configure**: Edit [`data.js`](data.js) config object:
- `fontFamily`: CSS font family for timeline text
- `baseFontSize`: Base font size for timeline elements
- `defaultTitle`: Title displayed before scrolling begins
- `targetScrollDistance`, `scrollFactor`: Control scrolling speed adaptation
- `eventSpacing`: Minimal distance between text blocks

## TODO

* double-check all links

**placement:**
if i were to redo the placement algorithm, i would have it be placement(time) + event_size(including side margings)*nb_events_before/2 (division to take events below us into account; but we might want to use integer division such that we only count events on our side of the line)

event would be spread a bit more, and still stretch chronology, but their placement would be predictable, regular, and have a limited impact on the scrolling and dating of things: placing something as a function of its date would be instantly easier.

cutting the need for our custom scrollbar logic, for adjustments to title placements, for our last event being further in the future than we might want, etc