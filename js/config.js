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
    synthwaveUnlockedKey: 'synthwaveUnlocked',
    maritimeUnlockedKey: 'maritimeUnlocked',
    achievementsKey: 'earnedAchievements', // Array of earned achievement IDs
    unlockedLoreKey: 'unlockedLore', // Array of unlocked lore IDs
    maxAgenticClickerLevel: 10, // Maximum level for agentic clicker
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
    },
    {
        id: 'first_lore_unlock',
        title: 'The Story Begins',
        description: 'Unlocked your first piece of lore',
        checkType: 'lore',
        condition: (loreCount) => loreCount >= 1
    },
    {
        id: 'lore_master',
        title: 'Lore Master',
        description: 'Unlocked all available lore',
        checkType: 'lore',
        condition: (loreCount, totalLore) => loreCount >= totalLore
    },
    {
        id: 'shop_complete',
        title: 'Everything Must Go!',
        description: 'Purchased everything available in the shop',
        checkType: 'shop_completion',
        condition: (agenticLevel, darkModeUnlocked, synthwaveUnlocked, maritimeUnlocked, maxLevel) => {
            return agenticLevel >= maxLevel && darkModeUnlocked && synthwaveUnlocked && maritimeUnlocked;
        }
    },
    {
        id: 'glitch_star',
        title: 'Glitch in the Matrix',
        description: 'Hovered over the name and triggered the glitch effect',
        checkType: 'name_hover',
        condition: (hovered) => hovered === true
    },
    {
        id: 'pop_glow',
        title: 'Star Power!',
        description: 'Clicked on the name to make it pop and glow',
        checkType: 'name_click',
        condition: (clicked) => clicked === true
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
        text: 'Upon being hired, I was asked about how I taught backend organization at Coding Dojo as an Instructor. I explained MVC to the team and I was asked if I could reorganize the backend in that way since it was not something they had thought of. By the end of my first week at Valcom, I was reorganizing and refactoring our backend using MVC which is still used today!'
    },
    {
        id: 'coding_dojo_teaching',
        experienceId: 'coding_dojo',
        title: 'Learning Through Teaching',
        cost: 5,
        text: 'I took the bootcamp for Coding Dojo in 2020 and found that I learned a lot more when I helped others. The more I tried to explain things the more I found the gaps in my knowledge. This helped me learn faster, more effectively, and collaborate more with my classmates. Ultimately, this is the trait that got me a job offer before I graduated the program.'
    }
    // More lore entries can be added here
];
