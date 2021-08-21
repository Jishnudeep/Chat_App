import React from 'react';
import { Loader } from 'rsuite';
import { useParams } from 'react-router';
import Top from '../../components/chat-window/top';
import Bottom from '../../components/chat-window/bottom';
import Messages from '../../components/chat-window/messages';
import { useRooms } from '../../context/rooms.context';

const Chat = () => {
  const { chatId } = useParams();

  const rooms = useRooms();

  if (!rooms) {
    return <Loader center vertical size="md" speed="slow" />;
  }

  const currRoom = rooms.find(room => room.id === chatId);
  if (!currRoom) {
    return <h6 className="text-center mt-page">Chat Id Not Found</h6>;
  }

  return (
    <>
      <div className="chat-top">
        <Top />
      </div>
      <div className="chat-middle">
        <Messages />
      </div>
      <div className="chat-bottom">
        <Bottom />
      </div>
    </>
  );
};

export default Chat;
