const fs = require('fs');

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
  login: {
    title: "Emerald System",
    subtitle: "Sign in to your account",
    manager_tab: "Manager / Admin",
    cleaner_tab: "Cleaner",
    email: "Email Address",
    password: "Password",
    username: "Username",
    pin: "PIN",
    submit: "Sign In"
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
    subtitle: "Manage your preferences",
    user_language: "User Language",
    system_language: "System Default Language",
    system_language_help: "Can be set by admin only. This applies to users who haven't selected a personal preference.",
    default: "System Default",
    profile: "Profile Settings",
    pin: "Your PIN",
    system_preferences: "System Preferences",
    update_pin: "Update PIN",
    new_pin: "New PIN",
    confirm_pin: "Confirm PIN",
    update_password: "Update Password",
    new_password: "New Password",
    confirm_password: "Confirm Password",
    errors: {
      password_mismatch: "Passwords do not match",
      save_failed: "Failed to save password"
    }
  }
};

const translations = {
  en: baseKeys,
  sk: {
    nav: { dashboard: "Nástenka", properties: "Budovy", rooms: "Miestnosti", assignments: "Úlohy", users: "Užívatelia", settings: "Nastavenia", logout: "Odhlásiť sa" },
    login: { title: "Systém Emerald", subtitle: "Prihláste sa do účtu", manager_tab: "Manažér / Admin", cleaner_tab: "Upratovač", email: "Emailová adresa", password: "Heslo", username: "Užívateľské meno", pin: "PIN", submit: "Prihlásiť sa" },
    dashboard: { property_status: "Matica stavu budov", activity: "Aktivita", timeline: "Časová os", pending_today: "Dnes čaká", recent_logs: "Nedávne záznamy", express_clean: "Rýchle upratovanie", assign: "Priradiť", no_tasks: "Žiadne čakajúce úlohy", completed: "Dokončené" },
    common: { cancel: "Zrušiť", save: "Uložiť zmeny", edit: "Upraviť", delete: "Vymazať", loading: "Načítavam...", success: "Úspech", error: "Chyba", today: "Dnes", tomorrow: "Zajtra", yesterday: "Včera", overdue: "Po termíne", future: "Budúce" },
    settings: { 
      title: "Nastavenia", 
      subtitle: "Správa preferencií", 
      user_language: "Jazyk užívateľa", 
      system_language: "Predvolený jazyk systému", 
      system_language_help: "Môže nastaviť iba admin. Týka sa užívateľov, ktorí si nezvolili vlastný jazyк.", 
      default: "Predvolené v systéme", 
      profile: "Nastavenia profilu", 
      pin: "Váš PIN",
      system_preferences: "Systémové preferencie",
      update_pin: "Aktualizovať PIN",
      new_pin: "Nový PIN",
      confirm_pin: "Potvrdiť PIN",
      update_password: "Aktualizovať heslo",
      new_password: "Nové heslo",
      confirm_password: "Potvrdiť heslo",
      errors: {
        password_mismatch: "Heslá sa nezhodujú",
        save_failed: "Uloženie hesla zlyhalo"
      }
    }
  },
  hu: {
    nav: { dashboard: "Irányítópult", properties: "Épületek", rooms: "Szobák", assignments: "Feladatok", users: "Felhasználók", settings: "Beállítások", logout: "Kijelentkezés" },
    login: { title: "Emerald Rendszer", subtitle: "Jelentkezzen be a fiókjába", manager_tab: "Menedzser / Admin", cleaner_tab: "Takarító", email: "E-mail cím", password: "Jelszó", username: "Felhasználónév", pin: "PIN kód", submit: "Bejelentkezés" },
    dashboard: { property_status: "Ingatlan állapot mátrix", activity: "Aktivitás", timeline: "Idővonal", pending_today: "Ma függőben", recent_logs: "Legutóbbi naplók", express_clean: "Gyors takarítás", assign: "Kijelölés", no_tasks: "Nincs függőben lévő feladat", completed: "Befejezve" },
    common: { cancel: "Mégse", save: "Változtatások mentése", edit: "Szerkesztés", delete: "Törlés", loading: "Betöltés...", success: "Siker", error: "Hiba", today: "Ma", tomorrow: "Holnap", yesterday: "Tegnap", overdue: "Késedelmes", future: "Jövőbeli" },
    settings: { 
      title: "Beállítások", 
      subtitle: "Preferenciák kezelése", 
      user_language: "Felhasználó nyelve", 
      system_language: "Rendszer alapértelmezett nyelve", 
      system_language_help: "Csak az adminisztrátor állíthatja be. Azokra a felhasználókra vonatkozik, akik nem választottak saját nyelvet.", 
      default: "Rendszer alapértelmezett", 
      profile: "Profil beállítások", 
      pin: "Az Ön PIN kódja",
      system_preferences: "Rendszerpreferenciák",
      update_pin: "PIN frissítése",
      new_pin: "Új PIN",
      confirm_pin: "PIN megerősítése",
      update_password: "Jelszó frissítése",
      new_password: "Új jelszó",
      confirm_password: "Jelszó megerősítése",
      errors: {
        password_mismatch: "A jelszavak nem egyeznek",
        save_failed: "A jelszó mentése sikertelen"
      }
    }
  },
  de: {
    nav: { dashboard: "Dashboard", properties: "Gebäude", rooms: "Räume", assignments: "Aufgaben", users: "Benutzer", settings: "Einstellungen", logout: "Abmelden" },
    login: { title: "Emerald System", subtitle: "Melden Sie sich an", manager_tab: "Manager / Admin", cleaner_tab: "Reinigungskraft", email: "E-Mail-Adresse", password: "Passwort", username: "Benutzername", pin: "PIN", submit: "Anmelden" },
    dashboard: { property_status: "Immobilien-Statusmatrix", activity: "Aktivität", timeline: "Zeitleiste", pending_today: "Heute ausstehend", recent_logs: "Aktuelle Protokolle", express_clean: "Express-Reinigung", assign: "Zuweisen", no_tasks: "Keine ausstehenden Aufgaben", completed: "Abgeschlossen" },
    common: { cancel: "Abbrechen", save: "Änderungen speichern", edit: "Bearbeiten", delete: "Löschen", loading: "Wird geladen...", success: "Erfolg", error: "Fehler", today: "Heute", tomorrow: "Morgen", yesterday: "Gestern", overdue: "Überfällig", future: "Zukünftig" },
    settings: { 
      title: "Einstellungen", 
      subtitle: "Verwalten Sie Ihre Einstellungen", 
      user_language: "Benutzersprache", 
      system_language: "Standard-Systemsprache", 
      system_language_help: "Kann nur vom Administrator eingestellt werden. Gilt für Benutzer, die keine persönliche Sprache gewählt haben.", 
      default: "Systemstandard", 
      profile: "Profileinstellungen", 
      pin: "Ihre PIN",
      system_preferences: "Systemeinstellungen",
      update_pin: "PIN aktualisieren",
      new_pin: "Neue PIN",
      confirm_pin: "PIN bestätigen",
      update_password: "Passwort aktualisieren",
      new_password: "Neues Passwort",
      confirm_password: "Passwort bestätigen",
      errors: {
        password_mismatch: "Passwörter stimmen nicht überein",
        save_failed: "Passwort konnte nicht gespeichert werden"
      }
    }
  },
  es: {
    nav: { dashboard: "Tablero", properties: "Edificios", rooms: "Habitaciones", assignments: "Tareas", users: "Usuarios", settings: "Configuraciones", logout: "Cerrar sesión" },
    login: { title: "Sistema Emerald", subtitle: "Inicie sesión en su cuenta", manager_tab: "Gerente / Administrador", cleaner_tab: "Limpiador", email: "Dirección de correo electrónico", password: "Contraseña", username: "Nombre de usuario", pin: "PIN", submit: "Iniciar sesión" },
    dashboard: { property_status: "Matriz de estado", activity: "Actividad", timeline: "Línea de tiempo", pending_today: "Pendiente hoy", recent_logs: "Registros recientes", express_clean: "Limpieza exprés", assign: "Asignar", no_tasks: "No hay tareas pendientes", completed: "Completado" },
    common: { cancel: "Cancelar", save: "Guardar cambios", edit: "Editar", delete: "Eliminar", loading: "Cargando...", success: "Éxito", error: "Error", today: "Hoy", tomorrow: "Mañana", yesterday: "Ayer", overdue: "Atrasado", future: "Futuro" },
    settings: { 
      title: "Configuraciones", 
      subtitle: "Administrar sus preferencias", 
      user_language: "Idioma del usuario", 
      system_language: "Idioma predeterminado del sistema", 
      system_language_help: "Solo lo puede establecer el administrador. Se aplica a los usuarios que no han seleccionado un idioma personal.", 
      default: "Predeterminado del sistema", 
      profile: "Configuración de perfil", 
      pin: "Su PIN",
      system_preferences: "Preferencias del sistema",
      update_pin: "Actualizar PIN",
      new_pin: "Nuevo PIN",
      confirm_pin: "Confirmar PIN",
      update_password: "Actualizar contraseña",
      new_password: "Nueva contraseña",
      confirm_password: "Confirmar contraseña",
      errors: {
        password_mismatch: "Las contraseñas no coinciden",
        save_failed: "Error al guardar la contraseña"
      }
    }
  },
  uk: {
    nav: { dashboard: "Панель", properties: "Будівлі", rooms: "Кімнати", assignments: "Завдання", users: "Користувачі", settings: "Налаштування", logout: "Вийти" },
    login: { title: "Система Emerald", subtitle: "Увійдіть у свій обліковий запис", manager_tab: "Менеджер / Адмін", cleaner_tab: "Прибиральник", email: "Електронна адреса", password: "Пароль", username: "Ім'я користувача", pin: "ПІН-код", submit: "Увійти" },
    dashboard: { property_status: "Матриця стану", activity: "Активність", timeline: "Хронологія", pending_today: "Очікується сьогодні", recent_logs: "Недавні записи", express_clean: "Експрес прибирання", assign: "Призначити", no_tasks: "Немає поточних завдань", completed: "Завершено" },
    common: { cancel: "Скасувати", save: "Зберегти зміни", edit: "Редагувати", delete: "Видалити", loading: "Завантаження...", success: "Успіх", error: "Помилка", today: "Сьогодні", tomorrow: "Завтра", yesterday: "Вчора", overdue: "Прострочено", future: "Майбутнє" },
    settings: { 
      title: "Налаштування", 
      subtitle: "Керування уподобаннями", 
      user_language: "Мова користувача", 
      system_language: "Системна мова за замовчуванням", 
      system_language_help: "Може бути встановлена лише адміністратором. Застосовується до користувачів, які не обрали особисту мову.", 
      default: "За замовчуванням", 
      profile: "Налаштування профілю", 
      pin: "Ваш ПІН-код",
      system_preferences: "Системні налаштування",
      update_pin: "Оновити ПІН-код",
      new_pin: "Новий ПІН-код",
      confirm_pin: "Підтвердити ПІН-код",
      update_password: "Оновити пароль",
      new_password: "Новий пароль",
      confirm_password: "Підтвердити пароль",
      errors: {
        password_mismatch: "Паролі не збігаються",
        save_failed: "Не вдалося зберегти пароль"
      }
    }
  },
  ru: {
    nav: { dashboard: "Панель", properties: "Здания", rooms: "Комнаты", assignments: "Задания", users: "Пользователи", settings: "Настройки", logout: "Выйти" },
    login: { title: "Система Emerald", subtitle: "Войдите в свой аккаунт", manager_tab: "Менеджер / Админ", cleaner_tab: "Уборщик", email: "Электронная почта", password: "Пароль", username: "Имя пользователя", pin: "ПИН-код", submit: "Войти" },
    dashboard: { property_status: "Матрица состояния", activity: "Активность", timeline: "Хронология", pending_today: "Ожидается сегодня", recent_logs: "Последние записи", express_clean: "Экспресс уборка", assign: "Назначить", no_tasks: "Нет ожидающих заданий", completed: "Завершено" },
    common: { cancel: "Отмена", save: "Сохранить изменения", edit: "Редактировать", delete: "Удалить", loading: "Загрузка...", success: "Успех", error: "Ошибка", today: "Сегодня", tomorrow: "Завтра", yesterday: "Вчера", overdue: "Просрочено", future: "Будущее" },
    settings: { 
      title: "Настройки", 
      subtitle: "Управление предпочтениями", 
      user_language: "Язык пользователя", 
      system_language: "Системный язык по умолчанию", 
      system_language_help: "Может быть установлен только администратором. Применяется к пользователям, которые не выбрали личный язык.", 
      default: "По умолчанию", 
      profile: "Настройки профиля", 
      pin: "Ваш ПИН-код",
      system_preferences: "Системные настройки",
      update_pin: "Обновить ПИН-код",
      new_pin: "Новый ПИН-код",
      confirm_pin: "Подтвердить ПИН-код",
      update_password: "Обновить пароль",
      new_password: "Новый пароль",
      confirm_password: "Подтвердить пароль",
      errors: {
        password_mismatch: "Пароли не совпадают",
        save_failed: "Не удалось сохранить пароль"
      }
    }
  }
};

for (const [lang, obj] of Object.entries(translations)) {
  fs.writeFileSync(`frontend/src/locales/${lang}.json`, JSON.stringify(obj, null, 2));
}
