(function() {
    'use strict';

    const PATTERNS = [
        {
            name: 'wave-dance',
            displayName: '波浪舞',
            type: 'dynamic',
            obstacles: [
                { x: 0.1, y: -0.1, radius: 18, color: 'RED', type: 'sine', patternData: { amplitude: 80 } },
                { x: 0.3, y: -0.15, radius: 18, color: 'BLUE', type: 'sine', patternData: { amplitude: 60 } },
                { x: 0.5, y: -0.1, radius: 18, color: 'GREEN', type: 'sine', patternData: { amplitude: 70 } },
                { x: 0.7, y: -0.15, radius: 18, color: 'YELLOW', type: 'sine', patternData: { amplitude: 50 } },
                { x: 0.9, y: -0.1, radius: 18, color: 'PURPLE', type: 'sine', patternData: { amplitude: 65 } }
            ]
        },
        {
            name: 'breathing-wall',
            displayName: '呼吸墙',
            type: 'dynamic',
            obstacles: [
                { x: 0.15, y: -0.1, radius: 30, color: 'RED', type: 'breathing', patternData: { baseRadius: 25 } },
                { x: 0.35, y: -0.12, radius: 35, color: 'BLUE', type: 'breathing', patternData: { baseRadius: 28 } },
                { x: 0.55, y: -0.1, radius: 30, color: 'GREEN', type: 'breathing', patternData: { baseRadius: 25 } },
                { x: 0.75, y: -0.12, radius: 35, color: 'YELLOW', type: 'breathing', patternData: { baseRadius: 28 } },
                { x: 0.95, y: -0.1, radius: 30, color: 'PURPLE', type: 'breathing', patternData: { baseRadius: 25 } }
            ]
        },
        {
            name: 'cross-fire',
            displayName: '交叉火力',
            type: 'dynamic',
            obstacles: [
                { x: 0.2, y: -0.08, radius: 22, color: 'RED', type: 'rushing', patternData: { amplitude: 80, speed: 2.5 } },
                { x: 0.8, y: -0.15, radius: 22, color: 'BLUE', type: 'rushing', patternData: { amplitude: 80, speed: 3 } },
                { x: 0.5, y: -0.2, radius: 25, color: 'GREEN', type: 'breathing', patternData: { baseRadius: 20 } }
            ]
        },
        {
            name: 'spiral-gate',
            displayName: '螺旋门',
            type: 'dynamic',
            obstacles: [
                { x: 0.3, y: -0.1, radius: 28, color: 'YELLOW', type: 'rotating', patternData: { angle: 0 } },
                { x: 0.7, y: -0.1, radius: 28, color: 'PURPLE', type: 'rotating', patternData: { angle: Math.PI } },
                { x: 0.5, y: -0.18, radius: 20, color: 'RED', type: 'sine', patternData: { amplitude: 50 } }
            ]
        },
        {
            name: 'twin-vortex',
            displayName: '双漩涡',
            type: 'dynamic',
            obstacles: [
                { x: 0.25, y: -0.1, radius: 35, color: 'RED', type: 'breathing', patternData: { baseRadius: 30 } },
                { x: 0.75, y: -0.1, radius: 35, color: 'BLUE', type: 'breathing', patternData: { baseRadius: 30 } },
                { x: 0.5, y: -0.05, radius: 20, color: 'GREEN', type: 'rushing', patternData: { amplitude: 60, speed: 2 } }
            ]
        },
        {
            name: 'rainbow-wave',
            displayName: '彩虹浪',
            type: 'dynamic',
            obstacles: [
                { x: 0.1, y: -0.08, radius: 16, color: 'RED', type: 'sine', patternData: { amplitude: 40 } },
                { x: 0.25, y: -0.12, radius: 16, color: 'BLUE', type: 'sine', patternData: { amplitude: 50 } },
                { x: 0.4, y: -0.08, radius: 16, color: 'GREEN', type: 'sine', patternData: { amplitude: 45 } },
                { x: 0.55, y: -0.12, radius: 16, color: 'YELLOW', type: 'sine', patternData: { amplitude: 55 } },
                { x: 0.7, y: -0.08, radius: 16, color: 'PURPLE', type: 'sine', patternData: { amplitude: 40 } },
                { x: 0.85, y: -0.12, radius: 16, color: 'RED', type: 'sine', patternData: { amplitude: 50 } }
            ]
        },
        {
            name: 'pulse-ring',
            displayName: '脉冲环',
            type: 'dynamic',
            obstacles: [
                { x: 0.5, y: -0.12, radius: 45, color: 'YELLOW', type: 'breathing', patternData: { baseRadius: 38 } },
                { x: 0.2, y: -0.08, radius: 22, color: 'RED', type: 'rushing', patternData: { amplitude: 30, speed: 2 } },
                { x: 0.8, y: -0.08, radius: 22, color: 'BLUE', type: 'rushing', patternData: { amplitude: 30, speed: 2.5 } }
            ]
        },
        {
            name: 'chaos-dance',
            displayName: '混沌舞',
            type: 'dynamic',
            obstacles: [
                { x: 0.15, y: -0.1, radius: 20, color: 'RED', type: 'sine', patternData: { amplitude: 70 } },
                { x: 0.35, y: -0.15, radius: 25, color: 'BLUE', type: 'breathing', patternData: { baseRadius: 20 } },
                { x: 0.55, y: -0.08, radius: 22, color: 'GREEN', type: 'rushing', patternData: { amplitude: 50, speed: 2 } },
                { x: 0.75, y: -0.12, radius: 20, color: 'YELLOW', type: 'sine', patternData: { amplitude: 60 } },
                { x: 0.95, y: -0.1, radius: 25, color: 'PURPLE', type: 'breathing', patternData: { baseRadius: 20 } }
            ]
        },
        {
            name: 'diamond-formation',
            displayName: '钻石阵',
            type: 'dynamic',
            obstacles: [
                { x: 0.5, y: -0.18, radius: 22, color: 'YELLOW', type: 'breathing', patternData: { baseRadius: 18 } },
                { x: 0.3, y: -0.1, radius: 22, color: 'RED', type: 'sine', patternData: { amplitude: 40 } },
                { x: 0.7, y: -0.1, radius: 22, color: 'BLUE', type: 'sine', patternData: { amplitude: 40 } },
                { x: 0.5, y: -0.05, radius: 22, color: 'GREEN', type: 'breathing', patternData: { baseRadius: 18 } }
            ]
        },
        {
            name: 'hunter-pack',
            displayName: '猎手群',
            type: 'dynamic',
            obstacles: [
                { x: 0.2, y: -0.1, radius: 24, color: 'RED', type: 'rushing', patternData: { amplitude: 60, speed: 2.5 } },
                { x: 0.4, y: -0.15, radius: 24, color: 'RED', type: 'rushing', patternData: { amplitude: 50, speed: 3 } },
                { x: 0.6, y: -0.1, radius: 24, color: 'BLUE', type: 'rushing', patternData: { amplitude: 55, speed: 2.8 } },
                { x: 0.8, y: -0.15, radius: 24, color: 'BLUE', type: 'rushing', patternData: { amplitude: 45, speed: 3.2 } }
            ]
        },
        {
            name: 'gravity-well',
            displayName: '重力井',
            type: 'dynamic',
            obstacles: [
                { x: 0.5, y: -0.12, radius: 50, color: 'PURPLE', type: 'breathing', patternData: { baseRadius: 42 } },
                { x: 0.15, y: -0.08, radius: 18, color: 'YELLOW', type: 'sine', patternData: { amplitude: 30 } },
                { x: 0.85, y: -0.08, radius: 18, color: 'YELLOW', type: 'sine', patternData: { amplitude: 30 } }
            ]
        },
        {
            name: 'phoenix-tail',
            displayName: '凤凰尾',
            type: 'dynamic',
            obstacles: [
                { x: 0.5, y: -0.2, radius: 28, color: 'YELLOW', type: 'breathing', patternData: { baseRadius: 22 } },
                { x: 0.35, y: -0.12, radius: 22, color: 'RED', type: 'breathing', patternData: { baseRadius: 18 } },
                { x: 0.65, y: -0.12, radius: 22, color: 'RED', type: 'breathing', patternData: { baseRadius: 18 } },
                { x: 0.25, y: -0.06, radius: 18, color: 'PURPLE', type: 'sine', patternData: { amplitude: 35 } },
                { x: 0.75, y: -0.06, radius: 18, color: 'PURPLE', type: 'sine', patternData: { amplitude: 35 } }
            ]
        },
        {
            name: 'triple-threat',
            displayName: '三重威胁',
            type: 'dynamic',
            obstacles: [
                { x: 0.25, y: -0.1, radius: 30, color: 'RED', type: 'rotating', patternData: { angle: 0 } },
                { x: 0.5, y: -0.15, radius: 35, color: 'GREEN', type: 'breathing', patternData: { baseRadius: 28 } },
                { x: 0.75, y: -0.1, radius: 30, color: 'BLUE', type: 'rotating', patternData: { angle: Math.PI } }
            ]
        },
        {
            name: 'zigzag-run',
            displayName: '之字跑',
            type: 'dynamic',
            obstacles: [
                { x: 0.1, y: -0.05, radius: 20, color: 'RED', type: 'sine', patternData: { amplitude: 90 } },
                { x: 0.3, y: -0.1, radius: 20, color: 'BLUE', type: 'sine', patternData: { amplitude: 90 } },
                { x: 0.5, y: -0.15, radius: 20, color: 'GREEN', type: 'sine', patternData: { amplitude: 90 } },
                { x: 0.7, y: -0.1, radius: 20, color: 'YELLOW', type: 'sine', patternData: { amplitude: 90 } },
                { x: 0.9, y: -0.05, radius: 20, color: 'PURPLE', type: 'sine', patternData: { amplitude: 90 } }
            ]
        },
        {
            name: 'orbital-defense',
            displayName: '轨道防御',
            type: 'dynamic',
            obstacles: [
                { x: 0.3, y: -0.1, radius: 25, color: 'YELLOW', type: 'rotating', patternData: { angle: 0 } },
                { x: 0.5, y: -0.12, radius: 25, color: 'PURPLE', type: 'rotating', patternData: { angle: Math.PI * 0.5 } },
                { x: 0.7, y: -0.1, radius: 25, color: 'YELLOW', type: 'rotating', patternData: { angle: Math.PI } },
                { x: 0.5, y: -0.05, radius: 20, color: 'GREEN', type: 'breathing', patternData: { baseRadius: 15 } }
            ]
        }
    ];

    if (typeof window !== 'undefined') {
        window.getPatterns = function() {
            return PATTERNS;
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = PATTERNS;
    }
})();
