# Timeline Project Development Notes

## Getting Started
- **Read the specification first**: Always start by reading `specification.md` to understand the project requirements
- **Check visual changes**: When modifying anything for display purposes, always use Playwright MCP to visualize the results

## Code Organization
The project follows a clean separation of concerns:

- **`index.html`**: Basic HTML structure with containers for title, timeline, and legend
- **`style.css`**: All styling and layout, removed hardcoded fonts (now configured in data.js)
- **`script.js`**: Timeline class that handles data processing, rendering, and interactions
- **`data.js`**: Contains all timeline data (events, types, titles) and configuration (fonts, colors)

## Key Architecture Points
- Events and titles are separate data structures, with titles used for section headers
- Timeline positioning is calculated based on date ranges and viewport width
- Events alternate above/below the timeline for better readability
- Legend is dynamically generated from event types data
- Font configuration is centralized in data.js and applied via JavaScript

## Development Guidelines
- Test all display changes with Playwright MCP browser tools
- Keep data separate from logic - all content should be editable in data.js
- Follow existing patterns for new event types or styling changes