import { describe, it, expect } from 'vitest';
import {
  orderFamilyRollups,
  type PersistedFamily,
  type SkillFamilyRollup,
} from '../src/repositories/recruiter.js';

const rollups: SkillFamilyRollup[] = [
  { id: 'backend', name: 'Backend', released: 100, skillCount: 5, topSkills: [] },
  { id: 'cloud-devops', name: 'Cloud & DevOps', released: 300, skillCount: 8, topSkills: [] },
  { id: 'frontend', name: 'Frontend', released: 200, skillCount: 6, topSkills: [] },
];

describe('orderFamilyRollups', () => {
  it('falls back to released-desc when no persisted order', () => {
    const out = orderFamilyRollups(rollups, null);
    expect(out.map((f) => f.id)).toEqual(['cloud-devops', 'frontend', 'backend']);
  });

  it('orders by persisted sort_order and relabels with persisted name', () => {
    const persisted = new Map<string, PersistedFamily>([
      ['backend', { name: 'Backend Engineering', sortOrder: 0 }],
      ['frontend', { name: 'Frontend', sortOrder: 1 }],
      ['cloud-devops', { name: 'Cloud & DevOps', sortOrder: 2 }],
    ]);
    const out = orderFamilyRollups(rollups, persisted);
    expect(out.map((f) => f.id)).toEqual(['backend', 'frontend', 'cloud-devops']);
    expect(out[0].name).toBe('Backend Engineering');
  });

  it('does not mutate the input array', () => {
    const before = rollups.map((f) => f.id);
    orderFamilyRollups(rollups, null);
    expect(rollups.map((f) => f.id)).toEqual(before);
  });
});
