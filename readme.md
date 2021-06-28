# mygen是一个支持mysql和art-template模板的代码生成器

## 程序设计说明
	首先用python下得MySQLdb连接mysql数据库得到数据后用v8引擎运行art-template.js模板引擎渲染模板文件形成最终文档并保存到输出路径。

## 模板数据(JSON对象)说明
	数据格式如下:
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
	其中table为表定义; columns一个数组，包含各个字段的定义; rows为（在*查询模式*下）查询得到的数据集; consts为命令行最后一个参数得到常量。
	更具体的含义略。

## 用法
	默认用法是*表定义模式*，需要指定表名；当用一个查询语句替代表名时即为*查询模式*，此时rows有值而table和columns无值。
	命令行输入：
	`mygen`
	或者输入：
	`python mygen.py "127.0.0.1:3306|qinhy|123456|db_entbase|tb_workflow" "output/entity.kt" "output/entity.kt" "author=qinhuayi|email=qinhuayi@qq.com"`
	查询模式用法：
	`python mygen.py "127.0.0.1:3306|qinhy|123456|db_entbase|select * from tb_workflow" "output/entity.kt" "output/entity.kt" "author=qinhuayi|email=qinhuayi@qq.com"`
