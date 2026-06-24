<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../src/Database.php';

try {
    $pdo = Database::getConnection();
} catch (Exception $e) {
    http_response_code(500);
    exit(json_encode(['error' => 'Database connection failed']));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

$input = json_decode(file_get_contents('php://input'), true);
$propertyId = $input['propertyId'] ?? null;

if (!$propertyId) {
    http_response_code(400);
    exit(json_encode(['error' => 'Property ID is required']));
}

try {
    // 1. Fetch Property Name
    $pStmt = $pdo->prepare("SELECT name FROM properties WHERE id = ?");
    $pStmt->execute([$propertyId]);
    $propertyName = $pStmt->fetchColumn();

    if (!$propertyName) {
        http_response_code(404);
        exit(json_encode(['error' => 'Property not found']));
    }

    // 2. Fetch all rooms for this property
    $rStmt = $pdo->prepare("SELECT * FROM rooms WHERE property_id = ?");
    $rStmt->execute([$propertyId]);
    $rooms = $rStmt->fetchAll(PDO::FETCH_ASSOC);

    $today = new DateTime();
    $today->setTime(0, 0, 0);
    $assignmentsCreated = 0;

    // 3. For each room, check task sets
    foreach ($rooms as $room) {
        $tsStmt = $pdo->prepare("SELECT * FROM room_task_sets WHERE room_id = ? ORDER BY position ASC");
        $tsStmt->execute([$room['id']]);
        $taskSets = $tsStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($taskSets as $ts) {
            $intervalDays = (int)($ts['intervalDays'] ?? 0);
            $isOnce = !empty($ts['is_once']) || !empty($ts['isOnce']);
            
            // Only auto-schedule sets with an auto interval
            if ($intervalDays <= 0 || $isOnce) {
                continue;
            }

            $isOverdue = false;
            $lastCleaned = $ts['lastCleaned'];

            if (!$lastCleaned || $lastCleaned === 'Never' || $lastCleaned === 'Nikdy') {
                $isOverdue = true;
            } else {
                $lastCleanedDate = DateTime::createFromFormat('d. m. Y', explode(',', $lastCleaned)[0]);
                if (!$lastCleanedDate) {
                    $lastCleanedDate = new DateTime($lastCleaned); // Fallback
                }
                
                if ($lastCleanedDate) {
                    $lastCleanedDate->modify("+$intervalDays days");
                    if ($lastCleanedDate <= $today) {
                        $isOverdue = true;
                    }
                }
            }

            // If overdue/due, check if there is already an unfinished assignment for this room & task set
            if ($isOverdue) {
                $checkStmt = $pdo->prepare("
                    SELECT COUNT(*) 
                    FROM assignments 
                    WHERE property = ? AND room = ? AND task_set_id = ? AND doneBy IS NULL
                ");
                $checkStmt->execute([$propertyName, $room['name'], $ts['id']]);
                $existingActiveCount = (int)$checkStmt->fetchColumn();

                if ($existingActiveCount === 0) {
                    // Fetch subtasks for this task set
                    $tasksStmt = $pdo->prepare("SELECT title FROM room_tasks WHERE room_id = ? AND task_set_id = ? ORDER BY position ASC");
                    $tasksStmt->execute([$room['id'], $ts['id']]);
                    $subtasks = $tasksStmt->fetchAll(PDO::FETCH_ASSOC);

                    // Auto-assign assignment
                    $pdo->beginTransaction();
                    try {
                        $newId = 'auto_' . uniqid() . '_' . time();
                        
                        // Insert Assignment
                        $insStmt = $pdo->prepare("
                            INSERT INTO assignments (id, property, room, date, time, doneBy, doneAt, problemReported, images, task_set_id, notes, problemNote)
                            VALUES (?, ?, ?, 'Today', '10:00 AM', NULL, NULL, 0, NULL, ?, NULL, NULL)
                        ");
                        $insStmt->execute([$newId, $propertyName, $room['name'], $ts['id']]);

                        // Insert Assignment Tasks
                        if (!empty($subtasks)) {
                            $tStmt = $pdo->prepare("INSERT INTO assignment_tasks (assignment_id, title, done, position) VALUES (?, ?, 0, ?)");
                            foreach ($subtasks as $index => $subtask) {
                                $tStmt->execute([$newId, $subtask['title'], $index]);
                            }
                        } else {
                            $tStmt = $pdo->prepare("INSERT INTO assignment_tasks (assignment_id, title, done, position) VALUES (?, 'The room is cleaned', 0, 0)");
                            $tStmt->execute([$newId]);
                        }

                        $pdo->commit();
                        $assignmentsCreated++;
                    } catch (Exception $txEx) {
                        $pdo->rollBack();
                        throw $txEx;
                    }
                }
            }
        }
    }

    echo json_encode([
        'status' => 'success',
        'assignments_created' => $assignmentsCreated
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
