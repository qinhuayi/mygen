#!/bin/bash
CONN="127.0.0.1:3306|vault-keeper|123456|db_vault|tb_user"
TMPL="templates/entity.kt"
OUT="output/User.kt"
CONSTS="author=qinhuayi|email=qinhuayi@qq.com"
python mygen.py $CONN $TMPL $OUT $CONSTS