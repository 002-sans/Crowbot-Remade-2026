const { Client, Message } = require("discord.js");

module.exports = {
    name: "temprole",
    description: "Ajoute un rôle à un membre pour une durée",
    category: "Gestion",
    argument: "<membre> <rôle> <durée>",
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
        const time = client.ms(args[2]);
        if (!member) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] ?? "rien"}\``);
        if (!role) return message.channel.send(`Aucun rôle de trouvé pour \`${args[1] ?? "rien"}\``);
        if (!time) return message.channel.send("Veuillez entrer une durée valide");
        await member.roles.add(role).catch(() => null);
        db.temproles.push({ memberId: member.id, roleId: role.id, date: Date.now() + time, guildId: message.guildId });
        client.save(message.guildId);
        message.channel.send(`${role} a été ajouté à ${member} pour \`${args[2]}\``);

    },
};
