const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "autothread",
    description: "Défini/supprime un salon où un thread sera automatiquement créé sur chaque message",
    category: "Paramètres de modération",
    argument: "<add/del> [salon]",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 3,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        db.autothreads ??= [];

        const channels = args.slice(1).length ? client.resolveChannels(message.guild, args.slice(1).join(' '), message.mentions.channels) : [message.channel];

        if (args[0] === 'add') {
            const added = [];
            for (const channel of channels) {
                if (!db.autothreads.includes(channel.id)) {
                    db.autothreads.push(channel.id);
                    added.push(`<#${channel.id}>`);
                }
            }
            client.save(message.guildId);

            if (added.length === 1) {
                return message.channel.send(`Le salon ${added[0]} est maintenant défini comme salon autothreadé`);
            }
            if (added.length > 1) {
                return message.channel.send(`Les salons ${added.join(', ')} sont maintenant définis comme salons autothreadés`);
            }
            return message.channel.send("Ces salons sont déjà autothreadés");
        }

        if (args[0] === 'del') {
            const removed = [];
            for (const channel of channels) {
                if (db.autothreads.includes(channel.id)) {
                    db.autothreads = db.autothreads.filter(c => channel.id !== c);
                    removed.push(`<#${channel.id}>`);
                }
            }
            client.save(message.guildId);

            if (removed.length === 1) {
                return message.channel.send(`Le salon ${removed[0]} n'est plus défini comme salon autothreadé`);
            }
            if (removed.length > 1) {
                return message.channel.send(`Les salons ${removed.join(', ')} ne sont plus définis comme salons autothreadés`);
            }
            return message.channel.send("Ces salons ne sont pas dans la liste");
        }
    },
};