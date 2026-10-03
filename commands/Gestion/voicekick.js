const { Client, Message } = require("discord.js");

module.exports = {
    name: "voicekick",
    description: "Permet d'expulser un membre du vocal temporaire",
    category: "Gestion",
    argument: "<membre>",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        const tempVoc = require('../../utiles/tempvoc').getTempVocContext(message, db);
        if (tempVoc) {
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!member || member.voice.channelId !== tempVoc.channel.id) return;
            const action = require('../../utiles/tempvoc').useTempVocAction(db, tempVoc.channel.id);
            if (!action.allowed) return message.channel.send(require('../../utiles/tempvoc').limitMessage(db, action.remaining));
            await member.voice.disconnect().catch(() => null);
            client.save(message.guildId);
            return;
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] || "rien"}\``);

        if (!member.voice.channel) return message.channel.send(`${member.user.username} n'est connecté dans aucun salon vocal`);

        if (member.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) return message.channel.send(`Vous ne pouvez pas déconnecter un membre supérieur à vous`);
        if (!member.voice.channel.permissionsFor(client.user).has('MoveMembers')) return message.channel.send(`Je n'ai pas les permissions requises pour déconnecter ce membre`);

        await member.voice.disconnect().catch(() => null);
        message.channel.send(`**${member.user.username}** a été déconnecté du salon vocal`);
    }
};
