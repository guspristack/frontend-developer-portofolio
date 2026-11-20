import { useEffect, useState } from 'react';
import { Mail, MailOpen, RefreshCw, Trash2 } from 'lucide-react';
import type { Message } from '../../shared/content';
import { errorText } from '../api';
import type { AdminRequest } from './ContentEditor';
import styles from './Admin.module.css';

const formatDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export function Inbox({ request }: { request: AdminRequest }) {
  const [items, setItems] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    request<Message[]>('/admin/messages').then((data) => {
      if (!active) return;
      setItems(data);
      setCursor(data.length === 50 ? data.at(-1)!.id : null);
      setPending(false);
    }, (cause) => {
      if (!active) return;
      setError(errorText(cause));
      setPending(false);
    });
    return () => { active = false; };
  }, [request]);

  async function load(before?: number) {
    setPending(true);
    setNotice('');
    setError('');
    try {
      const data = await request<Message[]>('/admin/messages' + (before ? '?before=' + before : ''));
      setItems((current) => before ? [...current, ...data] : data);
      setCursor(data.length === 50 ? data.at(-1)!.id : null);
      setNotice(before ? (data.length ? 'Pesan lama dimuat.' : 'Tidak ada pesan lama.') : 'Kotak masuk diperbarui.');
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setPending(false);
    }
  }

  async function manage(message: Message, remove: boolean) {
    if (remove && !window.confirm('Hapus pesan dari “' + message.name + '”?')) return;
    setPending(true);
    setNotice('');
    setError('');
    try {
      const path = '/admin/messages/' + message.id;
      if (remove) {
        await request(path, { method: 'DELETE' });
        setItems((current) => current.filter(({ id }) => id !== message.id));
        setNotice('Pesan dihapus.');
      } else {
        const updated = await request<Message>(path, { method: 'PATCH', data: { read: !message.readAt } });
        setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
        setNotice(updated.readAt ? 'Pesan ditandai sudah dibaca.' : 'Pesan ditandai belum dibaca.');
      }
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" className={styles.secondary} disabled={pending} onClick={() => load()}>
        <RefreshCw size={15} aria-hidden="true" /> Muat ulang
      </button>
      {!items.length && !error && <p className={styles.empty}>{pending ? 'Memuat pesan…' : 'Belum ada pesan.'}</p>}
      <ul className={styles.messages}>
        {items.map((item) => (
          <li key={item.id}>
            <article>
              <div className={styles.messageHeader}>
                <div><h3>{item.name}</h3><a href={'mailto:' + encodeURIComponent(item.email)}>{item.email}</a></div>
                <div><time dateTime={item.createdAt}>{formatDate.format(new Date(item.createdAt))}</time><span>{item.readAt ? 'Sudah dibaca' : 'Belum dibaca'}</span></div>
              </div>
              <p>{item.body}</p>
              <div className={styles.actions}>
                <button type="button" className={styles.secondary} disabled={pending} onClick={() => manage(item, false)}>
                  {item.readAt ? <Mail size={15} aria-hidden="true" /> : <MailOpen size={15} aria-hidden="true" />}
                  {item.readAt ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                </button>
                <button type="button" className={styles.delete} disabled={pending} aria-label={'Hapus pesan dari ' + item.name} onClick={() => manage(item, true)}><Trash2 size={15} aria-hidden="true" /></button>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {cursor !== null && <button type="button" className={styles.secondary} onClick={() => load(cursor)} disabled={pending}>Lihat pesan lebih lama</button>}
      {notice && <p className={styles.notice} role="status">{notice}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </>
  );
}
