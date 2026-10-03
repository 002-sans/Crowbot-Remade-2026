const { PermissionsBitField, Client, Message } = require("discord.js");

module.exports = {
    name: "nick",
    description: "Change le pseudo d'un membre sur le serveur.",
    category: "Modération",
    argument: "<membre> [nom]",
    aliases: [],
    permissions: [],
    perm: 2,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (!args.length) return message.channel.send(`Aucun membre de trouvé pour \`rien\``);

        const groups = client.resolvers.splitArgumentGroups(args.join(' '), 2);
        const memberInput = groups[0] || args[0];
        const newNick = groups[1] || null;

        const members = await client.resolveMembers(message.guild, memberInput, message.mentions.members);
        if (!members.length) return message.channel.send(`Aucun membre de trouvé pour \`${memberInput || "rien"}\``);

        let successCount = 0;
        let failCount = 0;

        for (const member of members) {
            try {
                await member.setNickname(newNick);
                successCount++;
            } catch {
                failCount++;
            }
        }

        if (members.length === 1) {
            if (successCount > 0) return message.channel.send(`${members[0]} a été renommé ${newNick ? `en \`${newNick}\`` : 'par son pseudo par défaut'}`);
            return message.channel.send("Je n'ai pas les permissions de renommer ce membre");
        }

        return message.channel.send(`\`${successCount}\` membre(s) ont été renommés ${newNick ? `en \`${newNick}\`` : 'par leur pseudo par défaut'}`);
    },
};