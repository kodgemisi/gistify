;(function ($) {

'use strict';

// var ACE_LIB_URL = 'https://cdn.jsdelivr.net/ace/1.2.0/noconflict/ace.js';
var ACE_LIB_URL = 'https://cdn.jsdelivr.net/ace/1.2.0/min/ace.js';
var cssUrl = 'gistify.css';
// var aceLibraryModelistUrl = 'https://raw.github.com/ajaxorg/ace/bc745dc90875152b8c82d283ad0e0361ad5ad27c/lib/ace/ext/modelist.js';
var GIST_API_URL = 'https://api.github.com/gists';
var modelist;//ace extension to decide highlight mode by file name
var aceIsAvailable = false;
var loadingHtml = '<div class="gistify-loading"><img src="https://a248.e.akamai.net/assets.github.com/images/spinners/octocat-spinner-64.gif" alt="' + localize('Yükleniyor...') + '"></div>';
var modeSelectHtml = '<select class="gistify-mode-select" size="1"><option value="abap">ABAP</option><option value="asciidoc">AsciiDoc</option><option value="c9search">C9Search</option><option value="coffee">CoffeeScript</option><option value="coldfusion">ColdFusion</option><option value="csharp">C#</option><option value="css">CSS</option><option value="curly">Curly</option><option value="dart">Dart</option><option value="diff">Diff</option><option value="dot">Dot</option><option value="ftl">FreeMarker</option><option value="glsl">Glsl</option><option value="golang">Go</option><option value="groovy">Groovy</option><option value="haxe">haXe</option><option value="haml">HAML</option><option value="html">HTML</option><option value="c_cpp">C/C++</option><option value="clojure">Clojure</option><option value="jade">Jade</option><option value="java">Java</option><option value="jsp">JSP</option><option value="javascript">JavaScript</option><option value="json">JSON</option><option value="jsx">JSX</option><option value="latex">LaTeX</option><option value="less">LESS</option><option value="lisp">Lisp</option><option value="scheme">Scheme</option><option value="liquid">Liquid</option><option value="livescript">LiveScript</option><option value="logiql">LogiQL</option><option value="lua">Lua</option><option value="luapage">LuaPage</option><option value="lucene">Lucene</option><option value="lsl">LSL</option><option value="makefile">Makefile</option><option value="markdown">Markdown</option><option value="mushcode">TinyMUSH</option><option value="objectivec">Objective-C</option><option value="ocaml">OCaml</option><option value="pascal">Pascal</option><option value="perl">Perl</option><option value="pgsql">pgSQL</option><option value="php">PHP</option><option value="powershell">Powershell</option><option value="python">Python</option><option value="r">R</option><option value="rdoc">RDoc</option><option value="rhtml">RHTML</option><option value="ruby">Ruby</option><option value="scad">OpenSCAD</option><option value="scala">Scala</option><option value="scss">SCSS</option><option value="sass">SASS</option><option value="sh">SH</option><option value="sql">SQL</option><option value="stylus">Stylus</option><option value="svg">SVG</option><option value="tcl">Tcl</option><option value="tex">Tex</option><option value="text" selected>Text</option><option value="textile">Textile</option><option value="tmsnippet">tmSnippet</option><option value="toml">toml</option><option value="typescript">Typescript</option><option value="vbscript">VBScript</option><option value="velocity">Velocity</option><option value="xml">XML</option><option value="xquery">XQuery</option><option value="yaml">YAML</option></select>';

var metaForCreate = '\
  <div class="gistify-meta gistify-meta-create">\
    <div class="gistify-filename-input-container">\
      <a href="#" class="mini-icon mini-icon-remove-close gistify-remove-button"></a>\
      <input class="gistify-filename" type="text" placeholder="'+ localize('Dosyayı adlandırın...') +'">\
    </div>\
    <div class="gistify-filename-select-container">' + modeSelectHtml + '</div>\
  </div>';

var metaForShow = '\
  <div class="gistify-meta gistify-meta-show">\
    <span class="mini-icon mini-icon-show mini-icon-gist"></span>\
    <span class="gistify-filename"></span>\
    <div class="gistify-file-actions">\
      <span class="gistify-language"></span>\
      <ul class="gistify-button-group">\
        <li><a href="" target="_blank" class="gistify-permalink" original-title="Permalink"><span class="mini-icon mini-icon-show mini-icon-link"></span></a></li>\
        <li><a href="" target="_blank" class="gistify-raw-url" original-title="View Raw"><span class="mini-icon mini-icon-show mini-icon-code"></span></a></li>\
      </ul>\
    </div>\
  </div>';

var DESC_TEMPLATE = '\
<div class="gistify-size-determiner">\
  <div class="gistify-bubble">\
    <div class="gistify-gist-desc-container">\
      <textarea class="gistify-gist-desc" placeholder="Gist açıklaması...">{{content}}</textarea>\
    </div>\
  </div>\
</div>'

var FILE_TEMPLATE = '<div class="gistify-file" style="height: {{height}};"></div>'

// CSS injection
if($('#gistify-style').length == 0){
  $('<link id="gistify-style" rel="stylesheet" type="text/css" href="' + cssUrl + '"></link>').appendTo('head');
}
else{
  console.warn('An element with id "#gistify-style" is already present, gistify stylesheet won\'t be loaded!');
}

// Load ace if not defined
if(typeof window.ace != 'object'){
  $.ajax({
    type: "GET",
    url: ACE_LIB_URL,
    dataType: "script",
    cache: true,
    success: function() {
      console.log('ACE ready');

      loadModeList(function() {
        modelist = ace.require('ace/ext/modelist');//https://github.com/ajaxorg/ace/pull/1348
        aceIsAvailable = true;
      });
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error(jqXHR, textStatus, errorThrown);
      console.error('ACE library download failed.');
      throw new GistifyError('ACE library could not be loaded, cannot proceed without it!');
    }
  });
}

// Custom error
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
function GistifyError(message) {
  this.name = 'GistifyError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
GistifyError.prototype = Object.create(Error.prototype);
GistifyError.prototype.constructor = GistifyError;

/* Represents a `gist` which may have multiple files.
 * 
 * @param   element native DOM element to which the gist editor will render
 * @param   <optional> options object passed to jquery plugin function as $.gistify(options)
 */
function Gist(element, options) {

  // Keep target element intact and use an inner div as main element
  this.$element = $('<div>').appendTo($(element).empty());
  this.element = this.$element[0];
  
  this.options = options;
  this.initialized = false;

  // This next line takes advantage of HTML5 data attributes
  // to support customization of the plugin on a per-element
  // basis. For example,
  // <div class=item' data-options='{"message":"Goodbye World!"}'></div>
  this.metadata = this.$element.data( "options" );

}

Gist.prototype = {
  defaults: {
    mode: 'create', // first run: 'create' | 'show' | 'edit' # not first run: 'save' | 'get'
    description: false,
    height: '300px',
    width: '100%',
    theme: 'github',
    aceOptions: {

    }
  },

  availableCommands: ['save', 'edit'],

  init: function() {

    // Avoid accidental re-initialization
    if(this.initialized) {
      throw new GistifyError('Already initialized!');
    }
    this.initialized = true;

    // Introduce defaults that can be extended either
    // globally or using an object literal.
    this.config = $.extend({}, this.defaults, this.options, this.metadata);

    var that = this;
    $.getJSON(GIST_API_URL + '/' + this.config.gistId , function(data) {
      data.time = (new Date()).getTime();
      that.data = data;

      waitForAceAndDo(that.render);

      function waitForAceAndDo(callback) {
        while(!aceIsAvailable){
          console.log('waiting for ace...');
          setTimeout(waitForAceAndDo, 200);
        }
        callback.call(that);
      }

    })
    .error(function(jqXHR,textStatus, errorThrown) {
      if(jqXHR.status == 404) {
        console.error('No such gist found.');
      }
      else {
        console.error(jqXHR,textStatus, errorThrown);
      }
    });

    return this;
  },

  execute: function (command) {

  },

  render: function (data) {

    // Set width of main container (target element)
    this.$element.css('width', this.config.width);

    // render description
    var processedTemplate = DESC_TEMPLATE.replace('{{content}}', this.data.description);
    this.$element.empty().append(processedTemplate);

    // render each file
    for (var fileName in this.data.files) {
      if (this.data.files.hasOwnProperty(fileName)) {
        var file = this.data.files[fileName];
        processedTemplate = FILE_TEMPLATE
                              .replace('{{height}}', this.config.height);

        var fielDomElement = $(processedTemplate).appendTo(this.$element).get(0);
        var editor = ace.edit(fielDomElement);
        var mode = modelist.getModeForPath(file.filename);
        editor.setValue(file.content, -1);
        editor.getSession().setMode(mode.mode);
        console.log(mode.mode)
        editor.setTheme('ace/theme/' + this.config.theme);
      }
    }

    // render footer
    // TODO
  }
}

// See: https://github.com/jquery-boilerplate/jquery-boilerplate/wiki/Handling-plugin-defaults-and-predefinitions#setting-plugin-defaults-globally
$['gistify'] = $.fn['gistify'] = function (options) {

  if(typeof options == 'string') { // Command handling

    if(this instanceof $){
      throw new GistifyError('You can\'t give commands via global plugin function. "$.gistify()" usage is available for only fault configuration passing.')
    }

    if(Gist.prototype.availableCommands.indexOf(options) < 0){
      throw new GistifyError('"' + options + '"' + ' is not a valid command, valid commands are: ' + Gist.prototype.availableCommands);
    }

    // Get the Gist object on the element and pass the command to it
    return this.each(function () {
      var gistObj = $.data(this, 'plugin_gistify');
      if (gistObj) {
        gistObj.execute(options);
      }
      else{
        throw new GistifyError('You can\'t execute a command on non-gistified element. You should gistify the element before calling $(element).gistify("command") ');
      }
    });

    return this; // Don't break method chaining
  }
  else{ // Plugin initialization

    // If called as `$.gistify({option: value})` extend/override default options
    if(!(this instanceof $)) {
      $.extend(Gist.prototype.defaults, options);
    }

    return this.each(function () {
      if (!$.data(this, 'plugin_gistify')) {
        $.data(this, 'plugin_gistify', new Gist(this, options).init());
      }
      else {
        console.warn(element, 'is already gistified, ignoring...');
      }
    });
  }

};

/**
* Placeholder localization function, to be implemented in future releases.
*/
function localize(string) {
  return string;
}

/** ==============================================================================================
  To prevent further network traffic ace editor's modelist plugin is embedded into gistify plugin
  Since this function abstracts the loading of modelist plugin,
it can be downloaded from ace's CDN urls if desired in the future
*/
function loadModeList(callback) {
  
  define("ace/ext/modelist",["require","exports","module"],function(e,t,n){"use strict";function i(e){var t=a.text,n=e.split(/[\/\\]/).pop();for(var i=0;i<r.length;i++)if(r[i].supportsFile(n)){t=r[i];break}return t}var r=[],s=function(e,t,n){this.name=e,this.caption=t,this.mode="ace/mode/"+e,this.extensions=n;if(/\^/.test(n))var r=n.replace(/\|(\^)?/g,function(e,t){return"$|"+(t?"^":"^.*\\.")})+"$";else var r="^.*\\.("+n+")$";this.extRe=new RegExp(r,"gi")};s.prototype.supportsFile=function(e){return e.match(this.extRe)};var o={ABAP:["abap"],ABC:["abc"],ActionScript:["as"],ADA:["ada|adb"],Apache_Conf:["^htaccess|^htgroups|^htpasswd|^conf|htaccess|htgroups|htpasswd"],AsciiDoc:["asciidoc|adoc"],Assembly_x86:["asm"],AutoHotKey:["ahk"],BatchFile:["bat|cmd"],C_Cpp:["cpp|c|cc|cxx|h|hh|hpp"],C9Search:["c9search_results"],Cirru:["cirru|cr"],Clojure:["clj|cljs"],Cobol:["CBL|COB"],coffee:["coffee|cf|cson|^Cakefile"],ColdFusion:["cfm"],CSharp:["cs"],CSS:["css"],Curly:["curly"],D:["d|di"],Dart:["dart"],Diff:["diff|patch"],Dockerfile:["^Dockerfile"],Dot:["dot"],Dummy:["dummy"],DummySyntax:["dummy"],Eiffel:["e"],EJS:["ejs"],Elixir:["ex|exs"],Elm:["elm"],Erlang:["erl|hrl"],Forth:["frt|fs|ldr"],FTL:["ftl"],Gcode:["gcode"],Gherkin:["feature"],Gitignore:["^.gitignore"],Glsl:["glsl|frag|vert"],golang:["go"],Groovy:["groovy"],HAML:["haml"],Handlebars:["hbs|handlebars|tpl|mustache"],Haskell:["hs"],haXe:["hx"],HTML:["html|htm|xhtml"],HTML_Ruby:["erb|rhtml|html.erb"],INI:["ini|conf|cfg|prefs"],Io:["io"],Jack:["jack"],Jade:["jade"],Java:["java"],JavaScript:["js|jsm"],JSON:["json"],JSONiq:["jq"],JSP:["jsp"],JSX:["jsx"],Julia:["jl"],LaTeX:["tex|latex|ltx|bib"],Lean:["lean|hlean"],LESS:["less"],Liquid:["liquid"],Lisp:["lisp"],LiveScript:["ls"],LogiQL:["logic|lql"],LSL:["lsl"],Lua:["lua"],LuaPage:["lp"],Lucene:["lucene"],Makefile:["^Makefile|^GNUmakefile|^makefile|^OCamlMakefile|make"],Markdown:["md|markdown"],Mask:["mask"],MATLAB:["matlab"],Maze:["mz"],MEL:["mel"],MUSHCode:["mc|mush"],MySQL:["mysql"],Nix:["nix"],ObjectiveC:["m|mm"],OCaml:["ml|mli"],Pascal:["pas|p"],Perl:["pl|pm"],pgSQL:["pgsql"],PHP:["php|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp"],Powershell:["ps1"],Praat:["praat|praatscript|psc|proc"],Prolog:["plg|prolog"],Properties:["properties"],Protobuf:["proto"],Python:["py"],R:["r"],RDoc:["Rd"],RHTML:["Rhtml"],Ruby:["rb|ru|gemspec|rake|^Guardfile|^Rakefile|^Gemfile"],Rust:["rs"],SASS:["sass"],SCAD:["scad"],Scala:["scala"],Scheme:["scm|rkt"],SCSS:["scss"],SH:["sh|bash|^.bashrc"],SJS:["sjs"],Smarty:["smarty|tpl"],snippets:["snippets"],Soy_Template:["soy"],Space:["space"],SQL:["sql"],SQLServer:["sqlserver"],Stylus:["styl|stylus"],SVG:["svg"],Tcl:["tcl"],Tex:["tex"],Text:["txt"],Textile:["textile"],Toml:["toml"],Twig:["twig"],Typescript:["ts|typescript|str"],Vala:["vala"],VBScript:["vbs|vb"],Velocity:["vm"],Verilog:["v|vh|sv|svh"],VHDL:["vhd|vhdl"],XML:["xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml"],XQuery:["xq"],YAML:["yaml|yml"],Django:["html"]},u={ObjectiveC:"Objective-C",CSharp:"C#",golang:"Go",C_Cpp:"C and C++",coffee:"CoffeeScript",HTML_Ruby:"HTML (Ruby)",FTL:"FreeMarker"},a={};for(var f in o){var l=o[f],c=(u[f]||f).replace(/_/g," "),h=f.toLowerCase(),p=new s(h,c,l[0]);a[h]=p,r.push(p)}n.exports={getModeForPath:i,modes:r,modesByName:a}});
  (function() {
      window.require(["ace/ext/modelist"], function() {});
  })();

  callback();
}//end of loadModeList

})(jQuery);
