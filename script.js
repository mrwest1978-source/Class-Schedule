let dailySpecials = JSON.parse(localStorage.getItem('dailySpecials')) || {
    'Monday': 'Art', 'Tuesday': 'Music', 'Wednesday': 'PE', 'Thursday': 'Media', 'Friday': 'PE'
};
let allSchedules = JSON.parse(localStorage.getItem('allSchedules')) || {
    'Monday': [{time:"08:00", activity:"Arrival"}], 
    'T-F': [{time:"08:30", activity:"Morning Meeting"}]
};
let learningGoals = JSON.parse(localStorage.getItem('learningGoals')) || ["Be Kind", "Work Hard"];

function updateClockAndDate() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('date-header').innerText = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function updateSchedule() {
    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = days[now.getDay()];
    const timeNow = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

    document.getElementById('current-special-activity').innerText = dailySpecials[today] || "No Special";
    document.getElementById('goals-list').innerHTML = learningGoals.map(g => `<li>${g}</li>`).join('');

    const dayType = (today === 'Monday') ? 'Monday' : 'T-F';
    const list = document.getElementById('schedule-list');
    list.innerHTML = "";
    (allSchedules[dayType] || []).forEach(item => {
        const li = document.createElement('li');
        li.innerText = `${item.time} - ${item.activity}`;
        if (timeNow >= item.time) li.classList.add('current-activity');
        list.appendChild(li);
    });
}

function updateSpecialsFromInput() {
    const val = document.getElementById('specials-input').value;
    let obj = {};
    val.split('\n').forEach(l => { const p = l.split(','); if(p.length==2) obj[p[0].trim()] = p[1].trim(); });
    dailySpecials = obj;
    localStorage.setItem('dailySpecials', JSON.stringify(dailySpecials));
    updateSchedule();
}

function updateScheduleFromInput() {
    const day = document.getElementById('edit-day-select').value;
    const val = document.getElementById('schedule-input').value;
    allSchedules[day] = val.split('\n').map(l => { const p = l.split(','); return {time:p[0]?.trim(), activity:p[1]?.trim()}; }).filter(i => i.time);
    localStorage.setItem('allSchedules', JSON.stringify(allSchedules));
    updateSchedule();
}

function updateGoalsFromInput() {
    learningGoals = document.getElementById('goals-input').value.split('\n').filter(g => g.trim() !== "");
    localStorage.setItem('learningGoals', JSON.stringify(learningGoals));
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
    }
}

window.onload = () => {
    updateClockAndDate();
    updateSchedule();
    initializeInput('all');
    setInterval(updateClockAndDate, 1000);
    setInterval(updateSchedule, 60000);
};
