<script lang="ts">
  import {page} from "$app/stores"
  import Button from "@lib/components/Button.svelte"

  export let title = ""
  export let href = ""
  export let prefix = ""
  export let notification = false

  $: active = $page.url?.pathname?.startsWith(prefix || href || "bogus")
</script>

{#if href}
  <a {href} class="relative z-nav-item flex h-14 w-14 items-center justify-center">
    <div
      class="avatar cursor-pointer rounded-full p-1 {$$props.class} hover:bg-base-300 transition-colors"
      class:bg-base-300={active}
      class:tooltip={title}
      data-tip={title}>
      <slot />
      {#if !active && notification}
        <div class="bg-primary absolute right-2 top-2 h-2 w-2 rounded-full" />
      {/if}
    </div>
  </a>
{:else}
  <Button on:click class="relative z-nav-item flex h-14 w-14 items-center justify-center">
    <div
      class="avatar cursor-pointer rounded-full p-1 {$$props.class} hover:bg-base-300 transition-colors"
      class:bg-base-300={active}
      class:tooltip={title}
      data-tip={title}>
      <slot />
      {#if !active && notification}
        <div class="bg-primary absolute right-2 top-2 h-2 w-2 rounded-full" />
      {/if}
    </div>
  </Button>
{/if}
