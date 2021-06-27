set CONN="127.0.0.1:3306|qinhy|123456|db_entbase|tb_workflow"
set TMPL=templates/entity.kt
set OUT=output/entity.kt
set CONSTS="author=qinhuayi|email=qinhuayi@qq.com"
python mygen.py %CONN% "%TMPL%" "%OUT%" %CONSTS%