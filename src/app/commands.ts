import {get} from "svelte/store"
import {ctx, sample, uniq, sleep, chunk, equals, choice} from "@welshman/lib"
import {
  DELETE,
  PROFILE,
  INBOX_RELAYS,
  RELAYS,
  FOLLOWS,
  REACTION,
  AUTH_JOIN,
  GROUP_JOIN,
  GROUP_LEAVE,
  GROUP_CREATE,
  GROUP_EDIT_META,
  GROUPS,
  COMMENT,
  isSignedEvent,
  createEvent,
  displayProfile,
  normalizeRelayUrl,
  makeList,
  addToListPublicly,
  removeFromListByPredicate,
  getTag,
  getListTags,
  getRelayTags,
  isShareableRelayUrl,
  getRelayTagValues
} from "@welshman/util"
import type {TrustedEvent, EventTemplate, List} from "@welshman/util"
import type {SubscribeRequestWithHandlers} from "@welshman/net"
import {PublishStatus, AuthStatus, SocketStatus} from "@welshman/net"
import {Nip59, makeSecret, stamp, Nip46Broker} from "@welshman/signer"
import {
  pubkey,
  signer,
  repository,
  publishThunk,
  publishThunks,
  loadProfile,
  loadInboxRelaySelections,
  profilesByPubkey,
  relaySelectionsByPubkey,
  getWriteRelayUrls,
  loadFollows,
  loadMutes,
  tagEvent,
  tagReactionTo,
  getRelayUrls,
  userRelaySelections,
  userInboxRelaySelections,
  nip44EncryptToSelf,
  loadRelay,
  addSession,
  clearStorage,
  dropSession
} from "@welshman/app"
import type {Thunk} from "@welshman/app"
import {
  tagRoom,
  PROTECTED,
  userMembership,
  INDEXER_RELAYS,
  NIP46_PERMS,
  loadMembership,
  loadSettings,
  getDefaultPubkeys,
  userRoomsByUrl
} from "@app/state"

// Utils

export const getPubkeyHints = (pubkey: string) => {
  const selections = relaySelectionsByPubkey.get().get(pubkey)
  const relays = selections ? getWriteRelayUrls(selections) : []
  const hints = relays.length ? relays : INDEXER_RELAYS

  return hints
}

export const getPubkeyPetname = (pubkey: string) => {
  const profile = profilesByPubkey.get().get(pubkey)
  const display = displayProfile(profile)

  return display
}

export const makeMention = (pubkey: string, hints?: string[]) => [
  "p",
  pubkey,
  choice(hints || getPubkeyHints(pubkey)),
  getPubkeyPetname(pubkey)
]

export const makeIMeta = (url: string, data: Record<string, string>) => [
  "imeta",
  `url ${url}`,
  ...Object.entries(data).map(([k, v]) => [k, v].join(" "))
]

export const getThunkError = async (thunk: Thunk) => {
  const result = await thunk.result
  const [{status, message}] = Object.values(result) as any

  if (status !== PublishStatus.Success) {
    return message
  }
}

// Log in

export const loginWithNip46 = async ({
  relays,
  signerPubkey,
  clientSecret = makeSecret(),
  connectSecret = ""
}: {
  relays: string[]
  signerPubkey: string
  clientSecret?: string
  connectSecret?: string
}) => {
  const broker = Nip46Broker.get({relays, clientSecret, signerPubkey})
  const result = await broker.connect("", connectSecret, NIP46_PERMS)

  // TODO: remove ack result
  if (!["ack", connectSecret].includes(result)) return false

  const pubkey = await broker.getPublicKey()

  if (!pubkey) return false

  await loadUserData(pubkey)

  const handler = {relays, pubkey: signerPubkey}

  addSession({method: "nip46", pubkey, secret: clientSecret, handler})

  return true
}

// Log out

export const logout = async () => {
  const $pubkey = pubkey.get()

  if ($pubkey) {
    dropSession($pubkey)
  }

  await clearStorage()

  localStorage.clear()
}

// Loaders

export const loadUserData = (pubkey: string, request: Partial<SubscribeRequestWithHandlers> = {}) => {
  const promise = Promise.race([
    sleep(3000),
    Promise.all([
      loadInboxRelaySelections(pubkey, request),
      loadMembership(pubkey, request),
      loadSettings(pubkey, request),
      loadProfile(pubkey, request),
      loadFollows(pubkey, request),
      loadMutes(pubkey, request)
    ])
  ])

  // Load followed profiles slowly in the background without clogging other stuff up. Only use a single
  // indexer relay to avoid too many redundant validations, which slow things down and eat bandwidth
  promise.then(async () => {
    for (const pubkeys of chunk(50, getDefaultPubkeys())) {
      const relays = sample(1, INDEXER_RELAYS)

      await sleep(1000)

      for (const pubkey of pubkeys) {
        loadMembership(pubkey, {relays})
        loadProfile(pubkey, {relays})
        loadFollows(pubkey, {relays})
        loadMutes(pubkey, {relays})
      }
    }
  })

  return promise
}

export const discoverRelays = (lists: List[]) =>
  Promise.all(uniq(lists.flatMap(getRelayUrls)).filter(isShareableRelayUrl).map(loadRelay))

// Synchronization

export const broadcastUserData = async (relays: string[]) => {
  const authors = [pubkey.get()!]
  const kinds = [RELAYS, INBOX_RELAYS, FOLLOWS, PROFILE]
  const events = repository.query([{kinds, authors}])

  for (const event of events) {
    if (isSignedEvent(event)) {
      await publishThunk({event, relays}).result
    }
  }
}

// NIP 29 stuff

export const nip29 = {
  createRoom: (url: string, room: string) => {
    const event = createEvent(GROUP_CREATE, {tags: [tagRoom(room, url)]})

    return publishThunk({event, relays: [url]})
  },
  editMeta: (url: string, room: string, meta: Record<string, string>) => {
    const event = createEvent(GROUP_EDIT_META, {
      tags: [tagRoom(room, url), ...Object.entries(meta)]
    })

    return publishThunk({event, relays: [url]})
  },
  joinRoom: (url: string, room: string) => {
    const event = createEvent(GROUP_JOIN, {tags: [tagRoom(room, url)]})

    return publishThunk({event, relays: [url]})
  },
  leaveRoom: (url: string, room: string) => {
    const event = createEvent(GROUP_LEAVE, {tags: [tagRoom(room, url)]})

    return publishThunk({event, relays: [url]})
  }
}

// List updates

export const addSpaceMembership = async (url: string) => {
  const list = get(userMembership) || makeList({kind: GROUPS})
  const event = await addToListPublicly(list, ["r", url]).reconcile(nip44EncryptToSelf)
  const relays = uniq([...ctx.app.router.FromUser().getUrls(), ...getRelayTagValues(event.tags)])

  return publishThunk({event, relays})
}

export const removeSpaceMembership = async (url: string) => {
  const list = get(userMembership) || makeList({kind: GROUPS})
  const pred = (t: string[]) => t[t[0] === "r" ? 1 : 2] === url
  const event = await removeFromListByPredicate(list, pred).reconcile(nip44EncryptToSelf)
  const relays = uniq([url, ...ctx.app.router.FromUser().getUrls(), ...getRelayTagValues(event.tags)])

  return publishThunk({event, relays})
}

export const addRoomMembership = async (url: string, room: string, name: string) => {
  const list = get(userMembership) || makeList({kind: GROUPS})
  const newTags = [
    ["r", url],
    ["group", room, url, name]
  ]
  const event = await addToListPublicly(list, ...newTags).reconcile(nip44EncryptToSelf)
  const relays = uniq([...ctx.app.router.FromUser().getUrls(), ...getRelayTagValues(event.tags)])

  return publishThunk({event, relays})
}

export const removeRoomMembership = async (url: string, room: string) => {
  const list = get(userMembership) || makeList({kind: GROUPS})
  const pred = (t: string[]) => equals(["group", room, url], t.slice(0, 3))
  const event = await removeFromListByPredicate(list, pred).reconcile(nip44EncryptToSelf)
  const relays = uniq([url, ...ctx.app.router.FromUser().getUrls(), ...getRelayTagValues(event.tags)])

  return publishThunk({event, relays})
}

export const setRelayPolicy = (url: string, read: boolean, write: boolean) => {
  const list = get(userRelaySelections) || makeList({kind: RELAYS})
  const tags = getRelayTags(getListTags(list)).filter(t => normalizeRelayUrl(t[1]) !== url)

  if (read && write) {
    tags.push(["r", url])
  } else if (read) {
    tags.push(["r", url, "read"])
  } else if (write) {
    tags.push(["r", url, "write"])
  }

  return publishThunk({
    event: createEvent(list.kind, {tags}),
    relays: [url, ...INDEXER_RELAYS, ...ctx.app.router.FromUser().getUrls(), ...userRoomsByUrl.get().keys()]
  })
}

export const setInboxRelayPolicy = (url: string, enabled: boolean) => {
  const list = get(userInboxRelaySelections) || makeList({kind: INBOX_RELAYS})

  // Only update inbox policies if they already exist or we're adding them
  if (enabled || getRelayUrls(list).includes(url)) {
    const tags = getRelayTags(getListTags(list)).filter(t => normalizeRelayUrl(t[1]) !== url)

    if (enabled) {
      tags.push(["relay", url])
    }

    return publishThunk({
      event: createEvent(list.kind, {tags}),
      relays: [...INDEXER_RELAYS, ...ctx.app.router.FromUser().getUrls(), ...userRoomsByUrl.get().keys()]
    })
  }
}

// Relay access

export const checkRelayAccess = async (url: string, claim = "") => {
  const connection = ctx.net.pool.get(url)

  await connection.auth.attempt(5000)

  const thunk = publishThunk({
    event: createEvent(AUTH_JOIN, {tags: [["claim", claim]]}),
    relays: [url]
  })

  const result = await thunk.result

  if (result[url].status !== PublishStatus.Success) {
    const message =
      connection.auth.message?.replace(/^.*: /, "") ||
      result[url].message?.replace(/^.*: /, "") ||
      "join request rejected"

    // If it's a strict NIP 29 relay don't worry about requesting access
    // TODO: remove this if relay29 ever gets less strict
    if (message !== "missing group (`h`) tag") {
      return `Failed to join relay (${message})`
    }
  }
}

export const checkRelayProfile = async (url: string) => {
  const relay = await loadRelay(url)

  if (!relay?.profile) {
    return "Sorry, we weren't able to find that relay."
  }
}

export const checkRelayConnection = async (url: string) => {
  const connection = ctx.net.pool.get(url)

  await connection.socket.open()

  if (connection.socket.status !== SocketStatus.Open) {
    return `Failed to connect`
  }
}

export const checkRelayAuth = async (url: string, timeout = 3000) => {
  const connection = ctx.net.pool.get(url)
  const okStatuses = [AuthStatus.None, AuthStatus.Ok]

  await connection.auth.attempt(timeout)

  // Only raise an error if it's not a timeout.
  // If it is, odds are the problem is with our signer, not the relay
  if (!okStatuses.includes(connection.auth.status) && connection.auth.message) {
    return `Failed to authenticate (${connection.auth.message})`
  }
}

export const attemptRelayAccess = async (url: string, claim = "") => {
  const checks = [
    () => checkRelayProfile(url),
    () => checkRelayConnection(url),
    () => checkRelayAccess(url, claim),
    () => checkRelayAuth(url)
  ]

  for (const check of checks) {
    const error = await check()

    if (error) {
      return error
    }
  }
}

// Actions

export const sendWrapped = async ({
  template,
  pubkeys,
  delay
}: {
  template: EventTemplate
  pubkeys: string[]
  delay?: number
}) => {
  const nip59 = Nip59.fromSigner(signer.get()!)

  return publishThunks(
    await Promise.all(
      uniq(pubkeys).map(async recipient => ({
        event: await nip59.wrap(recipient, stamp(template)),
        relays: ctx.app.router.PubkeyInbox(recipient).getUrls(),
        delay
      }))
    )
  )
}

export const makeDelete = ({event}: {event: TrustedEvent}) => {
  const tags = [["k", String(event.kind)], ...tagEvent(event)]
  const groupTag = getTag("h", event.tags)

  if (groupTag) {
    tags.push(PROTECTED)
    tags.push(groupTag)
  }

  return createEvent(DELETE, {tags})
}

export const publishDelete = ({relays, event}: {relays: string[]; event: TrustedEvent}) =>
  publishThunk({event: makeDelete({event}), relays})

export type ReactionParams = {
  event: TrustedEvent
  content: string
}

export const makeReaction = ({event, content}: ReactionParams) => {
  const tags = [["k", String(event.kind)], ...tagReactionTo(event)]
  const groupTag = getTag("h", event.tags)

  if (groupTag) {
    tags.push(PROTECTED)
    tags.push(groupTag)
  }

  return createEvent(REACTION, {content, tags})
}

export const publishReaction = ({relays, ...params}: ReactionParams & {relays: string[]}) =>
  publishThunk({event: makeReaction(params), relays})

export type ReplyParams = {
  event: TrustedEvent
  content: string
  tags?: string[][]
}

export const makeComment = ({event, content, tags = []}: ReplyParams) => {
  const seenRoots = new Set<string>()

  for (const [raw, ...tag] of event.tags.filter(t => t[0].match(/^(k|e|a|i)$/i))) {
    const T = raw.toUpperCase()
    const t = raw.toLowerCase()

    if (seenRoots.has(T)) {
      tags.push([t, ...tag])
    } else {
      tags.push([T, ...tag])
      seenRoots.add(T)
    }
  }

  if (seenRoots.size === 0) {
    tags.push(["K", String(event.kind)])
    tags.push(["E", event.id])
  }

  tags.push(["k", String(event.kind)])
  tags.push(["e", event.id])

  return createEvent(COMMENT, {content, tags})
}

export const publishComment = ({relays, ...params}: ReplyParams & {relays: string[]}) =>
  publishThunk({event: makeComment(params), relays})
