<?php

class Database {
    private static $pdo = null;

    public static function getConnection() {
        if (self::$pdo === null) {
            $configPath = __DIR__ . '/../config/db.php';
            
            if (!file_exists($configPath)) {
                header('Content-Type: application/json', true, 503);
                die(json_encode([
                    'status' => 'error', 
                    'code' => 'NEEDS_SETUP',
                    'message' => 'Database not configured. Please run setup.'
                ]));
            }

            $config = require $configPath;
            // ... (rest of the code)
            $dsn = !empty($config['socket']) 
                ? "mysql:unix_socket={$config['socket']};dbname={$config['dbname']};charset={$config['charset']}"
                : "mysql:host={$config['host']};port={$config['port']};dbname={$config['dbname']};charset={$config['charset']}";

            try {
                self::$pdo = new PDO($dsn, $config['user'], $config['password'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                header('Content-Type: application/json', true, 500);
                die(json_encode(['status' => 'error', 'message' => 'Database connection failed.']));
            }
        }
        return self::$pdo;
    }
}
