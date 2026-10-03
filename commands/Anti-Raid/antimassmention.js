const { Client, Message } = require("discord.js");

module.exports = {
    name: "antimassmention",
    description: "Permet de paramétrer l'antimassmention.",
    category: "Antiraid",
    argument: "<on/off/max/nombre>",
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
        db.antiraid ??= {};
        db.antiraid.antimassmention ??= { etat: false, max: false, nombre: 4 };
        const setting = db.antiraid.antimassmention;
        const option = String(args[0] || '').toLowerCase();

        if (!option) return message.channel.send(`Format incorrect : essayez \`${db.prefix}antimassmention on\`, \`${db.prefix}antimassmention off\`, \`${db.prefix}antimassmention max\` ou \`${db.prefix}antimassmention <nombre>\``);

        switch (option) {
            default: {
                const number = Number(option);
                if (!Number.isInteger(number) || number < 1) return message.channel.send("Veuillez entrer un nombre valide");
                setting.nombre = number;
                client.save(message.guildId);
                return message.channel.send("L'anti mass mention a été mis à jour");
            }

            case 'on':
                if (setting.etat === true && setting.max !== true) return message.channel.send("L'anti mass mention est déjà activé")
                
                setting.etat = true
                setting.max  = false
                client.save(message.guildId);
                return message.channel.send("L'anti mass mention a été activé");
        
            case 'off':
                if (setting.etat === false) return message.channel.send("L'anti mass mention est déjà désactivé")
                
                setting.etat = false
                setting.max  = false
                client.save(message.guildId);
                return message.channel.send("L'anti mass mention a été désactivé");

            case 'max':
                if (setting.max === true) return message.channel.send("L'anti mass mention est déjà au max")
                
                setting.etat = true
                setting.max  = true
                client.save(message.guildId);
                return message.channel.send("L'anti mass mention est maintenant au maximum");
        }
    },
};
