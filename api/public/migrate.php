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
                "SELECT 1;"
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
        ]
    ];

    // 3. Get applied migrations
    $stmt = $pdo->query("SELECT version FROM migrations");
    $appliedVersions = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $appliedCount = 0;

    // 4. Apply new migrations sequentially
    ksort($migrations);
    foreach ($migrations as $version => $migration) {
        if (!in_array($version, $appliedVersions)) {
            $pdo->beginTransaction();
            try {
                foreach ($migration['queries'] as $query) {
                    $pdo->exec($query);
                }
                
                $stmt = $pdo->prepare("INSERT INTO migrations (version, description) VALUES (?, ?)");
                $stmt->execute([$version, $migration['description']]);
                
                $pdo->commit();
                $appliedCount++;
            } catch (Exception $e) {
                $pdo->rollBack();
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
