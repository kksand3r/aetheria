import Experience from './Experience/Experience.js'

// Canvas element
const canvas = document.querySelector('canvas.webgl')

// Initialize central Experience instance
const experience = new Experience(canvas)

// UI Elements
const loader = document.getElementById('loader')
const loaderBar = document.getElementById('loader-bar')
const loaderPercent = document.getElementById('loader-percent')

const btnSound = document.getElementById('btn-sound')
const soundIcon = document.getElementById('sound-icon')

const btnCinematic = document.getElementById('btn-cinematic')
const btnDebug = document.getElementById('btn-debug')

const btnInfo = document.getElementById('btn-info')
const modalInfo = document.getElementById('modal-info')
const btnCloseModal = document.getElementById('btn-close-modal')
const btnModalOk = document.getElementById('btn-modal-ok')

const tooltip = document.getElementById('tooltip')
const tooltipTitle = document.getElementById('tooltip-title')
const tooltipDesc = document.getElementById('tooltip-desc')

const elemBadges = document.querySelectorAll('.element-badge')
const potionName = document.getElementById('potion-name')
const potionDesc = document.getElementById('potion-desc')

const btnStir = document.getElementById('btn-stir')
const btnActivateAll = document.getElementById('btn-activate-all')
const btnResetAll = document.getElementById('btn-reset-all')

const vistaBtns = document.querySelectorAll('.vista-btn')
const timeBtns = document.querySelectorAll('.time-btn')

// --- 1. Resource Loading Progress ---
experience.resources.on('progress', (ratio) => {
    const percent = Math.round(ratio * 100)
    if (loaderBar) loaderBar.style.width = `${percent}%`
    if (loaderPercent) loaderPercent.textContent = `${percent}%`
})

experience.events.on('world.ready', () => {
    setTimeout(() => {
        if (loader) {
            loader.classList.add('fade-out')
            setTimeout(() => {
                loader.style.display = 'none'
            }, 800)
        }
    }, 400)
})

// --- 2. Audio Control ---
btnSound.addEventListener('click', () => {
    const isMuted = experience.audio.toggleMute()
    soundIcon.textContent = isMuted ? '🔇' : '🔊'
    btnSound.classList.toggle('active', !isMuted)
})

// --- 3. Cinematic Camera Orbit ---
btnCinematic.addEventListener('click', () => {
    experience.camera.isCinematic = !experience.camera.isCinematic
    btnCinematic.classList.toggle('active', experience.camera.isCinematic)
})

// --- 4. Toggle Debug lil-gui ---
btnDebug.addEventListener('click', () => {
    if (experience.debug.ui) {
        experience.debug.ui.show(experience.debug.ui._hidden)
    }
})

// --- 5. Architecture Documentation Modal ---
btnInfo.addEventListener('click', () => {
    modalInfo.classList.remove('hidden')
})

const closeModal = () => {
    modalInfo.classList.add('hidden')
}
btnCloseModal.addEventListener('click', closeModal)
btnModalOk.addEventListener('click', closeModal)
modalInfo.addEventListener('click', (e) => {
    if (e.target === modalInfo) closeModal()
})

// --- 6. Interactive 3D Tooltip ---
experience.raycaster.on('hoverEnter', (obj) => {
    const data = obj.userData
    if (data && data.name) {
        tooltipTitle.textContent = data.name
        tooltipDesc.textContent = data.desc || ''
        tooltip.classList.remove('hidden')
    }
})

experience.raycaster.on('hoverLeave', () => {
    tooltip.classList.add('hidden')
})

// --- 7. Elemental Codex & Cauldron Interactions ---
const alchemyRecipes = {
    0: { name: 'Dormant Ether', desc: 'Activate crystals to distill magical elemental elixirs.' },
    fire: { name: 'Ignis Flare Elixir', desc: 'Concentrated solar fire. Radiates warmth and courage.' },
    water: { name: 'Celestial Spring Water', desc: 'Pure tears of the floating sky realm. Deeply restorative.' },
    earth: { name: 'Verdant Essence', desc: 'Living forest resonance. Accelerates nature and growth.' },
    arcane: { name: 'Aetheric Starlight', desc: 'Unravels the cosmic fabric, granting astral perception.' },
    'fire-water': { name: 'Mystic Vapor', desc: 'Steam distillation bridging warmth and fluid mystery.' },
    'fire-earth': { name: 'Molten Magma Tincture', desc: 'Primordial volcanic earth, forge of celestial relics.' },
    'fire-arcane': { name: 'Cosmic Supernova', desc: 'Blazing stellar magic of unfathomable astral heat.' },
    'water-earth': { name: 'Elixir of Life', desc: 'The pristine harmonious medicine of ancient alchemists.' },
    'water-arcane': { name: 'Chronos Tear', desc: 'Liquid time, flowing like starlight across dimensions.' },
    'earth-arcane': { name: 'Runic Petrification', desc: 'Crystal lattice locking magical leylines in living jade.' },
    all: { name: "The Philosopher's Resonance", desc: 'The Magnum Opus! Perfect transmutation of all four elements!' }
}

experience.events.on('alchemy.stateChange', (activeElems) => {
    const activeIds = activeElems.map(e => e.id).sort()
    const count = activeIds.length

    // Update UI Badges
    elemBadges.forEach(badge => {
        const elemId = badge.getAttribute('data-elem')
        const isActive = activeIds.includes(elemId)
        badge.classList.toggle('active', isActive)
        const stateSpan = badge.querySelector('.elem-state')
        if (stateSpan) stateSpan.textContent = isActive ? 'Active' : 'Off'
    })

    // Determine Recipe Outcome
    let recipeKey = 0
    if (count === 4) {
        recipeKey = 'all'
    } else if (count === 1) {
        recipeKey = activeIds[0]
    } else if (count === 2) {
        const key = activeIds.join('-')
        recipeKey = alchemyRecipes[key] ? key : activeIds[0]
    } else if (count === 3) {
        recipeKey = 'arcane'
    }

    const recipe = alchemyRecipes[recipeKey] || alchemyRecipes[0]
    potionName.textContent = recipe.name
    potionDesc.textContent = recipe.desc

    // Highlight text color
    const colors = {
        0: '#38bdf8',
        fire: '#f87171',
        water: '#38bdf8',
        earth: '#34d399',
        arcane: '#c084fc',
        all: '#fbbf24'
    }
    potionName.style.color = colors[recipeKey] || '#e879f9'
})

// UI Badges Click Handlers
elemBadges.forEach(badge => {
    badge.addEventListener('click', () => {
        const elemId = badge.getAttribute('data-elem')
        if (experience.world && experience.world.magicCrystals) {
            const crystal = experience.world.magicCrystals.crystalItems.find(c => c.elem.id === elemId)
            if (crystal) {
                experience.world.magicCrystals.toggleCrystal(crystal)
            }
        }
    })
})

// Stir Cauldron Button
btnStir.addEventListener('click', () => {
    if (experience.world && experience.world.alchemyCauldron) {
        experience.world.alchemyCauldron.stirCauldron()
    }
})

// Awaken All Crystals
btnActivateAll.addEventListener('click', () => {
    if (experience.world && experience.world.magicCrystals) {
        experience.world.magicCrystals.activateAll()
    }
})

// Reset Crystals
btnResetAll.addEventListener('click', () => {
    if (experience.world && experience.world.magicCrystals) {
        experience.world.magicCrystals.deactivateAll()
    }
})

// --- 8. Sanctuary Vistas (Camera Presets) ---
const vistaCoordinates = {
    overview: { target: { x: 0, y: 1.5, z: 0 }, cam: { x: 16, y: 11, z: 20 } },
    tower: { target: { x: -4.2, y: 4.8, z: -3.8 }, cam: { x: 0.5, y: 6.8, z: 4.5 } },
    crucible: { target: { x: -0.5, y: 1.6, z: 3.2 }, cam: { x: -0.5, y: 4.8, z: 8.5 } },
    waterfall: { target: { x: 10.8, y: -0.8, z: 4.5 }, cam: { x: 7.2, y: 3.6, z: 12.5 } }
}

vistaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        vistaBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')

        const vista = btn.getAttribute('data-vista')
        const coords = vistaCoordinates[vista]
        if (coords) {
            experience.camera.focusOn(coords.target, coords.cam, 1.8)
        }
    })
})

// --- 9. Time of Day Quick Presets ---
timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        timeBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')

        const time = parseFloat(btn.getAttribute('data-time'))
        if (experience.world && experience.world.environment) {
            experience.world.environment.autoCycle = false
            experience.world.environment.updateTimeOfDay(time)
        }
    })
})

