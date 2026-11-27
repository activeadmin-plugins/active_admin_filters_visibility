import { defaults, registerFilterType } from "active_admin_filters_visibility"

defaults.ordering = true

registerFilterType("yes-only", (wrapper) => wrapper.querySelector("select").value === "true")
