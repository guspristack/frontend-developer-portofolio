import { ArrowDown, ArrowUpLeft, Droplets, Leaf, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { CopyWorkLink, Overlay, ProjectCredit, ResourceState, scrollToSection } from '../components';
import { useResource } from '../api';
import { plantCategories, type Plant } from '../../shared/content';
import heroImage from '../images/tumbuh-plants.webp';
import monstera from '../images/tumbuh-monstera.webp';
import snake from '../images/tumbuh-snake.webp';
import pothos from '../images/tumbuh-pothos.webp';
import styles from './TumbuhDemo.module.css';

const pictures = { monstera, snake, pothos };
const categories = [
  ['all', 'Semua'], ['bright', plantCategories.bright], ['low', plantCategories.low],
] as const;

export function TumbuhDemo() {
  const [category, setCategory] = useState<(typeof categories)[number][0]>('all');
  const [selected, setSelected] = useState<Plant | null>(null);
  const { data, error, retry } = useResource<Plant[]>('/plants');
  const visible = data?.filter((plant) => category === 'all' || plant.category === category) ?? [];
  return (
    <div className={styles.page}>
      <header className={styles.header + ' ' + styles.shell}>
        <span><Leaf size={22} aria-hidden="true" /> Tumbuh</span>
        <Link to="/"><ArrowUpLeft size={15} aria-hidden="true" /> Portofolio Raka</Link>
      </header>
      {!data ? <ResourceState loading="Memuat katalog…" error={error} retry={retry} /> : (
      <main id="main-content" className={styles.shell} tabIndex={-1}>
        <section className={styles.hero}>
          <div>
            <p>Tanaman untuk ruang sehari-hari</p>
            <h1>Hijau di rumah.</h1>
            <p>Pilih tanaman berdasarkan cahaya di rumahmu dan lihat cara merawatnya.</p>
            <button type="button" onClick={() => scrollToSection('tumbuh-katalog')}>Jelajahi katalog <ArrowDown size={17} aria-hidden="true" /></button>
          </div>
          <img src={heroImage} alt="Tanaman monstera dan sirih gading di dekat jendela yang hangat." fetchPriority="high" />
        </section>
        <section className={styles.catalog} aria-labelledby="tumbuh-katalog">
          <div className={styles.catalogHead}>
            <h2 id="tumbuh-katalog" tabIndex={-1}>Katalog tanaman</h2>
            <div className={styles.filters} role="group" aria-label="Saring berdasarkan kebutuhan cahaya">
              {categories.map(([value, label]) => <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{label}</button>)}
            </div>
          </div>
          <div className={styles.grid}>
            {visible.map((plant) => (
              <button type="button" className={styles.card} key={plant.id} onClick={() => setSelected(plant)} aria-label={'Panduan ' + plant.name}>
                <img src={pictures[plant.image]} alt="" loading="lazy" />
                <strong>{plant.name}</strong><span>{plantCategories[plant.category]} · Panduan perawatan</span>
              </button>
            ))}
          </div>
          {!visible.length && <p role="status">Belum ada tanaman untuk pilihan ini.</p>}
          <CopyWorkLink label="Salin tautan demo Tumbuh" />
        </section>
      </main>
      )}
      <footer className={styles.shell + ' ' + styles.footer}><span>Prototipe Tumbuh oleh Raka Aditya · Foto generatif</span><ProjectCredit /></footer>
      {selected && (
        <Overlay className={styles.dialog} label={'Panduan ' + selected.name} onClose={() => setSelected(null)}>
          <div className={styles.detail}>
            <button type="button" aria-label="Tutup panduan" onClick={() => setSelected(null)} autoFocus><X size={21} aria-hidden="true" /></button>
            <img src={pictures[selected.image]} alt={selected.name + ' dalam pot'} />
            <h2>{selected.name}</h2>
            <p><Sun size={18} aria-hidden="true" />{selected.light}</p>
            <p><Droplets size={18} aria-hidden="true" />{selected.water}</p>
          </div>
        </Overlay>
      )}
    </div>
  );
}
