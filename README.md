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
- Events: `type`, `date`, `title`, `description`, optional `hidden: true`, optional `link: "URL"`
- Era titles: `type: "title"` for section headers

**Configure**: Edit [`data.js`](data.js) config object:
- `fontFamily`: CSS font family for timeline text
- `baseFontSize`: Base font size for timeline elements
- `defaultTitle`: Title displayed before scrolling begins
- `targetScrollDistance`, `scrollFactor`: Control scrolling speed adaptation
- `eventSpacing`: Minimal distance between text blocks

## TODO

* move `data.js` to an actual json
* clicking on the plot should center me on where i click, unless its too close to an edge
* take screnshot and have model discuss it
  * have model add whimsy