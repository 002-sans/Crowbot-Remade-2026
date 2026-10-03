const { PermissionsBitField, Client, Message } = require("discord.js");

module.exports = {
    name: "lockname",
    description: "Verrouille le pseudo d'un membre.",
    category: "Modération",
    argument: "<membre> <pseudo>",
    aliases: [],
    permissions: [PermissionsBitField.Flags.ManageNicknames],
    perm: 2,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        db.locknames ??= {};

        if (!args.length) return message.channel.send(`Format incorrect: essayez \`${db.prefix}lockname <@User> test\``);

        const groups = client.resolvers.splitArgumentGroups(args.join(' '), 2);
        const memberInput = groups[0] || args[0];
        const nickname = groups[1] || "";

        if (!nickname) return message.channel.send(`Format incorrect: essayez \`${db.prefix}lockname <@User> test\``);

        const members = await client.resolveMembers(message.guild, memberInput, message.mentions.members);
        if (!members.length) return message.channel.send(`Format incorrect: essayez \`${db.prefix}lockname <@${memberInput || "User"}> test\``);

        let successCount = 0;

        for (const member of members) {
            try {
                await member.setNickname(nickname, `Pseudo verrouillé par ${message.author.tag}`);
                db.locknames[member.id] = nickname;
                successCount++;
            } catch {
                // ignore
            }
        }

        client.save(message.guildId);

        if (members.length === 1) {
            if (successCount > 0) return message.channel.send(`Le pseudo de ${members[0]} sur ce serveur est maintenant verrouillé sur le ${nickname}`);
            return message.channel.send("Je n'ai pas les permissions de modifier le pseudo de ce membre.");
        }

        return message.channel.send(`Le pseudo de \`${successCount}\` membre(s) est maintenant verrouillé sur \`${nickname}\``);
    },
};
