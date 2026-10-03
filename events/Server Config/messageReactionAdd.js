const { Client, User, MessageReaction } = require("discord.js");

module.exports = {
    name: "messageReactionAdd",
    /**
     * @param {Client} client
     * @param {MessageReaction} reaction
     * @param {User} user
    */
    async execute(client, reaction, user) {
        if (!reaction.message.inGuild() || user.bot) return;
        const db = client.get(reaction.message.guildId);
        
        if (user.bot) return;

        const reactionDB = db.rolemenu.find(r => r.messageId == reaction.message.id)
        if (!reactionDB) return;

        const member = reaction.message.guild.members.cache.get(user.id);
        if (!member) return;
    
        const reactionData = reactionDB.reactions.find(c => c.emoji == reaction.emoji.name)
        if (reactionData && !member.roles.cache.has(reactionData.id)) member.roles.add(reactionData.id, "Rolemenu").catch(() => null);
        else if (reactionData && member.roles.cache.has(reactionData.id)) member.roles.remove(reactionData.id, "Rolemenu").catch(() => null)

        reaction.users.remove(user).catch(() => null);
    }
}