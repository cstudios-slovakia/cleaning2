<?php
$file = 'api/public/migrate.php';
$content = file_get_contents($file);

$migration = <<<MIGRATION
        5 => [
            'description' => 'Create room task sets',
            'queries' => [
                "CREATE TABLE IF NOT EXISTS `room_task_sets` (
                    `id` varchar(50) NOT NULL,
                    `room_id` varchar(50) NOT NULL,
                    `title` varchar(255) NOT NULL,
                    `intervalDays` int(11) DEFAULT 0,
                    `is_once` tinyint(1) DEFAULT 0,
                    `is_quick_clean` tinyint(1) DEFAULT 0,
                    `lastCleaned` varchar(255) DEFAULT 'Never',
                    `position` int(11) DEFAULT 0,
                    PRIMARY KEY (`id`),
                    KEY `room_id` (`room_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
                "ALTER TABLE `room_tasks` ADD COLUMN IF NOT EXISTS `task_set_id` varchar(50) DEFAULT NULL;",
                "ALTER TABLE `assignments` ADD COLUMN IF NOT EXISTS `task_set_id` varchar(50) DEFAULT NULL;"
            ]
        ]
MIGRATION;

$content = str_replace("4 => [", $migration . ",\n        4 => [", $content);

file_put_contents($file, $content);
