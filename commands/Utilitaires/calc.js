const { Client, Message } = require("discord.js");

module.exports = {
    name: "calc",
    description: "Résout des calculs",
    category: "Utilitaire",
    argument: "<calcul>",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const expr = args.join(' ');
        if (!expr) return message.channel.send("Veuillez entrer un calcul");
        if (!/^[0-9+\-*/().%\s]+$/.test(expr)) return message.channel.send("Expression invalide");
        try {
            const result = Function(`"use strict"; return (${expr})`)();
            message.channel.send(`\`${expr}\` = **${result}**`);
        } catch {
            message.channel.send("Impossible de résoudre ce calcul");
        }

    },
};
