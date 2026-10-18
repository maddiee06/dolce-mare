const AVATAR_COLORS = [
  "2a4d8f",
  "8f2a4d",
  "2a8f6b",
  "8f6b2a",
  "5a2a8f",
  "2a8f8a",
  "8f2a2a",
  "4d8f2a",
  "2a4d8f",
  "8f4d2a",
  "6b2a8f",
  "2a6b8f",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getColorForName(name: string): string {
  const index = hashString(name) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getAvatarUrl(fullName?: string): string {
  const cleanName = (fullName || "Cajero").trim();
  const parts = cleanName.split(/\s+/);

  const initials =
    parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : cleanName.slice(0, 2);

  const background = getColorForName(cleanName);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials.toUpperCase(),
  )}&background=${background}&color=ffffff&bold=true&rounded=true`;
}
