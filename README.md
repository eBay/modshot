# modshot [![Build Status](https://travis-ci.org/eBay/modshot.svg)](https://travis-ci.org/eBay/modshot)
modshot is a CLI utility that captures screenshots (png image) of UI modules and compares with an existing baseline image. If a baseline is not present, a new baseline is created. It is a wrapper on top of [PhantomCSS](https://github.com/Huddle/PhantomCSS), to provide an easy mechanism for visual regression. 

modshot can operate in two modes

1. **Static HTML** - When provided with an input directory (check [usage](#usage) below), modshot recursively scans the directory looking for `HTML` files. If a file is found loads it with [PhantomJS](http://phantomjs.org/), takes a screenshot and puts them in a `screenshots` directory adjacent to the HTML file. For subsequent runs, these screenshots are used as baselines. modshot assumes that you follow a [modular UI architecture](http://www.ebaytechblog.com/2014/10/02/dont-build-pages-build-modules/), where each of the UI component lives in its own directory along with the test files and mock HTML. 
2. **URL** - When a URL is provided (check [usage](#usage) below), modshot loads the URL with PhantomJS, takes a screenshot (or multiple screenshots if selectors are provided) and puts them in the provided output directory. For subsequent runs, these screenshots are used as baselines. It is advised to provide CSS selectors of modules as option, so module screenshots are taken instead of the whole page.

If both modes (static HTML & URL) are provided, modshot starts both of them in parallel. If a modshot run fails, but the UI change was intentional, then the developer has to manually delete the baseline. modshot will create a new baseline in the next run.
 
## Usage
Install modshot
```
$ npm install -g modshot
```
To run modshot
```
USAGE modshot [options]*

Options:
--in-dir | -i       The input directory to recurse and fetch the HTML files. 
                    Uses current working directory if not specified
--url | -u          The web page URL to take screenshots
--out-dir | -o      The output directory to save the screenshots. 
                    Optional when an input directory is provided, as screenshots are saved adjacent to the HTML files.
                    When a URL is provided and output directory is missing, current working directory is used as output directory
--selectors | -s    A list of selectors to be applied on the HTML files or URL
--exclude | -e      Paths|files|directories to be excluded. node_modules excluded by default.
                    A list can be provided -e test -e dist
--tolerance | -t    Mismatch tolerance percentage. Defaults to  0.05%
--help | -h         Displays this information
```
**Example 1:**
```
modshot -i src/ui-modules -s .box -s .test -e temp
```
**Example 2:**
```
modshot -u http://pages.ebay.com/sitemap.html -s h1 -s .btn -o screenshots
```
**Example 3:**
```
modshot -i src/ui-modules -u http://pages.ebay.com/sitemap.html -o screenshots -t 15
```
Running `modshot` with no options, uses the current directory as the input directory and scans for static HTML files.

##Testing
The testing suite is available in the [test](https://github.com/eBay/modshot/tree/master/test) directory. To run the tests - clone/fork the [repo](https://github.com/eBay/modshot), 
install the package `$ npm install` and run
```
$ npm test
```

##Issues
Have a bug or a feature request? [Please open a new issue](https://github.com/eBay/modshot/issues)

##Author
[Senthil Padmanabhan](http://senthilp.com/)

##License 
Copyright (c) 2015 eBay Inc.

Released under the MIT License
http://www.opensource.org/licenses/MIT
