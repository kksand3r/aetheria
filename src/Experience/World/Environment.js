import * as THREE from 'three'
import { Sky } from 'three/addons/objects/Sky.js'
import Experience from '../Experience.js'

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug

        // Day/night state
        // 0 to 24 hours: 6 = sunrise, 12 = noon, 18 = sunset, 24/0 = midnight
        this.timeOfDay = 14.5
        this.autoCycle = true
        this.cycleSpeed = 0.15 // 1 hour every ~6.6 seconds in auto mode

        this.setSun()
        this.setSky()
        this.setLights()
        this.setFog()
        this.setStars()
        this.setDebug()

        this.updateTimeOfDay(this.timeOfDay)
    }

    setSun() {
        this.sun = new THREE.Vector3()
    }

    setSky() {
        this.sky = new Sky()
        this.sky.scale.setScalar(400)
        this.scene.add(this.sky)

        this.skyUniforms = this.sky.material.uniforms
        this.skyUniforms['turbidity'].value = 8
        this.skyUniforms['rayleigh'].value = 2.5
        this.skyUniforms['mieCoefficient'].value = 0.005
        this.skyUniforms['mieDirectionalG'].value = 0.8
    }

    setLights() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight('#a6c8e0', 0.6)
        this.scene.add(this.ambientLight)

        // Directional light (Sun / Moon)
        this.directionalLight = new THREE.DirectionalLight('#fff0d0', 1.8)
        this.directionalLight.castShadow = true

        // Shadow configuration for optimal performance and crisp shadows
        this.directionalLight.shadow.mapSize.width = 1024
        this.directionalLight.shadow.mapSize.height = 1024
        this.directionalLight.shadow.camera.near = 1
        this.directionalLight.shadow.camera.far = 80
        this.directionalLight.shadow.camera.top = 18
        this.directionalLight.shadow.camera.right = 18
        this.directionalLight.shadow.camera.bottom = -18
        this.directionalLight.shadow.camera.left = -18
        this.directionalLight.shadow.bias = -0.0005
        this.directionalLight.shadow.normalBias = 0.03

        this.scene.add(this.directionalLight)

        // Subtle mystical hemisphere bounce
        this.hemiLight = new THREE.HemisphereLight('#88c0d0', '#2e3440', 0.4)
        this.scene.add(this.hemiLight)
    }

    setFog() {
        this.fogColor = new THREE.Color('#4a6884')
        this.fog = new THREE.FogExp2(this.fogColor, 0.012)
        this.scene.fog = this.fog
    }

    setStars() {
        const starCount = 1800
        const starGeometry = new THREE.BufferGeometry()
        const positions = new Float32Array(starCount * 3)
        const sizes = new Float32Array(starCount)

        for (let i = 0; i < starCount; i++) {
            // Distribute on sphere surface
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(Math.random() * 2 - 1)
            const r = 180 + Math.random() * 20

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) // Above horizon
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)

            sizes[i] = Math.random() * 2.5 + 0.5
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

        this.starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.2,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })

        this.starPoints = new THREE.Points(starGeometry, this.starMaterial)
        this.scene.add(this.starPoints)
    }

    updateTimeOfDay(time) {
        this.timeOfDay = (time + 24) % 24

        // Calculate sun phi & theta
        // phi: 0 is zenith, PI/2 is horizon, PI is nadir
        // Sun elevation: 0 at 6h, 1 at 12h, 0 at 18h, negative at night
        const sunProgress = (this.timeOfDay - 6) / 24
        const angle = sunProgress * Math.PI * 2

        const elevation = Math.sin(angle)
        const azimuth = Math.cos(angle)

        const phi = THREE.MathUtils.degToRad(90 - elevation * 75)
        const theta = THREE.MathUtils.degToRad(azimuth * 140)

        this.sun.setFromSphericalCoords(1, phi, theta)
        this.skyUniforms['sunPosition'].value.copy(this.sun)

        // Directional light position follows sun / moon
        const lightDist = 35
        if (elevation > -0.05) {
            // Daytime: warm sunlight
            this.directionalLight.position.set(this.sun.x * lightDist, Math.max(this.sun.y * lightDist, 2), this.sun.z * lightDist)
            
            const dayFactor = Math.max(0, elevation)
            this.directionalLight.intensity = THREE.MathUtils.lerp(0.3, 2.0, dayFactor)
            this.directionalLight.color.setHSL(0.12 - (1 - dayFactor) * 0.08, 0.8, 0.65)
            
            this.ambientLight.intensity = THREE.MathUtils.lerp(0.2, 0.65, dayFactor)
            this.ambientLight.color.setHSL(0.58, 0.4, THREE.MathUtils.lerp(0.2, 0.7, dayFactor))

            // Horizon fog color
            this.fogColor.setHSL(0.58, 0.35, THREE.MathUtils.lerp(0.1, 0.55, dayFactor))
            this.fog.color.copy(this.fogColor)

            // Fade stars out
            this.starMaterial.opacity = 0.0
        } else {
            // Nighttime: cool mystical moonlight
            this.directionalLight.position.set(-this.sun.x * lightDist, Math.max(-this.sun.y * lightDist, 6), -this.sun.z * lightDist)
            this.directionalLight.intensity = 0.45
            this.directionalLight.color.set('#6495ed') // Soft cornflower moonlight

            this.ambientLight.intensity = 0.28
            this.ambientLight.color.set('#271e4a') // Deep magical purple-blue

            this.fogColor.set('#0b0e1d')
            this.fog.color.copy(this.fogColor)

            // Night sky stars become brilliant
            const nightFactor = Math.min(1, Math.abs(elevation) * 2.5)
            this.starMaterial.opacity = nightFactor * 0.95
        }
    }

    update(delta) {
        if (this.autoCycle) {
            this.timeOfDay = (this.timeOfDay + delta * 0.001 * this.cycleSpeed) % 24
            this.updateTimeOfDay(this.timeOfDay)
        }

        if (this.starPoints) {
            this.starPoints.rotation.y += delta * 0.00003
        }
    }

    setDebug() {
        if (this.debug.active) {
            const folder = this.debug.ui.addFolder('🌅 Environment & Day/Night')
            
            folder.add(this, 'timeOfDay', 0, 24, 0.1)
                .name('Time of Day (h)')
                .listen()
                .onChange((v) => {
                    this.updateTimeOfDay(v)
                })

            folder.add(this, 'autoCycle').name('Auto Time Cycle')
            folder.add(this, 'cycleSpeed', 0.01, 1, 0.01).name('Cycle Speed')

            folder.add(this.ambientLight, 'intensity', 0, 2, 0.01).name('Ambient Intensity')
            folder.add(this.directionalLight, 'intensity', 0, 4, 0.01).name('Sun/Moon Intensity')
            folder.add(this.fog, 'density', 0, 0.05, 0.001).name('Fog Density')
        }
    }
}

