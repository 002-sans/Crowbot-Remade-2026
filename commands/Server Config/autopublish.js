const { Client, Message } = require("discord.js");

module.exports = {
    name: "autopublish",
    description: "Publie automatiquement un message dans un salon d'actualitées",
    category: "Configuration du serveur",
    aliases: [],
    permissions: [],
    argument: "<on/off>",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 7,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const prefix = db.prefix ?? client.config.prefix ?? '+';

        if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
            return message.channel.send(`Utilisation: \`${prefix}autopublish <on/off>\``);
        }

        switch (args[0].toLowerCase()) {
            case "on":
                if (db.autopublish === true) return message.channel.send("L'autopublish est déjà activé");
                db.autopublish = true;
                client.save(message.guildId);
                return message.channel.send("L'autopublish est maintenant activé");

            case "off":
                if (db.autopublish === false) return message.channel.send("L'autopublish est déjà désactivé");
                db.autopublish = false;
                client.save(message.guildId);
                return message.channel.send("L'autopublish est maintenant désactivé");
        }    
    }
};