<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../src/Database.php';
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
} else {
    require_once __DIR__ . '/../../vendor/autoload.php';
}

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $action = $input['action'] ?? null;
    $propertyId = $input['propertyId'] ?? null;
    $propertyNameInput = $input['propertyName'] ?? null;
    
    if (!$action || (!$propertyId && !$propertyNameInput)) {
        http_response_code(400);
        exit(json_encode(['error' => 'Missing data']));
    }

    try {
        $pdo = Database::getConnection();
        
        $auth = [
            'VAPID' => [
                'subject' => 'mailto:admin@cleaner.sk',
                'publicKey' => 'BD49BGird7PQBqcp3k-0qpfdugIvVAh7G8Oiao3U3n-bHgWSK4pIjhEshA9aIBxrPwWAyw4kUns7s9RiFQgeDew',
                'privateKey' => '7Pivixs6e63bP3FIdabZUizJp3qtNFKfUNFHOYAGPVM',
            ],
        ];

        $webPush = new WebPush($auth);
        
        // Fetch property details
        if ($propertyId) {
            $stmt = $pdo->prepare("SELECT id, name, cleaners, managers FROM properties WHERE id = ?");
            $stmt->execute([$propertyId]);
        } else {
            $stmt = $pdo->prepare("SELECT id, name, cleaners, managers FROM properties WHERE name = ?");
            $stmt->execute([$propertyNameInput]);
        }
        $property = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$property) {
            http_response_code(404);
            exit(json_encode(['error' => 'Property not found']));
        }
        
        $propertyName = $property['name'];
        $propertyId = $property['id'];
        $cleaners = $property['cleaners'] ? json_decode($property['cleaners'], true) : [];
        $managers = $property['managers'] ? json_decode($property['managers'], true) : [];
        
        $targetUserIds = [];
        $payload = [];

        $targetNames = [];
        if ($action === 'flash') {
            foreach ($cleaners as $c) {
                if (!empty($c['name'])) $targetNames[] = $c['name'];
            }
            $payload = [
                'title' => 'Flash Cleaning Triggered!',
                'body' => "Express cleaning has been requested at $propertyName. Please check your assignments.",
                'url' => '/properties/' . $propertyId
            ];
        } elseif ($action === 'overdue' || $action === 'problem') {
            foreach ($managers as $m) {
                if (!empty($m['name'])) $targetNames[] = $m['name'];
            }
            
            if ($action === 'overdue') {
                $payload = [
                    'title' => 'Cleaning Overdue!',
                    'body' => "A room at $propertyName is overdue for cleaning. Please review.",
                    'url' => '/properties/' . $propertyId
                ];
            } else {
                $roomName = $input['roomName'] ?? 'a room';
                $payload = [
                    'title' => 'Problem Reported!',
                    'body' => "A problem was reported in $roomName at $propertyName.",
                    'url' => '/properties/' . $propertyId . '/logs'
                ];
            }
        } else {
            exit(json_encode(['error' => 'Invalid action']));
        }

        if (empty($targetNames)) {
            exit(json_encode(['status' => 'success', 'message' => 'No target names found for this property']));
        }
        
        // Find user IDs by names
        $namePlaceholders = implode(',', array_fill(0, count($targetNames), '?'));
        $stmt = $pdo->prepare("SELECT id FROM users WHERE name IN ($namePlaceholders)");
        $stmt->execute($targetNames);
        $targetUserIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($targetUserIds)) {
            exit(json_encode(['status' => 'success', 'message' => 'No target users found in database']));
        }
        
        // Fetch subscriptions
        $inQuery = implode(',', array_fill(0, count($targetUserIds), '?'));
        $stmt = $pdo->prepare("SELECT user_id, subscription FROM push_subscriptions WHERE user_id IN ($inQuery)");
        $stmt->execute($targetUserIds);
        $subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $sentCount = 0;
        foreach ($subscriptions as $subRow) {
            $subData = json_decode($subRow['subscription'], true);
            if (!$subData) continue;
            
            $subscription = Subscription::create([
                'endpoint' => $subData['endpoint'],
                'publicKey' => $subData['keys']['p256dh'],
                'authToken' => $subData['keys']['auth'],
            ]);

            $webPush->queueNotification($subscription, json_encode($payload));
            $sentCount++;
        }
        
        foreach ($webPush->flush() as $report) {
            $endpoint = $report->getRequest()->getUri()->__toString();
            if ($report->isSuccess()) {
                // Success
            } else {
                // You could delete invalid subscriptions here
                // echo "[x] Message failed to sent for subscription {$endpoint}: {$report->getReason()}";
            }
        }
        
        echo json_encode(['status' => 'success', 'sent' => $sentCount]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
