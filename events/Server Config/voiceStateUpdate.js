const { Client, VoiceState, ChannelType } = require("discord.js");
const createdChannels = new Set()

module.exports = {
    name: "voiceStateUpdate",
    /**
     * @param {Client} client
     * @param {VoiceState} oldState
     * @param {VoiceState} newState
    */
    async execute(client, oldState, newState) {
        if (newState && newState.guild){
            const db = client.get(newState.guild.id)
            db.tempvocChannels ??= {};
            const dbinfo = db.chtempvoc.find(c => c?.id === newState.channelId)
            if (dbinfo) {
                const categorie = newState.guild.channels.cache.get(dbinfo.category)
        
                const channel = await newState.guild.channels.create({
                    name: dbinfo.name.replaceAll("<user>", newState.member.user.displayName),
                    type: ChannelType.GuildVoice,
                    parent: categorie ?? null,
                });
        
                newState.setChannel(channel);
                createdChannels.add(channel.id);
                db.tempvocChannels[channel.id] = { sourceId: dbinfo.id, ownerId: newState.member.id };
                client.save(newState.guild.id);
            }    
        }
        if (oldState && oldState.guild){
            if (oldState.channel && createdChannels.has(oldState.channel.id) && (oldState.channel.members.size === 0 || oldState.channel.members.every(member => member.user.bot))) {
                oldState.channel.delete().catch(() => null)
                if (oldState.guild) {
                    const db = client.get(oldState.guild.id);
                    if (db.tempvocChannels) {
                        delete db.tempvocChannels[oldState.channel.id];
                        client.save(oldState.guild.id);
                    }
                }
                createdChannels.delete(oldState.channel.id);
            }
        }
    }
}
