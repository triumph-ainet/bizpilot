import dynamic from 'next/dynamic';

const _EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

type Props = {
  onSelect?: (emoji: string) => void;
};

const EmojiPicker = ({ onSelect }: Props) => {
  const onEmojiClick = (emojiObject: any, _event: any) => {
    const emoji = emojiObject?.emoji ?? '';
    if (onSelect) onSelect(emoji);
  };

  return (
    <div>
      <_EmojiPicker onEmojiClick={onEmojiClick} />
    </div>
  );
};

export default EmojiPicker;
