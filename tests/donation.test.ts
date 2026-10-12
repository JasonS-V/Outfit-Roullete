import { describe, expect, it } from 'vitest';

import { advanceDonationCount, EMPTY_DONATION_COUNTS } from '../src/services/donation';

describe('donation milestones', () => {
  it('waits for two saved looks and ten completed spins, then prompts only once', () => {
    let counts = EMPTY_DONATION_COUNTS;
    for (let spin = 0; spin < 9; spin++) {
      const next = advanceDonationCount(counts, 'spins');
      expect(next.prompt).toBe(false);
      counts = next.counts;
    }
    counts = advanceDonationCount(counts, 'looks').counts;
    counts = advanceDonationCount(counts, 'looks').counts;
    const tenth = advanceDonationCount(counts, 'spins');
    expect(tenth.prompt).toBe(true);
    expect(tenth.counts).toEqual({ spins: 10, looks: 2, prompted: true });
    expect(advanceDonationCount(tenth.counts, 'spins').prompt).toBe(false);
  });

  it('waits for a later spin when the second look is saved after ten spins', () => {
    let counts = EMPTY_DONATION_COUNTS;
    for (let spin = 0; spin < 10; spin++) counts = advanceDonationCount(counts, 'spins').counts;
    counts = advanceDonationCount(counts, 'looks').counts;
    const secondLook = advanceDonationCount(counts, 'looks');
    expect(secondLook.prompt).toBe(false);
    expect(advanceDonationCount(secondLook.counts, 'spins').prompt).toBe(true);
  });
});
