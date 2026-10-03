/**
 * SpinEngine · exports públicos.
 * Todo el motor es TypeScript puro y testeable sin React Native.
 */

export * from './types';
export * from './color';
export * from './formality';
export * from './weather';
export {
  spin,
  scoreCandidate,
  freshnessScore,
  subuseScore,
  candidateKey,
  CANDIDATE_COUNT,
  TOP_K_SAFE,
  PATTERN_PENALTY,
  SUBUSE_DAYS,
  RECENT_REPEAT_DAYS,
  FRESH_DAYS,
  ONEPIECE_CHANCE,
} from './engine';
