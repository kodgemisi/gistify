;(function ($) {

'use strict';

// var ACE_LIB_URL = 'https://cdn.jsdelivr.net/ace/1.2.0/noconflict/ace.js';
var ACE_LIB_URL = 'https://cdn.jsdelivr.net/ace/1.2.0/min/ace.js';
var cssUrl = 'gistify.css';
// var aceLibraryModelistUrl = 'https://raw.github.com/ajaxorg/ace/bc745dc90875152b8c82d283ad0e0361ad5ad27c/lib/ace/ext/modelist.js';
var GIST_API_URL = 'https://api.github.com/gists';
var modelist;//ace extension to decide highlight mode by file name
var aceIsAvailable = typeof window.ace == 'object' && typeof window.ace.EditSession == 'function';
var loadingHtml = '<div class="gistify-loading"><img src="https://a248.e.akamai.net/assets.github.com/images/spinners/octocat-spinner-64.gif" alt="' + localize('Loading...') + '"></div>';

var GIST_404 = '<div class="gistify-404">\
<img alt="404 - Gist not found" height="249" width="271" src="data:image/png;base64,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" style="top: 76.6579px; left: 68.4125px;">\
<img alt="404 - Gist not found" height="230" width="188" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALwAAADmCAMAAABYgh8IAAAAA3NCSVQICAjb4U/gAAABgFBMVEX///9SOCxSOjH/wp8AAAD+wJ4ICAhWPjL/7tDMQjj////66834vZuZmZmVcl+bdmN7KCIxIRr39/dUQjpRS0nFQjhKMihptaVQRUEzJyAyIx46KSF8LSdAKyJSOCxUQjqcincQEBBSOjFSOjHzp4tSOCz/xqZSOjFkTEBUQjpSOjG7qJP/+PQpHhpSOjFSOjH87+jz4cRqUURDMSlTSURQRUFUQjr/1r//0bAaEg9UQjqHZFL/59nOTENTSURSOCyNfGojGhddV0wpKSnGl3yWlJKUh3d4YlM5OTkQEBDez7fLvKWdj4hzW0xIQj/05+bbp4nWZlZTSURTSURSOjFSOjHo17yMgn5+bFwZLSlWPjL358v/4sL5w6XWxKyJcmF3VkYhFxIzMzP86MynnIi1jHRXmYwhISEYGBhSOCwICAj50rvehn+SblqRMClWPjIICAgAAACLZWJAa2I2XVRRS0kQEBBUQjpLOC/xt5blqqWvhnBNh3spRD4ICAhWPjKmNNozAAAAgHRSTlMA////////////////////////RBH///8i///////uZv//d4j/3f+q/1WZ////Zrv/////IjN3////M////zPM//8RM/////8RiP////8R////EUTM7v////+7/////////yL/////RGa73f////+q7u7///8id5mq//////+q7kFCNkwAAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzQGstOgAAAgAElEQVR4nMVdh0PUyBo32U2C7gLC0vvCozcBQREbFlTUs/feFfXOe/q84on/+pv2lZkkm6x3nCNuSzL5zTe/r8zMl2TXrsTSNrny2/z8+PBgZX/yDv9e6Tp6rXKongMGPV0i+TI+eXWngGWUrsmpGxrGt2u5DxrxfIPel3++d2ywbQcxJpa2ym8DHit5hV9B6JGvP/q+P145saNgrdJWmcKeV/LzvBs5xXfds4togUDvfRv5l/hf+c3Xvc763/NWch3b5bFjtOhNB3jjR3cY965dhzTN7aJ0L5fo57CxrPHw4Vh+zfke5ILnvoNZ/+BH3mSeGqboCHV8RE2R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" style="top: 98.0744px; left: 355.35px;"></div>';

var DESC_TEMPLATE = {
  show: '\
<div class="gistify-description">\
  <div class="gistify-bubble">\
  <div class="gistify-gist-desc-container">\
    <div class="gistify-gist-desc">{{content}}</div>\
  </div>\
  </div>\
</div>',

  edit: '\
<div class="gistify-description">\
  <div class="gistify-bubble">\
  <div class="gistify-gist-desc-container">\
    <textarea class="gistify-gist-desc" placeholder="Gist description…" {{readonly}}>{{content}}</textarea>\
  </div>\
  </div>\
</div>'
};

var FILE_TEMPLATE = {
  show: '\
<div class="gistify-file">\
  <div class="gistify-file-header">\
  <span class="octicon gistify-icon-show octicon-gist"></span>\
  <span class="gistify-filename">{{fileName}}</span>\
  <ul class="gistify-button-group">\
    <li><a href="{{permalink}}" target="_blank" class="gistify-permalink" title="Permalink"><span class="octicon gistify-icon-show octicon-link"></span></a></li>\
    <li><a href="{{rawUrl}}" target="_blank" class="gistify-raw-url" title="View Raw"><span class="octicon gistify-icon-show octicon-code"></span></a></li>\
  </ul>\
  </div>\
  <div class="gistify-data"></div>\
</div>',

  edit: '\
<div class="gistify-file" data-file-name="{{fileName}}">\
  <div class="gistify-file-header-edit">\
  <span>\
    <input type="text" class="gistify-filename" value="{{fileName}}" placeholder="Filename including extension…" />\
    <button class="gistify-btn gistify-remove-btn"><span class="octicon gistify-icon-show octicon-trashcan"></span></button>\
  </span>\
  <ul class="gistify-button-group">\
    <li><a href="{{permalink}}" target="_blank" class="gistify-permalink" title="Permalink"><span class="octicon gistify-icon-show octicon-link"></span></a></li>\
    <li><a href="{{rawUrl}}" target="_blank" class="gistify-raw-url" title="View Raw"><span class="octicon gistify-icon-show octicon-code"></span></a></li>\
  </ul>\
  </div>\
  <div class="gistify-data"></div>\
</div>'
}

var FOOTER_TEMPLATE = '\
<div class="gistify-footer">\
  <button class="gistify-new-btn gistify-btn">' + localize('New File') + ' </button>\
  <button class="gistify-token-btn gistify-btn">' + localize('Set Github token') + '&nbsp;&nbsp;&nbsp;<span class="octicon octicon-stop"></span></button>\
  <a href="https://github.com/settings/tokens" target="_blank" title="Get token from Github" class="gistify-token-create gistify-btn"><span class="octicon gistify-icon-show octicon-shield"></span></a>\
  <a href="http://kodgemisi.github.io/gistify/token-help.html" target="_blank" title="Help about tokens" class="gistify-token-help gistify-btn"><span class="octicon gistify-icon-show octicon-light-bulb"></span></a>\
  <button class="gistify-save-btn gistify-btn gistify-btn-primary">{{action}}</button>\
</div>'

// Load ace if not defined
if(!aceIsAvailable){
  $.ajax({
    type: "GET",
    url: ACE_LIB_URL,
    dataType: "script",
    cache: true,
    success: function() {
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

  this.$target = $(element);

  // Keep target element intact and use an inner div as main element
  this.$element = $('<div class="gistify-wrapper">').appendTo($(element).empty());
  this.element = this.$element[0];
  
  this.options = options;
  this.initialized = false;

  // This next line takes advantage of HTML5 data attributes
  // to support customization of the plugin on a per-element
  // basis. For example,
  // <div class=item' data-options='{"message":"Goodbye World!"}'></div>
  this.metadata = {}
  this.metadata.gistId = this.$target.data("gist-id");
  this.metadata.mode = this.$target.data("gistify-mode");
  this.metadata.description = this.$target.data("gistify-description");
  this.metadata.theme = this.$target.data("gistify-theme");
  this.metadata.width = this.$target.data("gistify-width");
  this.metadata.height = this.$target.data("gistify-height");
  this.metadata.files = this.$target.data("gistify-files");
  this.metadata.showSimple = this.$target.data("gistify-simple");
}

Gist.prototype = {
  defaults: {
    mode: '', // 'create' | 'show' | 'edit'. Note that if 'gistId' is present then 'show' is default, if 'gistId' is not present 'create' is default
    description: false, // description: false by default and only effective in show mode
    showSimple: false, // shows the gists without headers. Only effective in show mode
    files: null, // comma separated list of file names. Only meaningful in show mode. Note that the order of files shown can be changed via this option.
    height: '',
    width: '100%',
    theme: 'github',
    aceOptions: {
      maxLines: Infinity,
      fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
      fontSize: '12px'
    },
    onGistCreated: null,
    onGistUpdated: null
  },

  availableCommands: ['save', 'edit'],

  init: function() {

    var gist = this;
    function waitForAceAndDo(callback) {
      if(!aceIsAvailable){ //  this is a plugin-global variable because there may be multiple instances of gists
        console.log('Gistify: waiting for ACE...');
        setTimeout(waitForAceAndDo, 200, callback);
        return;
      }
      callback.call(gist);
    }

    // Avoid accidental re-initialization
    if(this.initialized) {
      throw new GistifyError('Already initialized!');
    }
    this.initialized = true;

    this.config = {};

    // call this before reading options so that
    // options can override it
    this.restoreToken();

    // Introduce defaults that can be extended either
    // globally or using an object literal.
    this.config = $.extend(this.config, this.defaults, this.options, this.metadata);

    // set default mode
    if(!this.config.mode){
      if(this.config.gistId) {
        this.config.mode = 'show';
      }
      else {
        this.config.mode = 'create';
      }
    }

    // set minLines property for 'create' and 'edit' modes
    if(this.config.mode != 'show') {
      this.config.aceOptions.minLines = 13;
    }

    // have files option as array in all times
    if(typeof this.config.files == 'string') {

      this.config.files = this.config.files.split(',');

      // clear empty elements
      var filesArray = this.config.files;
      this.config.files = $.grep(this.config.files, function (element, index) {
        element = element.trim();
        filesArray[index] = filesArray[index].trim();

        return element.length > 0;
      });
    }

    // options validation
    // ==================
    var possibleModes = ['show', 'create', 'edit'];
    if(possibleModes.indexOf(this.config.mode) < 0){
      throw new GistifyError('"' + this.config.mode + '" is not a valid mode, possible modes are: ' + possibleModes.join(', '));
    }

    if(this.config.mode == 'create' && this.config.gistId){
      throw new GistifyError('Having "gistId" in "create" mode is meaningless!');
    }

    if(this.config.mode != 'create' && !this.config.gistId){
      throw new GistifyError('You need to specify a "gistId" in "show" and "edit" modes!');
    }

    if(this.config.files && this.config.files.length && this.config.mode != 'show') {
      throw new GistifyError('Having "files" is meaningful only in "show" mode!');
    }

    // this loading will be removed by render() funtion via `this.$element.empty()`
    var $loadingGif = $(loadingHtml).appendTo(this.$element);

    if(this.config.mode != 'create') {

      $.ajax({
        url: GIST_API_URL + '/' + this.config.gistId,
        dataType: 'json',
        cache: false,
        success: function(data) {
          data.time = (new Date()).getTime();
          gist.data = data;

          waitForAceAndDo(gist.render);
        },
        error: function(jqXHR,textStatus, errorThrown) {
          if(jqXHR.status == 404) {
            console.error('No such gist found.');
            $loadingGif.replaceWith(GIST_404);
          }
          else {
            console.error(jqXHR,textStatus, errorThrown);
          }
        }
      });
    }
    else {
      waitForAceAndDo(this.render);
    }

    return this;
  },

  execute: function (command) {
    // TODO js api
  },

  reRender: function () {
    this.$element.empty();
    this.render();
  },

  render: function () {

    // avoid accidental re-rendering
    if(this.$element.find('.gistify-file').size()) {
      throw new GistifyError('This Gist is already rendered!');
    }

    var readonly = this.config.mode == 'show';

    // edit and create modes uses the same template
    var templateMode = this.config.mode == 'show' ? 'show' : 'edit';

    // bind events
    // `gistify.numberOfFilesChanged` should be binded before `addFile`
    // so all bindings done here in sake of grouping
    this.$element.off();
    this.$element.on('click', '.gistify-remove-btn', this, this.onDeleteFile);
    this.$element.on('click', '.gistify-new-btn', this, this.onNewFile);
    this.$element.on('click', '.gistify-save-btn', this, this.onSaveOrUpdate);
    this.$element.on('click', '.gistify-token-btn', this, this.onSetToken);
    this.$element.on('change', '.gistify-filename', this, this.onFileNameChanged);
    this.$element.on('gistify.numberOfFilesChanged', this, this.onNumberOfFilesChanged);
    this.$element.on('gistify.tokenChanged', this, this.onTokenChanged);
    
    // Set width of main container (target element)
    this.$element.css('width', this.config.width);

    this.$element.empty();

    this.$element.append('<div class="gistify-pivot">');

    // render description
    // if not in readonly mode then the description should be edeitable
    if(this.config.description || !readonly) {
      var description = this.data && this.data.description ? this.data.description : ''; // in create mode data is undefined 
      var processedTemplate = DESC_TEMPLATE[templateMode]
                  .replace('{{readonly}}', readonly ? 'readonly' : '')
                  .replace('{{content}}', description);

      this.$element.prepend(processedTemplate); // leave gistify-pivot the last element before the footer
    }

    // render the editor(s)
    // --------------------
    if(this.config.mode == 'create') {
      this.addFile(this.config.mode, {});
    }
    else { // then there is data to be rendered
      
      // select file to be rendered
      var fileNamesToRender = this.config.mode == 'show' && this.config.files && this.config.files.length
                              ? this.config.files
                              : Object.keys(this.data.files);

      // render each file
      for (var i in fileNamesToRender) {
        var fileName = fileNamesToRender[i];
        if (this.data.files.hasOwnProperty(fileName)) {
          var file = this.data.files[fileName];
          this.addFile(this.config.mode, file);
        }
      }
    }
    
    // render footer
    if(!readonly) {
      var btnAction = this.config.mode == 'create' ? localize('Save') : localize('Update');
      this.$element.append(FOOTER_TEMPLATE.replace('{{action}}', btnAction)); // leave gistify-pivot the last element before the footer
    }

    this.$element.trigger('gistify.numberOfFilesChanged');

    // Triggger tokenChanged here on behalf of 'restoreToken' because restoreToken's
    // event couldn't be processed since back then there were no rendered element.
    this.$element.trigger('gistify.tokenChanged');
  },

  addFile: function (mode, file) {

    var readonly = this.config.mode == 'show';

    // edit and create modes uses the same template
    var templateMode = this.config.mode == 'show' ? 'show' : 'edit';

    var processedTemplate = FILE_TEMPLATE[templateMode]
              .replace(/{{fileName}}/g, file.filename || '')
              .replace('{{rawUrl}}', file.raw_url || '#')
              .replace('{{permalink}}', (this.data && this.data.html_url ? this.data.html_url : '#'));

    var appendTarget = this.$element.find('.gistify-pivot');

    var $fileDomElement = $(processedTemplate).insertBefore(appendTarget);

    // handle showSimple
    if(this.config.mode == 'show' && this.config.showSimple) {
      $fileDomElement.find('.gistify-file-header').remove();
    }

    var editor = ace.edit($fileDomElement.find('.gistify-data').get(0));
    
    if(mode != 'create') {// in edit and show modes
      var editorMode = modelist.getModeForPath(file.filename);
      editor.getSession().setMode(editorMode.mode);
      editor.setValue(file.content, -1);
    }
    
    if(readonly) {
      editor.getSession().setOption("useWorker", false);
    }

    editor.setReadOnly(readonly);
    editor.setOptions(this.config.aceOptions);
    editor.setTheme('ace/theme/' + this.config.theme);
    editor.renderer.setScrollMargin(10, 10);

    $.data($fileDomElement[0], 'gistify-aceEditor', editor);
  },

  onSaveOrUpdate: function (e) {
    var gist = e.data;

    if(gist.config.mode == 'edit' && !gist.config.githubToken) {
      alert('You need to set your Github token to update gists.');
      return;
    }

    if(gist.config.githubToken || confirm('You are creating an anonymous gist. Continue?')) {
      
      var headers = gist.config.githubToken ? {'Authorization': 'token ' + gist.config.githubToken} : null;
      var httpMethod = gist.config.mode == 'create' ? 'post' : 'patch';
      var url = gist.config.mode == 'create' ? GIST_API_URL : GIST_API_URL + '/' + gist.config.gistId;
      
      // show loading
      var loadingGif = $(loadingHtml).appendTo(gist.$element);

      $.ajax({
        type: httpMethod,
        url: url,
        headers: headers,
        data: JSON.stringify(gist.toObject()),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        cache: false,
        success: function (data, textStatus, jqXHR) {
          var id = data.id;

          delete data['forks'];
          delete data['history'];
          delete data['owner'];

          // if the gist is created then re-render in edit mode
          if(gist.config.mode == 'create') {
            gist.config.mode = 'edit';

            // invoke onGistCreated callback if defined
            if(typeof gist.config.onGistCreated == 'function') {
              gist.config.onGistCreated.call(gist, data);
            }

            alert(localize('Gist created.'));
          }
          else {
            // invoke onGistUpdated callback if defined
            if(typeof gist.config.onGistUpdated == 'function') {
              gist.config.onGistUpdated.call(gist, data);
            }

            alert(localize('Gist updated.'));
          }
         
          gist.data = data;
          gist.config.gistId = data.id;

          // clear deleted files
          delete gist.deleted;

          // even if it's in edit mode and just updated, re-render to avoid complex
          // internal data sync operations
          gist.reRender();

        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error(jqXHR, textStatus, errorThrown);
          if(gist.config.mode == 'edit') {
            alert('Error: Gist couldn\'t be updated!\n\n\
             • Is it an anonymous gist?\n\
             • Did you define the right Github token?');
          }
          else {
            alert('Error: Gist couldn\'t be saved!');
          }
        },
        complete: function () {
          loadingGif.remove();
        }
      });
    }
  },

  onNewFile: function (e) {
    var gist = e.data;
    gist.addFile('create', {});
    gist.$element.trigger('gistify.numberOfFilesChanged');
  },

  onDeleteFile: function (e) {
    var gist = e.data;

    if(confirm('Delete this file?')) {
      $(this).closest('.gistify-file').remove();
      gist.$element.trigger('gistify.numberOfFilesChanged');

      var originalFileName = $(this).closest('.gistify-file').data('file-name');
      
      // if this file is not local, then remember that it's deleted
      if(gist.config.mode == 'edit' && gist.data.files[originalFileName]) {
        gist.deleted = gist.deleted || [];
        gist.deleted.push(originalFileName);
      }

    }
  },

  onNumberOfFilesChanged: function (e) {
    var gist = e.data;
    
    // if only 1 file left, hide remove btns
    if(gist.$element.find('.gistify-file').size() == 1) {
      $('.gistify-remove-btn').hide();
    }
    else {
      $('.gistify-remove-btn').show();
    }
  },

  onSetToken: function (e) {
    var gist = e.data;
    var defaultValue = gist.config.githubToken;
    var newToken = prompt('Enter your personal Github token:\n\n⚠ Token should include "gist" permission.', defaultValue);
    
    // Allow user to remove token by writing explicitly null
    newToken = (newToken == 'null' ? undefined : newToken);

    gist.config.githubToken = newToken || newToken === undefined ? newToken : gist.config.githubToken;

    localStorage.setItem('gistify.token', gist.config.githubToken);

    gist.$element.trigger('gistify.tokenChanged');
  },

  onTokenChanged: function (e) {
    var gist = e.data;

    var title = gist.config.githubToken ? localize('Token is set') : localize('Token is NOT set');
    var iconClass = gist.config.githubToken ? 'octicon-check' : 'octicon-stop';

    var $tokenIcon = gist.$element.find('.gistify-token-btn .octicon').attr('title', title);
    $tokenIcon.removeClass('octicon-check octicon-stop').addClass(iconClass);
  },

  onFileNameChanged: function (e) {
    var gist = e.data;

    e.target.value = e.target.value.trim();
    var editorMode = modelist.getModeForPath(e.target.value);
    var aceEditor = $.data($(e.target).closest('.gistify-file')[0], 'gistify-aceEditor');
    aceEditor.getSession().setMode(editorMode.mode);
  },

  restoreToken: function () {
    if(this.config.githubToken) {
      throw new GistifyError('restoreToken called when token is already set!');
    }

    this.config.githubToken = localStorage.getItem('gistify.token');

    this.config.githubToken = (this.config.githubToken && this.config.githubToken.length < 20)
                              || this.config.githubToken === null
                              ? undefined
                              :this.config.githubToken;
    
    // This event would be missed because it's called from init() where
    // the rendering doesn't even start 
    // this.$element.trigger('gistify.tokenChanged');
  },

  toObject: function () {
    var files = {};

    var fileRepresentitiveDomElements = this.$element.find('.gistify-file').toArray();
    for(var i in fileRepresentitiveDomElements){
      var item = fileRepresentitiveDomElements[i];
      var $item = $(item);
      var file = {};

      var aceEditor = $.data($item[0], 'gistify-aceEditor');
      file.content = aceEditor.getValue();

      var fileName = $item.find('.gistify-filename').val().trim();
      fileName = fileName.length ? fileName : localize('New file ' + i);

      // handle rename, see https://developer.github.com/v3/gists/#edit-a-gist
      var originalFileName = $item.data('file-name');
      if(this.config.mode == 'edit' && originalFileName != fileName) {
        file.filename = fileName;
        fileName = originalFileName;
      }

      files[fileName] = file;
    }

    // add deleted files
    if(this.deleted) {
      for (var i = this.deleted.length - 1; i >= 0; i--) {
        var deletedFilename = this.deleted[i];
        files[deletedFilename] = null;
      };
    }

    return {
      'description': this.$element.find('.gistify-gist-desc').val(),
      'public': true,
      'files': files
    };

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
        console.warn(this, 'is already gistified, ignoring...');
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
