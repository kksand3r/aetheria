import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import Experience from './Experience.js'

export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        this.isCinematic = false

        this.setInstance()
        this.setControls()
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            45,
            this.sizes.width / this.sizes.height,
            0.1,
            250
        )
        // Initial cinematic overview position
        this.instance.position.set(16, 11, 20)
        this.scene.add(this.instance)
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05
        this.controls.maxDistance = 60
        this.controls.minDistance = 4
        this.controls.maxPolarAngle = Math.PI / 2 + 0.15 // Can view slightly under the island
        this.controls.target.set(0, 1.5, 0)
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        if (this.isCinematic) {
            this.controls.autoRotate = true
            this.controls.autoRotateSpeed = 0.8
        } else {
            this.controls.autoRotate = false
        }
        this.controls.update()
    }

    /**
     * Smoothly animate camera to target view
     * @param {THREE.Vector3|Object} targetPos The look-at coordinate
     * @param {THREE.Vector3|Object} camPos The camera coordinate
     * @param {number} duration Transition duration in seconds
     */
    focusOn(targetPos, camPos, duration = 1.6) {
        gsap.to(this.instance.position, {
            x: camPos.x,
            y: camPos.y,
            z: camPos.z,
            duration: duration,
            ease: 'power2.inOut'
        })

        gsap.to(this.controls.target, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: duration,
            ease: 'power2.inOut'
        })
    }
}

