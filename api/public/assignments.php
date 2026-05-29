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
    $notes = $input['notes'] ?? null;
    $problemNote = $input['problemNote'] ?? null;

    $pdo->beginTransaction();

    try {
        // Upsert assignment
        $stmt = $pdo->prepare("
            INSERT INTO assignments (id, property, room, date, time, doneBy, doneAt, problemReported, images, task_set_id, notes, problemNote)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                property = VALUES(property),
                room = VALUES(room),
                date = VALUES(date),
                time = VALUES(time),
                doneBy = VALUES(doneBy),
                doneAt = VALUES(doneAt),
                problemReported = VALUES(problemReported),
                images = VALUES(images),
                task_set_id = VALUES(task_set_id),
                notes = VALUES(notes),
                problemNote = VALUES(problemNote)
        ");
        $stmt->execute([$id, $property, $room, $date, $time, $doneBy, $doneAt, $problemReported, $images, $task_set_id, $notes, $problemNote]);
        
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

        $pdo->prepare("DELETE FROM assignment_tasks WHERE assignment_id = ?")->execute([$id]);

        if (!empty($tasks)) {
            $taskStmt = $pdo->prepare("INSERT INTO assignment_tasks (assignment_id, title, done, position) VALUES (?, ?, ?, ?)");
            foreach ($tasks as $index => $task) {
                $title = $task['title'] ?? 'Untitled';
                $done = !empty($task['done']) ? 1 : 0;
                $taskStmt->execute([$id, $title, $done, $index]);
            }
        }

        $pdo->commit();

        // ----------------------------------------------------
        // Hook: End of the Day Report
        // ----------------------------------------------------
        if ($doneAt) {
            $propStmt = $pdo->prepare("SELECT id, name, last_report_sent_at, cleaners, managers FROM properties WHERE name = ?");
            $propStmt->execute([$property]);
            $propertyRow = $propStmt->fetch(PDO::FETCH_ASSOC);

            if ($propertyRow) {
                $propertyId = $propertyRow['id'];
                $lastReportSentAt = $propertyRow['last_report_sent_at'];
                $todayDate = date('Y-m-d');

                if ($lastReportSentAt !== $todayDate) {
                    $roomsCountStmt = $pdo->prepare("SELECT COUNT(*) FROM rooms WHERE property_id = ?");
                    $roomsCountStmt->execute([$propertyId]);
                    $totalRoomsCount = intval($roomsCountStmt->fetchColumn());

                    $todayPrefix = date('Y-m-d') . '%';
                    $cleanedRoomsStmt = $pdo->prepare("
                        SELECT COUNT(DISTINCT room) 
                        FROM assignments 
                        WHERE property = ? 
                          AND doneBy IS NOT NULL 
                          AND (doneAt LIKE ? OR date = 'Today')
                    ");
                    $cleanedRoomsStmt->execute([$property, $todayPrefix]);
                    $cleanedRoomsCount = intval($cleanedRoomsStmt->fetchColumn());

                    if ($totalRoomsCount > 0 && $cleanedRoomsCount >= $totalRoomsCount) {
                        $settingsStmt = $pdo->query("SELECT setting_key, setting_value FROM system_settings");
                        $settingsRows = $settingsStmt->fetchAll(PDO::FETCH_ASSOC);
                        $systemSettings = [];
                        foreach ($settingsRows as $row) {
                            $systemSettings[$row['setting_key']] = $row['setting_value'];
                        }

                        $dailyAssignmentsStmt = $pdo->prepare("
                            SELECT room, notes, problemNote, problemReported 
                            FROM assignments 
                            WHERE property = ? 
                              AND doneBy IS NOT NULL 
                              AND (doneAt LIKE ? OR date = 'Today')
                        ");
                        $dailyAssignmentsStmt->execute([$property, $todayPrefix]);
                        $dailyAssignments = $dailyAssignmentsStmt->fetchAll(PDO::FETCH_ASSOC);

                        $roomsNotesHTML = '';
                        $summaryTextForAI = '';
                        $hasAnyComment = false;
                        foreach ($dailyAssignments as $da) {
                            $roomName = htmlspecialchars($da['room']);
                            $generalNotes = trim($da['notes'] ?? '');
                            $probNote = trim($da['problemNote'] ?? '');
                            $isProblem = !empty($da['problemReported']);

                            if (!empty($generalNotes) || !empty($probNote) || $isProblem) {
                                $hasAnyComment = true;
                            }

                            $roomsNotesHTML .= "<div style='margin-bottom: 20px; padding: 15px; border-radius: 12px; background-color: " . ($isProblem ? "#fef2f2" : "#f8fafc") . "; border: 1px solid " . ($isProblem ? "#fecaca" : "#e2e8f0") . ";'>";
                            $roomsNotesHTML .= "<h4 style='margin: 0 0 10px 0; color: #1e293b; font-size: 16px; font-weight: bold;'>$roomName</h4>";
                            if ($isProblem) {
                                $roomsNotesHTML .= "<p style='margin: 0 0 5px 0; font-size: 14px; color: #b91c1c;'><b>⚠️ Problem Reported:</b> " . ($probNote ? htmlspecialchars($probNote) : "No details provided.") . "</p>";
                            }
                            $roomsNotesHTML .= "<p style='margin: 0; font-size: 14px; color: #475569;'><b>Notes:</b> " . ($generalNotes ? htmlspecialchars($generalNotes) : "<i>No comments.</i>") . "</p>";
                            $roomsNotesHTML .= "</div>";

                            $summaryTextForAI .= "- Room: $roomName\n";
                            if ($isProblem) {
                                $summaryTextForAI .= "  [PROBLEM]: " . ($probNote ?: "No details") . "\n";
                            }
                            $summaryTextForAI .= "  [NOTES]: " . ($generalNotes ?: "No comments") . "\n\n";
                        }

                        if ($hasAnyComment) {
                            $openaiKey = $systemSettings['openai_key'] ?? '';
                            $aiSummaryHTML = '';
                            if (!empty($openaiKey)) {
                                $prompt = "You are summarizing the daily cleaning logs for the property \"$property\". Here is the list of rooms cleaned today, along with cleaner notes and any reported problems:\n\n$summaryTextForAI\nPlease write a beautiful, professional, and concise daily summary in HTML paragraph format. Highlight any reported problems or issues that managers should look into.";
                                
                                $ch = curl_init('https://api.openai.com/v1/chat/completions');
                                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                                curl_setopt($ch, CURLOPT_POST, true);
                                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                                    'Content-Type: application/json',
                                    'Authorization: Bearer ' . $openaiKey
                                ]);
                                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                                    'model' => 'gpt-3.5-turbo',
                                    'messages' => [
                                        ['role' => 'system', 'content' => 'You are a professional hotel executive summarizing daily operations.'],
                                        ['role' => 'user', 'content' => $prompt]
                                    ],
                                    'temperature' => 0.7
                                ]));
                                $response = curl_exec($ch);
                                curl_close($ch);

                                if ($response) {
                                    $resData = json_decode($response, true);
                                    $aiSummaryContent = $resData['choices'][0]['message']['content'] ?? '';
                                    if (!empty($aiSummaryContent)) {
                                        $aiSummaryHTML = "
                                            <div style='background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 20px; margin-bottom: 25px;'>
                                                <h3 style='margin: 0 0 10px 0; color: #15803d; font-size: 16px; font-weight: bold; display: flex; align-items: center;'>
                                                    ✨ AI Executive Summary
                                                </h3>
                                                <div style='color: #1e3a24; font-size: 14px; line-height: 1.6;'>$aiSummaryContent</div>
                                            </div>
                                        ";
                                    }
                                }
                            }

                            if (empty($aiSummaryHTML)) {
                                $problemCount = 0;
                                foreach ($dailyAssignments as $da) {
                                    if (!empty($da['problemReported'])) $problemCount++;
                                }
                                $aiSummaryHTML = "
                                    <div style='background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 20px; margin-bottom: 25px;'>
                                        <h3 style='margin: 0 0 10px 0; color: #15803d; font-size: 16px; font-weight: bold;'>
                                            📊 Daily Cleaning Summary
                                        </h3>
                                        <p style='margin: 0; color: #1e3a24; font-size: 14px; line-height: 1.6;'>
                                            All $totalRoomsCount rooms at <b>$property</b> have been successfully cleaned today. 
                                            There " . ($problemCount === 1 ? "was 1 problem" : "were $problemCount problems") . " reported. 
                                            Please review the room logs below for detailed descriptions.
                                        </p>
                                    </div>
                                ";
                            }

                            $emailsStmt = $pdo->query("SELECT email FROM users WHERE role IN ('admin', 'superadmin', 'subadmin') AND email IS NOT NULL AND email != ''");
                            $recipientEmails = $emailsStmt->fetchAll(PDO::FETCH_COLUMN);

                            // Inject the main config admin email if it exists
                            $sysConfig = require __DIR__ . '/../config.php';
                            if (isset($sysConfig['main_admin']['email']) && !empty($sysConfig['main_admin']['email'])) {
                                $recipientEmails[] = $sysConfig['main_admin']['email'];
                            }

                            $assignedManagers = $propertyRow['managers'] ? json_decode($propertyRow['managers'], true) : [];
                            $managerNames = [];
                            foreach ($assignedManagers as $am) {
                                if (!empty($am['name'])) $managerNames[] = $am['name'];
                            }

                            if (!empty($managerNames)) {
                                $namePlaceholders = implode(',', array_fill(0, count($managerNames), '?'));
                                $mgrStmt = $pdo->prepare("SELECT email FROM users WHERE name IN ($namePlaceholders) AND email IS NOT NULL AND email != ''");
                                $mgrStmt->execute($managerNames);
                                $mgrEmails = $mgrStmt->fetchAll(PDO::FETCH_COLUMN);
                                $recipientEmails = array_unique(array_merge($recipientEmails, $mgrEmails));
                            }

                            if (!empty($recipientEmails)) {
                                $emailHTML = "
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <meta charset='utf-8'>
                                        <title>Daily Cleaning Report - $property</title>
                                    </head>
                                    <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 30px; margin: 0;'>
                                        <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;'>
                                            <div style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; color: #ffffff;'>
                                                <h1 style='margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;'>Daily Operations Report</h1>
                                                <p style='margin: 5px 0 0 0; color: #94a3b8; font-size: 14px; font-weight: 500; text-transform: uppercase;'>$property</p>
                                            </div>
                                            <div style='padding: 30px;'>
                                                $aiSummaryHTML
                                                <h3 style='margin: 0 0 15px 0; color: #0f172a; font-size: 18px; font-weight: 800;'>Room Details</h3>
                                                $roomsNotesHTML
                                            </div>
                                            <div style='background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;'>
                                                © " . date('Y') . " Emerald Cleaning System. All rights reserved.
                                            </div>
                                        </div>
                                    </body>
                                    </html>
                                ";

                                require_once __DIR__ . '/../src/SmtpMailer.php';
                                $toEmailStr = implode(', ', $recipientEmails);
                                try {
                                    SmtpMailer::send(
                                        $systemSettings,
                                        $toEmailStr,
                                        "Daily Cleaning Report - $property (" . date('d.m.Y') . ")",
                                        $emailHTML
                                    );
                                    
                                    // Only mark as sent if the email actually succeeded
                                    $upStmt = $pdo->prepare("UPDATE properties SET last_report_sent_at = ? WHERE id = ?");
                                    $upStmt->execute([$todayDate, $propertyId]);

                                    // Log successful email
                                    $logStmt = $pdo->prepare("INSERT INTO sent_emails (property_name, recipient, subject, body, status) VALUES (?, ?, ?, ?, 'success')");
                                    $logStmt->execute([$property, $toEmailStr, "Daily Cleaning Report - $property (" . date('d.m.Y') . ")", $emailHTML]);
                                } catch (Exception $mailEx) {
                                    // Log SMTP failure in database
                                    try {
                                        $logStmt = $pdo->prepare("INSERT INTO sent_emails (property_name, recipient, subject, body, status, error_message) VALUES (?, ?, ?, ?, 'failed', ?)");
                                        $logStmt->execute([$property, $toEmailStr, "Daily Cleaning Report - $property (" . date('d.m.Y') . ")", $emailHTML, $mailEx->getMessage()]);
                                    } catch (Exception $logEx) {}
                                }
                            }
                        }
                    }
                }
            }
        }

        echo json_encode(['status' => 'success', 'message' => 'Assignment saved']);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save assignment: ' . $e->getMessage()]);
    }
}
