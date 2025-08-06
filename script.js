import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCoFnRRTWN9wiULuTaYf4UcM62dpDgNGyM",
    authDomain: "healthy-boi-11eb8.firebaseapp.com",
    projectId: "healthy-boi-11eb8",
    storageBucket: "healthy-boi-11eb8.firebasestorage.app",
    messagingSenderId: "296111243027",
    appId: "1:296111243027:web:bfd16a419370edb3b5a4e6",
    measurementId: "G-FZTFK24XQ8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const challengeTasks = {
    'week1-2': {
        diet: [
            'No alcohol',
            'No coffee',
            { day: [1, 4, 7, 8, 11, 14], task: 'Drink 250ml beet juice' },
            { day: [2, 5, 9, 12], task: 'Eat 1 cup spinach' },
            { day: [3, 6, 10, 13], task: 'Use 1 tsp grated ginger in water' },
            { day: [1, 3, 5, 7, 9, 11, 13], task: 'Eat a banana' },
            { day: [2, 4, 6, 8, 10, 12, 14], task: 'Eat an orange' }
        ],
        exercise: [
            { day: [1, 4, 7, 10, 13], task: 'Jog 20 minutes' },
            { day: [3, 9], task: 'Gym session (30 minutes)' }
        ],
        sleep: ['Sleep 7 hours on firm mattress', 'Track dizziness'],
        mindset: ['Expect headaches or grumpiness']
    },
    'week3-4': {
        diet: [
            'No alcohol',
            'No coffee',
            { day: [1, 4, 7, 8, 11, 14], task: 'Drink 250ml beet juice' },
            { day: [2, 5, 9, 12], task: 'Eat 1 cup spinach' },
            { day: [3, 6, 10, 13], task: 'Use 1 tsp grated ginger in water' },
            { day: [1, 3, 5, 7, 9, 11, 13], task: 'Eat a banana' },
            { day: [2, 4, 6, 8, 10, 12, 14], task: 'Eat 2 celery stalks' },
            { day: [1, 4, 7, 10, 13], task: 'Eat 1 garlic clove' },
            'Drink 2-3L water'
        ],
        exercise: [
            { day: [1, 4, 7, 10, 13], task: 'Jog 25-30 minutes' },
            { day: [3, 9], task: 'Gym session (30 minutes)' },
            'Stretch 5 minutes post-exercise'
        ],
        sleep: ['Sleep 7 hours', 'Track snoring changes'],
        mindset: ['Push through cravings']
    },
    'week5-8': {
        diet: [
            'No alcohol',
            'No coffee',
            { day: [1, 4, 7, 8, 11, 14], task: 'Drink 250ml beet juice' },
            { day: [2, 5, 9, 12], task: 'Eat 1 cup spinach' },
            { day: [3, 6, 10, 13], task: 'Use 1 tsp grated ginger in water' },
            { day: [1, 3, 5, 7, 9, 11, 13], task: 'Eat a banana' },
            { day: [2, 4, 6, 8, 10, 12, 14], task: 'Eat 2 celery stalks' },
            { day: [1, 4, 7, 10, 13], task: 'Eat 1 garlic clove' },
            { day: [2, 5, 9, 12], task: 'Eat 1 cup kale or broccoli' },
            'No cheat meals'
        ],
        exercise: [
            { day: [1, 4, 7, 10, 13], task: 'Jog 30 minutes' },
            { day: [3, 9], task: 'Gym session (30 minutes)' },
            'Walk 10 minutes on recovery days'
        ],
        sleep: ['Sleep 7-8 hours', 'Track BP weekly'],
        mindset: ['Recheck cortisol/BP with doctor at week 8']
    }
};

let currentMonth = 7; // August 2025 (0-based index)
let currentYear = 2025;

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
        if (currentMonth < 8 || currentYear < 2025) {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            updateCalendar(currentMonth, currentYear);
        }
    });

    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            document.getElementById('taskModal').style.display = 'none';
            document.getElementById('streakModal').style.display = 'none';
        });
    });

    document.querySelectorAll('.achievement').forEach(btn => {
        btn.addEventListener('click', () => showStreakModal(btn.dataset.category));
    });

    // Close streak modal on outside click
    const streakModal = document.getElementById('streakModal');
    streakModal.addEventListener('click', (e) => {
        if (e.target === streakModal) {
            streakModal.style.display = 'none';
        }
    });
}

function updateCalendar(month, year) {
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('monthYear');
    calendar.innerHTML = '';

    const startDate = new Date('2025-08-06');
    const endDate = new Date('2025-09-30');
    const today = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthYear.textContent = `${months[month]} ${year}`;

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.textContent = day;
        dayHeader.style.color = '#fff';
        dayHeader.style.fontWeight = 'bold';
        calendar.appendChild(dayHeader);
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const offset = (firstDayOfMonth + 7) % 7;

    for (let i = 0; i < offset; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        calendar.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayIndex = Math.floor((date - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const week = getWeek(dayIndex);
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        if (!week || date > endDate || date < startDate) {
            dayDiv.className += ' disabled';
        }
        dayDiv.textContent = day;
        dayDiv.dataset.day = day;
        dayDiv.dataset.week = week || '';
        dayDiv.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dayDiv.dataset.dayIndex = dayIndex;
        if (week && date <= endDate && date >= startDate) {
            dayDiv.addEventListener('click', () => showModal(dayDiv, date < today));
        }
        calendar.appendChild(dayDiv);
    }
}

function getWeek(dayIndex) {
    if (dayIndex < 1 || dayIndex > 56) return null;
    if (dayIndex <= 14) return 'week1-2';
    if (dayIndex <= 28) return 'week3-4';
    return 'week5-8';
}

async function showModal(dayDiv, isPastDay = false) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const taskList = document.getElementById('taskList');
    const date = dayDiv.dataset.date;
    const week = dayDiv.dataset.week;
    const dayIndex = parseInt(dayDiv.dataset.dayIndex);
    modalTitle.textContent = `Tasks for ${date}`;
    taskList.innerHTML = '';

    if (!week) {
        taskList.innerHTML = '<p>No tasks for this day.</p>';
        modal.style.display = 'flex';
        return;
    }

    const categories = ['diet', 'exercise', 'sleep', 'mindset'];
    let hasTasks = false;

    for (const category of categories) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.innerHTML = `<h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>`;

        const tasks = challengeTasks[week][category];
        for (const task of tasks) {
            const taskText = typeof task === 'string' ? task : task.task;
            const taskDays = typeof task === 'object' ? task.day : null;
            const shouldDisplay = taskDays ? taskDays.includes(dayIndex % 14 === 0 ? 14 : dayIndex % 14) : true;

            if (shouldDisplay) {
                hasTasks = true;
                const taskId = `task-${date}-${category}-${taskText.replace(/\s+/g, '-')}`;
                const taskDocRef = doc(db, 'tasks', 'boi123', date, taskId);
                const taskDocSnap = await getDoc(taskDocRef);
                const checked = taskDocSnap.exists() ? taskDocSnap.data().checked || false : false;

                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = taskId;
                checkbox.checked = checked;
                checkbox.disabled = isPastDay;
                if (!isPastDay) {
                    checkbox.addEventListener('change', async (e) => {
                        await setDoc(taskDocRef, { checked: e.target.checked }, { merge: true });
                    });
                }

                const label = document.createElement('label');
                label.htmlFor = taskId;
                label.textContent = taskText;

                taskItem.appendChild(checkbox);
                taskItem.appendChild(label);
                categoryDiv.appendChild(taskItem);
            }
        }

        if (categoryDiv.children.length > 1) {
            taskList.appendChild(categoryDiv);
        }
    }

    if (!hasTasks) {
        taskList.innerHTML = '<p>No tasks for this day.</p>';
    }
    modal.style.display = 'flex';
}

async function showStreakModal(category) {
    const streakModal = document.getElementById('streakModal');
    const streakTitle = document.getElementById('streakTitle');
    const streakCount = document.getElementById('streakCount');
    
    streakTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Streak`;
    streakCount.textContent = 'Calculating...';

    const startDate = new Date('2025-08-06');
    const endDate = new Date('2025-09-30');
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= today && currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayIndex = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const week = getWeek(dayIndex);
        if (!week) break;

        let tasksToCheck = [];
        if (category === 'coffee') {
            tasksToCheck = ['No coffee'];
        } else if (category === 'booze') {
            tasksToCheck = ['No alcohol'];
        } else if (category === 'food') {
            tasksToCheck = challengeTasks[week].diet
                .filter(t => {
                    const taskText = typeof t === 'string' ? t : t.task;
                    return !['No alcohol', 'No coffee', 'Drink 2-3L water', 'No cheat meals'].includes(taskText);
                })
                .map(t => typeof t === 'string' ? t : t.task);
        } else if (category === 'sports') {
            tasksToCheck = challengeTasks[week].exercise.map(t => typeof t === 'string' ? t : t.task);
        } else if (category === 'sleep') {
            tasksToCheck = challengeTasks[week].sleep;
        }

        let dayChecked = false;
        for (const task of tasksToCheck) {
            const shouldDisplay = challengeTasks[week][category === 'food' ? 'diet' : category === 'sports' ? 'exercise' : category === 'coffee' || category === 'booze' ? 'diet' : category]
                .some(t => {
                    const taskText = typeof t === 'string' ? t : t.task;
                    if (taskText !== task) return false;
                    return typeof t === 'string' ? true : t.day.includes(dayIndex % 14 === 0 ? 14 : dayIndex % 14);
                });

            if (!shouldDisplay) continue;

            const taskId = `task-${dateStr}-${category === 'sports' ? 'exercise' : category === 'coffee' || category === 'booze' ? 'diet' : category}-${task.replace(/\s+/g, '-')}`;
            const docRef = doc(db, 'tasks', 'boi123', dateStr, taskId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().checked) {
                dayChecked = true;
                break; // For food, coffee, booze: any checked task counts for the day
            }
        }

        if (dayChecked) {
            streak++;
        } else if (category === 'coffee' || category === 'booze' || category === 'sleep' || category === 'sports') {
            break; // Break streak for non-food categories if no task is checked
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    streakCount.textContent = `${streak} day${streak === 1 ? '' : 's'}`;
    streakModal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', initCalendar);