const { Client, Message } = require("discord.js");

module.exports = {
    name: "leaveserver",
    description: "Quitte un serveur du bot.",
    category: "Bot Control",
    argument: "<numéro/ID>",
    aliases: ["leavebot"],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        let guild;
        
        const index = parseInt(args[0], 10) - 1;
        if (index >= 0 && index < client.guilds.cache.size) 
            guild = client.guilds.cache.at(index);
        else 
            guild = client.guilds.cache.get(args[0]);
        
        if (!guild) return message.channel.send('Aucun serveur de trouvé pour ce numéro')
        guild.leave()
        message.channel.send(`J'ai bien quitté le serveur \`${guild.name}\``)
   },
}