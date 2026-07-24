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
    $stmt = $pdo->query("
        SELECT p.*, COUNT(r.id) as rooms 
        FROM properties p 
        LEFT JOIN rooms r ON p.id = r.property_id 
        GROUP BY p.id
    ");
    $properties = $stmt->fetchAll();
    foreach ($properties as &$p) {
        $p['managers'] = $p['managers'] ? json_decode($p['managers'], true) : [];
        $p['cleaners'] = $p['cleaners'] ? json_decode($p['cleaners'], true) : [];
        $p['service_mode_tasks'] = !empty($p['service_mode_tasks']) ? json_decode($p['service_mode_tasks'], true) : [];
    }
    echo json_encode(['status' => 'success', 'data' => $properties]);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['id'])) exit(json_encode(['error' => 'ID required']));

    $id = $input['id'];
    $name = $input['name'] ?? 'New Property';
    $scheduleTime = $input['scheduleTime'] ?? '10:00 AM';
    $theme = $input['theme'] ?? '#0ea5e9';
    $coverImage = $input['coverImage'] ?? null;
    $logo = $input['logo'] ?? null;
    $managers = json_encode($input['managers'] ?? []);
    $cleaners = json_encode($input['cleaners'] ?? []);
    $service_mode_tasks = json_encode($input['service_mode_tasks'] ?? ($input['serviceModeTasks'] ?? []));

    $stmt = $pdo->prepare("
        INSERT INTO properties (id, name, scheduleTime, theme, coverImage, logo, managers, cleaners, service_mode_tasks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            scheduleTime = VALUES(scheduleTime),
            theme = VALUES(theme),
            coverImage = VALUES(coverImage),
            logo = VALUES(logo),
            managers = VALUES(managers),
            cleaners = VALUES(cleaners),
            service_mode_tasks = VALUES(service_mode_tasks)
    ");
    $stmt->execute([$id, $name, $scheduleTime, $theme, $coverImage, $logo, $managers, $cleaners, $service_mode_tasks]);
    echo json_encode(['status' => 'success']);
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $pdo->prepare("DELETE FROM properties WHERE id = ?")->execute([$id]);
    }
    echo json_encode(['status' => 'success']);
}
