import React from 'react';
import { Avatar } from 'rsuite';
import { getNameInitials } from '../../misc/helpers';

const ProfileAvatar = ({ name, ...AvatarProps }) => {
  return (
    <Avatar circle {...AvatarProps}>
      {getNameInitials(name)}
    </Avatar>
  );
};

export default ProfileAvatar;
