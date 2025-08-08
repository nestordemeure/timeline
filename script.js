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

        this.init();
    }

    init() {
        this.setInitialTitle();
        this.applyFontConfig();
        this.processData();
        this.renderLegend();
        this.renderEvents();
        this.setupScrollListener();
        window.addEventListener('resize', () => this.renderScrollbarIndicators());
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

        let cleanDate = dateStr.toString().replace('c. ', '');
        return parseInt(cleanDate);
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
        const minDate = this.parseDate(this.events[0].date);
        const maxDate = this.parseDate(this.events[this.events.length - 1].date);
        const dateRange = maxDate - minDate;
        const pixelsPerYear = 3;
        const baseTimelineWidth = Math.max(5000, dateRange * pixelsPerYear);
        const eventFullWidth = 267 + this.data.config.eventSpacing;
        const extraWidth = Math.floor((this.events.length - 1) / 2) * eventFullWidth;
        const timelineWidth = baseTimelineWidth + extraWidth;

        this.eventsContainer.style.width = `${timelineWidth}px`;

        this.minDate = minDate;
        this.maxDate = maxDate;
        this.dateRange = dateRange;
        this.timelineWidth = timelineWidth;
        this.eventFullWidth = eventFullWidth;

        const dateToPixel = (date) =>
            ((date - minDate) / dateRange) * (baseTimelineWidth - 200) + 100;
        this.dateToPixel = dateToPixel;

        this.renderTimeMarkers(minDate, maxDate, dateRange, baseTimelineWidth);

        const eventData = this.events.map((event, index) => {
            const eventDate = this.parseDate(event.date);
            const basePosition = dateToPixel(eventDate);
            const offset = Math.floor(index / 2) * eventFullWidth;
            const finalPosition = basePosition + offset;

            return {
                ...event,
                index,
                basePosition,
                finalPosition,
                side: index % 2 === 0 ? 'above' : 'below'
            };
        });

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

        this.eventData = eventData;

        this.titles.forEach(title => {
            const titleDate = this.parseDate(title.date);
            title.position = dateToPixel(titleDate);
        });

        this.eventPositions = eventData.map(e => e.finalPosition);

        this.renderScrollbarIndicators();
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

    renderScrollbarIndicators() {
        if (!this.scrollbarOverlay) return;
        const overlay = this.scrollbarOverlay;
        overlay.innerHTML = '';

        const scrollbarHeight = this.timelineContainer.offsetHeight - this.timelineContainer.clientHeight;
        overlay.style.height = `${scrollbarHeight || 20}px`;

        const overlayWidth = overlay.clientWidth;
        const totalWidth = this.timelineWidth;

        this.eventData.forEach(eventInfo => {
            const indicator = document.createElement('div');
            indicator.className = 'scrollbar-event-line';
            const position = (eventInfo.finalPosition / totalWidth) * overlayWidth;
            const width = Math.max(1, (this.eventFullWidth / totalWidth) * overlayWidth);
            indicator.style.left = `${position}px`;
            indicator.style.width = `${width}px`;
            overlay.appendChild(indicator);
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
}

document.addEventListener('DOMContentLoaded', () => {
    window.timelineInstance = new Timeline();
});