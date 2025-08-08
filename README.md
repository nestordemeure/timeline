# Historical Timeline

Interactive horizontal timeline displaying historical events.
Made to illustrate the exponential rate of human progress within a larger presentation.

See [this page](https://www.historicaltechtree.com/) for an alternative, significantly more complete, take on a historical tech tree.

## Code

 The code is organized as follows:
 - [`index.html`](index.html) - HTML structure
 - [`style.css`](style.css) - Styling and layout
 - [`script.js`](script.js) - Timeline class, scrollbar overlay indicators, and interactions
 - [`scroll.js`](scroll.js) - Dynamic scroll speed scaling for adaptive navigation
 - [`data.js`](data.js) - All timeline data and configuration

 It features specialized navigation to smooth out the historical experience:
 - Events are positioned deterministically by date with even spacing
 - Dynamic speed scaling accelerates through empty millennia for consistent navigation
 - Thick native scrollbar hosts 1px event lines; clicking the bar smoothly scrolls to that position

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
- `eventSpacing`: Minimal distance between text blocks (default 0px)

## TODO

* double-check all links