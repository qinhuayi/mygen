# ��Ŀ˵�� Project Description
	**Mygen**��һ��Python��д��֧��mysql���Ӻ�art-templateģ��������з�ʽ�Ĵ�����������
	**Mygen** is a code generator under command line written by Python which support Mysql connection and Art-Template.

## ������� Program Design
	1. ���ȶ�ȡ�����в�������ȡMysql�����ַ�����ģ���ļ�·��������ļ�·����ģ���õ��ĳ�����At first read command line arguments and get Mysql connection string and template file path and output path and consts within template;
	2. Ȼ������Mysql��ȡ�����ݣ�Second, connect to Mysql and fetch data;
	3. ֮���ȡart-template-stanalone.js�ļ�������js2py������exports������Ψһ��compile������And then read the js file 'art-template-stanalone.js' and extract one unique method 'compile' inside object 'exports' with the module 'js2py';
	4. �������compile(tmpl, data)�õ����մ��벢������뵽���·����At last run the method 'compile(tmpl, data)' and get the final codes and save to output path.

	��Ҫ�õ�2��ģ�飺һ����Mysql�ٷ���Mysql.connector����һ����js2py, �������·�ʽ��װ�� Require 2 extra modules: one is 'mysql.connector' from Mysql official website, the other is 'js2py', the installations like this:
	```
	pip install mysql-connector
	pip install js2py
	```
## ����ģ�� About Template 
	ģ��Ŀǰ��֧��es5��js2py������babel��ʽ����es6�Ĺ��ܵ��������в������⣬���ȶ��� Template only support es5 by now. The 'js2py' embedded with es6 feature with babel but it is unstable and several problems have been found.
## ģ�����ݸ�ʽ Template Data Structure
	ģ��õ���JSON���ݸ�ʽ����: The JSON data gotten by template like this:
	```
	{ 
		table: {
			TABLE_NAME: '', 
			name: '', 
			TABLE_TYPE: '', 
			type: '',
			TABLE_COMMENT: '', 
			comment: ''
		},
		columns: [{
			ID: '',
			ORDINAL_POSITION: '',
			COLUMN_NAME: '',
			COLUMN_KEY: '',
			DATA_TYPE: '',
			COLUMN_TYPE: '',
			COLUMN_COMMENT: '',
			IS_NULLABLE: '',
			CHARACTER_MAXIMUM_LENGTH: '',
			NUMERIC_PRECISION: '',
			NUMERIC_SCALE: '',
			EXTRA: '',
			javatype: ''
		}]
		rows: []
		consts: {}
	}
	```
	����tableΪ������; columns��һ�����飬���������ֶεĶ���; rowsΪ����*��ѯģʽ*�£���ѯ�õ������ݼ�; consts�������������һ�����������ó��ĳ�����The 'table' includes the table properties; The 'columns' is an array includes definitions of each column; The 'rows' (under *Query Mode*) is a dataset from data query; The 'consts' includes several consts came from the last command line argument.
	������ĺ����ԡ�More details are omitted.

## �÷� Usage
	Ĭ���÷���*��ģʽ*����Ҫָ������������һ����ѯ����������ʱ��Ϊ*��ѯģʽ*����ʱrows��ֵ��table��columns��ֵ��The default usage is *Table Mode* which require a table name; With a sql query sentence instead of the table name is *Query Mode*, 
	���������룺Command line inputs:
	`python mygen.py "<host:port>|<dbuser>|<dbuser_password>|<db_name>|<table_name>" "<template_file_path>" "<output_file_path>" "<const0=value0|const1=value1>"`
	һ�����ӣ�One Example:
	`python mygen.py "127.0.0.1:3306|qinhy|123456|db_entbase|tb_workflow" "templates/entity.kt" "output/workflow.kt" "author=qinhuayi|email=qinhuayi@qq.com"`
	��һ�����ӣ���ѯģʽ����Another Example(Query Mode):
	`python mygen.py "127.0.0.1:3306|qinhy|123456|db_entbase|select * from tb_workflow" "templates/entity.kt" "output/workflow.kt" "author=qinhuayi|email=qinhuayi@qq.com"`
	�Ƽ���дshell�ű������С�Recommend run by shell scripts. 