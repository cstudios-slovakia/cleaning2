<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../src/Database.php';

try {
    $pdo = Database::getConnection();
    
    // An overdue task set is one where the lastCleaned date plus intervalDays is in the past.
    
    $stmt = $pdo->query("
        SELECT ts.intervalDays, ts.lastCleaned, ts.room_id, r.property_id 
        FROM room_task_sets ts 
        JOIN rooms r ON ts.room_id = r.id
    ");
    $taskSets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $overdueProperties = [];
    $today = new DateTime();
    $today->setTime(0, 0, 0);
    
    foreach ($taskSets as $ts) {
        $intervalDays = (int)($ts['intervalDays'] ?? 0);
        if ($intervalDays <= 0) continue;
        
        $lastCleaned = $ts['lastCleaned'];
        if ($lastCleaned === 'Never') {
            // It's overdue immediately if it has an interval
            $overdueProperties[$ts['property_id']] = true;
            continue;
        }
        
        // Parse the DD. MM. YYYY format or similar
        $lastCleanedDate = DateTime::createFromFormat('d. m. Y', explode(',', $lastCleaned)[0]);
        if (!$lastCleanedDate) {
            $lastCleanedDate = new DateTime($lastCleaned); // Fallback
        }
        
        if ($lastCleanedDate) {
            $lastCleanedDate->modify("+$intervalDays days");
            if ($lastCleanedDate < $today) {
                $overdueProperties[$ts['property_id']] = true;
            }
        }
    }
    
    // Now trigger overdue notifications for these properties
    $notified = 0;
    foreach (array_keys($overdueProperties) as $propertyId) {
        $url = "http://" . $_SERVER['HTTP_HOST'] . "/api/public/push_notify.php";
        
        // Use cURL to call our own push_notify endpoint
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['action' => 'overdue', 'propertyId' => $propertyId]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_exec($ch);
        curl_close($ch);
        
        $notified++;
    }
    
    echo json_encode(['status' => 'success', 'properties_notified' => $notified]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
