import EventEmitter from './EventEmitter.js'
import { Timer } from 'three/addons/misc/Timer.js'

export default class Time extends EventEmitter {
    constructor() {
        super()

        // Setup
        this.timer = new Timer()
        this.start = Date.now()
        this.current = this.start
        this.elapsed = 0
        this.delta = 16 // Standard 60 FPS initial delta (ms)

        window.requestAnimationFrame(() => {
            this.tick()
        })
    }

    tick() {
        this.timer.update()
        const currentTime = Date.now()
        this.delta = currentTime - this.current
        this.current = currentTime
        this.elapsed = this.timer.getElapsed()

        this.trigger('tick')

        window.requestAnimationFrame(() => {
            this.tick()
        })
    }
}

