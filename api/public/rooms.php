<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once __DIR__ . '/../src/Database.php';

try { $pdo = Database::getConnection(); } catch (Exception $e) { http_response_code(500); exit(json_encode(['error' => 'DB failed'])); }

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $propertyId = $_GET['property_id'] ?? null;
    $roomId = $_GET['id'] ?? null;
    
    if ($roomId) {
        $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
        $stmt->execute([$roomId]);
        $room = $stmt->fetch();
        if ($room) {
            $tStmt = $pdo->prepare("SELECT * FROM room_tasks WHERE room_id = ? ORDER BY position ASC");
            $tStmt->execute([$roomId]);
            $room['tasks'] = $tStmt->fetchAll();
            // Fetch property name for consistency
            $pStmt = $pdo->prepare("SELECT name FROM properties WHERE id = ?");
            $pStmt->execute([$room['property_id']]);
            $p = $pStmt->fetch();
            $room['property'] = $p['name'] ?? 'Unknown';
        }
        echo json_encode(['status' => 'success', 'data' => $room]);
    } else {
        $query = "SELECT * FROM rooms";
        $params = [];
        if ($propertyId) {
            $query .= " WHERE property_id = ?";
            $params[] = $propertyId;
        }
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $rooms = $stmt->fetchAll();
        
        echo json_encode(['status' => 'success', 'data' => $rooms]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['id'])) exit(json_encode(['error' => 'ID required']));

    $id = $input['id'];
    $property_id = $input['property_id'] ?? '';
    $name = $input['name'] ?? 'New Room';
    $intervalDays = $input['intervalDays'] ?? 0;
    $lastCleaned = $input['lastCleaned'] ?? 'Never';
    $tasks = $input['tasks'] ?? [];

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("
            INSERT INTO rooms (id, property_id, name, intervalDays, lastCleaned)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                intervalDays = VALUES(intervalDays),
                lastCleaned = VALUES(lastCleaned)
        ");
        $stmt->execute([$id, $property_id, $name, $intervalDays, $lastCleaned]);

        $pdo->prepare("DELETE FROM room_tasks WHERE room_id = ?")->execute([$id]);
        if (!empty($tasks)) {
            $taskStmt = $pdo->prepare("INSERT INTO room_tasks (room_id, title, position) VALUES (?, ?, ?)");
            foreach ($tasks as $index => $task) {
                $taskStmt->execute([$id, $task['title'] ?? 'Task', $index]);
            }
        }
        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save: ' . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $pdo->prepare("DELETE FROM rooms WHERE id = ?")->execute([$id]);
    }
    echo json_encode(['status' => 'success']);
}
