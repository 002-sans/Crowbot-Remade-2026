const { PermissionsBitField, Client, Message } = require("discord.js");
const { sendModLog } = require("../../utiles/modlog");

module.exports = {
    name: "ban",
    description: "Permet de bannir un utilisateur du serveur.",
    category: "Modération",
    argument: "<membre> [raison]",
    aliases: [],
    perm: 2,
    permissions: [PermissionsBitField.Flags.BanMembers],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (!args.length) return message.channel.send(`Aucun utilisateur de trouvé pour \`rien\``);

        const db = client.get(message.guildId);
        const groups = client.resolvers.splitArgumentGroups(args.join(' '), 2);
        const targetInput = groups[0] || args[0];
        const reasonInput = groups[1] || "";
        const reason = reasonInput ? `Banni par ${message.author.displayName} (${message.author.id}): ${reasonInput}` : `Banni par ${message.author.displayName} (${message.author.id})`;

        const targets = client.cleanInput(targetInput);
        if (!targets.length && message.mentions.users.size > 0) {
            targets.push(...message.mentions.users.keys());
        }

        if (!targets.length) return message.channel.send(`Aucun utilisateur de trouvé pour \`${targetInput || "rien"}\``);

        let successCount = 0;
        let failCount = 0;

        for (const target of targets) {
            const member = message.guild.members.cache.get(target) || await message.guild.members.fetch(target).catch(() => null);
            const user = member?.user || client.users.cache.get(target) || await client.users.fetch(target).catch(() => null);

            if (!user) {
                failCount++;
                continue;
            }

            if (member) {
                if (message.member.roles.highest.position <= member.roles.highest.position || member.id === message.guild.ownerId) {
                    failCount++;
                    continue;
                }
            }

            try {
                await message.guild.bans.create(user.id, { reason, deleteMessageSeconds: db.banclear ?? 60 * 60 * 7 });
                sendModLog(client, message.guild, "ban", "Ban", `${user} a été banni par ${message.author}\n${reasonInput || "Aucune raison"}`);
                successCount++;
                if (targets.length === 1) {
                    return message.channel.send(`${user} (\`${user.globalName || user.username}\`) a été **banni** ${reasonInput ? `pour \`${reasonInput}\`` : ''}`);
                }
            } catch {
                failCount++;
                if (targets.length === 1) {
                    return message.channel.send(`${user} (\`${user.globalName || user.username}\`) n'a pas pu être **banni**`);
                }
            }
        }

        return message.channel.send(`\`${successCount}\` membre(s) ont été **bannis** ${reasonInput ? `pour \`${reasonInput}\`` : ''}`);
    },
};
