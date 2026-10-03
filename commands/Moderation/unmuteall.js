const { Client, Message } = require("discord.js");

module.exports = {
    name: "unmuteall",
    description: "Supprime tous les mutes en cours",
    category: "Modération",
    argument: "",
    aliases: [],
    permissions: [],
    perm: 2,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
     */
    async execute(client, message, args) {

        const mutes = message.guild.members.cache.filter(m => m.isCommunicationDisabled());
        if (mutes.size === 0) return message.channel.send("Il n'y a aucun membre mute sur le serveur");
        const msg = await message.channel.send(`Je vais unmute ${mutes.size} membre${mutes.size > 1 ? "s" : ""}`);
        let unmute = 0;
        for (const member of mutes.values()) {
            try { await member.timeout(null); unmute++; } catch {}
        }
        msg.edit(`J'ai unmute ${unmute}/${mutes.size} membre${mutes.size > 1 ? "s" : ""}`);

    },
};
