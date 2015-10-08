# modshot [![Build Status](https://travis-ci.org/eBay/modshot.svg)](https://travis-ci.org/eBay/modshot)
modshot is a CLI utility that captures screenshots (png image) of UI modules and compares with an existing baseline image. If a baseline is not present, a new baseline is created. It is a warpper on top of [PhantomCSS](https://github.com/Huddle/PhantomCSS), to provide an easy mechanism for visual regression. 

modshot scans your project directory looking for `HTML` files. If a file is found loads it with [PhantomJS](http://phantomjs.org/), takes a screenshot and puts them in a `screenshots` directory adjacent to the HTML file. modshot assumes that you follow a modular UI architecture, where each of the UI component lives in its own directory along with the test files and mock HTML. 

## Usage
Install modshot
```
$ npm install -g spofcheck
```
To run modshot
```
modshot [options]*

Options:
--in-dir | -i       The input directory to recurse and fetch the HTML files. Uses current directory if not specified
--selectors | -s    A list of selectors to be applied on the HTML files
--exclude | -e      Paths|files|directories to be excluded. node_modules excluded by default.
                    A list can be provided -e test -e dist
--tolerance | -t    Mismatch tolerance percentage. Defaults to  0.05%
--help | -h         Displays this information
```
Example
```
modshot -i src/ui-modules -s .box -s .test -e temp
```
Running `modshot` with no options, uses the current directory as the input directory

##Testing
The testing suite is available in the [test](https://github.com/eBay/modshot/tree/master/test) directory. To run the tests - clone/fork the [repo](https://github.com/eBay/modshot), 
install the package `$ npm install` and run
```
$ npm test
```

##Issues
Have a bug or a feature request? [Please open a new issue](https://github.com/eBay/modshot/issues)

##Author(s)
[Senthil Padmanabhan](http://senthilp.com/)

##License 
Copyright (c) 2015 eBay Inc.

Released under the MIT License
http://www.opensource.org/licenses/MIT
