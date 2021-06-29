@echo off
set CONN="127.0.0.1:3306|vault-keeper|123456|db_vault|tb_user"
set TMPL=./templates/entity.java
set OUT=./output/User.java
set CONSTS="author=qinhuayi|email=qinhuayi@qq.com"
@echo on
python mygen.py %CONN% "%TMPL%" "%OUT%" %CONSTS%