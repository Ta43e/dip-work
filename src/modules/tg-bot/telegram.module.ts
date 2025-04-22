import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TelegrafModule } from 'nestjs-telegraf'


import { TelegramService } from './telegram.service'
import { getTelegrafConfig } from './telegraf.config'
import { UserModule } from 'modules/user/user.module'

@Global()
@Module({
	imports: [
		TelegrafModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getTelegrafConfig,
			inject: [ConfigService]
		}),
		UserModule
	],
	providers: [TelegramService],
	exports: [TelegramService]
})
export class TelegramModule {}
