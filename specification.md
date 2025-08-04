# Specification

This is a webpage containing a timeline of various events.

## Code Organization

The code is kept consise and to the point, no need to try and handle problems we have not seen yet.

The code is split into a HTML, CSS (if needed), and javascript file (if neded).
The idea is to split responsabilities accross files.

There is also a data file (json?) thus the data can easily be updated without touching the rest of the page.

## Data

The data is stored in a file that contains a list of types, and a list of *events*, each belonging to a *type*.

### Events

Each event is characterised by:
* a type (see later)
* a date (year, can be negative, can be `ca` to denote approximation)
* a title (expected to be one line or less)
* an (optional) paragraph giving further details

### Types of Events

Event types are characterized by:
* a short name (used to encore them in events, ie "information")
* a full name (ie "Information Technologies")
* a color

Here is a draft list for the the types of events:
* information technologies (writing, internet, paper, printing press, etc)
* religion (first monotheism, christ, mahomet, protestantism, etc)
* politics (first code of law, democracy, human rights, french revolution, etc)
* economics (invention of money, of banking, of capitalism, of the stock market, etc)
* science (numbers, solving polynomials, first university, scientific method, theory of evolution, calculus, quantum computing, etc)
* medecine (vaccine, gene editing, DNA understanding, antibiotics, etc)
* industry (steam machine, industrial revolution, etc)

### Titles

There is one special kind of events of type `title` (that type is not present in our list of types).

Those are not meant to be displayed on the timeline itself, and do not have paragraph describing them.
Instead, they are displayed on top of the timeline when the display goes past their date (until we reach the next title in the chronology).

Here are basic title ideas:
* prehistory
* antiquity
* after christ

## Appearance

This is a dark mode type of web page designed to be seen on a computer screen.

The chronology goes from left to right.
Since it is long, we only see part of it, scrolling get it moving from left to right.
When the date of a title reach the left of our screen it becomes the new title (you can see titles scroll them stabilize then scroll again as the new one comes)

Events are displayed with colored markers (the color is a function of the type of event) ticking the chronology.
Each marker has the date on one side and the title (in bold) and optional description on the other.
They alternate between one side and the other (above and below the chronology).

There is a legend below the timeline that has each type of event as a colored square followed by its title.