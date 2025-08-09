class CustomScrollbar {
    constructor(timeline) {
        this.timeline = timeline;
        this.container = timeline.timelineContainer;
        this.scrollbarContainer = null;
        this.scrollbarTrack = null;
        this.scrollbarThumb = null;

        this.isDragging = false;
        this.dragOffset = 0;

        this.init();
    }

    init() {
        this.createScrollbarElements();
        this.renderEventIndicators();
        this.setupEventListeners();
        this.updateThumbPosition();
    }

    createScrollbarElements() {
        // Remove existing scrollbar overlay
        const existingOverlay = document.getElementById('scrollbar-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create custom scrollbar container
        this.scrollbarContainer = document.createElement('div');
        this.scrollbarContainer.className = 'custom-scrollbar';
        this.scrollbarContainer.innerHTML = `
            <div class="scrollbar-track">
                <div class="scrollbar-thumb"></div>
            </div>
        `;

        document.body.appendChild(this.scrollbarContainer);

        this.scrollbarTrack = this.scrollbarContainer.querySelector('.scrollbar-track');
        this.scrollbarThumb = this.scrollbarContainer.querySelector('.scrollbar-thumb');
    }

    // Map from timeline scroll position to scrollbar position using new conversion functions
    timelineToScrollbar(timelinePosition) {
        const trackWidth = this.scrollbarTrack.clientWidth;
        
        // Convert pixel position to date, then map date to scrollbar chronologically
        const date = this.timeline.pixelToDate(timelinePosition);
        const dateRange = this.timeline.maxDate - this.timeline.minDate;
        
        if (dateRange === 0) return 0;
        
        const chronologicalRatio = (date - this.timeline.minDate) / dateRange;
        return Math.max(0, Math.min(trackWidth, chronologicalRatio * trackWidth));
    }

    scrollbarToTimeline(scrollbarPosition) {
        const containerWidth = this.container.clientWidth;
        const scrollableWidth = this.container.scrollWidth;
        const maxScrollLeft = scrollableWidth - containerWidth;

        const trackWidth = this.scrollbarTrack.clientWidth;
        if (trackWidth === 0) return 0;

        // Convert scrollbar position to chronological ratio, then to date, then to pixel position
        const chronologicalRatio = scrollbarPosition / trackWidth;
        const dateRange = this.timeline.maxDate - this.timeline.minDate;
        const targetDate = this.timeline.minDate + (chronologicalRatio * dateRange);
        
        const timelinePosition = this.timeline.dateToPixel(targetDate);
        
        return Math.max(0, Math.min(maxScrollLeft, timelinePosition));
    }


    renderEventIndicators() {
        const existingIndicators = this.scrollbarTrack.querySelectorAll('.scrollbar-event-indicator');
        existingIndicators.forEach(indicator => indicator.remove());

        if (!this.timeline.events || this.timeline.events.length === 0) {
            return;
        }

        const firstEventDate = this.timeline.parseDate(this.timeline.events[0].date);
        const lastEventDate = this.timeline.parseDate(this.timeline.events[this.timeline.events.length - 1].date);
        const dateRange = lastEventDate - firstEventDate;

        if (dateRange === 0) return;

        const trackWidth = this.scrollbarTrack.clientWidth;

        this.timeline.events.forEach(event => {
            const eventDate = this.timeline.parseDate(event.date);

            const dateRatio = (eventDate - firstEventDate) / dateRange;
            const scrollbarPosition = dateRatio * trackWidth;

            const indicator = document.createElement('div');
            indicator.className = 'scrollbar-event-indicator';
            indicator.style.left = `${scrollbarPosition}px`;

            this.scrollbarTrack.appendChild(indicator);
        });
    }

    setupEventListeners() {
        this.scrollbarThumb.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.isDragging = true;
            const thumbRect = this.scrollbarThumb.getBoundingClientRect();
            this.dragOffset = e.clientX - thumbRect.left;
            document.body.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const trackRect = this.scrollbarTrack.getBoundingClientRect();
                const thumbWidth = this.scrollbarThumb.offsetWidth;

                // We calculate position relative to the track, not the whole thumb travel area.
                const scrollbarPosition = Math.max(0, Math.min(
                    trackRect.width - thumbWidth,
                    e.clientX - trackRect.left - this.dragOffset
                ));

                this.updateScrollFromScrollbar(scrollbarPosition);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                document.body.style.cursor = '';
            }
        });

        this.scrollbarTrack.addEventListener('click', (e) => {
            if (e.target === this.scrollbarThumb) return;

            const trackRect = this.scrollbarTrack.getBoundingClientRect();
            const trackWidth = trackRect.width;
            
            // Calculate click position relative to track
            const rawClickPosition = e.clientX - trackRect.left;
            
            let scrollbarPosition;
            
            if (this.timeline.data.config.fixedSizeScrollbar) {
                // Fixed size scrollbar logic
                const fixedThumbWidth = 20;
                const halfThumbWidth = fixedThumbWidth / 2;
                
                // Center the thumb on the click position, but respect track boundaries
                const centeredPosition = Math.max(
                    halfThumbWidth,
                    Math.min(trackWidth - halfThumbWidth, rawClickPosition)
                );
                
                // The scrollbar position is offset by half thumb width to center it
                scrollbarPosition = centeredPosition - halfThumbWidth;
            } else {
                // Variable size scrollbar logic (original behavior)
                const thumbWidth = this.scrollbarThumb.offsetWidth;
                const halfThumbWidth = thumbWidth / 2;
                
                // Center the thumb on the click position, but respect track boundaries
                const centeredPosition = Math.max(
                    halfThumbWidth,
                    Math.min(trackWidth - halfThumbWidth, rawClickPosition)
                );
                
                // The scrollbar position is offset by half thumb width to center it
                scrollbarPosition = centeredPosition - halfThumbWidth;
            }

            this.updateScrollFromScrollbar(scrollbarPosition);
        });

        this.container.addEventListener('scroll', () => {
            if (!this.isDragging) {
                this.updateThumbPosition();
            }
        });

        window.addEventListener('resize', () => {
            this.renderEventIndicators();
            this.updateThumbPosition();
        });
    }

    updateScrollFromScrollbar(scrollbarPosition) {
        let timelinePosition;
        
        if (this.timeline.data.config.fixedSizeScrollbar) {
            // Fixed size scrollbar logic - reverse the sliding window calculation
            const fixedThumbWidth = 20;
            const containerWidth = this.container.clientWidth;
            const maxScroll = this.container.scrollWidth - containerWidth;
            
            // Convert thumb left edge to center position
            const thumbCenterPos = scrollbarPosition + fixedThumbWidth / 2;
            
            // Convert center position to timeline position
            const representedTimelinePos = this.scrollbarToTimeline(thumbCenterPos);
            
            // Reverse the adjusted progress calculation  
            const transitionDistance = containerWidth * 0.5; // Half screen for transition
            
            if (maxScroll <= 2 * transitionDistance) {
                // Simple case: use linear reverse calculation
                if (maxScroll > 0) {
                    const factor = 1 + containerWidth / maxScroll;
                    timelinePosition = representedTimelinePos / factor;
                } else {
                    timelinePosition = representedTimelinePos;
                }
            } else {
                // Complex case: need to determine which section we're in
                
                // Section 1: First half screen (adjustedProgress = 0 to 0.5)
                // representedPos = currentScroll + (currentScroll / transitionDistance) * 0.5 * containerWidth
                // representedPos = currentScroll * (1 + 0.5 * containerWidth / transitionDistance)
                // Since transitionDistance = containerWidth * 0.5: representedPos = currentScroll * (1 + 1) = currentScroll * 2
                let candidateScroll = representedTimelinePos / 2;
                if (candidateScroll >= 0 && candidateScroll <= transitionDistance) {
                    timelinePosition = candidateScroll;
                }
                // Section 3: Last half screen (adjustedProgress = 0.5 to 1.0)
                else if (candidateScroll >= maxScroll - transitionDistance) {
                    // representedPos = currentScroll + (0.5 + lastScreenProgress * 0.5) * containerWidth
                    // where lastScreenProgress = (currentScroll - (maxScroll - transitionDistance)) / transitionDistance
                    // After substitution and simplification: representedPos = currentScroll * 2 + 0.5 * containerWidth - (maxScroll - transitionDistance)
                    // currentScroll = (representedPos - 0.5 * containerWidth + (maxScroll - transitionDistance)) / 2
                    timelinePosition = (representedTimelinePos - 0.5 * containerWidth + (maxScroll - transitionDistance)) / 2;
                }
                // Section 2: Middle section (adjustedProgress = 0.5)
                else {
                    // representedPos = currentScroll + 0.5 * containerWidth
                    timelinePosition = representedTimelinePos - 0.5 * containerWidth;
                }
            }
            
            // During dragging, update the thumb position directly
            if (this.isDragging) {
                this.scrollbarThumb.style.width = `${fixedThumbWidth}px`;
                this.scrollbarThumb.style.left = `${scrollbarPosition}px`;
            }
        } else {
            // Variable size scrollbar logic (original behavior)
            // Since thumb width is variable, we pass the raw position on the track
            timelinePosition = this.scrollbarToTimeline(scrollbarPosition);
            
            // During dragging, update the thumb position directly without triggering scroll events
            if (this.isDragging) {
                // Calculate thumb width for proper positioning
                const containerWidth = this.container.clientWidth;
                const leftEdgePos = this.timelineToScrollbar(timelinePosition);
                const rightEdgePos = this.timelineToScrollbar(timelinePosition + containerWidth);
                const newThumbWidth = rightEdgePos - leftEdgePos;
                const minThumbWidth = 20;
                
                // Update thumb position and width directly
                this.scrollbarThumb.style.width = `${Math.max(minThumbWidth, newThumbWidth)}px`;
                this.scrollbarThumb.style.left = `${scrollbarPosition}px`;
            }
        }
        
        this.container.scrollLeft = timelinePosition;
    }

    updateThumbPosition() {
        const currentScroll = this.container.scrollLeft;
        const containerWidth = this.container.clientWidth;
        const trackWidth = this.scrollbarTrack.clientWidth;

        if (this.timeline.data.config.fixedSizeScrollbar) {
            // Fixed size scrollbar logic
            const fixedThumbWidth = 20; // Use the minimum thumb width as the fixed size
            
            // Calculate the scroll progress, but transition to center after one screen
            const maxScroll = this.container.scrollWidth - containerWidth;
            let adjustedProgress;
            
            const transitionDistance = containerWidth * 0.5; // Half screen for transition
            
            if (maxScroll <= 2 * transitionDistance) {
                // If timeline is short, use simple linear progress
                adjustedProgress = maxScroll > 0 ? currentScroll / maxScroll : 0;
            } else {
                // Transition to center after half screen, stay center until last half screen
                if (currentScroll <= transitionDistance) {
                    // First half screen: progress from 0 to 0.5
                    adjustedProgress = (currentScroll / transitionDistance) * 0.5;
                } else if (currentScroll >= maxScroll - transitionDistance) {
                    // Last half screen: progress from 0.5 to 1
                    const lastScreenProgress = (currentScroll - (maxScroll - transitionDistance)) / transitionDistance;
                    adjustedProgress = 0.5 + (lastScreenProgress * 0.5);
                } else {
                    // Middle section: stay at 0.5 (center)
                    adjustedProgress = 0.5;
                }
            }
            
            // Calculate which part of the viewport the thumb should represent
            const viewportOffset = adjustedProgress * containerWidth;
            const representedPosition = currentScroll + viewportOffset;
            
            // Convert to scrollbar position
            const scrollbarPos = this.timelineToScrollbar(representedPosition);
            
            // Position the thumb so its center is at this scrollbar position
            let thumbLeft = scrollbarPos - fixedThumbWidth / 2;
            
            // Constrain thumb to track boundaries
            thumbLeft = Math.max(0, Math.min(trackWidth - fixedThumbWidth, thumbLeft));
            
            this.scrollbarThumb.style.width = `${fixedThumbWidth}px`;
            this.scrollbarThumb.style.left = `${thumbLeft}px`;
        } else {
            // Variable size scrollbar logic (original behavior)
            // Calculate the scrollbar positions for the left and right edges of the viewport.
            const leftEdgePos = this.timelineToScrollbar(currentScroll);
            const rightEdgePos = this.timelineToScrollbar(currentScroll + containerWidth);

            // The thumb's width is the difference between the two edges.
            const newThumbWidth = rightEdgePos - leftEdgePos;

            // Use a minimum width to ensure the thumb is always grabbable.
            const minThumbWidth = 20;

            this.scrollbarThumb.style.width = `${Math.max(minThumbWidth, newThumbWidth)}px`;

            // The thumb's position is the position of the left edge.
            this.scrollbarThumb.style.left = `${leftEdgePos}px`;
        }
    }

    destroy() {
        if (this.scrollbarContainer) {
            this.scrollbarContainer.remove();
        }
        // You might want to add logic here to remove the document/window event listeners
        // to prevent memory leaks if the timeline can be destroyed and recreated dynamically.
    }
}