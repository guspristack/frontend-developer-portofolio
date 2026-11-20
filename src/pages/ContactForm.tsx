import { useState, type FormEvent } from 'react';
import { api, errorText } from '../api';
import styles from './MinimalPortfolio.module.css';

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setSent(false);
    setError('');
    try {
      await api('/messages', { method: 'POST', data: Object.fromEntries(new FormData(form)) });
      form.reset();
      setSent(true);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.contactForm} aria-labelledby="raka-form-title" onSubmit={submit}>
      <h3 id="raka-form-title">Tulis pesan</h3>
      <fieldset disabled={pending}>
        <label>Nama<input name="name" autoComplete="name" maxLength={100} required /></label>
        <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        <label>Pesan<textarea name="body" rows={5} minLength={10} maxLength={3000} required /></label>
        <button type="submit" className={styles.cta}>{pending ? 'Mengirim…' : 'Kirim pesan'}</button>
      </fieldset>
      {sent && <p role="status">Pesan sudah diterima.</p>}
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
