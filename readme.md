# 项目说明 Project Description
	**Mygen**是一个Python编写的支持mysql连接和art-template模板的命令行方式的代码生成器。
	**Mygen** is a code generator under command line written by Python which support Mysql connection and Art-Template.

## 程序设计 Program Design
	1. 首先读取命令行参数，获取Mysql连接字符串、模板文件路径、输出文件路径和模板用到的常量；At first read command line arguments and get Mysql connection string and template file path and output path and consts within template;
	2. 然后连接Mysql，取出数据；Second, connect to Mysql and fetch data;
	3. 之后读取art-template-stanalone.js文件并且用js2py解析出exports对象内唯一的compile方法；And then read the js file 'art-template-stanalone.js' and extract one unique method 'compile' inside object 'exports' with the module 'js2py';
	4. 最后运行compile(tmpl, data)得到最终代码并保存代码到输出路径。At last run the method 'compile(tmpl, data)' and get the final codes and save to output path.

	需要用到2个模块：一个是Mysql官方的Mysql.connector，另一个是js2py, 可以如下方式安装： Require 2 extra modules: one is 'mysql.connector' from Mysql official website, the other is 'js2py', the installations like this:
	```
	pip install mysql-connector
	pip install js2py
	```
## 关于模板 About Template 
	模板目前仅支持es5。js2py内置有babel方式解析es6的功能但是它仍有不少问题，不稳定。 Template only support es5 by now. The 'js2py' embedded with es6 feature with babel but it is unstable and several problems have been found.
## 模板数据格式 Template Data Structure
	模板得到的JSON数据格式如下: The JSON data gotten by template like this:
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
	其中table为表属性; columns是一个数组，包含各个字段的定义; rows为（在*查询模式*下）查询得到的数据集; consts来自命令行最后一个参数解析得出的常量。The 'table' includes the table properties; The 'columns' is an array includes definitions of each column; The 'rows' (under *Query Mode*) is a dataset from data query; The 'consts' includes several consts came from the last command line argument.
	更具体的含义略。More details are omitted.

## 用法 Usage
	默认用法是*表模式*，需要指定表名；当用一个查询语句替代表名时即为*查询模式*，此时rows有值而table和columns无值。The default usage is *Table Mode* which require a table name; With a sql query sentence instead of the table name is *Query Mode*, 
	命令行输入：Command line inputs:
	`python mygen.py "<host:port>|<dbuser>|<dbuser_password>|<db_name>|<table_name>" "<template_file_path>" "<output_file_path>" "<const0=value0|const1=value1>"`
	一个例子：One Example:
	`python mygen.py "127.0.0.1:3306|qinhy|123456|db_entbase|tb_workflow" "templates/entity.kt" "output/workflow.kt" "author=qinhuayi|email=qinhuayi@qq.com"`
	另一个例子（查询模式）：Another Example(Query Mode):
	`python mygen.py "127.0.0.1:3306|qinhy|123456|db_entbase|select * from tb_workflow" "templates/entity.kt" "output/workflow.kt" "author=qinhuayi|email=qinhuayi@qq.com"`
	推荐编写shell脚本来运行。Recommend run by shell scripts. 