import * as THREE from 'three'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'
import Debug from './Utils/Debug.js'
import AudioManager from './Utils/AudioManager.js'
import Raycaster from './Utils/Raycaster.js'
import EventEmitter from './Utils/EventEmitter.js'
import sources from './sources.js'

let instance = null

export default class Experience {
    constructor(canvas) {
        // Singleton pattern
        if (instance) {
            return instance
        }
        instance = this

        // Global access for debugging in browser console
        window.experience = this

        // Canvas
        this.canvas = canvas

        // Setup base utilities
        this.events = new EventEmitter()
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.audio = new AudioManager()
        this.resources = new Resources(sources)
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.raycaster = new Raycaster()
        this.world = new World()

        // Sizes resize event
        this.sizes.on('resize', () => {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () => {
            this.update()
        })
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    update() {
        this.camera.update()
        this.raycaster.update()
        this.world.update()
        this.renderer.update()
    }

    destroy() {
        this.sizes.off('resize')
        this.time.off('tick')

        // Traverse the whole scene and dispose geometries and materials
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
                child.geometry.dispose()

                for (const key in child.material) {
                    const value = child.material[key]
                    if (value && typeof value.dispose === 'function') {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.destroy()

        if (this.debug.active && this.debug.ui) {
            this.debug.ui.destroy()
        }
    }
}

