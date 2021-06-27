package com.upreal.webserver.entity

/**
 * @author qinhuayi
 * @since 2020/12/17
 */
record User (
    var ID: Int? = null,
    var RoleID: Int? = null,
    var Account: String? = null,
    var Password: String? = null,
    var Name: String? = null,
    var Settings: String? = null,
    var BedRange: String? = null
)