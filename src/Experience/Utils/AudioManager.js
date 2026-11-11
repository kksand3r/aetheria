/**
 * Procedural Web Audio API Sound Generator
 * Generates rich fantasy soundscapes without needing external audio files.
 */
export default class AudioManager {
    constructor() {
        this.ctx = null
        this.isMuted = false
        this.isInitialized = false
        this.masterGain = null

        // Wind / ambient noise nodes
        this.windGain = null
        this.waterGain = null

        this.setupAudioContext()
    }

    setupAudioContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) return

        const initOnInteraction = () => {
            if (!this.ctx) {
                this.ctx = new AudioContext()
                this.masterGain = this.ctx.createGain()
                this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime)
                this.masterGain.connect(this.ctx.destination)
                this.createAmbientAtmosphere()
                this.isInitialized = true
            } else if (this.ctx.state === 'suspended') {
                this.ctx.resume()
            }
            window.removeEventListener('click', initOnInteraction)
            window.removeEventListener('keydown', initOnInteraction)
        }

        window.addEventListener('click', initOnInteraction)
        window.addEventListener('keydown', initOnInteraction)
    }

    toggleMute() {
        this.isMuted = !this.isMuted
        if (this.masterGain && this.ctx) {
            const targetGain = this.isMuted ? 0 : 0.6
            this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05)
        }
        return this.isMuted
    }

    createAmbientAtmosphere() {
        if (!this.ctx) return

        // 1. Procedural Wind generator using filtered noise
        const bufferSize = this.ctx.sampleRate * 2
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        let lastOut = 0.0

        // Pink noise approximation
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1
            output[i] = (lastOut + 0.02 * white) / 1.02
            lastOut = output[i]
            output[i] *= 3.5
        }

        const whiteNoise = this.ctx.createBufferSource()
        whiteNoise.buffer = noiseBuffer
        whiteNoise.loop = true

        const windFilter = this.ctx.createBiquadFilter()
        windFilter.type = 'bandpass'
        windFilter.frequency.setValueAtTime(320, this.ctx.currentTime)
        windFilter.Q.setValueAtTime(1.5, this.ctx.currentTime)

        this.windGain = this.ctx.createGain()
        this.windGain.gain.setValueAtTime(0.08, this.ctx.currentTime)

        whiteNoise.connect(windFilter)
        windFilter.connect(this.windGain)
        this.windGain.connect(this.masterGain)
        whiteNoise.start()

        // 2. Gentle magical drone (chord C major 7th ethereal pads)
        const freqs = [130.81, 164.81, 196.00, 246.94] // C3, E3, G3, B3
        freqs.forEach((freq) => {
            const osc = this.ctx.createOscillator()
            const gain = this.ctx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime)

            gain.gain.setValueAtTime(0.015, this.ctx.currentTime)
            osc.connect(gain)
            gain.connect(this.masterGain)
            osc.start()
        })
    }

    /**
     * Play harmonic crystalline chime when interacting with crystals
     * @param {string} type 'fire' | 'water' | 'earth' | 'arcane'
     */
    playCrystalChime(type) {
        if (!this.ctx || this.isMuted) return
        if (this.ctx.state === 'suspended') this.ctx.resume()

        const baseFrequencies = {
            fire: 528,     // Warm, resonant transformation
            water: 639,    // Fluid harmonic connection
            earth: 432,    // Deep grounding frequency
            arcane: 852    // High ethereal awakening
        }

        const root = baseFrequencies[type] || 528
        const harmonics = [1, 1.5, 2, 2.5] // Perfect 5th, octave, major 10th

        harmonics.forEach((h, index) => {
            const osc = this.ctx.createOscillator()
            const gain = this.ctx.createGain()

            osc.type = index % 2 === 0 ? 'sine' : 'triangle'
            osc.frequency.setValueAtTime(root * h, this.ctx.currentTime)

            // Bell envelope: sharp attack, long exponential decay
            gain.gain.setValueAtTime(0.12 / (index + 1), this.ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8 + index * 0.2)

            osc.connect(gain)
            gain.connect(this.masterGain)

            osc.start()
            osc.stop(this.ctx.currentTime + 2.5)
        })
    }

    /**
     * Play bubbling sound for the cauldron
     */
    playCauldronBubble() {
        if (!this.ctx || this.isMuted) return
        if (this.ctx.state === 'suspended') this.ctx.resume()

        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        const startFreq = 220 + Math.random() * 200
        const endFreq = startFreq + 180 + Math.random() * 120

        osc.type = 'sine'
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.15)

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.16)

        osc.connect(gain)
        gain.connect(this.masterGain)

        osc.start()
        osc.stop(this.ctx.currentTime + 0.18)
    }

    /**
     * Play elemental reaction / spell burst sound
     */
    playReactionBurst() {
        if (!this.ctx || this.isMuted) return
        if (this.ctx.state === 'suspended') this.ctx.resume()

        const chord = [392, 493.88, 587.33, 783.99, 987.77] // G major ascending sparkle
        chord.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator()
            const gain = this.ctx.createGain()

            osc.type = 'sine'
            const startTime = this.ctx.currentTime + idx * 0.07
            osc.frequency.setValueAtTime(freq, startTime)

            gain.gain.setValueAtTime(0.1, startTime)
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2)

            osc.connect(gain)
            gain.connect(this.masterGain)

            osc.start(startTime)
            osc.stop(startTime + 1.3)
        })
    }
}

