// Device Control Class
class DeviceControl {
    constructor() {
        this.devices = {}; // Initialize devices as an empty object
        this.apiEndpoint = 'api/device-state.php';

        this.bindEvents();
        this.fetchInitialState(); // Fetch initial state when the class is instantiated
    }

    async fetchInitialState() {
        try {
            const response = await fetch(this.apiEndpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === 'success') {
                this.devices = data.data;
                this.updateAllUI(); // Update all UI elements based on fetched state
            } else {
                console.error('Failed to fetch initial state:', data.message);
                if (window.voiceControl) {
                    window.voiceControl.addToCommandLog('Failed to load device states', 'error');
                }
            }
        } catch (error) {
            console.error('Error fetching initial state:', error);
            if (window.voiceControl) {
                window.voiceControl.addToCommandLog('Error communicating with server', 'error');
            }
            // Initialize with default states if fetching fails
             this.devices = {
                lights: {
                    'livingRoomLights': false,
                    'bedroomLights': false,
                    'kitchenLights': false
                },
                fan: {
                    power: false,
                    speed: 0
                },
                locks: {
                    'frontDoorLock': false,
                    'backDoorLock': false
                },
                entertainment: {
                    tv: false,
                    music: false,
                    volume: 50
                }
            };
            this.updateAllUI();
        }
    }

    bindEvents() {
        // Listen for device control events from voice control
        document.addEventListener('deviceControl', (e) => {
            const { device, control, value } = e.detail;
            this.handleDeviceControl(device, control, value);
        });

        // Bind UI controls - moved to after initial state is fetched and UI updated
       // this.bindUIControls();
    }

    bindUIControls() {
         // Unbind existing listeners before binding again
         this.unbindUIControls();

        // Lights controls
        Object.keys(this.devices.lights).forEach(light => {
            const checkbox = document.getElementById(light);
            if (checkbox) {
                // Use a unique function reference or remove specific listener if possible
                // For simplicity, rebinding, assuming no complex interactions need protection
                const listener = (e) => { this.handleDeviceControl('lights', light, e.target.checked); };
                checkbox._listener = listener; // Store listener for unbinding
                checkbox.addEventListener('change', listener);
            }
        });

        // Fan controls
        const fanPower = document.getElementById('fanPower');
        const fanSpeed = document.getElementById('fanSpeed');
        if (fanPower) {
             const listener = (e) => { this.handleDeviceControl('fan', 'power', e.target.checked); };
             fanPower._listener = listener;
             fanPower.addEventListener('change', listener);
        }
        if (fanSpeed) {
             const listener = (e) => { this.handleDeviceControl('fan', 'speed', parseInt(e.target.value)); };
             fanSpeed._listener = listener;
             fanSpeed.addEventListener('input', listener);
        }

        // Lock controls
        Object.keys(this.devices.locks).forEach(lock => {
            const checkbox = document.getElementById(lock);
            if (checkbox) {
                const listener = (e) => { this.handleDeviceControl('locks', lock, e.target.checked); };
                checkbox._listener = listener;
                checkbox.addEventListener('change', listener);
            }
        });

        // Entertainment controls
        const tvPower = document.getElementById('tvPower');
        const musicPower = document.getElementById('musicPower');
        const volumeControl = document.getElementById('volumeControl');

        if (tvPower) {
             const listener = (e) => { this.handleDeviceControl('entertainment', 'tv', e.target.checked); };
             tvPower._listener = listener;
             tvPower.addEventListener('change', listener);
        }
        if (musicPower) {
             const listener = (e) => { this.handleDeviceControl('entertainment', 'music', e.target.checked); };
             musicPower._listener = listener;
             musicPower.addEventListener('change', listener);
        }
        if (volumeControl) {
             const listener = (e) => { this.handleDeviceControl('entertainment', 'volume', parseInt(e.target.value)); };
             volumeControl._listener = listener;
             volumeControl.addEventListener('input', listener);
        }
    }

     unbindUIControls() {
        // Remove listeners to prevent duplicates
        const controls = [
            ...Object.keys(this.devices.lights),
            'fanPower', 'fanSpeed',
            ...Object.keys(this.devices.locks),
            'tvPower', 'musicPower', 'volumeControl'
        ];

        controls.forEach(controlId => {
            const element = document.getElementById(controlId);
            if (element && element._listener) {
                element.removeEventListener(element === fanSpeed || element === volumeControl ? 'input' : 'change', element._listener);
                delete element._listener;
            }
        });
    }

    async handleDeviceControl(device, control, value) {
        // Send update to backend
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ device, control, value }),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(`Backend error: ${errorData.message}`);
            }

            const data = await response.json();

            if (data.status === 'success') {
                 // Update device state and UI only on successful backend response
                this.devices = data.data; // Update all states based on backend response
                this.updateAllUI(); // Update all UI elements
                this.simulateDeviceResponse(device, control, value); // Log the action after success
            } else {
                console.error('Backend reported error:', data.message);
                 if (window.voiceControl) {
                    window.voiceControl.addToCommandLog(`Command failed: ${data.message}`, 'error');
                }
                 // Revert UI to previous state if backend update failed
                 this.updateAllUI();
            }

        } catch (error) {
            console.error('Error sending command to backend:', error);
             if (window.voiceControl) {
                window.voiceControl.addToCommandLog(`Error: ${error.message}`, 'error');
            }
            // Revert UI to previous state on network/request error
            this.updateAllUI();
        }
    }

     updateAllUI() {
         // Update all controls based on the current state of this.devices

         // Lights
        Object.keys(this.devices.lights).forEach(lightId => {
            const checkbox = document.getElementById(lightId);
            const statusSpan = document.getElementById(lightId + 'Status');
            if (checkbox) {
                checkbox.checked = this.devices.lights[lightId];
            }
            if (statusSpan) {
                statusSpan.textContent = this.devices.lights[lightId] ? '(On)' : '(Off)';
                statusSpan.style.color = this.devices.lights[lightId] ? '#28a745' : '#dc3545'; // Green for On, Red for Off
            }
        });

         // Fan
        const fanPowerCheckbox = document.getElementById('fanPower');
        const fanPowerStatusSpan = document.getElementById('fanPowerStatus');
        const fanSpeedSlider = document.getElementById('fanSpeed');

        if (fanPowerCheckbox) {
            fanPowerCheckbox.checked = this.devices.fan.power;
        }
        if (fanPowerStatusSpan) {
             fanPowerStatusSpan.textContent = this.devices.fan.power ? '(On)' : '(Off)';
             fanPowerStatusSpan.style.color = this.devices.fan.power ? '#28a745' : '#dc3545';
        }
        if (fanSpeedSlider) {
            fanSpeedSlider.value = this.devices.fan.speed;
        }

         // Locks
        Object.keys(this.devices.locks).forEach(lockId => {
            const checkbox = document.getElementById(lockId);
            const statusSpan = document.getElementById(lockId + 'Status');
            if (checkbox) {
                checkbox.checked = this.devices.locks[lockId];
            }
            if (statusSpan) {
                statusSpan.textContent = this.devices.locks[lockId] ? '(Locked)' : '(Unlocked)';
                 statusSpan.style.color = this.devices.locks[lockId] ? '#dc3545' : '#28a745'; // Red for Locked, Green for Unlocked
            }
        });

         // Entertainment
        const tvPowerCheckbox = document.getElementById('tvPower');
        const tvPowerStatusSpan = document.getElementById('tvPowerStatus');
        const musicPowerCheckbox = document.getElementById('musicPower');
        const musicPowerStatusSpan = document.getElementById('musicPowerStatus');
        const volumeControlSlider = document.getElementById('volumeControl');

        if (tvPowerCheckbox) {
            tvPowerCheckbox.checked = this.devices.entertainment.tv;
        }
         if (tvPowerStatusSpan) {
             tvPowerStatusSpan.textContent = this.devices.entertainment.tv ? '(On)' : '(Off)';
             tvPowerStatusSpan.style.color = this.devices.entertainment.tv ? '#28a745' : '#dc3545';
         }
        if (musicPowerCheckbox) {
            musicPowerCheckbox.checked = this.devices.entertainment.music;
        }
         if (musicPowerStatusSpan) {
             musicPowerStatusSpan.textContent = this.devices.entertainment.music ? '(On)' : '(Off)';
             musicPowerStatusSpan.style.color = this.devices.entertainment.music ? '#28a745' : '#dc3545';
         }
        if (volumeControlSlider) {
            volumeControlSlider.value = this.devices.entertainment.volume;
        }

         // After updating UI, re-bind controls
         this.bindUIControls();
    }

    simulateDeviceResponse(device, control, value) {
        let message = '';

        if (device === 'lights') {
            const room = control.replace('Lights', '');
            message = `${room} lights ${value ? 'turned on' : 'turned off'}`;
        } else if (device === 'fan') {
            if (control === 'power') {
                message = `Fan ${value ? 'turned on' : 'turned off'}`;
            } else if (control === 'speed') {
                const speeds = ['off', 'low', 'medium', 'high'];
                message = `Fan speed set to ${speeds[value]}`;
            }
        } else if (device === 'locks') {
            const door = control.replace('Lock', '');
            message = `${door} door ${value ? 'locked' : 'unlocked'}`;
        } else if (device === 'entertainment') {
            if (control === 'tv') {
                message = `TV ${value ? 'turned on' : 'turned off'}`;
            } else if (control === 'music') {
                message = `Music ${value ? 'started' : 'stopped'}`;
            } else if (control === 'volume') {
                message = `Volume set to ${value}%`;
            }
        }

        if (message && window.voiceControl) {
            window.voiceControl.addToCommandLog(message, 'success');
        }
    }
}

// Initialize device control when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.deviceControl = new DeviceControl();
}); 