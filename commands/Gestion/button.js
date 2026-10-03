const { Client, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "button",
    description: "Ajoute/supprime un bouton de décoration sur un message du bot",
    category: "Gestion",
    argument: "<add/del> <lien>",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const ref = message.reference?.messageId ? await message.channel.messages.fetch(message.reference.messageId).catch(() => null) : null;
        if (!ref || ref.author.id !== client.user.id) return message.channel.send("Répondez à un message du bot");
        if (args[0] === 'add') {
            if (!args[1] || !/^https?:\/\//.test(args[1])) return message.channel.send("Veuillez entrer un lien valide");
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('Lien').setStyle(ButtonStyle.Link).setURL(args[1])
            );
            const components = [...(ref.components || []), row].slice(0, 5);
            await ref.edit({ components }).catch(() => null);
            return message.channel.send("Le bouton a été **ajouté**");
        }
        if (args[0] === 'del') {
            await ref.edit({ components: [] }).catch(() => null);
            return message.channel.send("Les boutons ont été **supprimés**");
        }
        message.channel.send(`Utilisation: \`button <add/del> <lien>\``);

    },
};
