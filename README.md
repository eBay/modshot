# modshot [![Build Status](https://travis-ci.org/eBay/modshot.svg)](https://travis-ci.org/eBay/modshot)
modshot is a CLI utility that captures screenshots (png image) of UI modules and compares with an existing baseline image. If a baseline is not present, a new baseline is created. It is a warpper on top [PhantomCSS](https://github.com/Huddle/PhantomCSS), to provide an easy mechanism for visual regression. 

## Usage

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
