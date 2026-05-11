import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getContactFromYamlFrontmatterData } from '@subject/services/md/services/contacts/contacts.service.ts';

const base = { uid: 'test-uid', title: 'Jane Doe' };

const assertValid = (input: any) => {
  const result = getContactFromYamlFrontmatterData(input);
  assert.equal(result.success, true, `Expected valid but got: ${JSON.stringify(result)}`);
};

const assertInvalid = (input: any) => {
  const result = getContactFromYamlFrontmatterData(input);
  assert.equal(result.success, false, `Expected invalid but got: ${JSON.stringify(result)}`);
  if (!result.success) {
    assert.ok(typeof result.code === 'string');
    assert.ok(typeof result.error === 'string');
  }
};

describe('getContactFromYamlFrontmatterData', () => {
  describe('valid contacts', () => {
    it('accepts minimal contact with uid and title', () => {
      assertValid(base);
    });

    it('accepts phone as plain string', () => {
      assertValid({ ...base, phones: ['+1 123 123 1234'] });
    });

    it('accepts phone as typed object', () => {
      assertValid({ ...base, phones: [{ type: 'mobile', phone: '+1 123 123 1234' }] });
    });

    it('accepts email as plain string', () => {
      assertValid({ ...base, emails: ['jane@example.com'] });
    });

    it('accepts email as typed object', () => {
      assertValid({ ...base, emails: [{ type: 'work', email: 'jane@example.com' }] });
    });

    it('accepts URL as plain string', () => {
      assertValid({ ...base, urls: ['https://example.com'] });
    });

    it('accepts URL as typed object', () => {
      assertValid({ ...base, urls: [{ type: 'mastodon', url: 'https://example.com' }] });
    });

    it('accepts address with all subfields', () => {
      assertValid({
        ...base,
        addresses: [{
          type: 'work',
          line1: '123 Main St',
          line2: 'Apt 2',
          city: 'Springfield',
          state: 'IL',
          postcode: '62701',
          country: 'USA',
        }],
      });
    });

    it('accepts name with string components', () => {
      assertValid({ ...base, name: { first: 'Jane', last: 'Doe', middle: 'Anne', prefix: 'Dr.', suffix: 'Jr.' } });
    });

    it('accepts name components as arrays', () => {
      assertValid({ ...base, name: { first: ['Jane', 'Mary'], last: ['Doe'] } });
    });

    it('accepts company field', () => {
      assertValid({ ...base, company: 'Acme Corp' });
    });

    it('accepts nickname field', () => {
      assertValid({ ...base, nickname: 'JD' });
    });

    it('accepts desc field', () => {
      assertValid({ ...base, desc: 'Some notes about this person.' });
    });

    it('accepts photo field', () => {
      assertValid({ ...base, photo: 'photos/jane.jpg' });
    });

    it('accepts mixed phone array with strings and objects', () => {
      assertValid({
        ...base,
        phones: ['+1111111111', { type: 'work', phone: '+2222222222' }],
      });
    });
  });

  describe('invalid contacts', () => {
    it('rejects contact with missing uid', () => {
      assertInvalid({ title: 'Jane Doe' });
    });

    it('rejects contact with empty uid', () => {
      assertInvalid({ uid: '', title: 'Jane Doe' });
    });

    it('rejects contact with missing title', () => {
      assertInvalid({ uid: 'test-uid' });
    });

    it('rejects contact with whitespace-only title', () => {
      assertInvalid({ uid: 'test-uid', title: '   ' });
    });

    it('rejects emails as a plain string instead of array', () => {
      assertInvalid({ ...base, emails: 'jane@example.com' });
    });

    it('rejects phones as a plain string instead of array', () => {
      assertInvalid({ ...base, phones: '+1234567890' });
    });

    it('rejects address with no fields populated', () => {
      assertInvalid({ ...base, addresses: [{}] });
    });

    it('rejects email object with missing email field', () => {
      assertInvalid({ ...base, emails: [{ type: 'work' }] });
    });
  });
});
