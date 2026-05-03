<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../src/Database.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['user_id']) || !isset($input['subscription'])) {
        http_response_code(400);
        exit(json_encode(['error' => 'Missing data']));
    }

    try {
        $pdo = Database::getConnection();
        
        $userId = $input['user_id'];
        $subscription = json_encode($input['subscription']);
        
        // Check if subscription already exists for this user
        $stmt = $pdo->prepare("SELECT id FROM push_subscriptions WHERE user_id = ? AND subscription = ?");
        $stmt->execute([$userId, $subscription]);
        if (!$stmt->fetchColumn()) {
            $stmt = $pdo->prepare("INSERT INTO push_subscriptions (user_id, subscription) VALUES (?, ?)");
            $stmt->execute([$userId, $subscription]);
        }
        
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}
