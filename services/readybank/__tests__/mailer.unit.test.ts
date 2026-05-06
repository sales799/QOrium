import { describe, expect, it } from 'vitest';
import { MockMailer, createMailer, renderInvitationEmail } from '../src/mailer/index.js';

describe('renderInvitationEmail', () => {
  it('builds a plaintext + html message with the accept URL', () => {
    const msg = renderInvitationEmail({
      to: 'a@example.com',
      token: 'abcdef-XYZ_123',
      portalUrl: 'https://app.qorium.io',
      from: 'no-reply@qorium.io',
      recipientName: 'Alex',
    });

    expect(msg.to).toBe('a@example.com');
    expect(msg.from).toBe('no-reply@qorium.io');
    expect(msg.subject).toMatch(/invited/i);
    expect(msg.text).toContain('Hi Alex,');
    expect(msg.text).toContain('https://app.qorium.io/accept-invite.html?token=abcdef-XYZ_123');
    expect(msg.html).toContain('https://app.qorium.io/accept-invite.html?token=abcdef-XYZ_123');
    expect(msg.html).toMatch(/<a [^>]*href=/);
    expect(msg.replyTo).toBeUndefined();
  });

  it('strips trailing slash from portalUrl + escapes html-sensitive chars', () => {
    const msg = renderInvitationEmail({
      to: 'a@example.com',
      token: 'a&b<c>d',
      portalUrl: 'https://app.qorium.io/',
      from: 'no-reply@qorium.io',
    });
    expect(msg.text).toContain('https://app.qorium.io/accept-invite.html?token=a%26b%3Cc%3Ed');
    // Token already URL-encoded; HTML body must not contain the raw ampersand or angle brackets
    // outside of HTML entities.
    expect(msg.html).not.toMatch(/token=a&b<c>d/);
  });

  it('uses generic greeting when recipientName is omitted', () => {
    const msg = renderInvitationEmail({
      to: 'a@example.com',
      token: 'tok',
      portalUrl: 'https://app.qorium.io',
      from: 'no-reply@qorium.io',
    });
    expect(msg.text.startsWith('Hi,')).toBe(true);
  });

  it('passes replyTo through when provided', () => {
    const msg = renderInvitationEmail({
      to: 'a@example.com',
      token: 'tok',
      portalUrl: 'https://app.qorium.io',
      from: 'no-reply@qorium.io',
      replyTo: 'ops@qorium.io',
    });
    expect(msg.replyTo).toBe('ops@qorium.io');
  });
});

describe('MockMailer', () => {
  it('records sends and returns a deterministic-shape result', async () => {
    const m = new MockMailer();
    const out = await m.send({
      to: 't@example.com',
      from: 'f@example.com',
      subject: 'hello',
      text: 'body',
      html: '<p>body</p>',
    });

    expect(out.driver).toBe('mock');
    expect(out.messageId).toMatch(/^mock-/);
    expect(m.inbox()).toHaveLength(1);
    expect(m.lastSentTo('t@example.com')?.subject).toBe('hello');
    expect(m.lastSentTo('not@anyone.com')).toBeUndefined();
  });

  it('clear() empties the recorded inbox', async () => {
    const m = new MockMailer();
    await m.send({ to: 'a@x', from: 'b@x', subject: 's', text: 't', html: 'h' });
    m.clear();
    expect(m.inbox()).toHaveLength(0);
  });
});

describe('createMailer', () => {
  it('returns a MockMailer for driver=mock', async () => {
    const m = await createMailer({ driver: 'mock' });
    expect(m.driver).toBe('mock');
  });

  it('rejects ses driver without region', async () => {
    await expect(createMailer({ driver: 'ses' })).rejects.toThrow(/SES_REGION/);
  });

  it('rejects sendgrid driver without api key', async () => {
    await expect(createMailer({ driver: 'sendgrid' })).rejects.toThrow(/SENDGRID_API_KEY/);
  });
});
