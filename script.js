// --- DATA: SPECIALS ---
const dailySpecials = {
    'Monday': 'Physical Education 🤸',
    'Tuesday': 'Art 🎨',
    'Wednesday': 'Music 🎶',
    'Thursday': 'Physical Education 🤸',
    'Friday': 'Music 🎶'
};

// --- DATA: LOAD FROM STORAGE ---
let allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || {
    'Monday': [{ time: "08:00", activity: "Assembly 📢" }, { time: "12:00", activity: "Lunch 🍕" }],
    'T-F': [{ time: "09:00", activity: "Math 📐" }, { time: "12:00", activity: "Lunch 🍕" }]
};

let upcomingEvents = JSON.parse(localStorage.getItem('upcomingEvents')) || [
    { date: "12/25/2025", event: "Winter Break ❄️" }
];

let learningGoals = JSON.parse(localStorage.getItem('learningGoals')) || [
    "I can follow my daily schedule.",
    "I can identify my learning targets."
];

let currentDailySchedule = [];
let currentDayType = '';

// --- FUNCTION: FETCH INTERNET QUOTE ---
async function displayQuoteOfTheDay() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        document.getElementById('quote-text').innerText = `“${data.content}”`;
        document.getElementById('quote-author').innerText = `- ${data.author}`;
    } catch (error) {
        document.getElementById('quote-text').innerText = "“The beautiful thing about learning is that no one can take it away from you.”";
        document.getElementById('quote-author').innerText = "- B.B. King";
    }
}

// --- FUNCTION: THEME SWITCHER ---
function changeTheme() {
    const theme = document.getElementById('theme-select').value;
    const body = document.getElementById('app-body');
    body.className = (theme === 'default') ? 'theme-default' : `theme-${theme}`;
}

// --- FUNCTION: CLOCK ---
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// --- FUNCTION: REFRESH DISPLAY ---
function updateSchedule() {
    const now = new Date();
    const dayIndex = now.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[dayIndex];

    // 1. Determine Schedule Type
    if (dayIndex === 1) currentDayType = 'Monday';
    else if (dayIndex >= 2 && dayIndex <= 5) currentDayType = 'T-F';
    else currentDayType = 'Weekend';

    currentDailySchedule = (currentDayType === 'Weekend') ? [] : allSchedules[currentDayType];

    // 2. Display Special
    document.getElementById('current-special-activity').innerText = dailySpecials[todayName] || "No Special Today";

    // 3. Display Goals
    const goalsList = document.getElementById('goals-list');
    goalsList.innerHTML = learningGoals.map(g => `<li>${g}</li>`).join('');

    // 4. Display Events
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = upcomingEvents.map(e => `<li><strong>${e.date}:</strong> ${e.event}</li>`).join('');

    // 5. Display Schedule
    const list = document.getElementById('schedule-list');
    list.innerHTML = `<h2>${now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</h2>`;
    
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

    if (currentDailySchedule.length === 0) {
        list.innerHTML += "<li>🎉 Enjoy your weekend!</li>";
    } else {
        currentDailySchedule.forEach(item => {
            const li = document.createElement('li');
            li.innerText = `${item.time} - ${item.activity}`;
            li.className = (currentTimeStr >= item.time) ? 'current-activity' : 'future-activity';
            list.appendChild(li);
        });
    }
}

// --- FUNCTIONS: SAVE INPUTS ---
function updateScheduleFromInput() {
    const input = document.getElementById('schedule-input').value;
    const day = document.getElementById('edit-day-select').value;
    allSchedules[day] = input.split('\n').map(line => {
        const [time, act] = line.split(',');
        return { time: time?.trim(), activity: act?.trim() };
    }).filter(i => i.time && i.activity);
    localStorage.setItem('allSchedules', JSON.stringify(allSchedules));
    updateSchedule();
    alert("Schedule Saved!");
}

function updateGoalsFromInput() {
    learningGoals = document.getElementById('goals-input').value.split('\n').filter(g => g.trim() !== "");
    localStorage.setItem('learningGoals', JSON.stringify(learningGoals));
    updateSchedule();
    alert("Goals Saved!");
}

function updateEventsFromInput() {
    const input = document.getElementById('events-input').value;
    upcomingEvents = input.split('\n').map(line => {
        const [date, ev] = line.split(',');
        return { date: date?.trim(), event: ev?.trim() };
    }).filter(i => i.date && i.event);
    localStorage.setItem('upcomingEvents', JSON.stringify(upcomingEvents));
    updateSchedule();
    alert("Events Saved!");
}

// --- INITIALIZE ---
function initializeInput(type) {
    if (type === 'all' || type === 'schedule') {
        const day = document.getElementById('edit-day-select').value;
        document.getElementById('schedule-input').value = allSchedules[day].map(i => `${i.time},${i.activity}`).join('\n');
    }
    if (type === 'all') {
        document.getElementById('goals-input').value = learningGoals.join('\n');
        document.getElementById('events-input').value = upcomingEvents.map(i => `${i.date},${i.event}`).join('\n');
    }
}

// Start everything
displayQuoteOfTheDay();
updateClock();
updateSchedule();
initializeInput('all');
setInterval(updateClock, 1000);
setInterval(updateSchedule, 60000);
