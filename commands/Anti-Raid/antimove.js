const { Client, Message } = require("discord.js");

module.exports = {
    name: "antimove",
    description: "Active/désactive l'antimove",
    category: "Antiraid",
    argument: "<off/on/max> [nombre/durée]",
    aliases: [],
    permissions: [],
    perm: 6,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
     */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        if (!db.antiraid.antimove) db.antiraid.antimove = { max: false, etat: false, punish: null, nombre: 5, durée: 10000 };
        const conf = db.antiraid.antimove;
        if (args[0] && args[0].includes('/')) {
            const [nombre, duree] = args[0].split('/');
            const ms = client.ms(duree);
            if (isNaN(nombre) || !ms) return message.channel.send("Format invalide, utilisez `nombre/durée`");
            conf.nombre = Number(nombre);
            conf.durée = ms;
            client.save(message.guildId);
            return message.channel.send(`L'antimove a été réglé sur \`${nombre}\` moves / \`${duree}\``);
        }
        switch (args[0]) {
            case 'on':
                conf.etat = true; conf.max = false;
                client.save(message.guildId);
                return message.channel.send("L'anti move a été **activé**");
            case 'off':
                conf.etat = false; conf.max = false;
                client.save(message.guildId);
                return message.channel.send("L'anti move a été **désactivé**");
            case 'max':
                conf.etat = true; conf.max = true;
                client.save(message.guildId);
                return message.channel.send("L'anti move est maintenant au **maximum**");
            default:
                return message.channel.send(`Utilisation: \`${db.prefix}antimove <on/off/max>\``);
        }
    },
};
