/*! art-template-standalone4.13 | https://github.com/aui/art-template */
'use strict';
var global = typeof global == 'object' ? global : {},
    exports = typeof exports == 'object' ? exports : {},
    template = null;
!function (global) {

    // part 1. from runtime.js
    var globalThis = typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {};
    var runtime = Object.create(globalThis);
    var ESCAPE_REG = /["&'<>]/;

    /**
     * @param  {any}        content
     * @return {string}
     */
    runtime.$escape = function (content) {
        return xmlEscape(toString(content));
    };

    /**
     * @param {array|Object} data
     * @param {function}     callback
     */
    runtime.$each = function (data, callback) {
        if (Array.isArray(data)) {
            for (var i = 0, len = data.length; i < len; i++) {
                callback(data[i], i);
            }
        } else {
            for (var _i in data) {
                callback(data[_i], _i);
            }
        }
    };

    function toString(value) {
        if (typeof value !== 'string') {
            if (value === undefined || value === null) {
                value = '';
            } else if (typeof value === 'function') {
                value = toString(value.call(value));
            } else {
                value = JSON.stringify(value);
            }
        }

        return value;
    }

    function xmlEscape(content) {
        var html = '' + content;
        var regexResult = ESCAPE_REG.exec(html);
        if (!regexResult) {
            return content;
        }

        var result = '';
        var i = void 0,
            lastIndex = void 0,
            char = void 0;
        for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {
            switch (html.charCodeAt(i)) {
                case 34:
                    char = '&#34;';
                    break;
                case 38:
                    char = '&#38;';
                    break;
                case 39:
                    char = '&#39;';
                    break;
                case 60:
                    char = '&#60;';
                    break;
                case 62:
                    char = '&#62;';
                    break;
                default:
                    continue;
            }

            if (lastIndex !== i) {
                result += html.substring(lastIndex, i);
            }

            lastIndex = i + 1;
            result += char;
        }

        if (lastIndex !== i) {
            return result + html.substring(lastIndex, i);
        } else {
            return result;
        }
    }

    //global.runtime = runtime;
    var $escape = runtime.$escape;
    //global.$escape = $escape;
    //global.$each = runtime.$each;

    // part 2 from adapter\rule.native.js

    var nativeRule = {
        test: /<%(#?)((?:==|=#|[=-])?)[ \t]*([\w\W]*?)[ \t]*(-?)%>/,
        use: function use(match, comment, output, code /*, trimMode*/) {
            output = {
                '-': 'raw',
                '=': 'escape',
                '': false,
                // v3 compat: raw output
                '==': 'raw',
                '=#': 'raw'
            }[output];

            // ejs compat: comment tag
            if (comment) {
                code = '/*' + code + '*/';
                output = false;
            }

            // ejs compat: trims following newline
            // if (trimMode) {}

            return {
                code: code,
                output: output
            };
        }
    };
    // part 3 from adapter/rule.art.js

    var artRule = {
        test: /{{([@#]?)[ \t]*(\/?)([\w\W]*?)[ \t]*}}/,
        use: function use(match, raw, close, code) {
            var compiler = this;
            var options = compiler.options;
            var esTokens = compiler.getEsTokens(code);
            var values = esTokens.map(function (token) {
                return token.value;
            });
            var result = {};

            var group = void 0;
            var output = raw ? 'raw' : false;
            var key = close + values.shift();

            //
            var warn = function warn(oldSyntax, newSyntax) {
                console.info((options.filename || 'anonymous') + ':' + (match.line + 1) + ':' + (match.start + 1) + '\n' + ('Template upgrade: {{' + oldSyntax + '}} -> {{' + newSyntax + '}}'));
            };

            // v3 compat: #value
            if (raw === '#') {
                //warn('#value', '@value');
            }

            switch (key) {
                case 'set':
                    code = 'var ' + values.join('').trim();
                    break;

                case 'if':
                    code = 'if(' + values.join('').trim() + '){';

                    break;

                case 'else':
                    var indexIf = values.indexOf('if');

                    if (~indexIf) {
                        values.splice(0, indexIf + 1);
                        code = '}else if(' + values.join('').trim() + '){';
                    } else {
                        code = '}else{';
                    }

                    break;

                case '/if':
                    code = '}';
                    break;

                case 'each':
                    group = artRule._split(esTokens);
                    group.shift();

                    if (group[1] === 'as') {
                        // ... v3 compat ...
                        //warn('each object as value index', 'each object value index');
                        group.splice(1, 1);
                    }

                    var object = group[0] || '$data';
                    var value = group[1] || '$value';
                    var index = group[2] || '$index';

                    code = '$each(' + object + ',function(' + value + ',' + index + '){';

                    break;

                case '/each':
                    code = '})';
                    break;

                case 'block':
                    group = artRule._split(esTokens);
                    group.shift();
                    code = 'block(' + group.join(',').trim() + ',function(){';
                    break;

                case '/block':
                    code = '})';
                    break;

                case 'echo':
                    key = 'print';
                    //warn('echo value', 'value');
                case 'print':
                case 'include':
                case 'extend':
                    if (values.join('').trim().indexOf('(') !== 0) {
                        // 
                        group = artRule._split(esTokens);
                        group.shift();
                        code = key + '(' + group.join(',') + ')';
                        break;
                    }

                default:
                    if (~values.indexOf('|')) {
                        var v3split = ':'; // ... v3 compat ...

                        // 
                        var _group = esTokens.reduce(function (group, token) {
                            var value = token.value,
                                type = token.type;

                            if (value === '|') {
                                group.push([]);
                            } else if (type !== 'whitespace' && type !== 'comment') {
                                if (!group.length) {
                                    group.push([]);
                                }
                                if (value === v3split && group[group.length - 1].length === 1) {
                                    warn('value | filter: argv', 'value | filter argv');
                                } else {
                                    group[group.length - 1].push(token);
                                }
                            }
                            return group;
                        }, []).map(function (g) {
                            return artRule._split(g);
                        });

                        // 
                        code = _group.reduce(function (accumulator, filter) {
                            var name = filter.shift();
                            filter.unshift(accumulator);

                            return '$imports.' + name + '(' + filter.join(',') + ')';
                        }, _group.shift().join(' ').trim());
                    }

                    output = output || 'escape';

                    break;
            }

            result.code = code;
            result.output = output;

            return result;
        },

        _split: function _split(esTokens) {
            esTokens = esTokens.filter(function (_ref) {
                var type = _ref.type;

                return type !== 'whitespace' && type !== 'comment';
            });

            var current = 0;
            var lastToken = esTokens.shift();
            var punctuator = 'punctuator';
            var close = /\]|\)/;
            var group = [[lastToken]];

            while (current < esTokens.length) {
                var esToken = esTokens[current];

                if (esToken.type === punctuator || lastToken.type === punctuator && !close.test(lastToken.value)) {
                    group[group.length - 1].push(esToken);
                } else {
                    group.push([esToken]);
                }

                lastToken = esToken;

                current++;
            }

            return group.map(function (g) {
                return g.map(function (g) {
                    return g.value;
                }).join('');
            });
        }
    };

    // part 4 from adapter/extend.js
    var toString = Object.prototype.toString;
    var toType = function toType(value) {
        // 
        return value === null ? 'Null' : toString.call(value).slice(8, -1);
    };

    /**
     * @param   {Object}    options
     * @param   {?Object}   defaults
     * @return  {Object}
     */
    var extend = function extend(target, defaults) {
        var object = void 0;
        var type = toType(target);

        if (type === 'Object') {
            object = Object.create(defaults || {});
        } else if (type === 'Array') {
            object = [].concat(defaults || []);
        }

        if (object) {
            for (var index in target) {
                if (Object.hasOwnProperty.call(target, index)) {
                    object[index] = extend(target[index], object[index]);
                }
            }
            return object;
        } else {
            return target;
        }
    };
    //module.exports = extend;
    global.extend = extend;

    // part 5. from defaults.js
    var detectNode = typeof window === 'undefined';

    var settings = {
        source: null,
        filename: null,
        rules: [nativeRule, artRule],
        escape: true,
        debug: detectNode ? process.env.NODE_ENV !== 'production' : false,
        bail: true,
        cache: true,
        minimize: true,
        compileDebug: false,
        //resolveFilename: resolveFilename,
        resolveFilename: null,
        //include: include,
        include: null,
        //htmlMinifier: htmlMinifier,
        htmlMinifier: null,
        htmlMinifierOptions: {
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            ignoreCustomFragments: []
        },
        //onerror: onerror,
        onerror: null,
        //loader: loader,
        loader: null,
        //caches: caches,
        caches: null,
        root: '/',
        extname: '.art',
        ignore: [],
        imports: runtime
    };

    function Defaults() {
        this.$extend = function (options) {
            options = options || {};
            return extend(options, options instanceof Defaults ? options : this);
        };
    }
    Defaults.prototype = settings;
    var defaults = global.defaults = new Defaults();

    //part 6. from is-keyword/index.js
    var reservedKeywords = {
        'abstract': true,
        'await': true,
        'boolean': true,
        'break': true,
        'byte': true,
        'case': true,
        'catch': true,
        'char': true,
        'class': true,
        'const': true,
        'continue': true,
        'debugger': true,
        'default': true,
        'delete': true,
        'do': true,
        'double': true,
        'else': true,
        'enum': true,
        'export': true,
        'extends': true,
        'false': true,
        'final': true,
        'finally': true,
        'float': true,
        'for': true,
        'function': true,
        'goto': true,
        'if': true,
        'implements': true,
        'import': true,
        'in': true,
        'instanceof': true,
        'int': true,
        'interface': true,
        'let': true,
        'long': true,
        'native': true,
        'new': true,
        'null': true,
        'package': true,
        'private': true,
        'protected': true,
        'public': true,
        'return': true,
        'short': true,
        'static': true,
        'super': true,
        'switch': true,
        'synchronized': true,
        'this': true,
        'throw': true,
        'transient': true,
        'true': true,
        'try': true,
        'typeof': true,
        'var': true,
        'void': true,
        'volatile': true,
        'while': true,
        'with': true,
        'yield': true
    };

    var isKeyword = function (str) {
        return reservedKeywords.hasOwnProperty(str);
    };
    //global.isKeyword = isKeyword;
    //part 7. from js-tokens/index.js
    Object.defineProperty(exports, "__esModule", {
        value: true
    })
    var _default = /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)|(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)|(\/(?!\*)(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\]\\]).|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiyu]{1,5}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)|((?!\d)(?:(?!\s)[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+)|(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-\/%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2})=?|[?~.,:;[\](){}])|(\s+)|(^$|[\s\S])/g
    var matchToToken = function (match) {
        var token = { type: "invalid", value: match[0] }
        if (match[1]) token.type = "string", token.closed = !!(match[3] || match[4])
        else if (match[5]) token.type = "comment"
        else if (match[6]) token.type = "comment", token.closed = !!match[7]
        else if (match[8]) token.type = "regex"
        else if (match[9]) token.type = "number"
        else if (match[10]) token.type = "name"
        else if (match[11]) token.type = "punctuator"
        else if (match[12]) token.type = "whitespace"
        return token
    };
    var jsTokens = _default;
    //global['default'] = _default;
    global.matchToToken = matchToToken;
    global.jsTokens = jsTokens;

    //part 8. from es-tokenizer.js
    /**
     * @param {string} code
     * @return {Object[]}
     */
    var esTokenizer = function esTokenizer(code) {
        var tokens = code.match(jsTokens).map(function (value) {
            jsTokens.lastIndex = 0;
            return matchToToken(jsTokens.exec(value));
        }).map(function (token) {
            if (token.type === 'name' && isKeyword(token.value)) {
                token.type = 'keyword';
            }
            return token;
        });

        return tokens;
    };

    global.esTokenizer = esTokenizer;

    //part 9. from tpl-tokenizer.js
    var TYPE_STRING = 'string';
    var TYPE_EXPRESSION = 'expression';
    var TYPE_RAW = 'raw';
    var TYPE_ESCAPE = 'escape';

    function wrapString(token) {
        var value = new String(token.value);
        value.line = token.line;
        value.start = token.start;
        value.end = token.end;
        return value;
    }

    function Token(type, value, prevToken) {
        this.type = type;
        this.value = value;
        this.script = null;

        if (prevToken) {
            this.line = prevToken.line + prevToken.value.split(/\n/).length - 1;
            if (this.line === prevToken.line) {
                this.start = prevToken.end;
            } else {
                this.start = prevToken.value.length - prevToken.value.lastIndexOf('\n') - 1;
            }
        } else {
            this.line = 0;
            this.start = 0;
        }

        this.end = this.start + this.value.length;
    }

    /**
     * @param {string}      source
     * @param {Object[]}    rules     @see defaults.rules
     * @param {Object}      context
     * @return {Object[]}
     */
    var tplTokenizer = function tplTokenizer(source, rules) {
        var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var tokens = [new Token(TYPE_STRING, source)];

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            var flags = rule.test.ignoreCase ? 'ig' : 'g';
            var regexp = new RegExp(rule.test.source, flags);

            for (var _i = 0; _i < tokens.length; _i++) {
                var token = tokens[_i];
                var prevToken = tokens[_i - 1];

                if (token.type !== TYPE_STRING) {
                    continue;
                }

                var match = void 0,
                    index = 0;
                var substitute = [];
                var value = token.value;

                while ((match = regexp.exec(value)) !== null) {
                    if (match.index > index) {
                        prevToken = new Token(TYPE_STRING, value.slice(index, match.index), prevToken);
                        substitute.push(prevToken);
                    }

                    prevToken = new Token(TYPE_EXPRESSION, match[0], prevToken);
                    match[0] = wrapString(prevToken);
                    prevToken.script = rule.use.apply(context, match);
                    substitute.push(prevToken);

                    index = match.index + match[0].length;
                }

                if (index < value.length) {
                    prevToken = new Token(TYPE_STRING, value.slice(index), prevToken);
                    substitute.push(prevToken);
                }

                tokens.splice.apply(tokens, [_i, 1].concat(substitute));
                _i += substitute.length - 1;
            }
        }

        return tokens;
    };

    tplTokenizer.TYPE_STRING = TYPE_STRING;
    tplTokenizer.TYPE_EXPRESSION = TYPE_EXPRESSION;
    tplTokenizer.TYPE_RAW = TYPE_RAW;
    tplTokenizer.TYPE_ESCAPE = TYPE_ESCAPE;

    //module.exports.tplTokenizer = tplTokenizer;
    global.tplTokenizer = tplTokenizer;


    //part 10. from compiler.js
    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var DATA = '$data';

    var IMPORTS = '$imports';

    /**  $imports.$escape */
    var ESCAPE = '$escape';

    /**  $imports.$each */
    var EACH = '$each';

    var PRINT = 'print';

    var INCLUDE = 'include';

    var EXTEND = 'extend';

    var BLOCK = 'block';

    var OUT = '$$out';

    var LINE = '$$line';

    var BLOCKS = '$$blocks';

    var SLICE = '$$slice';

    var FROM = '$$from';

    var OPTIONS = '$$options';

    var has = function has(object, key) {
        return Object.hasOwnProperty.call(object, key);
    };
    var stringify = JSON.stringify;

    var Compiler = function () {
        /**
         * @param   {Object}    options
         */
        function Compiler(options) {
            var _internal,
                _dependencies,
                _this = this;

            _classCallCheck(this, Compiler);

            var source = options.source;
            var minimize = options.minimize;
            var htmlMinifier = options.htmlMinifier;

            this.options = options;

            this.stacks = [];

            this.context = [];

            this.scripts = [];

            // context map
            this.CONTEXT_MAP = {};

            this.ignore = [DATA, IMPORTS, OPTIONS].concat(_toConsumableArray(options.ignore));

            this.internal = (_internal = {}, _defineProperty(_internal, OUT, '\'\''), _defineProperty(_internal, LINE, '[0,0]'), _defineProperty(_internal, BLOCKS, 'arguments[1]||{}'), _defineProperty(_internal, FROM, 'null'), _defineProperty(_internal, PRINT, 'function(){var s=\'\'.concat.apply(\'\',arguments);' + OUT + '+=s;return s}'), _defineProperty(_internal, INCLUDE, 'function(src,data){var s=' + OPTIONS + '.include(src,data||' + DATA + ',arguments[2]||' + BLOCKS + ',' + OPTIONS + ');' + OUT + '+=s;return s}'), _defineProperty(_internal, EXTEND, 'function(from){' + FROM + '=from}'), _defineProperty(_internal, SLICE, 'function(c,p,s){p=' + OUT + ';' + OUT + '=\'\';c();s=' + OUT + ';' + OUT + '=p+s;return s}'), _defineProperty(_internal, BLOCK, 'function(){var a=arguments,s;if(typeof a[0]===\'function\'){return ' + SLICE + '(a[0])}else if(' + FROM + '){if(!' + BLOCKS + '[a[0]]){' + BLOCKS + '[a[0]]=' + SLICE + '(a[1])}else{' + OUT + '+=' + BLOCKS + '[a[0]]}}else{s=' + BLOCKS + '[a[0]];if(typeof s===\'string\'){' + OUT + '+=s}else{s=' + SLICE + '(a[1])}return s}}'), _internal);

            this.dependencies = (_dependencies = {}, _defineProperty(_dependencies, PRINT, [OUT]), _defineProperty(_dependencies, INCLUDE, [OUT, OPTIONS, DATA, BLOCKS]), _defineProperty(_dependencies, EXTEND, [FROM, /*[*/INCLUDE /*]*/]), _defineProperty(_dependencies, BLOCK, [SLICE, FROM, OUT, BLOCKS]), _dependencies);

            this.importContext(OUT);
            this.importContext(ESCAPE);

            if (options.compileDebug) {
                this.importContext(LINE);
            }

            if (minimize) {
                try {
                    source = htmlMinifier(source, options);
                } catch (error) { }
            }

            this.source = source;
            this.getTplTokens(source, options.rules, this).forEach(function (tokens) {
                if (tokens.type === tplTokenizer.TYPE_STRING) {
                    _this.parseString(tokens);
                } else {
                    _this.parseExpression(tokens);
                }
            });
        }

        /**
         * @param   {string} source
         * @return  {Object[]}
         */


        _createClass(Compiler, [{
            key: 'getTplTokens',
            value: function getTplTokens() {
                return tplTokenizer.apply(undefined, arguments);
            }

            /**
             * @param   {string} source
             * @return  {Object[]}
             */

        }, {
            key: 'getEsTokens',
            value: function getEsTokens(source) {
                return esTokenizer(source);
            }

            /**
             * @param {Object[]} esTokens
             * @return {string[]}
             */

        }, {
            key: 'getVariables',
            value: function getVariables(esTokens) {
                var ignore = false;
                return esTokens.filter(function (esToken) {
                    return esToken.type !== 'whitespace' && esToken.type !== 'comment';
                }).filter(function (esToken) {
                    if (esToken.type === 'name' && !ignore) {
                        return true;
                    }

                    ignore = esToken.type === 'punctuator' && esToken.value === '.';

                    return false;
                }).map(function (tooken) {
                    return tooken.value;
                });
            }

            /**
             * @param {string} name
             */

        }, {
            key: 'importContext',
            value: function importContext(name) {
                var _this2 = this;

                var value = '';
                var internal = this.internal;
                var dependencies = this.dependencies;
                var ignore = this.ignore;
                var context = this.context;
                var options = this.options;
                var imports = options.imports;
                var contextMap = this.CONTEXT_MAP;

                if (!has(contextMap, name) && ignore.indexOf(name) === -1) {
                    if (has(internal, name)) {
                        value = internal[name];

                        if (has(dependencies, name)) {
                            dependencies[name].forEach(function (name) {
                                return _this2.importContext(name);
                            });
                        }

                    } else if (name == ESCAPE || name == EACH || has(imports, name)) {
                        value = IMPORTS + '.' + name;
                    } else {
                        value = DATA + '.' + name;
                    }

                    contextMap[name] = value;
                    context.push({
                        name: name,
                        value: value
                    });
                }
            }

            /**
             * @param {Object} tplToken
             */

        }, {
            key: 'parseString',
            value: function parseString(tplToken) {
                var source = tplToken.value;

                if (!source) {
                    return;
                }

                var code = OUT + '+=' + stringify(source);
                this.scripts.push({
                    source: source,
                    tplToken: tplToken,
                    code: code
                });
            }

            /**
             * @param {Object} tplToken
             */

        }, {
            key: 'parseExpression',
            value: function parseExpression(tplToken) {
                var _this3 = this;

                var source = tplToken.value;
                var script = tplToken.script;
                var output = script.output;
                var escape = this.options.escape;
                var code = script.code;

                if (output) {
                    if (escape === false || output === tplTokenizer.TYPE_RAW) {
                        code = OUT + '+=' + script.code;
                    } else {
                        code = OUT + '+=' + ESCAPE + '(' + script.code + ')';
                    }
                }

                var esToken = this.getEsTokens(code);
                this.getVariables(esToken).forEach(function (name) {
                    return _this3.importContext(name);
                });

                this.scripts.push({
                    source: source,
                    tplToken: tplToken,
                    code: code
                });
            }

            /**
             * @param  {string} script
             * @return {boolean}
             */

        }, {
            key: 'checkExpression',
            value: function checkExpression(script) {
                var rules = [
                    // <% } %>
                    // <% }else{ %>
                    // <% }else if(a){ %>
                    [/^\s*}[\w\W]*?{?[\s;]*$/, ''],

                    // <% fn(c,function(a,b){ %>
                    // <% fn(c, a=>{ %>
                    // <% fn(c,(a,b)=>{ %>
                    [/(^[\w\W]*?\([\w\W]*?(?:=>|\([\w\W]*?\))\s*{[\s;]*$)/, '$1})'],

                    // <% if(a){ %>
                    // <% for(var i in d){ %>
                    [/(^[\w\W]*?\([\w\W]*?\)\s*{[\s;]*$)/, '$1}']];

                var index = 0;
                while (index < rules.length) {
                    if (rules[index][0].test(script)) {
                        var _script;

                        script = (_script = script).replace.apply(_script, _toConsumableArray(rules[index]));
                        break;
                    }
                    index++;
                }

                try {
                    new Function(script);
                    return true;
                } catch (e) {
                    return false;
                }
            }

            /**
             * @return  {function}
             */

        }, {
            key: 'build',
            value: function build() {
                var options = this.options;
                var context = this.context;
                var scripts = this.scripts;
                var stacks = this.stacks;
                var source = this.source;
                var filename = options.filename;
                var imports = options.imports;
                var mappings = [];
                var extendMode = has(this.CONTEXT_MAP, EXTEND);

                var offsetLine = 0;

                // Create SourceMap: mapping
                var mapping = function mapping(code, _ref) {
                    var line = _ref.line,
                        start = _ref.start;

                    var node = {
                        generated: {
                            line: stacks.length + offsetLine + 1,
                            column: 1
                        },
                        original: {
                            line: line + 1,
                            column: start + 1
                        }
                    };

                    offsetLine += code.split(/\n/).length - 1;
                    return node;
                };

                // Trim code
                var trim = function trim(code) {
                    return code.replace(/^[\t ]+|[\t ]$/g, '');
                };

                stacks.push('function(' + DATA + '){');
                stacks.push('\'use strict\'');
                stacks.push(DATA + '=' + DATA + '||{}');
                stacks.push('var ' + context.map(function (_ref2) {
                    var name = _ref2.name,
                        value = _ref2.value;
                    return name + '=' + value;
                }).join(','));

                if (options.compileDebug) {
                    stacks.push('try{');

                    scripts.forEach(function (script) {
                        if (script.tplToken.type === tplTokenizer.TYPE_EXPRESSION) {
                            stacks.push(LINE + '=[' + [script.tplToken.line, script.tplToken.start].join(',') + ']');
                        }

                        mappings.push(mapping(script.code, script.tplToken));
                        stacks.push(trim(script.code));
                    });

                    stacks.push('}catch(error){');

                    stacks.push('throw {' + ['name:\'RuntimeError\'', 'path:' + stringify(filename), 'message:error.message', 'line:' + LINE + '[0]+1', 'column:' + LINE + '[1]+1', 'source:' + stringify(source), 'stack:error.stack'].join(',') + '}');

                    stacks.push('}');
                } else {
                    scripts.forEach(function (script) {
                        mappings.push(mapping(script.code, script.tplToken));
                        stacks.push(trim(script.code));
                    });
                }

                if (extendMode) {
                    stacks.push(OUT + '=\'\'');
                    stacks.push(INCLUDE + '(' + FROM + ',' + DATA + ',' + BLOCKS + ')');
                }

                stacks.push('return ' + OUT);
                stacks.push('}');

                var renderCode = stacks.join('\n');

                try {
                    var result = new Function(IMPORTS, OPTIONS, 'return ' + renderCode)(imports, options);
                    result.mappings = mappings;
                    result.sourcesContent = [source];
                    return result;
                } catch (error) {
                    var index = 0;
                    var line = 0;
                    var start = 0;
                    var generated = void 0;

                    while (index < scripts.length) {
                        var current = scripts[index];
                        if (!this.checkExpression(current.code)) {
                            line = current.tplToken.line;
                            start = current.tplToken.start;
                            generated = current.code;
                            break;
                        }
                        index++;
                    }

                    throw {
                        name: 'CompileError',
                        path: filename,
                        message: error.message,
                        line: line + 1,
                        column: start + 1,
                        source: source,
                        generated: generated,
                        stack: error.stack
                    };
                }
            }
        }]);

        return Compiler;
    }();

    /**
     */


    Compiler.CONSTS = {
        DATA: DATA,
        IMPORTS: IMPORTS,
        PRINT: PRINT,
        INCLUDE: INCLUDE,
        EXTEND: EXTEND,
        BLOCK: BLOCK,
        OPTIONS: OPTIONS,
        OUT: OUT,
        LINE: LINE,
        BLOCKS: BLOCKS,
        SLICE: SLICE,
        FROM: FROM,
        ESCAPE: ESCAPE,
        EACH: EACH
    };

    //module.exports.Compiler = Compiler;
    global.Compiler = Compiler;

    //part 11. from error.js
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    /**
     * @param   {Object}    options
     */
    var TemplateError = function (_Error) {
        _inherits(TemplateError, _Error);

        function TemplateError(options) {
            _classCallCheck(this, TemplateError);

            var _this = _possibleConstructorReturn(this, (TemplateError.__proto__ || Object.getPrototypeOf(TemplateError)).call(this, options.message));

            _this.name = 'TemplateError';
            _this.message = formatMessage(options);
            if (Error.captureStackTrace) {
                Error.captureStackTrace(_this, _this.constructor);
            }
            return _this;
        }

        return TemplateError;
    }(Error);

    function formatMessage(_ref) {
        var name = _ref.name,
            source = _ref.source,
            path = _ref.path,
            line = _ref.line,
            column = _ref.column,
            generated = _ref.generated,
            message = _ref.message;

        if (!source) {
            return message;
        }

        var lines = source.split(/\n/);
        var start = Math.max(line - 3, 0);
        var end = Math.min(lines.length, line + 3);

        // Error context
        var context = lines.slice(start, end).map(function (code, index) {
            var number = index + start + 1;
            var left = number === line ? ' >> ' : '    ';
            return '' + left + number + '| ' + code;
        }).join('\n');

        // Alter exception message
        return (path || 'anonymous') + ':' + line + ':' + column + '\n' + (context + '\n\n') + (name + ': ' + message) + (generated ? '\n   generated: ' + generated : '');
    }

    //module.exports.TemplateError = TemplateError;
    global.TemplateError = TemplateError;

    // part 12. from compile/index.js
    /**
     * @return {function}
     */
    var compile = function compile(source) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (typeof source !== 'string') {
            options = source;
        } else {
            options.source = source;
        }

        options = defaults.$extend(options);
        source = options.source;

        /* istanbul ignore if */
        if (options.debug === true) {
            options.cache = false;
            options.minimize = false;
            options.compileDebug = true;
        }

        if (options.compileDebug) {
            options.minimize = false;
        }

        if (options.filename) {
            options.filename = options.resolveFilename(options.filename, options);
        }

        var filename = options.filename;
        var cache = options.cache;
        var caches = options.caches;

        if (cache && filename) {
            var _render = caches.get(filename);
            if (_render) {
                return _render;
            }
        }

        if (!source) {
            try {
                source = options.loader(filename, options);
                options.source = source;
            } catch (e) {
                var error = new TemplateError({
                    name: 'CompileError',
                    path: filename,
                    message: 'template not found: ' + e.message,
                    stack: e.stack
                });

                if (options.bail) {
                    throw error;
                } else {
                    return debugRender(error, options);
                }
            }
        }

        var fn = void 0;
        var compiler = new Compiler(options);

        try {
            fn = compiler.build();
        } catch (error) {
            error = new TemplateError(error);
            if (options.bail) {
                throw error;
            } else {
                return debugRender(error, options);
            }
        }

        var render = function render(data, blocks) {
            try {
                return fn(data, blocks);
            } catch (error) {
                if (!options.compileDebug) {
                    options.cache = false;
                    options.compileDebug = true;
                    return compile(options)(data, blocks);
                }

                error = new TemplateError(error);

                if (options.bail) {
                    throw error;
                } else {
                    return debugRender(error, options)();
                }
            }
        };

        render.mappings = fn.mappings;
        render.sourcesContent = fn.sourcesContent;
        render.toString = function () {
            return fn.toString();
        };

        if (cache && filename) {
            caches.set(filename, render);
        }

        return render;
    };

    compile.Compiler = Compiler;
    //module.exports = compile;
    global.compile = compile;

    //part 13. from render.js
    /**
     */
    var render = function render(source, data, options) {
        return compile(source, options)(data);
    };

    //part 14. from template.js
    /**
     */
    var _template = function template(filename, content) {
        return content instanceof Object ? render({
            filename: filename
        }, content) : compile({
            filename: filename,
            source: content
        });
    };

    _template.render = render;
    _template.compile = compile;
    _template.defaults = defaults;

    template = _template;

}(global);

exports.compile = function (tmpl, data) {
    return template.compile(tmpl)(data)
};