# Historical Timeline

Interactive horizontal timeline displaying historical events.
Made to illustrate the exponential rate of human progress within a larger presentation.

## Organization

- `index.html` - HTML structure
- `style.css` - Styling and layout  
- `script.js` - Timeline class and interactions
- `data.js` - All timeline data and configuration

## Usage

**Display**: Open `index.html` in browser

**Add content**: Edit `data.js` arrays:
- Event types: `name`, `fullName`, `color`
- Events: `type`, `date`, `title`, `description`, optional `hidden: true`
- Era titles: `type: "title"` for section headers

## Configuration

Timeline behavior can be customized via `data.js` config object:

### Event Visibility
- `hidden: true`: Optional field on events to hide them from display while keeping them in data

### Scrolling Behavior
- **Adaptive Speed**: Timeline scrolls at normal speed when events are visible on screen
- **Distance-Proportional**: When no events are on screen, scroll speed increases proportionally to the distance between the previous and next events
- **Consistent Navigation**: This ensures a constant number of scroll actions between far-apart events, regardless of temporal gaps
- **Formula**: Speed factor calculated as `1 + sqrt((distance - target) / target) * scrollFactor` where scrollFactor is configurable in data.js

### Other Settings
- `fontFamily`: CSS font family for the timeline
- `baseFontSize`: Base font size for timeline text  
- `defaultTitle`: Title shown when not in a specific era


## TODO

* have a line on the page inviting users to scroll right
* move data to an actual json

* hide items that can be skipped as well as items before writing (for efficiency sake)
* add iron, bronze, cast iron, woodblock printing
* line on scrollbar lightgrey rather than transparent
