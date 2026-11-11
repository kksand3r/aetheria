import Experience from '../Experience.js'
import Environment from './Environment.js'
import Island from './Island.js'
import AlchemistTower from './AlchemistTower.js'
import Waterfall from './Waterfall.js'
import MagicCrystals from './MagicCrystals.js'
import AlchemyCauldron from './AlchemyCauldron.js'
import RuneSanctuary from './RuneSanctuary.js'
import FloatingClouds from './FloatingClouds.js'
import MagicalParticles from './MagicalParticles.js'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on('ready', () => {
            // Setup components in layered order
            this.environment = new Environment()
            this.island = new Island()
            this.alchemistTower = new AlchemistTower()
            this.waterfall = new Waterfall()
            this.magicCrystals = new MagicCrystals()
            this.alchemyCauldron = new AlchemyCauldron()
            this.runeSanctuary = new RuneSanctuary()
            this.floatingClouds = new FloatingClouds()
            this.magicalParticles = new MagicalParticles()

            // Emit ready event so UI and loader can transition smoothly
            this.experience.events.trigger('world.ready')
        })
    }

    update() {
        const elapsedTime = this.experience.time.elapsed
        const delta = this.experience.time.delta

        if (this.environment) this.environment.update(delta)
        if (this.island) this.island.update(elapsedTime)
        if (this.alchemistTower) this.alchemistTower.update(elapsedTime)
        if (this.waterfall) this.waterfall.update(elapsedTime)
        if (this.magicCrystals) this.magicCrystals.update(elapsedTime)
        if (this.alchemyCauldron) this.alchemyCauldron.update(elapsedTime)
        if (this.runeSanctuary) this.runeSanctuary.update(elapsedTime)
        if (this.floatingClouds) this.floatingClouds.update(elapsedTime, delta)
        if (this.magicalParticles) this.magicalParticles.update(elapsedTime)
    }
}

