import GUI from 'lil-gui'

export default class Debug {
    constructor() {
        this.active = true // default active, can be toggled with UI or key 'h'

        if (this.active) {
            this.ui = new GUI({
                title: '⚡ Island Controls & Debug',
                width: 320,
                closeFolders: true
            })
            
            // Allow minimizing
            window.addEventListener('keydown', (event) => {
                if (event.key.toLowerCase() === 'h') {
                    this.ui.show(this.ui._hidden)
                }
            })
        }
    }
}

