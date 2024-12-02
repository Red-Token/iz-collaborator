<script lang="ts">
  import Button from "@lib/components/Button.svelte"
  import {imgproxy} from "@app/state"

  export let url

  const back = () => history.back()
</script>

<Button class="m-auto h-screen w-screen cursor-pointer p-4" on:click={back}>
  <img alt="" src={imgproxy(url)} class="rounded-box m-auto max-h-full max-w-full" />
</Button>
