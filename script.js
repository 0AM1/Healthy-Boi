import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCoFnRRTWN9wiULuTaYf4UcM62dpDgNGyM",
    authDomain: "healthy-boi-11eb8.firebaseapp.com",
    projectId: "healthy-boi-11eb8",
    storageBucket: "healthy-boi-11eb8.appspot.com",
    messagingSenderId: "296111243027",
    appId: "1:296111243027:web:bfd16a419370edb3b5a4e6",
    measurementId: "G-FZTFK24XQ8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const challengeTasks = {
    diet: [
        "No alcohol",
        "No coffee",
        { task: "Drink 250ml beet juice", days: [1, 4, 7, 8, 11, 14] },
        { task: "Eat a banana", days: [1, 3, 5, 7, 9, 11, 13] }
    ],
    exercise: [
        "Run 5km",
        { task: "20 push-ups", days: [2, 4, 6, 8, 10, 12] }
    ]
};

let currentMonth = 7; // August (0-based)
let currentYear = 2025;
const startDate = new Date('2025-08-05'); // Start from yesterday
const today = new Date(new Date().toDateString()); // Today at 00:00:00

function initCalendar() {
    updateCalendar(currentMonth, currentYear);
    document.getElementById('prevMonth').addEventListener('click', () => {
        if (currentMonth > 7 || currentYear > 2025) {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            updateCalendar(currentMonth, currentYear);
        }
    });
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar(currentMonth, currentYear);
    });
    document.getElementById('streakButton').addEventListener('click', showStreakModal);
}

function updateCalendar(month, year) {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay + 7) % 7;
    for (let i = 0; i < offset; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'day disabled';
        calendar.appendChild(emptyDiv);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayIndex = Math.floor((date - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const week = getWeek(dayIndex);
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        if (!week || date < startDate) {
            dayDiv.className += ' disabled';
        }
        dayDiv.textContent = day;
        dayDiv.dataset.day = day;
        dayDiv.dataset.week = week || '';
        dayDiv.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dayDiv.dataset.dayIndex = dayIndex;
        if (week && date >= startDate) {
            console.log(`Attaching click event to ${date.toDateString()}, isPastDay: ${date < today}`);
            dayDiv.addEventListener('click', () => {
                console.log(`Clicked on ${date.toDateString()}`);
                showModal(dayDiv, date < today);
            });
        }
        calendar.appendChild(dayDiv);
    }
}

function getWeek(dayIndex) {
    if (dayIndex <= 14) return 'week1-2';
    if (dayIndex <= 28) return 'week3-4';
    if (dayIndex <= 42) return 'week5-6';
    if (dayIndex <= 56) return 'week7-8';
    return `week${Math.ceil(dayIndex / 7)}`; // Dynamic weeks
}

async function showModal(dayDiv, isPastDay) {
    console.log(`Opening modal for ${dayDiv.dataset.date}, isPastDay: ${isPastDay}`);
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = '';
    const date = dayDiv.dataset.date;
    const week = dayDiv.dataset.week;
    const dayIndex = parseInt(dayDiv.dataset.dayIndex);
    if (!week) {
        modalContent.textContent = "No tasks for this day.";
    } else {
        const docRef = doc(db, "progress", date);
        const docSnap = await getDoc(docRef);
        const savedData = docSnap.exists() ? docSnap.data() : {};
        for (const [category, tasks] of Object.entries(challengeTasks)) {
            const categoryDiv = document.createElement('div');
            categoryDiv.innerHTML = `<h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>`;
            tasks.forEach(task => {
                const taskText = typeof task === 'string' ? task : task.task;
                const shouldDisplay = typeof task === 'string' || task.days.includes(dayIndex);
                if (shouldDisplay) {
                    const label = document.createElement('label');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.disabled = isPastDay;
                    checkbox.checked = savedData[`${category}-${taskText}`] || false;
                    if (!isPastDay) {
                        checkbox.addEventListener('change', async () => {
                            await setDoc(docRef, { [`${category}-${taskText}`]: checkbox.checked }, { merge: true });
                        });
                    }
                    label.appendChild(checkbox);
                    label.append(` ${taskText}`);
                    categoryDiv.appendChild(label);
                    categoryDiv.appendChild(document.createElement('br'));
                }
            });
            modalContent.appendChild(categoryDiv);
        }
    }
    modal.style.display = 'block';
}

async function showStreakModal() {
    const modal = document.getElementById('streak-modal');
    const content = document.getElementById('streak-content');
    content.innerHTML = '';
    const streaks = await calculateStreaks();
    for (const [category, streak] of Object.entries(streaks)) {
        content.innerHTML += `<p>${category}: Longest streak = ${streak} days</p>`;
    }
    const achieved = Object.values(streaks).filter(s => s >= 55).length >= 2;
    content.innerHTML += `<p>${achieved ? 'Challenge complete!' : 'Keep going!'}</p>`;
    modal.style.display = 'block';
}

async function calculateStreaks() {
    const streaks = {};
    for (const category of Object.keys(challengeTasks)) {
        let maxStreak = 0;
        let currentStreak = 0;
        for (let day = 0; day <= Math.max(...Object.values(streaks), 56); day++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + day);
            const dateStr = date.toISOString().split('T')[0];
            const docRef = doc(db, "progress", dateStr);
            const docSnap = await getDoc(docRef);
            const data = docSnap.exists() ? docSnap.data() : {};
            const tasksCompleted = challengeTasks[category].every(task => {
                const taskText = typeof task === 'string' ? task : task.task;
                return data[`${category}-${taskText}`] === true;
            });
            if (tasksCompleted) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        streaks[category] = maxStreak;
    }
    return streaks;
}

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});
document.getElementById('closeStreakModal').addEventListener('click', () => {
    document.getElementById('streak-modal').style.display = 'none';
});
window.addEventListener('load', initCalendar);
