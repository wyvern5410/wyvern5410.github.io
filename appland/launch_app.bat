
:: 主要说明: 
::   1. 用了 mylauncher:// 协议, 故参数中不能带空格和冒号, 分别用 英文井号# 和 英文分号; 代替。 
::   2. 由于 mylauncher:// 协议, 会在最后加上正斜杠 /, 所以先移除最后一个字符。 
::   3. 2026-04-09 全新升级, 使用 Base64 对协议进行编码, 到 BAT 端再进行解码, 这样就不用再处理特殊字符. 

:: chcp 65001 
setlocal enabledelayedexpansion

:: 1. 提取原始参数并输出调试信息
echo 原始参数：%1
set "param=%~1"
echo 截取后参数变量：!param!

:: 2. 移除协议头 + 清理所有斜杠/反斜杠/空格（核心修正）如果协议结尾带有斜杠, 协议自动加的, 要去掉 
    set "param=!param:mylauncher://=!" 
    if  "!param:~-1!" == "/"  set  "param=!param:~0,-1!" 

    :: set "param=!param:;=:!"              :: 将 分号; 换回 冒号: 
    :: set "param=!param:#= !"              :: 将 井号# 换回 空格 
    :: set "param=!param:/=!"               :: 移除所有正斜杠
    :: set "param=!param:\=!"               :: 移除所有反斜杠
    :: set "param=!param:=!"                :: 移除所有空格 (千万不能移除空格, 因为有长路径！) 
    echo 处理后参数：!param!
    
    :: 最小化本窗口 
    powershell -window minimized -command "" 
    
:: 3. 调用【容错版 Base64 解码】, 参数1：Base64 字符串, 参数2：输出变量名, 结果：!result! 
    call :DecodeBase64_Safe "!param!" result
    echo 解码结果: !result! 

:: 4. 先判断是否包含逗号, 再分割参数, 前部分为exe路径, 后部分: 0或空-普通, 1-以管理员身份执行, 2-未定 
    if  "!result!" == "!result:,=!"  goto NotAdmin
    for /f "tokens=1,2 delims=," %%a in ("!result!") do (
        set "exePath=%%a"
        set "admin1=%%b"
    )
    if "!admin1!" == "1"  goto  RunAsAdmin


:: 5. 不是以管理员身份执行 
:NotAdmin
    echo 直接执行命令, 引号表示窗口标题, /b 表示后面的全部执行, 就是路径中带有空格, 也会正常执行？ 
    start  ""  /b  !result!  &&  goto end 

:: 6. 以管理员身份执行 
:RunAsAdmin
    echo 以管理员身份执行命令
    powershell  -Command  " Start-Process '!exePath!'  -Verb  RunAs " 
    goto end

:: 7. 未匹配到参数时提示
echo 错误：未识别的参数「!result!」
pause

:end
:: pause 
exit /b


:: ==========================================================
:: 函数：DecodeBase64_Safe  【无误判·稳定版】
:: 功能：Base64 解码 + 空值判断 + 临时文件安全不覆盖
:: 参数：%1=Base64 字符串   %2=输出变量名
:: ==========================================================
:DecodeBase64_Safe
set "inputStr=%~1"
set "outputVar=%~2"

:: 清空输出变量
set "!outputVar!="

:: 容错1：输入为空直接返回
if not defined inputStr (
    goto :EOF
)

:: 安全临时文件名（随机数避免冲突）
set "rand=%random%%random%"
set "tmp_b64=%temp%\b64_tmp_!rand!.b64"
set "tmp_out=%temp%\b64_tmp_!rand!.txt"

:: 容错3：临时文件已存在则换一个（最多试10次）
set try=0
:retry_tmp
if exist "!tmp_b64!" (
    set /a rand+=1
    set "tmp_b64=%temp%\b64_tmp_!rand!.b64"
    set "tmp_out=%temp%\b64_tmp_!rand!.txt"
    set /a try+=1
    if !try! geq 10 goto :EOF
    goto retry_tmp
)

:: 写入 Base64（不换行，避免 certutil 报错）, 后面的 2>null 不能被删除！
echo|set /p "=!inputStr!"> "!tmp_b64!" 2>nul

:: 解码, 注意后面的 2>&1 表示把第2个输入重定向到到第1个设备。
certutil -f -decode "!tmp_b64!" "!tmp_out!" >nul 2>&1

:: 读取结果（兼容单行、无换行）
set "content="
for /f "usebackq delims=" %%a in ("!tmp_out!") do (
    if not defined content set "content=%%a"
)

:: 赋值给输出变量
if defined content (
    set "!outputVar!=!content!"
)

:: 清理临时文件
del "!tmp_b64!" "!tmp_out!" /f /q   :: >nul 2>&1

goto :EOF
