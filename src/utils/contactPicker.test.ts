import { describe, it, expect } from 'vitest';
import { getRecommendedContactRole, parseEmployeeCount } from './contactPicker';

describe('contactPicker', () => {
  describe('getRecommendedContactRole', () => {
    it('returns CEO / Director for < 30 employees', () => {
      expect(getRecommendedContactRole('1-10')).toBe('Director or CEO');
      expect(getRecommendedContactRole('25')).toBe('Director or CEO');
    });

    it('returns Sales Manager / GM for 30-100 employees', () => {
      expect(getRecommendedContactRole('30-50')).toBe('Sales Manager or General Manager');
      expect(getRecommendedContactRole('100')).toBe('Sales Manager or General Manager');
    });

    it('returns HR / People & Culture for 100-300 employees', () => {
      expect(getRecommendedContactRole('101-200')).toBe('HR Manager or People & Culture Manager');
      expect(getRecommendedContactRole('300')).toBe('HR Manager or People & Culture Manager');
    });

    it('returns People & Culture Manager for 300-500 employees', () => {
      expect(getRecommendedContactRole('301-400')).toBe('People & Culture Manager');
      expect(getRecommendedContactRole('500')).toBe('People & Culture Manager');
    });

    it('returns People & Culture Manager for > 500 employees (default)', () => {
      expect(getRecommendedContactRole('501-1000')).toBe('People & Culture Manager');
    });

    it('returns CEO / Director when count is unknown', () => {
      expect(getRecommendedContactRole(null)).toBe('Director or CEO');
    });
  });

  describe('parseEmployeeCount', () => {
    it('parses ranges', () => {
      expect(parseEmployeeCount('1-10')).toBe(6);
      expect(parseEmployeeCount('11-50')).toBe(31);
    });

    it('parses single numbers', () => {
      expect(parseEmployeeCount('100')).toBe(100);
      expect(parseEmployeeCount('500+')).toBe(500);
    });
  });
});
