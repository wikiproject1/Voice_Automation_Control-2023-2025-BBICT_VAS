<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Initialize device states if not exists
if (!isset($_SESSION['devices'])) {
    $_SESSION['devices'] = [
        'lights' => [
            'livingRoomLights' => false,
            'bedroomLights' => false,
            'kitchenLights' => false
        ],
        'fan' => [
            'power' => false,
            'speed' => 0
        ],
        'locks' => [
            'frontDoorLock' => false,
            'backDoorLock' => false
        ],
        'entertainment' => [
            'tv' => false,
            'music' => false,
            'volume' => 50
        ]
    ];
}

// Handle GET request to retrieve device states
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'status' => 'success',
        'data' => $_SESSION['devices']
    ]);
    exit();
}

// Handle POST request to update device states
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid JSON data'
        ]);
        exit();
    }

    $device = $input['device'] ?? null;
    $control = $input['control'] ?? null;
    $value = $input['value'] ?? null;

    if (!$device || !$control || $value === null) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required parameters'
        ]);
        exit();
    }

    // Validate device and control
    if (!isset($_SESSION['devices'][$device])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid device'
        ]);
        exit();
    }

    // Update device state
    if ($device === 'lights' || $device === 'locks') {
        if (!isset($_SESSION['devices'][$device][$control])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid control'
            ]);
            exit();
        }
        $_SESSION['devices'][$device][$control] = (bool)$value;
    } else if ($device === 'fan') {
        if ($control === 'power') {
            $_SESSION['devices']['fan']['power'] = (bool)$value;
            if (!$value) {
                $_SESSION['devices']['fan']['speed'] = 0;
            }
        } else if ($control === 'speed') {
            $speed = (int)$value;
            if ($speed >= 0 && $speed <= 3) {
                $_SESSION['devices']['fan']['speed'] = $speed;
                $_SESSION['devices']['fan']['power'] = $speed > 0;
            } else {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Invalid speed value'
                ]);
                exit();
            }
        }
    } else if ($device === 'entertainment') {
        if ($control === 'tv' || $control === 'music') {
            $_SESSION['devices']['entertainment'][$control] = (bool)$value;
        } else if ($control === 'volume') {
            $volume = (int)$value;
            if ($volume >= 0 && $volume <= 100) {
                $_SESSION['devices']['entertainment']['volume'] = $volume;
            } else {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Invalid volume value'
                ]);
                exit();
            }
        }
    }

    // Log the command
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'device' => $device,
        'control' => $control,
        'value' => $value
    ];

    if (!isset($_SESSION['command_log'])) {
        $_SESSION['command_log'] = [];
    }

    array_unshift($_SESSION['command_log'], $logEntry);
    if (count($_SESSION['command_log']) > 50) {
        array_pop($_SESSION['command_log']);
    }

    echo json_encode([
        'status' => 'success',
        'data' => $_SESSION['devices']
    ]);
    exit();
}

// Handle unsupported methods
http_response_code(405);
echo json_encode([
    'status' => 'error',
    'message' => 'Method not allowed'
]); 