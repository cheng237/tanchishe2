document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('finalScore');
    const startGameBtn = document.getElementById('startGameBtn');
    const restartBtn = document.getElementById('restartBtn');
    const gameOverlay = document.getElementById('gameOverlay');
    const gameMessage = document.querySelector('.game-message');
    const gameOver = document.querySelector('.game-over');
    const controlBtns = {
        up: document.getElementById('upBtn'),
        down: document.getElementById('downBtn'),
        left: document.getElementById('leftBtn'),
        right: document.getElementById('rightBtn')
    };

    // 游戏变量
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let gameRunning = false;
    let score = 0;
    let gameSpeed = 130;
    let gameLoop;
    let tileCount = 20; // 网格数量
    let tileSize; // 动态计算网格大小

    // 蛇身颜色渐变配置
    const snakeGradient = {
        head: '#388e3c', // 蛇头颜色
        body: '#4caf50', // 蛇身主体颜色
        tail: '#81c784'  // 蛇尾颜色
    };

    // 食物图像
    const foodImg = new Image();
    foodImg.src = 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="40" fill="#ff6b6b"/>
        <circle cx="50" cy="50" r="35" fill="#ff8787"/>
        <circle cx="30" cy="30" r="8" fill="#ffffff" fill-opacity="0.6"/>
    </svg>
    `);

    // 初始化游戏设置
    function initGame() {
        // 设置Canvas尺寸
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 初始化蛇
        snake = [];
        for (let i = 0; i < 3; i++) {
            snake.push({ x: 10 - i, y: 10 });
        }

        // 初始化食物
        generateFood();

        // 重置游戏状态
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = score;

        // 绘制初始状态
        drawGame();
    }

    // 调整Canvas尺寸
    function resizeCanvas() {
        const gameContainer = canvas.parentElement;
        canvas.width = gameContainer.offsetWidth;
        canvas.height = gameContainer.offsetHeight;
        tileSize = Math.min(canvas.width, canvas.height) / tileCount;
        
        if (gameRunning) {
            drawGame();
        }
    }

    // 开始游戏
    function startGame() {
        if (gameRunning) return;
        
        gameRunning = true;
        gameOverlay.style.display = 'none';
        
        // 启动游戏循环
        gameLoop = setInterval(updateGame, gameSpeed);
    }

    // 结束游戏
    function endGame() {
        gameRunning = false;
        clearInterval(gameLoop);
        
        finalScoreElement.textContent = score;
        gameOverlay.style.display = 'flex';
        gameMessage.classList.add('hidden');
        gameOver.classList.remove('hidden');
    }

    // 重新开始游戏
    function restartGame() {
        gameMessage.classList.remove('hidden');
        gameOver.classList.add('hidden');
        initGame();
    }

    // 生成食物
    function generateFood() {
        // 确保食物不会出现在蛇身上
        let validPosition = false;
        while (!validPosition) {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            validPosition = true;
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === food.x && snake[i].y === food.y) {
                    validPosition = false;
                    break;
                }
            }
        }
    }

    // 更新游戏状态
    function updateGame() {
        // 更新方向
        direction = nextDirection;
        
        // 移动蛇
        const head = { x: snake[0].x, y: snake[0].y };
        
        switch (direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // 检查游戏是否结束（撞墙或撞到自己）
        if (
            head.x < 0 || head.x >= tileCount ||
            head.y < 0 || head.y >= tileCount ||
            checkCollision(head)
        ) {
            endGame();
            return;
        }
        
        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            // 增加分数
            score += 10;
            scoreElement.textContent = score;
            
            // 生成新的食物
            generateFood();
            
            // 每增加50分加快游戏速度
            if (score % 50 === 0 && gameSpeed > 60) {
                clearInterval(gameLoop);
                gameSpeed -= 10;
                gameLoop = setInterval(updateGame, gameSpeed);
            }
        } else {
            // 如果没有吃到食物，移除尾部
            snake.pop();
        }
        
        // 在头部添加新的部分
        snake.unshift(head);
        
        // 重新绘制游戏
        drawGame();
    }

    // 检查碰撞
    function checkCollision(position) {
        for (let i = 1; i < snake.length; i++) {
            if (snake[i].x === position.x && snake[i].y === position.y) {
                return true;
            }
        }
        return false;
    }

    // 绘制游戏
    function drawGame() {
        // 清空画布
        ctx.fillStyle = '#e8f5e9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制食物
        ctx.drawImage(
            foodImg, 
            food.x * tileSize, 
            food.y * tileSize, 
            tileSize, 
            tileSize
        );
        
        // 绘制蛇
        drawSnake();
    }

    // 绘制蛇
    function drawSnake() {
        for (let i = 0; i < snake.length; i++) {
            const segment = snake[i];
            const isHead = i === 0;
            const isTail = i === snake.length - 1;
            
            // 计算颜色渐变
            let segmentColor;
            if (isHead) {
                segmentColor = snakeGradient.head;
            } else if (isTail) {
                segmentColor = snakeGradient.tail;
            } else {
                // 为蛇身创建渐变
                const ratio = i / snake.length;
                segmentColor = blendColors(snakeGradient.body, snakeGradient.tail, ratio);
            }
            
            // 绘制蛇的各个部分
            ctx.fillStyle = segmentColor;

            // 获取前一个和后一个部分的位置（用于计算角度和连接）
            const prev = i > 0 ? snake[i-1] : null;
            const next = i < snake.length - 1 ? snake[i+1] : null;
            
            if (isHead) {
                // 绘制蛇头（圆形）
                drawSnakeHead(segment, prev);
            } else if (isTail) {
                // 绘制蛇尾（锥形）
                drawSnakeTail(segment, next);
            } else {
                // 绘制蛇身体（圆角矩形连接）
                drawSnakeBody(segment, prev, next);
            }
        }
    }

    // 绘制蛇头
    function drawSnakeHead(segment, next) {
        const x = segment.x * tileSize;
        const y = segment.y * tileSize;
        const radius = tileSize / 2;
        
        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制眼睛
        const eyeRadius = tileSize / 10;
        const eyeDistance = tileSize / 4;
        
        ctx.fillStyle = '#fff';
        
        // 根据方向确定眼睛位置
        let eyeX1, eyeY1, eyeX2, eyeY2;
        
        switch(direction) {
            case 'right':
                eyeX1 = x + tileSize - eyeDistance;
                eyeY1 = y + eyeDistance;
                eyeX2 = x + tileSize - eyeDistance;
                eyeY2 = y + tileSize - eyeDistance;
                break;
            case 'left':
                eyeX1 = x + eyeDistance;
                eyeY1 = y + eyeDistance;
                eyeX2 = x + eyeDistance;
                eyeY2 = y + tileSize - eyeDistance;
                break;
            case 'up':
                eyeX1 = x + eyeDistance;
                eyeY1 = y + eyeDistance;
                eyeX2 = x + tileSize - eyeDistance;
                eyeY2 = y + eyeDistance;
                break;
            case 'down':
                eyeX1 = x + eyeDistance;
                eyeY1 = y + tileSize - eyeDistance;
                eyeX2 = x + tileSize - eyeDistance;
                eyeY2 = y + tileSize - eyeDistance;
                break;
        }
        
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeRadius, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制瞳孔
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeRadius/2, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, eyeRadius/2, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制蛇身
    function drawSnakeBody(segment, prev, next) {
        const x = segment.x * tileSize;
        const y = segment.y * tileSize;
        const radius = tileSize / 2.5;
        
        // 绘制基本的圆形
        ctx.beginPath();
        ctx.arc(x + tileSize/2, y + tileSize/2, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 连接前后节点
        if (prev) {
            connectSegments(segment, prev);
        }
        if (next) {
            connectSegments(segment, next);
        }
    }
    
    // 绘制蛇尾
    function drawSnakeTail(segment, next) {
        const x = segment.x * tileSize;
        const y = segment.y * tileSize;
        const radius = tileSize / 3;
        
        // 绘制基本的小圆形
        ctx.beginPath();
        ctx.arc(x + tileSize/2, y + tileSize/2, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 连接到下一个节点
        if (next) {
            connectSegments(segment, next);
        }
    }

    // 连接蛇的两个节点
    function connectSegments(seg1, seg2) {
        // 计算两个节点的中心点
        const center1 = {
            x: seg1.x * tileSize + tileSize/2,
            y: seg1.y * tileSize + tileSize/2
        };
        
        const center2 = {
            x: seg2.x * tileSize + tileSize/2,
            y: seg2.y * tileSize + tileSize/2
        };
        
        // 确定连接方向
        const xDiff = center2.x - center1.x;
        const yDiff = center2.y - center1.y;
        
        // 确定连接宽度
        const connectionWidth = tileSize / 2.5;
        
        // 绘制连接
        ctx.beginPath();
        
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            // 水平连接
            const y = center1.y;
            const startX = xDiff > 0 ? center1.x : center2.x;
            const endX = xDiff > 0 ? center2.x : center1.x;
            
            ctx.rect(startX - connectionWidth/2, y - connectionWidth/2, endX - startX, connectionWidth);
        } else {
            // 垂直连接
            const x = center1.x;
            const startY = yDiff > 0 ? center1.y : center2.y;
            const endY = yDiff > 0 ? center2.y : center1.y;
            
            ctx.rect(x - connectionWidth/2, startY - connectionWidth/2, connectionWidth, endY - startY);
        }
        
        ctx.fill();
    }
    
    // 混合两种颜色
    function blendColors(color1, color2, ratio) {
        // 将十六进制颜色转换为RGB
        const hex2rgb = (hex) => {
            const r = parseInt(hex.substring(1, 3), 16);
            const g = parseInt(hex.substring(3, 5), 16);
            const b = parseInt(hex.substring(5, 7), 16);
            return [r, g, b];
        };
        
        // 将RGB转换为十六进制
        const rgb2hex = (r, g, b) => {
            return '#' + [r, g, b].map(x => {
                const hex = Math.round(x).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        };
        
        // 计算混合颜色
        const c1 = hex2rgb(color1);
        const c2 = hex2rgb(color2);
        
        const r = c1[0] + (c2[0] - c1[0]) * ratio;
        const g = c1[1] + (c2[1] - c1[1]) * ratio;
        const b = c1[2] + (c2[2] - c1[2]) * ratio;
        
        return rgb2hex(r, g, b);
    }

    // 处理键盘控制
    function handleKeyPress(e) {
        if (!gameRunning) return;
        
        // 防止滚动
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    }

    // 处理触摸控制
    function handleTouch() {
        let startX, startY, endX, endY;
        
        // 触摸开始
        canvas.addEventListener('touchstart', function(e) {
            e.preventDefault();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        // 触摸结束
        canvas.addEventListener('touchend', function(e) {
            if (!gameRunning) return;
            
            e.preventDefault();
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            // 计算滑动方向
            const diffX = endX - startX;
            const diffY = endY - startY;
            
            // 确定主要滑动方向
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // 水平滑动
                if (diffX > 0 && direction !== 'left') {
                    nextDirection = 'right';
                } else if (diffX < 0 && direction !== 'right') {
                    nextDirection = 'left';
                }
            } else {
                // 垂直滑动
                if (diffY > 0 && direction !== 'up') {
                    nextDirection = 'down';
                } else if (diffY < 0 && direction !== 'down') {
                    nextDirection = 'up';
                }
            }
        });
    }

    // 处理按钮控制
    function setupControlButtons() {
        controlBtns.up.addEventListener('click', () => {
            if (gameRunning && direction !== 'down') nextDirection = 'up';
        });
        
        controlBtns.down.addEventListener('click', () => {
            if (gameRunning && direction !== 'up') nextDirection = 'down';
        });
        
        controlBtns.left.addEventListener('click', () => {
            if (gameRunning && direction !== 'right') nextDirection = 'left';
        });
        
        controlBtns.right.addEventListener('click', () => {
            if (gameRunning && direction !== 'left') nextDirection = 'right';
        });
    }

    // 设置事件监听器
    window.addEventListener('keydown', handleKeyPress);
    handleTouch();
    setupControlButtons();
    
    // 设置游戏按钮
    startGameBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', () => {
        restartGame();
        startGame();
    });

    // 初始化游戏
    initGame();
});
