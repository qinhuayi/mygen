#!/bin/bash
CONN="127.0.0.1:3306|qinhy|123456|db_entbase|tb_workflow"
TMPL="templates/entity.kt"
OUT="output/entity.kt"
CONSTS="author=qinhuayi|email=qinhuayi@qq.com"
python mygen.py $CONN $TMPL $OUT $CONSTS