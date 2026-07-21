const DOT_RADII = [36, 44, 52, 60, 68, 76];
const DOT_ANGLES = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

function dottedRays() {
  return DOT_ANGLES.map(
    (angle) => `
      <g transform="rotate(${angle} 100 100)">
        ${DOT_RADII.map((r) => `<circle cx="100" cy="${100 - r}" r="2.1"/>`).join("")}
      </g>`,
  ).join("");
}

export function compassMark(className = "", idSuffix = "x") {
  const maskId = `pusula-b-${idSuffix}`;
  return `
    <svg class="compass${className ? ` ${className}` : ""}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <mask id="${maskId}">
        <rect width="200" height="200" fill="#fff"/>
        <text x="100" y="101" text-anchor="middle" dominant-baseline="central"
              font-family="Iowan Old Style, Baskerville, 'Times New Roman', serif"
              font-size="33" font-weight="600" fill="#000">B</text>
      </mask>
      <g fill="currentColor" mask="url(#${maskId})">
        <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" stroke-width="4"/>
        <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <g class="compass-rose">
        <g>${dottedRays()}</g>
        <!-- kısa uçlar (ara yönler) -->
        <g transform="rotate(45 100 100)">
          <path d="M100 40 L109 88 L100 100 L91 88 Z"/>
          <path d="M100 160 L109 112 L100 100 L91 112 Z"/>
          <path d="M40 100 L88 91 L100 100 L88 109 Z"/>
          <path d="M160 100 L112 91 L100 100 L112 109 Z"/>
        </g>
        <!-- uzun uçlar (ana yönler) -->
        <path d="M100 12 L111 84 L100 100 L89 84 Z"/>
        <path d="M100 188 L111 116 L100 100 L89 116 Z"/>
        <path d="M12 100 L84 89 L100 100 L84 111 Z"/>
        <path d="M188 100 L116 89 L100 100 L116 111 Z"/>
        </g>
        <circle cx="100" cy="100" r="22"/>
      </g>
    </svg>`;
}
