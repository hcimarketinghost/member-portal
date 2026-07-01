/**
 * HCI hex mark. Source: "white hex.svg" from the brand assets.
 * Fill set to currentColor so it inherits the nav's text color (white).
 */
export default function Logo({ height = 26 }: { height?: number }) {
  return (
    <svg
      viewBox="0 0 180.48 207.88"
      height={height}
      role="img"
      aria-label="Hill Country Indoor"
      fill="currentColor"
      style={{ display: "block" }}
    >
      <path d="M90.24,0L0,51.97v103.94l90.24,51.97,90.24-51.97V51.97L90.24,0ZM172.71,151.43l-82.47,47.49L7.78,151.43V56.45L90.24,8.96l82.47,47.49v94.99h0Z" />
      <path d="M146.68,75.7v56.49l18.03,10.39v-77.26l-18.03,10.39h0Z" />
      <path d="M90.22,169.25l-56.47-32.53v-65.55l56.47-32.53,52.99,30.53,17.81-10.25L90.24,18.14,15.77,61.04v85.81l74.47,42.9,70.77-40.76-17.81-10.25-52.99,30.52h0Z" />
      <path d="M121.8,65.96v28.5h-63.18v-28.48l-17.14,9.87v56.16l17.14,9.87v-28.47h63.18v28.5l17.2-9.9v-56.16l-17.2-9.9h0Z" />
    </svg>
  );
}
