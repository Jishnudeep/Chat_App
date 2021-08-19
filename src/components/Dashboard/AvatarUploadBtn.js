import React, { useState, useRef } from 'react';
import { Alert, Button, Modal } from 'rsuite';
import AvatarEditor from 'react-avatar-editor';
import { useModalState } from '../../misc/custom-hooks';
import { useProfile } from '../../context/profile.context';
import { database, storage } from '../../misc/Firebase';

const fileInputTypes = '.png, .jpeg, .jpg';
const acceptedFileTypes = ['image/png', 'image/jpeg', 'image/pjpeg'];

const isValidFile = file => {
  return acceptedFileTypes.includes(file.type);
};

const getBlob = canvas => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('File Process Error'));
      }
    });
  });
};

const AvatarUploadBtn = () => {
  const { isOpen, close, open } = useModalState();
  const [image, setImage] = useState(null);
  const { profile } = useProfile();
  const avatarEditorRef = useRef();
  const [isLoading, setIsLoading] = useState(null);

  const oneFileInputChange = ev => {
    const currentFiles = ev.target.files;
    if (currentFiles.length === 1) {
      const file = currentFiles[0];
      if (isValidFile(file)) {
        setImage(file);
        open();
      } else {
        Alert.warning(`Wrong file type ${file.type}!`, 4000);
      }
    }
  };

  const onUploadClick = async () => {
    const canvas = avatarEditorRef.current.getImageScaledToCanvas();
    try {
      setIsLoading(true);
      const blob = await getBlob(canvas);
      const avatarFileRef = storage
        .ref(`/profiles/${profile.uid}`)
        .child('avatar');
      const uploadAvatar = await avatarFileRef.put(blob, {
        cacheControl: `public, max-age=${3600 * 24 * 3}`,
      });

      const downloadURL = await uploadAvatar.ref.getDownloadURL();
      const userAvatarRef = database
        .ref(`/profiles/${profile.uid}`)
        .child('avatar');

      userAvatarRef.set(downloadURL);
      setIsLoading(false);
      Alert.success('Avatar has been uploaded', 4000);
    } catch (err) {
      setIsLoading(false);
      Alert.error(err.message, 4000);
    }
  };

  return (
    <div className="mt-3 text-center">
      <div>
        <label
          htmlFor="avatar-upload"
          className="d-block cursor-pointer padded"
        >
          Select new Avatar
          <input
            id="avatar-upload"
            type="file"
            className="d-none"
            accept={fileInputTypes}
            onChange={oneFileInputChange}
          />
        </label>
        <Modal show={isOpen} onHide={close}>
          <Modal.Header>
            <Modal.Title>Adjust and Upload new Avatar</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex justify-content-center align-items-center h-100">
              {image && (
                <AvatarEditor
                  ref={avatarEditorRef}
                  image={image}
                  width={200}
                  height={200}
                  border={10}
                  borderRadius={100}
                  rotate={0}
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              block
              appearance="ghost"
              onClick={onUploadClick}
              disabled={isLoading}
            >
              Upload new avatar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AvatarUploadBtn;
