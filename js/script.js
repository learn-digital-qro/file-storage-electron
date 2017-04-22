var scriptApp = angular.module('scriptApp',[]);

scriptApp.controller('scriptController',function($scope,$http){

    $http.get("./js/fileSettings.json")
    .then(function(res){
        $scope.init(res.data[0]);
    });

    $scope.outputLines = [];
    $scope.selectedLines = [];
    $scope.hideoutput = true;
    $scope.textExtensions="";

    var chokidar = require('chokidar');
    var fs = require('fs');
    var nodePath = require('path');
    var watcher = null;

    var convertToPath = function(pathString){
        return nodePath.join(pathString,'')
    };

    var checkInputs = function(fname){
        ext = fname.substr(fname.lastIndexOf('.')+1);
        return ($scope.fileSettings.exts.indexOf(ext) > -1);
    };

    $scope.init = function(fileSettings) {
        $scope.fileSettings = fileSettings;
        $scope.targetFolder = convertToPath($scope.fileSettings.outfolder);
    };

    $scope.StartWatcher = function(){
        pathName=$scope.targetFolder;
        console.log();
        watcher = chokidar.watch(pathName, {
            ignored: /[\/\\]\./,
            persistent: true
        });
        function onWatcherReady(){
            console.info('Initial scan has been completed.');
            watcher.close();
        }
        watcher
        .on('add', function(pathName) {
            if (checkInputs(pathName)) {
                console.log('File', pathName, 'has been selected');
                $scope.addLog("File: "+pathName,"selected");
                $scope.saveLog(pathName);
            } else {
                console.log('File', pathName, 'has been review');
                $scope.addLog("File: "+pathName,"new");
            };
            $scope.$apply();
        })
        .on('error', function(error) {
            console.log('Error happened', error);
            $scope.addLog("An error ocurred: ","delete");
        })
        .on('ready', onWatcherReady);
    };

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
        $scope.selectedLines= [];
    };

    $scope.addLog = function(message,type){
        if(type == "selected"){
            ttcolor = "bg-primary";
        }else{
            ttcolor = "text-muted";
        };
        $scope.outputLines.push({
            message:message,
            tcolor:ttcolor
        });
    };

    $scope.saveLog = function(path){
        $scope.selectedLines.push({
            path:path
        });
    }

    $scope.initApp = function() {
        $scope.hideoutput = false;
        $scope.StartWatcher();
    };


});
