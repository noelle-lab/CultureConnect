import { useCallback, useEffect, useRef, useState } from 'react'

// Every in-progress admin form draft is stored under this namespace, so a single
// helper can wipe them all (e.g. on "Reset demo") without touching other state.
const PREFIX = 'cultureconnect.draft.'

function readDraft(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Remove every saved form draft. Called from resetDemo so a reset also clears
// any half-finished new-business / new-listing entry.
export function clearAllDrafts() {
  try {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) keys.push(k)
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}

// Persist an in-progress form to localStorage so an admin never loses their work
// if they close the editor, click outside the modal, or refresh mid-entry. The
// draft is keyed per entity (e.g. a new business vs. the specific shop being
// edited), restored automatically when the form reopens, and cleared on a
// successful save.
//
// Returns:
//   • form / setForm  — drop-in replacements for useState.
//   • draftRestored   — true when a previously-saved draft was loaded, so the UI
//                       can surface a "we brought your progress back" note.
//   • clearDraft      — forget the saved draft (call after a successful save).
//   • resetDraft      — clear the draft AND reset the form to its initial values
//                       (the "start fresh" action behind the restored note).
export function useFormDraft(key, initial) {
  // Freeze the initial values once so an inline `{ ...BLANK, ...initial }` object
  // doesn't retrigger effects or reset the form on every render.
  const initialRef = useRef(initial)

  const [form, setForm] = useState(() => {
    const saved = key ? readDraft(key) : null
    return { ...initialRef.current, ...(saved || {}) }
  })
  const [draftRestored, setDraftRestored] = useState(
    () => !!(key && readDraft(key)),
  )

  // Save on every change. Cheap for this prototype's form sizes and guarantees
  // the latest keystroke is already on disk if the tab closes unexpectedly.
  useEffect(() => {
    if (!key) return
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(form))
    } catch {
      /* ignore quota errors */
    }
  }, [key, form])

  const clearDraft = useCallback(() => {
    if (!key) return
    try {
      localStorage.removeItem(PREFIX + key)
    } catch {
      /* ignore */
    }
  }, [key])

  const resetDraft = useCallback(() => {
    setForm(initialRef.current)
    clearDraft()
    setDraftRestored(false)
  }, [clearDraft])

  return { form, setForm, draftRestored, clearDraft, resetDraft }
}
