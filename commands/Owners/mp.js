const { Client, Message } = require("discord.js");

module.exports = {
    name: "mp",
    description: "Envoie un message privé à un memebre du serveur",
    category: "Owners",
    aliases: [ "dm" ],
    permissions: [],
    argument: "<membre> <texte>",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 8,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (args[0] === 'settings') {
            if (!(client.config.owners || []).includes(message.author.id) && client.config.buyer !== message.author.id) return;
            const db = client.get(message.guildId);
            if (!db.mpsettings) db.mpsettings = { actif: true };
            db.mpsettings.actif = !db.mpsettings.actif;
            client.save(message.guildId);
            return message.channel.send(`Les MP du bot sont maintenant **${db.mpsettings.actif ? 'activés' : 'désactivés'}**`);
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!member || !args[0]) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] || "rien"}\``)
        if (!args[1]) return message.channel.send("Veuillez préciser un message à envoyer")

        member.send(args.slice(1).join(' '))
            .then( () => message.channel.send('message envoyé'))
            .catch(() => message.channel.send("Le message n'a pas pu être envoyé"))
    }
}