const { PermissionsBitField, Client, Message } = require("discord.js");

module.exports = {
    name: "delrole",
    description: "Permet d'enlever un ou des rôles a un membre.",
    category: "Modération",
    argument: "<membre> <role>",
    aliases: [],
    perm: 2,
    permissions: [PermissionsBitField.Flags.ManageRoles],
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
        const roleInput = groups[1] || args.slice(1).join(' ');

        const members = await client.resolveMembers(message.guild, memberInput, message.mentions.members);
        if (!members.length) return message.channel.send(`Aucun membre de trouvé pour \`${memberInput || "rien"}\``);

        const roles = await client.resolveRoles(message.guild, roleInput, message.mentions.roles);
        if (!roles.length) return message.channel.send(`Aucun role de trouvé pour \`${roleInput || "rien"}\``);

        let successCount = 0;
        let failCount = 0;

        for (const member of members) {
            for (const role of roles) {
                if (!role.editable || message.member.roles.highest.position <= role.position || message.member.roles.highest.position <= member.roles.highest.position) {
                    failCount++;
                    continue;
                }
                if (!member.roles.cache.has(role.id)) continue;
                try {
                    await member.roles.remove(role);
                    successCount++;
                } catch {
                    failCount++;
                }
            }
        }

        const roleNames = roles.map(r => r.name).join(', ');
        const memberNames = members.map(m => m.displayName).join(', ');

        if (members.length === 1 && roles.length === 1) {
            if (successCount > 0) return message.channel.send(`Le rôle ${roles[0].name} a été retiré à ${members[0]}`);
            return message.channel.send(`Le rôle ${roles[0].name} n'a pas pu être retiré à ${members[0]}`);
        }

        return message.channel.send(`Le(s) rôle(s) \`${roleNames}\` ont été retirés pour \`${memberNames}\` (${successCount} retrait(s))`);
    },
};