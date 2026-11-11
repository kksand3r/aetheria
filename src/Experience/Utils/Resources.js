import * as THREE from 'three'
import EventEmitter from './EventEmitter.js'

export default class Resources extends EventEmitter {
    constructor(sources) {
        super()

        this.sources = sources
        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.setLoaders()
        this.startLoading()
    }

    setLoaders() {
        this.loaders = {}
        this.loaders.textureLoader = new THREE.TextureLoader()
    }

    startLoading() {
        if (this.toLoad === 0) {
            this.trigger('ready')
            return
        }

        // Load each source
        for (const source of this.sources) {
            if (source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    },
                    undefined,
                    () => {
                        console.warn(`Failed loading texture from ${source.path}, generating fallback`)
                        const canvas = document.createElement('canvas')
                        canvas.width = 128
                        canvas.height = 128
                        const ctx = canvas.getContext('2d')
                        ctx.fillStyle = '#6b7280'
                        ctx.fillRect(0, 0, 128, 128)
                        const fallbackTexture = new THREE.CanvasTexture(canvas)
                        this.sourceLoaded(source, fallbackTexture)
                    }
                )
            }
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file
        this.loaded++

        this.trigger('progress', [this.loaded / this.toLoad])

        if (this.loaded === this.toLoad) {
            this.trigger('ready')
        }
    }
}

