const { EmbedBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "vocinfo",
    description: "Affiche les statistiques vocales du serveur.",
    category: "Utilitaire",
    aliases: [],
    permissions: [],
    perm: 1,
    argument: "[user]",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        
        let totalStreamingMembers = 0;
        let connectedCount = 0;
        let totalCameraEnabledMembers = 0;
        let totalDeafMembers = 0;
        let mutedMic = 0;

        message.guild.channels.cache.filter(channel => channel.type === 2).forEach(channel => {
            channel.members.forEach(member => {
                connectedCount++;
                if (member.voice.streaming) totalStreamingMembers++;
                if (member.voice.selfVideo) totalCameraEnabledMembers++;
                if (member.voice.deaf) totalDeafMembers++;
                if (member.voice.mute) mutedMic++;
            });
        });
    
        const embed = new EmbedBuilder()    
            .setTitle(`Salons vocaux`)
            .setDescription(` 
                **\`🔊\` ${connectedCount}** ${connectedCount  > 1 ? 'personnes' : 'personne'} en vocal.
                **\`🎙️\` ${mutedMic}** ${mutedMic > 1 ? 'personnes' : 'personne'} mute micro. 
                **\`🎧\` ${totalDeafMembers}** ${totalDeafMembers > 1 ? 'personnes sont' : 'personne est'} mute casque. 
                **\`🖥️\` ${totalStreamingMembers}** ${totalStreamingMembers > 1 ? 'personnes sont' : 'personne est'} en stream.
                **\`🎥\` ${totalCameraEnabledMembers}** ${totalCameraEnabledMembers > 1 ? 'personnes sont' : 'personne est'} en caméra.
            `.replaceAll('                ', ''))   
            .setColor(db.color)
            .setTimestamp()
            
        message.channel.send({embeds: [embed]})
   },
}