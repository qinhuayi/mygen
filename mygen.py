#coding=utf-8
import mysql.connector, os, sys, re
from js2py import evaljs

debug = False
debugArgs = "mygen.py§127.0.0.1:3306|vault-keeper|123456|db_vault|tb_user§./templates/entity.java§./output/user.java§author=qinhuayi|email=qinhuayi@qq.com".split('§')
sysargv = debugArgs if debug else sys.argv

def readArguments(args):
    if len(sysargv) >= 4:
        connstr = sysargv[1].split('|')
        if len(connstr) == 5:
            cindex = connstr[0].find(':')
            args['dbhost'] = connstr[0][0:cindex] if cindex > 0 else connstr[0]
            args['dbport'] = int(connstr[0][cindex+1:]) if cindex > 0 else 3306
            args['dbuser'] = connstr[1]
            args['dbpassword'] = connstr[2]
            args['dbname'] = connstr[3]
            args['tableName'] = connstr[4] if re.match('^\\w+$', connstr[4]) else ''
            args['SQL'] = connstr[4] if args['tableName'] == '' else ''
        else:
            print('\t mysql参数不正确! 需要竖线分隔的5个参数: "<host:port>|<dbuser>|<pwd>|<dbname>|<tableNameOrSQL>"')
            sys.exit(0)

        args['template'] = os.path.abspath(sysargv[2])
        if not os.path.isfile(args['template']):
            print(f"\t 找不到模板文件${args['template']}")
            sys.exit(0)

        args['outputfile'] = sysargv[3]
        args['consts'] = sysargv[4] if len(sysargv) >= 5 else ''
    else:
        print('\t 参数数量不正确!需要3个以上参数:"<host:port>|<dbuser>|<pwd>|<dbname>|<tableNameOrSQL>" "<templatefile>" "<outputfile>" "str0=..|str1=.."')
        sys.exit(0)
    return args

def readConsts(str):
    consts = {}
    arrs = str.split('|')
    for str in arrs:
        sindex = str.find('=')
        sname = str[0:sindex].strip() if sindex >= 0 else str
        svalue = str[sindex+1:] if sindex >= 0 else ''
        if len(sname) > 0:
            consts[sname] = svalue.strip()
    return consts

def render(jspath, tplpath, data):
    with open(jspath, 'r', encoding='utf-8') as fread:   
        js = fread.read()
    with open(tplpath, 'r', encoding='utf-8') as fread:   
        template = fread.read()
    compile = evaljs.eval_js(js)
    return compile(template, data)

def output(filename, codes, encoding):
    with open(args['outputfile'],'w+', encoding=encoding) as fout:   
        fout.write(codes)

def printErr(ex):        
    print(f"§ Error: \r\n\t file= {ex.__traceback__.tb_frame.f_globals['__file__']}\r\n\t line= {ex.__traceback__.tb_lineno}\r\n\t msg= {repr(ex)} ")

def dbtype2javatype(name):
    dbtypes = "VARCHAR, CHAR, BLOB, TEXT, INTEGER, TINYINT, SMALLINT, MEDIUMINT, BIT, BIGINT, FLOAT, DOUBLE, DECIMAL, BOOLEAN, ID, DATE, TIME, DATETIME, TIMESTAMP".split(', ')
    javatypes = "String, String, byte[], String, Long, Integer, Integer, Integer, Boolean, Long, Float, Double, BigDecimal, Boolean, Long, LocalDate, Time, LocalDateTime, LocalDateTime".split(', ')
    return javatypes[dbtypes.index(name.upper())] if name.upper() in dbtypes else name

def createFieldNameByIndex(row, fields):
    arr = fields.split(',')
    dat = {}
    for i in range(len(arr)):
        fieldname = arr[i].strip().split(' ')[1] if ' ' in arr[i].strip() else arr[i].strip()
        if fieldname != '':
            dat[fieldname] = dat[i] = str(row[i], encoding='utf-8') if isinstance(row[i], bytes) else row[i]
    del row
    return dat

def fetchTableSchemaData(cursor, dbname, tableName):
    fields = "TABLE_NAME, TABLE_NAME name, TABLE_TYPE, TABLE_TYPE type, TABLE_COMMENT, TABLE_COMMENT comment"
    sql = f"select {fields} from information_schema.tables where table_schema='{dbname}' and table_name = '{tableName}' "
    cursor.execute(sql)
    table = cursor.fetchone()
    if table == None:
        raise Exception(f"查询不到{dbname}.{tableName}!", 1)
    table = createFieldNameByIndex(table, fields)
    fields = "ORDINAL_POSITION ID, ORDINAL_POSITION, COLUMN_NAME, COLUMN_KEY, DATA_TYPE, COLUMN_TYPE, COLUMN_COMMENT, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE, EXTRA"
    sql = f"select {fields} from information_schema.columns where table_schema='{dbname}' and table_name='{tableName}' ORDER BY ordinal_position "
    cursor.execute(sql)
    columns = [] 
    for col in cursor.fetchall():
        col = createFieldNameByIndex(col, fields)
        col['javatype'] = dbtype2javatype(col['DATA_TYPE'])
        columns.append(col)
    return {'table': table, 'columns': columns};

def fetchQueryData(cursor, sql):
    cursor.execute(sql)
    rows = cursor.fetchall()
    return {'rows': rows};

def tryFetchData(args):
    dat = {}
    #conf = {host: args['dbhost'], port: args['dbport'], user: args['dbuser'], passwd: args['dbpassword'], db: args['dbname'], charset: 'utf8mb4', auth_plugin: 'mysql_native_password'}
    try:
        print(f"connstr={args['dbhost']}:{args['dbport']}|{args['dbuser']}|{args['dbpassword']}|{args['dbname']}")
        conn = mysql.connector.connect(host=args['dbhost'], port=args['dbport'], user=args['dbuser'], passwd=args['dbpassword'], db=args['dbname'], charset='utf8mb4', auth_plugin='mysql_native_password')
        cur = conn.cursor(buffered=True)
        dat = fetchTableSchemaData(cur, args['dbname'], args['tableName']) if args['SQL'] =='' else fetchQueryData(cur, args['SQL'])
        dat['consts'] = readConsts(args['consts'])
        cur.close()
        conn.close()
    except Exception as ex:
        printErr(ex)
        sys.exit(0)
    return dat;

try:    
    args = readArguments({})
    if not os.path.exists(os.path.dirname(args['outputfile'])):
        os.makedirs(os.path.dirname(args['outputfile']))
    data = tryFetchData(args)
    codes = render(os.path.abspath("template-standalone4.13.js"), os.path.abspath(args['template']), data)
    output(os.path.abspath(args['outputfile']), codes, 'utf-8')
    if debug:
        print(codes)
    print(' Done!')
except Exception as ex:
    printErr(ex)