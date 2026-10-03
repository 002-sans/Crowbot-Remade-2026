const { Client, Message } = require("discord.js");

module.exports = {
    name: "unmassiverole",
    description: "Retire un rôle à tous les membres",
    category: "Gestion",
    argument: "[rôle] [rôle]",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || await message.guild.roles.fetch(args[0]).catch(() => null);
        const filterRole = message.mentions.roles.at(1) || message.guild.roles.cache.get(args[1]);
        if (!role) return message.channel.send(`Aucun rôle de trouvé pour \`${args[0] ?? "rien"}\``);
        const members = filterRole
            ? message.guild.members.cache.filter(m => m.roles.cache.has(filterRole.id) && m.roles.cache.has(role.id))
            : message.guild.members.cache.filter(m => m.roles.cache.has(role.id));
        const msg = await message.channel.send(`Retrait de ${role} à ${members.size} membres...`);
        let ok = 0;
        for (const member of members.values()) {
            try { await member.roles.remove(role); ok++; } catch {}
        }
        msg.edit(`${role} a été retiré de \`${ok}\`/${members.size} membres`);

    },
};
