import { Router } from 'express';
import { z } from 'zod';
import { experienceSchema, messageSchema, plantSchema, profileSchema, projectSchema } from '../shared/content';
import { prisma } from './database';
import { contentId, HttpError, limitRequests, validate } from './http';

const order = [{ position: 'asc' }, { id: 'asc' }] as const;

function withoutId<T extends { id: number }>({ id: _id, ...fields }: T) {
  return fields;
}

export const publicRoutes = Router();

publicRoutes.get('/portfolio', async (_req, res) => {
  const [profile, experiences, projects] = await Promise.all([
    prisma.profile.findUnique({ where: { id: 1 } }),
    prisma.experience.findMany({ orderBy: [...order] }),
    prisma.project.findMany({ where: { status: 'PUBLISHED' }, orderBy: [...order] }),
  ]);
  if (!profile) throw new HttpError(503, 'Konten portofolio belum tersedia.');
  res.json({ profile: withoutId(profile), experiences, projects });
});

publicRoutes.get('/plants', async (_req, res) => {
  const project = await prisma.project.findUnique({ where: { slug: 'tumbuh' }, select: { status: true } });
  if (project?.status !== 'PUBLISHED') throw new HttpError(404, 'Katalog Tumbuh belum diterbitkan.');
  res.json(await prisma.plant.findMany({ orderBy: [...order] }));
});

publicRoutes.post('/messages', limitRequests(5, 30 * 60 * 1000, 'Terlalu banyak pesan dari perangkat ini. Coba lagi nanti.'), async (req, res) => {
  const data = validate(messageSchema, req.body);
  await prisma.message.create({ data });
  res.status(201).json({ received: true });
});

export const adminRoutes = Router();

adminRoutes.get('/content', async (_req, res) => {
  const [profile, experiences, projects, plants] = await Promise.all([
    prisma.profile.findUnique({ where: { id: 1 } }),
    prisma.experience.findMany({ orderBy: [...order] }),
    prisma.project.findMany({ orderBy: [...order] }),
    prisma.plant.findMany({ orderBy: [...order] }),
  ]);
  if (!profile) throw new HttpError(503, 'Jalankan pengisian data awal portofolio.');
  res.json({ profile: withoutId(profile), experiences, projects, plants });
});

adminRoutes.get('/messages', async (req, res) => {
  const cursor = req.query.before;
  if (cursor !== undefined && typeof cursor !== 'string') throw new HttpError(400, 'Halaman pesan tidak valid.');
  const messages = await prisma.message.findMany({
    where: cursor ? { id: { lt: contentId(cursor) } } : undefined,
    orderBy: { id: 'desc' },
    take: 50,
  });
  res.json(messages);
});

adminRoutes.put('/profile', async (req, res) => {
  const data = validate(profileSchema, req.body);
  const profile = await prisma.profile.update({ where: { id: 1 }, data });
  res.json(withoutId(profile));
});

adminRoutes.post('/experiences', async (req, res) => {
  const data = validate(experienceSchema, req.body);
  res.status(201).json(await prisma.experience.create({ data }));
});

adminRoutes.put('/experiences/:id', async (req, res) => {
  const data = validate(experienceSchema, req.body);
  res.json(await prisma.experience.update({ where: { id: contentId(req.params.id) }, data }));
});

adminRoutes.delete('/experiences/:id', async (req, res) => {
  await prisma.experience.delete({ where: { id: contentId(req.params.id) } });
  res.sendStatus(204);
});

adminRoutes.post('/projects', async (req, res) => {
  const data = validate(projectSchema, req.body);
  res.status(201).json(await prisma.project.create({ data }));
});

adminRoutes.put('/projects/:id', async (req, res) => {
  const { slug, ...data } = validate(projectSchema, req.body);
  const id = contentId(req.params.id);
  const project = await prisma.project.findUnique({ where: { id }, select: { slug: true } });
  if (!project) throw new HttpError(404, 'Data tidak ditemukan.');
  if (project.slug !== slug) throw new HttpError(400, 'Slug proyek yang sudah dibuat tetap dipakai.');
  res.json(await prisma.project.update({ where: { id }, data }));
});

adminRoutes.delete('/projects/:id', async (req, res) => {
  const id = contentId(req.params.id);
  const result = await prisma.project.deleteMany({ where: { id, slug: { not: 'tumbuh' } } });
  if (!result.count) throw new HttpError(404, 'Proyek tidak tersedia untuk dihapus.');
  res.sendStatus(204);
});

adminRoutes.post('/plants', async (req, res) => {
  const data = validate(plantSchema, req.body);
  res.status(201).json(await prisma.plant.create({ data }));
});

adminRoutes.put('/plants/:id', async (req, res) => {
  const data = validate(plantSchema, req.body);
  res.json(await prisma.plant.update({ where: { id: contentId(req.params.id) }, data }));
});

adminRoutes.delete('/plants/:id', async (req, res) => {
  await prisma.plant.delete({ where: { id: contentId(req.params.id) } });
  res.sendStatus(204);
});

adminRoutes.patch('/messages/:id', async (req, res) => {
  const { read } = validate(z.strictObject({ read: z.boolean() }), req.body);
  const id = contentId(req.params.id);
  res.json(await prisma.message.update({ where: { id }, data: { readAt: read ? new Date() : null } }));
});

adminRoutes.delete('/messages/:id', async (req, res) => {
  await prisma.message.delete({ where: { id: contentId(req.params.id) } });
  res.sendStatus(204);
});
