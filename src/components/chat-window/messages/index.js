import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Button } from 'rsuite';
import { auth, database, storage } from '../../../misc/Firebase';
import { groupBy, transformToArrWithId } from '../../../misc/helpers';
import MessageItem from './MessageItem';

const PAGE_SIZE = 15;
const messagesRef = database.ref('/messages');

function shouldScrollToBottom(node, threshold = 30) {
  const percentage =
    (100 * node.scrollTop) / (node.scrollHeight - node.clientHeight) || 0;
  return percentage > threshold;
}

const Messages = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const selfRef = useRef();
  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  const loadMessages = useCallback(
    limitToLast => {
      const node = selfRef.current;

      messagesRef.off();

      messagesRef
        .orderByChild('/roomId')
        .equalTo(chatId)
        .limitToLast(limitToLast || PAGE_SIZE)
        .on('value', snap => {
          const data = transformToArrWithId(snap.val());

          setMessages(data);

          if (shouldScrollToBottom(node)) {
            node.scrollTop = node.scrollHeight;
          }
        });

      setLimit(p => p + PAGE_SIZE);
    },
    [chatId]
  );

  const onLoadMore = useCallback(() => {
    const node = selfRef.current;
    const oldHeight = node.scrollHeight;
    loadMessages(limit);

    setTimeout(() => {
      const newHeight = node.scrollHeight;
      node.scrollTop = newHeight - oldHeight;
    }, 200);
  }, [loadMessages, limit]);

  useEffect(() => {
    const node = selfRef.current;

    loadMessages();

    setTimeout(() => {
      node.scrollTop = node.scrollHeight;
    }, 200);

    return () => {
      messagesRef.off('value');
    };
  }, [loadMessages]);

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

  const handleDelete = useCallback(
    async (messageId, file) => {
      // eslint-disable-next-line no-alert
      if (!window.confirm('Delete?')) {
        return;
      }
      const isLast = messages[messages.length - 1].id === messageId;

      const updates = {};
      updates[`messages/${messageId}`] = null;

      if (isLast && messages.length > 1) {
        updates[`/rooms/${chatId}/lastMessage`] = {
          ...messages[messages.length - 2],
          messageId: messages[messages.length - 2].id,
        };
      }

      if (isLast && messages.length === 1) {
        updates[`/rooms/${chatId}/lastMessage`] = null;
      }

      try {
        await database.ref().update(updates);
        Alert.info('Message deleted', 4000);
      } catch (err) {
        Alert.error(err.message, 4000);
      }
      if (file) {
        try {
          const fileRef = storage.refFromURL(file.url);
          await fileRef.delete();
        } catch (err) {
          // eslint-disable-next-line consistent-return
          return Alert.error(err.message, 4000);
        }
      }
    },
    [chatId, messages]
  );

  const renderMessages = () => {
    const groups = groupBy(messages, item => {
      return new Date(item.createdAt).toDateString();
    });

    const items = [];

    Object.keys(groups).forEach(date => {
      items.push(
        <li key={date} className="text-center mb-1 padded">
          {date}
        </li>
      );
      const msgs = groups[date].map(msg => (
        <MessageItem
          key={msg.id}
          message={msg}
          handleAdmin={handleAdmin}
          handleLike={handleLike}
          handleDelete={handleDelete}
        />
      ));

      items.push(...msgs);
    });

    return items;
  };

  return (
    <ul ref={selfRef} className="msg-list custom-scroll">
      {messages && messages.length >= PAGE_SIZE && (
        <li className="text-center mt-2 mb-2">
          <Button appearance="ghost" onClick={onLoadMore}>
            Load Messages
          </Button>
        </li>
      )}
      {isChatEmpty && <li> NO messages yet</li>}
      {canShowMessages && renderMessages()}
    </ul>
  );
};

export default Messages;
