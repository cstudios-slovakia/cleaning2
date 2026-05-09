<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // For dev/testing
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../src/Database.php';

try {
    $pdo = Database::getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all assignments (you might want to filter by property later)
    $stmt = $pdo->query("SELECT * FROM assignments ORDER BY date DESC, time DESC");
    $assignments = $stmt->fetchAll();

    // Fetch tasks for all assignments
    $tasksStmt = $pdo->query("SELECT * FROM assignment_tasks ORDER BY position ASC");
    $allTasks = $tasksStmt->fetchAll();

    // Group tasks by assignment_id
    $tasksByAssignment = [];
    foreach ($allTasks as $task) {
        $tasksByAssignment[$task['assignment_id']][] = [
            'id' => $task['id'],
            'title' => $task['title'],
            'done' => (bool)$task['done'],
            'position' => $task['position']
        ];
    }

    // Attach tasks and decode images to assignments
    foreach ($assignments as &$assignment) {
        $assignment['tasks'] = $tasksByAssignment[$assignment['id']] ?? [];
        $assignment['problemReported'] = (bool)$assignment['problemReported'];
        if (!empty($assignment['images'])) {
            $assignment['images'] = json_decode($assignment['images'], true);
        } else {
            $assignment['images'] = [];
        }
    }

    echo json_encode(['status' => 'success', 'data' => $assignments]);
} elseif ($method === 'POST') {
    // Create or update assignment
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        exit;
    }

    $id = $input['id'];
    $property = $input['property'] ?? '';
    $room = $input['room'] ?? '';
    $date = $input['date'] ?? '';
    $time = $input['time'] ?? '';
    $doneBy = $input['doneBy'] ?? null;
    $doneAt = $input['doneAt'] ?? null;
    $task_set_id = $input['task_set_id'] ?? null;
    $tasks = $input['tasks'] ?? [];
    $problemReported = !empty($input['problemReported']) ? 1 : 0;
    $images = isset($input['images']) && is_array($input['images']) ? json_encode($input['images']) : null;

    $pdo->beginTransaction();

    try {
        // Upsert assignment
        $stmt = $pdo->prepare("
            INSERT INTO assignments (id, property, room, date, time, doneBy, doneAt, problemReported, images, task_set_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                property = VALUES(property),
                room = VALUES(room),
                date = VALUES(date),
                time = VALUES(time),
                doneBy = VALUES(doneBy),
                doneAt = VALUES(doneAt),
                problemReported = VALUES(problemReported),
                images = VALUES(images),
                task_set_id = VALUES(task_set_id)
        ");
        $stmt->execute([$id, $property, $room, $date, $time, $doneBy, $doneAt, $problemReported, $images, $task_set_id]);
        
        // Update task sets if finished
        if ($doneAt && $task_set_id) {
            $tsStmt = $pdo->prepare("SELECT room_id, position FROM room_task_sets WHERE id = ?");
            $tsStmt->execute([$task_set_id]);
            $ts = $tsStmt->fetch();
            if ($ts) {
                $todayStr = date('d. m. Y');
                $updateStmt = $pdo->prepare("UPDATE room_task_sets SET lastCleaned = ? WHERE room_id = ? AND position <= ?");
                $updateStmt->execute([$todayStr, $ts['room_id'], $ts['position']]);
            }
        }

        // For simplicity with tasks: delete existing and re-insert
        // Since tasks might have their own IDs in React, we need to handle them carefully.
        // Actually, if we just delete and reinsert, the IDs in the DB will change, but the frontend might rely on its own IDs.
        // If frontend passes `id` for tasks, we can use it, but `assignment_tasks.id` is INT AUTO_INCREMENT.
        // Let's just delete and reinsert based on what the frontend sends, using the frontend's ID or generating one if needed.
        // Or we can just use the DB's auto-increment ID. Wait, the frontend uses tasks `id: 1, 2, 3`.
        
        $pdo->prepare("DELETE FROM assignment_tasks WHERE assignment_id = ?")->execute([$id]);

        if (!empty($tasks)) {
            $taskStmt = $pdo->prepare("INSERT INTO assignment_tasks (assignment_id, title, done, position) VALUES (?, ?, ?, ?)");
            foreach ($tasks as $index => $task) {
                // If the frontend uses its own IDs (like 1,2,3), it's fine, we just re-insert. 
                // We'll return the new structure on the next GET.
                $title = $task['title'] ?? 'Untitled';
                $done = !empty($task['done']) ? 1 : 0;
                $taskStmt->execute([$id, $title, $done, $index]);
            }
        }

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Assignment saved']);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save assignment: ' . $e->getMessage()]);
    }
}
