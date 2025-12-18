// --- DATA LOADING ---
let dailySpecials = JSON.parse(localStorage.getItem('dailySpecials')) || {
    'Monday': 'PE', 'Tuesday': 'Art', 'Wednesday': 'Music', 'Thursday': 'PE', 'Friday': 'Music'
};
let allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || {
    'Monday': [{time:"08:00", activity:"Arrival"}], 'T-F': [{time:"09:00", activity:"Math"}]
};
let learningGoals = JSON.parse(localStorage.getItem('learningGoals')) || ["Focus on Math", "Read 20 mins"];
let upcomingEvents = JSON.parse(localStorage.getItem('upcomingEvents')) || [];

// --- THE CLOCK ---
function updateClock() {
    const now = new Date();
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        clockElement.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// --- THE QUOTE (FAIL-SAFE) ---
async function displayQuote() {
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    
    try {
        // Try to get a quote, but only wait 2 seconds
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000);
        
        const res = await fetch('https://api.quotable.io/random', { signal: controller.signal });
        clearTimeout(id);
        
        const data = await res.json();
        quoteText.innerText = `“${data.content}”`;
        quoteAuthor.innerText = `- ${data.author}`;
    } catch (e) {
        // If the internet is slow or blocked, use this backup
        quoteText.innerText = "“Education is the most powerful weapon which you can use to change the world.”";
        quoteAuthor.innerText = "- Nelson Mandela";
    }
}

// --- MAIN UPDATE ---
function updateSchedule() {
    const now = new Date();
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const todayName = dayNames[now.getDay()];
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

    // Update Date
    const dateHeader = document.getElementById('date-header');
    if (dateHeader) {
        dateHeader.innerText = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    }

    // Update Specials
    const specialEl = document.getElementById('current-special-activity');
    if (specialEl) specialEl.innerText = dailySpecials[todayName] || "No Special Today";

    // Update Goals
    const goalsList = document.getElementById('goals-list');
    if (goalsList) goalsList.innerHTML = learningGoals.map(g => `<li>${g}</li>`).join('');

    // Update Events
    const eventsList = document.getElementById('events-list');
    if (eventsList) eventsList.innerHTML = upcomingEvents.map(e => `<li>${e.date}: ${e.event}</li>`).join('');

    // Update Schedule List
    const dayType = (todayName === 'Monday') ? 'Monday' : 'T-F';
    const list = document.getElementById('schedule-list');
    if (list) {
        list.innerHTML = "";
        (allSchedules[dayType] || []).forEach(item => {
            const li = document.createElement('li');
            li.innerText = `${item.time} - ${item.activity}`;
            if (currentTimeStr >= item.time) li.classList.add('current-activity');
            list.appendChild(li);
        });
    }
}

// --- INPUTS & SAVING ---
function updateSpecialsFromInput() {
    const val = document.getElementById('specials-input').value;
    let obj = {};
    val.split('\n').forEach(l => { 
        const parts = l.split(','); 
        if(parts.length >= 2) obj[parts[0].trim()] = parts[1].trim(); 
    });
    dailySpecials = obj;
    localStorage.setItem('dailySpecials', JSON.stringify(dailySpecials));
    updateSchedule();
    alert("Specials Saved!");
}

function updateGoalsFromInput() {
    learningGoals = document.getElementById('goals-input').value.split('\n').filter(g => g.trim() !== "");
    localStorage.setItem('learningGoals', JSON.stringify(learningGoals));
    updateSchedule();
    alert("Goals Saved!");
}

function updateEventsFromInput() {
    const val = document.getElementById('events-input').value;
    upcomingEvents = val.split('\n').map(l => { 
        const parts = l.split(','); 
        return {date: parts[0]?.trim(), event: parts[1]?.trim()}; 
    }).filter(i => i.date && i.event);
    localStorage.setItem('upcomingEvents', JSON.stringify(upcomingEvents));
    updateSchedule();
    alert("Events Saved!");
}

function updateScheduleFromInput() {
    const day = document.getElementById('edit-day-select').value;
    const val = document.getElementById('schedule-input').value;
    allSchedules[day] = val.split('\n').map(l => { 
        const parts = l.split(','); 
        return {time: parts[0]?.trim(), activity: parts[1]?.trim()}; 
    }).filter(i => i.time && i.activity);
    localStorage.setItem('allSchedules', JSON.stringify(allSchedules));
    updateSchedule();
    alert("Schedule Saved!");
}

function initializeInput(type) {
    if (type === 'all' || type === 'schedule') {
        const day = document.getElementById('edit-day-select').value;
        const scheduleInput = document.getElementById('schedule-input');
        if (scheduleInput) {
            scheduleInput.value = (allSchedules[day] || []).map(i => `${i.time},${i.activity}`).join('\n');
        }
    }
    if (type === 'all') {
        const specInput = document.getElementById('specials-input');
        if (specInput) specInput.value = Object.entries(dailySpecials).map(([d, a]) => `${d},${a}`).join('\n');
        
        const goalInput = document.getElementById('goals-input');
        if (goalInput) goalInput.value = learningGoals.join('\n');
        
        const eventInput = document.getElementById('events-input');
        if (eventInput) eventInput.value = upcomingEvents.map(i => `${i.date},${i.event}`).join('\n');
    }
}

function changeTheme() {
    document.body.className = 'theme-' + document.getElementById('theme-select').value;
}

// --- THE START-UP SEQUENCE ---
window.onload = function() {
    updateClock();
    updateSchedule();
    initializeInput('all');
    displayQuote(); // This will now run without crashing the rest
    
    setInterval(updateClock, 1000);
    setInterval(updateSchedule, 60000);
};
