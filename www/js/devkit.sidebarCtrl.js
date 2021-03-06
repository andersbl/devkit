var path 		= require('path');

var open		= require("open");
var fs			= require('fs-extra')
var trash		= require('trash');

app.controller("sidebarCtrl", function($scope, $rootScope, $timeout) {
	
	$scope.filetree = {};
	$scope.selected = [];
	$scope.expanded = [];
	
	$rootScope.$on('project.loaded', function(){
		
		// watch for any changes in the directory
		// TODO: this is slow
		
		fs.watch( $rootScope.project.path, function(){
			$scope.update();
		});

		$scope.update();
	
	});
	
	$scope.select = function( event, path ){
		
		// multiple selection
		if( event.metaKey || event.ctrlKey ) {
			
			if( $scope.selected.indexOf(path) > -1 ) {
				$scope.selected = $scope.selected.filter(function(path_){
					return path_ != path;
				});
			} else {
				$scope.selected.push( path );
			}
		} else {
			$scope.selected = [ path ];
		}
		
	}
	
	$scope.isSelected = function( path ) {
		return $scope.selected.indexOf(path) > -1;
	}
	
	$scope.expand = function( path ){
		
		// check if already expanded
		var index = $scope.expanded.indexOf(path);
		if( index > -1  ) {
			$scope.expanded.splice(index, 1);
		} else {
			$scope.expanded.push( path );
		}
		
	}
	
	$scope.isExpanded = function( path ) {
		return $scope.expanded.indexOf(path) > -1;		
	}
	
	// rename a file
	$scope.submitRename = function( item ){
		
		var currentPath = item.path;
		var itemFolder = path.dirname( item.path );
		var newPath = path.join( itemFolder, item.name );
		
		fs.rename( currentPath, newPath, function(){
			$scope.$apply(function(){
				item.renaming = false;				
			});
		});
		
		
	}
	
	// open a new file on sidebar click
	$scope.open = function( item ){
		
		if( fs.lstatSync( item.path ).isDirectory() ) {
			item.expanded = !item.expanded;
		} else {
			$rootScope.$emit('editor.open', item.path );
		}
	}
	
	$scope.keyPress = function( event, item ) {
		console.log( event, item );
	}
	
	
	$scope.update = function(){
		$timeout.cancel( $scope.updateTimeout );
		$scope.updateTimeout = $timeout(function(){
			$scope.filetree = readdirSyncRecursive( $rootScope.project.path, true );
		}, 100);
	}
	
	$scope.dropped = function( event, file, dropped_path ){
		
		var filename = path.basename( file.path );
		
		// if dropped on a file, get the file's parent folder
		if( fs.lstatSync(dropped_path).isFile() ) {
			var new_path = path.dirname( dropped_path );
		} else {
			var new_path = path.join( dropped_path, filename );
		}
		
		// prevent overwriting
		if( fs.existsSync( new_path ) ) {
			if( !confirm('Overwrite `' + filename + '`?') ) return;
		}
		
		fs.copy( file.path, new_path, {}, function(err){});
				
	}
	
	$scope.showCtxmenu = function( item, event ){
				
		// create context menu	
		var gui = require('nw.gui');
	
		// Create an empty menu
		var ctxmenu = new gui.Menu();
		
		// Add some items
		if( item ) {
		
			// multiple selection
			if( $scope.selected.indexOf(item.path) < 0 ) {
				if( event.metaKey || event.ctrlKey ) {
					$scope.selected.push( item.path );
				} else {
					$scope.selected = [ item.path ];
				}
			}
			
			ctxmenu.append(new gui.MenuItem({ label: 'Open', click: function(){
				
				$scope.selected.forEach(function( item_path ){
					$rootScope.$emit('editor.open', item_path );					
				});
				
			}}));
			ctxmenu.append(new gui.MenuItem({ label: 'Open With Default Editor', click: function(){
				$scope.selected.forEach(function( item_path ){
					open( item_path );
				});
			}}));
			ctxmenu.append(new gui.MenuItem({ label: 'Open File Location', click: function(){
				$scope.selected.forEach(function( item_path ){
					open( path.dirname( item_path ) );
				});
			}}));
			ctxmenu.append(new gui.MenuItem({ type: 'separator' }));
			ctxmenu.append(new gui.MenuItem({ label: 'Move to Trash...', click: function(){
				
				if( $scope.selected.length > 1 ) {
					if( confirm( "Are you sure you want to remove " + $scope.selected.length + " items to the trash?" ) ) {
						$scope.selected.forEach(function( item_path ){
							trash([ item_path ]);
						});
					}				
				} else {
					if( confirm( "Are you sure you want to remove `" + item.name + "` to the trash?" ) ) {
						trash([ item.path ]);
					}
				}
			}}));
			if( $scope.selected.length == 1 ) {
				ctxmenu.append(new gui.MenuItem({ label: 'Rename...', click: function(){
					$scope.$apply(function(){
						item.renaming = true;
					});
				}}));
			}
			ctxmenu.append(new gui.MenuItem({ label: 'Duplicate', click: function(){
				
				$scope.selected.forEach(function( item_path ){
					var new_path = newPath( item_path );
					
					var i = 2;
					while( fs.existsSync( new_path ) ) {
						new_path = newPath( item_path, i++ );
					}
									
					fs.copySync( item_path, new_path );
				});
				
			}}));
			ctxmenu.append(new gui.MenuItem({ type: 'separator' }));
		}
		ctxmenu.append(new gui.MenuItem({ label: 'New Folder', click: function(){		
			var newFolderName = 'Untitled Folder';			
			
			if( typeof item == 'undefined' ) {
				var folder = $rootScope.project.path;
			} else {
				var folder = item.path;
			}
			
			fs.ensureDir( path.join( folder, newFolderName) );
		}}));
		ctxmenu.append(new gui.MenuItem({ label: 'New File', click: function(){
			$scope.ctxmenu.newfile( item );
		} }));
		
		// Popup as context menu
		ctxmenu.popup( event.clientX, event.clientY );
	}
	
	$scope.ctxmenu = {
		newfile: function( item ){			
			
			var newFileName = 'Untitled File';
			
			if( typeof item == 'undefined' ) {
				var folder = $rootScope.project.path;
			} else {
				
				if( fs.statSync( item.path ).isFile() ) {
					var folder = path.dirname( item.path );
				} else {
					var folder = item.path;
				}
			}
									
			fs.ensureFile( path.join( folder, newFileName) );
			
			$scope.update();
		}
	}
	
});

function readdirSyncRecursive( dir, root ) {
		
	root = root || false;
	
	var result = [];
	
	var contents = fs.readdirSync( dir );
	contents.forEach(function(item){
		
		// hide dotfiles
		if( !window.localStorage.showDotFiles ) {
			if( item.charAt(0) == '.' ) return;
		}
		
		var item_path = path.join(dir, item);
		var item_stats = fs.lstatSync( item_path );
		
		if( item_stats.isDirectory() ) {
			
			result.push({
				name: item,
				path: path.join(dir, item),
				type: 'folder',
				stats: item_stats,
				children: self.readdirSyncRecursive( item_path )
			});
			
		} else {
			
			result.push({
				name: item,
				path: path.join(dir, item),
				type: 'file',
				stats: item_stats
			});
				
		}			
		
	});
	
	if( root ) {	
		return [{
			type: 'folder',
			name: path.basename( dir ),
			path: dir,
			children: result,
			stats: fs.lstatSync( dir )
		}];	
	} else {
		return result;
	}
	
}

// duplicate file or folder, but create `filename copy[ n]` when a duplicate already exists. this was fun to do :)
function newPath( file_path, index ) {
	
	index = index || false;
	
	var filename = path.basename( file_path );
	var folder = path.dirname( file_path );
	
	if( fs.statSync( file_path ).isFile() ) {
								
		var ext = path.extname( filename );
		var base = path.basename( filename, ext );
		
		if( index ) {
			var new_filename = base + ' copy ' + index.toString() + ext;
		} else {
			var new_filename = base + ' copy' + ext;
		}
		
	} else {
		var new_filename = filename + ' copy'	
		if( index ) new_filename += ' ' + index.toString();					
	}
	
	var new_path = path.join( folder, new_filename );
	return new_path;					
}