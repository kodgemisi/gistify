# Gistify Github Gist jQuery Plugin

TLDR; See it in action: [Demo](http://kodgemisi.github.io/gistify/demo.html)

## What?

Gistify is a jQuery plugin which enables you to 

* embed
* create
* modify

gists on any website.

## Why?

* Embedding gists via scripts provided by Github doesn't let you **customize** and **edit** gists
* There is no easy way to **create** gists from your site

## How?

Include `gistify.js` and `gistify.css` to your page.

There are 3 modes of Gistify:

* `show` mode to embed a gist
* `create` mode to create a gist
* `edit` mode to modify an existing gist

### Show mode

```
<div id="target" data-gist-id="<gist_id>"></div>

$('#target').gistify()
```

or you can use javascript options

```
<div id="target"></div>

$('#target').gistify({
	gistId: '<gist_id>'
})
```

### Create mode

```
<div id="target"></div>

$('#target').gistify()
```

### Edit mode

```
<div id="target" data-gist-id="<gist_id>" data-gistify-mode="edit"></div>

$('#target').gistify()
```

or you can use javascript options

```
<div id="target"></div>

$('#target').gistify({
	gistId: '<gist_id>',
	mode: 'edit'
})
```


## License

Licensed under _Mozilla Public License Version 2.0._

* You can use this plugin in a `closed source` software without modification.
* You can make modifications on this plugin's source and use this **plugin internally** without releasing to public or third parties.
* You can make modifications on this plugin's source and use this plugin **publicly** as long as you license the modified version with the same license (hence providing source code publicly)

[Details of modified version usage](https://www.mozilla.org/en-US/MPL/2.0/#distribution-of-source-form)

Copyright © 2015 Kod Gemisi Ltd