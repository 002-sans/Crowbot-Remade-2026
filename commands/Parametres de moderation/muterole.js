const { Client, Message } = require("discord.js");

module.exports = {
    name: "muterole",
    description: "Crée ou met à jour le rôle mute",
    category: "Paramètres de modération",
    argument: "",
    aliases: [],
    permissions: [],
    perm: 3,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
     */
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        let role = message.guild.roles.cache.get(db.muterole);
        if (!role) {
            role = await message.guild.roles.create({ name: 'Muted', color: '#000000', reason: `Muterole par ${message.author.tag}` }).catch(() => null);
            if (!role) return message.channel.send("Je n'ai pas pu créer le rôle mute");
            db.muterole = role.id;
            client.save(message.guildId);
        }
        let errors = 0;
        for (const channel of message.guild.channels.cache.values()) {
            try {
                await channel.permissionOverwrites.edit(role, { SendMessages: false, AddReactions: false, Speak: false, Connect: false });
            } catch { errors++; }
        }
        message.channel.send(`Le rôle mute ${role} a été **configuré**${errors ? ` (\`${errors}\` erreurs de permissions)` : ''}`);

    },
};
