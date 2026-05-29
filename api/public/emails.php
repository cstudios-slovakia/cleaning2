<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../src/Database.php';

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $pdo = Database::getConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM sent_emails WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $email = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($email) {
                echo json_encode($email);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Email not found']);
            }
        } else {
            $stmt = $pdo->query("SELECT id, property_name, recipient, subject, sent_at, status, error_message FROM sent_emails ORDER BY sent_at DESC");
            $emails = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($emails);
        }
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
