const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "strikes",
    description: "Affiche ou modifie les strikes",
    category: "Paramètres de modération",
    argument: "[déclencheur] [nombre] [ancien/nouveau]",
    aliases: [],
    permissions: [],
    perm: 3,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        ensureStrikes(db);

        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor(db.color)
                .addFields(
                    { name: '**Strike pour les anciens membres**', value: formatStrikes(db.strikes.ancien), inline: true },
                    { name: '**Strike pour les nouveaux membres**', value: formatStrikes(db.strikes.nouveau), inline: true }
                )
                .setFooter({ text: "Les membres sont considérés comme anciens quand ils sont là depuis 1h" });
            return message.channel.send({ embeds: [embed] });
        }

        const trigger = normalizeTrigger(args[0]);
        const nombre = parseInt(args[1]);
        const type = args[2] === 'ancien' ? 'ancien' : 'nouveau';
        if (!trigger || isNaN(nombre) || nombre < 1) return message.channel.send(`Utilisation: \`${db.prefix}strikes <déclencheur> <nombre> [ancien/nouveau]\``);
        db.strikes[type][trigger] = nombre;
        client.save(message.guildId);
        message.channel.send(`Les strikes \`${trigger}\` (${type}) sont maintenant à \`${nombre}\``);

    },
};

function ensureStrikes(db) {
    db.strikes ??= {};
    for (const type of ['ancien', 'nouveau']) {
        db.strikes[type] ??= {};
        for (const trigger of ['spam', 'link', 'massmention', 'badwords']) {
            db.strikes[type][trigger] ??= db.strikes[type][trigger === 'spam' ? 'antispam' : trigger === 'link' ? 'antilink' : trigger === 'massmention' ? 'antimassmention' : trigger] ?? 1;
        }
    }
}

function normalizeTrigger(value) {
    return ({ antispam: 'spam', antilink: 'link', antimassmention: 'massmention', spam: 'spam', link: 'link', massmention: 'massmention', badwords: 'badwords' })[String(value || '').toLowerCase()];
}

function formatStrikes(values) {
    return ['spam', 'link', 'massmention', 'badwords'].map(key => `**${key === 'massmention' ? 'Massmention' : key[0].toUpperCase() + key.slice(1)}**: \`${values[key] ?? 1}\``).join('\n');
}
