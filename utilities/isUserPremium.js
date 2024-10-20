const isUserPremium = async (userInfo) => {
    return userInfo.tier === 2;
}

module.exports = isUserPremium;