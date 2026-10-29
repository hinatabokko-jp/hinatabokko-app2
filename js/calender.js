import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { calendarDb, calendarEventsRef } from "./config.js";

let calCurrentDate = new Date();
let calSelectedView = 'month';
let calendarEvents = [];
let calActiveColors = ['color-blue', 'color-yellow', 'color-red'];
let currentViewingDateStr = null;

const calendarModalOverlay = document.getElementById('calendar-modal-overlay');
const calendarModalOpenBtn = document.getElementById('calendar-modal-open-btn');
const calendarModalCloseBtn = document.getElementById('calendar-modal-close-btn');

const calCalendarGrid = document.getElementById('cal-calendarGrid');
const calCurrentDateDisplay = document.getElementById('cal-currentDateDisplay');
const calPrevBtn = document.getElementById('cal-prevBtn');
const calNextBtn = document.getElementById('cal-nextBtn');
const calTodayBtn = document.getElementById('cal-todayBtn');
const calAddEventBtn = document.getElementById('cal-addEventBtn');

const calViewModal = document.getElementById('cal-viewModal');
const calCloseViewModalBtn = document.getElementById('cal-closeViewModalBtn');
const calViewCloseBtn = document.getElementById('cal-viewCloseBtn');
const calViewEditBtn = document.getElementById('cal-viewEditBtn');
const calViewDate = document.getElementById('cal-viewDate');
const calViewDescriptionList = document.getElementById('cal-viewDescriptionList');

const calEventModal = document.getElementById('cal-eventModal');
const calModalTitle = document.getElementById('cal-modalTitle');
const calCloseModalBtn = document.getElementById('cal-closeModalBtn');
const calCancelModalBtn = document.getElementById('cal-cancelModalBtn');
const calEventForm = document.getElementById('cal-eventForm');
const calDeleteEventBtn = document.getElementById('cal-deleteEventBtn');

const calEventIdInput = document.getElementById('cal-eventId');
const calEventDateInput = document.getElementById('cal-eventDate');
const calEventColorInput = document.getElementById('cal-eventColor');
const calEventDescriptionInput = document.getElementById('cal-eventDescription');

calendarModalOpenBtn.addEventListener('click', () => {
  calCurrentDate = new Date();
  calendarModalOverlay.classList.add('active');
  renderCalendarApp();
});
calendarModalCloseBtn.addEventListener('click', () => calendarModalOverlay.classList.remove('active'));
calendarModalOverlay.addEventListener('click', (e) => {
  if (e.target === calendarModalOverlay) calendarModalOverlay.classList.remove('active');
});

onValue(calendarEventsRef, (snapshot) => {
  const data = snapshot.val() || {};
  calendarEvents = Object.keys(data).map(k => ({ id: k, ...data[k] }));
  if (calendarModalOverlay.classList.contains('active')) {
    renderCalendarApp();
  }
});

function isJapaneseHoliday(dateObj) {
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth() + 1;
  const d = dateObj.getDate();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${y}-${pad(m)}-${pad(d)}`;

  function getHolidays(year) {
    let holidays = {};
    holidays[`${year}-01-01`] = "元日";
    holidays[`${year}-02-11`] = "建国記念の日";
    holidays[`${year}-02-23`] = "天皇誕生日";
    holidays[`${year}-04-29`] = "昭和の日";
    holidays[`${year}-05-03`] = "憲法記念日";
    holidays[`${year}-05-04`] = "みどりの日";
    holidays[`${year}-05-05`] = "こどもの日";
    holidays[`${year}-08-11`] = "山の日";
    holidays[`${year}-11-03`] = "文化の日";
    holidays[`${year}-11-23`] = "勤労感謝の日";

    let vernalDay = Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
    let autumnDay = Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
    holidays[`${year}-03-${pad(vernalDay)}`] = "春分の日";
    holidays[`${year}-09-${pad(autumnDay)}`] = "秋分の日";

    let jan1 = new Date(year, 0, 1).getDay();
    let adultDay = 1 + (1 - jan1 + 7) % 7 + 7;
    holidays[`${year}-01-${pad(adultDay)}`] = "成人の日";

    let jul1 = new Date(year, 6, 1).getDay();
    let marineDay = 1 + (1 - jul1 + 7) % 7 + 14;
    holidays[`${year}-07-${pad(marineDay)}`] = "海の日";

    let sep1 = new Date(year, 8, 1).getDay();
    let respectDay = 1 + (1 - sep1 + 7) % 7 + 14;
    holidays[`${year}-09-${pad(respectDay)}`] = "敬老の日";

    let oct1 = new Date(year, 9, 1).getDay();
    let sportsDay = 1 + (1 - oct1 + 7) % 7 + 7;
    holidays[`${year}-10-${pad(sportsDay)}`] = "スポーツの日";

    let baseDates = Object.keys(holidays).sort();
    let addedSubstitutes = {};
    baseDates.forEach(dateStr => {
      let dt = new Date(dateStr);
      if (dt.getDay() === 0) {
        let subDt = new Date(dt);
        subDt.setDate(subDt.getDate() + 1);
        while (holidays[`${subDt.getFullYear()}-${pad(subDt.getMonth()+1)}-${pad(subDt.getDate())}`]) {
          subDt.setDate(subDt.getDate() + 1);
        }
        let subStr = `${subDt.getFullYear()}-${pad(subDt.getMonth()+1)}-${pad(subDt.getDate())}`;
        addedSubstitutes[subStr] = "振替休日";
      }
    });
    Object.assign(holidays, addedSubstitutes);
    return holidays;
  }

  const currentYearHolidays = getHolidays(y);
  return !!currentYearHolidays[dateStr];
}

calPrevBtn.addEventListener('click', () => {
  if (calSelectedView === 'month') calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
  else if (calSelectedView === 'week') calCurrentDate.setDate(calCurrentDate.getDate() - 7);
  else calCurrentDate.setDate(calCurrentDate.getDate() - 1);
  renderCalendarApp();
});

calNextBtn.addEventListener('click', () => {
  if (calSelectedView === 'month') calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
  else if (calSelectedView === 'week') calCurrentDate.setDate(calCurrentDate.getDate() + 7);
  else calCurrentDate.setDate(calCurrentDate.getDate() + 1);
  renderCalendarApp();
});

calTodayBtn.addEventListener('click', () => {
  calCurrentDate = new Date();
  renderCalendarApp();
});

calendarModalOverlay.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    calendarModalOverlay.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    calSelectedView = e.target.dataset.view;
    renderCalendarApp();
  });
});

document.querySelectorAll('#cal-colorSelectContainer .color-select-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#cal-colorSelectContainer .color-select-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    calEventColorInput.value = btn.dataset.color;
  });
});

calAddEventBtn.addEventListener('click', () => openCalModal());
calCloseModalBtn.addEventListener('click', closeCalModal);
calCancelModalBtn.addEventListener('click', closeCalModal);
calEventModal.addEventListener('click', (e) => {
  if (e.target === calEventModal) closeCalModal();
});

const closeCalViewModal = () => { calViewModal.classList.remove('active'); };
calCloseViewModalBtn.addEventListener('click', closeCalViewModal);
calViewCloseBtn.addEventListener('click', closeCalViewModal);
calViewModal.addEventListener('click', (e) => {
  if (e.target === calViewModal) closeCalViewModal();
});
calViewEditBtn.addEventListener('click', () => {
  closeCalViewModal();
  openCalModal(null, currentViewingDateStr);
});

calEventForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = calEventIdInput.value;
  const newEvent = {
    date: calEventDateInput.value,
    color: calEventColorInput.value,
    description: calEventDescriptionInput.value.trim()
  };

  if (id) {
    await update(ref(calendarDb, `calendar_events/${id}`), newEvent);
  } else {
    await push(calendarEventsRef, newEvent);
  }
  closeCalModal();
  renderCalendarApp();
});

calDeleteEventBtn.addEventListener('click', async () => {
  const id = calEventIdInput.value;
  if (!id) return;
  if (confirm('この予定が削除されます。よろしいですか？')) {
    await remove(ref(calendarDb, `calendar_events/${id}`));
    closeCalModal();
    renderCalendarApp();
  }
});

function renderCalendarApp() {
  renderCalHeaderDate();
  renderCalCalendarGrid();
}

function renderCalHeaderDate() {
  const year = calCurrentDate.getFullYear();
  const month = calCurrentDate.getMonth() + 1;
  const day = calCurrentDate.getDate();

  if (calSelectedView === 'month') {
    calCurrentDateDisplay.textContent = `${year}年 ${month}月`;
  } else if (calSelectedView === 'week') {
    const startOfWeek = new Date(calCurrentDate);
    startOfWeek.setDate(calCurrentDate.getDate() - calCurrentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    calCurrentDateDisplay.textContent = `${startOfWeek.getFullYear()}年 ${startOfWeek.getMonth() + 1}月${startOfWeek.getDate()}日 ～ ${endOfWeek.getMonth() + 1}月${endOfWeek.getDate()}日`;
  } else {
    calCurrentDateDisplay.textContent = `${year}年 ${month}月 ${day}日`;
  }
}

function renderCalCalendarGrid() {
  calCalendarGrid.innerHTML = '';
  if (calSelectedView === 'month') {
    renderCalMonthView();
  } else if (calSelectedView === 'week') {
    renderCalWeekView();
  } else {
    renderCalDayView();
  }
}

function renderCalMonthView() {
  calCalendarGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
  const year = calCurrentDate.getFullYear();
  const month = calCurrentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - startDayOfWeek);

  const today = new Date();
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);
    const isOtherMonth = cellDate.getMonth() !== month;
    const isToday = cellDate.toDateString() === today.toDateString();
    calCalendarGrid.appendChild(createCalDayCell(cellDate, isOtherMonth, isToday));
  }
}

function createCalDayCell(dateObj, isOtherMonth = false, isToday = false) {
  const cell = document.createElement('div');
  if (calSelectedView === 'month') {
    cell.className = `calendar-cell p-1.5 flex flex-col gap-1 min-h-[135px] h-[135px] ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;
  } else {
    cell.className = `calendar-cell p-3 flex flex-col gap-2 min-h-[150px] h-auto flex-1 ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;
  }

  const dateStr = formatDate(dateObj);
  const dayOfWeek = dateObj.getDay();
  const isSundayOrHoliday = (dayOfWeek === 0) || isJapaneseHoliday(dateObj);

  const dayHeader = document.createElement('div');
  dayHeader.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 0 4px; margin-bottom: 2px; flex-shrink: 0;";
  
  const dayNumSpan = document.createElement('span');
  dayNumSpan.className = `day-number text-xs font-bold ${isSundayOrHoliday ? 'text-rose-400' : 'text-slate-200'}`;
  dayNumSpan.textContent = dateObj.getDate();

  dayHeader.appendChild(dayNumSpan);
  cell.appendChild(dayHeader);

  cell.addEventListener('click', () => {
    openCalViewModalForDate(dateStr);
  });

  const dayEvents = calendarEvents.filter(evt => calActiveColors.includes(evt.color) && evt.date === dateStr);
  dayEvents.forEach(evt => {
    const elem = document.createElement('div');
    elem.className = calSelectedView === 'month' ? `event-pill ${evt.color}` : `event-card-full ${evt.color}`;
    elem.textContent = evt.description;
    elem.addEventListener('click', (e) => {
      e.stopPropagation();
      openCalViewModalForDate(dateStr);
    });
    cell.appendChild(elem);
  });

  return cell;
}

function renderCalWeekView() {
  calCalendarGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
  const startOfWeek = new Date(calCurrentDate);
  startOfWeek.setDate(calCurrentDate.getDate() - calCurrentDate.getDay());
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const cellDate = new Date(startOfWeek);
    cellDate.setDate(startOfWeek.getDate() + i);
    const isToday = cellDate.toDateString() === today.toDateString();
    calCalendarGrid.appendChild(createCalDayCell(cellDate, false, isToday));
  }
}

function renderCalDayView() {
  calCalendarGrid.style.gridTemplateColumns = '1fr';
  const today = new Date();
  const isToday = calCurrentDate.toDateString() === today.toDateString();
  const cell = createCalDayCell(calCurrentDate, false, isToday);
  cell.style.minHeight = '350px';
  cell.style.padding = '16px';
  calCalendarGrid.appendChild(cell);
}

function openCalViewModalForDate(dateStr) {
  currentViewingDateStr = dateStr;
  const [y, m, d] = dateStr.split('-');
  const dateObj = new Date(y, m - 1, d);
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  calViewDate.textContent = `${y}年${parseInt(m, 10)}月${parseInt(d, 10)}日(${weekDays[dateObj.getDay()]})`;
  
  const dayEvents = calendarEvents.filter(evt => evt.date === dateStr);
  calViewDescriptionList.innerHTML = '';

  if (dayEvents.length === 0) {
    calViewDescriptionList.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 8px;">この日の予定はありません</div>';
  } else {
    dayEvents.forEach(evt => {
      const itemDiv = document.createElement('div');
      itemDiv.className = `p-2.5 rounded-xl text-xs whitespace-pre-wrap break-all flex justify-between items-start gap-2 ${evt.color}`;
      
      const textSpan = document.createElement('div');
      textSpan.style.flex = "1";
      textSpan.textContent = evt.description || '(詳細なし)';
      itemDiv.appendChild(textSpan);

      const actionsDiv = document.createElement('div');
      actionsDiv.style.cssText = "display: flex; align-items: center; justify-content: flex-end; gap: 4px; flex-shrink: 0; margin-left: auto;";

      const editSingleBtn = document.createElement('button');
      editSingleBtn.type = 'button';
      editSingleBtn.className = 'secondary-btn';
      editSingleBtn.style.cssText = "font-size: 0.7rem; padding: 3px 7px; color: #CDCDCD;";
      editSingleBtn.textContent = '編集';
      editSingleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeCalViewModal();
        openCalModal(evt);
      });
      actionsDiv.appendChild(editSingleBtn);

      const deleteSingleBtn = document.createElement('button');
      deleteSingleBtn.type = 'button';
      deleteSingleBtn.style.cssText = "padding: 3px 7px; background: rgba(244,63,94,0.2); border: 1px solid rgba(244,63,94,0.3); border-radius: 8px; font-size: 0.7rem; color: #CDCDCD; cursor: pointer;";
      deleteSingleBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
      deleteSingleBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('この予定を削除しますか？')) {
          await remove(ref(calendarDb, `calendar_events/${evt.id}`));
          openCalViewModalForDate(dateStr);
          renderCalendarApp();
        }
      });
      actionsDiv.appendChild(deleteSingleBtn);

      itemDiv.appendChild(actionsDiv);
      calViewDescriptionList.appendChild(itemDiv);
    });
  }

  calViewModal.classList.add('active');
}

function openCalModal(eventToEdit = null, defaultDateStr = null) {
  if (eventToEdit) {
    calModalTitle.textContent = "予定の編集";
    calEventIdInput.value = eventToEdit.id;
    calEventDateInput.value = eventToEdit.date;
    setCalModalSelectedColor(eventToEdit.color);
    calEventDescriptionInput.value = eventToEdit.description || '';
    calDeleteEventBtn.classList.remove('hidden');
  } else {
    calModalTitle.textContent = "予定の新規追加";
    calEventForm.reset();
    calEventIdInput.value = '';
    calEventDateInput.value = defaultDateStr || formatDate(calCurrentDate);
    setCalModalSelectedColor('color-blue');
    calDeleteEventBtn.classList.add('hidden');
  }
  calEventModal.classList.add('active');
}

function setCalModalSelectedColor(colorClass) {
  calEventColorInput.value = colorClass;
  document.querySelectorAll('#cal-colorSelectContainer .color-select-btn').forEach(btn => {
    if (btn.dataset.color === colorClass) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

function closeCalModal() {
  calEventModal.classList.remove('active');
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}