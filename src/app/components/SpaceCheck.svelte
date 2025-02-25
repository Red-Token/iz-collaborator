<script lang="ts">
  import {onMount} from "svelte"
  import {goto} from "$app/navigation"
  import {ctx, sleep} from "@welshman/lib"
  import {displayRelayUrl} from "@welshman/util"
  import {preventDefault} from "@lib/html"
  import Icon from "@lib/components/Icon.svelte"
  import Button from "@lib/components/Button.svelte"
  import Spinner from "@lib/components/Spinner.svelte"
  import Confirm from "@lib/components/Confirm.svelte"
  import ModalHeader from "@lib/components/ModalHeader.svelte"
  import ModalFooter from "@lib/components/ModalFooter.svelte"
  import {attemptRelayAccess} from "@app/commands"
  import {makeSpacePath} from "@app/routes"
  import {pushModal} from "@app/modal"

  const {url} = $props()

  const path = makeSpacePath(url)

  const back = () => history.back()

  const confirm = () => goto(path, {replaceState: true})

  const next = () => {
    if (!error && ctx.net.pool.get(url).stats.lastAuth === 0) {
      pushModal(Confirm, {
        confirm,
        message: `This space does not appear to limit who can post to it. This can result
                  in a large amount of spam or other objectionable content. Continue?`
      })
    } else {
      confirm()
    }
  }

  let error: string | undefined = $state()
  let loading = $state(true)

  onMount(async () => {
    ;[error] = await Promise.all([attemptRelayAccess(url), sleep(3000)])
    loading = false
  })
</script>

<form class="column gap-4" onsubmit={preventDefault(next)}>
  <ModalHeader>
    {#snippet title()}
      <div>Checking Space...</div>
    {/snippet}
    {#snippet info()}
      <div>
        Connecting you to to <span class="text-primary">{displayRelayUrl(url)}</span>
      </div>
    {/snippet}
  </ModalHeader>
  <div class="m-auto flex flex-col gap-4">
    {#if loading}
      <Spinner loading>Hold tight, we're checking your connection.</Spinner>
    {:else if error}
      <p>Oops! We ran into some problems:</p>
      <p class="card2 bg-alt">{error}</p>
      <p>
        If you're not sure what the error message means, you may need to contact the space administrator to get more
        information.
      </p>
    {:else}
      <p>Looking good, we were able to connect you to this space! Click below to continue when you're ready.</p>
    {/if}
  </div>
  <ModalFooter>
    <Button class="btn btn-link" onclick={back}>
      <Icon icon="alt-arrow-left" />
      Go back
    </Button>
    <Button type="submit" class="btn btn-primary" disabled={loading}>
      Go to Space
      <Icon icon="alt-arrow-right" />
    </Button>
  </ModalFooter>
</form>
