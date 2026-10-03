const { PermissionsBitField, EmbedBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "eval",
    description: "Eval un code.",
    category: "Devs",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        try {
            let code = eval(args.join(" "));
            if (typeof code !== 'string') code = require('node:util').inspect(code, { depth: 0 });
            const embed = new EmbedBuilder()
                .addFields(
                    { name: ':inbox_tray: Entrée', value: `\`\`\`js\n${args.join(" ").slice(0, 1000)}\n\`\`\`` },
                    { name: ':outbox_tray: Sortie', value: `\`\`\`js\n${String(code).slice(0, 1000)}\n\`\`\`` }
                )
            message.channel.send({ embeds: [embed] }).catch(console.error);
        } catch (e) {
            message.channel.send(`\`\`\`js\n${e}\n\`\`\``).catch(console.error);
        }
    },
}