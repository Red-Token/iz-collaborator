<script lang="ts">
  import {userProfile} from "@welshman/app"
  import Avatar from "@lib/components/Avatar.svelte"
  import Divider from "@lib/components/Divider.svelte"
  import PrimaryNavItem from "@lib/components/PrimaryNavItem.svelte"
  import SpaceAdd from "@app/components/SpaceAdd.svelte"
  import MenuSpaces from "@app/components/MenuSpaces.svelte"
  import MenuSettings from "@app/components/MenuSettings.svelte"
  import PrimaryNavItemSpace from "@app/components/PrimaryNavItemSpace.svelte"
  import {userMembership, getMembershipUrls, PLATFORM_RELAY, PLATFORM_LOGO} from "@app/state"
  import {pushModal} from "@app/modal"
  import {deriveNotification, inactiveSpacesNotifications, CHAT_FILTERS} from "@app/notifications"

  const chatNotification = deriveNotification("/chat", CHAT_FILTERS)

  const addSpace = () => pushModal(SpaceAdd)

  const showSpacesMenu = () =>
    getMembershipUrls($userMembership).length > 0 ? pushModal(MenuSpaces) : pushModal(SpaceAdd)

  const showSettingsMenu = () => pushModal(MenuSettings)
</script>

<div class="bg-base-200 relative z-nav hidden w-14 flex-shrink-0 pt-4 md:block">
  <div class="flex h-full flex-col justify-between">
    <div>
      {#if PLATFORM_RELAY}
        <PrimaryNavItemSpace url={PLATFORM_RELAY} />
      {:else}
        <PrimaryNavItem title="Home" href="/home" class="tooltip-right">
          <Avatar src={PLATFORM_LOGO} class="!h-10 !w-10" />
        </PrimaryNavItem>
        <Divider />
        {#each getMembershipUrls($userMembership) as url (url)}
          <PrimaryNavItemSpace {url} />
        {/each}
        <PrimaryNavItem title="Add Space" on:click={addSpace} class="tooltip-right">
          <Avatar icon="settings-minimalistic" class="!h-10 !w-10" />
        </PrimaryNavItem>
      {/if}
    </div>
    <div>
      <PrimaryNavItem
        title="Settings"
        href="/settings/profile"
        prefix="/settings"
        class="tooltip-right">
        <Avatar src={$userProfile?.picture} class="!h-10 !w-10" />
      </PrimaryNavItem>
      <PrimaryNavItem title="Notes" href="/notes" class="tooltip-right">
        <Avatar icon="notes-minimalistic" class="!h-10 !w-10" />
      </PrimaryNavItem>
      <PrimaryNavItem
        title="Messages"
        href="/chat"
        class="tooltip-right"
        notification={$chatNotification}>
        <Avatar icon="letter" class="!h-10 !w-10" />
      </PrimaryNavItem>
      <PrimaryNavItem title="Search" href="/people" class="tooltip-right">
        <Avatar icon="magnifer" class="!h-10 !w-10" />
      </PrimaryNavItem>
    </div>
  </div>
</div>

<slot />

<div
  class="border-top border-base-200 bg-base-100 fixed bottom-0 left-0 right-0 z-nav h-14 border md:hidden">
  <div class="content-padding-x content-sizing flex justify-between px-2">
    <div class="flex gap-2 sm:gap-8">
      <PrimaryNavItem title="Search" href="/people">
        <Avatar icon="magnifer" class="!h-10 !w-10" />
      </PrimaryNavItem>
      <PrimaryNavItem title="Notes" href="/notes">
        <Avatar icon="notes-minimalistic" class="!h-10 !w-10" />
      </PrimaryNavItem>
      <PrimaryNavItem title="Messages" href="/chat" notification={$chatNotification}>
        <Avatar icon="letter" class="!h-10 !w-10" />
      </PrimaryNavItem>
      <PrimaryNavItem
        title="Spaces"
        on:click={showSpacesMenu}
        notification={$inactiveSpacesNotifications.length > 0}>
        <Avatar icon="settings-minimalistic" class="!h-10 !w-10" />
      </PrimaryNavItem>
    </div>
    <PrimaryNavItem title="Settings" on:click={showSettingsMenu}>
      <Avatar src={$userProfile?.picture} class="!h-10 !w-10" />
    </PrimaryNavItem>
  </div>
</div>
