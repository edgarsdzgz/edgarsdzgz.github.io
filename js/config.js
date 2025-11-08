// ===============================================
// CONFIGURATION
// ===============================================

export const CONFIG = {
    storagePrefix: 'edgar_tech_',
    clickKey: 'clickCount',
    totalClicksKey: 'totalClicks', // Lifetime clicks (never decreases)
    tickKey: 'tickCount',
    themeKey: 'theme',
    agenticClickerLevelKey: 'agenticClickerLevel',
    darkModeUnlockedKey: 'darkModeUnlocked',
    achievementsKey: 'earnedAchievements', // Array of earned achievement IDs
    unlockedLoreKey: 'unlockedLore', // Array of unlocked lore IDs
};

// ===============================================
// ACHIEVEMENTS DEFINITIONS
// ===============================================

export const ACHIEVEMENTS = [
    {
        id: 'first_click',
        title: 'Your First Click!',
        description: 'Clicked for the first time on the site',
        checkType: 'click',
        condition: (totalClicks) => totalClicks >= 1
    },
    {
        id: 'ten_clicks',
        title: '10x Develo-clicker',
        description: 'Clicked 10 times',
        checkType: 'click',
        condition: (totalClicks) => totalClicks >= 10
    },
    {
        id: 'over_9000',
        title: 'Over 9000!',
        description: 'Clicked 9001 times',
        checkType: 'click',
        condition: (totalClicks) => totalClicks >= 9001
    },
    {
        id: 'first_purchase',
        title: 'I think this site is not what I think it is',
        description: 'Bought 1 item',
        checkType: 'purchase',
        condition: (level) => level >= 1
    }
];

// ===============================================
// LORE DEFINITIONS
// ===============================================

export const LORE = [
    {
        id: 'valcom_mvc',
        experienceId: 'valcom',
        title: 'The MVC Revelation',
        cost: 5,
        text: 'Upon being hired, I was asked about how I teach backend organization. I explained MVC to the team and I was asked if I could reorganize the backend in that way since it was not something they had thought of. By the end of my first week at Valcom, I was reorganizing and refactoring our backend using MVC which is still used today!'
    }
    // More lore entries can be added here
];
