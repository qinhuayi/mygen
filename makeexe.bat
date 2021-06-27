set DIR=%~dp0
cd /d "%DIR%"
pyinstaller --version-file=version.txt -F mygen.py 
xcopy dist/mygen.ex* "D:/Projects/Dongxin/Kaibang/mygen/" /I /Y /D /U
rd /S /Q __pycache__
rd /S /Q build
rd /S /Q dist\build
rd /S /Q dist\dist
rd /S /Q dist\mygen
pause