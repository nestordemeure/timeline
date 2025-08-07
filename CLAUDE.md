# Timeline Project Development Notes

## Project Overview
Interactive timeline displaying human civilization's progress through categorized historical events with smooth scrolling navigation and era transitions.

## Getting Started
- **Read specification first**: Review `specification.md` for design philosophy and principles  
- **IMPORTANT**: Only use Playwright MCP tools when explicitly requested by user for testing - never use proactively

## Architecture
Clean separation of concerns across four main files:

- **`index.html`**: HTML structure with containers for title, timeline, and legend
- **`style.css`**: Dark theme styling, layout, and responsive design
- **`script.js`**: Timeline class handling data processing, rendering, and scroll interactions
- **`data.js`**: All timeline data (events, types, era titles) plus configuration (fonts, colors, scaling)

## Key Implementation Details
- **Data Processing**: Events and titles separated at initialization, sorted chronologically
- **Positioning**: Timeline uses calculated pixel-per-year scaling for accurate event placement
- **Visual Flow**: Events alternate above/below timeline to prevent overlap and create rhythm
- **Era Management**: Title transitions triggered by scroll position with smooth animations
- **Legend Generation**: Dynamically built from event types data
- **Font System**: Centralized configuration applied via JavaScript for consistency

## Development Workflow
- All content editable through `data.js` without touching logic
- **IMPORTANT**: Any new events/titles added to `data.js` must be inserted in chronological order by date
- **IMPORTANT**: Any new events must be fact-checked online for date and description accuracy before adding
- **IMPORTANT**: Never use Playwright MCP tools unless explicitly requested by user for testing
- Follow existing patterns for new event types or timeline modifications
- Configuration changes (fonts, colors, scaling) handled through data.js config object