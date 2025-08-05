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
        
        this.init();
    }
    
    init() {
        this.setInitialTitle();
        this.applyFontConfig();
        this.processData();
        this.renderLegend();
        this.renderEvents();
        this.setupScrollListener();
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
        const pixelsPerYear = 3; // Back to linear scaling
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
            eventElement.className = `event ${eventInfo.side}`;
            eventElement.style.left = `${eventInfo.finalPosition}px`;
            
            const color = this.getTypeColor(eventInfo.type);
            
            eventElement.innerHTML = `
                <div class="event-content">
                    <div class="event-title">${eventInfo.title}</div>
                    ${eventInfo.description ? `<div class="event-description">${eventInfo.description}</div>` : ''}
                </div>
                <div class="event-marker" style="background-color: ${color}"></div>
                <div class="event-date">${this.formatDate(eventInfo.date)}</div>
            `;
            
            this.eventsContainer.appendChild(eventElement);
        });
        
        this.titles.forEach(title => {
            const titleDate = this.parseDate(title.date);
            const position = ((titleDate - minDate) / dateRange) * (timelineWidth - 200) + 100;
            
            title.position = position;
        });
    }
    
    resolveCollisions(eventData) {
        const padding = 20; // minimum space between events
        
        // Separate events by side (above/below)
        const aboveEvents = eventData.filter(e => e.side === 'above').sort((a, b) => a.basePosition - b.basePosition);
        const belowEvents = eventData.filter(e => e.side === 'below').sort((a, b) => a.basePosition - b.basePosition);
        
        // Resolve collisions for each side separately
        this.resolveCollisionsForSide(aboveEvents, padding);
        this.resolveCollisionsForSide(belowEvents, padding);
    }
    
    resolveCollisionsForSide(events, padding) {
        if (events.length === 0) return;
        
        // First pass: push events to the right to avoid overlaps
        for (let i = 1; i < events.length; i++) {
            const current = events[i];
            const previous = events[i - 1];
            
            const previousEnd = previous.finalPosition + previous.width / 2;
            const currentStart = current.finalPosition - current.width / 2;
            
            if (currentStart < previousEnd + padding) {
                current.finalPosition = previousEnd + padding + current.width / 2;
            }
        }
        
        // Second pass: try to pull events back towards their original positions
        for (let i = events.length - 2; i >= 0; i--) {
            const current = events[i];
            const next = events[i + 1];
            
            const nextStart = next.finalPosition - next.width / 2;
            const maxPosition = nextStart - padding - current.width / 2;
            
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
        
        // Add logarithmic scroll behavior
        this.timelineContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleLogarithmicScroll(e);
        }, { passive: false });
    }
    
    handleLogarithmicScroll(event) {
        const currentScrollLeft = this.timelineContainer.scrollLeft;
        const currentYear = this.scrollPositionToYear(currentScrollLeft);
        const scrollMultiplier = this.getScrollMultiplier(currentYear);
        
        // Calculate scroll delta with logarithmic scaling
        const delta = event.deltaX || event.deltaY;
        const adjustedDelta = delta * scrollMultiplier;
        
        // Apply the adjusted scroll
        this.timelineContainer.scrollLeft = Math.max(0, 
            Math.min(currentScrollLeft + adjustedDelta, 
                    this.timelineContainer.scrollWidth - this.timelineContainer.clientWidth));
    }
    
    scrollPositionToYear(scrollLeft) {
        const scrollRatio = scrollLeft / Math.max(1, this.timelineWidth - 200);
        return this.minDate + (scrollRatio * this.dateRange);
    }
    
    getScrollMultiplier(currentYear) {
        const config = this.data.config;
        const refYear = config.referenceYear;
        const scrollScale = config.scrollSpeedScale;
        
        const distance = Math.abs(currentYear - refYear);
        
        // Linear multiplier: distance from reference year directly affects scroll speed
        // scrollSpeedScale controls the scaling: smaller values = more aggressive speed increase
        const multiplier = Math.max(1, distance / scrollScale);
        
        return Math.max(0.1, Math.min(1000, multiplier));
    }
    
    updateCurrentTitle() {
        const scrollLeft = this.timelineContainer.scrollLeft;
        const maxScroll = this.timelineContainer.scrollWidth - this.timelineContainer.clientWidth;
        
        let newTitle = this.data.config.defaultTitle;
        
        // If we're at the end of the timeline, show the last title
        if (scrollLeft >= maxScroll - 50) {
            if (this.titles.length > 0) {
                newTitle = this.titles[this.titles.length - 1].title;
            }
        } else {
            // Normal title switching logic
            for (let i = this.titles.length - 1; i >= 0; i--) {
                const title = this.titles[i];
                if (scrollLeft >= title.position - 100) {
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