/**
 * Created by Administrator on 2016/11/16.
 */

var paoku ={
    w: $(window).width(),
    h: $(window).height(),
    bgDistance: 0,
    /* bgAdditionHeight: 0, //bgAddition是跑道附加素材
     bgAdditionDistance: 0,*/
    runner: {},
    frameCount: 0,
    /*swipeLock: true,*/
    /*totalDistance: 0,
    runwayLength: 0,*/
    bgSpeed: 6,  //和baseSpeed，给了一个初始值，可以在初始化时根据其他因素设置
    //要求速度变化，设置 bgFastSpeed:8,bgSlowSpeed:4
    //可以通过speedFlag来判断是何速度，背景图片切换的时候作为判断边界
    blockList: [],//
    blockGap:50,//障碍物跨栏之间的距离
    /* runActTimer: '',
     startLineHeight: 0,
     scaleHeight: 0,
     scaleList: [],*/
    isInit: false,
    /*speedNormal: 0,
    speedFast: 0,
    speedSlow: 0,*/
    /* collisionTimer: '',
     endLine: {},*/
    rafId: '',
    lastTime: 0,
    flag:false,//标志是否跳起 true为跳起
    isUp:false,//是否向上跳
    endToBlockDistance:200,//开始位置到有障碍物的距离
    blockDistance:200,
    blockToBlockDistance: 300,
    
    init: function() {
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
        for(var i = 0;i<num;i++){
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
       /* _this.totalDistance = _this.runwayLength = _this.w * 15; //跑道长度是宽度15倍
        _this.baseSpeed = _this.speedNormal = _this.bgSpeed = Math.round(_this.runwayLength / 1500); //25秒完成游戏，一秒60帧*/
        //requestAnimationFrame兼容
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        //兼容，但是 这里计算速度？？
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = Date.now();
                var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
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
        _this.renderBg(ctx);
        _this.renderRunner(ctx);
        _this.renderBlock(ctx);

        if (!this.isInit) {
            this.renderListener(ctx);//3s开始倒计时
            this.isInit = true;
        }
    },
    renderBg:function (ctx) {
        //开始的背景 含起始线
        var _this = this;
        _this.bg = new Image();
        _this.bg.src = './img/new_bg.jpg';
        ctx.drawImage(_this.bg, 0, 0, _this.w, _this.h);
        //背景，一直跑的跑道
        _this.bgAddition = new Image();
        _this.bgAddition.src = './img/H5页面.jpg';
        _this.bgAdditionHeight = _this.w * 1450 / 640;//按给的图的大小计算height，宽度整屏宽度

    },
    renderBlock:function (ctx) {
        var _this = this;
        var w = _this.w;
        var h = _this.h;
        _this.blockSize = [w * 0.8,w * 0.8 * 95/520];
        var blockDistance = _this.endToBlockDistance;

        for(var i=0;i<10;i++){
            _this.blockList[i] = new Image();
            _this.blockList[i].src = './img/roadBlock.png';
            ctx.drawImage(_this.blockList[i],(w -_this.blockSize[0])/2, _this.bgAdditionHeight -_this.h/2 - blockDistance,_this.blockSize[0],_this.blockSize[1]);
            blockDistance += _this.blockToBlockDistance;
        }
        _this.runner.ceiling = [_this.runner.centerPositon,h - _this.runner.size[1]-200];
    },
    renderRunner:function(ctx){
        var _this = this;
        var w = this.w;
        var h = this.h;
        //按照图片尺寸设定人物宽高
        _this.runner.size = [w * 0.2, w * 0.2 * 190 / 130];
        _this.runner.centerPositon = (w - _this.runner.size[0]) / 2;
        _this.runner.positon = [_this.runner.centerPositon, h - _this.runner.size[1]];
        _this.runner.floor = [_this.runner.centerPositon, h - _this.runner.size[1]];
        _this.runner.animateState = 1;

        var runnerImg =  './img/person_nm_';

        for (var i = 1; i < 3; i++) {
            _this.runner[i] = new Image();
            _this.runner[i].src = runnerImg + i + '.png';
        }
        _this.runner[1].onload = function () {
            ctx.drawImage(_this.runner[1], _this.runner.positon[0], _this.runner.positon[1],_this.runner.size[0], _this.runner.size[1]);
        }
    },
    renderListener:function (ctx) {
        var _this = this;
        var readyCountNum = 3;
        var readyCountTimer = setInterval(function () {
            readyCountNum--;
            if (readyCountNum == 0) {
                clearInterval(readyCountTimer);
                $('#count_down').hide();
                _this.run(ctx); //跑
                _this.bind(ctx);
            } else {
                $('#count_down').attr('class', 'bg-' + readyCountNum);
            }
        }, 1000);
    },
    run:function (ctx) {
        var _this = this;
        window.cancelAnimationFrame(_this.rafId);//不清理会动画积累
        function animateRun () {
           /* var curTime = Date.now();
            if (_this.lastTime > 0) {
                _this.bgSpeed = _this.baseSpeed * (60 * (curTime - _this.lastTime) / 1000);
            }
            _this.lastTime = curTime;*/
            //注意顺序，先画背景,再画障碍物，最后画人物
            ctx.clearRect(0, 0, _this.w, _this.h);
            _this.runBg(ctx);
            _this.runBlock(ctx);
            _this.frameCount++;
            if(_this.flag){//跳起
                _this.jumpRunner(ctx);//画每一帧跳起的小人
            }else{
                _this.runRunner(ctx);//画每一帧奔跑的小人
                if (_this.frameCount % 5 == 0) {
                    _this.collisionTest();
                }
            }
            _this.rafId = window.requestAnimationFrame(animateRun);
        }
        animateRun();
        //背景

        //人

        //

    },
    runBg:function (ctx) {
        var _this = this;
        //含起始线的背景移动
        _this.bgDistance += _this.bgSpeed;
        _this.sy = _this.bgAdditionHeight - _this.h/2 - _this.bgDistance;
        if(_this.sy <= 0) {
            _this.bgDistance = _this.endToBlockDistance; //数值是跑道开始到有障碍物之间的距离
        }
        //drawImage(img,sx,sy,swidth,sheight,x,y,width,height)
        ctx.drawImage(_this.bgAddition, 0, _this.sy, _this.w,_this.h/2,0, 0,_this.w, _this.h);//_this.h/2是一屏？？？img画的高度
    },
    runRunner:function (ctx) {
        var _this = this;
        if (_this.frameCount % 10 == 0) {
            _this.runner.animateState == 1 ? _this.runner.animateState = 2 : _this.runner.animateState = 1;
        }
        ctx.drawImage(_this.runner[_this.runner.animateState], _this.runner.positon[0], _this.runner.positon[1], _this.runner.size[0], _this.runner.size[1]);
    },
    jumpRunner:function (ctx) {
        var _this =this;
        //判断up or down；
        if(!_this.isUp){
            if(_this.runner.positon[1] <= _this.runner.ceiling[1]){
                _this.runner.positon[1] = _this.runner.ceiling[1];
                _this.isUp = true
            }else{
                _this.runner.positon[1] -= 20;//背景速度为6
                ctx.drawImage(_this.runner[_this.runner.animateState], _this.runner.positon[0], _this.runner.positon[1], _this.runner.size[0],_this.runner.size[1]);
            }
        }else{
            if(_this.runner.positon[1] >= _this.runner.floor[1]){
                _this.runner.positon[1] = _this.runner.floor[1];
                _this.isUp = false;
                _this.flag = false;
            }else{
                _this.runner.positon[1] += 10;
                ctx.drawImage(_this.runner[_this.runner.animateState], _this.runner.positon[0], _this.runner.positon[1], _this.runner.size[0], _this.runner.size[1]);
            }
        }
    },
    runBlock:function (ctx) {
        var _this = this;
        var w = _this.w;
        _this.blockSize = [w * 0.8,w * 0.8 * 95/520];
        _this.blockDistance -=_this.bgSpeed;
        _this.blockItemTop = _this.blockDistance;//每个障碍物的位置，障碍物之间为参照物
        _this.blockSy = _this.bgAdditionHeight - _this.h/2 - _this.blockDistance;
        if(_this.blockSy >= _this.bgAdditionHeight) {
            _this.blockDistance = 0; //数值是跑道开始到有障碍物之间的距离
        }                               //在背景上的位置。背景为参照物
        for(var i=0;i<5;i++){
            _this.blockList[i] = new Image();
            _this.blockList[i].src = './img/roadBlock.png';
            ctx.drawImage(_this.blockList[i],(w -_this.blockSize[0])/2, _this.bgAdditionHeight - _this.h/2 - _this.blockItemTop,_this.blockSize[0],_this.blockSize[1]);
            _this.blockItemTop += _this.blockToBlockDistance;
        }

    },
    bind:function (ctx) {
        var _this = this;
        //swiperUp
        var initY,initX,moveY,moveX,distanceY,temp;

        canvas.addEventListener('touchstart',function (e) {
            e.preventDefault();
            moveY = initY = e.targetTouches[0].pageY;
            moveX = initX = e.targetTouches[0].pageX;
            temp = _this.runner.positon[1];
        });
        canvas.addEventListener('touchmove',function (e) {
            e.preventDefault();
            if(!_this.flag){// 未跳起状态
                if(checkMoveUp(e)){
                    _this.flag = true;
                    _this.run(ctx);
                }
            }
            function checkMoveUp(e){
                moveX = e.targetTouches[0].pageX;
                moveY = e.targetTouches[0].pageY;
                distanceX = moveX - initX;
                distanceY = moveY - initY;
                if(Math.abs(distanceX) < Math.abs(distanceY) && distanceY < -30){//判断向上滑
                    return true
                }
                return false;
            }
        });
        canvas.addEventListener('touchend',function (e) {
        })
    },
//碰撞检测
    collisionTest:function () {
        var _this = this;
        for (var i = 0; i < _this.blockList.length; i++) {
            if (_this.blockList[i] && _this.blockList[i].isShow) {
                var blockItem = _this.blockList[i],
                //小人中心点坐标
                    runnerHoriCenterCord = [_this.runner.positon[0] + _this.runner.size[0] / 2, _this.runner.positon[1] + _this.runner.size[1] / 2],
                //障碍物中心点坐标
                    blockHoriCenterCord = [blockItem.left + blockItem.width / 2, blockItem.top + blockItem.height / 2];

                if (Math.abs(runnerHoriCenterCord[0] - blockHoriCenterCord[0]) < (_this.runner.size[0] + blockItem.width) / 2 && Math.abs(runnerHoriCenterCord[1] - blockHoriCenterCord[1]) < (_this.runner.size[1] + blockItem.height) / 2) {
                    this.handleCollision();
                }
            }
        }
    },
    handleCollision:function () {
        var _this = this;
        window.cancelAnimationFrame(_this.rafId)
    }
};

paoku.init();