import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Action, Command, Ctx, Start, Update } from 'nestjs-telegraf'
import { Context, Telegraf } from 'telegraf'


import { MESSAGES } from './telegram.messages'
import { Users } from 'entity/some.entity'
import { UserService } from 'modules/user/user.service'


@Update()
@Injectable()
export class TelegramService extends Telegraf {
	private readonly _token: string

	public constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService
	) {
		super(configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'))
		this._token = configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN')
	}

	@Start()
	public async onStart(@Ctx() ctx: any) {
		const chatId = ctx.chat.id.toString();
		const tokenValue = ctx.message.text.split(' ')[1];

		if (tokenValue) {
  			const authToken = await this.tokenService.findByTokenAndType(tokenValue, TokenType.TELEGRAM_AUTH);

			if (!authToken) {
				await ctx.replyWithHTML(MESSAGES.invalidToken)
			}

			const hasExpired = new Date(authToken.expiresIn) < new Date()

			if (hasExpired) {
				await ctx.replyWithHTML(MESSAGES.invalidToken)
			}

			await this.connectTelegram(authToken.user.id, chatId)

			await this.tokenService.delete(authToken.id)

			await ctx.replyWithHTML(MESSAGES.authSuccess)
		} else {
			
			await ctx.replyWithHTML(MESSAGES.tokenNotFound)
		}
	}

	public async sendStreamStart(chatId: string, channel: Users) {
		await this.telegram.sendMessage(chatId, MESSAGES.streamStart(channel), {
			parse_mode: 'HTML'
		})
	}

	private async connectTelegram(userId: string, chatId: string) {
		await this.userService.update(userId, { telegramId: chatId });
	}

	private async findUserByChatId(chatId: string) {
		return await this.userService.findByChatId(chatId)
	}  
}
