set CONN="127.0.0.1:3306|vault-keeper|123456|db_vault|tb_user"
set TMPL=templates/entity.kt
set OUT=output/User.kt
set CONSTS="author=qinhuayi|email=qinhuayi@qq.com"
python mygen.py %CONN% "%TMPL%" "%OUT%" %CONSTS%