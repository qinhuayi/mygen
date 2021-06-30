package com.kezhida.webserver.entity
{{set removePrefix = function(name){ return name.replace(/^(tb_|v_|vw_|s_|sys_)/, '')}; }}
{{set pascal = function(name){ return removePrefix(name).replace(/(?:^|_)([a-z])/g, function($0,$1){ return $1.toUpperCase() } )}; }}
{{set camel = function(name){ return removePrefix(name).replace(/_([a-z])/g, function($0,$1){ return $1.toUpperCase() } ).replace(/^[A-Z]/, function($0){ return $0.toLowerCase() }) }; }}
/**
 * @author {{@consts.author}} 
 * @email {{@consts.email}}
 * {{@table.comment}}
 */ 
public data class {{@pascal(table.name)}} (
	{{each columns as col i}}var {{@camel(col.COLUMN_NAME)}}: {{@col.javatype}}{{if i < columns.length - 1}},{{/if}} //{{@col.COLUMN_COMMENT}}
	{{/each}}
)