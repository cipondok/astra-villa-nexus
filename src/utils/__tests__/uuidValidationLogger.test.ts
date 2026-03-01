import { describe, it, expect, beforeEach } from 'vitest';
import { uuidValidationLogger, validateUUIDWithLogging, requireValidUUIDWithLogging } from '../uuid-validation-logger';

describe('UUIDValidationLogger', () => {
  beforeEach(() => {
    uuidValidationLogger.clearErrors();
    localStorage.clear();
  });

  it('validates correct UUID', () => {
    expect(validateUUIDWithLogging('123e4567-e89b-12d3-a456-426614174000', 'test')).toBe(true);
  });

  it('rejects null UUID', () => {
    expect(validateUUIDWithLogging(null, 'test')).toBe(false);
  });

  it('rejects undefined UUID', () => {
    expect(validateUUIDWithLogging(undefined, 'test')).toBe(false);
  });

  it('rejects invalid format', () => {
    expect(validateUUIDWithLogging('not-a-uuid', 'test')).toBe(false);
  });

  it('logs errors in memory', () => {
    validateUUIDWithLogging('bad', 'ctx1');
    validateUUIDWithLogging(null, 'ctx2');
    expect(uuidValidationLogger.getErrors()).toHaveLength(2);
  });

  it('persists errors to localStorage', () => {
    validateUUIDWithLogging('invalid', 'persist-test');
    const persisted = uuidValidationLogger.getPersistedErrors();
    expect(persisted.length).toBeGreaterThanOrEqual(1);
  });

  it('clearErrors empties both memory and storage', () => {
    validateUUIDWithLogging('bad', 'clear-test');
    uuidValidationLogger.clearErrors();
    expect(uuidValidationLogger.getErrors()).toHaveLength(0);
    expect(localStorage.getItem('uuid_validation_errors')).toBeNull();
  });

  it('requireValidUUIDWithLogging throws on invalid', () => {
    expect(() => requireValidUUIDWithLogging('bad', 'test')).toThrow('Invalid UUID');
  });

  it('requireValidUUIDWithLogging returns valid UUID', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    expect(requireValidUUIDWithLogging(uuid, 'test')).toBe(uuid);
  });

  it('getStats aggregates by context', () => {
    validateUUIDWithLogging('x', 'contextA');
    validateUUIDWithLogging('y', 'contextA');
    validateUUIDWithLogging('z', 'contextB');
    const stats = uuidValidationLogger.getStats();
    expect(stats.errorsByContext['contextA']).toBe(2);
    expect(stats.errorsByContext['contextB']).toBe(1);
  });

  it('caps in-memory errors at 100', () => {
    for (let i = 0; i < 110; i++) {
      validateUUIDWithLogging(`bad-${i}`, 'cap-test');
    }
    expect(uuidValidationLogger.getErrors().length).toBeLessThanOrEqual(100);
  });
});
