const { Client, Message } = require("discord.js");
const { addPerm } = require("../../utiles/perms");

module.exports = {
    name: "setperm",
    description: "Donne une permission (niveau ou commande) à un rôle ou un membre",
    category: "Owners",
    aliases: [],
    permissions: [],
    argument: "<niveau> <commande|@role/@membre> | <commande> <@role/@membre>",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 8,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
     */
    async execute(client, message, args) {
        if (!args[0] || !args[1]) {
            return message.channel.send(`Utilisation: \`${client.get(message.guildId).prefix}setperm <niveau> <commande|/[@role/@membre]>\``);
        }
        return addPerm(client, message, args[0], args.slice(1));
    },
};
