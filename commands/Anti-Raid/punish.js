const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "punish",
    description: "Gère les punitions antiraid ou strikes",
    category: "Antiraid",
    argument: "<all/module/add/del/setup> ...",
    aliases: ["punition"],
    permissions: [],
    perm: 6,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {
        const db = client.get(message.guildId);

        if (['add', 'del', 'setup'].includes(args[0]) || !args[0]) {
            if (!db.strikepunish) db.strikepunish = [];

            if (!args[0]) {
                const embed = new EmbedBuilder()
                    .setTitle("Actions d'automodération")
                    .setColor(db.color)
                    .setDescription(db.strikepunish.length
                        ? db.strikepunish.map((p, i) => `${i + 1} - \`${p.strikes}\` strike${p.strikes > 1 ? 's' : ''} en \`${p.window}\`: **${p.sanction}${p.duration ? ` ${p.duration}` : ''}**`).join('\n')
                        : 'Aucune sanction configurée')
                    .setFooter({ text: db.footer ?? 'ζ͜͡Crow Bots' });
                return message.channel.send({ embeds: [embed] });
            }
            if (args[0] === 'add') {
                const strikes = parseInt(args[1]);
                const window = args[2];
                const sanction = args[3]?.toLowerCase();
                const duration = args[4] || null;
                if (isNaN(strikes) || !window || !['mute', 'tempmute', 'kick', 'ban', 'tempban', 'derank'].includes(sanction))
                    return message.channel.send(`Utilisation: \`${db.prefix}punish add <nombre> <durée> <sanction> [durée]\``);
                db.strikepunish.push({ strikes, window, sanction, duration });
                client.save(message.guildId);
                return message.channel.send("La sanction a été **créée**");
            }
            if (args[0] === 'del') {
                const index = parseInt(args[1]) - 1;
                if (isNaN(index) || index < 0 || index >= db.strikepunish.length) return message.channel.send("Numéro invalide");
                const removed = db.strikepunish[index];
                db.strikepunish.splice(index, 1);
                client.save(message.guildId);
                return message.channel.send(`Supprimé: \`${removed.strikes}\` strike${removed.strikes > 1 ? 's' : ''} en \`${removed.window}\`: **${removed.sanction}${removed.duration ? ` ${removed.duration}` : ''}**`);
            }
            if (args[0] === 'setup') {
                db.strikepunish = [
                    { strikes: 3, window: '10m', sanction: 'mute', duration: '10m' },
                    { strikes: 5, window: '30m', sanction: 'kick', duration: null },
                    { strikes: 7, window: '1h', sanction: 'ban', duration: null }
                ];
                client.save(message.guildId);
                return message.channel.send("Les sanctions par défaut ont été **rétablies**");
            }
        }

        const keys = Object.keys(db.antiraid).filter(k => typeof db.antiraid[k] === 'object' && db.antiraid[k] !== null);

        if (args[0] == "all") {
            if (!['derank', 'kick', 'ban'].includes(args[1])) return message.channel.send('Veuillez choisir une sanction valide');
            keys.forEach(key => { if (db.antiraid[key] && 'punish' in db.antiraid[key]) db.antiraid[key].punish = null; });
            db.antiraid.punish = args[1];
            client.save(message.guildId);
            return message.channel.send("Toutes les sanctions ont été modifiées");
        }

        if (!keys.includes(args[0])) return message.channel.send("Veuillez choisir un module valide");
        if (!['mute', 'derank', 'kick', 'ban'].includes(args[1])) return message.channel.send('Veuillez choisir une sanction valide');

        db.antiraid[args[0]].punish = args[1];
        client.save(message.guildId);
        message.channel.send(`La sanction du module \`${args[0]}\` a été modifié`);
    },
};
