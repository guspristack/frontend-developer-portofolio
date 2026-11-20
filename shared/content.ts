import { z } from 'zod';

const line = (max: number) => z.string().trim().min(1).max(max);
const position = z.number().int().min(0).max(9999);
const socialLink = (domain: string) => z.string().trim().max(300).refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && [domain, 'www.' + domain].includes(url.hostname);
  } catch {
    return false;
  }
}, 'Gunakan URL HTTPS dari platform yang sesuai.');

export const profileSchema = z.strictObject({
  name: line(100),
  title: line(110),
  location: line(120),
  heroGreeting: line(90),
  heroHeadline: line(120),
  introduction: line(450),
  bio: line(1600),
  focus: line(180),
  skills: line(200),
  contactNote: line(450),
  email: z.string().trim().max(254).pipe(z.email()),
  instagram: socialLink('instagram.com'),
  linkedin: socialLink('linkedin.com'),
  github: socialLink('github.com'),
});

export const experienceSchema = z.strictObject({
  period: line(70),
  title: line(150),
  description: line(1000),
  position,
});

export const projectIcons = { leaf: 'Daun', calendar: 'Kalender', panels: 'Panel', code: 'Kode' } as const;
export const projectSchema = z.strictObject({
  slug: z.string().min(2).max(54).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Gunakan huruf kecil, angka, dan tanda hubung.'),
  name: line(100),
  type: line(80),
  icon: z.enum(['leaf', 'calendar', 'panels', 'code']),
  summary: line(240),
  story: line(2800),
  role: line(200),
  result: line(450),
  tools: line(180),
  position,
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

export const plantCategories = { bright: 'Cahaya terang', low: 'Cahaya rendah' } as const;
export const plantImages = { monstera: 'Monstera', snake: 'Lidah mertua', pothos: 'Sirih gading' } as const;
export const plantSchema = z.strictObject({
  name: line(100),
  category: z.enum(['bright', 'low']),
  image: z.enum(['monstera', 'snake', 'pothos']),
  light: line(650),
  water: line(650),
  position,
});

export const messageSchema = z.strictObject({
  name: line(100),
  email: z.string().trim().max(254).pipe(z.email()),
  body: z.string().trim().min(10).max(3000),
});

export const loginSchema = z.strictObject({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  password: z.string().min(1).max(256),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type PlantInput = z.infer<typeof plantSchema>;
export type Experience = ExperienceInput & { id: number };
export type Project = ProjectInput & { id: number };
export type Plant = PlantInput & { id: number };
export type Portfolio = { profile: ProfileInput; experiences: Experience[]; projects: Project[] };
export type Message = z.infer<typeof messageSchema> & { id: number; createdAt: string; readAt: string | null };
