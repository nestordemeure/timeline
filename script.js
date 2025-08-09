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

        // Calculate timeline parameters for positioning functions
        this.minDate = this.parseDate(this.events[0].date);
        this.maxDate = this.parseDate(this.events[this.events.length - 1].date);
        this.dateRange = this.maxDate - this.minDate;
        this.pixelsPerYear = 3;
        this.timelineWidth = Math.max(5000, this.dateRange * this.pixelsPerYear);
        this.eventWidth = 400; // CSS max-width to prevent overlaps
        this.eventSize = this.eventWidth + this.data.config.eventSpacing;
    }

    parseDate(dateStr) {
        if (typeof dateStr === 'number') return dateStr;

        let cleanDate = dateStr.toString().replace('c. ', '');
        return parseInt(cleanDate);
    }

    dateToPixel(date) {
        const parsedDate = this.parseDate(date);

        // Linear mapping component
        const linearPosition = ((parsedDate - this.minDate) / this.dateRange) * (this.timelineWidth - 200) + 100;

        // Count events strictly before this date (excluding titles)
        const eventsBeforeCount = this.events.filter(event =>
            event.type !== 'title' && this.parseDate(event.date) < parsedDate
        ).length;

        // Count collision groups (dates with 2+ events, up to target date)
        const seenDates = new Set();
        let collisionCount = 0;
        for (const event of this.events.filter(e => e.type !== 'title')) {
            const eventDate = this.parseDate(event.date);
            if (eventDate <= parsedDate) {
                if (seenDates.has(eventDate)) {
                    collisionCount++;
                } else {
                    seenDates.add(eventDate);
                }
            }
        }

        // Calculate spacing: normal events + extra margin for collisions
        const spacingAdjustment = ((eventsBeforeCount + collisionCount) * this.eventSize) / 4

        return linearPosition + spacingAdjustment;
    }

    pixelToDate(pixelPosition) {
        // This is more complex - we need to solve for date given the formula
        // pixel = linear(date) + (nb_events_before * event_size) / 2

        // Start with binary search approach since the function is monotonic
        let leftDate = this.minDate;
        let rightDate = this.maxDate;
        const tolerance = 1; // 1 year tolerance

        while (rightDate - leftDate > tolerance) {
            const midDate = Math.floor((leftDate + rightDate) / 2);
            const midPixel = this.dateToPixel(midDate);

            if (midPixel < pixelPosition) {
                leftDate = midDate;
            } else {
                rightDate = midDate;
            }
        }

        return leftDate;
    }


    formatDate(dateStr) {
        if (typeof dateStr === 'number') {
            return dateStr < 0 ? `${Math.abs(dateStr)} BC` : `${dateStr} AD`;
        }

        const isApprox = dateStr.toString().includes('c.');
        const year = this.parseDate(dateStr);
        const formatted = year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;

        return isApprox ? `c. ${formatted}` : formatted;
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
        this.eventsContainer.style.width = `${this.timelineWidth}px`;

        // Render time markers
        this.renderTimeMarkers();

        // Calculate positions using new positioning function
        const eventData = this.events.map((event, index) => {
            const finalPosition = this.dateToPixel(event.date);

            return {
                ...event,
                index,
                finalPosition,
                side: index % 2 === 0 ? 'above' : 'below'
            };
        });

        // Render events with adjusted positions
        eventData.forEach(eventInfo => {
            const eventElement = document.createElement('div');
            const undatedClass = eventInfo.undated ? ' undated' : '';
            eventElement.className = `event ${eventInfo.side} ${eventInfo.type}${undatedClass}`;
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
            title.position = this.dateToPixel(title.date);
        });

        // Store event positions for scrolling factor calculations
        this.eventPositions = this.events.map(event => {
            return this.dateToPixel(event.date);
        });

        // Note: Event indicators now handled by custom scrollbar
    }


    renderTimeMarkers() {
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

        const interval = getMarkerInterval(this.dateRange);
        const startYear = Math.floor(this.minDate / interval) * interval;

        for (let year = startYear; year <= this.maxDate; year += interval) {
            if (year >= this.minDate && !this.hasNearbyEvent(year)) {
                const position = this.dateToPixel(year);

                const marker = document.createElement('div');
                marker.className = 'time-marker';
                marker.style.left = `${position}px`;
                marker.setAttribute('data-date', year < 0 ? `${Math.abs(year)} BC` : `${year} AD`);

                this.eventsContainer.appendChild(marker);
            }
        }
    }

    hasNearbyEvent(markerYear) {
        const markerPosition = this.dateToPixel(markerYear);
        const minDistance = 150; // minimum distance in pixels to avoid overlap

        return this.events.some(event => {
            const eventPosition = this.dateToPixel(event.date);
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