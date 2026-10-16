function initCounterAnimation() {
    const targets = document.querySelectorAll('[data-count]')
    if (!targets.length || typeof IntersectionObserver === 'undefined') return

    const time = 2000
    const items = new Map()
    let rafId = null

    const stop = () => {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = null
    }

    const loop = (t) => {
        const now = t || performance.now()

        items.forEach((state, el) => {
            if (state.start == null) state.start = now

            const p = Math.min((now - state.start) / time, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            const v = Math.floor(eased * state.target)

            if (v !== state.prev) {
                el.textContent = v
                state.prev = v
            }

            if (p >= 1) items.delete(el)
        })

        if (!items.size) return stop()

        rafId = requestAnimationFrame(loop)
    }

    const start = el => {
        const target = +el.dataset.count
        if (Number.isNaN(target)) return

        items.set(el, { start: null, prev: -1, target })

        if (rafId === null) rafId = requestAnimationFrame(loop)
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return
            start(entry.target)
            observer.unobserve(entry.target)
        })
    })

    targets.forEach(el => observer.observe(el))

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop()
        else if (items.size && rafId === null) {
            rafId = requestAnimationFrame(loop)
        }
    })
}


function switchToTab(i, tabButtons, tabPanels) {
    if (i < 0 || i >= tabButtons.length || i >= tabPanels.length) return

    if (tabButtons[i].classList.contains('active')) return

    tabButtons.forEach(button => button.classList.remove('active'))
    tabButtons[i].classList.add('active')

    // Show the target panel first to prevent document height collapse
    if (tabPanels[i]) tabPanels[i].hidden = false
    tabPanels.forEach((panel, index) => {
        if (index !== i) panel.hidden = true
    })

}

const toggleMenu = () => {
    const menu = document.querySelector('.menu')

    if (!menu) return

    document.body.classList.toggle('sidebar-open')
    menu.classList.toggle('active')
}

function toggleSearch() {
    const searchBtn = document.querySelector('.header__search--btn')
    const searchWrapper = document.querySelector('.header__search--wrapper')
    const headerMenu = document.querySelector('.header__menu')
    const headerLang = document.querySelector('.header__lang')

    if (!searchWrapper || !searchBtn || !headerMenu || !headerLang) return

    searchWrapper.classList.toggle('active')

    if (headerMenu) {
        headerMenu.classList.toggle('hidden')
    }

    if (headerLang) {
        headerLang.classList.toggle('hidden')
    }

    if (searchWrapper.classList.contains('active')) {
        searchBtn.setAttribute('aria-expanded', 'true')
    } else {
        searchBtn.setAttribute('aria-expanded', 'false')
    }
}

function initTabSwitching() {
    const tabNavigations = document.querySelectorAll('.tab-navigation')

    tabNavigations.forEach(navigation => {
        const system = navigation.querySelector('.tab-button')?.dataset?.tabSystem

        if (!system) return

        const tabButtons = navigation.querySelectorAll(
            `[data-tab-system="${system}"]`
        )
        const tabPanels = document.querySelectorAll(
            `.tab-panel[data-tab-system="${system}"]`
        )
        const availableTabs = Math.min(tabButtons.length, tabPanels.length)

        if (!availableTabs) return

        tabButtons.forEach((button, index) => {
            button.addEventListener('click', e => {
                e.preventDefault()

                if (index >= availableTabs) return

                switchToTab(index, tabButtons, tabPanels)
                initFaqs()
                button.focus({ preventScroll: true })
            })

            button.addEventListener('keydown', e => {
                let nextIndex = index

                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    nextIndex = index > 0 ? index - 1 : availableTabs - 1
                    e.preventDefault()
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    nextIndex = index < availableTabs - 1 ? index + 1 : 0
                    e.preventDefault()
                } else if (e.key === 'Home') {
                    nextIndex = 0
                    e.preventDefault()
                } else if (e.key === 'End') {
                    nextIndex = availableTabs - 1
                    e.preventDefault()
                }

                if (nextIndex !== index && nextIndex < availableTabs) {
                    switchToTab(nextIndex, tabButtons, tabPanels)
                    initFaqs()
                    tabButtons[nextIndex].focus({ preventScroll: true })
                }
            })
        })

        tabPanels.forEach((panel, index) => {
            const nextButton = panel.querySelector('.form--button[type="button"]')

            if (!nextButton) return

            nextButton.addEventListener('click', e => {
                e.preventDefault()

                const activeIndex = [...tabButtons].findIndex(button =>
                    button.classList.contains('active')
                )
                const currentIndex = activeIndex >= 0 ? activeIndex : index
                const nextIndex = currentIndex + 1

                if (nextIndex >= availableTabs) return

                switchToTab(nextIndex, tabButtons, tabPanels)
                tabButtons[nextIndex].focus({ preventScroll: true })
            })
        })

        switchToTab(0, tabButtons, tabPanels)
    })
}

function initTooltips() {
    if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return

    document.querySelectorAll(
        '.line-clamp-1, .line-clamp-2, .line-clamp-3, .line-clamp-4, .line-clamp-5'
    ).forEach(el => {
        if (el.classList.contains('no-tooltip')) return;

        const isClamped = el.scrollHeight > el.offsetHeight;

        if (isClamped && !el.hasAttribute('data-bs-toggle')) {
            el.setAttribute('data-bs-toggle', 'tooltip');
            el.setAttribute('data-bs-placement', 'bottom');
            el.setAttribute('data-bs-custom-class', 'custom-tooltip');
            el.setAttribute('data-bs-title', el.innerText.trim());

            new bootstrap.Tooltip(el);
        }
    });
}

function handleFaqClick(item, activeState) {
    const active = activeState.current
    if (active && active !== item) {
        active.classList.remove('active')
        const prev = active.querySelector('.answer')
        if (prev) prev.style.maxHeight = '0px'
    }
    const wasActive = item.classList.contains('active')

    item.classList.toggle('active')

    const a = item.querySelector('.answer')

    if (a) {
        a.style.maxHeight = wasActive ? '0px' : a.scrollHeight + 25 + 'px'
    }

    activeState.current = item.classList.contains('active') ? item : null
}

function initFaqs() {
    const items = document.querySelectorAll('.faq-item')
    items.forEach(item => {
        const newItem = item.cloneNode(true)
        item.parentNode.replaceChild(newItem, item)
    })

    let active
    const itemsAfterReset = document.querySelectorAll('.faq-item')
    itemsAfterReset.forEach(item => {
        item.classList.remove('active')
        const answer = item.querySelector('.answer')
        if (answer) answer.style.maxHeight = '0px'
    })
    const first = [...itemsAfterReset].find(item => !item.classList.contains('no-active'))
    if (!first) return

    first.classList.add('active')

    const firstAnswer = first.querySelector('.answer')
    if (firstAnswer) {
        firstAnswer.style.transition = 'none'
        firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px'
        firstAnswer.offsetHeight
        firstAnswer.style.transition = ''
    }

    active = first

    const activeState = { current: active }

    itemsAfterReset.forEach(item => {
        item.addEventListener('click', () => handleFaqClick(item, activeState))
    })
}

function initAos() {
    if (typeof AOS === 'undefined' || !AOS.init) return

    AOS.init({
        disable: window.innerWidth < 768,
        once: true,
        duration: 400
    })
}

function initPhoneMask() {
    if (typeof IMask === 'undefined') return

    const inputs = document.querySelectorAll('input[type="tel"]')
    inputs.forEach(input => {
        IMask(input, {
            mask: '+998 00-000-00-00',
            lazy: false
        })
    })
}



<<<<<<< HEAD
function initHeroLangDropdown() {
    const dropdowns = document.querySelectorAll('.hero-lang')

    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.hero-lang-btn')
        const list = dropdown.querySelector('.hero-lang-list')

        if (!btn || !list) return

        const closeDropdown = () => {
            dropdown.classList.remove('active')
            btn.setAttribute('aria-expanded', 'false')
            list.classList.remove('active')
        }

        const openDropdown = () => {
            dropdown.classList.add('active')
            btn.setAttribute('aria-expanded', 'true')
            list.classList.add('active')
        }

        const toggleDropdown = () => {
            if (dropdown.classList.contains('active')) {
                closeDropdown()
            } else {
                openDropdown()
            }
        }

        btn.addEventListener('click', e => {
            e.preventDefault()
            e.stopPropagation()
            toggleDropdown()
        })

        document.addEventListener('click', e => {
            if (!dropdown.contains(e.target)) {
                closeDropdown()
            }
        })

        dropdown.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                e.preventDefault()
                closeDropdown()
                btn.focus()
            }
        })
    })
}

=======
>>>>>>> c12ca8534298f654cb8c8a961d97f2057052f9ef
function initAppOnContentLoaded() {
    initCounterAnimation()
    initTabSwitching()
    initFaqs()
    initAos()
    initPhoneMask()
<<<<<<< HEAD
    initHeroLangDropdown()
=======
>>>>>>> c12ca8534298f654cb8c8a961d97f2057052f9ef
}

function initAppOnFullLoad() {
    initTooltips()
}

window.switchToTabByIndex = function (system, i) {
    const index = Number(i)
    const tabButtons = document.querySelectorAll(
        `.tab-button[data-tab-system="${system}"]`
    )
    const tabPanels = document.querySelectorAll(
        `.tab-panel[data-tab-system="${system}"]`
    )

    if (
        Number.isInteger(index) &&
        index >= 0 &&
        index < tabPanels.length &&
        index < tabButtons.length
    ) {
        switchToTab(index, tabButtons, tabPanels)
    }
}

document.addEventListener('DOMContentLoaded', initAppOnContentLoaded)
window.addEventListener('load', initAppOnFullLoad)