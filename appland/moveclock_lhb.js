
/**
由2004年左右和"风筝"一起做西陆网站时的, 后面自己改了一版, 又交给 DeepSeek 修改了一版. 
@date 2026-04-16 周四
@addr 唐家湾供销楼

*/

window.moveClockLhb = {
    
    clkVar: {
        isRunning: true,
        divClock: {},
        oneStep: 0.06,
        currStep: 0,
        mouseX: 0,
        mouseY: 0,
        DTxt: "安琪宝贝天天开开心心快快乐乐幸福如意周五".split(''),
        HTxt: '···'.split(''),
        MTxt: '····'.split(''),
        STxt: '·····'.split(''),
        maxLen: 30,
        scrX: new Array(30).fill(0),
        scrY: new Array(30).fill(0),
        movX: new Array(30).fill(0),
        movY: new Array(30).fill(0)
    },

    initClockHTML: function () {
        let self = this;
        let clkVar = this.clkVar;
        
        // 初始化颜色值(添加 # 号)
        let ddCol = '#0000FF';
        let ffCol = '#0000FF';
        let ssCol = '#FF0000';
        let mmCol = '#0000FF';
        let hhCol = '#0000FF';
        
        // 时钟数字
        let Face = '1 2 3 4 5 6 7 8 9 10 11 12';
        Face = Face.split(' ');
        
        // 起点位置及样式 // text-shadow: 0 2px 2px #999999;
        let style00S = ' style="position:absolute; top:0px; left:0px; text-align:center;"><div style="position:relative"> ';
        let styleHMS = ' style="position:absolute; width:14px; height:14px; font-weight:700; font-size:14px; text-align:center; color: ';
        
        // 构建 HTML
        let innerHTM = '<div id="Od" ' + style00S
        for (let i = 0; i < clkVar.DTxt.length; i++) {
            innerHTM += `<div class="divDates" ${styleHMS} ${ddCol}"> ${clkVar.DTxt[i]} </div>`;
        }
        
        innerHTM += '</div></div> <div id="Of" ' + style00S;
        for (let i = 0; i < 12; i++) {
            innerHTM += `<div class="divFaces" ${styleHMS} ${ffCol}"> ${Face[i]} </div>`;
        }
        
        innerHTM += '</div></div> <div id="Oh" ' + style00S;
        for (let i = 0; i < clkVar.HTxt.length; i++) {
            innerHTM += `<div class="divHours" ${styleHMS} ${hhCol}"> ${clkVar.HTxt[i]} </div>`;
        }
        
        innerHTM += '</div></div> <div id="Om" ' + style00S;
        for (let i = 0; i < clkVar.MTxt.length; i++) {
            innerHTM += `<div class="divMinutes" ${styleHMS} ${mmCol}"> ${clkVar.MTxt[i]} </div>`;
        }
        
        innerHTM += '</div></div> <div id="Os" ' + style00S;
        for (let i = 0; i < clkVar.STxt.length; i++) {
            innerHTM += `<div class="divSeconds" ${styleHMS} ${ssCol}"> ${clkVar.STxt[i]} </div>`;
        }
        innerHTM += "</div></div>";
        
        // 创建容器
        this.clkVar.divClock = document.createElement('div');
        this.clkVar.divClock.innerHTML = innerHTM;
        this.clkVar.divClock.style.cssText = `
            position: absolute;
            left: 100px;
            top: 100px;
            width: 200px;
            height: 200px;
            background: transparent;
            border: none;
            pointer-events: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(this.clkVar.divClock);
        
        // ✅ 初始化 scrX/scrY 为容器中心位置
        let rect = this.clkVar.divClock.getBoundingClientRect();
        let centerX = rect.left + 100;
        let centerY = rect.top + 100;
        for (let i = 0; i < clkVar.maxLen; i++) {
            clkVar.scrX[i] = centerX;
            clkVar.scrY[i] = centerY;
            clkVar.movX[i] = centerX;
            clkVar.movY[i] = centerY;
        }
        
        // 事件监听
        document.addEventListener('mousemove', self.onMouseMoveClock.bind(self));
        
        // 获取元素
        this.clkVar.divDates = Array.from(this.clkVar.divClock.querySelectorAll('.divDates'));
        this.clkVar.divFaces = Array.from(this.clkVar.divClock.querySelectorAll('.divFaces'));
        this.clkVar.divHours = Array.from(this.clkVar.divClock.querySelectorAll('.divHours'));
        this.clkVar.divMinutes = Array.from(this.clkVar.divClock.querySelectorAll('.divMinutes'));
        this.clkVar.divSeconds = Array.from(this.clkVar.divClock.querySelectorAll('.divSeconds'));
        
        console.log('初始化完成，divFaces数量:', this.clkVar.divFaces.length);
        
        this.clkVar.isRunning = true;
        this.DelayMove();
    },
  
    ClockAndAssign: function () {
        let clkVar = this.clkVar;
        
        // 检查元素是否存在
        if (!clkVar.divFaces || clkVar.divFaces.length === 0) {
            console.error('divFaces 不存在');
            return;
        }
        
        let HandY = -7;
        let HandX = 2.5;
        let ClockHeight = 60;
        let ClockWidth = 60;
        let HandHeight = ClockHeight / 6;  // 修改此处可以扩大或缩小表盘, 5-小, 6-中, 7-大
        let HandWidth = ClockWidth / 6;
        
        let time = new Date();
        let secA = -1.570 + Math.PI * time.getSeconds() / 30;
        let minA = -1.570 + Math.PI * time.getMinutes() / 30;
        let hrsA = -1.575 + Math.PI * time.getHours() / 6 + Math.PI * parseInt(time.getMinutes()) / 360;
        
        let vAngle = 30;
        // 表盘数字
        for (let i = 0; i < 12; i++) {
            if (!clkVar.divFaces[i]) continue;
            let F = clkVar.divFaces[i].style;
            F.top = (clkVar.movY[i] + ClockHeight * Math.sin(-1.0471 + i * vAngle * Math.PI / 180)) + 'px';
            F.left = (clkVar.movX[i] + ClockWidth * Math.cos(-1.0471 + i * vAngle * Math.PI / 180)) + 'px';
        }        
        // 外圈文本, 修改ClockHeight*1.4系数, 可以调整外圈大小, 1.4~1.6
        let vDTxtAng = 360 / clkVar.DTxt.length;
        for (let i = 0; i < clkVar.DTxt.length; i++) {
            if (!clkVar.divDates[i]) continue;
            let DL = clkVar.divDates[i].style;
            DL.top = (clkVar.movY[i] + ClockHeight * 1.4 * Math.sin(clkVar.currStep + i * vDTxtAng * Math.PI / 180)) + 'px';
            DL.left = (clkVar.movX[i] + ClockWidth * 1.4 * Math.cos(clkVar.currStep + i * vDTxtAng * Math.PI / 180)) + 'px';
        }
        clkVar.currStep -= clkVar.oneStep;
        
        // 时针、分针、秒针
        [{ vTxt: clkVar.HTxt, vDiv: clkVar.divHours, vAng: hrsA },
         { vTxt: clkVar.MTxt, vDiv: clkVar.divMinutes, vAng: minA },
         { vTxt: clkVar.STxt, vDiv: clkVar.divSeconds, vAng: secA }
        ].forEach(({ vTxt, vDiv, vAng }) => {
            for (let i = 0; i < vTxt.length; i++) {
                if (!vDiv[i]) continue;
                let vStyle = vDiv[i].style;
                vStyle.top = (clkVar.movY[i] + HandY + (i * HandHeight) * Math.sin(vAng)) + 'px';
                vStyle.left = (clkVar.movX[i] + HandX + (i * HandWidth) * Math.cos(vAng)) + 'px';
            }
        });
    },

    DelayMove: function () {
        let self = this;
        let clkVar = self.clkVar;        
        let speed = 0.6;
        let interVal = 100;        
        // 更新移动位置
        clkVar.movX[0] = Math.round(clkVar.scrX[0] += ((clkVar.mouseX) - clkVar.scrX[0]) * speed);
        clkVar.movY[0] = Math.round(clkVar.scrY[0] += ((clkVar.mouseY) - clkVar.scrY[0]) * speed);        
        for (let i = 1; i < clkVar.maxLen; i++) {
            clkVar.movX[i] = Math.round(clkVar.scrX[i] += (clkVar.movX[i - 1] - clkVar.scrX[i]) * speed);
            clkVar.movY[i] = Math.round(clkVar.scrY[i] += (clkVar.movY[i - 1] - clkVar.scrY[i]) * speed);
        }        
        this.ClockAndAssign();        
        if (this.clkVar.isRunning) {
            // ✅ 修正：需要调用函数
            setTimeout(() => self.DelayMove(), interVal);
        }
    },

    onMouseMoveClock: function (event) {
        // 调整圆心位置, 数值越大, 越朝右下角偏移
        let oX = 10;
        let oY = 10;
        // ✅ 更新 mouseX/mouseY
        this.clkVar.mouseX = event.clientX + oX;
        this.clkVar.mouseY = event.clientY + oY;
        
        // ✅ 同时更新 scrX[0]/scrY[0] 作为跟随目标
        this.clkVar.scrX[0] = this.clkVar.mouseX;
        this.clkVar.scrY[0] = this.clkVar.mouseY;
        
        // 可选：移动容器位置
        // if (this.clkVar.divClock) {
        //     this.clkVar.divClock.style.left = this.clkVar.mouseX + 'px';
        //     this.clkVar.divClock.style.top = this.clkVar.mouseY + 'px';
        // }
    },

    destroyClock: function () {
        try {
            this.clkVar.isRunning = false;
            if (this.clkVar.divClock && this.clkVar.divClock.remove) {
                this.clkVar.divClock.remove();
            }
        } catch (ex) {
            console.log(ex);
        }
    }
};
