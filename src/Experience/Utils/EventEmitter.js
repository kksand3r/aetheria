/**
 * Custom Event Emitter for decoupled component communication
 * Supports namespaced events (e.g. 'time.tick', 'crystal.click')
 */
export default class EventEmitter {
    constructor() {
        this.callbacks = {}
        this.callbacks.base = {}
    }

    on(_names, callback) {
        // Errors
        if (typeof _names === 'undefined' || _names === '') {
            console.warn('Wrong event name')
            return false
        }

        if (typeof callback === 'undefined') {
            console.warn('Wrong callback')
            return false
        }

        // Resolve names
        const names = this.resolveNames(_names)

        // Each name
        names.forEach((_name) => {
            // Resolve name
            const name = this.resolveName(_name)

            // Create namespace if not exist
            if (!(this.callbacks[name.namespace] instanceof Object)) {
                this.callbacks[name.namespace] = {}
            }

            // Create callback array if not exist
            if (!(this.callbacks[name.namespace][name.value] instanceof Array)) {
                this.callbacks[name.namespace][name.value] = []
            }

            // See if callback already exists
            if (!this.callbacks[name.namespace][name.value].includes(callback)) {
                this.callbacks[name.namespace][name.value].push(callback)
            }
        })

        return this
    }

    off(_names) {
        if (typeof _names === 'undefined' || _names === '') {
            console.warn('Wrong event name')
            return false
        }

        const names = this.resolveNames(_names)

        names.forEach((_name) => {
            const name = this.resolveName(_name)

            // Remove namespace
            if (name.namespace !== 'base' && name.value === '') {
                delete this.callbacks[name.namespace]
            } else {
                // Remove specific callback
                if (name.namespace === 'base') {
                    for (const namespace in this.callbacks) {
                        if (
                            this.callbacks[namespace] instanceof Object &&
                            this.callbacks[namespace][name.value] instanceof Array
                        ) {
                            delete this.callbacks[namespace][name.value]

                            if (Object.keys(this.callbacks[namespace]).length === 0) {
                                delete this.callbacks[namespace]
                            }
                        }
                    }
                } else if (
                    this.callbacks[name.namespace] instanceof Object &&
                    this.callbacks[name.namespace][name.value] instanceof Array
                ) {
                    delete this.callbacks[name.namespace][name.value]

                    if (Object.keys(this.callbacks[name.namespace]).length === 0) {
                        delete this.callbacks[name.namespace]
                    }
                }
            }
        })

        return this
    }

    trigger(_name, _args) {
        if (typeof _name === 'undefined' || _name === '') {
            console.warn('Wrong event name')
            return false
        }

        let finalResult = null
        let result = null

        const args = !(_args instanceof Array) ? [] : _args
        let name = this.resolveNames(_name)
        name = this.resolveName(name[0])

        // Default namespace
        if (name.namespace === 'base') {
            for (const namespace in this.callbacks) {
                if (
                    this.callbacks[namespace] instanceof Object &&
                    this.callbacks[namespace][name.value] instanceof Array
                ) {
                    this.callbacks[namespace][name.value].forEach((callback) => {
                        result = callback.apply(this, args)
                        if (typeof finalResult === 'undefined') {
                            finalResult = result
                        }
                    })
                }
            }
        } else if (this.callbacks[name.namespace] instanceof Object) {
            if (name.value === '') {
                console.warn('Wrong event name')
                return this
            }

            this.callbacks[name.namespace][name.value].forEach((callback) => {
                result = callback.apply(this, args)
                if (typeof finalResult === 'undefined') {
                    finalResult = result
                }
            })
        }

        return finalResult
    }

    resolveNames(_names) {
        let names = _names
        names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '')
        names = names.replace(/[,/ ]+/g, ' ')
        return names.split(' ')
    }

    resolveName(name) {
        const newName = {}
        const parts = name.split('.')

        newName.original = name
        newName.value = parts[0]
        newName.namespace = 'base'

        if (parts.length > 1 && parts[1] !== '') {
            newName.namespace = parts[1]
        }

        return newName
    }
}

