import * as THREE from 'three'
import Experience from '../Experience.js'

export default class AlchemistTower {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.raycaster = this.experience.raycaster

        this.group = new THREE.Group()
        this.group.position.set(-4.2, 0.9, -3.8)
        this.scene.add(this.group)

        this.setMaterials()
        this.setBase()
        this.setRoof()
        this.setDoor()
        this.setWindows()
        this.setBalcony()
        this.setAstrolabe()
        this.setLantern()
    }

    setMaterials() {
        // Wall
        const wallColor = this.resources.items.wallColorTexture
        const wallARM = this.resources.items.wallARMTexture
        const wallNormal = this.resources.items.wallNormalTexture

        if (wallColor) {
            wallColor.wrapS = THREE.RepeatWrapping
            wallColor.wrapT = THREE.RepeatWrapping
            wallColor.repeat.set(3, 4)
            wallColor.colorSpace = THREE.SRGBColorSpace
        }
        if (wallARM) {
            wallARM.wrapS = THREE.RepeatWrapping
            wallARM.wrapT = THREE.RepeatWrapping
            wallARM.repeat.set(3, 4)
        }
        if (wallNormal) {
            wallNormal.wrapS = THREE.RepeatWrapping
            wallNormal.wrapT = THREE.RepeatWrapping
            wallNormal.repeat.set(3, 4)
        }

        this.wallMaterial = new THREE.MeshStandardMaterial({
            map: wallColor,
            aoMap: wallARM,
            roughnessMap: wallARM,
            metalnessMap: wallARM,
            normalMap: wallNormal,
            roughness: 0.8
        })

        // Roof
        const roofColor = this.resources.items.roofColorTexture
        const roofARM = this.resources.items.roofARMTexture
        const roofNormal = this.resources.items.roofNormalTexture

        if (roofColor) {
            roofColor.wrapS = THREE.RepeatWrapping
            roofColor.wrapT = THREE.RepeatWrapping
            roofColor.repeat.set(4, 2)
            roofColor.colorSpace = THREE.SRGBColorSpace
        }

        this.roofMaterial = new THREE.MeshStandardMaterial({
            map: roofColor,
            aoMap: roofARM,
            roughnessMap: roofARM,
            normalMap: roofNormal,
            color: '#34495e',
            roughness: 0.6
        })

        // Glowing Window Glass
        this.windowMaterial = new THREE.MeshStandardMaterial({
            color: '#f6ad55',
            emissive: '#ed8936',
            emissiveIntensity: 1.2,
            roughness: 0.2
        })

        // Brass / Gold Trim
        this.goldMaterial = new THREE.MeshStandardMaterial({
            color: '#ecc94b',
            metalness: 0.85,
            roughness: 0.25
        })

        // Wood
        this.woodMaterial = new THREE.MeshStandardMaterial({
            color: '#5c3a21',
            roughness: 0.7
        })
    }

    setBase() {
        // Main tower body
        const towerGeo = new THREE.CylinderGeometry(2.3, 2.7, 7.5, 20)
        this.tower = new THREE.Mesh(towerGeo, this.wallMaterial)
        this.tower.position.y = 3.75
        this.tower.castShadow = true
        this.tower.receiveShadow = true
        this.group.add(this.tower)

        // Lower stone plinth ring
        const plinthGeo = new THREE.CylinderGeometry(2.8, 3.1, 0.8, 20)
        const plinth = new THREE.Mesh(plinthGeo, this.wallMaterial)
        plinth.position.y = 0.4
        plinth.receiveShadow = true
        this.group.add(plinth)
    }

    setBalcony() {
        // Wooden observation balcony near the top
        const floorGeo = new THREE.CylinderGeometry(3.1, 3.1, 0.25, 20)
        const floor = new THREE.Mesh(floorGeo, this.woodMaterial)
        floor.position.y = 7.0
        floor.castShadow = true
        this.group.add(floor)

        // Wooden railing posts
        const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6)
        const postCount = 14
        for (let i = 0; i < postCount; i++) {
            const angle = (i / postCount) * Math.PI * 2
            const post = new THREE.Mesh(postGeo, this.woodMaterial)
            post.position.set(Math.cos(angle) * 2.95, 7.5, Math.sin(angle) * 2.95)
            this.group.add(post)
        }

        // Railing ring
        const railGeo = new THREE.TorusGeometry(2.95, 0.05, 8, 24)
        railGeo.rotateX(Math.PI / 2)
        const rail = new THREE.Mesh(railGeo, this.woodMaterial)
        rail.position.y = 7.95
        this.group.add(rail)
    }

    setRoof() {
        // Conical tower roof
        const roofGeo = new THREE.ConeGeometry(3.3, 4.2, 20)
        this.roof = new THREE.Mesh(roofGeo, this.roofMaterial)
        this.roof.position.y = 7.5 + 2.1
        this.roof.castShadow = true
        this.group.add(this.roof)

        // Spire spire needle & sphere
        const spirePoleGeo = new THREE.CylinderGeometry(0.06, 0.12, 1.6, 8)
        const spirePole = new THREE.Mesh(spirePoleGeo, this.goldMaterial)
        spirePole.position.y = 7.5 + 4.2 + 0.8
        this.group.add(spirePole)

        const spireBallGeo = new THREE.SphereGeometry(0.28, 16, 16)
        const spireBall = new THREE.Mesh(spireBallGeo, this.goldMaterial)
        spireBall.position.y = 7.5 + 4.2 + 1.6
        this.group.add(spireBall)
    }

    setDoor() {
        const doorColor = this.resources.items.doorColorTexture
        const doorAlpha = this.resources.items.doorAlphaTexture
        const doorAO = this.resources.items.doorAmbientOcclusionTexture
        const doorNormal = this.resources.items.doorNormalTexture
        const doorRoughness = this.resources.items.doorRoughnessTexture

        if (doorColor) doorColor.colorSpace = THREE.SRGBColorSpace

        const doorMaterial = new THREE.MeshStandardMaterial({
            map: doorColor,
            alphaMap: doorAlpha,
            transparent: true,
            aoMap: doorAO,
            normalMap: doorNormal,
            roughnessMap: doorRoughness,
            roughness: 0.6
        })

        // Door frame
        const frameGeo = new THREE.BoxGeometry(1.6, 2.5, 0.3)
        const frame = new THREE.Mesh(frameGeo, this.woodMaterial)
        frame.position.set(1.9, 1.35, 1.9)
        frame.rotation.y = Math.PI / 4
        this.group.add(frame)

        // Door panel
        const doorGeo = new THREE.PlaneGeometry(1.4, 2.3)
        this.doorMesh = new THREE.Mesh(doorGeo, doorMaterial)
        this.doorMesh.position.set(1.95, 1.35, 1.95)
        this.doorMesh.rotation.y = Math.PI / 4
        this.group.add(this.doorMesh)

        // Register door with raycaster
        this.raycaster.register(this.doorMesh, {
            name: 'Tower Entrance',
            desc: 'The heavy oak doors of the Arch-Mage Alchemist.'
        })
    }

    setWindows() {
        const winGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.9, 8, 1, false, 0, Math.PI)
        winGeo.rotateZ(Math.PI / 2)

        const windowAngles = [
            { angle: 0, y: 3.5 },
            { angle: Math.PI * 0.6, y: 5.2 },
            { angle: -Math.PI * 0.6, y: 4.2 }
        ]

        windowAngles.forEach((w) => {
            const win = new THREE.Mesh(winGeo, this.windowMaterial)
            win.position.set(Math.cos(w.angle) * 2.32, w.y, Math.sin(w.angle) * 2.32)
            win.rotation.y = -w.angle + Math.PI / 2
            this.group.add(win)
        })
    }

    setAstrolabe() {
        // Celestial sphere on top of the tower that rotates slowly
        this.astrolabeGroup = new THREE.Group()
        this.astrolabeGroup.position.set(0, 14.2, 0)
        this.group.add(this.astrolabeGroup)

        // Outer ring
        const ringGeo1 = new THREE.TorusGeometry(0.7, 0.04, 12, 32)
        this.ring1 = new THREE.Mesh(ringGeo1, this.goldMaterial)
        this.astrolabeGroup.add(this.ring1)

        // Middle ring
        const ringGeo2 = new THREE.TorusGeometry(0.5, 0.04, 12, 32)
        this.ring2 = new THREE.Mesh(ringGeo2, this.goldMaterial)
        this.ring2.rotation.x = Math.PI / 3
        this.astrolabeGroup.add(this.ring2)

        // Glowing core crystal
        const coreGeo = new THREE.OctahedronGeometry(0.25, 0)
        const coreMat = new THREE.MeshBasicMaterial({ color: '#6ee7b7' })
        this.astrolabeCore = new THREE.Mesh(coreGeo, coreMat)
        this.astrolabeGroup.add(this.astrolabeCore)

        // Point light for astrolabe
        this.coreLight = new THREE.PointLight('#6ee7b7', 1.5, 8)
        this.astrolabeGroup.add(this.coreLight)
    }

    setLantern() {
        // Brass lantern beside the door
        const lanternGeo = new THREE.BoxGeometry(0.3, 0.5, 0.3)
        const lanternMat = new THREE.MeshStandardMaterial({
            color: '#fef08a',
            emissive: '#eab308',
            emissiveIntensity: 1.5
        })
        const lantern = new THREE.Mesh(lanternGeo, lanternMat)
        lantern.position.set(2.8, 2.4, 1.4)
        this.group.add(lantern)

        this.lanternLight = new THREE.PointLight('#ff9900', 3, 7)
        this.lanternLight.position.set(2.8, 2.4, 1.4)
        this.group.add(this.lanternLight)
    }

    update(elapsedTime) {
        // Rotate celestial astrolabe rings
        if (this.ring1) this.ring1.rotation.y = elapsedTime * 0.4
        if (this.ring2) this.ring2.rotation.x = elapsedTime * -0.6
        if (this.astrolabeCore) {
            this.astrolabeCore.rotation.y = elapsedTime * 1.2
            this.astrolabeCore.rotation.z = elapsedTime * 0.8
        }

        // Window & lantern subtle flicker
        const flicker = Math.sin(elapsedTime * 6) * 0.15 + Math.cos(elapsedTime * 9) * 0.1
        if (this.lanternLight) {
            this.lanternLight.intensity = 2.8 + flicker
        }
        if (this.windowMaterial) {
            this.windowMaterial.emissiveIntensity = 1.2 + flicker * 0.3
        }
    }
}

