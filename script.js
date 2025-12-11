// --- INITIAL DATA: This is the default if no local storage data exists. ---
const defaultDailySpecials = {
    'Monday': 'Physical Education 🤸',
    'Tuesday': 'Art 🎨',
    'Wednesday': 'Music 🎶',
    'Thursday': 'Physical Education 🤸',
    'Friday': 'Music 🎶', 
    'T-F': 'Physical Education 🤸' 
};

const defaultAllSchedules = {
    'Monday': [
        { time: "08:00", activity: "Assembly 📢" },
        { time: "09:00", activity: "Special Guest Lecture 🎤" },
        { time: "10:30", activity: "Planning Period / Office Hours 🗓️" },
        { time: "12:00", activity: "Lunch Break 🍕" },
        { time: "13:00", activity: "First Period - English 📚" },
        { time: "14:00", activity: "Second Period - Math 📐" },
        { time: "15:00", activity: "End of Day Review 📋" }
    ],
    'T-F': [
        { time: "08:00", activity: "Homeroom / Bellwork 🔔" },
        { time: "09:00", activity: "First Period - Math 📐" },
        { time: "10:00", activity: "Second Period - Science 🧪" },
        { time: "11:00", activity: "Third Period - History 🌎" },
        { time: "12:00", activity: "Lunch Break 🍕" },
        { time: "13:00", activity: "Fourth Period - English 📚" },
        { time: "14:00", activity: "Fifth Period - Art/Gym 🎨" },
        { time: "15:00", activity: "Teacher Planning & Prep 📋" }
    ]
};

// Global objects to hold the currently loaded/customized data
let dailySpecials = {}; 
let allSchedules = {}; 
let currentDailySchedule = []; 
let currentDayType = ''; 

// --- CORE FUNCTIONS FOR PERSISTENCE ---

function loadSchedules() {
    const savedSchedules = localStorage.getItem('allSchedules');
    if (savedSchedules) {
        try {
            allSchedules = JSON.parse(savedSchedules);
            console.log("Schedules: Successfully loaded saved data.");
        } catch (e) {
            console.error("Error loading schedules from localStorage:", e);
            allSchedules = defaultAllSchedules;
        }
    } else {
        allSchedules = defaultAllSchedules;
        console.log("Schedules: Using default data (No saved data found).");
    }
}

function loadSpecials() {
    const savedSpecials = localStorage.getItem('dailySpecials');
    if (savedSpecials) {
        try {
            dailySpecials = JSON.parse(savedSpecials);
            console.log("Specials: Successfully loaded saved data.");
        } catch (e) {
            console.error("Error loading specials from localStorage:", e);
            dailySpecials = defaultDailySpecials;
        }
    } else {
        dailySpecials = defaultDailySpecials;
        console.log("Specials: Using default data (No saved data found).");
    }
    // Ensure T-F fallback is present
    if (!dailySpecials['T-F']) {
         dailySpecials['T-F'] = defaultDailySpecials['T-F'];
    }
}

// 1. Populates the schedules input box 
function initializeInput() {
    loadSchedules(); 
    const inputElement = document.getElementById('schedule-input');
    const selectedDayType = document.getElementById('edit-day-select').value; 
    
    const scheduleToEdit = allSchedules[selectedDayType];
    
    if (scheduleToEdit) {
         const defaultText = scheduleToEdit.map(e => `${e.time},${e.activity}`).join('\n');
         inputElement.value = defaultText;
    } else {
         inputElement.value = "Schedule not found.";
    }
}

// 2. Populates the specials input box
function initializeSpecialsInput() {
    loadSpecials();
    const inputElement = document.getElementById('specials-input');
    
    const specialsText = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        .map(day => {
            // Retrieve data using the key, and ensure we don't accidentally display the T-F fallback here
            return `${day},${dailySpecials[day] && dailySpecials[day] !== defaultDailySpecials['T-F'] ? dailySpecials[day] : defaultDailySpecials[day]}`; 
        })
        .join('\n');
    
    inputElement.value = specialsText;
}


// 3. Saves the data from the Specials input box to localStorage
function updateSpecialsFromInput() {
    const inputElement = document.getElementById('specials-input');
    const inputLines = inputElement.value.trim().split('\n');
    const newSpecials = {};
    let requiredDaysFound = 0;
    
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    inputLines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 2) {
            const day = parts[0].trim();
            const activity = parts.slice(1).join(',').trim(); 
            
            if (validDays.includes(day)) {
                newSpecials[day] = activity;
                requiredDaysFound++;
            }
        }
    });
    
    if (requiredDaysFound >= 5) {
        // Add the T-F value for internal logic
        newSpecials['T-F'] = defaultDailySpecials['T-F']; 
        
        // --- CRITICAL FIX: Save to localStorage
        localStorage.setItem('dailySpecials', JSON.stringify(newSpecials));
        
        // Debugging check
        console.log("Specials Save Attempted. Retrieved data immediately after save:", localStorage.getItem('dailySpecials'));
        
        loadSpecials(); 
        updateSchedule(); 
        alert("Weekly Specials updated and saved successfully! Please refresh the page now to confirm persistence.");
    } else {
        alert("Update failed. Please ensure you have defined a special for Monday, Tuesday, Wednesday, Thursday, AND Friday using the format: DayName,Activity");
    }
}


// 4. Saves the data from the Main Schedule input box to localStorage
function updateScheduleFromInput() {
    const inputElement = document.getElementById('schedule-input');
    const dayToEdit = document.getElementById('edit-day-select').value; 
    
    const inputLines = inputElement.value.trim().split('\n');
    const newSchedule = [];
    
    inputLines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 2) {
            const timePart = parts[0].trim();
            const activityPart = parts.slice(1).join(',').trim(); 
            
            if (/^\d{2}:\d{2}$/.test(timePart)) {
                newSchedule.push({ time: timePart, activity: activityPart });
            }
        }
    });

    newSchedule.sort((a, b) => a.time.localeCompare(b.time));
    
    if (newSchedule.length > 0) {
        allSchedules[dayToEdit] = newSchedule; 
        
        // --- CRITICAL FIX: Save to localStorage
        localStorage.setItem('allSchedules', JSON.stringify(allSchedules));
        
        // Debugging check
        console.log("Schedules Save Attempted. Retrieved data immediately after save:", localStorage.getItem('allSchedules'));
        
        if (dayToEdit === currentDayType) {
             currentDailySchedule = newSchedule;
             updateSchedule(); 
        }
        alert(`Schedule for ${dayToEdit} updated and saved successfully! Please refresh the page now to confirm persistence.`);
    } else {
        alert("Could not update schedule. Please check the format: HH:MM,Activity");
    }
}


// --- OTHER UTILITY FUNCTIONS ---

async function displayQuoteOfTheDay() {
    const quoteUrl = 'https://api.quotable.io/random';

    try {
        const response = await fetch(quoteUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const quoteText = data.content;
        const quoteAuthor = data.author;

        document.getElementById('quote-text').innerText = `“${quoteText}”`;
        document.getElementById('quote-author').innerText = `- ${quoteAuthor}`;

    } catch (error) {
        console.error("Could not fetch a quote from the API:", error);
        
        document.getElementById('quote-text').innerText = "“Education is not the learning of facts, but the training of the mind to think.”";
        document.getElementById('quote-author').innerText = "- Albert Einstein";
    }
}


function changeTheme() {
    const themeSelector = document.getElementById('theme-select');
    const selectedTheme = themeSelector.value;
    const body = document.getElementById('app-body');
    
    body.className = '';
    if (selectedTheme !== 'default') {
        body.classList.add(`theme-${selectedTheme}`);
    }
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; 
    const timeString = `${displayHours}:${minutes} ${ampm}`; 
    document.getElementById('clock').innerText = timeString;
}

function selectCurrentSchedule() {
    loadSchedules(); 
    const dayIndex = new Date().getDay(); 
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[dayIndex];

    let newDayType = '';

    if (dayIndex === 1) { // Monday
        newDayType = 'Monday';
    } else if (dayIndex >= 2 && dayIndex <= 5) { // Tuesday through Friday
        newDayType = 'T-F';
    } else {
        currentDailySchedule = [{ time: "00:00", activity: "🎉 Weekend: No Classes Today! 🎉" }];
        currentDayType = 'Weekend';
        return currentDayName; 
    }
    
    if (newDayType !== currentDayType) {
        currentDayType = newDayType;
        currentDailySchedule = allSchedules[currentDayType];
        document.getElementById('edit-day-select').value = newDayType;
        initializeInput();
    }
    return currentDayName; 
}

function updateSchedule() {
    loadSpecials(); 
    const currentDayName = selectCurrentSchedule(); 
    
    const list = document.getElementById('schedule-list');
    const specialElement = document.getElementById('current-special-activity');
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

    // Display the Special Activity
    if (currentDayName in dailySpecials) {
        specialElement.textContent = dailySpecials[currentDayName];
    } else if (currentDayType === 'T-F' && dailySpecials['T-F']) {
        specialElement.textContent = dailySpecials['T-F'];
    }
    else {
        specialElement.textContent = "No Special Today!";
    }


    // Display the Main Schedule
    currentDailySchedule.forEach((event) => {
        const listItem = document.createElement('li');
        
        const [hour, minute] = event.time.split(':');
        const displayHours = parseInt(hour) % 12 || 12;
        const ampm = parseInt(hour) >= 12 ? 'PM' : 'AM';

        listItem.innerText = `${displayHours}:${minute} ${ampm} - ${event.activity}`;

        // Highlight Logic
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


// --- FINAL INITIALIZATION ---

// 1. Load data from persistence first
loadSchedules(); 
loadSpecials(); 

// 2. Initialize display elements
displayQuoteOfTheDay();
initializeSpecialsInput();
initializeInput(); 

// 3. Set up timers
updateClock();
setInterval(updateClock, 1000);

updateSchedule();
setInterval(updateSchedule, 60000);