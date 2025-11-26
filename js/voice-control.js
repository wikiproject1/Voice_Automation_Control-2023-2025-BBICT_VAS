// Voice Control Class
class VoiceControl {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.currentLanguage = 'en';
        this.commandLog = [];
        this.voiceModal = new bootstrap.Modal(document.getElementById('voiceModal'));
        this.feedbackArea = document.getElementById('voiceFeedback');
        this.statusAlert = document.getElementById('statusAlert');
        
        // Initialize Web Speech API
        this.initializeSpeechRecognition();
        
        // Bind event listeners
        this.bindEvents();
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = this.getLanguageCode(this.currentLanguage);
            
            this.recognition.onstart = () => {
                this.isListening = true;
                document.getElementById('voiceStatus').style.color = '#dc3545';
                this.setFeedback('Listening...');
                this.setStatusAlert('','clear');
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                document.getElementById('voiceStatus').style.color = '#0d6efd';
            };
            
            this.recognition.onresult = (event) => {
                let interim_transcript = '';
                let final_transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final_transcript += event.results[i][0].transcript;
                    } else {
                        interim_transcript += event.results[i][0].transcript;
                    }
                }
                // Debug: log all recognized speech
                if (interim_transcript) {
                    this.setFeedback(interim_transcript, true);
                    this.addToVoiceLiveLog(`Interim: "${interim_transcript}"`, 'info');
                    console.log('Interim transcript:', interim_transcript);
                }
                if (final_transcript) {
                    this.setFeedback(final_transcript);
                    this.addToVoiceLiveLog(`Final: "${final_transcript}"`, 'info');
                    console.log('Final transcript:', final_transcript);
                    this.processCommand(final_transcript.toLowerCase());
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.addToCommandLog('Error: ' + event.error, 'error');
                this.setStatusAlert('Error: ' + event.error, 'danger');
            };
        } else {
            console.error('Speech recognition not supported');
            this.addToCommandLog('Speech recognition not supported in this browser', 'error');
            this.setStatusAlert('Speech recognition not supported in this browser', 'danger');
        }
    }

    bindEvents() {
        // Voice button click (all with class 'voiceButton')
        document.querySelectorAll('.voiceButton').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleListening();
            });
        });

        // Language selection change
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            if (this.recognition) {
                this.recognition.lang = this.getLanguageCode(this.currentLanguage);
            }
        });

        // Keyboard shortcut (Ctrl + Space)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                this.toggleListening();
            }
        });
    }

    toggleListening() {
        if (!this.recognition) return;

        if (this.isListening) {
            this.recognition.stop();
            this.voiceModal.hide();
        } else {
            this.recognition.start();
            this.voiceModal.show();
        }
    }

    setFeedback(text, isInterim = false) {
        if (this.feedbackArea) {
            this.feedbackArea.innerHTML = isInterim ? `<span style=\"color:#888;\">${text}</span>` : `<span>🗣 \"${text}\"</span>`;
            if (!isInterim) this.addToVoiceLiveLog(`Heard: "${text}"`, 'info');
        }
    }

    setStatusAlert(message, type = 'success') {
        if (!this.statusAlert) return;
        if (type === 'clear' || !message) {
            this.statusAlert.innerHTML = '';
            this.statusAlert.className = 'alert-area';
            return;
        }
        let icon = type === 'success' ? '✅' : (type === 'danger' ? '❌' : 'ℹ️');
        this.statusAlert.innerHTML = `${icon} ${message}`;
        this.statusAlert.className = `alert-area alert-${type}`;
        // Log the result to the live log as well
        this.addToVoiceLiveLog(message, type);
    }

    processCommand(command) {
        this.addToCommandLog(command);
        const validRooms = ['living room', 'bedroom', 'kitchen'];
        const roomMap = {
            'living room': 'livingRoomLights',
            'bedroom': 'bedroomLights',
            'kitchen': 'kitchenLights'
        };
        const patterns = {
            lights: {
                on: /turn on(?: (?:the )?(living room|bedroom|kitchen)(?: (?:room )?lights?)?)?/i,
                off: /turn off(?: (?:the )?(living room|bedroom|kitchen)(?: (?:room )?lights?)?)?/i
            },
            fan: {
                on: /turn on (?:the )?fan/i,
                off: /turn off (?:the )?fan/i,
                speed: /set fan speed to (low|medium|high)/i
            },
            locks: {
                lock: /lock (?:the )?(\w+) door/i,
                unlock: /unlock (?:the )?(\w+) door/i
            },
            entertainment: {
                tv: {
                    on: /turn on (?:the )?tv/i,
                    off: /turn off (?:the )?tv/i
                },
                music: {
                    on: /play music|turn on music/i,
                    off: /stop music|turn off music/i
                },
                volume: /set volume to (\d+)/i
            }
        };

        // Entertainment commands first
        if (patterns.entertainment.music.on.test(command)) {
            this.controlDevice('entertainment', 'music', true);
            this.setStatusAlert(`Music started`, 'success');
        } else if (patterns.entertainment.music.off.test(command)) {
            this.controlDevice('entertainment', 'music', false);
            this.setStatusAlert(`Music stopped`, 'danger');
        } else if (patterns.entertainment.tv.on.test(command)) {
            this.controlDevice('entertainment', 'tv', true);
            this.setStatusAlert(`TV turned ON`, 'success');
        } else if (patterns.entertainment.tv.off.test(command)) {
            this.controlDevice('entertainment', 'tv', false);
            this.setStatusAlert(`TV turned OFF`, 'danger');
        } else if (patterns.entertainment.volume.test(command)) {
            const volume = parseInt(command.match(patterns.entertainment.volume)[1]);
            this.controlDevice('entertainment', 'volume', volume);
            this.setStatusAlert(`Volume set to ${volume}%`, 'success');
        }
        // Fan commands next
        else if (patterns.fan.on.test(command)) {
            this.controlDevice('fan', 'power', true);
            this.setStatusAlert(`Fan turned ON`, 'success');
        } else if (patterns.fan.off.test(command)) {
            this.controlDevice('fan', 'power', false);
            this.setStatusAlert(`Fan turned OFF`, 'danger');
        } else if (patterns.fan.speed.test(command)) {
            const speed = command.match(patterns.fan.speed)[1];
            this.controlDevice('fan', 'speed', speed);
            this.setStatusAlert(`Fan speed set to ${speed}`, 'success');
        }
        // Lights commands after
        else if (patterns.lights.on.test(command)) {
            const match = command.match(patterns.lights.on);
            let room = match[1];
            if (room) {
                room = room.toLowerCase();
                if (validRooms.includes(room)) {
                    this.controlDevice('lights', roomMap[room], true);
                    this.setStatusAlert(`${room.charAt(0).toUpperCase() + room.slice(1)} light turned ON`, 'success');
                } else {
                    this.setStatusAlert('Invalid room: ' + room, 'danger');
                    this.addToVoiceLiveLog('Invalid room: ' + room, 'danger');
                }
            } else {
                // No room specified, turn on all lights
                Object.values(roomMap).forEach(r => this.controlDevice('lights', r, true));
                this.setStatusAlert('All lights turned ON', 'success');
            }
        } else if (patterns.lights.off.test(command)) {
            const match = command.match(patterns.lights.off);
            let room = match[1];
            if (room) {
                room = room.toLowerCase();
                if (validRooms.includes(room)) {
                    this.controlDevice('lights', roomMap[room], false);
                    this.setStatusAlert(`${room.charAt(0).toUpperCase() + room.slice(1)} light turned OFF`, 'danger');
                } else {
                    this.setStatusAlert('Invalid room: ' + room, 'danger');
                    this.addToVoiceLiveLog('Invalid room: ' + room, 'danger');
                }
            } else {
                // No room specified, turn off all lights
                Object.values(roomMap).forEach(r => this.controlDevice('lights', r, false));
                this.setStatusAlert('All lights turned OFF', 'danger');
            }
        }
        // Locks
        else if (patterns.locks.lock.test(command)) {
            const door = command.match(patterns.locks.lock)[1];
            this.controlDevice('locks', door, true);
            this.setStatusAlert(`${door.charAt(0).toUpperCase() + door.slice(1)} door LOCKED`, 'danger');
        } else if (patterns.locks.unlock.test(command)) {
            const door = command.match(patterns.locks.unlock)[1];
            this.controlDevice('locks', door, false);
            this.setStatusAlert(`${door.charAt(0).toUpperCase() + door.slice(1)} door UNLOCKED`, 'success');
        }
        // Not recognized
        else {
            this.addToCommandLog('Command not recognized: ' + command, 'error');
            this.setStatusAlert('Command not recognized: ' + command, 'danger');
            this.addToVoiceLiveLog('Command not recognized: ' + command, 'danger');
        }
    }

    controlDevice(device, control, value) {
        // Dispatch custom event for device control
        const event = new CustomEvent('deviceControl', {
            detail: { device, control, value }
        });
        document.dispatchEvent(event);
    }

    addToCommandLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = {
            timestamp,
            message,
            type
        };
        
        this.commandLog.unshift(entry);
        if (this.commandLog.length > 50) {
            this.commandLog.pop();
        }
        
        this.updateCommandLogUI();
    }

    updateCommandLogUI() {
        const logContainer = document.getElementById('commandLog');
        if (!logContainer) return;
        logContainer.innerHTML = this.commandLog.map(entry => `
            <div class="command-log-entry ${entry.type}">
                <span class="timestamp">[${entry.timestamp}]</span>
                <span class="message">${entry.message}</span>
            </div>
        `).join('');
    }

    addToVoiceLiveLog(message, type = 'info') {
        const logBody = document.getElementById('voiceLiveLogBody');
        if (!logBody) return;
        const timestamp = new Date().toLocaleTimeString();
        let icon = type === 'success' ? '✅' : (type === 'danger' ? '❌' : '🗣️');
        let color = type === 'success' ? '#198754' : (type === 'danger' ? '#dc3545' : '#0d6efd');
        const entry = document.createElement('div');
        entry.setAttribute('tabindex', '0');
        entry.setAttribute('role', 'log');
        entry.setAttribute('aria-live', 'polite');
        entry.style.marginBottom = '4px';
        entry.innerHTML = `<span style='color:#6c757d;font-size:0.85em;'>[${timestamp}]</span> <span style='color:${color};font-weight:bold;'>${icon}</span> <span>${message}</span>`;
        logBody.appendChild(entry);
        logBody.scrollTop = logBody.scrollHeight;
    }

    getLanguageCode(language) {
        const codes = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE'
        };
        return codes[language] || 'en-US';
    }
}

// Initialize voice control when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.voiceControl = new VoiceControl();
}); 