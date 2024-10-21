function incrementDeckGenerations(redis, userId) {
    return new Promise((resolve, reject) => {
        const currentDate = new Date().toLocaleDateString('en-US');
        redis.multi()
            .hget(`shovel:deck_last_generated`, userId)
            .hincrby(`shovel:deck_generations`, userId, 1)
            .incrby('shovel:total_deck_generations', 1)
            .hset(`shovel:deck_last_generated`, userId, currentDate)
            .exec((err, results) => {
                if (err) {
                    console.error('Error incrementing deck generations:', err);
                    reject(err);
                } else {
                    const lastGeneratedDate = results[0][1];
                    if (lastGeneratedDate !== currentDate) {
                        // Reset count if the date has changed
                        redis.hset(`shovel:deck_generations`, userId, 1, (err) => {
                            if (err) {
                                console.error('Error resetting deck generations:', err);
                                reject(err);
                            } else {
                                resolve(1); // Return the new count (1)
                            }
                        });
                    } else {
                        resolve(results[1][1]); // Return the new count
                    }
                }
            });
    });
}

function getDeckGenerations(redis, userId) {
    return new Promise((resolve, reject) => {
        const currentDate = new Date().toLocaleDateString('en-US');
        redis.multi()
            .hget(`shovel:deck_generations`, userId)
            .hget(`shovel:deck_last_generated`, userId)
            .exec((err, results) => {
                if (err) {
                    console.error('Error getting deck generations:', err);
                    reject(err);
                } else {
                    const count = parseInt(results[0][1]) || 0;
                    const lastGeneratedDate = results[1][1];

                    if (lastGeneratedDate !== currentDate) {
                        // Reset count if the date has changed
                        redis.hset(`shovel:deck_generations`, userId, 0);
                        redis.hset(`shovel:deck_last_generated`, userId, currentDate);
                        resolve(0);
                    } else {
                        resolve(count);
                    }
                }
            });
    });
}

function incrementFreeDeckGenerations(redis, userId) {
    return new Promise((resolve, reject) => {
        redis.multi()
            .hincrby(`shovel:free_deck_generations`, userId, 1)
            .incrby('shovel:total_free_deck_generations', 1)
            .exec((err, results) => {
                if (err) {
                    console.error('Error incrementing free deck generations:', err);
                    reject(err);
                } else {
                    resolve(results[1][1]);
                }
            });
    });
}

function getFreeDeckGenerations(redis, userId) {
    return new Promise((resolve, reject) => {
        redis.hget(`shovel:free_deck_generations`, userId, (err, result) => {
            if (err) {
                console.error('Error getting free deck generations:', err);
                reject(err);
            } else {
                resolve(parseInt(result) || 0);
            }
        });
    });
}

module.exports = {
    incrementDeckGenerations,
    getDeckGenerations,
    incrementFreeDeckGenerations,
    getFreeDeckGenerations
};
