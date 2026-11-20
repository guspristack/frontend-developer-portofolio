import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, BriefcaseBusiness, FolderOpen, Leaf, LockKeyhole, LogOut, Mail, UserRound } from 'lucide-react';
import { plantCategories, plantImages, projectIcons, type Experience, type ExperienceInput, type Plant, type PlantInput, type Portfolio, type ProfileInput, type Project, type ProjectInput } from '../../shared/content';
import { api, ApiError, errorText } from '../api';
import { ProjectCredit, ResourceState } from '../components';
import { Collection, ContentEditor, type AdminRequest, type Field } from './ContentEditor';
import { Inbox } from './Inbox';
import styles from './Admin.module.css';

type AdminContent = Portfolio & { plants: Plant[] };
type View =
  | { step: 'loading' | 'login' }
  | { step: 'error'; message: string }
  | { step: 'ready'; content: AdminContent };

const sections = [
  { id: 'profile', label: 'Profil', icon: UserRound },
  { id: 'experiences', label: 'Pengalaman', icon: BriefcaseBusiness },
  { id: 'projects', label: 'Proyek', icon: FolderOpen },
  { id: 'plants', label: 'Tumbuh', icon: Leaf },
  { id: 'inbox', label: 'Kotak masuk', icon: Mail },
] as const;
type Section = (typeof sections)[number]['id'];

const profileFields: readonly Field<ProfileInput>[] = [
  { name: 'name', label: 'Nama', max: 100 },
  { name: 'title', label: 'Profesi', max: 110 },
  { name: 'location', label: 'Lokasi', max: 120 },
  { name: 'heroGreeting', label: 'Sapaan', max: 90 },
  { name: 'heroHeadline', label: 'Judul utama', type: 'textarea', max: 120 },
  { name: 'introduction', label: 'Perkenalan', type: 'textarea', max: 450 },
  { name: 'bio', label: 'Tentang saya', type: 'textarea', max: 1600 },
  { name: 'focus', label: 'Fokus', max: 180 },
  { name: 'skills', label: 'Keahlian', max: 200 },
  { name: 'contactNote', label: 'Keterangan kontak', type: 'textarea', max: 450 },
  { name: 'email', label: 'Email publik', type: 'email', max: 254 },
  { name: 'instagram', label: 'Instagram', type: 'url', optional: true, max: 300 },
  { name: 'linkedin', label: 'LinkedIn', type: 'url', optional: true, max: 300 },
  { name: 'github', label: 'GitHub', type: 'url', optional: true, max: 300 },
];
const position = { name: 'position', label: 'Urutan', type: 'number', max: 9999 } as const;
const experienceFields: readonly Field<ExperienceInput>[] = [
  { name: 'period', label: 'Periode', max: 70 },
  { name: 'title', label: 'Judul pengalaman', max: 150 },
  { name: 'description', label: 'Deskripsi', type: 'textarea', max: 1000 },
  position,
];
function projectFields(existing: boolean): readonly Field<ProjectInput>[] {
  return [
    { name: 'name', label: 'Nama proyek', max: 100 },
    { name: 'slug', label: 'Slug unik', max: 54, readOnly: existing },
    { name: 'type', label: 'Jenis proyek', max: 80 },
    { name: 'icon', label: 'Ikon', options: projectIcons },
    { name: 'summary', label: 'Ringkasan', type: 'textarea', max: 240 },
    { name: 'story', label: 'Proses kerja', type: 'textarea', max: 2800 },
    { name: 'role', label: 'Kredit dan peran', max: 200 },
    { name: 'tools', label: 'Alat', max: 180 },
    { name: 'result', label: 'Hasil', type: 'textarea', max: 450 },
    { name: 'status', label: 'Status publikasi', options: { DRAFT: 'Draf', PUBLISHED: 'Terbit' } },
    position,
  ];
}
const plantFields: readonly Field<PlantInput>[] = [
  { name: 'name', label: 'Nama tanaman', max: 100 },
  { name: 'category', label: 'Kategori', options: plantCategories },
  { name: 'image', label: 'Foto dari katalog aset', options: plantImages },
  { name: 'light', label: 'Panduan cahaya', type: 'textarea', max: 650 },
  { name: 'water', label: 'Panduan siram', type: 'textarea', max: 650 },
  position,
];

function Login({ afterLogin }: { afterLogin: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    try {
      await api('/admin/login', { method: 'POST', data });
      await afterLogin();
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.loginShell} id="main-content" tabIndex={-1}>
        <Link className={styles.back} to="/">Portofolio Raka <ArrowUpRight size={15} aria-hidden="true" /></Link>
        <section className={styles.login} aria-labelledby="login-heading">
          <span className={styles.loginIcon}><LockKeyhole size={22} aria-hidden="true" /></span>
          <h1 id="login-heading">Masuk ke panel admin</h1>
          <p>Kelola profil, karya, dan pesan dari portofolio Raka.</p>
          <form onSubmit={submit}>
            <fieldset className={styles.loginFields} disabled={busy}>
              <label><span>Email admin</span><input type="email" name="email" maxLength={254} autoComplete="username" required /></label>
              <label><span>Kata sandi</span><input type="password" name="password" maxLength={256} autoComplete="current-password" required /></label>
              <button type="submit" className={styles.primary}>{busy ? 'Memeriksa…' : 'Masuk'}</button>
            </fieldset>
            {error && <p className={styles.error} role="alert">{error}</p>}
          </form>
        </section>
        <footer className={styles.footer}><ProjectCredit /></footer>
      </main>
    </div>
  );
}

export function Admin() {
  const [view, setView] = useState<View>({ step: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [section, setSection] = useState<Section>('profile');
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api<AdminContent>('/admin/content', { signal: controller.signal }).then((content) => {
      if (!controller.signal.aborted) setView({ step: 'ready', content });
    }, (error) => {
      if (controller.signal.aborted) return;
      setView(error instanceof ApiError && error.status === 401 ? { step: 'login' } : { step: 'error', message: errorText(error) });
    });
    return () => controller.abort();
  }, [attempt]);

  const request: AdminRequest = useCallback(async <T,>(path: string, options?: { method?: string; data?: unknown }) => {
    try {
      return await api<T>(path, options);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) setView({ step: 'login' });
      throw error;
    }
  }, []);

  function changeContent<K extends keyof AdminContent>(key: K, update: (value: AdminContent[K]) => AdminContent[K]) {
    setView((previous) => previous.step === 'ready'
      ? { step: 'ready', content: { ...previous.content, [key]: update(previous.content[key]) } }
      : previous);
  }

  async function logout() {
    setLoggingOut(true);
    setLogoutError('');
    try {
      await request('/admin/logout', { method: 'POST' });
      setView({ step: 'login' });
    } catch (cause) {
      setLogoutError(errorText(cause));
    } finally {
      setLoggingOut(false);
    }
  }

  if (view.step === 'login') return <Login afterLogin={async () => {
    const content = await api<AdminContent>('/admin/content');
    setSection('profile');
    setLogoutError('');
    setView({ step: 'ready', content });
  }} />;
  if (view.step !== 'ready') return <ResourceState loading="Memuat panel admin…" error={view.step === 'error' ? view.message : undefined}
    retry={() => { setView({ step: 'loading' }); setAttempt((value) => value + 1); }} />;
  const { content } = view;
  const current = sections.find(({ id }) => id === section)!;

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.shell}>
          <span className={styles.wordmark}><span>ra.</span>{content.profile.name}</span>
          <div className={styles.actions}>
            <Link className={styles.back} to="/">Lihat portofolio <ArrowUpRight size={15} aria-hidden="true" /></Link>
            <button className={styles.secondary} type="button" disabled={loggingOut} onClick={logout}>
              <LogOut size={16} aria-hidden="true" /> {loggingOut ? 'Keluar…' : 'Keluar'}
            </button>
          </div>
        </div>
      </header>
      <main id="main-content" className={styles.shell + ' ' + styles.dashboard} tabIndex={-1}>
        <div className={styles.intro}><h1>Panel admin</h1><p>Kelola isi portofolio dan pesan pengunjung.</p></div>
        {logoutError && <p className={styles.error} role="alert">{logoutError}</p>}
        <div className={styles.layout}>
          <nav className={styles.navigation} aria-label="Bagian panel admin">
            {sections.map(({ id, label, icon: Icon }) => (
              <button type="button" key={id} aria-current={section === id ? 'page' : undefined} onClick={() => setSection(id)}>
                <Icon size={17} aria-hidden="true" /> {label}
              </button>
            ))}
          </nav>
          <section className={styles.panel} aria-labelledby="admin-section" key={section}>
            <h2 id="admin-section">{current.label}</h2>
            {section === 'profile' && <ContentEditor initial={content.profile} fields={profileFields} submitLabel="Simpan profil" onSave={async (data) => {
              const updated = await request<ProfileInput>('/admin/profile', { method: 'PUT', data });
              changeContent('profile', () => updated);
            }} />}
            {section === 'experiences' && <Collection<Experience> entries={content.experiences} fieldList={() => experienceFields}
              createEmpty={(position) => ({ period: '', title: '', description: '', position })} endpoint="/admin/experiences"
              itemLabel={(item) => item.title} itemStatus={(item) => item.period} request={request}
              onChange={(update) => changeContent('experiences', update)} />}
            {section === 'projects' && <Collection<Project> entries={content.projects} fieldList={projectFields}
              createEmpty={(position) => ({ slug: '', name: '', type: '', icon: 'code', summary: '', story: '', role: '', result: '', tools: '', position, status: 'DRAFT' })}
              endpoint="/admin/projects" itemLabel={(item) => item.name} itemStatus={(item) => item.status === 'PUBLISHED' ? 'Terbit' : 'Draf'}
              canDelete={(item) => item.slug !== 'tumbuh'} request={request} onChange={(update) => changeContent('projects', update)} />}
            {section === 'plants' && <Collection<Plant> entries={content.plants} fieldList={() => plantFields}
              createEmpty={(position) => ({ name: '', category: 'bright', image: 'monstera', light: '', water: '', position })}
              endpoint="/admin/plants" itemLabel={(item) => item.name} itemStatus={(item) => plantCategories[item.category]}
              request={request} onChange={(update) => changeContent('plants', update)} />}
            {section === 'inbox' && <Inbox request={request} />}
          </section>
        </div>
      </main>
      <footer className={styles.shell + ' ' + styles.footer}><ProjectCredit /></footer>
    </div>
  );
}
