import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Waterfall {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene

        this.group = new THREE.Group()
        this.scene.add(this.group)

        this.setMaterials()
        this.setRiver()
        this.setCascade()
        this.setMistParticles()
    }

    setMaterials() {
        // Advanced MeshPhysicalMaterial for water with optical transmission, refraction and clearcoat
        this.waterMaterial = new THREE.MeshPhysicalMaterial({
            color: '#38bdf8',
            emissive: '#0284c7',
            emissiveIntensity: 0.25,
            roughness: 0.04,
            metalness: 0.05,
            transmission: 0.78,
            ior: 1.333,          // Water optical refractive index
            thickness: 0.9,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            transparent: true,
            opacity: 0.9
        })

        // Edge foam material
        this.foamMaterial = new THREE.MeshBasicMaterial({
            color: '#e0f2fe',
            transparent: true,
            opacity: 0.7
        })
    }

    setRiver() {
        // Curved river stream across the island plate
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(1, 0.95, -2),
            new THREE.Vector3(3.5, 0.92, -0.5),
            new THREE.Vector3(5.8, 0.9, 1.2),
            new THREE.Vector3(8.5, 0.88, 3.2),
            new THREE.Vector3(10.8, 0.85, 4.5) // Island edge
        ])

        const riverGeo = new THREE.TubeGeometry(curve, 32, 0.7, 10, false)
        // Flatten slightly to look like a bed of water
        riverGeo.scale(1, 0.25, 1)

        this.riverMesh = new THREE.Mesh(riverGeo, this.waterMaterial)
        this.riverMesh.receiveShadow = true
        this.group.add(this.riverMesh)
    }

    setCascade() {
        // Waterfall sheet plunging down from the island edge into the endless sky
        // Edge position: (10.8, 0.85, 4.5)
        const cascadeGeo = new THREE.PlaneGeometry(2.4, 16, 24, 48)
        
        // Add curve bowing outward as water arcs over the cliff
        const pos = cascadeGeo.attributes.position
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i) // from -8 to +8
            const t = (8 - y) / 16 // 0 at top, 1 at bottom
            
            // Arch outward at the top, taper slightly at bottom
            const arc = Math.sin(t * Math.PI * 0.7) * 1.2
            pos.setZ(i, pos.getZ(i) + arc)
        }
        cascadeGeo.computeVertexNormals()

        this.cascadeMesh = new THREE.Mesh(cascadeGeo, this.waterMaterial)
        this.cascadeMesh.position.set(10.9, -7.0, 4.5)
        this.cascadeMesh.rotation.y = -Math.PI / 3.8
        this.group.add(this.cascadeMesh)

        // Foam lip at the cliff edge
        const lipGeo = new THREE.CylinderGeometry(0.2, 0.3, 2.6, 12)
        const lip = new THREE.Mesh(lipGeo, this.foamMaterial)
        lip.position.set(10.75, 0.85, 4.5)
        lip.rotation.z = Math.PI / 2
        lip.rotation.y = -Math.PI / 3.8
        this.group.add(lip)
    }

    setMistParticles() {
        const mistCount = 200
        const mistGeo = new THREE.BufferGeometry()
        const positions = new Float32Array(mistCount * 3)
        const velocities = []

        for (let i = 0; i < mistCount; i++) {
            positions[i * 3] = 10.8 + (Math.random() - 0.5) * 2.5
            positions[i * 3 + 1] = -14 + Math.random() * 4 // Deep below island
            positions[i * 3 + 2] = 4.5 + (Math.random() - 0.5) * 2.5

            velocities.push({
                vx: (Math.random() - 0.5) * 0.02,
                vy: Math.random() * 0.04 + 0.01,
                vz: (Math.random() - 0.5) * 0.02,
                initY: positions[i * 3 + 1]
            })
        }

        mistGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        this.mistMaterial = new THREE.PointsMaterial({
            color: '#bae6fd',
            size: 0.9,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        this.mistPoints = new THREE.Points(mistGeo, this.mistMaterial)
        this.group.add(this.mistPoints)
        this.mistVelocities = velocities
    }

    update(elapsedTime) {
        // Animate water flow ripple through subtle vertex wave distortion
        if (this.cascadeMesh) {
            const pos = this.cascadeMesh.geometry.attributes.position
            for (let i = 0; i < pos.count; i++) {
                const y = pos.getY(i)
                const wave = Math.sin(y * 2.5 - elapsedTime * 7.0) * 0.07
                pos.setX(i, (i % 25 - 12) * (2.4 / 24) + wave)
            }
            pos.needsUpdate = true
        }

        // Mist rising and fading
        if (this.mistPoints) {
            const pos = this.mistPoints.geometry.attributes.position
            for (let i = 0; i < pos.count; i++) {
                let y = pos.getY(i) + this.mistVelocities[i].vy
                if (y > -8) {
                    y = this.mistVelocities[i].initY
                }
                pos.setY(i, y)
                pos.setX(i, pos.getX(i) + this.mistVelocities[i].vx)
                pos.setZ(i, pos.getZ(i) + this.mistVelocities[i].vz)
            }
            pos.needsUpdate = true
        }
    }
}

