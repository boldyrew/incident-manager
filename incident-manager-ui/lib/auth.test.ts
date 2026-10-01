import { demoLoginRequest, loginRequest } from './auth';

function mockFetch(ok: boolean, json: () => Promise<unknown>) {
  const fetchMock = jest.fn().mockResolvedValue({ ok, json });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const response = { accessToken: 'tok', user: { id: 'u1' } };

describe('loginRequest', () => {
  it('posts credentials and returns the response', async () => {
    const fetchMock = mockFetch(true, () => Promise.resolve(response));

    await expect(loginRequest('a@b.c', 'pw')).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.c', password: 'pw' }),
    });
  });

  it('surfaces the server error message', async () => {
    mockFetch(false, () => Promise.resolve({ message: 'Invalid credentials' }));
    await expect(loginRequest('a@b.c', 'bad')).rejects.toThrow('Invalid credentials');
  });

  it('falls back to a default message when the body is not JSON', async () => {
    mockFetch(false, () => Promise.reject(new SyntaxError('bad json')));
    await expect(loginRequest('a@b.c', 'bad')).rejects.toThrow('Invalid credentials');
  });
});

describe('demoLoginRequest', () => {
  it('posts the role', async () => {
    const fetchMock = mockFetch(true, () => Promise.resolve(response));
    await demoLoginRequest('ANALYST');
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3001/auth/demo');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ role: 'ANALYST' });
  });

  it('surfaces the server error message or a default', async () => {
    mockFetch(false, () => Promise.resolve({ message: 'Not Found' }));
    await expect(demoLoginRequest('ADMIN')).rejects.toThrow('Not Found');
    mockFetch(false, () => Promise.resolve({}));
    await expect(demoLoginRequest('ADMIN')).rejects.toThrow('Demo login failed');
  });
});
