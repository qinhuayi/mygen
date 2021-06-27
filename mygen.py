import mysql.connector, time, re, os, sys, execjs, json

debug = True
debugArgs = "mygen.py◼127.0.0.1:3306|qinhy|123456|db_entbase|tb_workflow◼./templates/entity.java◼./output/workflow.java◼author=qinhuayi|datestr=2020-05-07".split('◼')
sysargv = debugArgs if debug else sys.argv

if len(sysargv) >= 4:
    connstr = sysargv[1].split('|')
    if len(connstr) == 5:
        cindex = connstr[0].find(':')
        dbhost = connstr[0][0:cindex] if cindex > 0 else connstr[0]
        dbport = int(connstr[0][cindex+1:]) if cindex > 0 else 3306
        dbuser = connstr[1]
        dbpassword = connstr[2]
        dbname = connstr[3]
        tableName = connstr[4] if re.match('^\\w+$', connstr[4]) else ''
        SQL = connstr[4] if tableName=='' else ''
    else:
        print('\t ◼mysql参数不正确! 需要竖线分隔的5个参数: "<host:port>|<dbuser>|<pwd>|<dbname>|<tableNameOrSQL>"')
        sys.exit(0)

    template = os.path.abspath(sysargv[2])
    if not os.path.isfile(template):
        print(f'\t ◼找不到模板文件{template}!')
        sys.exit(0)

    outputfile = sysargv[3]
    consts = sysargv[4] if len(sysargv) >= 5 else ''
else:
    print('\t ◼参数数量不正确!需要3个以上参数:"<host:port>|<dbuser>|<pwd>|<dbname>|<tableNameOrSQL>" "<templatefile>" "<outputfile>" "str0=XXX|str1=XXX"')
    sys.exit(0)

def readConsts(str):
    vars = {}
    arrs = str.split('|')
    for str in arrs:
        sindex = str.find('=')
        sname = str[0:sindex].strip() if sindex >= 0 else str
        svalue = str[sindex+1:] if sindex >= 0 else ''
        if len(sname) > 0:
            vars[sname] = svalue.strip()
    return vars

def render(tmpl, data):
    template = ""
    js = ""
    with open("art-template-x.js", 'r', 'utf-8') as fread:   
        js = fread.read()
    with open(tmpl, 'r', 'utf-8') as fread:   
        template = fread.read()
    jsonData = {'tmpl': template,  'data': data}
    js = f"{js}\n function main() {{ var data={jsonData}; return template.compile(data.tmpl)(data.data); }} "
    compiled = execjs.compile(js)
    return compiled.call('main')

def output(filename, codes, encoding):
    with open(outputfile,'w+', encoding=encoding) as fout:   
        fout.write(codes)

def printErr(ex):        
    print(f"◼◼ Error: \r\n\t file= {ex.__traceback__.tb_frame.f_globals['__file__']}\r\n\t line= {ex.__traceback__.tb_lineno}\r\n\t msg= {repr(ex)} ")

def dbtype2javatype(name):
    dbtypes = "VARCHAR, CHAR, BLOB, TEXT, INTEGER, TINYINT, SMALLINT, MEDIUMINT, BIT, BIGINT, FLOAT, DOUBLE, DECIMAL, BOOLEAN, ID, DATE, TIME, DATETIME, TIMESTAMP".split(', ')
    javatypes = "String, String, byte[], String, Long, Integer, Integer, Integer, Boolean, Long, Float, Double, BigDecimal, Boolean, Long, LocalDate, Time, LocalDateTime, LocalDateTime".split(', ')
    return javatypes[dbtypes.index(name.upper())] if name.upper() in dbtypes else name

def name2code(name, pascal):
    code = ''
    prefixs = 'tb,t,vw,v,sys,s,u'.split(',')
    strs = name.split('_')
    if strs[0].lower() in prefixs:
        del strs[0]        
    for str in strs:
        code = code + str.capitalize()       
    firstChar = code[0].upper() if pascal else code[0].lower()
    return firstChar + code[1:]

def fetchTableSchemaData(cursor):
    sql = f"select TABLE_NAME, TABLE_NAME name, TABLE_TYPE, TABLE_COMMENT, TABLE_COMMENT comment from information_schema.tables where table_schema='{dbname}' and table_name = '{tableName}' "
    cursor.execute(sql)
    table = cursor.fetchone()
    if table == None:
        raise Exception(f"查询不到{dbname}.{tableName}!", 1)
    table['Code'] = name2code(table['name'], True)
    table['code'] = name2code(table['name'], False)
    fields = "ORDINAL_POSITION ID, ORDINAL_POSITION, COLUMN_NAME, COLUMN_KEY, DATA_TYPE, COLUMN_TYPE, COLUMN_COMMENT, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE, EXTRA"
    sql = f"select {fields} from information_schema.columns where table_schema='{dbname}' and table_name='{tableName}' ORDER BY ordinal_position "
    cursor.execute(sql)
    columns = cursor.fetchall()
    for col in columns:
        col['Code'] = name2code(col['COLUMN_NAME'], True)
        col['code'] = name2code(col['COLUMN_NAME'], False)
        col['javatype'] = dbtype2javatype(col['DATA_TYPE'])
    return {'table': table, 'columns': columns, 'rows': columns};

def fetchQueryData(cursor):
    cursor.execute(SQL)
    rows = cursor.fetchall()
    return {'rows': rows};

def tryFetchData(consts):
    dat = {}
    try:
        print(f"connstr={dbhost}:{dbport}|{dbuser}|{dbpassword}|{dbname}")
        conf = {'user': dbuser, 'password': dbpassword, 'host': dbhost, 'port': dbport, 'database': dbname}
        conn = mysql.connector.connect(**conf)
        cur = conn.cursor()
        dat = fetchTableSchemaData(cur) if SQL =='' else fetchQueryData(cur)
        dat['consts'] = readConsts(consts)
        cur.close()
        conn.close()
    except Exception as ex:
        printErr(ex)
        sys.exit(0)
    return dat;

try:    
    if not os.path.exists(os.path.dirname(outputfile)):
        os.makedirs(os.path.dirname(outputfile))
    data = tryFetchData(consts)
    data['re'] = re;
    codes = render(os.path.abspath(template), data)
    output(os.path.abspath(outputfile), codes, 'utf-8')
    times = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    print('◼◼◼◼  done! %s ' %times)
except Exception as ex:
    printErr(ex)