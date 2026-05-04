const fs = require('fs');
const path = require('path');

const baseKeys = {
  nav: {
    dashboard: "Dashboard",
    properties: "Properties",
    rooms: "Rooms",
    assignments: "Assignments",
    users: "Users",
    settings: "Settings",
    logout: "Logout"
  },
  loading: {
    assignment: "Loading assignment...",
    rooms: "Loading rooms...",
    properties: "Loading properties..."
  },
  tooltips: {
    close: "Close panel",
    cleaning_log: "Cleaning Log"
  },
  login: {
    title: "Cleaning System",
    subtitle: "Sign in to your account",
    manager_tab: "Manager / Admin",
    cleaner_tab: "Cleaner",
    email: "Email Address",
    password: "Password",
    username: "Username",
    pin: "PIN",
    submit: "Sign In",
    signing_in: "Signing in...",
    errors: {
      deactivated: "This account is deactivated.",
      invalid_manager: "Invalid email or password.",
      invalid_cleaner: "Invalid username or PIN.",
      connection: "Failed to connect to the server."
    },
    pin_help: "4 digit PIN",
    username_placeholder: "cleaner_john"
  },
  dashboard: {
    property_status: "Property Status Matrix",
    activity: "Activity",
    timeline: "Timeline",
    pending_today: "Pending Today",
    recent_logs: "Recent Logs",
    express_clean: "Express Clean",
    assign: "Assign",
    no_tasks: "No pending tasks",
    completed: "Completed"
  },
  common: {
    cancel: "Cancel",
    save: "Save Changes",
    edit: "Edit",
    delete: "Delete",
    loading: "Loading...",
    success: "Success",
    error: "Error",
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    overdue: "Overdue",
    future: "Future"
  },
  settings: {
    title: "Settings",
    subtitle: "Manage your preferences and system settings.",
    profile: "Profile Preferences",
    user_language: "User Interface Language",
    default: "Default",
    update_pin: "Update PIN",
    new_pin: "New PIN",
    confirm_pin: "Confirm PIN",
    update_password: "Update Password",
    new_password: "New Password",
    confirm_password: "Confirm Password",
    system_preferences: "System Preferences",
    system_language: "System Default Language",
    system_language_help: "Set the default language for all users",
    errors: {
      password_mismatch: "Passwords do not match",
      save_failed: "Failed to save password"
    },
    system_name: "System Name",
    system_name_help: "The global name displayed across the system",
    admin_config_only: "The main admin password can only be changed in the system configuration file."
  },
  assignments: {
    title: "Cleaning Assignments",
    details: "Track and manage task completion.",
    overdue: "Overdue",
    today: "Today",
    tomorrow: "Tomorrow",
    future: "Future",
    finish_cleaning: "Finish Cleaning",
    was_cleaned: "The room is cleaned",
    scheduled: "Scheduled",
    completed_by: "Completed by",
    task_list: "Task List",
    assignment_title: "Cleaning Assignment"
  },
  rooms: {
    title: "Rooms",
    subtitle: "Manage cleaning units and intervals.",
    search_placeholder: "Search rooms...",
    manage_property: "Manage Property",
    add_room: "Add Room",
    room_name: "Room Name",
    last_cleaned: "Last Cleaned",
    action: "Action",
    express: "EXPRESS",
    assign: "ASSIGN",
    manage: "MANAGE",
    express_tooltip: "Express Cleaning (Immediately)",
    assign_tooltip: "Assign Cleaning Date",
    never: "Never",
    enter_name_placeholder: "Enter room name...",
    new_room: "New Room",
    no_rooms: "No rooms added to this property yet.",
    management_title: "Management: ",
    tabs: {
      settings: "Room Settings",
      log: "Cleaning Log"
    },
    next_assignment: "NEXT ASSIGNMENT",
    not_scheduled: "Not scheduled",
    auto_interval: "AUTO INTERVAL (DAYS)",
    disabled: "Disabled",
    task_template: "Task List Template",
    no_template_tasks: "No tasks assigned to this room template.",
    full_log: "Full Cleaning Log",
    no_history: "No cleaning history recorded yet.",
    done_suffix: "Done",
    tasks_checklist: "tasks checklist"
  }
};

const locales = {
  en: baseKeys,
  sk: {
    nav: { dashboard: "Nástenka", properties: "Budovy", rooms: "Miestnosti", assignments: "Úlohy", users: "Užívatelia", settings: "Nastavenia", logout: "Odhlásiť sa" },
    loading: {
      assignment: "Načítavam úlohu...",
      rooms: "Načítavam izby...",
      properties: "Načítavam budovy..."
    },
    tooltips: {
      close: "Zavrieť panel",
      cleaning_log: "Záznam upratovania"
    },
    login: { 
      title: "Systém", 
      subtitle: "Prihláste sa do účtu", 
      manager_tab: "Manažér / Admin", 
      cleaner_tab: "Upratovač", 
      email: "Emailová adresa", 
      password: "Heslo", 
      username: "Užívateľské meno", 
      pin: "PIN", 
      submit: "Prihlásiť sa",
      signing_in: "Prihlasujem...",
      errors: {
        deactivated: "Tento účet je deaktivovaný.",
        invalid_manager: "Nesprávny email alebo heslo.",
        invalid_cleaner: "Nesprávne meno alebo PIN.",
        connection: "Nepodarilo sa pripojiť k serveru."
      },
      pin_help: "4-miestny PIN",
      username_placeholder: "meno_upratovaca"
    },
    dashboard: { property_status: "Matica stavu budov", activity: "Aktivita", timeline: "Časová os", pending_today: "Dnes čaká", recent_logs: "Nedávne záznamy", express_clean: "Rýchle upratovanie", assign: "Priradiť", no_tasks: "Žiadne čakajúce úlohy", completed: "Dokončené" },
    common: { cancel: "Zrušiť", save: "Uložiť zmeny", edit: "Upraviť", delete: "Vymazať", loading: "Načítavam...", success: "Úspech", error: "Chyba", today: "Dnes", tomorrow: "Zajtra", yesterday: "Včera", overdue: "Po termíne", future: "Budúce" },
    settings: { 
      title: "Nastavenia", 
      subtitle: "Spravujte svoje preferencie a systémové nastavenia.", 
      profile: "Profilové preferencie", 
      user_language: "Jazyk užívateľského rozhrania", 
      default: "Predvolené", 
      update_pin: "Aktualizovať PIN", 
      new_pin: "Nový PIN", 
      confirm_pin: "Potvrdiť PIN", 
      update_password: "Aktualizovať heslo", 
      new_password: "Nové heslo", 
      confirm_password: "Potvrdiť heslo", 
      system_preferences: "Systémové preferencie", 
      system_language: "Predvolený jazyk systému", 
      system_language_help: "Nastavte predvolený jazyk pre všetkých užívateľov",
      errors: {
        password_mismatch: "Heslá sa nezhodujú",
        save_failed: "Uloženie hesla zlyhalo"
      },
      system_name: "Názov systému",
      system_name_help: "Globálny názov zobrazený v celom systéme",
      admin_config_only: "Heslo hlavného administrátora je možné zmeniť iba v konfiguračnom súbore systému."
    },
    assignments: {
      title: "Úlohy na upratovanie",
      details: "Sledujte a spravujte dokončenie úloh.",
      overdue: "Po termíne",
      today: "Dnes",
      tomorrow: "Zajtra",
      future: "Budúce",
      finish_cleaning: "Dokončiť upratovanie",
      was_cleaned: "Izba je uprataná",
      scheduled: "Naplánované",
      completed_by: "Dokončil/a",
      task_list: "Zoznam úloh",
      assignment_title: "Úloha na upratovanie"
    },
    rooms: {
      title: "Izby",
      subtitle: "Správa čistiacich jednotiek a intervalov.",
      search_placeholder: "Hľadať izby...",
      manage_property: "Spravovať budovu",
      add_room: "Pridať izbu",
      room_name: "Názov izby",
      last_cleaned: "Naposledy upratané",
      action: "Akcia",
      express: "RÝCHLE",
      assign: "PRIRADIŤ",
      manage: "SPRAVOVAŤ",
      express_tooltip: "Rýchle upratovanie (Ihneď)",
      assign_tooltip: "Priradiť dátum upratovania",
      never: "Nikdy",
      enter_name_placeholder: "Zadajte názov izby...",
      new_room: "Nová izba",
      no_rooms: "K tejto budove zatiaľ nie sú pridané žiadne izby.",
      management_title: "Správa: ",
      tabs: {
        settings: "Nastavenia izby",
        log: "Záznam upratovania"
      },
      next_assignment: "NASLEDUJÚCE UPRATOVANIE",
      not_scheduled: "Nenaplánované",
      auto_interval: "AUTO INTERVAL (DNI)",
      disabled: "Vypnuté",
      task_template: "Šablóna zoznamu úloh",
      no_template_tasks: "Pre túto izbu nie sú pridané žiadne úlohy.",
      full_log: "Kompletný záznam upratovania",
      no_history: "Zatiaľ nebol zaznamenaný žiadny záznam.",
      done_suffix: "Hotovo",
      tasks_checklist: "zoznam úloh"
    }
  },
  hu: {
    nav: { dashboard: "Műszerfal", properties: "Ingatlanok", rooms: "Szobák", assignments: "Feladatok", users: "Felhasználók", settings: "Beállítások", logout: "Kijelentkezés" },
    login: { title: "Tisztító rendszer", subtitle: "Jelentkezzen be a fiókjába", manager_tab: "Menedzser / Admin", cleaner_tab: "Takarító", email: "Email cím", password: "Jelszó", username: "Felhasználónév", pin: "PIN", submit: "Bejelentkezés" },
    dashboard: { property_status: "Ingatlan állapot mátrix", activity: "Tevékenység", timeline: "Idővonal", pending_today: "Ma esedékes", recent_logs: "Legutóbbi naplók", express_clean: "Expressz takarítás", assign: "Kiosztás", no_tasks: "Nincsenek várakozó feladatok", completed: "Befejezve" },
    common: { cancel: "Mégse", save: "Módosítások mentése", edit: "Szerkesztés", delete: "Törlés", loading: "Betöltés...", success: "Siker", error: "Hiba", today: "Ma", tomorrow: "Holnap", yesterday: "Tegnap", overdue: "Lejárt", future: "Jövőbeli" },
    settings: { title: "Beállítások", subtitle: "Kezelje preferenciáit és rendszerbeállításait.", profile: "Profil beállítások", user_language: "Felhasználói felület nyelve", default: "Alapértelmezett", update_pin: "PIN frissítése", new_pin: "Új PIN", confirm_pin: "PIN megerősítése", update_password: "Jelszó frissítése", new_password: "Új jelszó", confirm_password: "Jelszó megerősítése", system_preferences: "Rendszer beállítások", system_language: "Rendszer alapértelmezett nyelve", system_language_help: "Állítsa be az alapértelmezett nyelvet minden felhasználó számára" },
    assignments: { finish_cleaning: "Takarítás befejezése", was_cleaned: "A szoba kitakarítva", scheduled: "Ütemezve", completed_by: "Befejezte", task_list: "Feladatlista" },
    rooms: { log_tooltip: "Takarítási napló", enter_name_placeholder: "Szoba neve...", new_room: "Új szoba", no_rooms: "Még nincsenek szobák hozzáadva ehhez az ingatlanhoz." }
  },
  de: {
    nav: { dashboard: "Dashboard", properties: "Liegenschaften", rooms: "Zimmer", assignments: "Zuweisungen", users: "Benutzer", settings: "Einstellungen", logout: "Abmelden" },
    login: { title: "Reinigungssystem", subtitle: "Melden Sie sich bei Ihrem Konto an", manager_tab: "Manager / Admin", cleaner_tab: "Reiniger", email: "E-Mail-Adresse", password: "Passwort", username: "Benutzername", pin: "PIN", submit: "Anmelden" },
    dashboard: { property_status: "Objektstatus-Matrix", activity: "Aktivität", timeline: "Zeitachse", pending_today: "Heute ausstehend", recent_logs: "Aktuelle Protokolle", express_clean: "Expressreinigung", assign: "Zuweisen", no_tasks: "Keine ausstehenden Aufgaben", completed: "Abgeschlossen" },
    common: { cancel: "Abbrechen", save: "Änderungen speichern", edit: "Bearbeiten", delete: "Löschen", loading: "Laden...", success: "Erfolg", error: "Fehler", today: "Heute", tomorrow: "Morgen", yesterday: "Gestern", overdue: "Überfällig", future: "Zukünftig" },
    settings: { title: "Einstellungen", subtitle: "Verwalten Sie Ihre Präferenzen und Systemeinstellungen.", profile: "Profil-Einstellungen", user_language: "Sprache der Benutzeroberfläche", default: "Standard", update_pin: "PIN aktualisieren", new_pin: "Neue PIN", confirm_pin: "PIN bestätigen", update_password: "Passwort aktualisieren", new_password: "Neues Passwort", confirm_password: "Passwort bestätigen", system_preferences: "System-Einstellungen", system_language: "Standard-Systemsprache", system_language_help: "Legen Sie die Standardsprache für alle Benutzer fest" },
    assignments: { finish_cleaning: "Reinigung beenden", was_cleaned: "Das Zimmer ist gereinigt", scheduled: "Geplant", completed_by: "Abgeschlossen von", task_list: "Aufgabenliste" },
    rooms: { log_tooltip: "Reinigungsprotokoll", enter_name_placeholder: "Zimmername...", new_room: "Neues Zimmer", no_rooms: "Bisher wurden für dieses Objekt keine Zimmer hinzugefügt." }
  },
  ru: {
    nav: { dashboard: "Панель", properties: "Объекты", rooms: "Комнаты", assignments: "Задания", users: "Пользователи", settings: "Настройки", logout: "Выйти" },
    login: { title: "Система уборки", subtitle: "Войдите в свой аккаунт", manager_tab: "Менеджер / Админ", cleaner_tab: "Уборщик", email: "Электронная почта", password: "Пароль", username: "Имя пользователя", pin: "ПИН-код", submit: "Войти" },
    dashboard: { property_status: "Матрица статуса объектов", activity: "Активность", timeline: "Хронология", pending_today: "Ожидает сегодня", recent_logs: "Последние записи", express_clean: "Экспресс-уборка", assign: "Назначить", no_tasks: "Нет ожидающих задач", completed: "Завершено" },
    common: { cancel: "Отмена", save: "Сохранить изменения", edit: "Редактировать", delete: "Удалить", loading: "Загрузка...", success: "Успех", error: "Ошибка", today: "Сегодня", tomorrow: "Завтра", yesterday: "Вчера", overdue: "Просрочено", future: "Будущее" },
    settings: { title: "Настройки", subtitle: "Управляйте своими предпочтениями и системными настройками.", profile: "Настройки профиля", user_language: "Язык интерфейса", default: "По умолчанию", update_pin: "Обновить ПИН-код", new_pin: "Новый ПИН-код", confirm_pin: "Подтвердите ПИН-код", update_password: "Обновить пароль", new_password: "Новый пароль", confirm_password: "Подтвердите пароль", system_preferences: "Системные настройки", system_language: "Системный язык по умолчанию", system_language_help: "Установите язык по умолчанию для всех пользователей" },
    assignments: { finish_cleaning: "Завершить уборку", was_cleaned: "Комната убрана", scheduled: "Запланировано", completed_by: "Завершено", task_list: "Список задач" },
    rooms: { log_tooltip: "Журнал уборки", enter_name_placeholder: "Название комнаты...", new_room: "Новая комната", no_rooms: "Для этого объекта пока не добавлено ни одной комнаты." }
  },
  uk: {
    nav: { dashboard: "Панель", properties: "Об'єкти", rooms: "Кімнати", assignments: "Завдання", users: "Користувачі", settings: "Налаштування", logout: "Вийти" },
    login: { title: "Система прибирання", subtitle: "Увійдіть у свій акаунт", manager_tab: "Менеджер / Адмін", cleaner_tab: "Прибиральник", email: "Електронна пошта", password: "Пароль", username: "Ім'я користувача", pin: "ПІН-код", submit: "Увійти" },
    dashboard: { property_status: "Матриця статусу об'єктів", activity: "Активність", timeline: "Хронологія", pending_today: "Очікує сьогодні", recent_logs: "Останні записи", express_clean: "Експрес-прибирання", assign: "Призначити", no_tasks: "Немає очікуваних завдань", completed: "Завершено" },
    common: { cancel: "Скасувати", save: "Зберегти зміни", edit: "Редагувати", delete: "Видалити", loading: "Завантаження...", success: "Успіх", error: "Помилка", today: "Сьогодні", tomorrow: "Завтра", yesterday: "Вчора", overdue: "Прострочено", future: "Майбутнє" },
    settings: { title: "Налаштування", subtitle: "Керуйте своїми уподобаннями та системними налаштуваннями.", profile: "Налаштування профілю", user_language: "Мова інтерфейсу", default: "За замовчуванням", update_pin: "Оновити ПІН-код", new_pin: "Новий ПІН-код", confirm_pin: "Підтвердьте ПІН-код", update_password: "Оновити пароль", new_password: "Новий пароль", confirm_password: "Підтвердьте пароль", system_preferences: "Системні налаштування", system_language: "Системна мова за замовчуванням", system_language_help: "Встановіть мову за замовчуванням для всіх користувачів" },
    assignments: { finish_cleaning: "Завершити прибирання", was_cleaned: "Кімната прибрана", scheduled: "Заплановано", completed_by: "Завершено", task_list: "Список завдань" },
    rooms: { log_tooltip: "Журнал прибирання", enter_name_placeholder: "Назва кімнати...", new_room: "Нова кімната", no_rooms: "Для цього об'єкта поки не додано жодної кімнати." }
  },
  es: {
    nav: { dashboard: "Tablero", properties: "Propiedades", rooms: "Habitaciones", assignments: "Asignaciones", users: "Usuarios", settings: "Ajustes", logout: "Cerrar sesión" },
    login: { title: "Sistema de limpieza", subtitle: "Inicie sesión en su cuenta", manager_tab: "Gerente / Admin", cleaner_tab: "Limpiador", email: "Correo electrónico", password: "Contraseña", username: "Nombre de usuario", pin: "PIN", submit: "Iniciar sesión" },
    dashboard: { property_status: "Matriz de estado de propiedad", activity: "Actividad", timeline: "Cronología", pending_today: "Pendiente hoy", recent_logs: "Registros recientes", express_clean: "Limpieza exprés", assign: "Asignar", no_tasks: "No hay tareas pendientes", completed: "Completado" },
    common: { cancel: "Cancelar", save: "Guardar cambios", edit: "Editar", delete: "Eliminar", loading: "Cargando...", success: "Éxito", error: "Error", today: "Hoy", tomorrow: "Mañana", yesterday: "Ayer", overdue: "Atrasado", future: "Futuro" },
    settings: { title: "Ajustes", subtitle: "Administre sus preferencias y ajustes del sistema.", profile: "Preferencias de perfil", user_language: "Idioma de la interfaz", default: "Predeterminado", update_pin: "Actualizar PIN", new_pin: "PIN nuevo", confirm_pin: "Confirmar PIN", update_password: "Actualizar contraseña", new_password: "Contraseña nueva", confirm_password: "Confirmar contraseña", system_preferences: "Ajustes del sistema", system_language: "Idioma predeterminado del sistema", system_language_help: "Establecer el idioma predeterminado para todos los usuarios" },
    assignments: { finish_cleaning: "Terminar limpieza", was_cleaned: "La habitación está limpia", scheduled: "Programado", completed_by: "Completado por", task_list: "Lista de tareas" },
    rooms: { log_tooltip: "Registro de limpieza", enter_name_placeholder: "Nombre de la habitación...", new_room: "Habitación nueva", no_rooms: "Aún no se han añadido habitaciones a esta propiedad." }
  }
};

const outputDir = path.join(__dirname, 'frontend', 'src', 'locales');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

Object.keys(locales).forEach(lang => {
  const filePath = path.join(outputDir, `${lang}.json`);
  fs.writeFileSync(filePath, JSON.stringify(locales[lang], null, 2));
  console.log(`Generated ${filePath}`);
});
