const { PermissionsBitField, Client, Message } = require("discord.js");

module.exports = {
    name: "unlockname",
    description: "Déverrouille le pseudo d'un membre.",
    category: "Modération",
    argument: "<membre>",
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

        if (!args.length) return message.channel.send(`Format incorrect: essayez \`${db.prefix}unlockname <@User>\``);

        const members = await client.resolveMembers(message.guild, args.join(' '), message.mentions.members);
        if (!members.length) return message.channel.send(`Aucun membre de trouvé pour \`${args.join(' ') || "rien"}\``);

        let count = 0;
        for (const member of members) {
            if (db.locknames[member.id]) {
                delete db.locknames[member.id];
                count++;
            }
        }

        client.save(message.guildId);

        if (members.length === 1) {
            return message.channel.send(`Le pseudo de ${members[0]} sur ce serveur est maintenant déverrouillé`);
        }

        return message.channel.send(`Le pseudo de \`${count}\` membre(s) est maintenant déverrouillé`);
    },
};
