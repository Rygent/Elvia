const Interaction = require('../../../../Structures/Interaction.js');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { Color } = require('../../../../Settings/Configuration.js');

module.exports = class extends Interaction {

	constructor(...args) {
		super(...args, {
			name: 'avatar',
			description: 'Display the avatar of the provided user.'
		});
	}

	async run(interaction) {
		const user = await interaction.options.getUser('user') || interaction.user;

		const button = new MessageActionRow()
			.addComponents(new MessageButton()
				.setStyle('LINK')
				.setLabel('Open in Browser')
				.setURL(user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 })));

		const embed = new MessageEmbed()
			.setColor(Color.DEFAULT)
			.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
			.setDescription(`***ID:*** \`${user.id}\``)
			.setImage(user.displayAvatarURL({ dynamic: true, size: 512 }))
			.setFooter({ text: `Powered by ${this.client.user.username}`, iconURL: interaction.user.avatarURL({ dynamic: true }) });

		return interaction.reply({ embeds: [embed], components: [button] });
	}

};
