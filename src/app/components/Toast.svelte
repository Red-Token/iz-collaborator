<script lang="ts">
  import {fly} from "@lib/transition"
  import Icon from "@lib/components/Icon.svelte"
  import Button from "@lib/components/Button.svelte"
  import {toast, popToast} from "@app/toast"
</script>

{#if $toast}
  {@const theme = $toast.theme || "info"}
  <div transition:fly class="toast z-toast">
    {#key $toast.id}
      <div
        role="alert"
        class="alert flex justify-center whitespace-normal text-left"
        class:bg-base-100={theme === "info"}
        class:text-base-content={theme === "info"}
        class:alert-error={theme === "error"}
      >
        {$toast.message}
        <Button class="flex items-center opacity-75" onclick={() => popToast($toast.id)}>
          <Icon icon="close-circle" />
        </Button>
      </div>
    {/key}
  </div>
{/if}
