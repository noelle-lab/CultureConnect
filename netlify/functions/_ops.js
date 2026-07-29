// The write operations, mirroring the mutating actions in
// src/context/AppContext.jsx one-for-one. The server is the source of truth:
// the browser applies the same change optimistically for instant feedback, but
// this is the version that actually persists and that every other admin sees.
//
// `applyOp(state, op, args)` takes the current collections (plain
// name -> array) and returns the next collections. The caller compares old vs
// new per collection to know which rows to write (and bump the rev on).
import { buildSeed } from './_seed.js'

const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

export function applyOp(state, op, args = {}) {
  // Shallow copy so we never mutate the caller's objects in place.
  const next = { ...state }

  switch (op) {
    // --- City requests -----------------------------------------------------
    case 'addCityRequest':
      // args.req is the fully-built record (id, votes, status, date, …).
      next.cityRequests = [args.req, ...state.cityRequests]
      break
    case 'voteCityRequest':
      next.cityRequests = state.cityRequests.map((c) =>
        c.id === args.id ? { ...c, votes: c.votes + 1 } : c,
      )
      break
    case 'setCityRequestStatus':
      next.cityRequests = state.cityRequests.map((c) =>
        c.id === args.id ? { ...c, status: args.status } : c,
      )
      break

    // --- Stores (draft catalog) -------------------------------------------
    case 'addStore':
      // args.store already carries its generated id + defaults.
      next.stores = [args.store, ...state.stores]
      break
    case 'updateStore':
      next.stores = state.stores.map((s) =>
        s.id === args.id ? { ...s, ...args.patch } : s,
      )
      break

    // --- Products (draft catalog) -----------------------------------------
    case 'addProduct':
      next.products = [args.product, ...state.products]
      break
    case 'updateProduct':
      next.products = state.products.map((p) =>
        p.id === args.id ? { ...p, ...args.patch } : p,
      )
      break
    case 'removeProduct':
      next.products = state.products.filter((p) => p.id !== args.id)
      break
    case 'toggleCrosslist':
      next.products = state.products.map((p) => {
        if (p.id !== args.id) return p
        const has = p.crosslisted.includes(args.channel)
        return {
          ...p,
          crosslisted: has
            ? p.crosslisted.filter((c) => c !== args.channel)
            : [...p.crosslisted, args.channel],
        }
      })
      break

    // --- Publish / discard draft catalog edits ----------------------------
    // Push the current draft live, or throw the draft away for what's live.
    case 'publishEdits':
      next.publishedStores = state.stores
      next.publishedProducts = state.products
      break
    case 'discardEdits':
      next.stores = state.publishedStores
      next.products = state.publishedProducts
      break

    // --- Orders (checkout) -------------------------------------------------
    case 'placeOrder':
      next.orders = [args.order, ...state.orders]
      break

    // --- Admin roster + invites -------------------------------------------
    case 'createInvite': {
      const email = normalizeEmail(args.invite.email)
      next.invitedEmails = [
        email,
        ...state.invitedEmails.filter((e) => e !== email),
      ]
      next.invites = [
        args.invite,
        // One active link per email — drop any older pending invite for it.
        ...state.invites.filter((i) => i.email !== email),
      ]
      break
    }
    case 'acceptInvite': {
      const email = normalizeEmail(args.email)
      const today = args.date
      next.admins = state.admins.some((a) => a.email === email)
        ? state.admins.map((a) =>
            a.email === email ? { ...a, acceptedAt: a.acceptedAt || today } : a,
          )
        : [
            ...state.admins,
            { email, name: '', status: 'active', addedAt: today, acceptedAt: today },
          ]
      next.invites = state.invites.map((i) =>
        i.token === args.token ? { ...i, redeemed: true, acceptedAt: today } : i,
      )
      break
    }
    case 'recordAdminSignIn': {
      // Remember the latest name/photo Google handed us, plus last sign-in.
      const email = normalizeEmail(args.email)
      next.admins = state.admins.map((a) =>
        a.email === email
          ? {
              ...a,
              name: args.name || a.name,
              picture: args.picture || a.picture,
              lastSignIn: args.date,
            }
          : a,
      )
      break
    }
    case 'revokeInvite':
      next.invites = state.invites.filter((i) => i.id !== args.id)
      break
    case 'revokeAdmin': {
      const email = normalizeEmail(args.email)
      // The owner can never be removed.
      const record = state.admins.find((a) => a.email === email)
      if (record?.status === 'owner') break
      next.admins = state.admins.filter((a) => a.email !== email)
      next.invites = state.invites.filter((i) => i.email !== email)
      break
    }

    // --- Reset demo --------------------------------------------------------
    case 'reset':
      return buildSeed()

    default:
      throw new Error(`Unknown op: ${op}`)
  }

  return next
}
