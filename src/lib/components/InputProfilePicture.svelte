<script lang="ts">
  import {randomId} from "@welshman/lib"
  import Icon from "@lib/components/Icon.svelte"

  export let file: File | null = null
  export let url: string | null = null

  const id = randomId()

  const onDragEnter = () => {
    active = true
  }

  const onDragOver = () => {
    active = true
  }

  const onDragLeave = () => {
    active = false
  }

  const onDrop = (e: any) => {
    active = false

    file = e.dataTransfer.files[0]
  }

  const onChange = (e: any) => {
    file = e.target.files[0]
  }

  const onClear = () => {
    initialUrl = null
    file = null
    url = null
  }

  let active = false
  let initialUrl = url

  $: {
    if (file) {
      const reader = new FileReader()

      reader.addEventListener(
        "load",
        () => {
          url = reader.result as string
        },
        false,
      )
      reader.readAsDataURL(file)
    } else {
      url = initialUrl
    }
  }
</script>

<form>
  <input {id} type="file" accept="image/*" on:change={onChange} class="hidden" />
  <label
    for={id}
    aria-label="Drag and drop files here."
    style="background-image: url({url});"
    class="border-base-content bg-base-300 relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-solid bg-cover bg-center transition-all"
    class:transparent={!url}
    class:border-primary={active}
    on:dragenter|preventDefault|stopPropagation={onDragEnter}
    on:dragover|preventDefault|stopPropagation={onDragOver}
    on:dragleave|preventDefault|stopPropagation={onDragLeave}
    on:drop|preventDefault|stopPropagation={onDrop}>
    <div
      class="bg-primary absolute right-0 top-0 h-5 w-5 overflow-hidden rounded-full"
      class:bg-error={url}
      class:bg-primary={!url}>
      {#if url}
        <span
          role="button"
          tabindex="-1"
          on:mousedown|stopPropagation={onClear}
          on:touchstart|stopPropagation={onClear}>
          <Icon icon="close-circle" class="!bg-base-300 scale-150" />
        </span>
      {:else}
        <Icon icon="add-circle" class="!bg-base-300 scale-150" />
      {/if}
    </div>
    {#if !url}
      <Icon icon="gallery-send" size={7} />
    {/if}
  </label>
</form>
