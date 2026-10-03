const { Client, Message } = require("discord.js");

module.exports = {
    name: "untemprole",
    description: "Supprime un temprôle d'un membre",
    category: "Gestion",
    argument: "<membre> <rôle>",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        if (!db.temproles) db.temproles = [];
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null);
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]) || await message.guild.roles.fetch(args[1]).catch(() => null);
        if (!member) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] ?? "rien"}\``);
        if (!role) return message.channel.send(`Aucun rôle de trouvé pour \`${args[1] ?? "rien"}\``);
        await member.roles.remove(role).catch(() => null);
        db.temproles = db.temproles.filter(t => !(t.memberId === member.id && t.roleId === role.id));
        client.save(message.guildId);
        message.channel.send(`Le temprôle ${role} a été **retiré** de ${member}`);

    },
};
