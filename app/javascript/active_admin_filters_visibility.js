// Lets an admin hide, show and (optionally) reorder individual filters in the
// ActiveAdmin 4 filters sidebar. The choice is kept per page in localStorage.

const STORAGE_PREFIX = "active_admin_filters_visibility:"

const ICON =
  '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>'

export const defaults = {
  // Set to false to call setup() yourself.
  autoInit: true,
  selector: "#filters_sidebar_section",
  // One stored state per page.
  storageKey: () => window.location.pathname,
  ordering: false,
  icon: ICON,
  buttonLabel: "Choose visible filters",
  title: "Visible filters",
  resetLabel: "Reset",
  orderHint: "Drag filters to reorder them"
}

export const storage = {
  load(key) {
    try {
      const state = JSON.parse(window.localStorage.getItem(STORAGE_PREFIX + key))
      return state && typeof state === "object" ? state : {}
    } catch {
      return {}
    }
  },
  save(key, state) {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state))
    } catch {
      // Storage full or disabled: the choice lasts until the page reloads.
    }
  },
  clear(key) {
    try {
      window.localStorage.removeItem(STORAGE_PREFIX + key)
    } catch {
      // Same as save.
    }
  }
}

// A filter that has a value is never hidden on page load, so a link with
// filter params cannot filter by something the admin cannot see. Detectors
// are keyed by a class on the filter wrapper: Formtastic's input type
// ("select", "string", ...) or a class set with `wrapper_html`.
const hasEnteredValue = (wrapper) =>
  Array.from(wrapper.querySelectorAll("input, textarea")).some((input) => {
    if (input.disabled || ["hidden", "submit", "button", "reset"].includes(input.type)) return false
    if (input.type === "checkbox" || input.type === "radio") return input.checked && input.value !== ""
    return input.value !== ""
  })

const hasSelectedValue = (wrapper) =>
  Array.from(wrapper.querySelectorAll("select")).some((select) =>
    Array.from(select.selectedOptions).some((option) => option.value !== "")
  )

export const filterTypes = {
  default: hasEnteredValue,
  select: hasSelectedValue,
  boolean: hasSelectedValue
}

const builtInTypes = new Set(Object.keys(filterTypes))

export function registerFilterType(name, detector) {
  filterTypes[name] = detector
}

// A detector registered for a class beats Formtastic's type class, whatever
// the class order on the wrapper.
function isFilled(wrapper) {
  const names = Array.from(wrapper.classList).filter((klass) => klass !== "default" && Object.hasOwn(filterTypes, klass))
  const name = names.find((klass) => !builtInTypes.has(klass)) || names[0]
  return Boolean((filterTypes[name] || filterTypes.default)(wrapper))
}

function labelFor(wrapper) {
  const label = wrapper.querySelector("label")
  const text = label ? (label.firstChild?.nodeType === Node.TEXT_NODE ? label.firstChild.textContent : label.textContent) : ""
  return text.trim() || wrapper.id
}

function sameList(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

// The header the toggle goes into. Stock ActiveAdmin 4 titles the section with
// h3.filters-form-title. A layout that wraps sidebar sections in a panel (such
// as active_admin_theme 4) hides that title and shows the panel's instead.
function findHeader(section, form) {
  const panel = form.closest(".panel")
  const panelTitle = panel && section.contains(panel) && panel.querySelector(":scope > .panel-title")
  return panelTitle || section.querySelector(".filters-form-title")
}

export function setup(section, options = {}) {
  if (!section || section.hasAttribute("data-filters-visibility")) return null

  const settings = { ...defaults, ...options }
  const form = section.querySelector("form.filters-form") || section.querySelector("form")
  const header = form && findHeader(section, form)
  if (!header) return null

  const fields = Array.from(form.querySelectorAll(".filters-form-field[id]")).filter(
    (wrapper) => wrapper.parentElement === form
  )
  if (fields.length === 0) return null

  section.setAttribute("data-filters-visibility", "")
  const key = settings.storageKey()
  const byId = new Map(fields.map((wrapper) => [wrapper.id, wrapper]))
  const initialOrder = fields.map((wrapper) => wrapper.id)
  const marker = fields[fields.length - 1].nextSibling

  const saved = storage.load(key)
  let hidden = (Array.isArray(saved.hidden) ? saved.hidden : []).filter((id) => byId.has(id))
  let order = Array.isArray(saved.order) ? saved.order.filter((id) => byId.has(id)) : []
  if (order.length) order = order.concat(initialOrder.filter((id) => !order.includes(id)))

  const save = () => {
    const state = { hidden }
    if (settings.ordering && order.length && !sameList(order, initialOrder)) state.order = order
    if (state.hidden.length || state.order) {
      storage.save(key, state)
    } else {
      storage.clear(key)
    }
  }

  // Toggle button in the header.
  const panelId = `filters-visibility-panel-${section.id || "filters"}`
  const toggle = document.createElement("button")
  toggle.type = "button"
  toggle.className = "filters-visibility-toggle"
  toggle.setAttribute("data-filters-visibility-toggle", "")
  toggle.setAttribute("aria-expanded", "false")
  toggle.setAttribute("aria-controls", panelId)
  toggle.setAttribute("aria-label", settings.buttonLabel)
  toggle.title = settings.buttonLabel
  toggle.innerHTML = settings.icon
  header.classList.add("filters-visibility-header")
  header.setAttribute("data-filters-visibility-header", "")
  header.appendChild(toggle)

  // Settings panel above the form.
  const panel = document.createElement("div")
  panel.id = panelId
  panel.className = "filters-visibility-panel"
  panel.setAttribute("data-filters-visibility-panel", "")
  panel.hidden = true

  const bar = document.createElement("div")
  bar.className = "filters-visibility-panel-header"
  const title = document.createElement("strong")
  title.textContent = settings.title
  const reset = document.createElement("button")
  reset.type = "button"
  reset.className = "filters-visibility-reset"
  reset.setAttribute("data-filters-visibility-reset", "")
  reset.textContent = settings.resetLabel
  bar.append(title, reset)

  const list = document.createElement("ul")
  list.className = "filters-visibility-list"
  panel.append(bar, list)

  if (settings.ordering) {
    const hint = document.createElement("p")
    hint.className = "filters-visibility-hint"
    hint.textContent = settings.orderHint
    panel.appendChild(hint)
  }
  form.parentElement.insertBefore(panel, form)

  const items = new Map()
  for (const id of initialOrder) {
    const item = document.createElement("li")
    item.className = "filters-visibility-item"
    item.setAttribute("data-filters-visibility-item", id)
    const label = document.createElement("label")
    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.value = id
    checkbox.setAttribute("data-filters-visibility-checkbox", id)
    label.append(checkbox, document.createTextNode(` ${labelFor(byId.get(id))}`))
    item.appendChild(label)
    if (settings.ordering) item.draggable = true
    items.set(id, item)
  }

  const setFieldHidden = (id, value) => {
    const wrapper = byId.get(id)
    wrapper.hidden = value
    wrapper.toggleAttribute("data-filters-visibility-hidden", value)
  }

  const renderOrder = () => {
    const ids = order.length ? order : initialOrder
    for (const id of ids) {
      list.appendChild(items.get(id))
      form.insertBefore(byId.get(id), marker)
    }
  }

  const renderState = () => {
    for (const [id, item] of items) {
      item.querySelector("input").checked = !hidden.includes(id)
    }
    toggle.toggleAttribute("data-filters-visibility-active", hidden.length > 0)
    toggle.classList.toggle("filters-visibility-toggle-active", hidden.length > 0)
  }

  for (const id of initialOrder) setFieldHidden(id, hidden.includes(id) && !isFilled(byId.get(id)))
  if (settings.ordering) renderOrder()
  else for (const id of initialOrder) list.appendChild(items.get(id))
  renderState()

  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden
    toggle.setAttribute("aria-expanded", String(!panel.hidden))
  })

  list.addEventListener("change", (event) => {
    const id = event.target.getAttribute("data-filters-visibility-checkbox")
    if (!id) return
    hidden = event.target.checked ? hidden.filter((other) => other !== id) : hidden.concat(id)
    setFieldHidden(id, !event.target.checked)
    renderState()
    save()
  })

  reset.addEventListener("click", () => {
    hidden = []
    order = []
    storage.clear(key)
    for (const id of initialOrder) setFieldHidden(id, false)
    renderOrder()
    renderState()
  })

  if (settings.ordering) {
    let dragged = null
    list.addEventListener("dragstart", (event) => {
      dragged = event.target.closest("[data-filters-visibility-item]")
      if (!dragged) return
      event.dataTransfer.effectAllowed = "move"
      event.dataTransfer.setData("text/plain", dragged.getAttribute("data-filters-visibility-item"))
      dragged.setAttribute("data-filters-visibility-dragging", "")
    })
    list.addEventListener("dragover", (event) => {
      if (dragged) event.preventDefault()
    })
    list.addEventListener("drop", (event) => {
      const target = event.target.closest("[data-filters-visibility-item]")
      if (!dragged || !target || target === dragged) return
      event.preventDefault()
      const rect = target.getBoundingClientRect()
      const after = event.clientY > rect.top + rect.height / 2
      list.insertBefore(dragged, after ? target.nextSibling : target)
      order = Array.from(list.children).map((item) => item.getAttribute("data-filters-visibility-item"))
      renderOrder()
      save()
    })
    list.addEventListener("dragend", () => {
      dragged?.removeAttribute("data-filters-visibility-dragging")
      dragged = null
    })
  }

  return { section, toggle, panel }
}

function autoSetup() {
  if (defaults.autoInit) document.querySelectorAll(defaults.selector).forEach((section) => setup(section))
}

// Wait for DOMContentLoaded even when the DOM is already parsed: module
// scripts run before it fires, so a host module that changes `defaults` after
// importing this one still gets its settings applied. setup() runs once per
// section, so the load fallback is harmless.
if (document.readyState === "complete") {
  autoSetup()
} else {
  document.addEventListener("DOMContentLoaded", autoSetup, { once: true })
  window.addEventListener("load", autoSetup, { once: true })
}
