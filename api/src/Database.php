<?php

class Database {
    private static $pdo = null;

    public static function getConnection() {
        if (self::$pdo === null) {
            $config = require __DIR__ . '/../config/db.php';
            
            // Prefer socket connection if provided
            if (!empty($config['socket'])) {
                $dsn = "mysql:unix_socket={$config['socket']};dbname={$config['dbname']};charset={$config['charset']}";
            } else {
                $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['dbname']};charset={$config['charset']}";
            }

            try {
                self::$pdo = new PDO($dsn, $config['user'], $config['password'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                // Return generic error for security, or log the actual error
                die(json_encode(['status' => 'error', 'message' => 'Database connection failed.']));
            }
        }
        return self::$pdo;
    }
}
