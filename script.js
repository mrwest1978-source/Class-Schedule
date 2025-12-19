let data = JSON.parse(localStorage.getItem('mrWestData')) || {
    specials: {"Monday":"Art", "Tuesday":"Music", "Wednesday":"PE", "Thursday":"Library", "Friday":"PE"},
    goals: ["Stay Focused", "Work Together"],
    events: [{date: "12/20", title: "Winter Break"}],
    schedules: { "Monday": [{t:"08:00", a:"Arrival"}], "T-F": [{t:"08:15", a:"Morning Work"}] }
};

function updateDisplay() {
    const now = new Date();
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = dayNames[now.getDay()];
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

    // 1. Clock & Date
    document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('date-header').innerText = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    // 2. Special
    document.getElementById('special-activity').innerText = data.specials[today] || "No Special Today";

    // 3. Goals
    document.getElementById('goals-list').innerHTML = data.goals.map(g => `<li>${g}</li>`).join('');

    // 4. Events
    document.getElementById('events-list').innerHTML = data.events.map(e => `<li>${e.date}: ${e.title}</li>`).join('');

    // 5. Schedule Items
    const activeSched = (today === 'Monday') ? data.schedules["Monday"] : data.schedules["T-F"];
    const list = document.getElementById('schedule-list');
    list.innerHTML = "";
    activeSched.forEach(item => {
        const li = document.createElement('li');
        li.innerText = `${item.t} - ${item.a}`;
        if (timeStr >= item.t) li.classList.add('current-activity');
        list.appendChild(li);
    });
}

function saveAllData() {
    // Specials
    const specLines = document.getElementById('input-specials').value.split('\n');
    data.specials = {};
    specLines.forEach(l => { const p = l.split(','); if(p.length==2) data.specials[p[0].trim()] = p[1].trim(); });

    // Goals
    data.goals = document.getElementById('input-goals').value.split('\n').filter(g => g.trim() !== "");

    // Events
    const eventLines = document.getElementById('input-events').value.split('\n');
    data.events = eventLines.map(l => { const p = l.split(','); return {date:p[0]?.trim(), title:p[1]?.trim()}; }).filter(i => i.date);

    // Schedule
    const dayType = document.getElementById('day-selector').value;
    const schedLines = document.getElementById('input-schedule').value.split('\n');
    data.schedules[dayType] = schedLines.map(l => { const p = l.split(','); return {t:p[0]?.trim(), a:p[1]?.trim()}; }).filter(i => i.t);

    localStorage.setItem('mrWestData', JSON.stringify(data));
    updateDisplay();
    alert("✅ iPad Updated Successfully!");
}

function initializeInputs() {
    document.getElementById('input-specials').value = Object.entries(data.specials).map(([d, a]) => `${d},${a}`).join('\n');
    document.getElementById('input-goals').value = data.goals.join('\n');
    document.getElementById('input-events').value = data.events.map(e => `${e.date},${e.title}`).join('\n');
    const dayType = document.getElementById('day-selector').value;
    document.getElementById('input-schedule').value = data.schedules[dayType].map(i => `${i.t},${i.a}`).join('\n');
}

window.onload = () => {
    updateDisplay();
    initializeInputs();
    setInterval(updateDisplay, 1000);
};
