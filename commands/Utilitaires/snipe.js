const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "snipe",
    description: "Afficher les derniers messages supprimés.",
    category: "Utilitaire",
    aliases: [],
    permissions: [],
    perm: 1,
    argument: "[chiffre]",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const embeds = []

        const content = client.snipes.get(message.channel.id)
        if (!content) return message.reply('`❌`・Aucun message n\'a été supprimé dans ce salon');

        const number = Number(parseInt(args[0])) ? parseInt(args[0]) : 1
        if (isNaN(number) || number > 10) return message.reply('`❌`・Vous ne pouvez pas afficher plus de 10 messages supprimés');

        for (let i = 0; i < number; i++){
            if (!content[i]) return;
        
            const embed = new EmbedBuilder()
                .setAuthor({name: content[i].author.username, iconURL: content[i].author.displayAvatarURL()})
                .setDescription(content[i].content)
                .setTimestamp(content[i].moment)
                .setColor(db.color)

            if (content[i].images) embed.setImage(content[i].images)
            embeds.push(embed)
        }

        const msg = await message.reply({ embeds: embeds }).catch(() => null);

        setTimeout(() => {
            if (msg && db.snipe.delete_rep) msg.delete();
            if (message && db.snipe.delete_cmd) message.delete();
        }, 1000 * 60)
    },
}