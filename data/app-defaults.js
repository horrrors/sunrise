'use strict';
(function (root) {
  const defaults = {
    ui: {
      summaryTitle:'Сводка', todayTitle:'Сегодня', warmup:'Разминка', reflect:'Рефлексия',
      export:'Экспорт', import:'Импорт', calendar:'Календарь', trophies:'Трофеи',
      nextDay:'Следующий день →', scheduleReview:'＋ Запланировать повтор',
      restTitle:'Разгрузка / повторы', restToday:'Повторов на сегодня нет. Отдых заслужен 🌙',
      dueToday:'К повтору сегодня', overallTitle:'Общий прогресс', streakTitle:'Серия',
      phasesTitle:'Фазы', tracksTitle:'Треки', daysOf:'пройдено дней из {n}',
      newTrophy:'🏆 Новый трофей!', comeback:'С возвращением — всего пройдено {n} дней. Продолжаем.',
      importOk:'Прогресс импортирован.', importFail:'Импорт не удался: {e}\nТекущий прогресс не изменён.',
      weekAbbr:'Нед', inARow:'подряд', phaseWord:'Фаза', phaseLabel:'', todayVert:'TODAY', restVert:'REST',
      taskPlaceholder:'Короткая заметка...', prevDayAria:'Предыдущий день', nextDayAria:'Следующий день',
      theme:'Тема', pack:'Программа', hint:'Что считается сильным ответом',
      dow:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'], streakWords:['день','дня','дней'],
      months:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    },
    // GENERIC, pack-agnostic badge rules (Russian default text; a pack may override by reusing the same id)
    badges: [
      { id:'first-light', type:'days-done', gte:1,   title:'First Light', desc:'Первый полностью закрытый день', icon:'🌅' },
      { id:'streak-3',    type:'streak', gte:3,       title:'Разогрев', desc:'Серия 3 дня подряд', icon:'🌱' },
      { id:'streak-7',    type:'streak', gte:7,       title:'7 дней', desc:'Серия 7 дней подряд', icon:'🔥' },
      { id:'streak-14',   type:'streak', gte:14,      title:'14 дней', desc:'Серия 14 дней подряд', icon:'🌋' },
      { id:'streak-30',   type:'streak', gte:30,      title:'30 дней', desc:'Серия 30 дней подряд', icon:'⚡' },
      { id:'streak-100',  type:'streak', gte:100,     title:'100 дней', desc:'Серия 100 дней подряд', icon:'💯' },
      { id:'days-10',     type:'days-done', gte:10,   title:'10 дней', desc:'10 дней программы пройдено', icon:'📅' },
      { id:'days-25',     type:'days-done', gte:25,   title:'25 дней', desc:'25 дней программы пройдено', icon:'🗓️' },
      { id:'days-50',     type:'days-done', gte:50,   title:'50 дней', desc:'50 дней программы пройдено', icon:'📆' },
      { id:'halfway',     type:'percent', gte:50,     title:'Экватор', desc:'Пройдена половина программы', icon:'🌗' },
      { id:'finisher',    type:'all-done',            title:'Финишер', desc:'Пройдены все дни программы', icon:'🎓' },
      { id:'tasks-100',   type:'tasks-done', gte:100, title:'100 задач', desc:'100 задач выполнено', icon:'✅' },
      { id:'scribe-10',   type:'reflections', gte:10, title:'Летописец', desc:'10 рефлексий написано', icon:'✍️' },
      { id:'scribe-30',   type:'reflections', gte:30, title:'Хронист', desc:'30 рефлексий написано', icon:'📜' },
      { id:'perfect-week',type:'groups-complete', gte:1, title:'Идеальная неделя', desc:'Неделя пройдена целиком', icon:'🌟' },
      { id:'weeks-4',     type:'groups-complete', gte:4, title:'Месяц в деле', desc:'4 недели пройдены целиком', icon:'📈' },
      { id:'comeback',    type:'comeback',           title:'Comeback', desc:'Вернулся после пропуска', icon:'🩹' },
      { id:'night-owl',   type:'hour-range', from:22, to:5, title:'Night Owl', desc:'Закрыл день после 22:00 или до 5:00', icon:'🦉' },
      { id:'early-lark',  type:'hour-range', from:5, to:8,  title:'Early Lark', desc:'Закрыл день до 8:00 утра', icon:'🐦' },
      { id:'weekend',     type:'weekday', days:[6, 7], title:'Воин выходного', desc:'Закрыл день в субботу или воскресенье', icon:'🌴' },
    ],
    mottos: ['一歩一歩 · шаг за шагом'],
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = defaults;
  if (root){ root.SUNRISE = root.SUNRISE || {}; root.SUNRISE.defaults = defaults; }
})(typeof window !== 'undefined' ? window : globalThis);
