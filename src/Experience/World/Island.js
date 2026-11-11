import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Island {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.group = new THREE.Group()
        this.scene.add(this.group)

        this.setMaterials()
        this.setRockBase()
        this.setGrassyTop()
        this.setFloatingSatellites()
        this.setStoneRuins()
    }

    setMaterials() {
        // Rock Material (Bottom stalactite cliffs)
        const rockColor = this.resources.items.floorColorTexture
        const rockARM = this.resources.items.floorARMTexture
        const rockNormal = this.resources.items.floorNormalTexture
        const rockDisp = this.resources.items.floorDisplacementTexture

        if (rockColor) {
            rockColor.wrapS = THREE.RepeatWrapping
            rockColor.wrapT = THREE.RepeatWrapping
            rockColor.repeat.set(4, 4)
            rockColor.colorSpace = THREE.SRGBColorSpace
        }
        if (rockARM) {
            rockARM.wrapS = THREE.RepeatWrapping
            rockARM.wrapT = THREE.RepeatWrapping
            rockARM.repeat.set(4, 4)
        }
        if (rockNormal) {
            rockNormal.wrapS = THREE.RepeatWrapping
            rockNormal.wrapT = THREE.RepeatWrapping
            rockNormal.repeat.set(4, 4)
        }
        if (rockDisp) {
            rockDisp.wrapS = THREE.RepeatWrapping
            rockDisp.wrapT = THREE.RepeatWrapping
            rockDisp.repeat.set(4, 4)
        }

        this.rockMaterial = new THREE.MeshStandardMaterial({
            map: rockColor,
            aoMap: rockARM,
            roughnessMap: rockARM,
            metalnessMap: rockARM,
            normalMap: rockNormal,
            displacementMap: rockDisp,
            displacementScale: 0.15,
            displacementBias: -0.05,
            roughness: 0.9,
            metalness: 0.1,
            color: '#656158',
            flatShading: true
        })

        // Grass Material (Top surface)
        const grassColor = this.resources.items.bushColorTexture
        const grassARM = this.resources.items.bushARMTexture
        const grassNormal = this.resources.items.bushNormalTexture

        if (grassColor) {
            grassColor.wrapS = THREE.RepeatWrapping
            grassColor.wrapT = THREE.RepeatWrapping
            grassColor.repeat.set(6, 6)
            grassColor.colorSpace = THREE.SRGBColorSpace
        }

        this.grassMaterial = new THREE.MeshStandardMaterial({
            map: grassColor,
            aoMap: grassARM,
            roughnessMap: grassARM,
            normalMap: grassNormal,
            color: '#3d8242',
            roughness: 0.8
        })

        // Ancient Stone Material
        const stoneColor = this.resources.items.stoneColorTexture
        const stoneARM = this.resources.items.stoneARMTexture
        const stoneNormal = this.resources.items.stoneNormalTexture

        if (stoneColor) {
            stoneColor.wrapS = THREE.RepeatWrapping
            stoneColor.wrapT = THREE.RepeatWrapping
            stoneColor.repeat.set(2, 2)
            stoneColor.colorSpace = THREE.SRGBColorSpace
        }

        this.stoneMaterial = new THREE.MeshStandardMaterial({
            map: stoneColor,
            aoMap: stoneARM,
            roughnessMap: stoneARM,
            normalMap: stoneNormal,
            roughness: 0.85,
            color: '#8c959f'
        })
    }

    setRockBase() {
        // Inverted Cone / Stalactite formation
        const geometry = new THREE.CylinderGeometry(11, 0.4, 14, 28, 12)
        
        // Displace vertices to create organic, jagged floating rock cliff ridges
        const pos = geometry.attributes.position
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i)
            // Depth factor: wider variance in the middle and bottom
            const depthFactor = (1 - (y + 7) / 14)

            const noiseX = (Math.sin(pos.getX(i) * 0.9 + y) + Math.cos(pos.getZ(i) * 1.2)) * 0.7 * depthFactor
            const noiseZ = (Math.cos(pos.getX(i) * 1.1) + Math.sin(pos.getZ(i) * 0.8 + y)) * 0.7 * depthFactor

            pos.setX(i, pos.getX(i) + noiseX)
            pos.setZ(i, pos.getZ(i) + noiseZ)
        }
        geometry.computeVertexNormals()

        this.rockBase = new THREE.Mesh(geometry, this.rockMaterial)
        this.rockBase.position.y = -7
        this.rockBase.castShadow = true
        this.rockBase.receiveShadow = true
        this.group.add(this.rockBase)
    }

    setGrassyTop() {
        // Lush circular island terrain plate
        const geometry = new THREE.CylinderGeometry(11.2, 10.6, 0.9, 36)
        
        // Add subtle undulating terrain variation
        const pos = geometry.attributes.position
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i)
            if (y > 0) { // Top vertices
                const x = pos.getX(i)
                const z = pos.getZ(i)
                const dist = Math.sqrt(x * x + z * z)
                // Slight elevation towards the tower back hill
                const hill = Math.sin(x * 0.25) * 0.4 + Math.cos(z * 0.3) * 0.3
                // Rim dips slightly
                const rimDrop = dist > 9.5 ? -0.3 : 0
                pos.setY(i, y + hill + rimDrop)
            }
        }
        geometry.computeVertexNormals()

        this.grassTop = new THREE.Mesh(geometry, this.grassMaterial)
        this.grassTop.position.y = 0.45
        this.grassTop.receiveShadow = true
        this.grassTop.castShadow = true
        this.group.add(this.grassTop)

        // Path stones leading through the island
        this.createStonePath()
    }

    createStonePath() {
        const steppingStonesCount = 18
        const stoneGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.12, 7)

        for (let i = 0; i < steppingStonesCount; i++) {
            const t = i / (steppingStonesCount - 1)
            // Gentle curved path from waterfall edge (x: 7, z: 2) to tower (x: -4, z: -3)
            const x = THREE.MathUtils.lerp(7, -3.5, t) + Math.sin(t * Math.PI) * 1.5
            const z = THREE.MathUtils.lerp(2, -3.5, t) + Math.cos(t * Math.PI * 2) * 0.8
            
            const stone = new THREE.Mesh(stoneGeo, this.stoneMaterial)
            stone.position.set(x, 0.92, z)
            stone.rotation.y = Math.random() * Math.PI
            stone.scale.set(
                0.8 + Math.random() * 0.4,
                1.0,
                0.7 + Math.random() * 0.4
            )
            stone.receiveShadow = true
            this.group.add(stone)
        }
    }

    setFloatingSatellites() {
        this.satellites = []
        const coords = [
            { x: 14.5, y: -2, z: 8, scale: 1.8, speed: 0.4, offset: 0 },
            { x: -13.5, y: 1.5, z: 9, scale: 1.3, speed: 0.6, offset: 1.5 },
            { x: -12, y: -4, z: -11, scale: 2.1, speed: 0.3, offset: 3.0 },
            { x: 9, y: 2.8, z: -13, scale: 1.1, speed: 0.5, offset: 4.5 }
        ]

        coords.forEach((cfg) => {
            const satGroup = new THREE.Group()

            // Inverted jagged rock
            const rockGeo = new THREE.ConeGeometry(cfg.scale, cfg.scale * 1.8, 6)
            rockGeo.rotateX(Math.PI)
            const rock = new THREE.Mesh(rockGeo, this.rockMaterial)
            rock.castShadow = true
            satGroup.add(rock)

            // Top grass tuft
            const grassGeo = new THREE.CylinderGeometry(cfg.scale * 0.9, cfg.scale * 0.85, 0.25, 6)
            const grass = new THREE.Mesh(grassGeo, this.grassMaterial)
            grass.position.y = (cfg.scale * 1.8) / 2
            satGroup.add(grass)

            // Small glowing crystal spire on satellite
            const miniCrystalGeo = new THREE.OctahedronGeometry(0.35 * cfg.scale, 0)
            const miniMat = new THREE.MeshStandardMaterial({
                color: '#a78bfa',
                emissive: '#7c3aed',
                emissiveIntensity: 0.8,
                roughness: 0.2
            })
            const miniCrystal = new THREE.Mesh(miniCrystalGeo, miniMat)
            miniCrystal.position.y = grass.position.y + 0.45 * cfg.scale
            satGroup.add(miniCrystal)

            satGroup.position.set(cfg.x, cfg.y, cfg.z)
            this.group.add(satGroup)

            this.satellites.push({
                group: satGroup,
                baseY: cfg.y,
                speed: cfg.speed,
                offset: cfg.offset
            })
        })
    }

    setStoneRuins() {
        // Ancient broken archway / pillars near the entrance
        const pillarGeo = new THREE.CylinderGeometry(0.4, 0.45, 3.2, 8)
        
        const pillar1 = new THREE.Mesh(pillarGeo, this.stoneMaterial)
        pillar1.position.set(5.5, 2.5, 4.5)
        pillar1.castShadow = true
        pillar1.receiveShadow = true
        this.group.add(pillar1)

        const pillar2 = new THREE.Mesh(pillarGeo, this.stoneMaterial)
        pillar2.position.set(3.2, 2.5, 6.2)
        pillar2.castShadow = true
        pillar2.receiveShadow = true
        this.group.add(pillar2)

        // Broken lintel on top
        const lintelGeo = new THREE.BoxGeometry(3.2, 0.45, 0.6)
        const lintel = new THREE.Mesh(lintelGeo, this.stoneMaterial)
        lintel.position.set(4.3, 4.2, 5.3)
        lintel.rotation.y = -Math.PI / 4
        lintel.rotation.z = -0.1
        lintel.castShadow = true
        this.group.add(lintel)
    }

    update(elapsedTime) {
        // Gentle hovering floating oscillation of the entire main island
        this.group.position.y = Math.sin(elapsedTime * 0.7) * 0.18

        // Orbiting & bobbing satellite islands
        this.satellites.forEach((sat) => {
            sat.group.position.y = sat.baseY + Math.sin(elapsedTime * sat.speed + sat.offset) * 0.4
            sat.group.rotation.y += 0.003
        })
    }
}

