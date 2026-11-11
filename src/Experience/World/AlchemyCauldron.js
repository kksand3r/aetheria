import * as THREE from 'three'
import gsap from 'gsap'
import Experience from '../Experience.js'

export default class AlchemyCauldron {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.raycaster = this.experience.raycaster
        this.audio = this.experience.audio
        this.events = this.experience.events

        this.group = new THREE.Group()
        this.group.position.set(-0.5, 0.9, 3.2)
        this.scene.add(this.group)

        this.activeElements = []
        this.potionColor = new THREE.Color('#3b82f6')
        this.targetPotionColor = new THREE.Color('#3b82f6')

        this.setMaterials()
        this.setFirePit()
        this.setCauldronBody()
        this.setLiquid()
        this.setBubbleParticles()
        this.setupAlchemyListener()
    }

    setMaterials() {
        // Wrought iron pot
        this.ironMaterial = new THREE.MeshStandardMaterial({
            color: '#1f2937',
            metalness: 0.85,
            roughness: 0.35
        })

        // Glowing coals/fire below
        this.emberMaterial = new THREE.MeshStandardMaterial({
            color: '#f97316',
            emissive: '#ea580c',
            emissiveIntensity: 2.0,
            roughness: 0.7
        })

        // Liquid material inside
        this.liquidMaterial = new THREE.MeshStandardMaterial({
            color: this.potionColor,
            emissive: this.potionColor,
            emissiveIntensity: 0.6,
            roughness: 0.1,
            metalness: 0.2,
            transparent: true,
            opacity: 0.92
        })
    }

    setFirePit() {
        // Circle of fire stones
        const stoneGeo = new THREE.DodecahedronGeometry(0.2, 0)
        const stoneMat = new THREE.MeshStandardMaterial({ color: '#4b5563', roughness: 0.9 })

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2
            const stone = new THREE.Mesh(stoneGeo, stoneMat)
            stone.position.set(Math.cos(angle) * 0.95, 0.1, Math.sin(angle) * 0.95)
            stone.scale.set(1.2, 0.8, 1.2)
            stone.castShadow = true
            this.group.add(stone)
        }

        // Glowing embers beneath cauldron
        const emberGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.15, 12)
        const embers = new THREE.Mesh(emberGeo, this.emberMaterial)
        embers.position.y = 0.08
        this.group.add(embers)

        // Ember point light
        this.emberLight = new THREE.PointLight('#ff5722', 1.8, 4)
        this.emberLight.position.set(0, 0.2, 0)
        this.group.add(this.emberLight)
    }

    setCauldronBody() {
        // Main sphere belly
        const bellyGeo = new THREE.SphereGeometry(1.0, 24, 24)
        const belly = new THREE.Mesh(bellyGeo, this.ironMaterial)
        belly.position.y = 1.0
        belly.scale.set(1.1, 0.9, 1.1)
        belly.castShadow = true
        belly.receiveShadow = true
        this.group.add(belly)

        // Rim
        const rimGeo = new THREE.TorusGeometry(0.95, 0.12, 12, 28)
        rimGeo.rotateX(Math.PI / 2)
        const rim = new THREE.Mesh(rimGeo, this.ironMaterial)
        rim.position.y = 1.6
        rim.castShadow = true
        this.group.add(rim)

        // Cauldron legs (tripod)
        const legGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.7, 8)
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2
            const leg = new THREE.Mesh(legGeo, this.ironMaterial)
            leg.position.set(Math.cos(angle) * 0.75, 0.35, Math.sin(angle) * 0.75)
            leg.rotation.z = Math.cos(angle) * 0.25
            leg.rotation.x = -Math.sin(angle) * 0.25
            leg.castShadow = true
            this.group.add(leg)
        }
    }

    setLiquid() {
        // Flat circular liquid surface
        const liquidGeo = new THREE.CircleGeometry(0.88, 32)
        liquidGeo.rotateX(-Math.PI / 2)

        this.liquidMesh = new THREE.Mesh(liquidGeo, this.liquidMaterial)
        this.liquidMesh.position.y = 1.48
        this.group.add(this.liquidMesh)

        // Light emitting from the potion
        this.potionLight = new THREE.PointLight(this.potionColor, 2.2, 5.5)
        this.potionLight.position.set(0, 1.7, 0)
        this.group.add(this.potionLight)

        // Register with raycaster
        this.raycaster.register(this.liquidMesh, {
            name: 'Alchemist Cauldron',
            desc: 'The Great Crucible. Click to stir the mixture and trigger alchemical reactions!'
        })

        this.raycaster.on('click', (obj) => {
            if (obj === this.liquidMesh) {
                this.stirCauldron()
            }
        })
    }

    setBubbleParticles() {
        const bubbleCount = 45
        const bubbleGeo = new THREE.BufferGeometry()
        const positions = new Float32Array(bubbleCount * 3)
        const scales = new Float32Array(bubbleCount)
        this.bubbleData = []

        for (let i = 0; i < bubbleCount; i++) {
            const r = Math.random() * 0.65
            const angle = Math.random() * Math.PI * 2

            positions[i * 3] = Math.cos(angle) * r
            positions[i * 3 + 1] = 1.48 + Math.random() * 1.5
            positions[i * 3 + 2] = Math.sin(angle) * r

            scales[i] = Math.random() * 0.15 + 0.05

            this.bubbleData.push({
                radius: r,
                angle: angle,
                speed: 0.015 + Math.random() * 0.025,
                wobble: Math.random() * Math.PI * 2
            })
        }

        bubbleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        bubbleGeo.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

        this.bubbleMaterial = new THREE.PointsMaterial({
            color: this.potionColor,
            size: 0.18,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        this.bubbles = new THREE.Points(bubbleGeo, this.bubbleMaterial)
        this.group.add(this.bubbles)
    }

    setupAlchemyListener() {
        this.events.on('alchemy.stateChange', (activeElems) => {
            this.activeElements = activeElems
            this.calculatePotionReaction()
        })
    }

    calculatePotionReaction() {
        const count = this.activeElements.length
        const ids = this.activeElements.map(e => e.id)

        if (count === 0) {
            this.targetPotionColor.set('#3b82f6') // Default calming blue
        } else if (count === 4) {
            // Philosopher's stone - rainbow prismatic
            this.targetPotionColor.set('#fbbf24') // Golden radiance
            this.audio.playReactionBurst()
        } else if (count === 1) {
            this.targetPotionColor.set(this.activeElements[0].color)
        } else if (count === 2) {
            if (ids.includes('fire') && ids.includes('water')) {
                this.targetPotionColor.set('#ec4899') // Vapor magenta
            } else if (ids.includes('fire') && ids.includes('earth')) {
                this.targetPotionColor.set('#f97316') // Magma orange
            } else if (ids.includes('water') && ids.includes('earth')) {
                this.targetPotionColor.set('#14b8a6') // Turquoise nature spring
            } else if (ids.includes('arcane')) {
                this.targetPotionColor.set('#c084fc') // Ethereal lavender
            }
            this.audio.playReactionBurst()
        } else {
            // 3 elements
            this.targetPotionColor.set('#e879f9') // Celestial violet
            this.audio.playReactionBurst()
        }

        // Animate color transition
        gsap.to(this.potionColor, {
            r: this.targetPotionColor.r,
            g: this.targetPotionColor.g,
            b: this.targetPotionColor.b,
            duration: 0.8,
            onUpdate: () => {
                this.liquidMaterial.color.copy(this.potionColor)
                this.liquidMaterial.emissive.copy(this.potionColor)
                this.potionLight.color.copy(this.potionColor)
                this.bubbleMaterial.color.copy(this.potionColor)
            }
        })
    }

    stirCauldron() {
        this.audio.playCauldronBubble()

        // Ripple swell animation
        gsap.timeline()
            .to(this.liquidMesh.scale, { x: 1.08, z: 1.08, duration: 0.2, ease: 'power1.out' })
            .to(this.liquidMesh.scale, { x: 1.0, z: 1.0, duration: 0.3, ease: 'bounce.out' })

        gsap.timeline()
            .to(this.potionLight, { intensity: 4.5, duration: 0.2 })
            .to(this.potionLight, { intensity: 2.2, duration: 0.5 })
    }

    update(elapsedTime) {
        // Liquid surface undulating ripple
        const liquidWave = Math.sin(elapsedTime * 3) * 0.02
        this.liquidMesh.position.y = 1.48 + liquidWave

        // Fire pit flicker
        const emberFlicker = Math.sin(elapsedTime * 12) * 0.2 + Math.cos(elapsedTime * 8) * 0.15
        this.emberLight.intensity = 1.8 + emberFlicker

        // Bubble particles rising and looping
        if (this.bubbles) {
            const pos = this.bubbles.geometry.attributes.position
            for (let i = 0; i < this.bubbleData.length; i++) {
                let y = pos.getY(i) + this.bubbleData[i].speed
                this.bubbleData[i].wobble += 0.05

                if (y > 2.8) {
                    y = 1.48
                }

                const r = this.bubbleData[i].radius
                const angle = this.bubbleData[i].angle + Math.sin(this.bubbleData[i].wobble) * 0.1

                pos.setX(i, Math.cos(angle) * r)
                pos.setY(i, y)
                pos.setZ(i, Math.sin(angle) * r)
            }
            pos.needsUpdate = true
        }

        // Chromatic hue cycling if all 4 elements active (Philosopher's Stone mode)
        if (this.activeElements.length === 4) {
            const hue = (elapsedTime * 0.3) % 1
            this.potionColor.setHSL(hue, 0.9, 0.6)
            this.liquidMaterial.color.copy(this.potionColor)
            this.liquidMaterial.emissive.copy(this.potionColor)
            this.potionLight.color.copy(this.potionColor)
            this.bubbleMaterial.color.copy(this.potionColor)
        }
    }
}

