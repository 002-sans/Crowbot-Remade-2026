const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "blrank",
    description: "Gère la blacklist rank",
    category: "Antiraid",
    argument: "[on/off/max/danger/all/add/del] [membre]",
    aliases: [],
    permissions: [],
    perm: 6,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        if (!db.blrank) db.blrank = { etat: false, max: false, type: 'danger', users: [] };
        const conf = db.blrank;

        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setTitle('Blacklist rank')
                .setColor(db.color)
                .setDescription(conf.users.length ? conf.users.map((id, i) => `${i + 1} - <@${id}>`).join('\n') : 'Aucun membre')
                .setFooter({ text: db.footer ?? 'ζ͜͡Crow Bots' });
            return message.channel.send({ embeds: [embed] });
        }
        if (args[0] === 'on') { conf.etat = true; conf.max = false; client.save(message.guildId); return message.channel.send("La blacklist rank a été **activée**"); }
        if (args[0] === 'off') { conf.etat = false; conf.max = false; client.save(message.guildId); return message.channel.send("La blacklist rank a été **désactivée**"); }
        if (args[0] === 'max') { conf.etat = true; conf.max = true; client.save(message.guildId); return message.channel.send("La blacklist rank est maintenant au **maximum**"); }
        if (args[0] === 'danger' || args[0] === 'all') { conf.type = args[0]; client.save(message.guildId); return message.channel.send(`La blacklist rank s'applique maintenant aux rôles \`${args[0]}\``); }
        if (args[0] === 'add') {
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || await message.guild.members.fetch(args[1]).catch(() => null);
            if (!member) return message.channel.send(`Aucun membre de trouvé pour \`${args[1] ?? "rien"}\``);
            if (conf.users.includes(member.id)) return message.channel.send(`${member.displayName} est déjà dans la blacklist rank`);
            conf.users.push(member.id); client.save(message.guildId);
            return message.channel.send(`${member.displayName} a été **ajouté** à la blacklist rank`);
        }
        if (args[0] === 'del') {
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || await message.guild.members.fetch(args[1]).catch(() => null);
            if (!member) return message.channel.send(`Aucun membre de trouvé pour \`${args[1] ?? "rien"}\``);
            conf.users = conf.users.filter(id => id !== member.id); client.save(message.guildId);
            return message.channel.send(`${member.displayName} a été **retiré** de la blacklist rank`);
        }

    },
};
