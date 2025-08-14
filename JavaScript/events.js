
        document.addEventListener('DOMContentLoaded', function() {
            // Get or generate anonymous user ID
            let userId = localStorage.getItem('anonymousUserId');
            if (!userId) {
                userId = 'User' + Math.floor(Math.random() * 10000);
                localStorage.setItem('anonymousUserId', userId);
            }
            
            // Get DOM elements
            const calendarGrid = document.getElementById('calendar-grid');
            const calendarTitle = document.getElementById('calendar-title');
            const prevMonthBtn = document.getElementById('prev-month');
            const nextMonthBtn = document.getElementById('next-month');
            const eventsList = document.getElementById('events-list');
            const filterBtns = document.querySelectorAll('.filter-btn');
            const eventModal = document.getElementById('event-modal');
            const modalClose = document.getElementById('modal-close');
            const createEventForm = document.getElementById('create-event-form');
            const eventForm = document.getElementById('event-form');
            const cancelEventBtn = document.getElementById('cancel-event');
            const rsvpBtn = document.getElementById('rsvp-event');
            const shareBtn = document.getElementById('share-event');
            
            // Initialize data
            let currentDate = new Date();
            let currentMonth = currentDate.getMonth();
            let currentYear = currentDate.getFullYear();
            let currentFilter = 'all';
            let selectedEventId = null;
            
            // Initialize events data
            let events = JSON.parse(localStorage.getItem('gardenEvents')) || [];
            let rsvps = JSON.parse(localStorage.getItem('gardenEventRsvps')) || {};
            
            // Save data to localStorage
            function saveEvents() {
                localStorage.setItem('gardenEvents', JSON.stringify(events));
            }
            
            function saveRsvps() {
                localStorage.setItem('gardenEventRsvps', JSON.stringify(rsvps));
            }
            
            // Format date for display
            function formatDate(dateString) {
                const date = new Date(dateString);
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                return date.toLocaleDateString(undefined, options);
            }
            
            function formatTime(timeString) {
                const [hours, minutes] = timeString.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const formattedHour = hour % 12 || 12;
                return `${formattedHour}:${minutes} ${ampm}`;
            }
            
            // Generate calendar
            function generateCalendar(month, year) {
                // Clear calendar
                calendarGrid.innerHTML = '';
                
                // Add day headers
                const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                dayHeaders.forEach(day => {
                    const dayHeader = document.createElement('div');
                    dayHeader.className = 'calendar-day-header';
                    dayHeader.textContent = day;
                    calendarGrid.appendChild(dayHeader);
                });
                
                // Get first day of month and number of days
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const daysInPrevMonth = new Date(year, month, 0).getDate();
                
                // Add previous month's trailing days
                for (let i = firstDay - 1; i >= 0; i--) {
                    const day = document.createElement('div');
                    day.className = 'calendar-day other-month';
                    const dayNumber = document.createElement('div');
                    dayNumber.className = 'calendar-day-number';
                    dayNumber.textContent = daysInPrevMonth - i;
                    day.appendChild(dayNumber);
                    calendarGrid.appendChild(day);
                }
                
                // Add current month's days
                const today = new Date();
                for (let i = 1; i <= daysInMonth; i++) {
                    const day = document.createElement('div');
                    day.className = 'calendar-day';
                    
                    // Check if it's today
                    if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                        day.classList.add('today');
                    }
                    
                    const dayNumber = document.createElement('div');
                    dayNumber.className = 'calendar-day-number';
                    dayNumber.textContent = i;
                    day.appendChild(dayNumber);
                    
                    // Add events for this day
                    const dayEvents = events.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate.getDate() === i && 
                               eventDate.getMonth() === month && 
                               eventDate.getFullYear() === year;
                    });
                    
                    dayEvents.forEach(event => {
                        const eventElement = document.createElement('div');
                        eventElement.className = `calendar-event ${event.type}`;
                        eventElement.textContent = event.title;
                        eventElement.addEventListener('click', () => showEventModal(event.id));
                        day.appendChild(eventElement);
                    });
                    
                    calendarGrid.appendChild(day);
                }
                
                // Add next month's leading days
                const totalCells = calendarGrid.children.length - 7; // Subtract header row
                const nextMonthDays = 42 - totalCells; // 6 rows * 7 days = 42 cells
                for (let i = 1; i <= nextMonthDays; i++) {
                    const day = document.createElement('div');
                    day.className = 'calendar-day other-month';
                    const dayNumber = document.createElement('div');
                    dayNumber.className = 'calendar-day-number';
                    dayNumber.textContent = i;
                    day.appendChild(dayNumber);
                    calendarGrid.appendChild(day);
                }
                
                // Update calendar title
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                   'July', 'August', 'September', 'October', 'November', 'December'];
                calendarTitle.textContent = `${monthNames[month]} ${year}`;
            }
            
            // Render events list
            function renderEventsList() {
                // Clear events list
                eventsList.innerHTML = '';
                
                // Filter events
                let filteredEvents = events;
                if (currentFilter !== 'all') {
                    filteredEvents = events.filter(event => event.type === currentFilter);
                }
                
                // Sort events by date
                filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
                
                // Check if empty
                if (filteredEvents.length === 0) {
                    eventsList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">📅</div>
                            <h3>No events found</h3>
                            <p>Try changing your filter or check back later for new events.</p>
                        </div>
                    `;
                    return;
                }
                
                // Add events to list
                filteredEvents.forEach(event => {
                    const eventItem = document.createElement('div');
                    eventItem.className = 'event-item';
                    eventItem.dataset.id = event.id;
                    
                    const eventDate = new Date(event.date);
                    const formattedDate = eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    
                    eventItem.innerHTML = `
                        <div class="event-header">
                            <div class="event-title">${event.title}</div>
                            <div class="event-type ${event.type}">${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</div>
                        </div>
                        <div class="event-details">
                            <div class="event-detail">
                                <span>📅</span>
                                <span>${formattedDate}</span>
                            </div>
                            <div class="event-detail">
                                <span>⏰</span>
                                <span>${formatTime(event.time)}</span>
                            </div>
                            <div class="event-detail">
                                <span>📍</span>
                                <span>${event.location}</span>
                            </div>
                        </div>
                    `;
                    
                    eventItem.addEventListener('click', () => showEventModal(event.id));
                    eventsList.appendChild(eventItem);
                });
            }
            
            // Show event modal
            function showEventModal(eventId) {
                const event = events.find(e => e.id === eventId);
                if (!event) return;
                
                selectedEventId = eventId;
                
                // Populate modal
                document.getElementById('modal-event-title').textContent = event.title;
                document.getElementById('modal-event-type').textContent = event.type.charAt(0).toUpperCase() + event.type.slice(1);
                document.getElementById('modal-event-type').className = `modal-event-type ${event.type}`;
                document.getElementById('modal-event-description').textContent = event.description;
                document.getElementById('modal-event-datetime').textContent = `${formatDate(event.date)} at ${formatTime(event.time)}`;
                document.getElementById('modal-event-location').textContent = event.location;
                
                // Update attendees count
                const attendees = rsvps[eventId] || [];
                document.getElementById('modal-event-attendees').textContent = `${attendees.length} people attending`;
                
                // Update RSVP button
                if (attendees.includes(userId)) {
                    rsvpBtn.textContent = 'Cancel RSVP';
                    rsvpBtn.classList.add('rsvpd');
                } else {
                    rsvpBtn.textContent = 'RSVP';
                    rsvpBtn.classList.remove('rsvpd');
                }
                
                // Show modal
                eventModal.style.display = 'flex';
            }
            
            // Close modal
            function closeModal() {
                eventModal.style.display = 'none';
                selectedEventId = null;
            }
            
            // Event listeners
            prevMonthBtn.addEventListener('click', () => {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                generateCalendar(currentMonth, currentYear);
            });
            
            nextMonthBtn.addEventListener('click', () => {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                generateCalendar(currentMonth, currentYear);
            });
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Update active filter
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Update filter and re-render
                    currentFilter = btn.dataset.filter;
                    renderEventsList();
                });
            });
            
            modalClose.addEventListener('click', closeModal);
            
            eventModal.addEventListener('click', (e) => {
                if (e.target === eventModal) {
                    closeModal();
                }
            });
            
            // RSVP button
            rsvpBtn.addEventListener('click', () => {
                if (!selectedEventId) return;
                
                // Initialize RSVPs array for this event if it doesn't exist
                if (!rsvps[selectedEventId]) {
                    rsvps[selectedEventId] = [];
                }
                
                const attendees = rsvps[selectedEventId];
                const userIndex = attendees.indexOf(userId);
                
                if (userIndex === -1) {
                    // User hasn't RSVP'd yet
                    attendees.push(userId);
                    rsvpBtn.textContent = 'Cancel RSVP';
                    rsvpBtn.classList.add('rsvpd');
                } else {
                    // User has RSVP'd, remove RSVP
                    attendees.splice(userIndex, 1);
                    rsvpBtn.textContent = 'RSVP';
                    rsvpBtn.classList.remove('rsvpd');
                }
                
                // Update attendees count
                document.getElementById('modal-event-attendees').textContent = `${attendees.length} people attending`;
                
                // Save RSVPs
                saveRsvps();
            });
            
            // Share button
            shareBtn.addEventListener('click', () => {
                if (!selectedEventId) return;
                
                const event = events.find(e => e.id === selectedEventId);
                if (!event) return;
                
                // In a real app, this would generate a shareable link
                alert(`Share this event: ${event.title}\n\nIn a real application, this would generate a shareable link or open a share dialog.`);
            });
            
            // Show create event form
            document.addEventListener('keydown', (e) => {
                // Ctrl+E or Cmd+E to show create event form
                if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                    e.preventDefault();
                    createEventForm.style.display = 'block';
                    document.getElementById('event-title').focus();
                }
            });
            
            // Cancel event creation
            cancelEventBtn.addEventListener('click', () => {
                createEventForm.style.display = 'none';
                eventForm.reset();
            });
            
            // Create event form submission
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const newEvent = {
                    id: Date.now().toString(),
                    title: document.getElementById('event-title').value,
                    type: document.getElementById('event-type').value,
                    date: document.getElementById('event-date').value,
                    time: document.getElementById('event-time').value,
                    location: document.getElementById('event-location').value,
                    description: document.getElementById('event-description').value,
                    createdBy: userId
                };
                
                events.push(newEvent);
                saveEvents();
                
                // Reset form and hide
                eventForm.reset();
                createEventForm.style.display = 'none';
                
                // Re-render calendar and events list
                generateCalendar(currentMonth, currentYear);
                renderEventsList();
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.style.position = 'fixed';
                successMessage.style.bottom = '20px';
                successMessage.style.right = '20px';
                successMessage.style.backgroundColor = '#4a7c59';
                successMessage.style.color = 'white';
                successMessage.style.padding = '15px 20px';
                successMessage.style.borderRadius = '5px';
                successMessage.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                successMessage.style.zIndex = '1001';
                successMessage.textContent = 'Event created successfully!';
                document.body.appendChild(successMessage);
                
                // Remove success message after 3 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 3000);
            });
            
            // Initialize calendar and events list
            generateCalendar(currentMonth, currentYear);
            renderEventsList();
            
            // Add sample data if empty
            if (events.length === 0) {
                events = [
                    {
                        id: 'event1',
                        title: 'Study Group Session',
                        type: 'meetup',
                        date: '2023-06-15',
                        time: '15:00',
                        location: 'Library, Room 204',
                        description: 'Join us for a collaborative study session for the upcoming finals. Bring your notes and questions!',
                        createdBy: 'User1234'
                    },
                    {
                        id: 'event2',
                        title: 'Virtual Meditation Workshop',
                        type: 'virtual',
                        date: '2023-06-18',
                        time: '18:30',
                        location: 'Online (Zoom)',
                        description: 'Take a break from studying and join our virtual meditation workshop. Learn techniques to reduce stress and improve focus.',
                        createdBy: 'User5678'
                    },
                    {
                        id: 'event3',
                        title: 'Gardening Club Meeting',
                        type: 'workshop',
                        date: '2023-06-22',
                        time: '14:00',
                        location: 'Community Garden',
                        description: 'Learn about sustainable gardening practices and help maintain our community garden. All skill levels welcome!',
                        createdBy: 'User9012'
                    },
                    {
                        id: 'event4',
                        title: 'Movie Night',
                        type: 'meetup',
                        date: '2023-06-25',
                        time: '19:00',
                        location: 'Student Center Lounge',
                        description: 'Relax with a movie night featuring student-selected films. Popcorn and drinks provided!',
                        createdBy: 'User3456'
                    },
                    {
                        id: 'event5',
                        title: 'Career Development Webinar',
                        type: 'virtual',
                        date: '2023-06-28',
                        time: '16:00',
                        location: 'Online (Teams)',
                        description: 'Join industry professionals for a webinar on career development opportunities and internship programs.',
                        createdBy: 'User7890'
                    }
                ];
                
                // Add some sample RSVPs
                rsvps = {
                    'event1': ['User1234', 'User5678', 'User9012'],
                    'event2': ['User1234', 'User3456', 'User7890', 'User1357'],
                    'event3': ['User5678', 'User9012'],
                    'event4': ['User1234', 'User5678', 'User9012', 'User3456', 'User7890'],
                    'event5': ['User3456', 'User7890', 'User1357', 'User2468']
                };
                
                saveEvents();
                saveRsvps();
                generateCalendar(currentMonth, currentYear);
                renderEventsList();
            }
        });
