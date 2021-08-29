import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Alert } from 'rsuite';
import { auth, database } from '../../../misc/Firebase';
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

  const handleAdmin = useCallback(
    async uid => {
      const adminsRef = database.ref(`/rooms/${chatId}/admins`);

      let alertMessage;

      await adminsRef.transaction(admins => {
        if (admins) {
          if (admins[uid]) {
            admins[uid] = null;
            alertMessage = 'Admin Permission Revoked!';
          } else {
            admins[uid] = true;
            alertMessage = 'Admin Permission Granted!';
          }
        }
        return admins;
      });
      Alert.info(alertMessage, 4000);
    },
    [chatId]
  );

  const handleLike = useCallback(async messageId => {
    const messageRef = database.ref(`/messages/${messageId}`);
    const { uid } = auth.currentUser;

    let alertMsg;

    await messageRef.transaction(message => {
      if (message) {
        if (message.likes && message.likes[uid]) {
          message.likeCount -= 1;
          message.likes[uid] = null;
          alertMsg = 'Like removed';
        } else {
          message.likeCount += 1;
          if (!message.likes) {
            message.likes = {};
          }
          message.likes[uid] = true;
          alertMsg = 'Liked!';
        }
      }
      return message;
    });
    Alert.info(alertMsg, 4000);
  }, []);

  return (
    <ul className="msg-list custom-scroll">
      {isChatEmpty && <li> NO messages yet</li>}
      {canShowMessages &&
        messages.map(message => (
          <MessageItem
            key={message.id}
            message={message}
            handleAdmin={handleAdmin}
            handleLike={handleLike}
          />
        ))}
    </ul>
  );
};

export default Messages;
