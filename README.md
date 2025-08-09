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
- Events positioned using deterministic formula based on chronological date and collision detection
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
- `fixedSizeScrollbar`: When `true`, scrollbar thumb uses fixed 20px size instead of proportional sizing

## Positioning Algorithm

Events are positioned using a deterministic mathematical formula:
```
pixel = linear_mapping(date) + ((events_before + collisions) * event_size) / 4
```

Where:
- `linear_mapping(date)`: Proportional position based on chronological date
- `events_before`: Count of non-title events occurring before this date
- `collisions`: Count of collision events (events sharing dates with others) up to this date
- `event_size`: Event width (400px) plus margin (`eventSpacing` config)

This approach guarantees:
- **Fixed space allocation**: Each event gets consistent spacing based on its chronological position
- **Historically representative positions**: Event positions closely reflect actual historical timing
- **Deterministic placement**: Same input always produces same output, no randomness

**Trade-offs**: Events at identical dates may visually overlap, especially with 3+ simultaneous events. The algorithm adds collision spacing but cannot eliminate all overlaps while maintaining historical accuracy.

## TODO

* double-check all links
* `eventSpacing` (in `data.js`) should be a minimum space between event, the actual margin would be computed from the eventspacing minus the current minimum space between two events on the same side of the bar (computed based on their date difference). That way the visible margin is less a function of the spacing between the events picked.