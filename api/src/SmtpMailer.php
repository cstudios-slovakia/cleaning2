<?php

class SmtpMailer {
    public static function send($config, $to, $subject, $bodyHTML, $fromName = null, $fromEmail = null) {
        $host = $config['smtp_host'] ?? '';
        $port = intval($config['smtp_port'] ?? 587);
        $user = $config['smtp_user'] ?? '';
        $pass = $config['smtp_pass'] ?? '';
        $encryption = $config['smtp_secure'] ?? 'none'; // 'ssl', 'tls', or 'none'
        $fromEmail = $fromEmail ?: ($config['smtp_from_email'] ?: $user);
        $fromName = $fromName ?: ($config['smtp_from_name'] ?: 'Emerald Cleaning');

        if (empty($host) || empty($user)) {
            // Fallback to standard PHP mail() if SMTP is not configured
            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            $headers .= "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$fromEmail}>\r\n";
            return mail($to, "=?UTF-8?B?" . base64_encode($subject) . "?=", $bodyHTML, $headers);
        }

        $timeout = 15;
        $socket = null;
        $errorNum = 0;
        $errorStr = '';

        $remote = $host;
        if (strtolower($encryption) === 'ssl') {
            $remote = 'ssl://' . $host;
        }

        $socket = @stream_socket_client($remote . ':' . $port, $errorNum, $errorStr, $timeout);

        if (!$socket) {
            throw new Exception("Could not connect to SMTP server: $errorStr ($errorNum)");
        }

        self::readResponse($socket, 220);

        // EHLO
        self::sendCommand($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost'), 250);

        // TLS Upgrade
        if (strtolower($encryption) === 'tls') {
            self::sendCommand($socket, "STARTTLS", 220);
            if (!@stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_ANY_CLIENT)) {
                fclose($socket);
                throw new Exception("TLS negotiation failed.");
            }
            // Re-send EHLO after TLS
            self::sendCommand($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost'), 250);
        }

        // Authenticate
        if (!empty($pass)) {
            self::sendCommand($socket, "AUTH LOGIN", 334);
            self::sendCommand($socket, base64_encode($user), 334);
            self::sendCommand($socket, base64_encode($pass), 235);
        }

        // Mail From
        self::sendCommand($socket, "MAIL FROM:<$fromEmail>", 250);

        // Recipient(s)
        $recipients = array_map('trim', explode(',', $to));
        foreach ($recipients as $recipient) {
            self::sendCommand($socket, "RCPT TO:<$recipient>", 250);
        }

        // Data
        self::sendCommand($socket, "DATA", 354);

        // Send Email Content
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "To: $to\r\n";
        $headers .= "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$fromEmail}>\r\n";
        $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
        $headers .= "Date: " . date('r') . "\r\n";
        $headers .= "\r\n";

        // Double any leading dot on a line for SMTP compliance
        $emailData = $headers . $bodyHTML;
        $emailData = str_replace("\r\n.", "\r\n..", $emailData);

        self::sendCommand($socket, $emailData . "\r\n.", 250);

        // Quit
        self::sendCommand($socket, "QUIT", 221);
        fclose($socket);

        return true;
    }

    private static function sendCommand($socket, $command, $expectedResponse) {
        fputs($socket, $command . "\r\n");
        return self::readResponse($socket, $expectedResponse);
    }

    private static function readResponse($socket, $expectedResponse) {
        $response = '';
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) === ' ') {
                break;
            }
        }
        $code = intval(substr($response, 0, 3));
        if ($code !== $expectedResponse) {
            throw new Exception("SMTP command failed. Expected $expectedResponse, got $code. Response: " . trim($response));
        }
        return $response;
    }
}
