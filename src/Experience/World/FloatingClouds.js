import * as THREE from 'three'
import Experience from '../Experience.js'

export default class FloatingClouds {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene

        this.group = new THREE.Group()
        this.scene.add(this.group)

        this.cloudList = []
        this.setMaterial()
        this.createClouds()
    }

    setMaterial() {
        this.cloudMaterial = new THREE.MeshStandardMaterial({
            color: '#ffffff',
            roughness: 0.95,
            metalness: 0.05,
            transparent: true,
            opacity: 0.82,
            flatShading: true
        })
    }

    createClouds() {
        const cloudCount = 18
        const sphereGeo = new THREE.DodecahedronGeometry(1.6, 1)

        for (let i = 0; i < cloudCount; i++) {
            const cloud = new THREE.Group()
            
            // Build cluster of 4-7 spheres for a natural puffy look
            const puffs = 4 + Math.floor(Math.random() * 4)
            for (let p = 0; p < puffs; p++) {
                const mesh = new THREE.Mesh(sphereGeo, this.cloudMaterial)
                mesh.position.set(
                    (p - puffs / 2) * 1.4 + (Math.random() - 0.5) * 0.8,
                    (Math.random() - 0.5) * 0.7,
                    (Math.random() - 0.5) * 1.2
                )
                const s = 0.7 + Math.random() * 0.7
                mesh.scale.set(s * 1.3, s * 0.85, s)
                mesh.castShadow = true
                cloud.add(mesh)
            }

            // Distribute across sky and below island
            const angle = Math.random() * Math.PI * 2
            const dist = 18 + Math.random() * 35
            const y = -14 + Math.random() * 22 // some below island (-14 to -6), some level (0 to 8)

            cloud.position.set(
                Math.cos(angle) * dist,
                y,
                Math.sin(angle) * dist
            )

            const overallScale = 1.2 + Math.random() * 1.6
            cloud.scale.setScalar(overallScale)

            this.group.add(cloud)

            this.cloudList.push({
                group: cloud,
                speed: 0.4 + Math.random() * 0.6,
                baseY: y,
                wobbleOffset: Math.random() * Math.PI * 2
            })
        }
    }

    update(elapsedTime, delta) {
        // Wind drifts clouds along X axis
        const windSpeed = 0.001 * delta
        this.cloudList.forEach((c) => {
            c.group.position.x += c.speed * windSpeed * 8
            // Gentle altitude bobbing
            c.group.position.y = c.baseY + Math.sin(elapsedTime * 0.5 + c.wobbleOffset) * 0.4

            // Wrap around sky boundary
            if (c.group.position.x > 50) {
                c.group.position.x = -50
            }
        })
    }
}

