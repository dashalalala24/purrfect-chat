import chatCardTemplate from './ChatCard.hbs?raw';
import Block from '../../services/Block';
import { Avatar } from '../Avatar';

type TChatCardProps = {
  id?: number;
  selected?: boolean;

  avatarSrc?: string;
  username?: string;

  lastMessageDateTime?: string;
  messagePreview?: string;

  unreadMessagesCountLabel?: string | number;

  onClick?: (event: Event) => void;
};

class ChatCard extends Block {
  constructor(props: TChatCardProps = {}) {
    const AvatarComponent = new Avatar({
      src: props.avatarSrc,
      alt: props.username,
      username: props.username,
      class: 'chat-card__avatar',
    });

    super({
      ...props,
      Avatar: AvatarComponent,
      events: {
        click: props.onClick,
      },
    });
  }

  render(): string {
    return chatCardTemplate;
  }
}

export default ChatCard;
