const { PermissionsBitField, EmbedBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "inviteinfo",
    description: "Affiche les informations d'une invitation.",
    category: "Utilitaire",
    aliases: [ 'invite-info', 'inviteinfos' ],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        if (!args[0]) return message.channel.send("Aucune invitation de trouvée pour `rien`");
        
        const inviteCode = args[0]
            .replaceAll('https://discord.com/invite/', '')
            .replaceAll('https://discord.gg', '')
            .replaceAll('discord.com/invite/')
            .replaceAll('discord.gg/', '')

        const invite = await client.fetchInvite(inviteCode).catch(() => null)
        if (!invite) return message.channel.send(`Aucune invitation de trouvée pour \`${args[0] ?? 'rien'}\``);

        const embed = new EmbedBuilder()
            .setColor(db.color)
            .setTitle(`Informations du serveur`)
            .setDescription(`**Lien**: [\`Invitation\`](<https://discord.gg/${invite.code}>)
                **Expire**: ${invite.expiresAt ? `<t:${Math.round(invite.expiresTimestamp / 1000)}:R>` : "`Expire Jamais`"}
                **Salon**: ${invite.channel} (\`${invite.channel.name}\`)
                **ID du Salon**: \`${invite.channel.id}\`
                **Type de salon**: \`${type(invite.channel.type)}\`
                **Nombre de membres**: \`${invite.channel.type == 3 ? invite.channel.recipients.length : invite.memberCount}\`
                **Inviteur**: \`${invite.inviter ? `${invite.inviter.username} | ${invite.inviterId}` : "Aucun"}\`
                **Nom du Serveur**: \`${invite.guild ? invite.guild.name : "Aucun"}\`
                **ID du serveur**: \`${invite.guild ? invite.guild.id : "Aucune"}\`
                **Ecran de bienvenue**: \`${invite.guild ? invite.guild.features.includes('GUILD_ONBOARDING') ? "Oui" : "Non" : "Non"}\`
                **Invitation Personnalisée**: ${invite.guild && invite.guild.vanityURLCode ? `[\`Vanity\`](https://discord.gg/${invite.guild.vanityURLCode})` : "`Aucune`"}
                **Utilisation Max**: \`${invite.maxUses ?? "Infini"}\``.replaceAll('                ', ''))

                
        message.channel.send({ embeds: [ embed ] })
    },
}

function type(type){
    switch(type){
        case 5: return "Annonce du Serveur";
        case 10: return "Annonce";
        case 13: return "Conférence";
        case 11: return "Fil Publique";
        case 14: return "Directory";
        case 4: return "Catégorie";
        case 0: return "Salon Textuel";
        case 12: return "Fil Privé";
        case 16: return "Salon Media";
        case 2: return "Salon Vocal";
        case 3: return "Groupe";
        case 15: return "Forum";
        case 1: return "DM";
        default: return type;
    }
}