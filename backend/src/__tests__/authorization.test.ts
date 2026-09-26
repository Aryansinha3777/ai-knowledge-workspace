import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';

describe('Authorization', () => {
  const userAEmail = `usera-${Date.now()}@example.com`;
  const userBEmail = `userb-${Date.now()}@example.com`;
  const password = 'password123';

  let tokenA: string;
  let tokenB: string;
  let workspaceIdA: string;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({ email: userAEmail, password });
    await request(app).post('/api/auth/register').send({ email: userBEmail, password });

    const loginA = await request(app).post('/api/auth/login').send({ email: userAEmail, password });
    const loginB = await request(app).post('/api/auth/login').send({ email: userBEmail, password });

    tokenA = loginA.body.data.token;
    tokenB = loginB.body.data.token;

    const wsRes = await request(app)
      .post('/api/workspaces')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'User A Workspace' });

    workspaceIdA = wsRes.body.data.id;
  });

  afterAll(async () => {
    await prisma.workspace.deleteMany({ where: { id: workspaceIdA } });
    await prisma.user.deleteMany({ where: { email: { in: [userAEmail, userBEmail] } } });
    await prisma.$disconnect();
  });

  it('should allow user A to access their own workspace', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceIdA}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
  });

  it('should NOT allow user B to access user A\'s workspace', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceIdA}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
  });

  it('should NOT allow user B to delete user A\'s workspace', async () => {
    const res = await request(app)
      .delete(`/api/workspaces/${workspaceIdA}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
  });

  it('should not leak user A\'s workspace in user B\'s workspace list', async () => {
    const res = await request(app)
      .get('/api/workspaces')
      .set('Authorization', `Bearer ${tokenB}`);

    const ids = res.body.data.map((w: any) => w.id);
    expect(ids).not.toContain(workspaceIdA);
  });
});