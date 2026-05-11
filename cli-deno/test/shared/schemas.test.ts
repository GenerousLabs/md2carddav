import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ContactSchema } from '@subject/shared.schemas.ts';

describe('ContactSchema', () => {
  it('parses valid minimal contact', () => {
    const result = ContactSchema.safeParse({ uid: 'abc', title: 'Jane Doe' });
    assert.equal(result.success, true);
  });

  it('parses contact with all optional fields', () => {
    const result = ContactSchema.safeParse({
      uid: 'abc',
      title: 'Jane Doe',
      company: 'Acme',
      name: { first: 'Jane', last: 'Doe' },
      nickname: 'JD',
      photo: 'photos/jane.jpg',
      phones: ['+1234', { type: 'work', phone: '+5678' }],
      emails: ['jane@example.com', { type: 'work', email: 'jane@work.com' }],
      urls: ['https://example.com', { type: 'mastodon', url: 'https://mastodon.social/@jane' }],
      addresses: [{ city: 'Springfield', country: 'USA' }],
      desc: 'Notes about Jane',
    });
    assert.equal(result.success, true);
  });

  it('rejects missing uid', () => {
    const result = ContactSchema.safeParse({ title: 'Jane Doe' });
    assert.equal(result.success, false);
  });

  it('rejects empty uid', () => {
    const result = ContactSchema.safeParse({ uid: '', title: 'Jane Doe' });
    assert.equal(result.success, false);
  });

  it('rejects missing title', () => {
    const result = ContactSchema.safeParse({ uid: 'abc' });
    assert.equal(result.success, false);
  });

  it('rejects whitespace-only title', () => {
    const result = ContactSchema.safeParse({ uid: 'abc', title: '   ' });
    assert.equal(result.success, false);
  });

  it('rejects emails as a string (must be array)', () => {
    const result = ContactSchema.safeParse({ uid: 'abc', title: 'Jane', emails: 'jane@example.com' });
    assert.equal(result.success, false);
  });

  it('rejects empty address object (all fields undefined)', () => {
    const result = ContactSchema.safeParse({ uid: 'abc', title: 'Jane', addresses: [{}] });
    assert.equal(result.success, false);
  });

  it('accepts address with only city set', () => {
    const result = ContactSchema.safeParse({ uid: 'abc', title: 'Jane', addresses: [{ city: 'Springfield' }] });
    assert.equal(result.success, true);
  });
});
