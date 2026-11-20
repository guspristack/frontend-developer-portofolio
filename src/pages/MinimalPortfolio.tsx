import { ArrowDown, ArrowUpRight, CalendarDays, ChevronDown, Code2, Leaf, LockKeyhole, Mail, PanelsTopLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import '@fontsource-variable/manrope';
import type { Portfolio } from '../../shared/content';
import { useResource } from '../api';
import { ProjectCredit, ResourceState, scrollToSection, SectionNav } from '../components';
import { SocialLinks } from '../PortfolioIdentity';
import portrait from '../images/minimal-portrait.webp';
import tumbuhDesktop from '../images/tumbuh-tampilan-desktop.webp';
import tumbuhPhone from '../images/tumbuh-tampilan-ponsel.webp';
import styles from './MinimalPortfolio.module.css';
import { ContactForm } from './ContactForm';

const projectIcons = { leaf: Leaf, calendar: CalendarDays, panels: PanelsTopLeft, code: Code2 };

const navigation = [
  { title: 'Profil', target: 'raka-tentang' },
  { title: 'Pengalaman', target: 'raka-pengalaman' },
  { title: 'Proyek', target: 'raka-proyek' },
  { title: 'Kontak', target: 'raka-kontak' },
];

export function MinimalPortfolio() {
  const [open, setOpen] = useState<number | null>(null);
  const { data, error, retry } = useResource<Portfolio>('/portfolio');
  if (!data) return <ResourceState loading="Memuat portofolio…" error={error} retry={retry} />;
  const { profile, projects, experiences } = data;
  const exampleEmail = profile.email.endsWith('.example');

  return (
    <div className={styles.page}>
      <header className={styles.header} id="raka-awal" tabIndex={-1}>
        <div className={styles.shell}>
          <div className={styles.wordmark}><span>ra.</span> {profile.name}</div>
          <SectionNav label="Navigasi portofolio Raka" items={navigation} />
          <Link to="/admin" className={styles.back}><LockKeyhole size={15} aria-hidden="true" /> Admin</Link>
        </div>
      </header>
      <main id="main-content" className={styles.shell} tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="raka-judul">
          <div className={styles.intro}>
            <p className={styles.label}><Code2 size={17} aria-hidden="true" /> {profile.title}</p>
            <h1 id="raka-judul" tabIndex={-1}>{profile.heroGreeting}<br /><em>{profile.heroHeadline}</em></h1>
            <p className={styles.description}>{profile.introduction}</p>
            <div className={styles.actions}>
              <button type="button" className={styles.cta} onClick={() => scrollToSection('raka-proyek')}>Lihat proyek <ArrowDown size={17} aria-hidden="true" /></button>
              <button type="button" className={styles.secondary} onClick={() => scrollToSection('raka-kontak')}>Hubungi Raka</button>
            </div>
          </div>
          <figure className={styles.portrait}>
            <img src={portrait} alt="Potret ilustratif Raka dengan kemeja luar warna taupe." fetchPriority="high" />
            <figcaption><span>{profile.name}</span><span>{profile.location}</span></figcaption>
          </figure>
        </section>

        <section className={styles.works} aria-labelledby="raka-proyek">
          <h2 id="raka-proyek" tabIndex={-1}>Proyek pilihan</h2>
          <p className={styles.sectionNote}>{projects.length ? 'Buka proyek untuk melihat proses dan kreditnya.' : 'Belum ada proyek yang diterbitkan.'}</p>
          <div className={styles.list}>
            {projects.map(({ id, slug, name, type, icon, summary, story, role, result, tools }) => {
              const expanded = open === id;
              const Icon = projectIcons[icon];
              return (
                <article key={id} className={styles.project}>
                  <h3>
                    <button type="button" aria-expanded={expanded} aria-controls={'raka-' + id} onClick={() => setOpen(expanded ? null : id)}>
                      <span className={styles.projectIcon + ' ' + styles[icon]}><Icon size={24} strokeWidth={1.7} aria-hidden="true" /></span>
                      <span className={styles.projectName}><strong>{name}</strong><span>{summary}</span></span>
                      <span className={styles.projectType}>{type}</span>
                      <ChevronDown className={styles.chevron} size={20} aria-hidden="true" />
                    </button>
                  </h3>
                  <div className={styles.projectDetail} id={'raka-' + id} hidden={!expanded}>
                    <p>{story}</p>
                    <dl className={styles.credits}>
                      <div><dt>Kredit &amp; peran</dt><dd>{role}</dd></div>
                      <div><dt>Hasil</dt><dd>{result}</dd></div>
                      <div><dt>Alat</dt><dd>{tools}</dd></div>
                      <div><dt>Status</dt><dd>Proyek konsep</dd></div>
                    </dl>
                    {slug === 'tumbuh' && (
                      <div className={styles.tumbuhEvidence}>
                        <div className={styles.tumbuhShots}>
                          <figure><a href={tumbuhDesktop} target="_blank" rel="noreferrer" aria-label="Perbesar tampilan Tumbuh di desktop"><img src={tumbuhDesktop} width="1366" height="900" alt="Tampilan Tumbuh di desktop dengan gambar utama dan tiga kartu tanaman sejajar." loading="lazy" /></a><figcaption>Desktop</figcaption></figure>
                          <figure><a href={tumbuhPhone} target="_blank" rel="noreferrer" aria-label="Perbesar tampilan Tumbuh di ponsel"><img src={tumbuhPhone} width="390" height="856" alt="Tampilan Tumbuh di ponsel dengan gambar utama bertumpuk dan katalog dua kolom." loading="lazy" /></a><figcaption>Ponsel</figcaption></figure>
                        </div>
                        <Link to="/tumbuh" className={styles.secondary}>Coba demo Tumbuh <ArrowUpRight size={16} aria-hidden="true" /></Link>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section className={styles.about} aria-labelledby="raka-tentang">
          <div><h2 id="raka-tentang" tabIndex={-1}>Tentang saya</h2><p>{profile.name} · {profile.location}</p></div>
          <div className={styles.aboutBody}>
            <p>{profile.bio}</p>
            <dl className={styles.facts}>
              <div><dt>Fokus</dt><dd>{profile.focus}</dd></div>
              <div><dt>Keahlian</dt><dd>{profile.skills}</dd></div>
            </dl>
          </div>
        </section>
        <section className={styles.experience} aria-labelledby="raka-pengalaman">
          <div><h2 id="raka-pengalaman" tabIndex={-1}>Pengalaman</h2><p className={styles.sectionNote}>Riwayat contoh untuk profil fiktif.</p></div>
          <ol className={styles.timeline}>
            {experiences.map(({ id, period, title, description }) => <li key={id}><span>{period}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}
          </ol>
        </section>
        <section className={styles.contact} aria-labelledby="raka-kontak">
          <div><h2 id="raka-kontak" tabIndex={-1}>Kontak</h2><p>{profile.contactNote}</p></div>
          <div>
            {exampleEmail ? <p>Gunakan formulir untuk menghubungi saya.</p> : <a href={'mailto:' + profile.email}><Mail size={17} aria-hidden="true" />{profile.email}</a>}
            <SocialLinks profile={profile} />
            <ContactForm />
          </div>
        </section>
      </main>
      <footer className={styles.footer + ' ' + styles.shell}>
        <div className={styles.credit}><span>Portofolio fiktif · Potret generatif</span><ProjectCredit /></div>
        <button type="button" onClick={() => scrollToSection('raka-awal')}>Kembali ke atas <ArrowUpRight size={16} aria-hidden="true" /></button>
      </footer>
    </div>
  );
}
