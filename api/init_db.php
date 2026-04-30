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

    // Create properties table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS properties (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            scheduleTime VARCHAR(50) DEFAULT '10:00 AM',
            theme VARCHAR(50) DEFAULT '#0ea5e9',
            coverImage LONGTEXT DEFAULT NULL,
            logo LONGTEXT DEFAULT NULL,
            managers LONGTEXT DEFAULT NULL,
            cleaners LONGTEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Create rooms table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS rooms (
            id VARCHAR(50) PRIMARY KEY,
            property_id VARCHAR(50) NOT NULL,
            name VARCHAR(255) NOT NULL,
            intervalDays INT DEFAULT 0,
            lastCleaned VARCHAR(255) DEFAULT 'Never',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Create room tasks table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS room_tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            room_id VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            position INT DEFAULT 0,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Create users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            username VARCHAR(255) DEFAULT NULL,
            email VARCHAR(255) DEFAULT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'cleaner',
            status VARCHAR(50) NOT NULL DEFAULT 'active',
            lastActive VARCHAR(255) DEFAULT 'Never',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    echo "Tables created successfully.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
