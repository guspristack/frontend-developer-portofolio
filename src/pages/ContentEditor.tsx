import { useId, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { errorText } from '../api';
import styles from './Admin.module.css';

export type AdminRequest = <T>(path: string, options?: { method?: string; data?: unknown }) => Promise<T>;
type Field<T> = {
  name: Extract<keyof T, string>;
  label: string;
  type?: 'textarea' | 'email' | 'url' | 'number';
  max?: number;
  optional?: boolean;
  readOnly?: boolean;
  options?: Readonly<Record<string, string>>;
};

export function ContentEditor<T extends object>({ initial, fields, submitLabel, onSave, onCancel }: {
  initial: T;
  fields: readonly Field<T>[];
  submitLabel: string;
  onSave: (value: T) => Promise<void>;
  onCancel?: () => void;
}) {
  const fieldId = useId();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const input = Object.fromEntries(fields.map((field) => {
      const value = values.get(field.name);
      return [field.name, field.type === 'number' ? Number(value) : value];
    })) as T;
    setBusy(true);
    setNotice('');
    setError('');
    try {
      await onSave(input);
      setNotice('Perubahan tersimpan.');
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.editor} onSubmit={submit}>
      <fieldset className={styles.fields} disabled={busy}>
        {fields.map(({ name, label, type, max, optional, readOnly, options }) => {
          const value = String(initial[name] ?? '');
          const labelId = fieldId + '-' + name;
          return (
            <label key={name} className={type === 'textarea' ? styles.full : undefined}>
              <span><span id={labelId}>{label}</span>{optional && <small>Opsional</small>}</span>
              {options ? (
                <select name={name} aria-labelledby={labelId} defaultValue={value} required={!optional}>
                  {Object.entries(options).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
                </select>
              ) : type === 'textarea' ? (
                <textarea name={name} aria-labelledby={labelId} defaultValue={value} rows={3} maxLength={max} required={!optional} />
              ) : (
                <input name={name} aria-labelledby={labelId} type={type || 'text'} defaultValue={value} maxLength={type === 'number' ? undefined : max}
                  min={type === 'number' ? 0 : undefined} max={type === 'number' ? max : undefined}
                  required={!optional} readOnly={readOnly} />
              )}
            </label>
          );
        })}
        <div className={styles.actions}>
          <button className={styles.primary} type="submit">{busy ? 'Menyimpan…' : submitLabel}</button>
          {onCancel && <button className={styles.secondary} type="button" onClick={onCancel}>Batal</button>}
        </div>
      </fieldset>
      {notice && <p className={styles.notice} role="status">{notice}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </form>
  );
}

type Row = { id: number; position: number };

export function Collection<T extends Row>({ entries, fieldList, createEmpty, endpoint, itemLabel, itemStatus, canDelete, request, onChange }: {
  entries: T[];
  fieldList: (existing: boolean) => readonly Field<Omit<T, 'id'>>[];
  createEmpty: (position: number) => Omit<T, 'id'>;
  endpoint: string;
  itemLabel: (entry: T) => string;
  itemStatus?: (entry: T) => string;
  canDelete?: (entry: T) => boolean;
  request: AdminRequest;
  onChange: (update: (entries: T[]) => T[]) => void;
}) {
  const [editing, setEditing] = useState<T | 'new' | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const existing = typeof editing === 'object' ? editing : null;
  const { id: editingId, ...fields } = existing ?? { id: undefined, ...createEmpty(Math.min(9999, Math.max(0, ...entries.map(({ position }) => position)) + 10)) };

  async function save(value: Omit<T, 'id'>) {
    const changed = await request<T>(endpoint + (editingId === undefined ? '' : '/' + editingId), {
      method: editingId === undefined ? 'POST' : 'PUT',
      data: value,
    });
    onChange((current) => [...current.filter(({ id }) => id !== changed.id), changed]
      .sort((a, b) => a.position - b.position || a.id - b.id));
    setEditing(null);
    setNotice('Perubahan tersimpan.');
  }

  async function remove(entry: T) {
    if (!window.confirm('Hapus “' + itemLabel(entry) + '”?')) return;
    setPending(true);
    setError('');
    setNotice('');
    try {
      await request(endpoint + '/' + entry.id, { method: 'DELETE' });
      onChange((current) => current.filter(({ id }) => id !== entry.id));
      setNotice('Entri dihapus.');
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setPending(false);
    }
  }

  function edit(entry: T | 'new') {
    setNotice('');
    setError('');
    setEditing(entry);
  }

  return (
    <>
      {editing ? (
        <div className={styles.editPanel}>
          <h3>{existing ? 'Edit ' + itemLabel(existing) : 'Tambah entri'}</h3>
          <ContentEditor key={editingId ?? 'new'} initial={fields as Omit<T, 'id'>} fields={fieldList(!!existing)}
            submitLabel="Simpan perubahan" onSave={save} onCancel={() => setEditing(null)} />
        </div>
      ) : (
        <>
          <button type="button" className={styles.primary} onClick={() => edit('new')} disabled={pending}><Plus size={16} aria-hidden="true" /> Tambah</button>
          {entries.length ? (
            <ul className={styles.entries}>
              {entries.map((entry) => (
                <li key={entry.id}>
                  <div><strong>{itemLabel(entry)}</strong>{itemStatus && <span>{itemStatus(entry)}</span>}</div>
                  <div className={styles.actions}>
                    <button type="button" className={styles.secondary} aria-label={'Edit ' + itemLabel(entry)} onClick={() => edit(entry)} disabled={pending}>
                      <Pencil size={15} aria-hidden="true" /> Edit
                    </button>
                    {(!canDelete || canDelete(entry)) && (
                      <button type="button" className={styles.delete} aria-label={'Hapus ' + itemLabel(entry)} onClick={() => remove(entry)} disabled={pending}>
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className={styles.empty}>Belum ada entri.</p>}
        </>
      )}
      {notice && <p className={styles.notice} role="status">{notice}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </>
  );
}

export type { Field };
