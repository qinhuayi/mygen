# mygen��һ��֧��mysql��art-templateģ��Ĵ���������

## �������˵��
	������python�µ�MySQLdb����mysql���ݿ�õ����ݺ���v8��������art-template.jsģ��������Ⱦģ���ļ��γ������ĵ������浽���·����

## ģ������(JSON����)˵��
	���ݸ�ʽ����:
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
	����tableΪ����; columnsһ�����飬���������ֶεĶ���; rowsΪ����*��ѯģʽ*�£���ѯ�õ������ݼ�; constsΪ���������һ�������õ�������
	������ĺ����ԡ�

## �÷�
	Ĭ���÷���*����ģʽ*����Ҫָ������������һ����ѯ����������ʱ��Ϊ*��ѯģʽ*����ʱrows��ֵ��table��columns��ֵ��
	���������룺
	`mygen`
	�������룺
	`python mygen.py "127.0.0.1:3306|qinhy|123456|db_entbase|tb_workflow" "output/entity.kt" "output/entity.kt" "author=qinhuayi|email=qinhuayi@qq.com"`
	��ѯģʽ�÷���
	`python mygen.py "127.0.0.1:3306|qinhy|123456|db_entbase|select * from tb_workflow" "output/entity.kt" "output/entity.kt" "author=qinhuayi|email=qinhuayi@qq.com"`
