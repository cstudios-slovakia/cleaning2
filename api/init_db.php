<?php
require_once __DIR__ . '/src/Database.php';

try {
    $pdo = Database::getConnection();
    
    // Create assignments table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS assignments (
            id VARCHAR(50) PRIMARY KEY,
            property VARCHAR(255) NOT NULL,
            room VARCHAR(255) NOT NULL,
            date VARCHAR(50) NOT NULL,
            time VARCHAR(50) NOT NULL,
            doneBy VARCHAR(255) DEFAULT NULL,
            doneAt VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Create assignment tasks table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS assignment_tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            assignment_id VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            done TINYINT(1) DEFAULT 0,
            position INT DEFAULT 0,
            FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    echo "Tables created successfully.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
