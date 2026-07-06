/**
 * Animated HCI hex mark — the grey logo sits as a track while six light beams
 * sweep the ring and the outer edges chase in sequence. Ported from the
 * wallet-pass loading overlay (Web Changes/Prod/GetDigitalWalletPass.tsx);
 * animation timing lives in globals.css under `.hp-hexload`.
 */
export default function HexLoader({ className }: { className?: string }) {
  return (
    <svg
      className={className ? `hp-hexload ${className}` : "hp-hexload"}
      viewBox="-18 -18 216.48 243.88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="hp-hexload-clip" clipPathUnits="userSpaceOnUse">
          <path d="M90.22 169.25 33.75 136.72V71.17l56.47-32.53 52.99 30.53 17.81-10.25-70.78-40.78-74.47 42.9v85.81l74.47 42.9 70.77-40.76-17.81-10.25-52.99 30.52Z" />
          <path d="M121.8 65.96v28.5H58.62V65.98l-17.14 9.87v56.16l17.14 9.87v-28.47h63.18v28.5l17.2-9.9V75.86l-17.2-9.9Z" />
          <path d="M146.68 75.7v56.49l18.03 10.39V65.32l-18.03 10.39Z" />
        </clipPath>
        <radialGradient id="hp-hexload-grad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        className="hp-hexload-track"
        d="M90.24 0 0 51.97v103.94l90.24 51.97 90.24-51.97V51.97L90.24 0ZM172.71 151.43l-82.47 47.49L7.78 151.43V56.45L90.24 8.96l82.47 47.49v94.99Z"
        fill="currentColor"
      />
      <g className="hp-hexload-fill">
        <path d="M146.68 75.7v56.49l18.03 10.39V65.32l-18.03 10.39Z" fill="currentColor" />
        <path
          d="M90.22 169.25 33.75 136.72V71.17l56.47-32.53 52.99 30.53 17.81-10.25-70.78-40.78-74.47 42.9v85.81l74.47 42.9 70.77-40.76-17.81-10.25-52.99 30.52Z"
          fill="currentColor"
        />
        <path
          d="M121.8 65.96v28.5H58.62V65.98l-17.14 9.87v56.16l17.14 9.87v-28.47h63.18v28.5l17.2-9.9V75.86l-17.2-9.9Z"
          fill="currentColor"
        />
      </g>
      <g className="hp-hexload-light" clipPath="url(#hp-hexload-clip)">
        <circle className="hp-hexload-beam is-1" cx="45.12" cy="25.98" r="112" fill="url(#hp-hexload-grad)" />
        <circle className="hp-hexload-beam is-2" cx="135.36" cy="25.98" r="112" fill="url(#hp-hexload-grad)" />
        <circle className="hp-hexload-beam is-3" cx="180.48" cy="103.94" r="112" fill="url(#hp-hexload-grad)" />
        <circle className="hp-hexload-beam is-4" cx="135.36" cy="181.90" r="112" fill="url(#hp-hexload-grad)" />
        <circle className="hp-hexload-beam is-5" cx="45.12" cy="181.90" r="112" fill="url(#hp-hexload-grad)" />
        <circle className="hp-hexload-beam is-6" cx="0" cy="103.94" r="112" fill="url(#hp-hexload-grad)" />
      </g>
      <path
        className="hp-hexload-seg is-1"
        d="M90.24 0 0 51.97l7.78 4.48 82.46-47.49L90.24 0Z"
        fill="currentColor"
      />
      <path
        className="hp-hexload-seg is-2"
        d="M90.24 0v8.96l82.47 47.49 7.77-4.48L90.24 0Z"
        fill="currentColor"
      />
      <path
        className="hp-hexload-seg is-3"
        d="M180.48 51.97 172.71 56.45v94.98l7.77 4.48V51.97Z"
        fill="currentColor"
      />
      <path
        className="hp-hexload-seg is-4"
        d="M172.71 151.43 90.24 198.92v8.96l90.24-51.97-7.77-4.48Z"
        fill="currentColor"
      />
      <path
        className="hp-hexload-seg is-5"
        d="M7.78 151.43 0 155.91l90.24 51.97v-8.96L7.78 151.43Z"
        fill="currentColor"
      />
      <path
        className="hp-hexload-seg is-6"
        d="M0 51.97v103.94l7.78-4.48V56.45L0 51.97Z"
        fill="currentColor"
      />
    </svg>
  );
}
