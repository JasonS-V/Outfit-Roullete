export const KO_FI_URL = 'https://ko-fi.com/aizendev';

export type DonationMilestone = 'spins' | 'looks';
export type DonationCounts = Record<DonationMilestone, number> & { prompted: boolean };

export const EMPTY_DONATION_COUNTS: DonationCounts = { spins: 0, looks: 0, prompted: false };

export function advanceDonationCount(counts: DonationCounts, kind: DonationMilestone): { counts: DonationCounts; prompt: boolean } {
  const next = { ...counts, [kind]: Math.min(kind === 'spins' ? 10 : 2, counts[kind] + 1) };
  const prompt = kind === 'spins' && !counts.prompted && next.spins === 10 && next.looks === 2;
  return {
    counts: { ...next, prompted: counts.prompted || prompt },
    prompt,
  };
}
