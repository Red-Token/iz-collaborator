import type {ComponentType} from "svelte"
import {randomId} from "@welshman/lib"
import {goto} from "$app/navigation"

export const modals = new Map()

export const pushModal = (component: ComponentType, props: Record<string, any> = {}) => {
  const id = randomId()

  // TODO: fix memory leak here by listening to history somehow
  modals.set(id, {component, props})
  goto("#" + id)

  return id
}

export const clearModal = () => goto('#')
