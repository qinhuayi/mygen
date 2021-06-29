package pers.qinhuayi.vault.entity;

import pers.qinhuayi.framework.entity.Table;
{{set removePrefix = function(name){ return name.replace(/^(tb_|v_|vw_|s_|sys_)/, '')}; }}
{{set pascal = function(name){ return removePrefix(name).replace(/(?:^|_)([a-z])/g, function($0,$1){ return $1.toUpperCase() } )}; }}
{{set camal = function(name){ return removePrefix(name).replace(/_([a-z])/g, function($0,$1){ return $1.toUpperCase() } ).replace(/^[A-Z]/, function($0){ return $0.toLowerCase() }) }; }}
/**
 * {{@table.comment}}
 * @author {{@consts.author}} 
 * @email {{@consts.email}}
 */ 
@Table("{{@table.name}}")
public record {{@pascal(table.name)}} ({{each columns as col i}}
	//{{@col.COLUMN_COMMENT}}
	@Table.Column("{{@col.COLUMN_NAME}}")
	{{@col.javatype}} {{@camal(col.COLUMN_NAME)}}{{if i < columns.length - 1}},{{/if}} {{/each}}
) 