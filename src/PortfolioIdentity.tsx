import { faGithub, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import type { ProfileInput } from '../shared/content';
import styles from './PortfolioIdentity.module.css';

const platforms = [
  ['instagram', 'Instagram', 'https://www.instagram.com/', faInstagram],
  ['linkedin', 'LinkedIn', 'https://www.linkedin.com/', faLinkedin],
  ['github', 'GitHub', 'https://github.com/', faGithub],
] as const;

export function SocialLinks({ profile }: { profile: ProfileInput }) {
  const note = platforms.some(([key]) => !profile[key]) ? 'raka-social-note' : undefined;
  return (
    <div className={styles.socials}>
      <h3>Media sosial</h3>
      <ul aria-label={'Media sosial ' + profile.name} aria-describedby={note}>
        {platforms.map(([key, name, website, { icon }]) => {
          const [width, height, , , pathData] = icon;
          const paths = Array.isArray(pathData) ? pathData : [pathData];
          return (
            <li key={key}>
              <a href={profile[key] || website} aria-label={name} title={name} target="_blank" rel="noopener noreferrer">
                <svg viewBox={`0 0 ${width} ${height}`} width="19" height="19" fill="currentColor" aria-hidden="true" focusable="false">
                  {paths.map((path) => <path key={path} d={path} />)}
                </svg>
              </a>
            </li>
          );
        })}
      </ul>
      {note && <p id={note}>Tautan profil yang belum diisi membuka laman platform.</p>}
    </div>
  );
}
