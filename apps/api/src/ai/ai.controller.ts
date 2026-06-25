import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AiService, ChatMessage } from './ai.service';

class ChatDto {
  messages: ChatMessage[];
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: ChatDto) {
    if (!body.messages?.length) {
      throw new HttpException('messages required', HttpStatus.BAD_REQUEST);
    }
    const content = await this.aiService.chat(body.messages);
    return { content };
  }
}
