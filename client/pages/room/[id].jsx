import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

import ThemePicker from '../../components/ThemePicker';
import CustomThemePicker from '../../components/CustomThemePicker';

const Room = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`/api/rooms/${id}`);
        setRoom(response.data);
      } catch (error) {
        console.error('Error fetching room:', error);
      }
    };

    fetchRoom();
  }, [id]);

  return (
    <div class>
      <ThemePicker />
      <CustomThemePicker />
    </div>
  );
};

export default Room;