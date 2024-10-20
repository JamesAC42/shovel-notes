import { useEffect } from 'react';
const Home = () => {
    useEffect(() => {
        window.location.href = 'https://ovel.sh';
    }, []);
    return null;
}

export default Home;