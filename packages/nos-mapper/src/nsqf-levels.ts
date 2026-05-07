import type { NsqfLevelDescriptor } from './types.js';

/**
 * NSQF descriptor data per the NSDC NSQF Notification (Government of India,
 * MoSDE). Sourced verbatim from the published NSQF document; abbreviated
 * for in-app display. Use this as the authoritative grid when converting
 * Bloom's-tagged questions to NSQF levels.
 */
export const NSQF_LEVELS: ReadonlyArray<NsqfLevelDescriptor> = [
  {
    level: 1,
    process: 'Routine, predictable, with close supervision',
    knowledge: 'Familiar information; basic facts',
    responsibility: 'No responsibility for others',
  },
  {
    level: 2,
    process: 'Routine and repetitive, narrow range of activities',
    knowledge: 'Familiar information; basic facts; simple data',
    responsibility: 'Responsibility for own work',
  },
  {
    level: 3,
    process: 'Routine and predictable, with limited supervision',
    knowledge: 'Recall and demonstrate practical skills',
    responsibility: 'Some responsibility for others',
  },
  {
    level: 4,
    process: 'Wide range of activities, with limited supervision',
    knowledge: 'Factual and procedural knowledge in narrow field',
    responsibility: 'Responsibility for own work and learning',
  },
  {
    level: 5,
    process: 'Job that requires well-developed skill, with clear choice of procedures',
    knowledge: 'Some basic theoretical knowledge',
    responsibility: 'Responsibility for own work and team',
  },
  {
    level: 6,
    process:
      'Demands wide range of cognitive and practical skills required for clear strategic action',
    knowledge: 'Factual and theoretical knowledge in broad contexts within a field of work',
    responsibility: 'Responsibility for work of others; allocation of resources',
  },
  {
    level: 7,
    process: 'Requires wide range of specialised technical and managerial skill',
    knowledge: 'Wide-ranging factual and theoretical knowledge in broad contexts',
    responsibility: 'Full responsibility for output of work and study',
  },
  {
    level: 8,
    process: 'Requires command of wide-ranging specialised theoretical and practical skill',
    knowledge:
      'Comprehensive cognitive and theoretical knowledge with critical understanding of theories and principles',
    responsibility:
      'Responsibility for decision-making in complex technical activities involving unpredictable situations',
  },
  {
    level: 9,
    process: 'Requires advanced skill to develop creative solutions; research, analyse, evaluate',
    knowledge:
      'Advanced knowledge of work and study and critical understanding of theories and principles',
    responsibility: 'Responsibility for managing and transforming work or study contexts',
  },
  {
    level: 10,
    process:
      'Develops original ideas, methods, processes, frameworks; demonstrates substantial authority and innovation',
    knowledge:
      'Highly specialised knowledge at the frontier of work or study; substantial authority',
    responsibility:
      'Responsibility for substantial authority, innovation, scholarly and professional integrity',
  },
] as const;

export function getNsqfLevel(level: number): NsqfLevelDescriptor | undefined {
  return NSQF_LEVELS.find((d) => d.level === level);
}
