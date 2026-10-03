const { PermissionsBitField, Client, Message } = require("discord.js");
const { sendModLog } = require("../../utiles/modlog");

module.exports = {
    name: "warn",
    description: "Donne un warn à un ou plusieurs membres, une raison peut être précisée",
    category: "Modération",
    argument: "<membre> [raison]",
    aliases: [],
    perm: 2,
    permissions: [PermissionsBitField.Flags.SendMessages],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (!args.length) return message.channel.send(`Aucun membre de trouvé pour \`rien\``);

        const db = client.get(message.guildId);
        db.warns ??= [];

        const groups = client.resolvers.splitArgumentGroups(args.join(' '), 2);
        const memberInput = groups[0] || args[0];
        const reasonInput = groups[1] || "";

        const members = await client.resolveMembers(message.guild, memberInput, message.mentions.members);
        if (!members.length) return message.channel.send(`Aucun membre de trouvé pour \`${memberInput || "rien"}\``);

        const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        for (const member of members) {
            db.warns.push({
                id: member.id,
                reason: `${dateStr}: warn ${reasonInput ? `- ${reasonInput}` : ''}`
            });
            sendModLog(client, message.guild, "warn", "Warn", `${member} a été warn par ${message.author}\n${reasonInput || "Aucune raison"}`);
            member.send(`Vous avez été **warn** sur ${message.guild.name} ${reasonInput ? `pour \`${reasonInput}\`` : ''}`).catch(() => null);
        }

        client.save(message.guildId);

        if (members.length === 1) {
            return message.channel.send(`${members[0]} a été **warn** ${reasonInput ? `pour \`${reasonInput}\`` : ''}`);
        }

        return message.channel.send(`\`${members.length}\` membre(s) ont été **warns** ${reasonInput ? `pour \`${reasonInput}\`` : ''}`);
    },
};
