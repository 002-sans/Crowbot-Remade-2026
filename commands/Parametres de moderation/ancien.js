const { Client, Message } = require("discord.js");

module.exports = {
    name: "ancien",
    description: "Définit au bout de combien de temps un membre est considéré comme ancien",
    category: "Paramètres de modération",
    argument: "<durée>",
    aliases: [],
    permissions: [],
    perm: 3,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        const time = parseDuration(args[0]);
        if (!time) return message.channel.send(`Format incorrect: essayez \`${db.prefix}ancien 4h30m\``);
        db.ancien = time;
        client.save(message.guildId);
        message.channel.send(`Les membres seront maintenant considéré comme anciens s'ils sont là depuis ${args[0]}`);

    },
};

function parseDuration(value) {
    const matches = String(value || '').match(/(\d+)\s*([smhdwy])/gi);
    if (!matches || matches.join('') !== String(value).replace(/\s+/g, '')) return null;
    return matches.reduce((total, part) => {
        const [, amount, unit] = part.match(/(\d+)\s*([smhdwy])/i);
        const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000, y: 31536000000 };
        return total + Number(amount) * multipliers[unit.toLowerCase()];
    }, 0);
}
