import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { database } from '../../../misc/Firebase';
import { transformToArrWithId } from '../../../misc/helpers';
import MessageItem from './MessageItem';

const Messages = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState();
  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  useEffect(() => {
    const messagesRef = database.ref('/messages');

    messagesRef
      .orderByChild('/roomId')
      .equalTo(chatId)
      .on('value', snap => {
        const data = transformToArrWithId(snap.val());

        setMessages(data);
      });

    return () => {
      messagesRef.off('value');
    };
  }, [chatId]);
  return (
    <ul className="msg-list custom-scroll">
      {isChatEmpty && <li> NO messages yet</li>}
      {canShowMessages &&
        messages.map(message => (
          <MessageItem key={message.id} message={message} />
        ))}
    </ul>
  );
};

export default Messages;
