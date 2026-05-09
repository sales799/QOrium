import { describe, expect, it } from 'vitest';
import {
  MockMailer,
  createMailer,
  renderInvitationEmail,
  renderCandidateInviteEmail,
  renderCandidateReminderEmail,
  renderCandidateResultEmail,
  renderRecruiterResultNotifyEmail,
} from '../src/mailer/index.js';

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

describe('renderCandidateInviteEmail', () => {
  const base = {
    to: 'cand@example.com',
    token: 'tok-123',
    takeUrl: 'https://api.qorium.online',
    from: 'noreply@qorium.online',
    recruiterCompany: 'Razorpay',
    candidateName: 'Priya',
    roleTitle: 'Senior Python Engineer',
    estimatedMinutes: 45,
    expiresOn: '2026-05-15',
  };

  it('builds a take URL + decline URL and includes both in plaintext', () => {
    const msg = renderCandidateInviteEmail(base);
    expect(msg.subject).toBe('Assessment invitation from Razorpay — Senior Python Engineer');
    expect(msg.text).toContain('https://api.qorium.online/take/tok-123');
    expect(msg.text).toContain('https://api.qorium.online/decline/tok-123');
    expect(msg.text).toContain('Hi Priya,');
    expect(msg.text).toContain('about 45 minutes');
    expect(msg.text).toContain('before 2026-05-15');
    expect(msg.text).toContain('DPDPA');
    expect(msg.html).toMatch(/<a [^>]*href="https:\/\/api\.qorium\.online\/take\/tok-123"/);
  });

  it('strips trailing slash from takeUrl + URL-encodes special token chars', () => {
    const msg = renderCandidateInviteEmail({
      ...base,
      takeUrl: 'https://api.qorium.online/',
      token: 'a&b<c>',
    });
    expect(msg.text).toContain('https://api.qorium.online/take/a%26b%3Cc%3E');
    expect(msg.html).not.toMatch(/take\/a&b<c>/);
  });

  it('uses generic greeting when candidateName is omitted', () => {
    const { candidateName: _, ...rest } = base;
    void _;
    const msg = renderCandidateInviteEmail(rest);
    expect(msg.text.startsWith('Hi,')).toBe(true);
  });

  it('escapes recruiter company with HTML-sensitive chars in subject + html', () => {
    const msg = renderCandidateInviteEmail({ ...base, recruiterCompany: 'A&B <Tech>' });
    expect(msg.subject).toContain('A&B <Tech>');
    expect(msg.html).toContain('A&amp;B &lt;Tech&gt;');
    expect(msg.html).not.toContain('A&B <Tech>');
  });

  it('passes replyTo through when provided', () => {
    const msg = renderCandidateInviteEmail({ ...base, replyTo: 'recruiter@razorpay.com' });
    expect(msg.replyTo).toBe('recruiter@razorpay.com');
  });
});

describe('renderCandidateReminderEmail', () => {
  const base = {
    to: 'cand@example.com',
    token: 'tok-456',
    takeUrl: 'https://api.qorium.online',
    from: 'noreply@qorium.online',
    recruiterCompany: 'Persistent',
    candidateName: 'Arjun',
    roleTitle: 'Staff Engineer',
    hoursUntilExpiry: 48,
  };

  it('uses days phrasing when expiry > 24h', () => {
    const msg = renderCandidateReminderEmail(base);
    expect(msg.subject).toMatch(/expires in 2 days/);
    expect(msg.text).toContain('expires in 2 days');
  });

  it('uses urgent phrasing when expiry <= 24h', () => {
    const msg = renderCandidateReminderEmail({ ...base, hoursUntilExpiry: 12 });
    expect(msg.subject).toMatch(/less than 24 hours/);
    expect(msg.text).toContain('expires in less than 24 hours');
  });

  it('includes the take URL', () => {
    const msg = renderCandidateReminderEmail(base);
    expect(msg.text).toContain('https://api.qorium.online/take/tok-456');
    expect(msg.html).toMatch(/<a [^>]*href="https:\/\/api\.qorium\.online\/take\/tok-456"/);
  });
});

describe('renderCandidateResultEmail', () => {
  const base = {
    to: 'cand@example.com',
    resultUrl: 'https://api.qorium.online/v1/results/cand-001',
    from: 'noreply@qorium.online',
    recruiterCompany: 'HDFC Tech',
    candidateName: 'Vikram',
    roleTitle: 'Java Backend',
    scoreBand: 'Strong' as const,
  };

  it('renders score band in subject + body', () => {
    const msg = renderCandidateResultEmail(base);
    expect(msg.subject).toBe('Your Java Backend assessment result — Strong');
    expect(msg.text).toContain('IRT-calibrated band: Strong');
    expect(msg.html).toContain('<strong>Strong</strong>');
  });

  it('includes DPDPA-aligned data-rights link', () => {
    const msg = renderCandidateResultEmail(base);
    expect(msg.text).toContain('privacy@qorium.online');
    expect(msg.html).toContain('mailto:privacy@qorium.online');
  });

  it('handles all 5 score bands', () => {
    const bands: Array<typeof base.scoreBand> = [
      'Strong',
      'Above target',
      'On target',
      'Below target',
      'Not yet',
    ];
    for (const band of bands) {
      const msg = renderCandidateResultEmail({ ...base, scoreBand: band });
      expect(msg.subject).toContain(band);
      expect(msg.text).toContain(`band: ${band}`);
    }
  });
});

describe('renderRecruiterResultNotifyEmail', () => {
  const base = {
    to: 'recruiter@razorpay.com',
    resultUrl: 'https://api.qorium.online/recruiter/results/sess-789',
    from: 'noreply@qorium.online',
    candidateName: 'Priya Kumar',
    roleTitle: 'Senior Python',
    scoreBand: 'Above target' as const,
    completedAt: '2026-05-15T14:32:00+05:30',
    durationMinutes: 38,
  };

  it('renders candidate name + role + band in subject', () => {
    const msg = renderRecruiterResultNotifyEmail(base);
    expect(msg.subject).toBe('Priya Kumar completed Senior Python — Above target');
  });

  it('includes summary table data in plaintext + html', () => {
    const msg = renderRecruiterResultNotifyEmail(base);
    expect(msg.text).toContain('Band: Above target');
    expect(msg.text).toContain('Time taken: 38 minutes');
    expect(msg.text).toContain('https://api.qorium.online/recruiter/results/sess-789');
    expect(msg.html).toMatch(/font-weight:600">Above target</);
    expect(msg.html).toContain('<strong>Priya Kumar</strong>');
  });

  it('does not set replyTo (recruiter result is system-internal)', () => {
    const msg = renderRecruiterResultNotifyEmail(base);
    expect(msg.replyTo).toBeUndefined();
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
