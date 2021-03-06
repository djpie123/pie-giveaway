# pie-giveaways
A package for giveaways
# Installation
npm install pie-giveaways
# Examples
![Example for start command](https://imgur.com/X7inDdl.gif)
![Example for create command](https://imgur.com/vkYnqO9.gif)
![Example for Drop command](https://i.imgur.com/N5kPXiM.gif)
# Start
Start by creating a new GiveawayCreator.
```js
const { Client } = require('discord.js');
const client = new Client();
//must add this line or it will throw err and also make sure to add it just after client declaration.
require('discord-buttons')(client);
const { GiveawayCreator } = require('pie-giveaways');
const gwcreator = new GiveawayCreator(client, 'mongodb://...');
const giveaway = gwcreator; // Access the Creator from anywhere.
```
# All Methods
##### startGiveaway(options)
Starts a giveaway. **Example**:
```js
client.on('message', async message => {
    if (message.content.startsWith('!start)) {
        const channel = message.mentions.channels.first();
        await giveaway.startGiveaway({
            prize: 'Discord Nitro Classic',
            channelId: channel.id,
            guildId: message.guild.id,
            duration: 30000, // 30 Seconds
            winners: 1, // 1 winner
            hostedBy: message.author.id
        });
    }
});
```
##### createGiveaway(message)
Creates a giveaway. **Example**:
```js
client.on('message', async message => {
    if (message.content.startsWith('!create')) {
     await giveaway.createGiveaway(message) 
    }
});
```
##### endGiveaway(messageId)
Ends a giveaway. **Example**:
```js
client.on('message', async message => {
    if (message.content.startsWith('!end')) {
        const args = message.content.split(' ').slice(1);
        const ended = await giveaway.endGiveaway(args.join(' '));
        
        if (!ended) {
            return message.channel.send('This giveaway has already ended');
        }
        else {
            message.channel.send('Ended the giveaway');
        }
    }
});
```

##### rerollGiveaway(messageId)
Rerolls a giveaway. **Example**:
```js
client.on('message', async message => {
    if (message.content.startsWith('!end')) {
        const args = message.content.split(' ').slice(1);
        const rerolled = await giveaway.rerollGiveaway(args.join(' '));
        
        if (!rerolled) {
            return message.channel.send('This giveaway hasn\'t ended');
        }
        else {
            message.channel.send('Rerolled the giveaway');
        }
    }
});
```

##### listGiveaways(guildId)
```js
const prettyMilliseconds = require('pretty-ms'); // npm i pretty-ms

client.on('message', async message => {
    if (message.content.startsWith('!list')) {
        const list = await giveaway.listGiveaways(message.guild.id);
        
        if (!list) {
            return message.channel.send('No active giveaways.');
        } else {
            message.channel.send(`${list.map(i => `\`${i.messageId}\` - **${i.prize}** | ${prettyMilliseconds(i.timeRemaining)} | Host: **${i.hostedBy}**`).join('\n')}`)
        }
    }
});
```
##### drop(message, client, options)
Creates a Drop. **Example**:
```js
client.on('message', async message => {
    if (message.content.startsWith('!create')) {
     await giveaway.drop(message, client, {
prize: 'nitro',
hostID: message.author.id
}) 
    }
});
```
