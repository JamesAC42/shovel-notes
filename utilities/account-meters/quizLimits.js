function incrementQuizGenerations(redis, userId) {
    return new Promise((resolve, reject) => {
        const currentDate = new Date().toLocaleDateString('en-US');
        redis.multi()
            .hget(`shovel:quiz_last_generated`, userId)
            .hincrby(`shovel:quiz_generations`, userId, 1)
            .incrby('shovel:total_quiz_generations', 1)
            .hset(`shovel:quiz_last_generated`, userId, currentDate)
            .exec((err, results) => {
                if (err) {
                    console.error('Error incrementing quiz generations:', err);
                    reject(err);
                } else {
                    const lastGeneratedDate = results[0][1];
                    if (lastGeneratedDate !== currentDate) {
                        // Reset count if the date has changed
                        redis.hset(`shovel:quiz_generations`, userId, 1, (err) => {
                            if (err) {
                                console.error('Error resetting quiz generations:', err);
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

function getQuizGenerations(redis, userId) {
    return new Promise((resolve, reject) => {
        const currentDate = new Date().toLocaleDateString('en-US');
        redis.multi()
            .hget(`shovel:quiz_generations`, userId)
            .hget(`shovel:quiz_last_generated`, userId)
            .exec((err, results) => {
                if (err) {
                    console.error('Error getting quiz generations:', err);
                    reject(err);
                } else {
                    const count = parseInt(results[0][1]) || 0;
                    const lastGeneratedDate = results[1][1];

                    if (lastGeneratedDate !== currentDate) {
                        // Reset count if the date has changed
                        redis.hset(`shovel:quiz_generations`, userId, 0);
                        redis.hset(`shovel:quiz_last_generated`, userId, currentDate);
                        resolve(0);
                    } else {
                        resolve(count);
                    }
                }
            });
    });
}

function incrementFreeQuizGenerations(redis, userId) {
    return new Promise((resolve, reject) => {
        redis.multi()
            .hincrby(`shovel:free_quiz_generations`, userId, 1)
            .incrby('shovel:total_free_quiz_generations', 1)
            .exec((err, results) => {
                if (err) {
                    console.error('Error incrementing free quiz generations:', err);
                    reject(err);
                } else {
                    resolve(results[1][1]);
                }
            });
    });
}

function getFreeQuizGenerations(redis, userId) {
    return new Promise((resolve, reject) => {
        redis.hget(`shovel:free_quiz_generations`, userId, (err, result) => {
            if (err) {
                console.error('Error getting free quiz generations:', err);
                reject(err);
            } else {
                resolve(parseInt(result) || 0);
            }
        });
    });
}

module.exports = {
    incrementQuizGenerations,
    getQuizGenerations,
    incrementFreeQuizGenerations,
    getFreeQuizGenerations
}; 