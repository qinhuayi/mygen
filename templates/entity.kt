package com.upreal.webserver.entity

/**
 * @author qinhuayi
 * @since 2020/12/17
 */
data class {{table.TABLE_NAME}} (
{{each columns as col}}
    var {{col.COLUMN_NAME}}: {{javatype}}? = null,
{{/each}}
)