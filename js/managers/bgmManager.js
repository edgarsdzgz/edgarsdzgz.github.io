// ===============================================
// BGM MANAGER
// ===============================================

import { CONFIG } from '../config.js';
import { getStorageItem, setStorageItem } from '../utils/storage.js';

export class BGMManager {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.volume = 15; // 0-100
        this.bgmUnlocked = false;
        this.fadeInterval = null;

        // DOM elements (will be set after unlock)
        this.playPauseBtn = null;
        this.volumeSlider = null;
        this.volumeDisplay = null;

        this.init();
    }

    init() {
        // Load saved state
        this.loadState();

        // Create audio element
        this.audio = new Audio('sounds/music/8-bit-adventure.mp3');
        this.audio.loop = true;
        this.audio.volume = this.volume / 100;

        // Handle audio events
        this.audio.addEventListener('ended', () => {
            console.log('[BGM] Track ended (should loop)');
        });

        this.audio.addEventListener('error', (e) => {
            console.error('[BGM] Error loading audio:', e);
        });

        console.log('[BGM] Manager initialized. Unlocked:', this.bgmUnlocked);
    }

    loadState() {
        const savedUnlocked = getStorageItem(CONFIG.bgmUnlockedKey);
        const savedVolume = getStorageItem(CONFIG.bgmVolumeKey);
        const savedPlaying = getStorageItem(CONFIG.bgmPlayingKey);

        this.bgmUnlocked = savedUnlocked === 'true';
        this.volume = savedVolume ? parseInt(savedVolume, 10) : 15;

        // Only auto-play if it was playing before AND unlocked
        // Note: Autoplay policy may still block this
        if (this.bgmUnlocked && savedPlaying === 'true') {
            // We'll attempt to play after first user interaction
            this.isPlaying = true;
        }

        // Handle NaN case
        if (isNaN(this.volume)) this.volume = 15;
        if (this.volume < 0) this.volume = 0;
        if (this.volume > 100) this.volume = 100;
    }

    setupControls(playPauseBtn, volumeSlider, volumeDisplay) {
        this.playPauseBtn = playPauseBtn;
        this.volumeSlider = volumeSlider;
        this.volumeDisplay = volumeDisplay;

        // Setup play/pause button
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        // Setup volume slider
        if (this.volumeSlider) {
            this.volumeSlider.value = this.volume;
            this.volumeSlider.addEventListener('input', (e) => {
                this.setVolume(parseInt(e.target.value, 10));
            });
        }

        // Update display
        this.updateControls();

        console.log('[BGM] Controls connected');
    }

    updateControls() {
        if (this.playPauseBtn) {
            // Update button text/icon
            this.playPauseBtn.textContent = this.isPlaying ? '⏸' : '▶';
            this.playPauseBtn.title = this.isPlaying ? 'Pause BGM' : 'Play BGM';
        }

        if (this.volumeDisplay) {
            this.volumeDisplay.textContent = `${this.volume}%`;
        }

        if (this.volumeSlider) {
            this.volumeSlider.value = this.volume;
        }
    }

    async togglePlayPause() {
        if (!this.bgmUnlocked) {
            console.log('[BGM] Not unlocked yet');
            return;
        }

        if (this.isPlaying) {
            this.pause();
        } else {
            await this.play();
        }
    }

    async play() {
        if (!this.audio || !this.bgmUnlocked) return;

        try {
            // Fade in from 0 to target volume
            this.audio.volume = 0;
            await this.audio.play();
            this.isPlaying = true;
            this.fadeIn();

            setStorageItem(CONFIG.bgmPlayingKey, 'true');
            this.updateControls();
            console.log('[BGM] Playing');
        } catch (error) {
            console.error('[BGM] Error playing:', error);
            // Autoplay was probably blocked
            this.isPlaying = false;
            this.updateControls();
        }
    }

    pause() {
        if (!this.audio) return;

        // Fade out before pausing
        this.fadeOut(() => {
            this.audio.pause();
            this.isPlaying = false;
            setStorageItem(CONFIG.bgmPlayingKey, 'false');
            this.updateControls();
            console.log('[BGM] Paused');
        });
    }

    stop() {
        if (!this.audio) return;

        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        setStorageItem(CONFIG.bgmPlayingKey, 'false');
        this.updateControls();
        console.log('[BGM] Stopped');
    }

    setVolume(newVolume) {
        // Clamp between 0-100
        this.volume = Math.max(0, Math.min(100, newVolume));

        if (this.audio) {
            this.audio.volume = this.volume / 100;
        }

        setStorageItem(CONFIG.bgmVolumeKey, this.volume);
        this.updateControls();
        console.log('[BGM] Volume set to:', this.volume);
    }

    fadeIn(duration = 1000) {
        // Clear any existing fade
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
        }

        const targetVolume = this.volume / 100;
        const steps = 20;
        const stepDuration = duration / steps;
        const volumeStep = targetVolume / steps;

        let currentStep = 0;
        this.fadeInterval = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                this.audio.volume = targetVolume;
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
            } else {
                this.audio.volume = volumeStep * currentStep;
            }
        }, stepDuration);
    }

    fadeOut(callback, duration = 500) {
        // Clear any existing fade
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
        }

        const startVolume = this.audio.volume;
        const steps = 10;
        const stepDuration = duration / steps;
        const volumeStep = startVolume / steps;

        let currentStep = 0;
        this.fadeInterval = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                this.audio.volume = 0;
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
                if (callback) callback();
            } else {
                this.audio.volume = startVolume - (volumeStep * currentStep);
            }
        }, stepDuration);
    }

    unlock() {
        this.bgmUnlocked = true;
        setStorageItem(CONFIG.bgmUnlockedKey, 'true');
        console.log('[BGM] BGM unlocked!');

        // Show BGM controls
        const bgmControls = document.getElementById('bgm-controls');
        if (bgmControls) {
            bgmControls.style.display = 'flex';
        }

        // Auto-play when unlocked
        this.play();
    }

    isBGMUnlocked() {
        return this.bgmUnlocked;
    }

    getVolume() {
        return this.volume;
    }

    getIsPlaying() {
        return this.isPlaying;
    }
}
