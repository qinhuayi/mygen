package pers.qinhuayi.vault.entity;
<%
var removePrefix = function (name) {
	return name.replace(/^(tb_|v_|vw_|s_|sys_)/, '');
},
	pascal = function (name) {
		return removePrefix(name).replace(/(?:^|_)([a-z])/g, function($0,$1){ 
			return $1.toUpperCase() 
		});
	},
	camel = function (name) {
		return removePrefix(name).replace(/_([a-z])/g, function($0,$1){ 
			return $1.toUpperCase() 
		}).replace(/^[A-Z]/, function($0){ 
			return $0.toLowerCase() 
		});
	};
%>
import pers.qinhuayi.framework.entity.Table;
/**
 * {{@table.comment}}
 * @author {{@consts.author}} 
 * @email {{@consts.email}}
 */ 
@Table("{{@table.name}}")
public record {{@pascal(table.name)}} ({{each columns as col i}}
	//{{@col.COLUMN_COMMENT}}
	@Table.Column("{{@col.COLUMN_NAME}}")
	{{@col.javatype}} {{@camel(col.COLUMN_NAME)}}{{if i < columns.length - 1}},{{/if}} {{/each}}
) 