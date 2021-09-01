import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { Icon, InputGroup, Input, Alert } from 'rsuite';
import firebase from 'firebase/app';
import { useProfile } from '../../../context/profile.context';
import { database } from '../../../misc/Firebase';
import AttachmentBtnModal from './AttachmentBtnModal';

function assembleMessage(profile, chatId) {
  return {
    roomId: chatId,
    author: {
      name: profile.name,
      uid: profile.uid,
      createdAt: profile.createdAt,
      ...(profile.avatar ? { avatar: profile.avatar } : {}),
    },
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    likeCount: 0,
  };
}

const Bottom = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { profile } = useProfile();
  const { chatId } = useParams();

  const onInputChange = useCallback(value => {
    setInput(value);
  }, []);

  const onSendClick = async () => {
    if (input.trim() === '') {
      return;
    }

    const messageData = assembleMessage(profile, chatId);
    messageData.text = input;

    const updates = {};

    const messageId = database.ref('messages').push().key;

    updates[`/messages/${messageId}`] = messageData;
    updates[`rooms/${chatId}/lastMessage`] = {
      ...messageData,
      msgId: messageId,
    };
    setIsLoading(true);

    try {
      await database.ref().update(updates);
      setIsLoading(false);

      setInput('');
    } catch (err) {
      setIsLoading(false);
      Alert.err(err.message, 4000);
    }
  };

  const onKeyDown = ev => {
    if (ev.keyCode === 13) {
      ev.preventDefault();
      onSendClick();
    }
  };

  const afterUpload = useCallback(
    async files => {
      setIsLoading(true);

      const updates = {};

      files.forEach(file => {
        const messageData = assembleMessage(profile, chatId);
        messageData.file = file;

        const messageId = database.ref('messages').push().key;

        updates[`/messages/${messageId}`] = messageData;
      });

      const lastMessageId = Object.keys(updates).pop();
      updates[`rooms/${chatId}/lastMessage`] = {
        ...updates[lastMessageId],
        msgId: lastMessageId,
      };

      try {
        await database.ref().update(updates);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        Alert.err(err.message, 4000);
      }
    },
    [chatId, profile]
  );

  return (
    <div>
      <InputGroup>
        <AttachmentBtnModal afterUpload={afterUpload} />
        <Input
          placeholder="Write a new message..."
          onChange={onInputChange}
          value={input}
          onKeyDown={onKeyDown}
        />
        <InputGroup.Button
          color="blue"
          appearance="primary"
          onClick={onSendClick}
          disabled={isLoading}
        >
          <Icon icon="send-o" />
        </InputGroup.Button>
      </InputGroup>
    </div>
  );
};

export default Bottom;
