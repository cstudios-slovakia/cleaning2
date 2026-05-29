# Cleaning System PWA

A premium Progressive Web Application (PWA) designed for managing cleaning properties, rooms, and assignments with a focus on real-time task tracking and personnel management.

## ✨ Version 1.4 Features

The system has been upgraded to **v1.4** with several major enhancements:

* **Relational Role Segregation (4 Levels)**: Separates operations between **Superadmin** (master configuration), **Admin** (regional control, assigned property management), **Manager** (localized supervisor), and **Cleaner** (mobile-first checking unit).
* **SMTP Outbound Socket Mailer & AI Summaries**: Sends beautiful daily HTML operational summaries automatically via socket-based SMTP, utilizing OpenAI ChatGPT-3.5 to compile concise daily executive reviews.
* **Smart Anti-Spam Filter**: Automatically skips email reports if none of the rooms cleaned today contain any general comments, note details, or reported problems, keeping management inboxes clean.
* **Outbox Email Logs & sandbox HTML Inspector**: Offers a dedicated management console to audit outgoing logs, filter by transmission statuses (Delivered/Failed), inspect raw transmission details, and render full daily HTML reports inside a sandboxed visual iframe previewer.
* **Dynamic "Cleaning" (In-Progress) Status**: Ticking the first checkbox in any active cleaner list instantly updates the property matrix on the dashboard to **"Cleaning"** (purple), providing supervisors with real-time room tracking.
* **Fluid Aurora Gradients & Glassmorphism Blur**: Features a dynamic, animated visual aurora backdrop with slow-gliding glowing blobs and a semi-translucent header with CSS backdrop filters.
* **Touch-Optimized Slideover Modals**: Overhauls core slideovers using React Portals (`createPortal` to `document.body` with `z-[100]`) and comfortable bottom layouts (`pb-32` scrolling) to prevent overlay blocking or notch clipping on iOS/Android browsers.

## 🚀 Quick Start (Production Deployment)

The easiest way to install the system on a live server is via Composer. This will download the latest stable version and the pre-built frontend.

```bash
composer create-project cstudios-slovakia/cleaner your-directory-name
```

After installation, navigate to the URL (e.g., `https://your-site.com/setup`) to complete the database configuration and create your admin account.

---

## 🛠 Manual Installation & Development

If you want to contribute to development or set up the project manually, follow these steps.

### Prerequisites

- **PHP 8.1+** (with PDO MySQL extension)
- **MySQL/MariaDB**
- **Composer**
- **Node.js & NPM** (for frontend development)

### 1. Clone the Repository
```bash
git clone https://github.com/cstudios-slovakia/cleaning2.git
cd cleaning2
```

### 2. Backend Setup
Install PHP dependencies:
```bash
composer install
```

### 3. Frontend Setup
Navigate to the frontend directory, install dependencies, and build the project:
```bash
cd frontend
npm install
npm run build
cd ..
```
The build process will output files to `frontend/dist`. To serve the application, copy these files to the project root:
```bash
cp -r frontend/dist/* .
```

### 4. Database Configuration
1. Create a new MySQL database.
2. Run the setup wizard by visiting `https://your-site.com/setup`.
3. Alternatively, you can manually create `api/config/db.php`:
   ```php
   <?php
   return [
       'host' => 'localhost',
       'port' => '3306',
       'dbname' => 'your_db_name',
       'user' => 'your_user',
       'password' => 'your_password',
       'charset' => 'utf8mb4'
   ];
   ```

### 5. Running Migrations
The system uses a custom migration script to keep the database schema up to date. After setup, or after pulling new updates, visit:
`https://your-site.com/api/public/migrate.php`

---

## 🔧 Server Configuration

### Apache (.htaccess)
The project includes a `.htaccess` file for URL rewriting. Ensure that `mod_rewrite` is enabled on your server so that the SPA routing works correctly.

### Permissions
Ensure the following directories are writable by the web server user:
- `/api/config` (for the setup wizard)

---

## 📱 PWA Features

This application is a Progressive Web App. To install it on your device:
1. Open the app in a mobile browser (Chrome for Android, Safari for iOS).
2. Use the "Add to Home Screen" option.
3. The app name and branding can be customized in the **System Settings** within the application.

---

## ⚖️ License
© 2026 Cstudios Slovakia. All rights reserved.
