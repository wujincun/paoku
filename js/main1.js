/**
 * Created by Administrator on 2016/11/16.
 */

var paoku = {
    $score : $('#score'),
    $time : $('#time'),
    w: $(window).width(),
    h: $(window).height(),
    blockItemTop:0,
    bgDistance: 0,//背景到start的位置
    blockDistance: 500, //障碍物到start的位置,初始值和endToBlockDistance一样
    endToBlockDistance: 500,//开始位置到有障碍物的距离
    blockToBlockDistance: 500,//障碍物跨栏之间的距离
    runner: {},//人的集合
    blockList: [],//障碍物的数组集合
    bgSpeed: 4,  //和baseSpeed，给了一个初始值，可以在初始化时根据其他因素设置
    //要求速度变化，设置
    bgMidSpeed:6,
    bgFastSpeed:10,
    //可以通过speedFlag来判断是何速度，背景图片切换的时候作为判断边界
    frameCount: 0,//每一帧的计算
    circle:0,//背景循环次数
    isInit: false,
    rafId: '',//动画的id
    lastTime: 0,//requestAnimationFrame兼容
    flag: false,//标志是否跳起 true为跳起
    isUp: false,//是否向上跳
    score:0,//分数
    scoreFlag : false,
    blockflag:true,
    init: function () {
        var _this = this;
        //加载完图片后render
        var imgs = [
            './img/countdown_bg_1.png',
            './img/countdown_bg_2.png',
            './img/countdown_bg_3.png',
            './img/star_small.png',
            './img/new_bg.jpg',
            './img/runway_bg.jpg',
            './img/person_nm_1.png',
            './img/person_nm_2.png',
            './img/H5页面.jpg',
            './img/roadBlock.png'
        ];
        var num = imgs.length;
        for (var i = 0; i < num; i++) {
            var img = new Image();
            img.src = imgs[i];
            img.onload = function () {
                num--;
                if (num > 0) {
                    return;
                }
                _this.render()
            }
        }
        //设置初始值
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        //兼容，但是 这里计算速度？？
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback, element) {
                var currTime = Date.now();
                var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    },
    render: function () {
        var _this = this;
        var w = this.w;
        var h = this.h;
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        //画场景
        _this.renderRunner(ctx);
        _this.renderBlock(ctx);

        if (!this.isInit) {
            this.renderListener(ctx);//3s开始倒计时
            this.isInit = true;
        }
    },
    renderHouse: function () {

    },//画背景的两侧建筑
    renderBlock: function (ctx) {
        var _this = this;
        var w = _this.w;
        var h = _this.h;
        _this.blockSize = [w * 0.8, w * 0.8 * 95 / 520];
        var blockDistance = _this.endToBlockDistance;
        //初始化的障碍物
        for (var i = 0; i < 5; i++) {
            _this.blockList[i] = new Image();
            _this.blockList[i].src = './img/roadBlock.png';
            ctx.drawImage(_this.blockList[i], (w - _this.blockSize[0]) / 2,  blockDistance, _this.blockSize[0], _this.blockSize[1]);
            blockDistance += _this.blockToBlockDistance;
        }
        _this.runner.ceiling = [_this.runner.centerPositon,  _this.runner.size[1] - 200];
    },
    renderRunner: function (ctx) {
        var _this = this;
        var w = this.w;
        //按照图片尺寸设定人物宽高
        _this.runner.img = new Image();
        _this.runner.img.src = './img/person_nm_1.png';
        _this.runner.size = [w * 0.2, w * 0.2 * 190 / 130];
        _this.runner.centerPositon = (w - _this.runner.size[0]) / 2;
        _this.runner.positon = [_this.runner.centerPositon,  _this.runner.size[1]];
        _this.runner.floor = [_this.runner.centerPositon,  _this.runner.size[1]];

        ctx.drawImage(_this.runner.img, _this.runner.positon[0], _this.runner.positon[1], _this.runner.size[0], _this.runner.size[1]);
    },
    renderListener: function (ctx) {
        var _this = this;
        var readyCountNum = 3;
        var readyCountTimer = setInterval(function () {
            readyCountNum--;
            if (readyCountNum == 0) {
                clearInterval(readyCountTimer);
                $('#count_down').hide();
                _this.initTime = Date.now();
                _this.run(ctx); //跑
                _this.bind(ctx);
            } else {
                $('#count_down').attr('class', 'bg-' + readyCountNum);
            }
        }, 1000);
    },
    run: function (ctx) {
        var _this = this;
        var timeGap,seconds,ms;
        function animateRun() {
            window.cancelAnimationFrame(_this.rafId);//不清理会动画积累
            //计时
            timeGap = Date.now() - _this.initTime;
            seconds = Math.round(timeGap/10);
            _this.$time.text(seconds/100 + 's');

            ctx.clearRect(0, 0, _this.w, _this.h);
            _this.changeSpeed();
            _this.frameCount++;

            if (_this.flag) {//跳起
                _this.jumpRunner(ctx);//画每一帧跳起的小人
                _this.rafId = window.requestAnimationFrame(animateRun);
            } else {
                _this.runRunner(ctx);//画每一帧奔跑的小人
                _this.rafId = window.requestAnimationFrame(animateRun);
                if (_this.frameCount % 5 == 0 ) {
                    if(_this.collisionTest()){
                        _this.handleCollision();
                    }
                }
            }
            //_this.rafId = window.requestAnimationFrame(animateRun);//不可写在此处，否则碰撞检测_this.collisionTest()清除不了动画，因为还没有
        }
        animateRun();
    },
    runHouse: function () {

    },//两侧房子
    runRunner: function (ctx) {
        var _this = this;
        var blockItem = _this.blockList[0];
        //小人中心点坐标
        _this.runnerHoriCenterCord = [_this.runner.positon[0] + _this.runner.size[0] / 2, _this.runner.positon[1] + _this.runner.size[1] / 2];
        //障碍物中心点坐标
        _this.blockHoriCenterCord = [blockItem.left + _this.blockSize[0] / 2, blockItem.top + _this.blockSize[1] / 2];
        if( _this.runnerHoriCenterCord[1] - _this.blockHoriCenterCord[1] > 0 && _this.runnerHoriCenterCord[1] - _this.blockHoriCenterCord[1] < (_this.runner.size[1] + _this.blockSize[1])/2 ){
            _this.runBlock(ctx);
            ctx.drawImage(_this.runner.img, _this.runner.positon[0], _this.runner.positon[1], _this.runner.size[0], _this.runner.size[1]);
        }else{
            ctx.drawImage(_this.runner.img, _this.runner.positon[0], _this.runner.positon[1], _this.runner.size[0], _this.runner.size[1]);
            _this.runBlock(ctx);
        }
    },
    jumpRunner: function (ctx) {
        var _this = this;
        //判断up or down；
        if (!_this.isUp) {
             _this.runner.size[0] += 4;
             _this.runner.size[1] += 4;
            if (_this.runner.positon[1] <= _this.runner.ceiling[1]) {
                _this.runner.positon[1] = _this.runner.ceiling[1];
                _this.isUp = true
            } else {
                _this.runner.positon[1] -= 20;//背景速度为6
            }
            ctx.drawImage(_this.runner.img, _this.runner.positon[0], _this.runner.positon[1], _this.runner.size[0], _this.runner.size[1]);
            _this.runBlock(ctx);
        } else {
            _this.runner.size[0] -= 2;
            _this.runner.size[1] -= 2;
            if (_this.runner.positon[1] >= _this.runner.floor[1]) {
                _this.runner.positon[1] = _this.runner.floor[1];
                _this.isUp = false;
                _this.flag = false;
                if(_this.scoreFlag){
                    _this.score += 10;
                    _this.$score.text(_this.score);
                    _this.scoreFlag = false;
                }
            } else {
                _this.runner.positon[1] += 10;
            }
            _this.runBlock(ctx);
            ctx.drawImage(_this.runner.img, _this.runner.positon[0], _this.runner.positon[1], _this.runner.size[0], _this.runner.size[1]);
        }
        //加分
        if(_this.collisionTest()){
            _this.scoreFlag = true;
        }
    },
    runBlock: function (ctx) {
        var _this = this;
        var w = _this.w;
        _this.blockSize = [w * 0.8, w * 0.8 * 95 / 520];
        _this.blockItemTop -= _this.bgSpeed;
        for (var i = 0; i < 5; i++) {
            _this.blockList[i] = {};
            _this.blockList[i].img = new Image();
            _this.blockList[i].img.src = './img/roadBlock.png';
            _this.blockList[i].left = (w - _this.blockSize[0]) / 2;
            _this.blockList[i].top = _this.blockItemTop + _this.endToBlockDistance + _this.blockToBlockDistance * i;
            ctx.drawImage(_this.blockList[i].img, _this.blockList[i].left, _this.blockList[i].top, _this.blockSize[0], _this.blockSize[1]);
        }
        if(_this.blockList[0].top <= -_this.blockSize[1]){
            _this.blockItemTop = -_this.blockSize[1];
        }
    },
    bind: function (ctx) {
        var _this = this;
        //swiperUp
        var initY, initX, moveY, moveX, distanceY, temp;

        canvas.addEventListener('touchstart', function (e) {
            e.preventDefault();
            moveY = initY = e.targetTouches[0].pageY;
            moveX = initX = e.targetTouches[0].pageX;
            temp = _this.runner.positon[1];
        });
        canvas.addEventListener('touchmove', function (e) {
            e.preventDefault();
            if (!_this.flag && checkMoveUp(e)) {// 未跳起状态并且移动一定距离
                _this.flag = true;
                _this.run(ctx);
            }
            function checkMoveUp(e) {
                moveX = e.targetTouches[0].pageX;
                moveY = e.targetTouches[0].pageY;
                distanceX = moveX - initX;
                distanceY = moveY - initY;
                if (Math.abs(distanceX) < Math.abs(distanceY) && distanceY < -30) {//判断向上滑
                    return true
                }
                return false;
            }
        });
    },
//碰撞检测
    collisionTest: function () {
        var _this = this;
        //Math.abs(runnerHoriCenterCord[0] - blockHoriCenterCord[0]) < (_this.runner.size[0] + blockItem.width) / 2 && Math.abs(runnerHoriCenterCord[1] - blockHoriCenterCord[1]) < (_this.runner.size[1] + blockItem.height) / 2
        if (Math.abs(_this.runnerHoriCenterCord[1] - _this.blockHoriCenterCord[1]) < (_this.runner.size[1] + _this.blockSize[1] ) / 10) {
            return true
        }
        return false;
    },
    handleCollision: function () {
        var _this = this;
        window.cancelAnimationFrame(_this.rafId);
        _this.gameOver();
    },
    gameOver:function () {
        alert('Game Over');
        /*canvas.removeEventListener('touchstart', this.handleTouchStart, true);//解绑
        canvas.removeEventListener('touchmove', this.handleTouchMove, true)*/
    },
    changeSpeed:function () {
        var _this = this;
        if(_this.circle >= 2){
            var circleNum = Math.floor(_this.circle / 4);
            (circleNum != 0 && circleNum % 2) ? _this.bgSpeed = _this.bgMidSpeed : _this.bgSpeed = _this.bgFastSpeed;
        }
    }
};
paoku.init();