const { Client, Message } = require("discord.js");

module.exports = {
    name: "add",
    description: "Ajoute un membre au ticket",
    category: "Configuration du serveur",
    argument: "<membre>",
    aliases: [],
    permissions: [],
    perm: 7,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        const ticket = (db.tickets?.open || []).find(t => t.channelId === message.channel.id);
        if (!ticket) return message.channel.send("Cette commande doit être utilisée dans un ticket");
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!member) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] ?? "rien"}\``);
        await message.channel.permissionOverwrites.edit(member, { ViewChannel: true, SendMessages: true }).catch(() => null);
        message.channel.send(`${member} a été **ajouté** au ticket`);

    },
};
