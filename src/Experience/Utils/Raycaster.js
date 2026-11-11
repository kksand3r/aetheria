import * as THREE from 'three'
import EventEmitter from './EventEmitter.js'
import Experience from '../Experience.js'

export default class Raycaster extends EventEmitter {
    constructor() {
        super()

        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.canvas = this.experience.canvas

        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2(-999, -999)
        this.interactiveObjects = []
        this.currentIntersected = null

        this.setupEvents()
    }

    register(mesh, data = {}) {
        mesh.userData = { ...mesh.userData, ...data, isInteractive: true }
        this.interactiveObjects.push(mesh)
    }

    unregister(mesh) {
        this.interactiveObjects = this.interactiveObjects.filter(item => item !== mesh)
    }

    setupEvents() {
        window.addEventListener('pointermove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
        })

        this.canvas.addEventListener('pointerdown', (event) => {
            // Only left mouse click
            if (event.button !== 0) return

            this.raycaster.setFromCamera(this.mouse, this.camera.instance)
            const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true)

            if (intersects.length > 0) {
                // Find nearest interactive root
                let obj = intersects[0].object
                while (obj && !obj.userData?.isInteractive && obj.parent) {
                    obj = obj.parent
                }

                if (obj && obj.userData?.isInteractive) {
                    this.trigger('click', [obj, intersects[0]])
                }
            }
        })
    }

    update() {
        this.raycaster.setFromCamera(this.mouse, this.camera.instance)
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true)

        if (intersects.length > 0) {
            let obj = intersects[0].object
            while (obj && !obj.userData?.isInteractive && obj.parent) {
                obj = obj.parent
            }

            if (obj !== this.currentIntersected) {
                if (this.currentIntersected) {
                    this.trigger('hoverLeave', [this.currentIntersected])
                }
                this.currentIntersected = obj
                this.canvas.style.cursor = 'pointer'
                this.trigger('hoverEnter', [obj])
            }
        } else {
            if (this.currentIntersected) {
                this.canvas.style.cursor = 'default'
                this.trigger('hoverLeave', [this.currentIntersected])
                this.currentIntersected = null
            }
        }
    }
}

