import React, { useEffect, useRef, useState } from 'react';
import { Divider } from 'rsuite';
import CreateRoomBtnModal from './CreateRoomBtnModal';
import DashboardToggle from './Dashboard/DashboardToggle';
import ChatRoomList from './Rooms/ChatRoomList';

const Sidebar = () => {
  const TopSidebarRef = useRef();
  const [height, setHeight] = useState(null);

  useEffect(() => {
    if (TopSidebarRef.current) {
      setHeight(TopSidebarRef.current.scrollHeight);
    }
  }, [TopSidebarRef]);

  return (
    <div className="h-100 pt-2">
      <div ref={TopSidebarRef}>
        <DashboardToggle />
        <CreateRoomBtnModal />
        <Divider> Join Conversation</Divider>
      </div>
      <ChatRoomList aboveElHeight={height} />
    </div>
  );
};

export default Sidebar;
