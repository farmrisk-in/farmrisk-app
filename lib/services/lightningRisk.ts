export interface LightningInput {
  cloudCover: number;
  precipitation: number;
  humidity: number;
  windGusts: number;
  code: number;
}

export interface LightningRiskResult {
  score: number;
  category: string;
  risk: string;
}

export function classify(score: number, hasConvectiveCode: boolean): string {
  // No Risk: nothing convective and negligible environmental signal
  if (!hasConvectiveCode && score < 10) return "No Risk";
  if (score < 50) return "Low";
  if (score < 70) return "Moderate";
  if (score < 90) return "High";
  return "Severe";
}

export function lightningRisk(w: LightningInput): LightningRiskResult {
  let env = 0;

  if (w.cloudCover > 80) env += 20;
  else if (w.cloudCover > 50) env += 8;

  if (w.precipitation > 10) env += 35;
  else if (w.precipitation > 2) env += 18;

  if (w.humidity > 80) env += 15;
  else if (w.humidity > 60) env += 7;

  if (w.windGusts > 40) env += 30;
  else if (w.windGusts > 20) env += 15;

  const hasConvectiveCode = [95, 96, 99, 80, 81, 82, 85, 86].includes(w.code);

  let floor = 0;
  if ([95, 96, 99].includes(w.code)) floor = 15;
  else if ([80, 81, 82, 85, 86].includes(w.code)) floor = 10;

  const score = Math.min(Math.max(env, floor), 100);
  const risk = classify(score, hasConvectiveCode);

  return {
    score,
    category: risk,
    risk,
  };
}

export default lightningRisk;
