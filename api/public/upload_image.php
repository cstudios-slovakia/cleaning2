<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // For dev/testing
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No image uploaded']);
    exit;
}

$roomName = $_POST['roomName'] ?? 'unknown_room';
// Sanitize room name for folder path
$roomName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $roomName);

$month = date('Y-m');
$uploadDir = __DIR__ . '/assets/' . $roomName . '/' . $month . '/';

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$fileInfo = pathinfo($_FILES['image']['name']);
$extension = strtolower($fileInfo['extension'] ?? 'jpg');

// Ensure safe extension
if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type']);
    exit;
}

$filename = uniqid('img_') . '.' . $extension;
$destination = $uploadDir . $filename;

if (move_uploaded_file($_FILES['image']['tmp_name'], $destination)) {
    // Generate public URL. Assuming API is mounted at /api/public
    // Adjust logic if you need absolute URL. We return a relative path that frontend can prepend API URL to.
    $publicPath = 'assets/' . $roomName . '/' . $month . '/' . $filename;
    
    echo json_encode([
        'status' => 'success',
        'path' => $publicPath
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to move uploaded file']);
}
