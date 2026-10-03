const { Client, Message, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder } = require("discord.js");
const load = "█";
const charge = "-";

module.exports = {
    name: "loading",
    description: "Envoie une barre de chargement",
    category: "Gestion",
    argument: "<temps> <texte>",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (!args[0] || isNaN(client.ms(args[0]))) return message.channel.send("Format incorrect: essayez `loading 3h test`")
        if (client.ms(args[0]) < 1000 * 60 * 2) return message.channel.send("Durée trop faible")

        const m = await message.channel.send(`${args[1] ? args.slice(1).join(' ') + "\n" : ""}[${charge.repeat(50)}] 0%`)

        for (let i = 0; i < 101; i++) {
            if (!m) continue;
            const loads = Math.floor(i / 4);
            const charges = 50 - loads * 2;
            m.edit(`${args[1] ? args.slice(1).join(' ') + "\n" : ""}[${load.repeat(loads)}${charge.repeat(charges)}] ${i}%`).catch(() => null)
            await new Promise(r => setTimeout(r, client.ms(args[0]) / 100))
        }
    }
}