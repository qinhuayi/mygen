#!/bin/bash
CONN="127.0.0.1:3306|vault-keeper|123456|db_vault|tb_user"
TMPL="templates/entity.java"
OUT="output/User.java"
CONSTS="author=qinhuayi|email=qinhuayi@qq.com"
python mygen.py $CONN $TMPL $OUT $CONSTS
