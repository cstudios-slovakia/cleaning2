# Secure Coding Guidelines

This document outlines key secure programming practices and implementation patterns to maintain the security and integrity of the application. These guidelines cover both the PHP backend and the React frontend.

---

## 1. Preventing SQL Injection (SQLi)

SQL injection occurs when untrusted user input is directly concatenated into SQL query strings. 

*   **Rule:** Never concatenate variables directly into SQL queries.
*   **Mitigation:** Always use **Prepared Statements** with bound parameters using PDO (PHP Data Objects). Prepared statements separate query structure from parameters, ensuring the database treats user input strictly as a value, not executable commands.

### Secure Pattern Example (PHP)
```php
// SECURE: Using prepared statements with bound parameters
$stmt = $pdo->prepare("SELECT id, name, role FROM users WHERE email = :email AND status = :status");
$stmt->execute([
    'email'  => $userEmail,
    'status' => 'active'
]);
$user = $stmt->fetch();
```

---

## 2. Preventing Cross-Site Scripting (XSS)

Cross-Site Scripting (XSS) occurs when malicious scripts are injected into web pages and executed within the context of a victim's browser session.

*   **Rule:** Validate inputs, encode outputs, and utilize framework protections.
*   **React Context:** React escapes values rendered inside JSX curly braces `{}` by default. However, utilizing bypass mechanisms like `dangerouslySetInnerHTML` will expose the page to XSS.
*   **PHP Context:** When rendering dynamic data inside HTML outputs (such as dynamic email reports), always escape HTML special characters.

### Secure Patterns
*   **React:** Avoid using `dangerouslySetInnerHTML` unless absolutely necessary. If required, sanitize the HTML using a library like `DOMPurify` before rendering.
*   **PHP:** Escape variables output within HTML context using `htmlspecialchars()` with appropriate flags.
    ```php
    // SECURE: Output escaping inside PHP HTML template
    echo "<h4>" . htmlspecialchars($roomName, ENT_QUOTES, 'UTF-8') . "</h4>";
    ```

---

## 3. Securing File Uploads

Allowing users to upload files (such as room pictures) poses a high risk if the uploaded file can be executed on the server (e.g. uploading a `.php` script).

*   **Rule:** Never trust user-provided file extensions, filenames, or MIME types.
*   **Mitigations:**
    1.  **Generate Random Filenames:** Assign a securely generated random identifier to the uploaded file.
    2.  **Validate Extensions:** Restrict uploads strictly to a whitelist of allowed safe extensions (e.g., `jpg`, `jpeg`, `png`, `svg`).
    3.  **Disable Execution in Upload Directory:** Use configuration files (such as `.htaccess` in Apache) to disable script handlers in the upload folder.

### Secure File Upload Implementation (PHP)
```php
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
$fileName = $_FILES['image']['name'];
$fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

// 1. Verify extension against whitelist
if (!in_array($fileExt, $allowedExtensions)) {
    throw new Exception("Invalid file type.");
}

// 2. Generate a secure random filename to prevent file path traversal
$secureName = bin2hex(random_bytes(16)) . '.' . $fileExt;
$destination = __DIR__ . '/uploads/' . $secureName;

if (move_uploaded_file($_FILES['image']['tmp_name'], $destination)) {
    // File uploaded successfully
}
```

### Disabling Execution in Uploads Directory via `.htaccess`
Place this `.htaccess` file inside the public `/uploads` directory:
```apache
# Disable PHP script execution inside this directory
<Files *.php>
    deny from all
</Files>
RemoveHandler .php
RemoveType .php
```

---

## 4. Passwords, PINs, and Session Security

Storing credentials and transmitting sessions safely is critical to prevent credential exposure.

*   **Passwords/PINs Hashing:** Never store passwords or PINs in plain text or using weak hashes (like MD5 or SHA1). Always use a secure one-way hashing function such as `password_hash()` in PHP (which defaults to bcrypt).
*   **Transport and Cookies:** Session identifiers and tokens must be transmitted securely over HTTPS and configured with strong cookie parameters:
    *   `HttpOnly`: Prevents client-side scripts from reading the cookie (protects against token theft via XSS).
    *   `Secure`: Ensures the cookie is only sent over encrypted HTTPS connections.
    *   `SameSite=Lax` or `SameSite=Strict`: Restricts when cookies are sent on cross-site requests to mitigate CSRF.

### Secure Hashing Example (PHP)
```php
// Hashing a password before insertion into database
$hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

// Verifying a login password
if (password_verify($inputPassword, $hashedPassword)) {
    // Credentials match
}
```

---

## 5. Server-Side Access Control

Security controls implemented solely in client-side code (like hiding buttons or redirecting routes in React) can easily be bypassed by intercepting or calling APIs directly.

*   **Rule:** Every endpoint must perform independent authentication and authorization validation.
*   **Mitigation:** Verify the authenticated user's session identifier or JWT payload and check their role permissions on the server before executing operations or returning data.

### Secure API Authorization (PHP)
```php
// 1. Authenticate user session
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit(json_encode(['error' => 'Unauthorized']));
}

// 2. Validate privilege level for the requested resource
$currentUserRole = $_SESSION['user_role']; 
if ($currentUserRole !== 'admin' && $currentUserRole !== 'manager') {
    http_response_code(403);
    exit(json_encode(['error' => 'Forbidden: Insufficient permissions']));
}
```
