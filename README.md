# Homey Development Kit

Create Homey apps without any effort!

### Usage
*Want to create Homey apps? This is probably what you want*

Download a pre-built version from https://developers.athom.nl

### Run instructions (for editor development only)
Download a pre-built nw.js binary from http://nwjs.io, and execute `run.sh` in you're on OS X. Otherwise, you're on your own ;)

### Build instructions

1. clone this repo ```git clone https://github.com/athombv/devkit.git```
2. cd to the directory ```cd devkit```
3. install the node packages ```npm install```
4. install the bower packages ```cd www; bower install; cd ..```
5. install node-webkit-builder ```npm install node-webkit-builder -g```
6. run ```nwbuild .``` in the directory of this repository
7. find your build in the ```./build``` directory

### Docs
_this will be improved over time_

The editor can load a **project** (directory), and reads the **app.json** file from it. When a file is opened, the file path (directory names + filename + extension) is parsed, and **custom views** will be opened accordingly. A view can be an **editor** (defaults to CodeMirror) or **one or more widgets** (defaults to none).

These views make editing easier. For example, when a .svg file is loaded, a preview widget is shown. When a LED ring animation is opened, a LED ring simulator is shown.