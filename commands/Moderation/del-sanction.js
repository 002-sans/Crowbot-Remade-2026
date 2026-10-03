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
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null)
        if (!member || !args[0]) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] ?? "rien"}\``)
        if (isNaN(args[1])) return message.channel.send('Veuillez spécifier le numéro de la sanction à supprimer');

        const warns = db.warns.filter(c => c.id == member.id);
        if (warns.length == 0) return message.channel.send("Cet utilisateur n'a reçu aucune sanction");
        if (args[1] <= 0 || args[1] > warns.length) return message.channel.send(`Vous devez donner un numéro entre 1 et ${warns.length}`);

        const warned = warns.splice(args[1] - 1, 1)[0];
        db.warns = db.warns.map(w => {
            if (w.id === member.id)
                return warns.shift();
            return w;
        }).filter(w => w !== undefined);
        
        client.save(message.guildId);
        message.channel.send(`Sanction supprimée : ${warned.reason}`);
    },
}