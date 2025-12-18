// --- DATA LOADING ---
let dailySpecials = JSON.parse(localStorage.getItem('dailySpecials')) || {
    'Monday': 'PE', 'Tuesday': 'Art', 'Wednesday': 'Music', 'Thursday': 'PE', 'Friday': 'Music'
};
let allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || {
    'Monday': [{time:"08:00", activity:"Arrival"}], 'T-F': [{time:"09:00", activity:"Math"}]
};
let learningGoals = JSON.parse(localStorage.getItem('learningGoals')) || ["Target 1", "Target 2"];
let upcomingEvents = JSON.parse(localStorage.getItem('upcomingEvents')) || [];

// --- CLOCK & QUOTE ---
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function displayQuote() {
    try {
        const res = await fetch('https://api.quotable.io/random');
        const data = await res.json();
        document.getElementById('quote-text').innerText = `“${data.content}”`;
        document.getElementById('quote-author').innerText = `- ${data.author}`;
    } catch (e) {
        document.getElementById('quote-text').innerText = "“Education is the most powerful weapon which you can use to change the world.”";
    }
}

// --- MAIN UPDATE ---
function updateSchedule() {
    const now = new Date();
    const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()];
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

    // Date
    document.getElementById('date-header').innerText = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    // Specials
    document.getElementById('current-special-activity').innerText = dailySpecials[todayName] || "No Special Today";

    // Goals
    document.getElementById('goals-list').innerHTML = learningGoals.map(g => `<li>${g}</li>`).join('');

    // Events
    document.getElementById('events-list').innerHTML = upcomingEvents.map(e => `<li>${e.date}: ${e.event}</li>`).join('');

    // Schedule Items
    const dayType = (todayName === 'Monday') ? 'Monday' : 'T-F';
    const list = document.getElementById('schedule-list');
    list.innerHTML = "";
    (allSchedules[dayType] || []).forEach(item => {
        const li = document.createElement('li');
        li.innerText = `${item.time} - ${item.activity}`;
        if (currentTimeStr >= item.time) li.classList.add('current-activity');
        list.appendChild(li);
    });
}

// --- INPUTS & SAVING ---
function updateSpecialsFromInput() {
    const val = document.getElementById('specials-input').value;
    let obj = {};
    val.split('\n').forEach(l => { const [d, a] = l.split(','); if(d&&a) obj[d.trim()] = a.trim(); });
    dailySpecials = obj;
    localStorage.setItem('dailySpecials', JSON.stringify(dailySpecials));
    updateSchedule();
}

function updateGoalsFromInput() {
    learningGoals = document.getElementById('goals-input').value.split('\n').filter(g => g.trim() !== "");
    localStorage.setItem('learningGoals', JSON.stringify(learningGoals));
    updateSchedule();
}

function updateEventsFromInput() {
    const val = document.getElementById('events-input').value;
    upcomingEvents = val.split('\n').map(l => { const [d, e] = l.split(','); return {date:d?.trim(), event:e?.trim()}; }).filter(i => i.date);
    localStorage.setItem('upcomingEvents', JSON.stringify(upcomingEvents));
    updateSchedule();
}

function updateScheduleFromInput() {
    const day = document.getElementById('edit-day-select').value;
    const val = document.getElementById('schedule-input').value;
    allSchedules[day] = val.split('\n').map(l => { const [t, a] = l.split(','); return {time:t?.trim(), activity:a?.trim()}; }).filter(i => i.time);
    localStorage.setItem('allSchedules', JSON.stringify(allSchedules));
    updateSchedule();
}

function initializeInput(type) {
    if (type === 'all' || type === 'schedule') {
        const day = document.getElementById('edit-day-select').value;
        document.getElementById('schedule-input').value = (allSchedules[day] || []).map(i => `${i.time},${i.activity}`).join('\n');
    }
    if (type === 'all') {
        document.getElementById('specials-input').value = Object.entries(dailySpecials).map(([d, a]) => `${d},${a}`).join('\n');
        document.getElementById('goals-input').value = learningGoals.join('\n');
        document.getElementById('events-input').value = upcomingEvents.map(i => `${i.date},${i.event}`).join('\n');
    }
}

function changeTheme() {
    document.getElementById('app-body').className = 'theme-' + document.getElementById('theme-select').value;
}

// Start
displayQuote();
updateClock();
updateSchedule();
initializeInput('all');
setInterval(updateClock, 1000);
setInterval(updateSchedule, 60000);
