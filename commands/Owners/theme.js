const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "theme",
    description: "Modifie la couleur des embeds du serveur",
    category: "Owners",
    aliases: [],
    permissions: [],
    argument: "<couleur>",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 8,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        
        const invalidEmbed = new EmbedBuilder()
            .setTitle("Couleur invalide")
            .setColor(16711680);

        if (!args[0]) return message.channel.send({ embeds: [invalidEmbed] });

        const raw = args[0].replace(/^#/, '');
        if (!/^[0-9A-Fa-f]{6}$/.test(raw)) {
            return message.channel.send({ embeds: [invalidEmbed] });
        }

        const hex = raw.toLowerCase();
        const embed = new EmbedBuilder()
            .setDescription(`La couleur a été modifiée`)
            .setColor(`#${hex}`);

        try {
            await message.channel.send({ embeds: [embed] });
            db.color = `#${hex}`;
            client.save(message.guildId);
        } catch {
            return message.channel.send({ embeds: [invalidEmbed] });
        }
    },
}