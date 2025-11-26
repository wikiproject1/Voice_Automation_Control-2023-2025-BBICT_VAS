<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Home Voice Control</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="css/style.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="container-fluid">
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container">
                <a class="navbar-brand" href="#"><i class="fas fa-home"></i> Smart Home Control</a>
                <div class="d-flex">
                    <select id="languageSelect" class="form-select me-2">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                    </select>
                    <button id="voiceButton" class="btn btn-light voiceButton">
                        <i class="fas fa-microphone"></i>
                    </button>
                </div>
            </div>
        </nav>

        <div class="container mt-4">
            <div class="row">
                <!-- Lights Control -->
                <div class="col-md-6 col-lg-3 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="fas fa-lightbulb"></i> Lights</h5>
                        </div>
                        <div class="card-body">
                            <div class="device-control" data-device="lights">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="livingRoomLights">
                                    <label class="form-check-label" for="livingRoomLights">Living Room</label>
                                    <span id="livingRoomLightsStatus" class="device-status">(Off)</span>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="bedroomLights">
                                    <label class="form-check-label" for="bedroomLights">Bedroom</label>
                                    <span id="bedroomLightsStatus" class="device-status">(Off)</span>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="kitchenLights">
                                    <label class="form-check-label" for="kitchenLights">Kitchen</label>
                                    <span id="kitchenLightsStatus" class="device-status">(Off)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Fan Control -->
                <div class="col-md-6 col-lg-3 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="fas fa-fan"></i> Fan</h5>
                        </div>
                        <div class="card-body">
                            <div class="device-control" data-device="fan">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="fanPower">
                                    <label class="form-check-label" for="fanPower">Power</label>
                                    <span id="fanPowerStatus" class="device-status">(Off)</span>
                                </div>
                                <div class="mt-3">
                                    <label class="form-label">Speed</label>
                                    <input type="range" class="form-range" id="fanSpeed" min="0" max="3" step="1">
                                    <div class="d-flex justify-content-between">
                                        <span>Off</span>
                                        <span>Low</span>
                                        <span>Medium</span>
                                        <span>High</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Door Lock Control -->
                <div class="col-md-6 col-lg-3 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="fas fa-door-closed"></i> Door Locks</h5>
                        </div>
                        <div class="card-body">
                            <div class="device-control" data-device="locks">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="frontDoorLock">
                                    <label class="form-check-label" for="frontDoorLock">Front Door</label>
                                    <span id="frontDoorLockStatus" class="device-status">(Locked)</span>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="backDoorLock">
                                    <label class="form-check-label" for="backDoorLock">Back Door</label>
                                    <span id="backDoorLockStatus" class="device-status">(Locked)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Entertainment Control -->
                <div class="col-md-6 col-lg-3 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="fas fa-tv"></i> Entertainment</h5>
                        </div>
                        <div class="card-body">
                            <div class="device-control" data-device="entertainment">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="tvPower">
                                    <label class="form-check-label" for="tvPower">TV</label>
                                    <span id="tvPowerStatus" class="device-status">(Off)</span>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="musicPower">
                                    <label class="form-check-label" for="musicPower">Music</label>
                                    <span id="musicPowerStatus" class="device-status">(Off)</span>
                                </div>
                                <div class="mt-3">
                                    <label class="form-label">Volume</label>
                                    <input type="range" class="form-range" id="volumeControl" min="0" max="100">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Command Log -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0"><i class="fas fa-history"></i> Command Log</h5>
                        </div>
                        <div class="card-body">
                            <div id="commandLog" class="command-log">
                                <!-- Command logs will be added here dynamically -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Voice Recognition Status Modal -->
    <div class="modal fade" id="voiceModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Voice Command</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <div id="voiceStatus" class="mb-3">
                        <i class="fas fa-microphone fa-3x"></i>
                    </div>
                    <p id="voiceText" class="mb-0">Listening...</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Hero Section (Voice Command Focused) -->
    <section id="hero-section" class="text-center py-5">
        <div class="container">
            <button id="voiceButtonHero" class="btn btn-primary btn-circle btn-xl voiceButton" aria-label="Activate voice command">
                <i class="fas fa-microphone fa-2x"></i>
            </button>
            <p class="mt-3 mb-2 fs-5">Tap and speak your command</p>
            <div id="voiceFeedback" class="feedback-area">
                <!-- Live voice feedback will appear here -->
            </div>
            <div id="statusAlert" class="alert-area mt-2">
                <!-- Status alerts (success/error) will appear here -->
            </div>
            <!-- Voice Command Live Log -->
            <div id="voiceLiveLog" class="voice-live-log mt-4 card" style="max-height: 220px; overflow-y: auto; text-align: left;">
                <div class="card-header bg-light fw-bold">Live Voice Command Log</div>
                <div class="card-body p-2" id="voiceLiveLogBody" style="font-size: 1rem;"></div>
            </div>
        </div>
    </section>

    <!-- Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Custom JavaScript -->
    <script src="js/voice-control.js"></script>
    <script src="js/device-control.js"></script>
</body>
</html> 