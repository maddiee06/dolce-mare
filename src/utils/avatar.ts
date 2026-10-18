export function getAvatarUrl(fullName?: string): string {
  const cleanName = (fullName || "Cajero").trim();
  const parts = cleanName.split(/\s+/);

  const initials =
    parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : cleanName.slice(0, 2);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials.toUpperCase(),
  )}&background=2a4d8f&color=ffffff&bold=true&rounded=true`;
}
