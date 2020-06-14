const Command = require('../../../structures/Command.js');
const { MessageEmbed } = require('discord.js');
const { Colors } = require('../../../structures/Configuration.js');
const { stripIndents } = require('common-tags');
const axios = require('axios');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'steam',
			aliases: [],
			description: 'Searches game from steam store.',
			category: 'searches',
			usage: '<query>',
			clientPerms: ['SEND_MESSAGES', 'EMBED_LINKS']
		});
	}

	async run(message, args) {
		const query = args.join(' ').trim();
		if (!query) {
			message.channel.send('Please provide query to search on Steam store');
			return;
		}

		const headers = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36' };
		const data = await axios.get(`https://store.steampowered.com/api/storesearch/?term=${query}&l=en&cc=us`, { headers }).then(res => res.data);
		if (!data.items.length) {
			message.channel.send('No results were found!');
			return;
		}

		const ids = data.items[0].id;
		const details = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${ids}`, { headers }).then(res => res.data[ids].data);

		const price = details.price_overview ? details.price_overview.final_formatted : '$0';
		const platforms = [];
		if (details.platforms) {
			if (details.platforms.windows) platforms.push('Windows');
			if (details.platforms.mac) platforms.push('Mac');
			if (details.platforms.linux) platforms.push('Linux');
		}

		const embed = new MessageEmbed()
			.setColor(Colors.STEAM)
			.setAuthor('Steam Store Search Engine', 'https://i.imgur.com/xxr2UBZ.png', 'http://store.steampowered.com/')
			.setTitle(details.name)
			.setURL(`https://store.steampowered.com/app/${details.steam_appid}/`)
			.setImage(details.header_image)
			.setDescription(details.short_description)
			.addField('__Details__', stripIndents`
                ***Release Date:*** ${details.release_date ? details.release_date.date : 'Coming Soon'}
                ***Price:*** ${price}
                ***Genres:*** ${details.genres.map(genre => genre.description).join(', ')}
                ***Platform:*** ${platforms.join(', ') || 'None'}
                ***Achievements:*** ${details.achievements ? details.achievements.total.formatNumber() : 0}
                ***DLC Count:*** ${details.dlc ? details.dlc.length.formatNumber() : 0}
                ***Recommendations:*** ${details.recommendations ? details.recommendations.total.formatNumber() : 'None'}
                ***Publishers:*** ${details.publishers.join(', ')}
                ***Developers:*** ${details.developers.join(', ')}
                ***Website:*** ${details.website ? details.website : 'None'}
                ***Support:*** ${details.support_info ? details.support_info.url : details.support_info.email || 'None'}`)
			.setFooter(`Responded in ${this.client.functions.responseTime(message)} | Powered by Steam`, message.author.avatarURL({ dynamic: true }));

		message.channel.send(embed);
	}

};
