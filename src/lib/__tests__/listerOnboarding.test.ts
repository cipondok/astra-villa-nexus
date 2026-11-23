import { describe, expect, it } from 'vitest';
import {
  emptyListerApplication,
  validateListerApplication,
  normalizeIndonesianPhone,
  buildAgentRequest,
  buildOwnerRequest,
  getActivationState,
  applicationErrorKey,
  FIELD_VISIBILITY,
} from '../listerOnboarding';

const validOwner = emptyListerApplication({
  role: 'property_owner',
  fullName: 'Made Wirawan',
  phone: '0812-3456-7890',
  email: 'made@example.com',
  province: 'Bali',
  city: 'Badung',
  propertyTypes: ['villa'],
  declaration: true,
});

const validAgent = emptyListerApplication({
  role: 'agent',
  fullName: 'Sari Dewi',
  phone: '+62 811 222 3333',
  email: 'sari@example.com',
  province: 'DKI Jakarta',
  city: 'Jakarta Selatan',
  bio: 'Agen properti residensial di Jakarta Selatan sejak 2015, fokus rumah keluarga.',
  declaration: true,
});

describe('application form rules', () => {
  it('accepts a complete owner application', () => {
    expect(validateListerApplication(validOwner)).toEqual({});
  });

  it('requires a role to be chosen', () => {
    expect(validateListerApplication({ ...validOwner, role: null }).role).toBe('pickOne');
  });

  it('requires the truthfulness declaration', () => {
    expect(validateListerApplication({ ...validOwner, declaration: false }).declaration).toBe('declaration');
  });

  it('requires province and city as the service area', () => {
    const e = validateListerApplication({ ...validOwner, province: ' ', city: '' });
    expect(e.province).toBe('required');
    expect(e.city).toBe('required');
  });

  it('owners must pick at least one property type', () => {
    expect(validateListerApplication({ ...validOwner, propertyTypes: [] }).propertyTypes).toBe('pickOne');
  });

  it('agents and developers need a professional bio of at least 40 characters', () => {
    expect(validateListerApplication(validAgent)).toEqual({});
    expect(validateListerApplication({ ...validAgent, bio: '' }).bio).toBe('required');
    expect(validateListerApplication({ ...validAgent, bio: 'Agen properti.' }).bio).toBe('tooShort');
    expect(validateListerApplication({ ...validOwner, bio: '' }).bio).toBeUndefined();
  });

  it('agencies, developers and business owners must give a company name', () => {
    expect(validateListerApplication({ ...validAgent, agentKind: 'agency' }).companyName).toBe('required');
    expect(validateListerApplication({ ...validAgent, role: 'developer' }).companyName).toBe('required');
    expect(validateListerApplication({ ...validOwner, ownerType: 'business' }).companyName).toBe('required');
    expect(validateListerApplication(validAgent).companyName).toBeUndefined();
  });
});

describe('Indonesian phone numbers', () => {
  it('normalises 0…, 62… and +62… numbers', () => {
    expect(normalizeIndonesianPhone('0812-3456-7890')).toBe('+6281234567890');
    expect(normalizeIndonesianPhone('6281234567890')).toBe('+6281234567890');
    expect(normalizeIndonesianPhone('+62 812 3456 7890')).toBe('+6281234567890');
  });

  it('rejects foreign or malformed numbers', () => {
    expect(normalizeIndonesianPhone('+1 415 555 0100')).toBeNull();
    expect(normalizeIndonesianPhone('0812')).toBeNull();
    expect(normalizeIndonesianPhone('abc')).toBeNull();
  });
});

describe('application rows', () => {
  it('never sends a status or reviewer, so the database decides', () => {
    const owner = buildOwnerRequest(validOwner, 'u1') as Record<string, unknown>;
    const agent = buildAgentRequest(validAgent, 'u1') as Record<string, unknown>;
    for (const row of [owner, agent]) {
      expect(row).not.toHaveProperty('status');
      expect(row).not.toHaveProperty('reviewed_by');
      expect(row).not.toHaveProperty('role');
    }
  });

  it('files developers as business type "developer" and keeps the service area', () => {
    const row = buildAgentRequest({ ...validAgent, role: 'developer', companyName: 'PT Bangun', area: 'Kemang' }, 'u1');
    expect(row.business_type).toBe('developer');
    expect(row.service_area).toBe('Kemang, Jakarta Selatan, DKI Jakarta');
  });
});

describe('what others can see', () => {
  it('keeps phone, email, licence, service area and bio private', () => {
    for (const f of ['phone', 'email', 'licenseNumber', 'serviceArea', 'bio'] as const) {
      expect(FIELD_VISIBILITY[f]).toBe('private');
    }
  });
});

describe('activation status', () => {
  const app = (over: Record<string, unknown>) => ({ type: 'agent' as const, status: 'pending', created_at: '2026-11-01T00:00:00Z', ...over });

  it('a plain buyer account has not started', () => {
    expect(getActivationState({ roles: ['general_user'], applications: [] })).toEqual({ stage: 'not_started', intent: null });
  });

  it('remembers the purpose picked at sign-up without granting it', () => {
    expect(getActivationState({ roles: ['general_user'], applications: [], profileType: 'owner' })).toEqual({ stage: 'not_started', intent: 'property_owner' });
  });

  it('shows pending while an application waits for review', () => {
    expect(getActivationState({ roles: ['general_user'], applications: [app({})] }).stage).toBe('pending');
  });

  it('an approved application alone does not activate — only the granted role does', () => {
    expect(getActivationState({ roles: ['general_user'], applications: [app({ status: 'approved' })] }).stage).toBe('not_started');
    expect(getActivationState({ roles: ['general_user', 'agent'], applications: [] })).toEqual({ stage: 'active', role: 'agent' });
  });

  it('shows the reviewer note after a rejection', () => {
    const s = getActivationState({ roles: ['general_user'], applications: [app({ status: 'rejected', review_notes: 'Lengkapi nomor izin' })] });
    expect(s).toMatchObject({ stage: 'rejected', role: 'agent', note: 'Lengkapi nomor izin' });
  });

  it('labels developer applications as developer', () => {
    expect(getActivationState({ roles: [], applications: [app({ business_type: 'developer' })] })).toMatchObject({ role: 'developer' });
  });

  it('ignores vendor applications', () => {
    expect(getActivationState({ roles: [], applications: [app({ type: 'vendor' })] }).stage).toBe('not_started');
  });

  it('maps the duplicate-application database error', () => {
    expect(applicationErrorKey({ message: 'application_already_pending' })).toBe('alreadyPending');
    expect(applicationErrorKey({ message: 'boom' })).toBe('generic');
  });
});
