import { InboundMessage, OutboundMessage, Channel } from '../../types';

export interface ChannelAdapter {
  normalize(raw: Record<string, unknown>): InboundMessage;
  formatReply(data: { text: string; paymentUrl?: string }): OutboundMessage;
}

export class SimChatAdapter implements ChannelAdapter {
  normalize(raw: Record<string, unknown>): InboundMessage {
    return {
      channel: 'sim_chat',
      senderId: raw.senderId as string,
      vendorId: raw.vendorId as string,
      text: raw.text as string | undefined,
      mediaUrl: raw.mediaUrl as string | undefined,
      timestamp: new Date(),
    };
  }

  formatReply(data: { text: string; paymentUrl?: string }): OutboundMessage {
    return {
      channel: 'sim_chat',
      recipientId: 'customer',
      text: data.text,
      paymentUrl: data.paymentUrl,
    };
  }
}

// export class WhatsAppAdapter implements ChannelAdapter {
//   normalize(raw: Record<string, unknown>): InboundMessage {
//     const entry = (raw.entry as any)[0]
//     const change = entry.changes[0].value
//     const msg = change.messages[0]
//     return {
//       channel:   'whatsapp',
//       senderId:  msg.from,
//       vendorId:  change.metadata.phone_number_id,
//       text:      msg.text?.body,
//       timestamp: new Date(Number(msg.timestamp) * 1000),
//     }
//   }
//   formatReply(data: { text: string; paymentUrl?: string }): OutboundMessage {
//     return { channel: 'whatsapp', recipientId: '', text: data.text, paymentUrl: data.paymentUrl }
//   }
// }

export const adapters: Record<Channel, ChannelAdapter> = {
  sim_chat: new SimChatAdapter(),
  whatsapp: new SimChatAdapter(),
  mobile: new SimChatAdapter(),
};
