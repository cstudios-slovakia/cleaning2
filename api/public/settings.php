<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM system_settings");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $settings = [];
        // Set default values for all expected fields
        $expectedKeys = [
            'openai_key',
            'smtp_host',
            'smtp_port',
            'smtp_user',
            'smtp_pass',
            'smtp_secure',
            'smtp_from_email',
            'smtp_from_name'
        ];
        foreach ($expectedKeys as $key) {
            $settings[$key] = '';
        }

        foreach ($rows as $row) {
            $key = $row['setting_key'];
            $value = $row['setting_value'];
            
            // Mask sensitive fields
            if (($key === 'openai_key' || $key === 'smtp_pass') && !empty($value)) {
                $value = '••••••••';
            }
            $settings[$key] = $value ?: '';
        }
        
        echo json_encode(['status' => 'success', 'data' => $settings]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        exit(json_encode(['error' => 'Invalid JSON input']));
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO system_settings (setting_key, setting_value)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        ");

        foreach ($input as $key => $value) {
            // Trim inputs
            $value = trim($value);

            // Skip updating password/key if it matches the mask
            if (($key === 'openai_key' || $key === 'smtp_pass') && $value === '••••••••') {
                continue;
            }

            $stmt->execute([$key, $value]);
        }

        echo json_encode(['status' => 'success', 'message' => 'Settings saved successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
