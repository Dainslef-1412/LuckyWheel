/**
 * Standalone wheel application
 * This file runs in the exported HTML file
 */

(function() {
    'use strict';

    // State
    let state = {
        mode: 'play',
        config: CONFIG,
        isSpinning: false
    };

    // DOM elements
    const elements = {};

    /**
     * Initialize standalone app
     */
    function init() {
        cacheElements();
        renderWheel();
        setupEventListeners();
        updateUI();
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.playModeBtn = document.getElementById('play-mode-btn');
        elements.editModeBtn = document.getElementById('edit-mode-btn');
        elements.playView = document.getElementById('play-view');
        elements.editView = document.getElementById('edit-view');
        elements.wheelSvg = document.getElementById('wheel-svg');
        elements.wheelTitle = document.getElementById('wheel-title');
        elements.spinBtn = document.getElementById('spin-btn');
        elements.resultDisplay = document.getElementById('result-display');
        elements.editTitle = document.getElementById('edit-title');
        elements.editOptionsList = document.getElementById('edit-options-list');
        elements.addOptionBtn = document.getElementById('add-option-btn');
        elements.saveBtn = document.getElementById('save-btn');
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        elements.playModeBtn.addEventListener('click', () => switchMode('play'));
        elements.editModeBtn.addEventListener('click', () => switchMode('edit'));
        elements.spinBtn.addEventListener('click', spinWheel);
        elements.addOptionBtn.addEventListener('click', addOption);
        elements.saveBtn.addEventListener('click', saveAndDownload);
    }

    /**
     * Switch between play and edit modes
     */
    function switchMode(mode) {
        state.mode = mode;

        if (mode === 'play') {
            elements.playView.classList.add('active');
            elements.editView.classList.remove('active');
            elements.playModeBtn.classList.add('active');
            elements.editModeBtn.classList.remove('active');
        } else {
            elements.playView.classList.remove('active');
            elements.editView.classList.add('active');
            elements.playModeBtn.classList.remove('active');
            elements.editModeBtn.classList.add('active');
            renderEditForm();
        }
    }

    /**
     * Update UI
     */
    function updateUI() {
        elements.wheelTitle.textContent = state.config.title;
    }

    /**
     * Render wheel
     */
    function renderWheel() {
        const svg = elements.wheelSvg;
        svg.innerHTML = '';

        const centerX = 250;
        const centerY = 250;
        const radius = 200;

        // Calculate angles
        const totalWeight = state.config.items.reduce((sum, item) => sum + item.weight, 0);
        let currentAngle = 0;

        const angles = state.config.items.map(item => {
            const sectorAngle = (item.weight / totalWeight) * 360;
            const angleInfo = {
                start: currentAngle,
                end: currentAngle + sectorAngle,
                center: currentAngle + sectorAngle / 2
            };
            currentAngle += sectorAngle;
            return angleInfo;
        });

        // Create wheel group
        const wheelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        wheelGroup.setAttribute('id', 'wheel-container');
        // Set transform origin to center of wheel for proper rotation
        wheelGroup.style.transformOrigin = `${centerX}px ${centerY}px`;

        // Render sectors
        state.config.items.forEach((item, index) => {
            const sector = createSector(item, angles[index], centerX, centerY, radius);
            wheelGroup.appendChild(sector);
        });

        svg.appendChild(wheelGroup);

        // Add center circle
        const centerCircle = createCenterCircle(centerX, centerY);
        svg.appendChild(centerCircle);

        // Add pointer
        const pointer = createPointer(centerX, centerY, radius);
        svg.appendChild(pointer);

        // Apply theme
        applyTheme();
    }

    /**
     * Create sector element
     */
    function createSector(item, angleRange, centerX, centerY, radius) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Create sector path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = generateSectorPath(centerX, centerY, radius, angleRange.start, angleRange.end);
        path.setAttribute('d', d);
        path.setAttribute('fill', item.color || '#ccc');
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '2');
        g.appendChild(path);

        // Add label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const labelRadius = radius * 0.67;
        const angleRad = (angleRange.center - 90) * (Math.PI / 180);
        const x = centerX + labelRadius * Math.cos(angleRad);
        const y = centerY + labelRadius * Math.sin(angleRad);

        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', '#fff');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('transform', `rotate(${angleRange.center}, ${x}, ${y})`);

        // Truncate text if too long
        const maxLength = 15;
        const label = item.label.length > maxLength ? item.label.substr(0, maxLength - 3) + '...' : item.label;
        text.textContent = label;

        g.appendChild(text);

        return g;
    }

    /**
     * Generate sector path
     */
    function generateSectorPath(centerX, centerY, radius, startAngle, endAngle) {
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const startX = centerX + radius * Math.cos(startRad);
        const startY = centerY + radius * Math.sin(startRad);
        const endX = centerX + radius * Math.cos(endRad);
        const endY = centerY + radius * Math.sin(endRad);

        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

        return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    }

    /**
     * Create center circle
     */
    function createCenterCircle(centerX, centerY) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', centerX);
        circle.setAttribute('cy', centerY);
        circle.setAttribute('r', 50);
        circle.setAttribute('fill', '#fff');
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '3');
        g.appendChild(circle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', centerX);
        text.setAttribute('y', centerY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', '#333');
        text.setAttribute('font-size', '16');
        text.setAttribute('font-weight', 'bold');
        text.textContent = '开始';
        text.setAttribute('id', 'center-text');
        g.appendChild(text);

        return g;
    }

    /**
     * Create pointer
     */
    function createPointer(centerX, centerY, radius) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const pointer = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const points = [
            { x: centerX, y: centerY - radius - 20 },
            { x: centerX - 10, y: centerY - radius - 40 },
            { x: centerX + 10, y: centerY - radius - 40 }
        ];

        pointer.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
        pointer.setAttribute('fill', '#ff4444');
        pointer.setAttribute('stroke', '#fff');
        pointer.setAttribute('stroke-width', '2');

        g.appendChild(pointer);

        return g;
    }

    /**
     * Apply theme
     */
    function applyTheme() {
        const root = document.documentElement;

        // Set CSS variables based on theme
        if (state.config.theme === 'forest') {
            root.style.setProperty('--theme-background', '#1a1a1a');
            root.style.setProperty('--theme-text', '#ffffff');
            root.style.setProperty('--theme-accent', '#90be6d');
        } else if (state.config.theme === 'ocean') {
            root.style.setProperty('--theme-background', '#023e8a');
            root.style.setProperty('--theme-text', '#ffffff');
            root.style.setProperty('--theme-accent', '#00b4d8');
        } else if (state.config.theme === 'sunset') {
            root.style.setProperty('--theme-background', '#2d3436');
            root.style.setProperty('--theme-text', '#ffffff');
            root.style.setProperty('--theme-accent', '#feca57');
        } else if (state.config.theme === 'berry') {
            root.style.setProperty('--theme-background', '#1e1e2e');
            root.style.setProperty('--theme-text', '#ffffff');
            root.style.setProperty('--theme-accent', '#c44569');
        } else if (state.config.theme === 'fresh') {
            root.style.setProperty('--theme-background', '#2d3436');
            root.style.setProperty('--theme-text', '#ffffff');
            root.style.setProperty('--theme-accent', '#00b894');
        }
    }

    /**
     * Spin wheel
     */
    function spinWheel() {
        if (state.isSpinning) return;
        if (state.config.items.length < 2) {
            alert('至少需要 2 个选项');
            return;
        }

        state.isSpinning = true;
        elements.spinBtn.disabled = true;
        elements.resultDisplay.classList.remove('show');

        // Determine winner
        const totalWeight = state.config.items.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        let winner = state.config.items[0];

        for (const item of state.config.items) {
            random -= item.weight;
            if (random <= 0) {
                winner = item;
                break;
            }
        }

        // Calculate angles
        const totalWeight2 = state.config.items.reduce((sum, item) => sum + item.weight, 0);
        let currentAngle = 0;
        const angles = state.config.items.map(item => {
            const sectorAngle = (item.weight / totalWeight2) * 360;
            const angleInfo = { center: currentAngle + sectorAngle / 2 };
            currentAngle += sectorAngle;
            return angleInfo;
        });

        const winnerIndex = state.config.items.findIndex(item => item.id === winner.id);
        const winnerAngle = angles[winnerIndex].center;

        // Calculate rotation
        const spins = 5;
        const targetRotation = (360 * spins) + (360 - winnerAngle);

        // Apply animation
        const wheelGroup = elements.wheelSvg.querySelector('#wheel-container');
        wheelGroup.style.transformOrigin = '250px 250px';
        wheelGroup.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        wheelGroup.style.transform = `rotate(${targetRotation}deg)`;

        // Update center text
        const centerText = document.getElementById('center-text');
        centerText.textContent = '旋转中...';

        // Show result after animation
        setTimeout(() => {
            state.isSpinning = false;
            elements.spinBtn.disabled = false;
            centerText.textContent = winner.label;

            elements.resultDisplay.textContent = `🎉 ${winner.label}`;
            elements.resultDisplay.classList.add('show');
        }, 4000);
    }

    /**
     * Render edit form
     */
    function renderEditForm() {
        elements.editTitle.value = state.config.title;
        renderEditOptions();
    }

    /**
     * Render edit options
     */
    function renderEditOptions() {
        elements.editOptionsList.innerHTML = state.config.items.map((item, index) => `
            <div class="option-item" data-id="${item.id}">
                <input
                    type="text"
                    value="${item.label}"
                    placeholder="选项 ${index + 1}"
                    data-field="label"
                    data-id="${item.id}"
                >
                <input
                    type="number"
                    value="${item.weight}"
                    min="1"
                    placeholder="权重"
                    data-field="weight"
                    data-id="${item.id}"
                >
                <button
                    type="button"
                    class="btn btn-danger"
                    data-action="remove"
                    data-id="${item.id}"
                >×</button>
            </div>
        `).join('');

        // Add event listeners
        elements.editOptionsList.addEventListener('input', handleEditInput);
        elements.editOptionsList.addEventListener('click', handleEditClick);
    }

    /**
     * Handle edit input
     */
    function handleEditInput(e) {
        const target = e.target;
        const id = target.dataset.id;
        const field = target.dataset.field;

        if (!id || !field) return;

        const item = state.config.items.find(item => item.id === id);
        if (!item) return;

        let value = target.value;

        if (field === 'weight') {
            value = parseInt(value, 10) || 1;
            if (value < 1) value = 1;
        }

        item[field] = value;
    }

    /**
     * Handle edit click
     */
    function handleEditClick(e) {
        const target = e.target;

        if (target.dataset.action === 'remove') {
            const id = target.dataset.id;

            if (state.config.items.length <= 2) {
                alert('最少需要 2 个选项');
                return;
            }

            state.config.items = state.config.items.filter(item => item.id !== id);
            renderEditOptions();
        }
    }

    /**
     * Add option
     */
    function addOption() {
        if (state.config.items.length >= 20) {
            alert('最多只能添加 20 个选项');
            return;
        }

        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            label: `选项${state.config.items.length + 1}`,
            weight: 1,
            color: state.config.items[0].color || '#ccc'
        };

        state.config.items.push(newItem);
        renderEditOptions();
    }

    /**
     * Save and download
     */
    function saveAndDownload() {
        // Update title
        state.config.title = elements.editTitle.value;

        // Show updated config in console
        console.log('Updated config:', state.config);

        alert('配置已更新！点击"游玩"按钮查看效果。\\n\\n要下载新版本，请重新从生成器导出。');

        // Re-render wheel
        renderWheel();
        updateUI();

        // Switch to play mode
        switchMode('play');
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
