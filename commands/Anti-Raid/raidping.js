const { Client, Message } = require("discord.js");

module.exports = {
    name: "raidping",
    description: "Modifie les rôles mentionnés en cas de raid",
    category: "Antiraid",
    argument: "<rôle>",
    aliases: [],
    permissions: [],
    perm: 6,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
     */
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        if (!db.raidping) db.raidping = [];
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || await message.guild.roles.fetch(args[0]).catch(() => null);
        if (!role && !args[0]) {
            const list = db.raidping.map(id => `<@&${id}>`).join(', ') || 'Aucun';
            return message.channel.send(`Rôles raidping: ${list}`);
        }
        if (!role) return message.channel.send(`Aucun rôle de trouvé pour \`${args[0] ?? "rien"}\``);
        if (db.raidping.includes(role.id)) {
            db.raidping = db.raidping.filter(id => id !== role.id);
            client.save(message.guildId);
            return message.channel.send(`${role} a été **retiré** des raidping`);
        }
        db.raidping.push(role.id);
        client.save(message.guildId);
        message.channel.send(`${role} a été **ajouté** aux raidping`);

    },
};
