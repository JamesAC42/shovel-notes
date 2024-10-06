import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

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
    <div>
      <h1>Room {id}</h1>
    </div>
  );
};

export default Room;