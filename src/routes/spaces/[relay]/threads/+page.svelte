<script lang="ts">
  import {onMount} from "svelte"
  import {page} from "$app/stores"
  import {sortBy, sleep, uniqBy, now} from "@welshman/lib"
  import {getListTags, getPubkeyTagValues} from "@welshman/util"
  import type {TrustedEvent} from "@welshman/util"
  import {feedsFromFilters, makeIntersectionFeed, makeRelayFeed} from "@welshman/feeds"
  import {nthEq} from "@welshman/lib"
  import {createFeedController, userMutes} from "@welshman/app"
  import {createScroller, type Scroller} from "@lib/html"
  import {fly} from "@lib/transition"
  import Icon from "@lib/components/Icon.svelte"
  import Button from "@lib/components/Button.svelte"
  import PageBar from "@lib/components/PageBar.svelte"
  import Spinner from "@lib/components/Spinner.svelte"
  import MenuSpaceButton from "@app/components/MenuSpaceButton.svelte"
  import ThreadItem from "@app/components/ThreadItem.svelte"
  import ThreadCreate from "@app/components/ThreadCreate.svelte"
  import {THREAD, COMMENT, decodeRelay, getEventsForUrl} from "@app/state"
  import {subscribePersistent} from "@app/commands"
  import {THREAD_FILTERS, setChecked} from "@app/notifications"
  import {pushModal} from "@app/modal"

  const url = decodeRelay($page.params.relay)

  const mutedPubkeys = getPubkeyTagValues(getListTags($userMutes))

  const createThread = () => pushModal(ThreadCreate, {url})

  const ctrl = createFeedController({
    useWindowing: true,
    feed: makeIntersectionFeed(makeRelayFeed(url), feedsFromFilters(THREAD_FILTERS)),
    onEvent: (event: TrustedEvent) => {
      if (
        event.kind === THREAD &&
        !event.tags.some(nthEq(0, "e")) &&
        !mutedPubkeys.includes(event.pubkey)
      ) {
        buffer.push(event)
      }
    },
    onExhausted: () => {
      loading = false
    },
  })

  let loading = true
  let unmounted = false
  let element: Element
  let scroller: Scroller
  let buffer: TrustedEvent[] = []
  let events: TrustedEvent[] = sortBy(e => -e.created_at, getEventsForUrl(url, [{kinds: [THREAD]}]))

  onMount(() => {
    // Element is frequently not defined. I don't know why
    sleep(1000).then(() => {
      if (!unmounted) {
        scroller = createScroller({
          element,
          delay: 300,
          threshold: 3000,
          onScroll: () => {
            buffer = sortBy(e => -e.created_at, buffer)
            events = uniqBy(e => e.id, [...events, ...buffer.splice(0, 5)])

            if (buffer.length < 50) {
              ctrl.load(50)
            }
          },
        })
      }
    })

    const unsub = subscribePersistent({
      relays: [url],
      filters: [{kinds: [COMMENT], "#K": [String(THREAD)], since: now()}],
    })

    return () => {
      unsub()
      unmounted = true
      scroller?.stop()
      setChecked($page.url.pathname)
    }
  })
</script>

<div class="relative flex h-screen flex-col" bind:this={element}>
  <PageBar>
    <div slot="icon" class="center">
      <Icon icon="notes-minimalistic" />
    </div>
    <strong slot="title">Threads</strong>
    <div slot="action" class="row-2">
      <Button class="btn btn-primary btn-sm" on:click={createThread}>
        <Icon icon="notes-minimalistic" />
        Create a Thread
      </Button>
      <MenuSpaceButton {url} />
    </div>
  </PageBar>
  <div class="flex flex-grow flex-col gap-2 overflow-auto p-2">
    {#each events as event (event.id)}
      <div in:fly>
        <ThreadItem {url} {event} />
      </div>
    {/each}
    {#if loading || events.length === 0}
      <p class="flex h-10 items-center justify-center py-20" out:fly>
        <Spinner {loading}>
          {#if loading}
            Looking for threads...
          {:else if events.length === 0}
            No threads found.
          {/if}
        </Spinner>
      </p>
    {/if}
  </div>
</div>
