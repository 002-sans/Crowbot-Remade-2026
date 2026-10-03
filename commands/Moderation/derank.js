const { PermissionsBitField, Client, Message } = require("discord.js");

module.exports = {
    name: "derank",
    description: "Permet de retirer tous les rôles a un membre.",
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
        const reason = groups[1] ? `pour ${groups[1]}` : "";

        const members = await client.resolveMembers(message.guild, memberInput, message.mentions.members);
        if (!members.length) return message.channel.send(`Aucun membre de trouvé pour \`${memberInput || "rien"}\``);

        const db = client.get(message.guildId);
        const noderank = (db.antiraid?.noderank || []).filter(id => message.guild.roles.cache.has(id));

        let successCount = 0;
        let failCount = 0;

        for (const member of members) {
            if (member.id === message.guild.ownerId || message.member.roles.highest.position <= member.roles.highest.position) {
                failCount++;
                if (members.length === 1) {
                    if (member.id === message.guild.ownerId) return message.channel.send("T'essayes de derank le propriétaire du serveur ??");
                    return message.channel.send("Vous n'avez pas la permission de retirer de rôle à ce membre");
                }
                continue;
            }

            try {
                await member.roles.set(noderank, `Derank par ${message.author.displayName} (${message.author.id}) ${reason}`);
                successCount++;
                if (members.length === 1) {
                    return message.channel.send(`${member.displayName} a été **derank** ${groups[1] ? `pour \`${groups[1]}\`` : ""}`);
                }
            } catch {
                failCount++;
                if (members.length === 1) {
                    return message.channel.send(`${member.displayName} n'a pas pu être derank`);
                }
            }
        }

        return message.channel.send(`\`${successCount}\` membre(s) ont été **derank** ${groups[1] ? `pour \`${groups[1]}\`` : ""}`);
    },
};