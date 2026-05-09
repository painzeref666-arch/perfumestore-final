export const currency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(Number(amount || 0));

export type RewardTier = { name: string; min: number; rate: number; perks: string[] };
export const rewardTiers: RewardTier[] = [
  { name: 'Bronze', min: 0, rate: 1, perks: ['Earn 1 point per ₱100 spent', 'Birthday scent note recommendation'] },
  { name: 'Silver', min: 500, rate: 1.25, perks: ['Earn 1.25 points per ₱100 spent', 'Early access to restocks'] },
  { name: 'Gold', min: 1500, rate: 1.5, perks: ['Earn 1.5 points per ₱100 spent', 'VIP repeat-buyer discount eligibility'] },
];

export function tierForPoints(points: number) {
  return [...rewardTiers].reverse().find((t) => points >= t.min) || rewardTiers[0];
}

export function pointsFromSpend(total: number) {
  return Math.max(0, Math.floor(Number(total || 0) / 100));
}

export function nextTier(points: number) {
  return rewardTiers.find((t) => points < t.min) || null;
}
