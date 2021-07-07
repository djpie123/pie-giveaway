const mongoose = require('mongoose');
const Giveaway = require('./Giveaway');
const moment = require('moment');
const { schedule, getWinner, endGiveaway } = require('./functions');
const GiveawayModel = require('../models/GiveawayModel');
const scheduler = require('node-schedule');
const { EventEmitter } = require('events');
const {MessageEmbed} = require("discord.js")
const winmoji = ":trophy:"
const winemo = "🎁"
const hostemo = ":man_detective: "
const { MessageButton, MessageActionRow } = require('discord-buttons');
class GiveawayCreator extends EventEmitter {
    /**
     * 
     * @param {Discord.Client} client - A discord.js client.
     * @param {string} url - A MongoDB connection string.
     */

    constructor(client, url = '', emoji = '🎉', color = 0x7289da) {
        super();

        if (!client) throw new Error("A client wasn't provided.");
        if (!url) throw new Error("A connection string wasn't provided.");

        this.client = client;
        this.mongoUrl = url;
        this.emoji = emoji;
        this.color = color;

        mongoose.connect(this.mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        this.client.on('ready', async () => {
            const now = new Date();

            const giveaways = await GiveawayModel.find({ endsOn: { $gt: now }, hasEnded: 'False' });

            await schedule(this, giveaways);
        });
    }

    /**
     * 
     * @param {GiveawayOptions} options - Options for the giveaway.
     */

    async startGiveaway(options) {
        if (!options.duration) throw new Error("You didn't provide a duration.");
        if (!options.channelId) throw new Error("You didn't provide a channel ID.");
        if (!options.guildId) throw new Error("You didn't provide a guild ID.");
        if (!options.prize) throw new Error("You didn't provide a prize.");
        if (!options.winners || isNaN(options.winners)) throw new Error("You didn't provide an amount of winners OR winners is not a number.");
        if (!options.hostedBy) throw new Error("Please provide a user ID for the person who hosted the giveaway.");
        const winmoji = ":trophy:"
        const winemo = "🎁"
        const hostemo = ":man_detective: "
        const guild = this.client.guilds.cache.get(options.guildId);
        const channel = guild.channels.cache.get(options.channelId);
        const giveawayEmbed = new MessageEmbed()
        .setAuthor(options.prize)
        .setColor("RANDOM")
        .setDescription(`${winemo} Winners: ${options.winners}
        ${hostemo} Hosted By: ${this.client.users.cache.get(options.hostedBy).toString()}`)
        .setFooter(`Ends ${moment.utc(new Date(Date.now() + options.duration)).format('lll')}`);
        const msg = await channel.send(giveawayEmbed);
        await msg.react(this.emoji);
        
        const newGiveaway = new Giveaway({
            prize: options.prize,
            duration: options.duration,
            channelId: options.channelId,
            guildId: options.guildId,
            endsOn: new Date(Date.now() + options.duration),
            startsOn: new Date(),
            messageId: msg.id,
            winners: options.winners,
            hostedBy: options.hostedBy
        });
        await schedule(this, [newGiveaway]);
        this.emit('giveawayStart', newGiveaway);
        return newGiveaway;
    }
async createGiveaway(message){
const giveaway = {};
const ms = require('ms');
     const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 6, time: 60 * 1000 });
    let step = 0;  
message.channel.send('What is the prize?');
    collector.on('collect', async (msg) => {
        if (!msg.content) return collector.stop('error');

        step++;
        if (step == 1) {
            const prize = msg.content;
            message.channel.send(`The prize is **${prize}**! Which channel do you want to host in?`, { allowedMentions: { roles: [], users: [], parse: [] } });
            giveaway.prize = prize;
        }
        else if (step == 2) {
            const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(msg.content);
            if (!channel) return collector.stop('error');
            giveaway.channel = channel.id;
            message.channel.send(`Channel is <#${channel.id}>! Now how many winners do you want?`);
        }
        else if (step == 3) {
            const winners = msg.content;
            if (isNaN(winners)) return collector.stop('error');
            if (parseInt(winners) > 10) {
                message.reply('You cannot have more than 10 winners!');
                return collector.stop('error');
            }
            giveaway.winners = parseInt(winners);
            message.channel.send(`${winners} winner(s) will be chosen for this giveaway! How much time do you want?`);
        }
        else if (step == 4) {
            const time = msg.content;
            if (!ms(time)) return collector.stop('error');
            giveaway.time = time
            if (ms(giveaway.time) > ms('14d')) return collector.stop('HIGH_TIME');
            message.channel.send(`The time is now set to ${time}! Who is hosting the giveaway?`);
        }
        else if (step == 5) {
            const host = msg.mentions.users.first() || msg.guild.members.cache.get(msg.content) || message.member;

            giveaway.host = host.id;
            message.channel.send(`The host is ${host}! Now Is this correct?\n\`\`\`Prize: ${giveaway.prize}\nWinner(s): ${giveaway.winners}\nTime: ${ms(giveaway.time)}\nhost: ${message.guild.members.cache.get(giveaway.host).user.username}\n\`\`\`Reply with \`yes\` or \`no\`!`);
        }
        else if (step == 6) {
            if (!['yes', 'no'].includes(msg.content)) return collector.stop('error');
            if (msg.content == 'yes') message.channel.send('Created the giveaway!').then(m => setTimeout(() => m.delete(), 2000)); collector.stop('done');
           if (msg.content == 'no'){ return collector.stop('cancel')};
        }
    })

    collector.on('end', async (msgs, reason) => {
        if (reason == 'time') return message.channel.send('You did not reply in time!');
        if (reason == 'error') return message.channel.send('You did not provide valid option!');
        if (reason == 'cancel') return message.channel.send('Cancelled giveaway setup due to wrong info!');
        if (reason == 'HIGH_TIME') return message.channel.send('The time cannot be more than 14 days!');
        if (reason == 'done')
        await this.startGiveaway({
                prize: giveaway.prize,
                hostedBy: giveaway.host,
                winners: giveaway.winners,
                duration: ms(giveaway.time),
                channelId: giveaway.channel,
                guildId: message.guild.id,
            });
    })
}
 async drop(message, client, options) {
let button = new MessageButton()
  .setStyle('red')
  .setLabel('Enter') 
  .setID('drop');
const DropEmbed = new MessageEmbed()
                .setTitle(`${options.prize}`)
                .setDescription(`First to click enter wins ${options.prize}.\n hosted by <@${options.hostID}>`)
                .setFooter(this.client.user.tag, this.client.user.displayAvatarURL({ size: 512, format: 'png' }))
                .setColor("RANDOM")
                .setTimestamp();
const msg = await message.channel.send(DropEmbed, button)
try{
client.on('clickButton', async (button) => {
if(button.id.startsWith('drop')){
const Dropembed = new MessageEmbed()
.setTitle(`🎉 Drop Winner!`)
.setDescription(`<@${button.clicker.user.id}> won the drop of ${options.prize}. \n Please contact <@${options.hostID}> to claim you prize`)
.setFooter(this.client.user.tag, this.client.user.displayAvatarURL({ size: 512, format: 'png' }))
                .setColor("RANDOM")
                .setTimestamp();
msg.edit(Dropembed, null)
await button.reply.send(`congratulations <@${button.clicker.user.id}> you won the drop`)
}
});
}catch(e){

}

 }
    /**
     * 
     * @param {string} messageId - A discord message ID.
     */

   async endGiveaway(messageId) {
    const winmoji = ":trophy:"
    const winemo = "🎁"
    const hostemo = ":man_detective: "
        let data = await GiveawayModel.findOne({ messageId: messageId });

        if (!data) return false;

        if (data.hasEnded === 'True') return false;

        const job = scheduler.scheduledJobs[`${messageId}`];

        if (!job) return false;

        job.cancel();

        const channel = this.client.channels.cache.get(data.channelId);
        if (channel) {
            const message = await channel.messages.fetch(messageId);

            if (message) {
                const { embeds, reactions } = message;
                const reaction = reactions.cache.get(this.emoji);
                const users = await reaction.users.fetch();
                const entries = users.filter(user => !user.bot).array();

                if (embeds.length === 1) {
                    const embed = embeds[0];
                    const winner = getWinner(entries, data.winners);
                    let finalWinners;
                    if (!winner) {
                        finalWinners = 'Nobody Reacted';
                    }
                    else {
                        finalWinners = winner.map(user => user.toString()).join(', ');
                    }
                    embed.setDescription(`${winmoji} Winner(s): ${finalWinners}`);
                    embed.setFooter(this.client.user.username, this.client.user.displayAvatarURL({ format: 'png', size: 512 }));
                    embed.setTimestamp();
                    await message.edit(embed);
const em = ":arrow_upper_right:"
        if (!winner) {

                            message.channel.send(`Nobody reacted to the **${data.prize}** giveaway. **ID**: \`${messageId}\``) 
                             message.channel.send(new MessageEmbed().setTitle(`Click here to go to giveaway ${em}`).setURL(message.url))
                        }
                        else {
                            message.channel.send(`Congratulations ${finalWinners}, you won the **${data.prize}**!\n**ID**: \`${messageId}\``) 
                            message.channel.send(new MessageEmbed().setTitle(`Click here to go to giveaway ${em}`).setURL(message.url))
                        }
                    const ended = await endGiveaway(messageId);
                    this.emit('giveawayEnd', ended);
                }
            }
        }
        return data;
    }

    /**
     * 
     * @param {string} messageId - A discord message ID.
     */

    async fetchGiveaway(messageId) {
        const giveaway = await GiveawayModel.findOne({ messageId: messageId });

        if (!giveaway) return false;

        return giveaway;
    }

    /**
     * 
     * @param {string} messageId - A discord message ID.
     */

    async rerollGiveaway(messageId) {
        const winmoji = ":trophy:"
const winemo = "🎁"
const hostemo = ":man_detective: "
        const giveaway = await GiveawayModel.findOne({ messageId: messageId });

        if (!giveaway) return false;
        if (giveaway.hasEnded === 'False') return false;

        const channel = this.client.channels.cache.get(giveaway.channelId);

        if (channel) {
            const message = await channel.messages.fetch(messageId);

            if (message) {
                const { embeds, reactions } = message;

                const reaction = reactions.cache.get(this.emoji);
                const users = await reaction.users.fetch();
                const entries = users.filter(user => !user.bot).array();

                const winner = getWinner(entries, giveaway.winners);
                let finalWinners;
const em = ":arrow_upper_right:"
                if (!winner) {
                    finalWinners = 'Nobody Reacted';
                    message.channel.send(`Nobody reacted to the **${giveaway.prize}** giveaway. **ID**: \`${messageId}\``)

                            message.channel.send(new MessageEmbed().setTitle(`Click here to go to giveaway ${em}`).setURL(message.url))
 }else {
                    finalWinners = winner.map(user => user.toString()).join(', ');
                    message.channel.send(`Congratulations ${finalWinners}, you won the **${giveaway.prize}**!\n**ID**: \`${messageId}\``)
                            message.channel.send(new MessageEmbed().setTitle(`Click here to go to giveaway ${em}`).setURL(message.url))
                }

                if (embeds.length === 1) {
                    const embed = embeds[0];

                    embed.setDescription(`${winmoji} Winner(s): ${finalWinners}`);

                    await message.edit(embed);
                }
            }
        }
        this.emit('giveawayReroll', giveaway);
        return giveaway;
    }

    /**
     * 
     * @param {string} guildId - A discord guild ID.
     */

    async listGiveaways(guildId) {
        if (!guildId) throw new Error("Please provide a guild ID.");

        const Giveaways = await GiveawayModel.find({ guildId: guildId, hasEnded: 'False' });

        if (Giveaways.length < 1) return false;

        const array = [];

        Giveaways.map(i => array.push({
            hostedBy: this.client.users.cache.get(i.hostedBy).tag ? this.client.users.cache.get(i.hostedBy).tag : "Nobody#0000",
            timeRemaining: i.endsOn - Date.now(),
            messageId: i.messageId,
            prize: i.prize
        }));

        return array;
    }
}

module.exports = GiveawayCreator;
