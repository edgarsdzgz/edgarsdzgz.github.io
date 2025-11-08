// ===============================================
// CONFIGURATION
// ===============================================

export const CONFIG = {
    storagePrefix: 'edgar_tech_',
    clickKey: 'clickCount',
    totalClicksKey: 'totalClicks', // Lifetime clicks (never decreases)
    manualClicksKey: 'manualClicks', // Lifetime manual clicks only
    agentClicksKey: 'agentClicks', // Lifetime agent clicks only
    tickKey: 'tickCount',
    themeKey: 'theme',
    agenticClickerLevelKey: 'agenticClickerLevel',
    darkModeUnlockedKey: 'darkModeUnlocked',
    synthwaveUnlockedKey: 'synthwaveUnlocked',
    maritimeUnlockedKey: 'maritimeUnlocked',
    bgmUnlockedKey: 'bgmUnlocked',
    bgmVolumeKey: 'bgmVolume',
    bgmPlayingKey: 'bgmPlaying',
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
    },
    // Manual Click Achievements
    {
        id: 'first_step',
        title: 'First Step',
        description: 'Made your first manual click',
        checkType: 'manual_clicks',
        condition: (manualClicks) => manualClicks >= 1
    },
    {
        id: 'getting_started',
        title: 'Getting Started',
        description: 'Manually clicked 25 times',
        checkType: 'manual_clicks',
        condition: (manualClicks) => manualClicks >= 25
    },
    {
        id: 'dedicated_clicker',
        title: 'Dedicated Clicker',
        description: 'Manually clicked 100 times',
        checkType: 'manual_clicks',
        condition: (manualClicks) => manualClicks >= 100
    },
    {
        id: 'century_club',
        title: 'Century Club',
        description: 'Manually clicked 500 times',
        checkType: 'manual_clicks',
        condition: (manualClicks) => manualClicks >= 500
    },
    {
        id: 'click_enthusiast',
        title: 'Click Enthusiast',
        description: 'Manually clicked 1,000 times',
        checkType: 'manual_clicks',
        condition: (manualClicks) => manualClicks >= 1000
    },
    {
        id: 'click_fanatic',
        title: 'Click Fanatic',
        description: 'Manually clicked 5,000 times',
        checkType: 'manual_clicks',
        condition: (manualClicks) => manualClicks >= 5000
    },
    {
        id: 'click_legend',
        title: 'Click Legend',
        description: 'Manually clicked 10,000 times',
        checkType: 'manual_clicks',
        condition: (manualClicks) => manualClicks >= 10000
    },
    {
        id: 'click_champion',
        title: 'Click Champion',
        description: 'Manually clicked 50,000 times',
        checkType: 'manual_clicks',
        condition: (manualClicks) => manualClicks >= 50000
    },
    {
        id: 'click_master',
        title: 'Click Master',
        description: 'Manually clicked 100,000 times',
        checkType: 'manual_clicks',
        condition: (manualClicks) => manualClicks >= 100000
    },
    {
        id: 'click_deity',
        title: 'Click Deity',
        description: 'Manually clicked 500,000 times',
        checkType: 'manual_clicks',
        condition: (manualClicks) => manualClicks >= 500000
    },
    {
        id: 'manual_mastery',
        title: 'MANUAL MASTERY',
        description: 'Achieved ultimate manual clicking mastery with 500,000 clicks',
        checkType: 'manual_clicks',
        condition: (manualClicks) => manualClicks >= 500000
    },
    // Agent Click Achievements
    {
        id: 'automation_begins',
        title: 'Automation Begins',
        description: 'Let agents click 100 times for you',
        checkType: 'agent_clicks',
        condition: (agentClicks) => agentClicks >= 100
    },
    {
        id: 'delegation_started',
        title: 'Delegation Started',
        description: 'Let agents click 500 times for you',
        checkType: 'agent_clicks',
        condition: (agentClicks) => agentClicks >= 500
    },
    {
        id: 'working_smarter',
        title: 'Working Smarter',
        description: 'Let agents click 1,000 times for you',
        checkType: 'agent_clicks',
        condition: (agentClicks) => agentClicks >= 1000
    },
    {
        id: 'agent_army',
        title: 'Agent Army',
        description: 'Let agents click 5,000 times for you',
        checkType: 'agent_clicks',
        condition: (agentClicks) => agentClicks >= 5000
    },
    {
        id: 'automated_empire',
        title: 'Automated Empire',
        description: 'Let agents click 10,000 times for you',
        checkType: 'agent_clicks',
        condition: (agentClicks) => agentClicks >= 10000
    },
    {
        id: 'bot_battalion',
        title: 'Bot Battalion',
        description: 'Let agents click 50,000 times for you',
        checkType: 'agent_clicks',
        condition: (agentClicks) => agentClicks >= 50000
    },
    {
        id: 'agent_overlord',
        title: 'Agent Overlord',
        description: 'Let agents click 100,000 times for you',
        checkType: 'agent_clicks',
        condition: (agentClicks) => agentClicks >= 100000
    },
    {
        id: 'silicon_workforce',
        title: 'Silicon Workforce',
        description: 'Let agents click 500,000 times for you',
        checkType: 'agent_clicks',
        condition: (agentClicks) => agentClicks >= 500000
    },
    {
        id: 'automated_dynasty',
        title: 'Automated Dynasty',
        description: 'Let agents click 1,000,000 times for you',
        checkType: 'agent_clicks',
        condition: (agentClicks) => agentClicks >= 1000000
    },
    {
        id: 'agent_ascension',
        title: 'Agent Ascension',
        description: 'Let agents click 5,000,000 times for you',
        checkType: 'agent_clicks',
        condition: (agentClicks) => agentClicks >= 5000000
    },
    {
        id: 'agent_mastery',
        title: 'AGENT MASTERY',
        description: 'Achieved ultimate automation mastery with 5,000,000 agent clicks',
        checkType: 'agent_clicks',
        condition: (agentClicks) => agentClicks >= 5000000
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
