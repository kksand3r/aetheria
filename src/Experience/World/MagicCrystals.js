import * as THREE from 'three'
import gsap from 'gsap'
import Experience from '../Experience.js'

export default class MagicCrystals {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.raycaster = this.experience.raycaster
        this.audio = this.experience.audio
        this.resources = this.experience.resources

        this.group = new THREE.Group()
        this.scene.add(this.group)

        // 4 Elements definitions
        this.elements = [
            {
                id: 'fire',
                name: 'Ignis (Fire Crystal)',
                desc: 'Ancient flame condensed into eternal crystal ruby.',
                color: '#ef4444',
                emissive: '#dc2626',
                pos: { x: -3.5, y: 1.8, z: 2.5 },
                active: false
            },
            {
                id: 'water',
                name: 'Aquas (Water Crystal)',
                desc: 'Deep spring essence from the celestial springs.',
                color: '#06b6d4',
                emissive: '#0891b2',
                pos: { x: -1.2, y: 1.8, z: 5.2 },
                active: false
            },
            {
                id: 'earth',
                name: 'Terra (Earth Crystal)',
                desc: 'Verdant emerald resonating with ancient roots.',
                color: '#10b981',
                emissive: '#059669',
                pos: { x: 2.2, y: 1.8, z: 3.8 },
                active: false
            },
            {
                id: 'arcane',
                name: 'Aether (Arcane Crystal)',
                desc: 'Pure mystical starlight crystallized in purple prism.',
                color: '#a855f7',
                emissive: '#7e22ce',
                pos: { x: 0.5, y: 1.8, z: 0.5 },
                active: false
            }
        ]

        this.crystalItems = []
        this.energyBeams = []

        this.setPedestalMaterial()
        this.createCrystals()
        this.setupInteractivity()
    }

    setPedestalMaterial() {
        const stoneColor = this.resources.items.stoneColorTexture
        const stoneARM = this.resources.items.stoneARMTexture
        const stoneNormal = this.resources.items.stoneNormalTexture

        this.pedestalMat = new THREE.MeshStandardMaterial({
            map: stoneColor,
            aoMap: stoneARM,
            roughnessMap: stoneARM,
            normalMap: stoneNormal,
            color: '#71717a',
            roughness: 0.8
        })
    }

    createCrystals() {
        const crystalGeo = new THREE.OctahedronGeometry(0.55, 0)
        crystalGeo.scale(1, 1.6, 1)

        const pedBaseGeo = new THREE.CylinderGeometry(0.5, 0.65, 0.8, 8)
        const pedShaftGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 8)

        this.elements.forEach((elem) => {
            const crystalGroup = new THREE.Group()
            crystalGroup.position.set(elem.pos.x, 0.9, elem.pos.z)

            // 1. Stone Pedestal
            const pedBase = new THREE.Mesh(pedBaseGeo, this.pedestalMat)
            pedBase.position.y = 0.4
            pedBase.castShadow = true
            pedBase.receiveShadow = true
            crystalGroup.add(pedBase)

            const pedShaft = new THREE.Mesh(pedShaftGeo, this.pedestalMat)
            pedShaft.position.y = 1.1
            pedShaft.castShadow = true
            crystalGroup.add(pedShaft)

            // 2. Glowing Crystal Mesh
            const crystalMat = new THREE.MeshStandardMaterial({
                color: elem.color,
                emissive: elem.emissive,
                emissiveIntensity: 0.8,
                roughness: 0.15,
                metalness: 0.1,
                transparent: true,
                opacity: 0.9
            })

            const mesh = new THREE.Mesh(crystalGeo, crystalMat)
            mesh.position.y = 2.1
            mesh.castShadow = true
            crystalGroup.add(mesh)

            // 3. Inner Light
            const light = new THREE.PointLight(elem.color, 1.8, 6.5)
            light.position.y = 2.1
            crystalGroup.add(light)

            // 4. Subtle Orbiting Ring
            const ringGeo = new THREE.TorusGeometry(0.85, 0.025, 8, 24)
            const ringMat = new THREE.MeshBasicMaterial({
                color: elem.color,
                transparent: true,
                opacity: 0.6
            })
            const ring = new THREE.Mesh(ringGeo, ringMat)
            ring.position.y = 2.1
            ring.rotation.x = Math.PI / 2
            crystalGroup.add(ring)

            this.group.add(crystalGroup)

            const crystalItem = {
                elem: elem,
                group: crystalGroup,
                mesh: mesh,
                light: light,
                ring: ring,
                material: crystalMat,
                baseY: 2.1,
                isHovered: false
            }

            this.crystalItems.push(crystalItem)

            // Register with raycaster
            this.raycaster.register(mesh, {
                id: elem.id,
                name: elem.name,
                desc: elem.desc,
                type: 'crystal'
            })
        })
    }

    setupInteractivity() {
        this.raycaster.on('hoverEnter', (obj) => {
            const item = this.crystalItems.find(c => c.mesh === obj)
            if (item) {
                item.isHovered = true
                gsap.to(item.mesh.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.3 })
                gsap.to(item.material, { emissiveIntensity: 2.2, duration: 0.3 })
                gsap.to(item.light, { intensity: 3.5, duration: 0.3 })
            }
        })

        this.raycaster.on('hoverLeave', (obj) => {
            const item = this.crystalItems.find(c => c.mesh === obj)
            if (item) {
                item.isHovered = false
                const targetScale = item.elem.active ? 1.15 : 1.0
                const targetEmissive = item.elem.active ? 1.6 : 0.8
                const targetLight = item.elem.active ? 2.8 : 1.8
                gsap.to(item.mesh.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 0.3 })
                gsap.to(item.material, { emissiveIntensity: targetEmissive, duration: 0.3 })
                gsap.to(item.light, { intensity: targetLight, duration: 0.3 })
            }
        })

        this.raycaster.on('click', (obj) => {
            const item = this.crystalItems.find(c => c.mesh === obj)
            if (item) {
                this.toggleCrystal(item)
            }
        })
    }

    toggleCrystal(item) {
        item.elem.active = !item.elem.active

        // Play chime sound
        this.audio.playCrystalChime(item.elem.id)

        // Visual click reaction
        gsap.timeline()
            .to(item.mesh.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.15 })
            .to(item.mesh.scale, { x: item.elem.active ? 1.15 : 1.0, y: item.elem.active ? 1.15 : 1.0, z: item.elem.active ? 1.15 : 1.0, duration: 0.25 })

        item.material.emissiveIntensity = item.elem.active ? 1.8 : 0.8
        item.light.intensity = item.elem.active ? 3.0 : 1.8

        // Update Energy Beam toward cauldron
        this.updateEnergyBeam(item)

        // Trigger global state update for cauldron & alchemy codex
        this.experience.events.trigger('alchemy.stateChange', [this.getActiveElements()])
    }

    updateEnergyBeam(item) {
        const cauldronPos = new THREE.Vector3(-0.5, 1.9, 3.2)
        const crystalWorldPos = new THREE.Vector3()
        item.mesh.getWorldPosition(crystalWorldPos)

        let beam = this.energyBeams.find(b => b.id === item.elem.id)

        if (item.elem.active) {
            if (!beam) {
                // Create glowing curved energy beam
                const midPoint = new THREE.Vector3()
                    .addVectors(crystalWorldPos, cauldronPos)
                    .multiplyScalar(0.5)
                midPoint.y += 1.6 // Arch upward in the air

                const curve = new THREE.QuadraticBezierCurve3(crystalWorldPos, midPoint, cauldronPos)
                const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.05, 8, false)
                const tubeMat = new THREE.MeshBasicMaterial({
                    color: item.elem.color,
                    transparent: true,
                    opacity: 0.85
                })

                const mesh = new THREE.Mesh(tubeGeo, tubeMat)
                this.scene.add(mesh)

                beam = { id: item.elem.id, mesh: mesh, material: tubeMat, curve: curve }
                this.energyBeams.push(beam)
            }
            beam.mesh.visible = true
        } else {
            if (beam) {
                beam.mesh.visible = false
            }
        }
    }

    getActiveElements() {
        return this.crystalItems.filter(c => c.elem.active).map(c => c.elem)
    }

    activateAll() {
        this.crystalItems.forEach(item => {
            if (!item.elem.active) this.toggleCrystal(item)
        })
    }

    deactivateAll() {
        this.crystalItems.forEach(item => {
            if (item.elem.active) this.toggleCrystal(item)
        })
    }

    update(elapsedTime) {
        this.crystalItems.forEach((item, index) => {
            // Floating harmonic oscillation
            item.mesh.position.y = item.baseY + Math.sin(elapsedTime * 2.2 + index * 1.5) * 0.12

            // Complex rotation
            item.mesh.rotation.y = elapsedTime * (0.6 + index * 0.2)
            item.mesh.rotation.x = Math.sin(elapsedTime + index) * 0.2

            // Counter-rotation of outer ring
            item.ring.rotation.z = -elapsedTime * 0.8
            item.ring.rotation.x = Math.PI / 2 + Math.sin(elapsedTime * 1.5) * 0.15
        })

        // Animate pulsating opacity of active energy beams
        this.energyBeams.forEach(b => {
            if (b.mesh.visible) {
                b.material.opacity = 0.6 + Math.sin(elapsedTime * 8) * 0.25
            }
        })
    }
}

