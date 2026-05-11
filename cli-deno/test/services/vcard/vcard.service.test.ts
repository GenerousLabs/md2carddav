import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getUidFromVcard,
  generateContactFromVcard,
  generateVcardFromContact,
  areVCardsEquivalent,
  _getFilenames,
} from '@subject/services/vcard/vcard.service.ts';
import { mockContext } from '../../helpers/mock-context.ts';

const ctx = mockContext();

// All VCard strings use \r\n per the RFC
const makeVCard = (props: string) =>
  `BEGIN:VCARD\r\nVERSION:3.0\r\n${props}END:VCARD`;

describe('getUidFromVcard', () => {
  it('returns UID from UID: line', () => {
    const result = getUidFromVcard('BEGIN:VCARD\nUID:abc-123\nEND:VCARD');
    assert.deepEqual(result, { success: true, result: 'abc-123' });
  });

  it('handles UID;VALUE=uri: format', () => {
    const result = getUidFromVcard('BEGIN:VCARD\nUID;VALUE=uri:urn:uuid:xyz\nEND:VCARD');
    assert.deepEqual(result, { success: true, result: 'urn:uuid:xyz' });
  });

  it('handles trailing CRLF on UID line', () => {
    const result = getUidFromVcard('BEGIN:VCARD\r\nUID:abc-123\r\nEND:VCARD');
    assert.deepEqual(result, { success: true, result: 'abc-123' });
  });

  it('returns vcard.nouid for VCard without UID', () => {
    const result = getUidFromVcard('BEGIN:VCARD\nFN:No UID\nEND:VCARD');
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.code, 'vcard.nouid');
  });

  it('returns vcard.invalid for non-string input', () => {
    const result = getUidFromVcard(null as any);
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.code, 'vcard.invalid');
  });
});

describe('generateContactFromVcard', () => {
  it('extracts uid and title from a simple VCard', () => {
    const vcf = makeVCard('UID:test-001\r\nFN:Jane Doe\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.equal(result.result.data.uid, 'test-001');
    assert.equal(result.result.data.title, 'Jane Doe');
  });

  it('extracts name components from N property', () => {
    const vcf = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nN:Doe;Jane;Anne;Dr.;\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    const { name } = result.result.data;
    assert.equal(name?.last, 'Doe');
    assert.equal(name?.first, 'Jane');
    assert.equal(name?.middle, 'Anne');
    assert.equal(name?.prefix, 'Dr.');
  });

  it('extracts plain phone as string', () => {
    const vcf = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nTEL:+1234567890\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.deepEqual(result.result.data.phones, ['+1234567890']);
  });

  it('extracts typed phone as object', () => {
    const vcf = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nTEL;TYPE=work:+1234567890\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.deepEqual(result.result.data.phones, [{ phone: '+1234567890', type: 'work' }]);
  });

  it('extracts multiple phones', () => {
    const vcf = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nTEL:+1111111111\r\nTEL;TYPE=work:+2222222222\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.equal(result.result.data.phones?.length, 2);
  });

  it('extracts plain email as string', () => {
    const vcf = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nEMAIL:jane@example.com\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.deepEqual(result.result.data.emails, ['jane@example.com']);
  });

  it('extracts typed email as object', () => {
    const vcf = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nEMAIL;TYPE=work:jane@work.com\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.deepEqual(result.result.data.emails, [{ email: 'jane@work.com', type: 'work' }]);
  });

  it('extracts address fields', () => {
    const vcf = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nADR;TYPE=work:;;123 Main St;Springfield;IL;62701;USA\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    const addr = result.result.data.addresses?.[0];
    assert.equal(addr?.line1, '123 Main St');
    assert.equal(addr?.city, 'Springfield');
    assert.equal(addr?.state, 'IL');
    assert.equal(addr?.postcode, '62701');
    assert.equal(addr?.country, 'USA');
    assert.equal(addr?.type, 'work');
  });

  it('extracts URL', () => {
    const vcf = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nURL:https://janedoe.com\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.deepEqual(result.result.data.urls, ['https://janedoe.com']);
  });

  it('extracts notes separately when returnNotesSeparately=true (default)', () => {
    const vcf = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nNOTE:Hello world\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.equal(result.result.notes, 'Hello world');
    assert.equal((result.result.data as any).desc, undefined);
  });

  it('inlines notes into desc when returnNotesSeparately=false', () => {
    const vcf = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nNOTE:Hello world\r\n');
    const result = generateContactFromVcard(ctx, vcf, false);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.equal(result.result.data.desc, 'Hello world');
  });

  it('extracts company from ORG property', () => {
    const vcf = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nORG:Acme Corp\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.equal(result.result.data.company, 'Acme Corp');
  });

  it('returns filenames with slugified title and uid', () => {
    const vcf = makeVCard('UID:test-uid-001\r\nFN:Jane Doe\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, true);
    if (!result.success) throw new Error('Expected success');
    assert.deepEqual(result.result.filenames, ['jane-doe', 'test-uid-001']);
  });

  it('returns vcard.uidnotstring for VCard without UID', () => {
    const vcf = makeVCard('FN:No UID Person\r\n');
    const result = generateContactFromVcard(ctx, vcf);
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.code, 'vcard.uidnotstring');
  });
});

describe('generateVcardFromContact', () => {
  it('generates BEGIN/END envelope with VERSION 4.0', async () => {
    const vcard = await generateVcardFromContact('/tmp', { uid: '1', title: 'Jane Doe' });
    assert.ok(vcard.startsWith('BEGIN:VCARD\r\n'));
    assert.ok(vcard.endsWith('END:VCARD'));
    assert.ok(vcard.includes('VERSION:4.0'));
  });

  it('auto-splits two-word title into first and last name', async () => {
    const vcard = await generateVcardFromContact('/tmp', { uid: '1', title: 'Jane Doe' });
    assert.equal(vcard, 'BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Jane Doe\r\nN:Doe;Jane;;;\r\nUID:1\r\nEND:VCARD');
  });

  it('uses explicit name components when provided', async () => {
    const vcard = await generateVcardFromContact('/tmp', {
      uid: '1',
      title: 'Jane Doe',
      name: { first: 'Janis', last: 'Donis' },
    });
    assert.ok(vcard.includes('N:Donis;Janis;;;'));
    assert.ok(vcard.includes('FN:Jane Doe'));
  });

  it('writes typed phone with TYPE parameter', async () => {
    const vcard = await generateVcardFromContact('/tmp', {
      uid: '1',
      title: 'Jane Doe',
      phones: [{ type: 'mobile', phone: '+1 123 12345' }],
    });
    assert.ok(vcard.includes('TEL;TYPE=mobile:+1 123 12345'));
  });

  it('writes plain phone string without TYPE', async () => {
    const vcard = await generateVcardFromContact('/tmp', {
      uid: '1',
      title: 'Jane Doe',
      phones: ['+1 123 12345'],
    });
    assert.ok(vcard.includes('TEL:+1 123 12345'));
  });

  it('writes multiple TEL lines for phone array', async () => {
    const vcard = await generateVcardFromContact('/tmp', {
      uid: '1',
      title: 'Jane Doe',
      phones: ['+1111111111', '+2222222222'],
    });
    assert.ok(vcard.includes('TEL:+1111111111'));
    assert.ok(vcard.includes('TEL:+2222222222'));
  });

  it('writes EMAIL line', async () => {
    const vcard = await generateVcardFromContact('/tmp', {
      uid: '1',
      title: 'Jane Doe',
      emails: ['jane@example.com'],
    });
    assert.ok(vcard.includes('EMAIL:jane@example.com'));
  });

  it('writes typed EMAIL with TYPE parameter', async () => {
    const vcard = await generateVcardFromContact('/tmp', {
      uid: '1',
      title: 'Jane Doe',
      emails: [{ type: 'work', email: 'jane@work.com' }],
    });
    assert.ok(vcard.includes('EMAIL;TYPE=work:jane@work.com'));
  });

  it('writes ORG line for company', async () => {
    const vcard = await generateVcardFromContact('/tmp', {
      uid: '1',
      title: 'Jane Doe',
      company: 'Acme Corp',
    });
    assert.ok(vcard.includes('ORG:Acme Corp'));
  });

  it('falls back to company as FN when no name provided and title fails', async () => {
    const vcard = await generateVcardFromContact('/tmp', {
      uid: '1',
      title: 'Acme',
      company: 'Acme',
    });
    assert.ok(vcard.includes('ORG:Acme'));
  });

  it('writes NOTE line for desc', async () => {
    const vcard = await generateVcardFromContact('/tmp', {
      uid: '1',
      title: 'Jane Doe',
      desc: 'Some notes',
    });
    assert.ok(vcard.includes('NOTE:Some notes'));
  });

  it('writes URL line', async () => {
    const vcard = await generateVcardFromContact('/tmp', {
      uid: '1',
      title: 'Jane Doe',
      urls: ['https://example.com'],
    });
    assert.ok(vcard.includes('URL:https://example.com'));
  });

  it('round-trips through generateContactFromVcard', async () => {
    const contact = {
      uid: 'round-trip-001',
      title: 'Round Trip',
      phones: ['+1234567890'],
      emails: ['rt@example.com'],
    };
    const vcard = await generateVcardFromContact('/tmp', contact);
    const back = generateContactFromVcard(ctx, vcard, false);
    assert.equal(back.success, true);
    if (!back.success) throw new Error('Expected success');
    assert.equal(back.result.data.uid, contact.uid);
    assert.equal(back.result.data.title, contact.title);
  });
});

describe('areVCardsEquivalent', () => {
  const base = makeVCard('UID:test-001\r\nFN:Jane Doe\r\n');

  it('returns true for identical VCards', () => {
    assert.equal(areVCardsEquivalent(ctx, { first: base, second: base }), true);
  });

  it('returns true when property order differs', () => {
    const a = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nTEL:+111\r\nEMAIL:a@b.com\r\n');
    const b = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nEMAIL:a@b.com\r\nTEL:+111\r\n');
    assert.equal(areVCardsEquivalent(ctx, { first: a, second: b }), true);
  });

  it('returns false when UIDs differ', () => {
    const a = makeVCard('UID:uid-aaa\r\nFN:Jane Doe\r\n');
    const b = makeVCard('UID:uid-bbb\r\nFN:Jane Doe\r\n');
    assert.equal(areVCardsEquivalent(ctx, { first: a, second: b }), false);
  });

  it('returns false when TEL value differs', () => {
    const a = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nTEL:+111\r\n');
    const b = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nTEL:+999\r\n');
    assert.equal(areVCardsEquivalent(ctx, { first: a, second: b }), false);
  });

  it('returns false when EMAIL is added', () => {
    const a = makeVCard('UID:test-001\r\nFN:Jane Doe\r\n');
    const b = makeVCard('UID:test-001\r\nFN:Jane Doe\r\nEMAIL:new@example.com\r\n');
    assert.equal(areVCardsEquivalent(ctx, { first: a, second: b }), false);
  });

  it('returns false when FN differs', () => {
    const a = makeVCard('UID:test-001\r\nFN:Jane Doe\r\n');
    const b = makeVCard('UID:test-001\r\nFN:John Doe\r\n');
    assert.equal(areVCardsEquivalent(ctx, { first: a, second: b }), false);
  });

  it('returns true regardless of VERSION difference', () => {
    const a = makeVCard('UID:test-001\r\nFN:Jane Doe\r\n'); // VERSION:3.0
    const b = 'BEGIN:VCARD\r\nVERSION:4.0\r\nUID:test-001\r\nFN:Jane Doe\r\nEND:VCARD';
    assert.equal(areVCardsEquivalent(ctx, { first: a, second: b }), true);
  });
});

describe('_getFilenames', () => {
  it('returns slugified title and uid', () => {
    const result = _getFilenames({ uid: 'abc-123', title: 'Jane Doe' } as any);
    assert.deepEqual(result, ['jane-doe', 'abc-123']);
  });

  it('replaces dots and @ with hyphens before slugifying', () => {
    const result = _getFilenames({ uid: 'xyz', title: 'jane@doe.com' } as any);
    assert.deepEqual(result, ['jane-doe-com', 'xyz']);
  });

  it('handles single-word title', () => {
    const result = _getFilenames({ uid: 'uid-1', title: 'Jane' } as any);
    assert.deepEqual(result, ['jane', 'uid-1']);
  });
});
