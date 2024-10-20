import { useEffect } from 'react';
const Room = () => {
    useEffect(() => {
        window.location.href = 'https://ovel.sh/room';
    }, []);
    return null;
}

export default Room;