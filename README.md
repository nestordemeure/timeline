# Historical Timeline

Interactive horizontal timeline displaying historical events.
Made to illustrate the exponential rate of human progress within a larger presentation.

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

title shold have no backround

check all links in data.js, taking a look at the full corresponding wikipedia page, and checking if a section of that page might be a better or more specific fit for the topic we are talking about than the one linked to. Note that some link might be pointing to non existing sections, that's fine, loading the page willstill work, you will only need to point to an existing section or the overall page when fixing the link.