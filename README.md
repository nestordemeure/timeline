# Historical Timeline

Interactive horizontal timeline displaying historical events.
Made to illustrate the exponential rate of human progress within a larger presentation.

## Organization

- [`index.html`](index.html) - HTML structure
- [`style.css`](style.css) - Styling and layout  
- [`script.js`](script.js) - Timeline class and interactions
- [`scrolling.js`](scrolling.js) - Scrolling behavior and logic
- [`data.js`](data.js) - All timeline data and configuration

## Usage

**Display**: Open [`index.html`](index.html) in browser

**Add content**: Edit [`data.js`](data.js) arrays:
- Event types: `name`, `fullName`, `color`
- Events: `type`, `date`, `title`, `description`, optional `hidden: true`
- Era titles: `type: "title"` for section headers

**Configure**: Edit [`data.js`](data.js) config object:
- `fontFamily`: CSS font family for timeline text
- `baseFontSize`: Base font size for timeline elements
- `defaultTitle`: Title displayed before scrolling begins
- `targetScrollDistance`, `scrollFactor`: Control scrolling speed adaptation
- `eventSpacing`: Minimal distance between text blocks

Scrolling behavior is tuned to accelerate over long spans of empty time for consistent navigation.

## TODO

* move `data.js` to an actual json
* adjust line position on the scrolling bar to take the collision algorithm into account
  * or... make the scrollbar non linear?
