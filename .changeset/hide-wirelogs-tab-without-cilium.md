---
'@openchoreo/backstage-plugin-catalog-backend-module': patch
'@openchoreo/backstage-plugin-openchoreo-observability': patch
'@openchoreo/backstage-plugin-common': patch
---

Hide the component-level **Wirelogs** tab unless the component's project has at least one environment whose DataPlane runs Cilium (wirelogs are sourced from Cilium Hubble). Previously the tab was always shown and rendered a "Cilium is not configured" banner; for a core OpenChoreo setup with no Cilium DataPlanes this added a dead tab with no usable content.

The catalog sync now resolves each project's environments → DataPlanes → `openchoreo.dev/networkpolicyprovider` and stamps `openchoreo.io/wirelogs-enabled` on every Component entity (covering both the periodic full sync and the event-driven incremental path). The Backstage UI reads this annotation to show or hide the tab synchronously, so no extra tab is rendered when it can't be used. Changes to a DataPlane's network policy provider surface on the next full catalog sync.
