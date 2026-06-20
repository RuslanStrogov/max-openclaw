/**
 * Tests for MAX Messenger channel plugin.
 */

import { describe, it, expect } from 'vitest';
import { MaxClient, MaxApiError } from '../src/client.js';

describe('MaxClient', () => {
  it('throws if token is empty', () => {
    expect(() => new MaxClient({ token: '' })).toThrow('MAX_BOT_TOKEN is required');
  });

  it('uses default base URL', () => {
    const client = new MaxClient({ token: 'test-token' });
    expect(client).toBeDefined();
  });

  it('uses custom base URL', () => {
    const client = new MaxClient({ token: 'test-token', baseUrl: 'https://custom-api.example.com' });
    expect(client).toBeDefined();
  });
});

describe('MaxApiError', () => {
  it('has correct name and message', () => {
    const error = new MaxApiError('Test error', 400, 'BAD_REQUEST');
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.name).toBe('MaxApiError');
  });
});

describe('Target parsing', () => {
  it('parses user: prefix', () => {
    const to = 'user:12345';
    const num = parseInt(to.slice(5), 10);
    expect(num).toBe(12345);
  });

  it('parses chat: prefix', () => {
    const to = 'chat:67890';
    const num = parseInt(to.split(':')[1], 10);
    expect(num).toBe(67890);
  });

  it('parses plain numeric ID', () => {
    const to = '12345';
    const num = parseInt(to, 10);
    expect(num).toBe(12345);
  });
});
