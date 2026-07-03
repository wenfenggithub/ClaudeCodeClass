export type RelaxationPracticeKind =
  | "breathing"
  | "worry"
  | "reframe"
  | "meditation";

export const RELAXATION_PRACTICE_KINDS: RelaxationPracticeKind[] = [
  "breathing",
  "worry",
  "reframe",
  "meditation",
];

export function canUseRelaxationPractice(
  _kind: RelaxationPracticeKind,
  loggedIn: boolean,
): boolean {
  return loggedIn;
}
