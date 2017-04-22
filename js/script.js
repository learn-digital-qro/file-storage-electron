var scriptApp = angular.module('scriptApp',[]);

scriptApp.controller('scriptController',function($scope,$http){

    $http.get("./js/fileSettings.json")
    .then(function(res){
        $scope.init(res.data[0]);
    });

    $scope.outputLines = [];
    $scope.hideoutput = true;
    $scope.textExtensions="";

    var chokidar = require('chokidar');
    var fs = require('fs');
    var watcher = null;

    $scope.init = function(fileSettings) {
        $scope.fileSettings = fileSettings;
    };

    $scope.StartWatcher = function(){

        path=$scope.sourceFolder;

        watcher = chokidar.watch(path, {
            ignored: /[\/\\]\./,
            persistent: true
        });

        function onWatcherReady(){
            $scope.hideoutput = false;
            console.info('From here can you check for real changes, the initial scan has been completed.');
            watcher.close();
            $scope.$apply();
        }

        watcher
        .on('add', function(path) {
            console.log('File', path, 'has been review');
            $scope.addLog("File: "+path,"new");
        })
        .on('addDir', function(path) {
            console.log('Directory', path, 'has been review');
            $scope.addLog("Folder: "+path,"new");
        })
        .on('change', function(path) {
            console.log('File', path, 'has been changed');
            $scope.addLog("A change ocurred : "+path,"change");
        })
        .on('unlink', function(path) {
            console.log('File', path, 'has been removed');
            $scope.addLog("A file was deleted : "+path,"delete");
        })
        .on('unlinkDir', function(path) {
            console.log('Directory', path, 'has been removed');
            $scope.addLog("A folder was deleted : "+path,"delete");
        })
        .on('error', function(error) {
            console.log('Error happened', error);
            $scope.addLog("An error ocurred: ","delete");
            console.log(error);
        })
        .on('ready', onWatcherReady)
        .on('raw', function(event, path, details) {
            // This event should be triggered everytime something happens.
            console.log('Raw event info:', event, path, details);
        });
    }

    $scope.getFolderDir = function(idLabel) {
        const {dialog} = require('electron').remote;
        dialog.showOpenDialog({
            properties: ['openDirectory']
        },function(path){
            if(path){
                if (idLabel==1) {
                    $scope.sourceFolder=path;
                } else if (idLabel==2) {
                    $scope.targetFolder=path;
                    console.log(path);
                }
                $scope.$apply();
            }else {
                console.log("No path selected");
            }
        });
    };

    $scope.resetLog = function(){
        $scope.hideoutput = true;
        $scope.outputLines= [];
    };

    $scope.addLog = function(message,type){
        if(type == "delete"){
            ttcolor = "text-danger";
        }else if(type == "change"){
            ttcolor = "text-primary";
        }else{
            ttcolor = "text-success";
        }
        $scope.outputLines.push({
            message:message,
            tcolor:ttcolor
        });
        $scope.hideoutput = true;
        $scope.$apply();
    }

    $scope.init();

});
