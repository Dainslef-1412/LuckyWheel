/**
 * Built-in presets for the wheel generator
 */

export const BUILTIN_PRESETS = [
    {
        id: 'dinner',
        name: '🍜 今晚吃什么',
        description: '随机选择晚餐',
        category: '生活',
        config: {
            title: '今晚吃什么',
            theme: 'sunset',
            items: [
                { id: 'dinner-1', label: '火锅', weight: 2 },
                { id: 'dinner-2', label: '烧烤', weight: 2 },
                { id: 'dinner-3', label: '日料', weight: 1 },
                { id: 'dinner-4', label: '中餐', weight: 2 },
                { id: 'dinner-5', label: '西餐', weight: 1 },
                { id: 'dinner-6', label: '快餐', weight: 1 },
                { id: 'dinner-7', label: '素食', weight: 1 }
            ]
        }
    },
    {
        id: 'weekend',
        name: '🎮 周末活动',
        description: '选择周末做什么',
        category: '娱乐',
        config: {
            title: '周末活动',
            theme: 'fresh',
            items: [
                { id: 'weekend-1', label: '看电影', weight: 2 },
                { id: 'weekend-2', label: '逛街', weight: 1 },
                { id: 'weekend-3', label: '运动', weight: 1 },
                { id: 'weekend-4', label: '游戏', weight: 2 },
                { id: 'weekend-5', label: '读书', weight: 1 },
                { id: 'weekend-6', label: '朋友聚会', weight: 1 }
            ]
        }
    },
    {
        id: 'team',
        name: '👥 团队活动',
        description: '团队建设活动选择',
        category: '工作',
        config: {
            title: '团队活动',
            theme: 'ocean',
            items: [
                { id: 'team-1', label: '桌游', weight: 2 },
                { id: 'team-2', label: '密室逃脱', weight: 2 },
                { id: 'team-3', label: '运动', weight: 1 },
                { id: 'team-4', label: '聚餐', weight: 1 },
                { id: 'team-5', label: '户外拓展', weight: 1 }
            ]
        }
    },
    {
        id: 'yes-no',
        name: '🎯 是或否',
        description: '简单的二选一决策',
        category: '决策',
        config: {
            title: '是或否',
            theme: 'berry',
            items: [
                { id: 'yesno-1', label: '是', weight: 1 },
                { id: 'yesno-2', label: '否', weight: 1 }
            ]
        }
    },
    {
        id: 'lunch',
        name: '🍱 午餐选择',
        description: '工作日午餐决定',
        category: '生活',
        config: {
            title: '午餐选择',
            theme: 'forest',
            items: [
                { id: 'lunch-1', label: '便当', weight: 2 },
                { id: 'lunch-2', label: '面馆', weight: 2 },
                { id: 'lunch-3', label: '快餐', weight: 1 },
                { id: 'lunch-4', label: '便利店', weight: 1 },
                { id: 'lunch-5', label: '轻食沙拉', weight: 1 }
            ]
        }
    },
    {
        id: 'movie',
        name: '🎬 电影类型',
        description: '选择今晚看什么电影',
        category: '娱乐',
        config: {
            title: '电影类型',
            theme: 'fresh',
            items: [
                { id: 'movie-1', label: '动作片', weight: 2 },
                { id: 'movie-2', label: '喜剧片', weight: 2 },
                { id: 'movie-3', label: '科幻片', weight: 1 },
                { id: 'movie-4', label: '爱情片', weight: 1 },
                { id: 'movie-5', label: '悬疑片', weight: 1 },
                { id: 'movie-6', label: '动画片', weight: 1 }
            ]
        }
    }
];

/**
 * Get preset by ID
 * @param {string} id - Preset ID
 * @returns {Object|null} Preset object or null if not found
 */
export function getPresetById(id) {
    return BUILTIN_PRESETS.find(preset => preset.id === id) || null;
}

/**
 * Get presets by category
 * @param {string} category - Category name
 * @returns {Array} Array of presets in the category
 */
export function getPresetsByCategory(category) {
    return BUILTIN_PRESETS.filter(preset => preset.category === category);
}

/**
 * Get all unique categories
 * @returns {Array} Array of category names
 */
export function getCategories() {
    const categories = new Set(BUILTIN_PRESETS.map(preset => preset.category));
    return Array.from(categories);
}
