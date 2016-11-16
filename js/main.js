/**
 * Created by Administrator on 2016/11/16.
 */
var paoku ={
    intCons : {
        w: $(window).width(),
        h: $(window).height(),
        bgDistance: 0,
        /* bgAdditionHeight: 0, //bgAddition是跑道附加素材
         bgAdditionDistance: 0,*/
        runner: {},
        frameCount: 0,
         /*swipeLock: true,*/
        totalDistance: 0,
        runwayLength: 0,
        bgSpeed: 0,
        baseSpeed: 0, //基础速度，bgSpeed在此基础上根据帧率发生变化
        /*blockList: [],
         runActTimer: '',
         startLineHeight: 0,
         scaleHeight: 0,
         scaleList: [],*/
        isInit: false,
        speedNormal: 0,
        speedFast: 0,
        speedSlow: 0,
        /* collisionTimer: '',
         endLine: {},
         rafId: '',*/
        lastTime: 0,
    },
    init: function() {
        var _this = this;
        //加载完图片后render
        var imgs = [
            './img/countdown_bg_1.png',
            './img/countdown_bg_2.png',
            './img/countdown_bg_3.png',
            './img/star_small.png',
            './img/new_bg.jpg',
            './img/person_nm_1.png',
            './img/person_nm_2.png'
        ];
        for(var i = 0;i<imgs.length;i++){
            var num = imgs.length;
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
         _this.intCons.totalDistance = _this.intCons.runwayLength = _this.intCons.w * 15; //跑道长度是宽度15倍
         _this.intCons.baseSpeed = _this.intCons.speedNormal = _this.intCons.bgSpeed = Math.round(_this.intCons.runwayLength / 1500); //25秒完成游戏，一秒60帧
         _this.intCons.speedFast = Math.round(_this.intCons.speedNormal * 7 / 4);
         _this.intCons.speedSlow = Math.round(_this.intCons.speedNormal / 4);
    },
    render: function () {
        var _this = this;
        var w = this.intCons.w;
        var h = this.intCons.h;
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        //画场景
        _this.renderBg(ctx);
        _this.renderBlock(ctx);
        _this.renderRunner(ctx);

        if (!this.isInit) {
            this.renderListener(ctx);//3s开始倒计时
            this.isInit = true;
        }
    },
    renderBg:function (ctx) {
        var _this = this;
        _this.intCons.bg = new Image();
        _this.intCons.bg.src = './img/new_bg.jpg';
        _this.intCons.bg.onload= function () {
            ctx.drawImage(_this.intCons.bg, 0, 0, _this.intCons.w, _this.intCons.h);
        };
    },
    renderBlock:function (ctx) {

    },
    renderRunner:function(ctx){
        var _this = this;
        var w = this.intCons.w;
        var h = this.intCons.h;
        //按照图片尺寸设定人物宽高
        _this.intCons.runner.size = [w * 0.2, w * 0.2 * 190 / 130];
        _this.intCons.runner.centerPositon = (w - _this.intCons.runner.size[0]) / 2;
        _this.intCons.runner.positon = [_this.intCons.runner.centerPositon, h - _this.intCons.runner.size[1]];
        _this.intCons.runner.animateState = 1;

        var runnerImg = {
            normal: './img/person_nm_'
        };

        for (var key in runnerImg) {
            _this.intCons.runner[key] = new Object();
            for (var i = 1; i < 3; i++) {
                _this.intCons.runner[key][i] = new Image();
                _this.intCons.runner[key][i].src = runnerImg[key] + i + '.png';
            }
        }
        _this.intCons.runner.normal[1].onload = function () {
            ctx.drawImage(_this.intCons.runner.normal[1], _this.intCons.runner.positon[0], _this.intCons.runner.positon[1],_this.intCons.runner.size[0], _this.intCons.runner.size[1]);
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
                _this.bind();
            } else {
                $('#count_down').attr('class', 'bg-' + readyCountNum);
            }
        }, 1000);
    },
    run:function (ctx) {
        var _this = this;
        function animateRun () {
            var curTime = Date.now();
           /* if (_this.lastTime > 0) {
                _this.bgSpeed = _this.baseSpeed * (60 * (curTime - _this.lastTime) / 1000);
            }
            _this.lastTime = curTime;*/

            //注意顺序，先画背景，再画终点线，再画刻度，再画障碍物，最后画人物
            ctx.clearRect(0, 0, _this.w, _this.h);

            _this.rollBg(ctx);
            _this.frameCount++;
            _this.drawRunner(ctx);
            //障碍物


           /* if (_this.frameCount % 5 == 0) {
                _this.collisionTest();
            }
            _this.runwayLength -= _this.bgSpeed;
            if (_this.runwayLength + _this.runner.size[1] <= 0) {
                _this.endRun();
                return false;
            }

            _this.rafId = window.requestAnimationFrame(animateRun);*/
        }
        animateRun();
        //背景

        //人

        //

    },
    rollBg:function (ctx) {
        var _this = this;
        _this.intCons.bgDistance += _this.intCons.bgSpeed;
        if (_this.intCons.bgDistance < _this.intCons.h) {
            ctx.drawImage(_this.intCons.bg, 0, _this.intCons.bgDistance, _this.intCons.w, _this.intCons.h);
        }
    },
    drawRunner:function (ctx) {
        var _this = this;
        if (this.frameCount % 10 == 0) {
            _this.intCons.runner.animateState == 1 ? _this.intCons.runner.animateState = 2 : _this.intCons.runner.animateState = 1;
        }
        ctx.drawImage(_this.intCons.runner.normal[_this.intCons.runner.animateState], _this.intCons.runner.positon[0], _this.intCons.runner.positon[1], _this.intCons.runner.size[0], _this.intCons.runner.size[1]);
    },
    countTime:function () {

    },
    bind:function () {
        //count_time

        //swiperUp
    }
};
paoku.init();