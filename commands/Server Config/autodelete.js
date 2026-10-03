const { Client, Message } = require("discord.js");

module.exports = {
    name: "autodelete",
    description: "Active/désactive la suppression automatique des commandes",
    category: "Configuration du serveur",
    argument: "<moderation/snipe> <commande/reply> <on/off>",
    aliases: [],
    permissions: [],
    perm: 7,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        if (!db.snipe) db.snipe = { delete_cmd: false, delete_rep: false, mod_cmd: false, mod_rep: false };
        const type = args[0];
        const target = args[1];
        const state = args[2];
        if (!['moderation', 'snipe'].includes(type) || !['commande', 'reply'].includes(target) || !['on', 'off'].includes(state))
            return message.channel.send(`Utilisation: \`${db.prefix}autodelete <moderation/snipe> <commande/reply> <on/off>\``);
        const key = type === 'snipe'
            ? (target === 'commande' ? 'delete_cmd' : 'delete_rep')
            : (target === 'commande' ? 'mod_cmd' : 'mod_rep');
        db.snipe[key] = state === 'on';
        client.save(message.guildId);
        message.channel.send(`L'autodelete \`${type} ${target}\` a été **${state === 'on' ? 'activé' : 'désactivé'}**`);

    },
};
