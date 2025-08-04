# Historical Timeline

Interactive horizontal timeline with scrollable events.

## Files

- `index.html` - Main page structure
- `style.css` - Dark theme styling  
- `script.js` - Timeline rendering logic
- `data.js` - Event data and types

## Usage

**Display**: Open `index.html` in browser

**Add event types**: Edit `data.js` > `types` array:
```js
{
  "name": "short_name",
  "fullName": "Display Name", 
  "color": "#hex_color"
}
```

**Add events**: Edit `data.js` > `events` array:
```js
{
  "type": "short_name",
  "date": "ca -500" or 1066,
  "title": "Event Name",
  "description": "Optional details"
}
```

**Add titles**: Use `"type": "title"` for era markers