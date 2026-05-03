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
    
    // GET /api/public/users.php
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("SELECT * FROM users ORDER BY created_at DESC");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $config = require __DIR__ . '/../config.php';
        if (isset($config['main_admin'])) {
            array_unshift($users, $config['main_admin']);
        }
        
        echo json_encode($users);
        exit;
    }
    
    // POST /api/public/users.php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            exit;
        }

        $id = $input['id'] ?? uniqid();
        $name = $input['name'] ?? 'New User';
        $username = $input['username'] ?? null;
        $email = $input['email'] ?? null;
        $password = $input['password'] ?? null;
        $role = $input['role'] ?? 'cleaner';
        $status = $input['status'] ?? 'active';
        $lastActive = $input['lastActive'] ?? 'Never';
        
        $config = require __DIR__ . '/../config.php';
        if (isset($config['main_admin']) && $id === $config['main_admin']['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Cannot modify the main config admin user']);
            exit;
        }
        
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $exists = $stmt->fetchColumn();

        if ($exists) {
            // Update
            $stmt = $pdo->prepare("UPDATE users SET name = ?, username = ?, email = ?, password = ?, role = ?, status = ?, lastActive = ? WHERE id = ?");
            $stmt->execute([$name, $username, $email, $password, $role, $status, $lastActive, $id]);
        } else {
            // Insert
            $stmt = $pdo->prepare("INSERT INTO users (id, name, username, email, password, role, status, lastActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $name, $username, $email, $password, $role, $status, $lastActive]);
        }

        echo json_encode(['success' => true, 'id' => $id]);
        exit;
    }
    
    // DELETE /api/public/users.php?id=xxx
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = $_GET['id'] ?? null;
        
        $config = require __DIR__ . '/../config.php';
        if (isset($config['main_admin']) && $id === $config['main_admin']['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Cannot delete the main config admin user']);
            exit;
        }
        
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing ID']);
        }
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
