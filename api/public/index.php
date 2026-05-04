<?php
// Core API Entry point
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Configure for production
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Very basic routing wrapper
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

echo json_encode([
    'status' => 'success',
    'message' => 'Cleaning API is running',
    'endpoint' => $requestUri,
    'method' => $method
]);
