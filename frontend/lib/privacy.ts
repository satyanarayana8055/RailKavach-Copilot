/** DPDP Act 2023 pseudonymisation for crew identities in non-inquiry views. */
const RULES: Array<[RegExp, string]> = [
  [/Rajesh Kumar/g, "R. K**** [Masked]"],
  [/LP-4412/g, "LP-****"],
  [/Amit Singh/g, "A. S**** [Masked]"],
  [/ALP-5519/g, "ALP-****"],
  [/S\. Sharma/g, "S. S**** [Masked]"],
  [/LP-3108/g, "LP-****"],
  [/M\. K\. Verma/g, "M. K. V**** [Masked]"],
  [/LP-2891/g, "LP-****"],
  [/राजेश कुमार/g, "रा**** कु****"],
  [/अमित सिंह/g, "अ**** सि****"],
];

export function maskPII(text: string, enabled: boolean): string {
  if (!enabled) return text;
  return RULES.reduce((t, [re, rep]) => t.replace(re, rep), text);
}

/** "03:14:15" -> seconds since midnight */
export function toSeconds(hms: string): number {
  const [h, m, s] = hms.split(":").map(Number);
  return h * 3600 + m * 60 + (s || 0);
}
