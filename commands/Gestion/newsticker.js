const { Client, Message } = require("discord.js");

module.exports = {
    name: "newsticker",
    description: "Crée un nouveau sticker sur le serveur",
    category: "Gestion",
    argument: "[nom]",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const name = args[0] || 'sticker';
        let url = null;
        const ref = message.reference?.messageId ? await message.channel.messages.fetch(message.reference.messageId).catch(() => null) : null;
        if (ref?.stickers?.size) {
            const sticker = ref.stickers.first();
            url = sticker.url;
        } else if (message.attachments.size) {
            url = message.attachments.first().url;
        }
        if (!url) return message.channel.send("Répondez à un sticker ou joignez une image");
        message.guild.stickers.create({ file: url, name, tags: '😀' })
            .then(s => message.channel.send(`Le sticker \`${s.name}\` a été **créé**`))
            .catch(() => message.channel.send("Je n'ai pas pu créer le sticker"));

    },
};
