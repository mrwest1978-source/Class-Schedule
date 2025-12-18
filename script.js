// --- SPECIALS DATA (Unchanged) ---
const dailySpecials = { /* ... */ };

// --- SCHEDULE DATA (Unchanged - Now loads from localStorage) ---
let allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || { /* ... */ };
let currentDailySchedule = []; 
let currentDayType = ''; 

// --- UPCOMING EVENTS DATA (Unchanged - Now loads from localStorage) ---
const defaultEvents = [ /* ... */ ];
let upcomingEvents = JSON.parse(localStorage.getItem('upcomingEvents')) || defaultEvents;

// --- NEW: LEARNING GOALS DATA (Load from LocalStorage or use default) ---
const defaultGoals = [
    "I can use 24-hour clock time to accurately track my schedule.",
    "I can identify and locate today's special class.",
    "I can state the current learning goals for my core subject area."
];
let learningGoals = JSON.parse(localStorage.getItem('learningGoals')) || defaultGoals;


// --- NEW QUOTE FUNCTION (Unchanged) ---
async function displayQuoteOfTheDay() { /* ... */ }

// --- THEME & CLOCK FUNCTIONS (Unchanged) ---
function changeTheme() { /* ... */ }
function updateClock() { /* ... */ }
function selectCurrentSchedule() { /* ... */ }


// --- INPUT HANDLING: SCHEDULE (Unchanged) ---
function updateScheduleFromInput() { 
    // ... (logic to save allSchedules to localStorage) ...
}

// --- INPUT HANDLING: EVENTS (Unchanged) ---
function updateEventsFromInput() {
    // ... (logic to save upcomingEvents to localStorage) ...
}

// --- NEW INPUT HANDLING: GOALS (Added function to parse and save goals) ---
function updateGoalsFromInput() {
    const inputElement = document.getElementById('goals-input');
    // Split input by line and filter out empty lines
    const newGoals = inputElement.value.trim().split('\n').map(g => g.trim()).filter(g => g.length > 0);

    if (newGoals.length > 0) {
        learningGoals = newGoals;
        
        // Save to localStorage
        localStorage.setItem('learningGoals', JSON.stringify(learningGoals));
        
        updateSchedule(); // Refresh display
        alert("Learning Goals updated and saved successfully!");
    } else {
        alert("Please enter at least one learning goal.");
    }
}


// --- SCHEDULE DISPLAY FUNCTION (MODIFIED to include Goals) ---
function updateSchedule() {
    const currentDayName = selectCurrentSchedule(); 
    
    const list = document.getElementById('schedule-list');
    const specialElement = document.getElementById('current-special-activity');
    const goalsListElement = document.getElementById('goals-list'); // NEW
    const eventsListElement = document.getElementById('events-list');
    const now = new Date();
    
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', dateOptions);

    const currentHourMinute = 
        now.getHours().toString().padStart(2, '0') + 
        ":" + 
        now.getMinutes().toString().padStart(2, '0');

    list.innerHTML = ''; 

    // Date Heading
    const dayHeading = document.createElement('h2');
    dayHeading.textContent = dateString; 
    dayHeading.style.textAlign = 'center';
    dayHeading.style.color = 'var(--primary-color)'; 
    list.appendChild(dayHeading);

    // 1. Display the Special Activity
    if (currentDayName in dailySpecials) {
        specialElement.textContent = dailySpecials[currentDayName];
    } else {
        specialElement.textContent = "No Special Today!";
    }

    // 2. Display Learning Goals (NEW LOGIC)
    goalsListElement.innerHTML = ''; 
    
    if (learningGoals.length > 0) {
        learningGoals.forEach(goalText => {
            const goalListItem = document.createElement('li');
            goalListItem.textContent = goalText;
            goalsListElement.appendChild(goalListItem);
        });
    } else {
        goalsListElement.innerHTML = '<li>Set your daily learning objectives here!</li>';
    }


    // 3. Display Upcoming Events (Unchanged)
    eventsListElement.innerHTML = ''; 
    
    const sortedEvents = upcomingEvents.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    let eventCount = 0;

    sortedEvents.forEach(eventData => {
        const eventDate = new Date(eventData.date);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate >= today && eventCount < 5) {
            const eventListItem = document.createElement('li');
            
            const displayDate = eventDate.toLocaleDateString('en-US', {
                weekday: 'short', 
                month: 'numeric', 
                day: 'numeric'
            });

            eventListItem.textContent = `${displayDate}: ${eventData.event}`;
            eventsListElement.appendChild(eventListItem);
            eventCount++;
        }
    });

    if (eventCount === 0) {
        eventsListElement.innerHTML = '<li>No major events scheduled!</li>';
    }


    // 4. Display the Main Schedule (Unchanged)
    currentDailySchedule.forEach((event) => {
        const listItem = document.createElement('li');
        
        const [hour, minute] = event.time.split(':');
        const displayHours = parseInt(hour) % 12 || 12;
        const ampm = parseInt(hour) >= 12 ? 'PM' : 'AM';

        listItem.innerText = `${displayHours}:${minute} ${ampm} - ${event.activity}`;

        if (currentHourMinute >= event.time) {
            listItem.classList.add('current-activity');
            listItem.classList.remove('future-activity');
        } else {
            listItem.classList.add('future-activity');
            listItem.classList.remove('current-activity');
        }

        list.appendChild(listItem);
    });
}


// --- INITIALIZATION: Populates the input boxes (Modified for Goals) ---
function initializeInput(type) {
    // Populate Schedule Input
    if (type === 'schedule' || type === 'all') {
        const scheduleInput = document.getElementById('schedule-input');
        const selectedDayType = document.getElementById('edit-day-select').value; 
        const scheduleToEdit = allSchedules[selectedDayType];
        
        if (scheduleToEdit) {
             const defaultText = scheduleToEdit.map(e => `${e.time},${e.activity}`).join('\n');
             scheduleInput.value = defaultText;
        } else {
             scheduleInput.value = "Schedule not found.";
        }
    }
    
    // Populate Goals Input (NEW LOGIC)
    if (type === 'goals' || type === 'all') {
        const goalsInput = document.getElementById('goals-input');
        const defaultGoalsText = learningGoals.join('\n');
        goalsInput.value = defaultGoalsText;
    }
    
    // Populate Events Input
    if (type === 'events' || type === 'all') {
        const eventsInput = document.getElementById('events-input');
        
        const defaultEventsText = upcomingEvents.map(e => `${e.date},${e.event}`).join('\n');
        eventsInput.value = defaultEventsText;
    }
}


// --- FINAL INITIALIZATION (Unchanged) ---

// 0. Display the quote immediately upon loading
displayQuoteOfTheDay();

// 1. Update the clock every second (1000ms)
updateClock();
setInterval(updateClock, 1000);

// 2. Update the schedule and other data displays every minute (60000ms)
updateSchedule();
setInterval(updateSchedule, 60000);

// 3. Initialize all input fields when the page loads
initializeInput('all');
