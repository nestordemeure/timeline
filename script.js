class Timeline {
    constructor() {
        this.data = timelineData;
        this.events = [];
        this.titles = [];
        this.currentTitle = this.data.config.defaultTitle;
        this.eventsContainer = document.getElementById('events-container');
        this.titleHeader = document.getElementById('current-title');
        this.legend = document.getElementById('legend');
        this.timelineContainer = document.querySelector('.timeline-container');
        this.scrollbarOverlay = document.getElementById('scrollbar-overlay');
        this.customScrollbar = null;

        this.init();
    }

    init() {
        this.setInitialTitle();
        this.applyFontConfig();
        this.processData();
        this.renderLegend();
        this.renderEvents();
        this.setupScrollListener();
        this.initCustomScrollbar();
    }

    setInitialTitle() {
        this.titleHeader.textContent = this.data.config.defaultTitle;
    }

    applyFontConfig() {
        const config = this.data.config;
        document.body.style.fontFamily = config.fontFamily;
        document.body.style.fontSize = config.baseFontSize;
    }

    processData() {
        this.events = this.data.events
            .filter(event => event.type !== 'title' && !event.hidden)
            .sort((a, b) => this.parseDate(a.date) - this.parseDate(b.date));

        this.titles = this.data.events
            .filter(event => event.type === 'title')
            .sort((a, b) => this.parseDate(a.date) - this.parseDate(b.date));
    }

    parseDate(dateStr) {
        if (typeof dateStr === 'number') return dateStr;

        let cleanDate = dateStr.toString().replace('ca ', '');
        return parseInt(cleanDate);
    }


    formatDate(dateStr) {
        if (typeof dateStr === 'number') {
            return dateStr < 0 ? `${Math.abs(dateStr)} BC` : `${dateStr} AD`;
        }

        const isApprox = dateStr.toString().includes('ca');
        const year = this.parseDate(dateStr);
        const formatted = year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;

        return isApprox ? `ca ${formatted}` : formatted;
    }

    getTypeColor(typeName) {
        const type = this.data.types.find(t => t.name === typeName);
        return type ? type.color : '#666';
    }

    renderLegend() {
        this.legend.innerHTML = this.data.types
            .map(type => `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${type.color}"></div>
                    <span class="legend-text">${type.fullName}</span>
                </div>
            `).join('');
    }

    renderEvents() {
        const minDate = this.parseDate(this.events[0].date);
        const maxDate = this.parseDate(this.events[this.events.length - 1].date);
        const dateRange = maxDate - minDate;
        const pixelsPerYear = 3;
        const timelineWidth = Math.max(5000, dateRange * pixelsPerYear);

        this.eventsContainer.style.width = `${timelineWidth}px`;

        // Store timeline info for scroll calculations
        this.minDate = minDate;
        this.maxDate = maxDate;
        this.dateRange = dateRange;
        this.timelineWidth = timelineWidth;

        // Render time markers
        this.renderTimeMarkers(minDate, maxDate, dateRange, timelineWidth);

        // Calculate initial positions and create event data with collision info
        const eventData = this.events.map((event, index) => {
            const eventDate = this.parseDate(event.date);
            const basePosition = ((eventDate - minDate) / dateRange) * (timelineWidth - 200) + 100;

            return {
                ...event,
                index,
                basePosition,
                finalPosition: basePosition,
                side: index % 2 === 0 ? 'above' : 'below',
                width: 267, // min-width from CSS
                height: 150 // min-height from CSS
            };
        });

        // Apply collision detection
        this.resolveCollisions(eventData);

        // Render events with adjusted positions
        eventData.forEach(eventInfo => {
            const eventElement = document.createElement('div');
            eventElement.className = `event ${eventInfo.side} ${eventInfo.type}`;
            eventElement.style.left = `${eventInfo.finalPosition}px`;

            const color = this.getTypeColor(eventInfo.type);

            const titleContent = eventInfo.link 
                ? `<div class="event-title" style="cursor: pointer;" onclick="window.open('${eventInfo.link}', '_blank')">${eventInfo.title}</div>`
                : `<div class="event-title">${eventInfo.title}</div>`;
            
            const descriptionContent = eventInfo.description 
                ? (eventInfo.link 
                    ? `<div class="event-description" style="cursor: pointer;" onclick="window.open('${eventInfo.link}', '_blank')">${eventInfo.description}</div>`
                    : `<div class="event-description">${eventInfo.description}</div>`)
                : '';

            eventElement.innerHTML = `
                <div class="event-content">
                    ${titleContent}
                    ${descriptionContent}
                </div>
                <div class="event-marker" style="background-color: ${color}"></div>
                <div class="event-date">${this.formatDate(eventInfo.date)}</div>
            `;

            this.eventsContainer.appendChild(eventElement);
        });

        // Store event data for title adjustment calculations
        this.eventData = eventData;

        this.titles.forEach(title => {
            const titleDate = this.parseDate(title.date);
            const basePosition = ((titleDate - minDate) / dateRange) * (timelineWidth - 200) + 100;
            
            // Find nearby events to calculate average shift
            const nearbyEvents = eventData.filter(event => {
                const distance = Math.abs(event.basePosition - basePosition);
                return distance <= 500; // Within 500px range
            });
            
            if (nearbyEvents.length > 0) {
                // Calculate average shift of nearby events
                const totalShift = nearbyEvents.reduce((sum, event) => 
                    sum + (event.finalPosition - event.basePosition), 0);
                const avgShift = totalShift / nearbyEvents.length;
                title.position = basePosition + avgShift;
            } else {
                title.position = basePosition;
            }
        });

        // Store event positions for scrolling factor calculations
        this.eventPositions = this.events.map(event => {
            const eventDate = this.parseDate(event.date);
            return ((eventDate - minDate) / dateRange) * (timelineWidth - 200) + 100;
        });

        // Note: Event indicators now handled by custom scrollbar
    }

    resolveCollisions(eventData) {
        const padding = this.data.config.eventSpacing; // space between content areas

        // Separate events by side (above/below)
        const aboveEvents = eventData.filter(e => e.side === 'above').sort((a, b) => a.basePosition - b.basePosition);
        const belowEvents = eventData.filter(e => e.side === 'below').sort((a, b) => a.basePosition - b.basePosition);

        // Resolve collisions for each side separately
        this.resolveCollisionsForSide(aboveEvents, padding);
        this.resolveCollisionsForSide(belowEvents, padding);
    }

    resolveCollisionsForSide(events, padding) {
        if (events.length === 0) return;

        // Content area is the visible text area (excluding element padding)
        // event-content has 30px padding on each side, so content width = total width - 60px
        const contentPadding = 30; // CSS padding from .event-content
        const contentWidth = events[0].width - (2 * contentPadding);

        // First pass: push events to the right to avoid overlaps
        for (let i = 1; i < events.length; i++) {
            const current = events[i];
            const previous = events[i - 1];

            // Calculate content area boundaries (not full element boundaries)
            const previousContentEnd = previous.finalPosition + contentWidth / 2;
            const currentContentStart = current.finalPosition - contentWidth / 2;

            // Add user-specified spacing between content areas
            if (currentContentStart < previousContentEnd + padding) {
                current.finalPosition = previousContentEnd + padding + contentWidth / 2;
            }
        }

        // Second pass: try to pull events back towards their original positions
        for (let i = events.length - 2; i >= 0; i--) {
            const current = events[i];
            const next = events[i + 1];

            // Calculate content area boundaries
            const nextContentStart = next.finalPosition - contentWidth / 2;
            const maxPosition = nextContentStart - padding - contentWidth / 2;

            if (current.finalPosition > maxPosition) {
                current.finalPosition = maxPosition;
            }

            // Don't pull back beyond the original position
            if (current.finalPosition < current.basePosition) {
                current.finalPosition = current.basePosition;
            }
        }
    }

    renderTimeMarkers(minDate, maxDate, dateRange, timelineWidth) {
        const getMarkerInterval = (range) => {
            if (range <= 50) return 5;
            if (range <= 100) return 10;
            if (range <= 200) return 20;
            if (range <= 500) return 50;
            if (range <= 1000) return 100;
            if (range <= 2000) return 200;
            if (range <= 5000) return 500;
            return 1000;
        };

        const interval = getMarkerInterval(dateRange);
        const startYear = Math.floor(minDate / interval) * interval;

        for (let year = startYear; year <= maxDate; year += interval) {
            if (year >= minDate && !this.hasNearbyEvent(year, minDate, maxDate, dateRange, timelineWidth)) {
                const position = ((year - minDate) / dateRange) * (timelineWidth - 200) + 100;

                const marker = document.createElement('div');
                marker.className = 'time-marker';
                marker.style.left = `${position}px`;
                marker.setAttribute('data-date', year < 0 ? `${Math.abs(year)} BC` : `${year} AD`);

                this.eventsContainer.appendChild(marker);
            }
        }
    }

    hasNearbyEvent(markerYear, minDate, maxDate, dateRange, timelineWidth) {
        const markerPosition = ((markerYear - minDate) / dateRange) * (timelineWidth - 200) + 100;
        const minDistance = 150; // minimum distance in pixels to avoid overlap

        return this.events.some(event => {
            const eventDate = this.parseDate(event.date);
            const eventPosition = ((eventDate - minDate) / dateRange) * (timelineWidth - 200) + 100;
            const distance = Math.abs(markerPosition - eventPosition);
            return distance < minDistance;
        });
    }

    setupScrollListener() {
        this.timelineContainer.addEventListener('scroll', () => {
            this.updateCurrentTitle();
        });
    }

    computeScrollingFactor() {
        const currentScrollLeft = this.timelineContainer.scrollLeft;
        const containerWidth = this.timelineContainer.clientWidth;
        const viewportLeft = currentScrollLeft;
        const viewportRight = currentScrollLeft + containerWidth;

        // If any event is currently visible, use normal speed
        const eventInView = this.eventPositions.some(pos => pos >= viewportLeft && pos <= viewportRight);
        if (eventInView) {
            return 1.0;
        }

        // Find distance to closest event (in years/timeline units)
        let closestDistance = Infinity;
        for (const eventPos of this.eventPositions) {
            const distanceToEvent = Math.min(
                Math.abs(eventPos - viewportLeft),
                Math.abs(eventPos - viewportRight)
            );
            closestDistance = Math.min(closestDistance, distanceToEvent);
        }

        // If within target distance, use normal speed
        const targetScrollDistance = this.data.config.targetScrollDistance;
        if (closestDistance < targetScrollDistance) {
            return 1.0;
        }

        // Calculate factor based on distance beyond target
        // Tried various formula to find one that gets speed without risking overshooting too much
        const scrollFactor = this.data.config.scrollFactor;
        //return 1 + (closestDistance / targetScrollDistance - 1) * scrollFactor; // 5000 and 4
        //return 1 + Math.log10(closestDistance / targetScrollDistance) * scrollFactor; // 4000 and 20
        return 1 + Math.sqrt((closestDistance - targetScrollDistance) / targetScrollDistance) * scrollFactor; // 3500 and 10
    }

    getPreviousEventPosition(currentPosition) {
        // Find the last event position before current viewport
        for (let i = this.eventPositions.length - 1; i >= 0; i--) {
            if (this.eventPositions[i] < currentPosition) {
                return this.eventPositions[i];
            }
        }
        return null;
    }

    getNextEventPosition(currentPosition) {
        // Find the next event position after current viewport
        const nextEventPos = this.eventPositions.find(pos => pos > currentPosition);
        return nextEventPos !== undefined ? nextEventPos : null;
    }


    updateCurrentTitle() {
        const scrollLeft = this.timelineContainer.scrollLeft;
        const containerWidth = this.timelineContainer.clientWidth;
        const viewportCenter = scrollLeft + containerWidth / 2;
        const maxScroll = this.timelineContainer.scrollWidth - this.timelineContainer.clientWidth;

        let newTitle = this.data.config.defaultTitle;

        // If we're at the end of the timeline, show the last title
        if (scrollLeft >= maxScroll - 50) {
            if (this.titles.length > 0) {
                newTitle = this.titles[this.titles.length - 1].title;
            }
        } else {
            // Normal title switching logic - use viewport center instead of scroll left
            for (let i = this.titles.length - 1; i >= 0; i--) {
                const title = this.titles[i];
                if (viewportCenter >= title.position) {
                    newTitle = title.title;
                    break;
                }
            }
        }

        if (newTitle !== this.currentTitle) {
            this.currentTitle = newTitle;
            this.titleHeader.style.opacity = '0';

            setTimeout(() => {
                this.titleHeader.textContent = this.currentTitle;
                this.titleHeader.style.opacity = '1';
            }, 150);
        }
    }


    initCustomScrollbar() {
        if (this.customScrollbar) {
            this.customScrollbar.destroy();
        }
        this.customScrollbar = new CustomScrollbar(this);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.timelineInstance = new Timeline();
});