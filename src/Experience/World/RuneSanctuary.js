import * as THREE from 'three'
import Experience from '../Experience.js'

export default class RuneSanctuary {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.events = this.experience.events

        this.group = new THREE.Group()
        this.group.position.set(-0.5, 0.92, 3.2)
        this.scene.add(this.group)

        this.activeCount = 0

        this.createRuneTexture()
        this.setRings()
        this.setupEvents()
    }

    createRuneTexture() {
        // Procedural canvas generating an ancient glowing alchemical rune circle
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 1024
        const ctx = canvas.getContext('2d')
        const center = 512

        // Clear transparent background
        ctx.clearRect(0, 0, 1024, 1024)

        ctx.strokeStyle = '#ffffff'
        ctx.fillStyle = '#ffffff'
        ctx.lineWidth = 6
        ctx.shadowColor = '#ffffff'
        ctx.shadowBlur = 14

        // 1. Concentric circles
        ctx.beginPath()
        ctx.arc(center, center, 480, 0, Math.PI * 2)
        ctx.stroke()

        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(center, center, 440, 0, Math.PI * 2)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(center, center, 320, 0, Math.PI * 2)
        ctx.stroke()

        // 2. Interlocking sacred geometry (octagram / triangles)
        const vertices = 8
        ctx.beginPath()
        for (let i = 0; i < vertices * 2; i++) {
            const angle = (i * Math.PI) / vertices
            const r = i % 2 === 0 ? 440 : 320
            const x = center + Math.cos(angle) * r
            const y = center + Math.sin(angle) * r
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()

        // 3. Mystic Rune Glyphs along the ring
        const runeSymbols = ['🜁', '🜂', '🜃', '🜄', '🜍', '🜔', '🝁', '🝪', '🜛', '🜚', '🜞', '🝥']
        ctx.font = '36px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        runeSymbols.forEach((sym, idx) => {
            const angle = (idx / runeSymbols.length) * Math.PI * 2
            const r = 460
            ctx.save()
            ctx.translate(center + Math.cos(angle) * r, center + Math.sin(angle) * r)
            ctx.rotate(angle + Math.PI / 2)
            ctx.fillText(sym, 0, 0)
            ctx.restore()
        })

        this.runeTexture = new THREE.CanvasTexture(canvas)
    }

    setRings() {
        const ringGeo = new THREE.PlaneGeometry(9, 9)
        ringGeo.rotateX(-Math.PI / 2)

        this.runeMaterial = new THREE.MeshBasicMaterial({
            map: this.runeTexture,
            transparent: true,
            opacity: 0.5,
            color: '#60a5fa',
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        this.runeMesh = new THREE.Mesh(ringGeo, this.runeMaterial)
        this.group.add(this.runeMesh)

        // Inner counter-rotating sub-ring
        const innerGeo = new THREE.PlaneGeometry(5.2, 5.2)
        innerGeo.rotateX(-Math.PI / 2)

        this.innerMaterial = new THREE.MeshBasicMaterial({
            map: this.runeTexture,
            transparent: true,
            opacity: 0.4,
            color: '#a78bfa',
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        this.innerMesh = new THREE.Mesh(innerGeo, this.innerMaterial)
        this.innerMesh.position.y = 0.01
        this.group.add(this.innerMesh)
    }

    setupEvents() {
        this.events.on('alchemy.stateChange', (activeElems) => {
            this.activeCount = activeElems.length

            const colors = ['#60a5fa', '#f97316', '#ec4899', '#a855f7', '#fbbf24']
            const targetColor = colors[this.activeCount] || '#60a5fa'

            this.runeMaterial.color.set(targetColor)
            this.runeMaterial.opacity = 0.4 + this.activeCount * 0.15

            this.innerMaterial.color.set(targetColor)
            this.innerMaterial.opacity = 0.3 + this.activeCount * 0.15
        })
    }

    update(elapsedTime) {
        // Slowly spin rune circles in opposite directions
        if (this.runeMesh) {
            this.runeMesh.rotation.y = elapsedTime * (0.05 + this.activeCount * 0.03)
        }
        if (this.innerMesh) {
            this.innerMesh.rotation.y = -elapsedTime * (0.08 + this.activeCount * 0.04)
        }

        // Pulse opacity
        const pulse = Math.sin(elapsedTime * 2.5) * 0.08
        this.runeMaterial.opacity = Math.max(0.2, (0.4 + this.activeCount * 0.15) + pulse)
    }
}

