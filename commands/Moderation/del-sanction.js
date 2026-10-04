const { PermissionsBitField, Client, Message } = require("discord.js");

module.exports = {
    name: "del-sanction",
    description: "Supprime une sanction pour un membre",
    category: "Modération",
    argument: "<membre> <nombre>",
    aliases: ["delsanction"],
    perm: 2,
    permissions: [PermissionsBitField.Flags.SendMessages],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const raw = client.resolvers.extractId(args[0]) || args[0];
        const member = message.mentions.members.first()
            || message.guild.members.cache.get(raw)
            || await message.guild.members.fetch(raw).catch(() => null);
        if (!member || !args[0]) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] ?? "rien"}\``);
        if (isNaN(args[1])) return message.channel.send('Veuillez spécifier le numéro de la sanction à supprimer');

        if (!Array.isArray(db.warns)) db.warns = [];
        const memberIndexes = db.warns
            .map((w, i) => (w.id == member.id ? i : -1))
            .filter(i => i >= 0);
        if (memberIndexes.length === 0) return message.channel.send("Cet utilisateur n'a reçu aucune sanction");

        const num = parseInt(args[1], 10);
        if (num <= 0 || num > memberIndexes.length) {
            return message.channel.send(`Vous devez donner un numéro entre 1 et ${memberIndexes.length}`);
        }

        const globalIndex = memberIndexes[num - 1];
        const warned = db.warns[globalIndex];
        db.warns.splice(globalIndex, 1);
        
        client.save(message.guildId);
        message.channel.send(`Sanction supprimée : ${warned.reason}`);
    },
}