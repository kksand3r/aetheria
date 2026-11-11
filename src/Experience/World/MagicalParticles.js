import * as THREE from 'three'
import Experience from '../Experience.js'

export default class MagicalParticles {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene

        this.particleCount = 350
        this.setParticles()
    }

    setParticles() {
        const geo = new THREE.BufferGeometry()
        const positions = new Float32Array(this.particleCount * 3)
        const scales = new Float32Array(this.particleCount)
        this.particleData = []

        for (let i = 0; i < this.particleCount; i++) {
            // Distribute across the island volume
            const r = Math.random() * 10.5
            const theta = Math.random() * Math.PI * 2

            const x = Math.cos(theta) * r
            const y = 0.8 + Math.random() * 5.5
            const z = Math.sin(theta) * r

            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            scales[i] = Math.random() * 0.35 + 0.1

            this.particleData.push({
                initX: x,
                initY: y,
                initZ: z,
                speedY: 0.003 + Math.random() * 0.008,
                freqX: 0.8 + Math.random() * 1.5,
                freqZ: 0.8 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2
            })
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

        // Sparkling point sprite material
        this.material = new THREE.PointsMaterial({
            color: '#a7f3d0',
            size: 0.35,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        this.points = new THREE.Points(geo, this.material)
        this.scene.add(this.points)
    }

    update(elapsedTime) {
        if (!this.points) return

        const pos = this.points.geometry.attributes.position
        for (let i = 0; i < this.particleCount; i++) {
            const data = this.particleData[i]

            // Drift upward gently
            let y = pos.getY(i) + data.speedY
            if (y > 7.5) {
                y = 0.8
            }

            // Sway horizontally like fireflies in the breeze
            const swayX = data.initX + Math.sin(elapsedTime * data.freqX + data.phase) * 0.4
            const swayZ = data.initZ + Math.cos(elapsedTime * data.freqZ + data.phase) * 0.4

            pos.setX(i, swayX)
            pos.setY(i, y)
            pos.setZ(i, swayZ)
        }
        pos.needsUpdate = true

        // Pulsating glow
        this.material.opacity = 0.6 + Math.sin(elapsedTime * 3) * 0.25
    }
}

