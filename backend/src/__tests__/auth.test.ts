import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';

describe('Auth', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'password123';

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword, name: 'Test User' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.password).toBeUndefined();
  });

  it('should reject duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: testPassword });

    expect(res.status).toBe(400);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('should reject accessing /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });
});