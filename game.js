(function() {
    'use strict';

    const COLORS = {
        RED: '#ff4444',
        BLUE: '#4488ff',
        GREEN: '#44ff44',
        YELLOW: '#ffff44',
        PURPLE: '#aa44ff'
    };
    const COLOR_KEYS = Object.keys(COLORS);

    const CONFIG = {
        BORN_PROTECTION_TIME: 800,
        EAT_HITBOX_PADDING: 10,
        DEATH_HITBOX_PADDING: -4,
        PLAYER_RADIUS: 15,
        PLAYER_SPEED: 0.15,
        SPAWN_INTERVAL: 1500,
        INITIAL_SPAWN_INTERVAL: 2000,
        DIFFICULTY_INCREASE_RATE: 0.0001,
        COLOR_LINE_INTERVAL: 8000,
        GAME_SPEED: 2,
        SOUND_ENABLED: true,
        VOLUME: 50
    };

    class SoundFX {
        constructor() {
            this.ctx = null;
            this.ready = false;
            this.initOnFirstInteraction();
        }

        initOnFirstInteraction() {
            const init = () => {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
                this.ready = true;
                document.removeEventListener('click', init);
                document.removeEventListener('touchstart', init);
                document.removeEventListener('keydown', init);
            };
            document.addEventListener('click', init);
            document.addEventListener('touchstart', init);
            document.addEventListener('keydown', init);
        }

        playTone(freq, duration, type, delay) {
            if (!CONFIG.SOUND_ENABLED || !this.ready || !this.ctx) return;
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            try {
                const startTime = this.ctx.currentTime + (delay || 0);
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = type || 'sine';
                osc.frequency.setValueAtTime(freq, startTime);
                
                const vol = CONFIG.VOLUME / 100 * 0.15;
                gain.gain.setValueAtTime(vol, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start(startTime);
                osc.stop(startTime + duration);
            } catch(e) {}
        }

        playEat() {
            this.playTone(600, 0.15, 'sine');
            this.playTone(900, 0.1, 'sine', 0.05);
        }

        playColorChange() {
            this.playTone(400, 0.2, 'triangle');
        }

        playColorLine() {
            this.playTone(500, 0.25, 'sine');
            this.playTone(700, 0.15, 'sine', 0.08);
        }

        playDeath() {
            this.playTone(300, 0.4, 'sine');
            this.playTone(200, 0.5, 'sine', 0.1);
            this.playTone(120, 0.6, 'sine', 0.25);
        }
    }

    const soundFX = new SoundFX();

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.vx = (Math.random() - 0.5) * 8;
            this.vy = (Math.random() - 0.5) * 8;
            this.life = 1.0;
            this.decay = 0.02 + Math.random() * 0.02;
            this.radius = 3 + Math.random() * 4;
        }

        update(dt) {
            this.x += this.vx * dt * 60;
            this.y += this.vy * dt * 60;
            this.life -= this.decay * dt * 60;
            this.radius *= 0.98;
        }

        draw(ctx) {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    class Trail {
        constructor() {
            this.points = [];
            this.maxLength = 20;
        }

        addPoint(x, y, color) {
            this.points.unshift({ x, y, color });
            if (this.points.length > this.maxLength) {
                this.points.pop();
            }
        }

        draw(ctx) {
            for (let i = 1; i < this.points.length; i++) {
                const p = this.points[i];
                const alpha = 1 - (i / this.points.length);
                ctx.globalAlpha = alpha * 0.5;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, CONFIG.PLAYER_RADIUS * (1 - i / this.points.length), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }

    class Obstacle {
        constructor(x, y, radius, color, colorKey, type = 'static', patternData = {}) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.colorKey = colorKey;
            this.type = type;
            this.patternData = patternData;
            this.baseX = x;
            this.baseY = y;
            this.phase = Math.random() * Math.PI * 2;
            this.active = true;
        }

        update(dt, time) {
            switch (this.type) {
                case 'rotating':
                    this.angle = (this.patternData.angle || 0) + time * 0.002;
                    break;
                case 'sine':
                    this.x = this.baseX + Math.sin(time * 0.003 + this.phase) * (this.patternData.amplitude || 50);
                    break;
                case 'breathing':
                    this.radius = this.patternData.baseRadius + Math.sin(time * 0.004 + this.phase) * 5;
                    break;
                case 'rushing':
                    this.x = this.baseX + Math.sin(time * 0.005 + this.phase) * (this.patternData.amplitude || 30);
                    break;
            }
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;
            ctx.beginPath();

            if (this.patternData.shape === 'rect') {
                ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            } else if (this.patternData.shape === 'triangle') {
                ctx.moveTo(this.x, this.y - this.radius);
                ctx.lineTo(this.x + this.radius, this.y + this.radius);
                ctx.lineTo(this.x - this.radius, this.y + this.radius);
                ctx.closePath();
            } else {
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        checkCollision(playerX, playerY, playerRadius, isDeathCheck) {
            const dx = this.x - playerX;
            const dy = this.y - playerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const hitboxPadding = isDeathCheck ? CONFIG.DEATH_HITBOX_PADDING : -CONFIG.EAT_HITBOX_PADDING;
            const collisionDistance = this.radius + playerRadius + hitboxPadding;
            return distance < collisionDistance;
        }
    }

    class ColorLine {
        constructor(y, width) {
            this.y = y;
            this.width = width;
            this.height = 25;
            this.color = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
            this.passed = false;
        }

        draw(ctx, canvasWidth) {
            const gradient = ctx.createLinearGradient(0, this.y, 0, this.y + this.height);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.3, COLORS[this.color]);
            gradient.addColorStop(0.7, COLORS[this.color]);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, this.y, canvasWidth, this.height);
        }

        checkCollision(playerX, playerY, playerRadius) {
            return playerY + playerRadius > this.y && playerY - playerRadius < this.y + this.height;
        }
    }

    class ColorChanger {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
        }

        draw(ctx) {
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, COLORS[this.color]);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        checkCollision(playerX, playerY) {
            return playerX > this.x && playerX < this.x + this.width &&
                   playerY > this.y && playerY < this.y + this.height;
        }
    }

    class Game {
        constructor() {
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.container = document.getElementById('game-container');
            
            this.highScore = parseInt(localStorage.getItem('colorRunHighScore')) || 0;
            this.settings = {
                speed: parseInt(localStorage.getItem('colorRunSpeed')) || 2,
                playerSize: parseInt(localStorage.getItem('colorRunPlayerSize')) || 15,
                soundEnabled: localStorage.getItem('colorRunSound') !== 'false',
                volume: parseInt(localStorage.getItem('colorRunVolume')) || 50,
                invincible: localStorage.getItem('colorRunInvincible') === 'true'
            };
            
            this.resize();

            this.state = 'waiting';
            this.score = 0;
            this.playerColor = 'RED';
            this.targetX = this.canvas.width / 2;
            this.targetY = this.canvas.height / 2;
            this.playerX = this.targetX;
            this.playerY = this.targetY;

            this.obstacles = [];
            this.particles = [];
            this.colorChangers = [];
            this.colorLines = [];
            this.patternLabels = [];
            this.trail = new Trail();

            this.lastTime = 0;
            this.gameTime = 0;
            this.lastSpawnTime = 0;
            this.lastColorLineY = 0;
            this.spawnInterval = CONFIG.INITIAL_SPAWN_INTERVAL;
            this.bornProtectionEnd = 0;
            this.colorChangerCount = 0;

            this.screenShake = { intensity: 0, duration: 0 };
            this.patternIndex = 0;
            this.deathPosition = null;
            this.collidedObstacle = null;

            this.bindEvents();
            this.initSettings();
            this.updateHighScoreDisplay();
            this.gameLoop(0);
        }

        resize() {
            const rect = this.container.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }

        initSettings() {
            const speedSlider = document.getElementById('speed-slider');
            const sizeSlider = document.getElementById('size-slider');
            const soundToggle = document.getElementById('sound-toggle');
            const volumeSlider = document.getElementById('volume-slider');
            const invincibleToggle = document.getElementById('invincible-toggle');
            
            speedSlider.value = this.settings.speed;
            sizeSlider.value = this.settings.playerSize;
            soundToggle.checked = this.settings.soundEnabled;
            volumeSlider.value = this.settings.volume;
            invincibleToggle.checked = this.settings.invincible;
            
            document.getElementById('speed-value').textContent = this.settings.speed.toFixed(1) + 'x';
            document.getElementById('size-value').textContent = this.settings.playerSize;
            
            CONFIG.GAME_SPEED = this.settings.speed;
            CONFIG.PLAYER_RADIUS = this.settings.playerSize;
            CONFIG.SOUND_ENABLED = this.settings.soundEnabled;
            CONFIG.VOLUME = this.settings.volume;
        }

        updateHighScoreDisplay() {
            document.getElementById('high-score').textContent = '最高: ' + this.highScore;
        }

        bindEvents() {
            window.addEventListener('resize', () => this.resize());

            const handleInput = (x, y) => {
                const rect = this.canvas.getBoundingClientRect();
                const canvasX = x - rect.left;
                const canvasY = y - rect.top;
                
                if (this.state === 'waiting') {
                    this.startGame();
                } else if (this.state === 'gameover') {
                    this.resetGame();
                } else if (this.state === 'playing') {
                    this.targetX = canvasX;
                    this.targetY = canvasY;
                }
            };

            document.addEventListener('mousemove', (e) => {
                if (this.state === 'playing') {
                    handleInput(e.clientX, e.clientY);
                }
            });

            document.addEventListener('touchmove', (e) => {
                if (this.state === 'playing' && e.touches.length > 0) {
                    e.preventDefault();
                    handleInput(e.touches[0].clientX, e.touches[0].clientY);
                }
            }, { passive: false });

            document.addEventListener('touchstart', (e) => {
                if (this.state === 'waiting' || this.state === 'gameover') {
                    e.preventDefault();
                    handleInput(e.touches[0].clientX, e.touches[0].clientY);
                } else if (this.state === 'playing' && e.touches.length > 0) {
                    handleInput(e.touches[0].clientX, e.touches[0].clientY);
                }
            }, { passive: false });

            document.addEventListener('click', (e) => {
                if (this.state !== 'paused') {
                    handleInput(e.clientX, e.clientY);
                }
            });

            document.getElementById('pause-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.state === 'playing' || this.state === 'dying' || this.state === 'gameover') {
                    this.pauseGame();
                }
            });

            document.getElementById('resume-btn').addEventListener('click', () => {
                this.resumeGame();
            });

            document.getElementById('speed-slider').addEventListener('input', (e) => {
                this.settings.speed = parseFloat(e.target.value);
                CONFIG.GAME_SPEED = this.settings.speed;
                localStorage.setItem('colorRunSpeed', this.settings.speed);
                document.getElementById('speed-value').textContent = this.settings.speed.toFixed(1) + 'x';
            });

            document.getElementById('size-slider').addEventListener('input', (e) => {
                this.settings.playerSize = parseInt(e.target.value);
                CONFIG.PLAYER_RADIUS = this.settings.playerSize;
                localStorage.setItem('colorRunPlayerSize', this.settings.playerSize);
                document.getElementById('size-value').textContent = this.settings.playerSize;
            });

            document.getElementById('sound-toggle').addEventListener('change', (e) => {
                this.settings.soundEnabled = e.target.checked;
                CONFIG.SOUND_ENABLED = this.settings.soundEnabled;
                localStorage.setItem('colorRunSound', this.settings.soundEnabled);
            });

            document.getElementById('volume-slider').addEventListener('input', (e) => {
                this.settings.volume = parseInt(e.target.value);
                CONFIG.VOLUME = this.settings.volume;
                localStorage.setItem('colorRunVolume', this.settings.volume);
            });

            document.getElementById('invincible-toggle').addEventListener('change', (e) => {
                this.settings.invincible = e.target.checked;
                localStorage.setItem('colorRunInvincible', this.settings.invincible);
            });
        }

        pauseGame() {
            this.state = 'paused';
            document.getElementById('pause-screen').classList.remove('hidden');
        }

        resumeGame() {
            this.state = 'playing';
            document.getElementById('pause-screen').classList.add('hidden');
        }

        startGame() {
            this.state = 'playing';
            this.score = 0;
            this.playerColor = 'RED';
            this.gameTime = 0;
            this.lastSpawnTime = 0;
            this.lastColorLineY = 0;
            this.colorChangerCount = 0;
            this.spawnInterval = CONFIG.INITIAL_SPAWN_INTERVAL;
            this.bornProtectionEnd = performance.now() + CONFIG.BORN_PROTECTION_TIME;
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('game-over-screen').classList.add('hidden');
            document.getElementById('game-over-screen').classList.remove('visible');
        }

        resetGame() {
            this.obstacles = [];
            this.particles = [];
            this.colorChangers = [];
            this.colorLines = [];
            this.patternLabels = [];
            this.trail = new Trail();
            this.patternIndex = 0;
            this.deathPosition = null;
            this.collidedObstacle = null;
            this.playerX = this.canvas.width / 2;
            this.playerY = this.canvas.height / 2;
            this.targetX = this.playerX;
            this.targetY = this.playerY;
            this.startGame();
        }

        gameOver(collidedObs) {
            this.state = 'dying';
            this.screenShake = { intensity: 25, duration: 300 };
            this.deathTime = performance.now();
            
            this.deathPosition = { x: this.playerX, y: this.playerY, color: COLORS[this.playerColor] };
            this.collidedObstacle = collidedObs;
            
            for (let i = 0; i < 150; i++) {
                const p = new Particle(this.playerX, this.playerY, COLORS[this.playerColor]);
                p.vx = (Math.random() - 0.5) * 15;
                p.vy = (Math.random() - 0.5) * 15;
                p.radius = 4 + Math.random() * 6;
                this.particles.push(p);
            }
            
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('colorRunHighScore', this.highScore);
                this.updateHighScoreDisplay();
            }
            
            document.getElementById('final-score').textContent = '得分: ' + this.score;
            document.getElementById('final-high-score').textContent = '最高: ' + this.highScore;
        }

        showGameOverScreen() {
            this.state = 'gameover';
            this.screenShake.duration = 0;
            document.getElementById('game-over-screen').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('game-over-screen').classList.add('visible');
            }, 50);
        }

        spawnObstacles() {
            const patterns = window.getPatterns ? window.getPatterns() : this.getDefaultPatterns();
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];

            let minY = Infinity;
            for (const obs of pattern.obstacles) {
                const x = obs.x * this.canvas.width;
                const y = obs.y * this.canvas.height;
                if (y < minY) minY = y;
                let colorKey = obs.color;
                if (Math.random() < 0.5) {
                    colorKey = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
                }
                this.obstacles.push(new Obstacle(x, y, obs.radius, COLORS[colorKey], colorKey, obs.type, obs.patternData || {}));
            }

            if (pattern.displayName) {
                this.patternLabels.push({
                    text: pattern.displayName,
                    x: this.canvas.width / 2,
                    y: minY - 25,
                    alpha: 1
                });
            }

            if (pattern.colorChangers && this.colorChangerCount < 2) {
                for (const cc of pattern.colorChangers) {
                    const x = cc.x * this.canvas.width;
                    const y = cc.y * this.canvas.height;
                    this.colorChangers.push(new ColorChanger(x, y, cc.width, cc.height));
                    this.colorChangerCount++;
                }
            }
        }

        spawnColorLine() {
            const y = -30;
            this.colorLines.push(new ColorLine(y, this.canvas.width));
            this.colorChangerCount = 0;
        }

        getDefaultPatterns() {
            return [
                {
                    obstacles: [
                        { x: 0.25, y: -0.1, radius: 25, color: 'RED', type: 'static' },
                        { x: 0.75, y: -0.1, radius: 25, color: 'BLUE', type: 'static' },
                        { x: 0.5, y: -0.1, radius: 25, color: 'RED', type: 'static' }
                    ]
                },
                {
                    obstacles: [
                        { x: 0.2, y: -0.1, radius: 30, color: 'GREEN', type: 'static' },
                        { x: 0.4, y: -0.1, radius: 30, color: 'GREEN', type: 'static' },
                        { x: 0.6, y: -0.1, radius: 30, color: 'BLUE', type: 'static' },
                        { x: 0.8, y: -0.1, radius: 30, color: 'BLUE', type: 'static' }
                    ],
                    colorChangers: [{ x: 0.5, y: -0.1, width: 150, height: 20 }]
                },
                {
                    obstacles: [
                        { x: 0.5, y: -0.15, radius: 40, color: 'YELLOW', type: 'breathing', patternData: { baseRadius: 35 } },
                        { x: 0.3, y: -0.1, radius: 20, color: 'RED', type: 'static' },
                        { x: 0.7, y: -0.1, radius: 20, color: 'RED', type: 'static' }
                    ]
                }
            ];
        }

        update(dt) {
            if (this.state === 'dying' || this.state === 'gameover') {
                const speedMultiplier = CONFIG.GAME_SPEED;
                
                for (let i = this.obstacles.length - 1; i >= 0; i--) {
                    const obs = this.obstacles[i];
                    if (obs !== this.collidedObstacle) {
                        obs.update(dt * speedMultiplier, this.gameTime);
                        obs.y += 2 * dt * 60 * speedMultiplier;
                        if (obs.y > this.canvas.height + 100) {
                            this.obstacles.splice(i, 1);
                        }
                    }
                }
                
                for (let i = this.colorChangers.length - 1; i >= 0; i--) {
                    const cc = this.colorChangers[i];
                    cc.y += 2 * dt * 60 * speedMultiplier;
                    if (cc.y > this.canvas.height + 50) {
                        this.colorChangers.splice(i, 1);
                    }
                }
                
                for (let i = this.colorLines.length - 1; i >= 0; i--) {
                    const cl = this.colorLines[i];
                    cl.y += 2 * dt * 60 * speedMultiplier;
                    if (cl.y > this.canvas.height + 50) {
                        this.colorLines.splice(i, 1);
                    }
                }
                
                for (let i = this.patternLabels.length - 1; i >= 0; i--) {
                    this.patternLabels[i].y += 2 * dt * 60 * speedMultiplier;
                    this.patternLabels[i].alpha -= dt * 0.04;
                    if (this.patternLabels[i].y > this.canvas.height + 50 || this.patternLabels[i].alpha <= 0) {
                        this.patternLabels.splice(i, 1);
                    }
                }
                
                if (this.deathPosition) {
                    for (let i = 0; i < 5; i++) {
                        const p = new Particle(this.deathPosition.x, this.deathPosition.y, this.deathPosition.color);
                        p.vx = (Math.random() - 0.5) * 3;
                        p.vy = 1 + Math.random() * 4;
                        p.radius = 2 + Math.random() * 4;
                        p.decay = 0.01 + Math.random() * 0.01;
                        this.particles.push(p);
                    }
                }
                
                if (this.collidedObstacle) {
                    for (let i = 0; i < 5; i++) {
                        const p = new Particle(this.collidedObstacle.x, this.collidedObstacle.y, this.collidedObstacle.color);
                        p.vx = (Math.random() - 0.5) * 3;
                        p.vy = 1 + Math.random() * 4;
                        p.radius = 2 + Math.random() * 4;
                        p.decay = 0.01 + Math.random() * 0.01;
                        this.particles.push(p);
                    }
                }
                
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    this.particles[i].update(dt * speedMultiplier);
                    if (this.particles[i].life <= 0) {
                        this.particles.splice(i, 1);
                    }
                }
                
                if (this.screenShake.duration > 0) {
                    this.screenShake.duration -= dt * 1000;
                }
                
                if (this.state === 'dying' && performance.now() - this.deathTime > 0) {
                    this.showGameOverScreen();
                }
                return;
            }

            if (this.state !== 'playing') return;

            const speedMultiplier = CONFIG.GAME_SPEED;
            this.gameTime += dt * 1000 * speedMultiplier;

            this.playerX += (this.targetX - this.playerX) * CONFIG.PLAYER_SPEED * dt * 60;
            this.playerY += (this.targetY - this.playerY) * CONFIG.PLAYER_SPEED * dt * 60;

            this.playerX = Math.max(CONFIG.PLAYER_RADIUS, Math.min(this.canvas.width - CONFIG.PLAYER_RADIUS, this.playerX));
            this.playerY = Math.max(CONFIG.PLAYER_RADIUS, Math.min(this.canvas.height - CONFIG.PLAYER_RADIUS, this.playerY));

            this.trail.addPoint(this.playerX, this.playerY, COLORS[this.playerColor]);

            if (this.gameTime - this.lastSpawnTime > this.spawnInterval) {
                this.spawnObstacles();
                this.lastSpawnTime = this.gameTime;
                this.spawnInterval = Math.max(600, this.spawnInterval - CONFIG.DIFFICULTY_INCREASE_RATE * this.score);
            }

            if (this.gameTime - this.lastColorLineY > CONFIG.COLOR_LINE_INTERVAL) {
                this.spawnColorLine();
                this.lastColorLineY = this.gameTime;
            }

            const isBornProtected = performance.now() < this.bornProtectionEnd;

            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                const obs = this.obstacles[i];
                obs.update(dt * speedMultiplier, this.gameTime);
                obs.y += 2 * dt * 60 * speedMultiplier;

                if (obs.y > this.canvas.height + 100) {
                    obs.active = false;
                }

                if (obs.active && obs.checkCollision(this.playerX, this.playerY, CONFIG.PLAYER_RADIUS, false)) {
                    if (obs.colorKey === this.playerColor) {
                        this.score++;
                        soundFX.playEat();
                        for (let j = 0; j < 10; j++) {
                            this.particles.push(new Particle(obs.x, obs.y, obs.color));
                        }
                        obs.active = false;
                    }
                }

                if (!this.settings.invincible && obs.active && !isBornProtected && obs.checkCollision(this.playerX, this.playerY, CONFIG.PLAYER_RADIUS, true)) {
                    if (obs.colorKey !== this.playerColor) {
                        soundFX.playDeath();
                        this.gameOver(obs);
                        return;
                    }
                }

                if (!obs.active) {
                    this.obstacles.splice(i, 1);
                }
            }

            for (let i = this.colorChangers.length - 1; i >= 0; i--) {
                const cc = this.colorChangers[i];
                cc.y += 2 * dt * 60 * speedMultiplier;

                if (cc.checkCollision(this.playerX, this.playerY)) {
                    this.score = Math.max(0, this.score - 1);
                    this.playerColor = cc.color;
                    soundFX.playColorChange();
                    for (let j = 0; j < 5; j++) {
                        this.particles.push(new Particle(this.playerX, this.playerY, COLORS[cc.color]));
                    }
                    this.colorChangers.splice(i, 1);
                    continue;
                }

                if (cc.y > this.canvas.height + 50) {
                    this.colorChangers.splice(i, 1);
                }
            }

            for (let i = this.colorLines.length - 1; i >= 0; i--) {
                const cl = this.colorLines[i];
                cl.y += 2 * dt * 60 * speedMultiplier;

                if (!cl.passed && cl.checkCollision(this.playerX, this.playerY, CONFIG.PLAYER_RADIUS)) {
                    this.playerColor = cl.color;
                    cl.passed = true;
                    soundFX.playColorLine();
                    for (let j = 0; j < 8; j++) {
                        this.particles.push(new Particle(this.playerX, this.playerY, COLORS[cl.color]));
                    }
                }

                if (cl.y > this.canvas.height + 50) {
                    this.colorLines.splice(i, 1);
                }
            }

            for (let i = this.patternLabels.length - 1; i >= 0; i--) {
                this.patternLabels[i].y += 2 * dt * 60 * speedMultiplier;
                this.patternLabels[i].alpha -= dt * 0.15;
                if (this.patternLabels[i].y > this.canvas.height + 50 || this.patternLabels[i].alpha <= 0) {
                    this.patternLabels.splice(i, 1);
                }
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update(dt * speedMultiplier);
                if (this.particles[i].life <= 0) {
                    this.particles.splice(i, 1);
                }
            }

            if (this.screenShake.duration > 0) {
                this.screenShake.duration -= dt * 1000;
            }

            document.getElementById('current-score').textContent = this.score;
        }

        draw() {
            let offsetX = 0, offsetY = 0;
            if (this.screenShake.duration > 0) {
                offsetX = (Math.random() - 0.5) * this.screenShake.intensity;
                offsetY = (Math.random() - 0.5) * this.screenShake.intensity;
            }

            this.ctx.save();
            this.ctx.translate(offsetX, offsetY);

            this.ctx.fillStyle = '#0a0a0a';
            this.ctx.fillRect(-10, -10, this.canvas.width + 20, this.canvas.height + 20);

            this.trail.draw(this.ctx);

            for (const cl of this.colorLines) {
                cl.draw(this.ctx, this.canvas.width);
            }

            for (const cc of this.colorChangers) {
                cc.draw(this.ctx);
            }

            for (const obs of this.obstacles) {
                obs.draw(this.ctx);
            }

            for (const p of this.particles) {
                p.draw(this.ctx);
            }

            for (const label of this.patternLabels) {
                this.ctx.save();
                this.ctx.globalAlpha = Math.max(0, label.alpha) * 0.6;
                this.ctx.font = '16px sans-serif';
                this.ctx.fillStyle = '#ffffff';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(label.text, label.x, label.y);
                this.ctx.restore();
            }

            if (this.state === 'playing' || this.state === 'paused') {
                this.ctx.fillStyle = COLORS[this.playerColor];
                this.ctx.shadowColor = COLORS[this.playerColor];
                this.ctx.shadowBlur = 20;
                this.ctx.beginPath();
                this.ctx.arc(this.playerX, this.playerY, CONFIG.PLAYER_RADIUS, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
            
            if ((this.state === 'dying' || this.state === 'gameover') && this.deathPosition) {
                this.ctx.fillStyle = this.deathPosition.color;
                this.ctx.shadowColor = this.deathPosition.color;
                this.ctx.shadowBlur = 20;
                this.ctx.beginPath();
                this.ctx.arc(this.deathPosition.x, this.deathPosition.y, CONFIG.PLAYER_RADIUS, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }

            this.ctx.restore();
        }

        gameLoop(timestamp) {
            const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
            this.lastTime = timestamp;

            this.update(dt);
            this.draw();

            requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    window.addEventListener('load', () => {
        new Game();
    });
})();