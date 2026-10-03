const { PermissionsBitField, Client, Message } = require("discord.js");
const { sendModLog } = require("../../utiles/modlog");

module.exports = {
    name: "kick",
    description: "Permet d'expulser un membre du serveur.",
    category: "Modération",
    argument: "<membre> [raison]",
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
        const reasonInput = groups[1] || "";
        const reason = reasonInput ? `Expulsé par ${message.author.displayName} (${message.author.id}): ${reasonInput}` : `Expulsé par ${message.author.displayName} (${message.author.id})`;

        const members = await client.resolveMembers(message.guild, memberInput, message.mentions.members);
        if (!members.length) return message.channel.send(`Aucun membre de trouvé pour \`${memberInput || "rien"}\``);

        let successCount = 0;
        let failCount = 0;

        for (const member of members) {
            if (message.member.roles.highest.position <= member.roles.highest.position || member.id === message.guild.ownerId || !member.kickable) {
                failCount++;
                if (members.length === 1) {
                    if (member.id === message.guild.ownerId) return message.channel.send("Vous ne pouvez pas expulser le propriétaire du serveur");
                    return message.channel.send(`Vous ne pouvez pas expulser ${member.displayName}`);
                }
                continue;
            }

            try {
                await member.kick(reason);
                sendModLog(client, message.guild, "kick", "Kick", `${member} a été expulsé par ${message.author}\n${reasonInput || "Aucune raison"}`);
                successCount++;
                if (members.length === 1) {
                    return message.channel.send(`${member} (\`${member.user.globalName || member.user.username}\`) a été **expulsé** ${reasonInput ? `pour \`${reasonInput}\`` : ''}`);
                }
            } catch {
                failCount++;
                if (members.length === 1) {
                    return message.channel.send(`${member} (\`${member.user.globalName || member.user.username}\`) n'a pas pu être expulsé`);
                }
            }
        }

        return message.channel.send(`\`${successCount}\` membre(s) ont été **expulsés** ${reasonInput ? `pour \`${reasonInput}\`` : ''}`);
    },
};
