<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

if ($action === 'test_db') {
    $host = $input['host'];
    $port = $input['port'];
    $dbname = $input['dbname'];
    $user = $input['user'];
    $pass = $input['password'];

    try {
        $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        
        // Try to check if database exists
        $stmt = $pdo->query("SELECT COUNT(*) FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$dbname'");
        $exists = $stmt->fetchColumn();
        
        echo json_encode(['status' => 'success', 'message' => 'Connected successfully', 'db_exists' => (bool)$exists]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

if ($action === 'install') {
    $db = $input['db'];
    $sys = $input['sys'];

    try {
        // 1. Create database if it doesn't exist
        $dsn = "mysql:host={$db['host']};port={$db['port']};charset=utf8mb4";
        $pdo = new PDO($dsn, $db['user'], $db['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$db['dbname']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE `{$db['dbname']}`");

        // 2. Create tables
        $queries = [
            "CREATE TABLE IF NOT EXISTS `users` (
                `id` varchar(50) NOT NULL,
                `name` varchar(255) NOT NULL,
                `username` varchar(100) DEFAULT NULL,
                `email` varchar(255) DEFAULT NULL,
                `password` varchar(255) DEFAULT NULL,
                `role` varchar(50) NOT NULL,
                `status` varchar(20) DEFAULT 'active',
                `lastActive` varchar(50) DEFAULT 'Never',
                `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                `language` varchar(10) DEFAULT 'en',
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS `properties` (
                `id` varchar(50) NOT NULL,
                `name` varchar(255) NOT NULL,
                `scheduleTime` varchar(50) DEFAULT '10:00 AM',
                `theme` varchar(20) DEFAULT '#0ea5e9',
                `coverImage` text DEFAULT NULL,
                `logo` text DEFAULT NULL,
                `cleaners` text DEFAULT NULL,
                `managers` text DEFAULT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS `rooms` (
                `id` varchar(50) NOT NULL,
                `property_id` varchar(50) NOT NULL,
                `name` varchar(255) NOT NULL,
                `intervalDays` int(11) DEFAULT 0,
                `lastCleaned` varchar(50) DEFAULT 'Never',
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS `assignments` (
                `id` varchar(50) NOT NULL,
                `property` varchar(255) NOT NULL,
                `room` varchar(255) NOT NULL,
                `date` varchar(50) NOT NULL,
                `time` varchar(50) DEFAULT NULL,
                `doneBy` varchar(255) DEFAULT NULL,
                `doneAt` varchar(50) DEFAULT NULL,
                `problemReported` tinyint(1) DEFAULT 0,
                `images` text DEFAULT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS `push_subscriptions` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `user_id` varchar(50) DEFAULT NULL,
                `subscription` text NOT NULL,
                `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
        ];

        foreach ($queries as $q) {
            $pdo->exec($q);
        }

        // 3. Create Admin User
        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            'admin_' . time(),
            'Administrator',
            $sys['adminEmail'],
            $sys['adminPassword'], // In production, use password_hash
            'admin',
            'active'
        ]);

        // 4. Save config/db.php
        $configContent = "<?php\n\n// Database configuration\nreturn [\n";
        $configContent .= "    'host' => '{$db['host']}',\n";
        $configContent .= "    'port' => '{$db['port']}',\n";
        $configContent .= "    'dbname' => '{$db['dbname']}',\n";
        $configContent .= "    'user' => '{$db['user']}',\n";
        $configContent .= "    'password' => '{$db['password']}',\n";
        $configContent .= "    'charset' => 'utf8mb4'\n";
        $configContent .= "];\n";

        $configDir = __DIR__ . '/../config';
        if (!is_dir($configDir)) mkdir($configDir, 0755, true);
        file_put_contents($configDir . '/db.php', $configContent);

        echo json_encode(['status' => 'success', 'message' => 'Installation completed successfully']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Installation failed: ' . $e->getMessage()]);
    }
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
