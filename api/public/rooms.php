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
    try {
        $pdo->exec("ALTER TABLE rooms ADD COLUMN position INT DEFAULT 0");
    } catch (Exception $e) {}
    
    $propertyId = $_GET['property_id'] ?? null;
    $roomId = $_GET['id'] ?? null;
    
    if ($roomId) {
        $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
        $stmt->execute([$roomId]);
        $room = $stmt->fetch();
        if ($room) {
            $tsStmt = $pdo->prepare("SELECT * FROM room_task_sets WHERE room_id = ? ORDER BY position ASC");
            $tsStmt->execute([$roomId]);
            $taskSets = $tsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            $tStmt = $pdo->prepare("SELECT * FROM room_tasks WHERE room_id = ? ORDER BY position ASC");
            $tStmt->execute([$roomId]);
            $allTasks = $tStmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($taskSets as &$ts) {
                $ts['tasks'] = [];
                $ts['intervalDays'] = (int)$ts['intervalDays'];
                $ts['isOnce'] = (bool)$ts['is_once'];
                $ts['isQuickClean'] = (bool)$ts['is_quick_clean'];
                foreach ($allTasks as $t) {
                    if ($t['task_set_id'] == $ts['id']) {
                        $ts['tasks'][] = $t;
                    }
                }
            }
            $room['taskSets'] = $taskSets;
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
        $query .= " ORDER BY position ASC";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($rooms as &$room) {
            $tsStmt = $pdo->prepare("SELECT id, title, is_quick_clean, intervalDays, is_once FROM room_task_sets WHERE room_id = ? ORDER BY position ASC");
            $tsStmt->execute([$room['id']]);
            $taskSets = $tsStmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($taskSets as &$ts) {
                $tCountStmt = $pdo->prepare("SELECT COUNT(*) FROM room_tasks WHERE room_id = ? AND task_set_id = ?");
                $tCountStmt->execute([$room['id'], $ts['id']]);
                $ts['taskCount'] = (int)$tCountStmt->fetchColumn();
            }
            $room['taskSets'] = $taskSets;
        }
        
        echo json_encode(['status' => 'success', 'data' => $rooms]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['positions']) && is_array($input['positions'])) {
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("UPDATE rooms SET position = ? WHERE id = ?");
            foreach ($input['positions'] as $rId => $pos) {
                $stmt->execute([$pos, $rId]);
            }
            $pdo->commit();
            echo json_encode(['status' => 'success']);
            exit;
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            exit(json_encode(['error' => $e->getMessage()]));
        }
    }
    
    if (!isset($input['id'])) exit(json_encode(['error' => 'ID required']));

    $id = $input['id'];
    $property_id = $input['property_id'] ?? '';
    $name = $input['name'] ?? 'New Room';
    $intervalDays = $input['intervalDays'] ?? 0;
    $lastCleaned = $input['lastCleaned'] ?? 'Never';
    $taskSets = $input['taskSets'] ?? [];

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

        if (isset($input['taskSets'])) {
            $pdo->prepare("DELETE FROM room_task_sets WHERE room_id = ?")->execute([$id]);
            $pdo->prepare("DELETE FROM room_tasks WHERE room_id = ?")->execute([$id]);
            
            if (!empty($taskSets)) {
                $tsStmt = $pdo->prepare("INSERT INTO room_task_sets (id, room_id, title, intervalDays, is_once, is_quick_clean, position) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $taskStmt = $pdo->prepare("INSERT INTO room_tasks (room_id, task_set_id, title, position) VALUES (?, ?, ?, ?)");
                foreach ($taskSets as $tsIndex => $ts) {
                    $tsId = $ts['id'] ?? uniqid('ts_');
                    $tsStmt->execute([
                        $tsId, 
                        $id, 
                        $ts['title'] ?? 'Task Set', 
                        $ts['intervalDays'] ?? 0, 
                        !empty($ts['isOnce']) ? 1 : 0, 
                        !empty($ts['isQuickClean']) ? 1 : 0, 
                        $tsIndex
                    ]);
                    
                    if (!empty($ts['tasks'])) {
                        foreach ($ts['tasks'] as $tIndex => $task) {
                            $taskStmt->execute([$id, $tsId, $task['text'] ?? ($task['title'] ?? 'Task'), $tIndex]);
                        }
                    }
                }
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
