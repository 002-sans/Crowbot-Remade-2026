const crypto = require("node:crypto");

const COLORS = {
    1: 0x5865F2,
    2: 0x4F545C,
    3: 0xED4245,
    4: 0x57F287,
};

function createCaptcha() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const code = Array.from({ length: 5 }, () => alphabet[crypto.randomInt(alphabet.length)]).join("");
    const colors = ["#7f55b5", "#9a72c6", "#6f4ba5", "#b18bd0"];
    const letters = [...code].map((letter, index) => {
        const x = 125 + index * 100;
        const y = 142 + crypto.randomInt(-18, 19);
        const rotate = crypto.randomInt(-14, 15);
        return `<text x="${x}" y="${y}" transform="rotate(${rotate} ${x} ${y})" fill="${colors[index % colors.length]}" font-size="72" font-family="Comic Sans MS, cursive" font-weight="700">${letter}</text>`;
    }).join("");

    const confetti = Array.from({ length: 22 }, (_, index) => {
        const x = 18 + crypto.randomInt(604);
        const y = 12 + crypto.randomInt(210);
        const rotate = crypto.randomInt(0, 180);
        return `<rect x="${x}" y="${y}" width="4" height="10" rx="2" fill="#b78bd8" opacity=".85" transform="rotate(${rotate} ${x} ${y})"/>`;
    }).join("");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240">
<rect width="640" height="240" rx="18" fill="#f4fbf6"/>
${confetti}
<path d="M105 164 C220 158 405 171 535 164" fill="none" stroke="#b18bd0" stroke-width="3" opacity=".8"/>
${letters}
</svg>`;

    return { code, buffer: Buffer.from(svg), name: "captcha.svg" };
}

function buttonStyle(style) {
    return COLORS[style] ? Number(style) : 1;
}

module.exports = { createCaptcha, buttonStyle };
