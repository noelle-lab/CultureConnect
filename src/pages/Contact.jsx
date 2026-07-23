import { useState } from 'react'
import { Link } from 'react-router-dom'

const TOPICS = [
  { value: 'shopper', label: "I'm a shopper with a question" },
  { value: 'shop', label: 'I own a shop and want to list' },
  { value: 'press', label: 'Press or partnership' },
  { value: 'other', label: 'Something else' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'shopper', message: '' })
  const [sent, setSent] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return
    setSent(true)
  }

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container" style={{ padding: '60px 0 40px' }}>
          <span className="eyebrow">✉️ We'd love to hear from you</span>
          <h1 style={{ fontSize: '2.6rem', maxWidth: '15em' }}>
            Get in touch with CultureConnect.
          </h1>
          <p className="lead" style={{ maxWidth: '42em' }}>
            Questions about an order, interested in listing your shop, or just
            want to tell us which city to serve next? Send a note - a real person
            on our small team reads every message.
          </p>
        </div>
      </section>

      {/* FORM + INFO */}
      <section className="section" style={{ paddingTop: 30 }}>
        <div className="container">
          <div className="detail-grid" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
            {/* Form */}
            <div className="panel">
              {sent ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: '2.6rem' }}>📨</div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Thanks, {form.name.split(' ')[0]}!</h2>
                  <p className="muted" style={{ maxWidth: '32em', margin: '0 auto' }}>
                    We've got your message and will reply to{' '}
                    <strong>{form.email}</strong> soon. (Demo form - nothing was
                    actually submitted.)
                  </p>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 18 }}
                    onClick={() => {
                      setForm({ name: '', email: '', topic: 'shopper', message: '' })
                      setSent(false)
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <h3 style={{ marginTop: 0 }}>Send us a message</h3>
                  <div className="grid-2">
                    <div className="field">
                      <label>Your name</label>
                      <input
                        className="input"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Jordan Rivera"
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Email</label>
                      <input
                        className="input"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>What's this about?</label>
                    <select
                      className="select"
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    >
                      {TOPICS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Message</label>
                    <textarea
                      className="textarea"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what's on your mind…"
                      required
                    />
                  </div>
                  <button className="btn btn-primary btn-block" type="submit">
                    Send message
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="panel" style={{ marginBottom: 16 }}>
                <h3 style={{ marginTop: 0 }}>Reach us directly</h3>
                <p className="muted" style={{ margin: '0 0 4px' }}>General &amp; support</p>
                <a href="mailto:hello@cultureconnect.shop" style={{ color: 'var(--clay)', fontWeight: 600 }}>
                  hello@cultureconnect.shop
                </a>
                <p className="muted" style={{ margin: '16px 0 4px' }}>Shop partnerships</p>
                <a href="mailto:shops@cultureconnect.shop" style={{ color: 'var(--clay)', fontWeight: 600 }}>
                  shops@cultureconnect.shop
                </a>
              </div>

              <div className="panel" style={{ background: 'var(--saffron-soft)', borderColor: '#eeddb4' }}>
                <h3 style={{ marginTop: 0 }}>Looking for something specific?</h3>
                <ul className="check-list">
                  <li>
                    Own a shop? See the two ways to{' '}
                    <Link to="/services" style={{ color: 'var(--clay)', fontWeight: 600 }}>list with us</Link>.
                  </li>
                  <li>
                    Want us in your city?{' '}
                    <Link to="/request-store" style={{ color: 'var(--clay)', fontWeight: 600 }}>Request &amp; vote here</Link>.
                  </li>
                  <li>
                    Curious how it all runs?{' '}
                    <Link to="/how-it-works" style={{ color: 'var(--clay)', fontWeight: 600 }}>See how it works</Link>.
                  </li>
                </ul>
                <p className="muted" style={{ fontSize: '0.85rem', margin: '12px 0 0' }}>
                  Based in New York City · Expanding to SF &amp; DC next.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
