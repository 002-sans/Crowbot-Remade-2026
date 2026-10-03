const { Client, Message } = require("discord.js");

module.exports = {
    name: "timeout",
    description: "Active/désactive l'utilisation du Timeout Discord",
    category: "Paramètres de modération",
    argument: "<on/off>",
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
        if (args[0] === 'on') {
            if (db.timeout !== false) return message.channel.send("Le timeout Discord est déjà activé");
            db.timeout = true;
            client.save(message.guildId);
            return message.channel.send("Le timeout Discord a été **activé**");
        }
        if (args[0] === 'off') {
            if (db.timeout === false) return message.channel.send("Le timeout Discord est déjà désactivé");
            db.timeout = false;
            client.save(message.guildId);
            return message.channel.send("Le timeout Discord a été **désactivé**");
        }
        message.channel.send(`Utilisation: \`${db.prefix}timeout <on/off>\``);

    },
};
