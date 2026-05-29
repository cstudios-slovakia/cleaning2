<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../src/Database.php';

// Enable error reporting for migrations
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    $pdo = Database::getConnection();
} catch (Exception $e) {
    die(json_encode(['status' => 'error', 'message' => 'Database not configured or connection failed.']));
}

try {
    // 1. Ensure migrations table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS `migrations` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `version` int(11) NOT NULL,
        `description` varchar(255) NOT NULL,
        `applied_at` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `version` (`version`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 2. Define sequential migrations
    // Add new migrations to the end of this array with an incremented integer key.
    $migrations = [
        1 => [
            'description' => 'Initial migration setup (dummy to mark migration table creation)',
            'queries' => [
                // No queries needed, just marks that migrations are active
                "SET @dummy = 1;"
            ]
        ],
        2 => [
            'description' => 'Add visual customization and schedule columns to properties table',
            'queries' => [
                "ALTER TABLE `properties` ADD COLUMN IF NOT EXISTS `scheduleTime` varchar(50) DEFAULT '10:00 AM';",
                "ALTER TABLE `properties` ADD COLUMN IF NOT EXISTS `theme` varchar(20) DEFAULT '#0ea5e9';",
                "ALTER TABLE `properties` ADD COLUMN IF NOT EXISTS `coverImage` text DEFAULT NULL;",
                "ALTER TABLE `properties` ADD COLUMN IF NOT EXISTS `logo` text DEFAULT NULL;"
            ]
        ],
        3 => [
            'description' => 'Create room_tasks table',
            'queries' => [
                "CREATE TABLE IF NOT EXISTS `room_tasks` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `room_id` varchar(50) NOT NULL,
                    `title` varchar(255) NOT NULL,
                    `position` int(11) DEFAULT 0,
                    PRIMARY KEY (`id`),
                    KEY `room_id` (`room_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
            ]
        ],
        4 => [
            'description' => 'Create assignment_tasks table',
            'queries' => [
                "CREATE TABLE IF NOT EXISTS `assignment_tasks` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `assignment_id` varchar(50) NOT NULL,
                    `title` varchar(255) NOT NULL,
                    `done` tinyint(1) DEFAULT 0,
                    `position` int(11) DEFAULT 0,
                    PRIMARY KEY (`id`),
                    KEY `assignment_id` (`assignment_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
            ]
        ],
        5 => [
            'description' => 'Create room task sets',
            'queries' => [
                "CREATE TABLE IF NOT EXISTS `room_task_sets` (
                    `id` varchar(50) NOT NULL,
                    `room_id` varchar(50) NOT NULL,
                    `title` varchar(255) NOT NULL,
                    `intervalDays` int(11) DEFAULT 0,
                    `is_once` tinyint(1) DEFAULT 0,
                    `is_quick_clean` tinyint(1) DEFAULT 0,
                    `lastCleaned` varchar(255) DEFAULT 'Never',
                    `position` int(11) DEFAULT 0,
                    PRIMARY KEY (`id`),
                    KEY `room_id` (`room_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
                "ALTER TABLE `room_tasks` ADD COLUMN IF NOT EXISTS `task_set_id` varchar(50) DEFAULT NULL;",
                "ALTER TABLE `assignments` ADD COLUMN IF NOT EXISTS `task_set_id` varchar(50) DEFAULT NULL;"
            ]
        ],
        6 => [
            'description' => 'Add notes, problem notes, settings table and property report tracker',
            'queries' => [
                "ALTER TABLE `assignments` ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL;",
                "ALTER TABLE `assignments` ADD COLUMN IF NOT EXISTS `problemNote` TEXT DEFAULT NULL;",
                "ALTER TABLE `properties` ADD COLUMN IF NOT EXISTS `last_report_sent_at` VARCHAR(50) DEFAULT NULL;",
                "CREATE TABLE IF NOT EXISTS `system_settings` (
                    `setting_key` VARCHAR(255) NOT NULL,
                    `setting_value` TEXT DEFAULT NULL,
                    PRIMARY KEY (`setting_key`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
            ]
        ],
        7 => [
            'description' => 'Create sent_emails table to log all operational email notifications',
            'queries' => [
                "CREATE TABLE IF NOT EXISTS `sent_emails` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `property_name` varchar(255) DEFAULT NULL,
                    `recipient` text NOT NULL,
                    `subject` varchar(255) NOT NULL,
                    `body` longtext NOT NULL,
                    `sent_at` timestamp DEFAULT CURRENT_TIMESTAMP,
                    `status` varchar(50) NOT NULL,
                    `error_message` text DEFAULT NULL,
                    PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
            ]
        ]
    ];

    // 3. Get applied migrations
    $stmt = $pdo->query("SELECT version FROM migrations");
    $appliedVersions = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $stmt->closeCursor();

    $appliedCount = 0;

    // 4. Apply new migrations sequentially
    ksort($migrations);
    foreach ($migrations as $version => $migration) {
        if (!in_array($version, $appliedVersions)) {
            try {
                foreach ($migration['queries'] as $query) {
                    $pdo->exec($query);
                }
                
                $stmt = $pdo->prepare("INSERT INTO migrations (version, description) VALUES (?, ?)");
                $stmt->execute([$version, $migration['description']]);
                
                $appliedCount++;
            } catch (Exception $e) {
                throw new Exception("Migration version {$version} failed: " . $e->getMessage());
            }
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => "Successfully applied $appliedCount new migrations.",
        'applied' => $appliedCount
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
