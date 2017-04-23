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
    $scope.requiredInputs=[
        {name:$scope.projtag,id:"idProjTag",model:"projectName"},
        {name:"Source Folder",id:"idSource",model:"sourceFolder"},
        {name:"Target Folder",id:"idTarget",model:"targetFolder"}
    ];

    var chokidar = require('chokidar');
    var fs = require('fs');
    var nodePath = require('path');
    var targz = require('targz');
    var watcher = null;

    var convertToPath = function(pathString){
        return nodePath.join(pathString,'')
    };

    var checkFields = function(fields){
        $scope.checkInputsMissing = [];
        for (i = 0; i < fields.length; ++i) {
            if ($scope[fields[i].model]=="") {
                $scope.warnInput(fields[i].id);
                $scope.checkInputsMissing.push(fields[i].name);
            };
        };
        if ($scope.checkInputsMissing.length > 0) {
            return false
        } else {
            return true
        };
    };

    var checkInputs = function(){
        if (checkFields($scope.requiredInputs)) {
            $scope.StartWatcher($scope.sourceFolder);
            return true
        } else {
            return false
        }
    };

    var checkFiles = function(fname){
        ext = fname.substr(fname.lastIndexOf('.')+1);
        return ($scope.fileSettings.exts.indexOf(ext) > -1);
    };

    $scope.warnInput = function(id){
        $("#"+id).addClass("has-error");
    };

    $scope.compressFiles = function(){
        targz.compress({
            src: $scope.sourceFolder,
            dest: $scope.destinyFolder,
            tar: {
                entries = $scope.selectedLines
            }
        }, function(err){
            if(err) {
                console.log(err);
            } else {
                console.log("Done!");
            }
        });
    };

    $scope.startInputs = function(fields){
        for (i = 0; i < fields.length; ++i) {
            $("#"+fields[i].id).removeClass("has-error");
        };
    };

    $scope.init = function(fileSettings) {
        $scope.fileSettings = fileSettings;
        $scope.targetFolder = convertToPath($scope.fileSettings.outfolder);
        $scope.projectName = "";
        $scope.sourceFolder = "";
    };

    $scope.StartWatcher = function(pathName){
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
            if (checkFiles(pathName)) {
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
        $scope.startInputs($scope.requiredInputs);
        $scope.init($scope.fileSettings);
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
        $scope.startInputs($scope.requiredInputs);
        if (checkInputs() == true) {
            $scope.hideoutput = false;
        } else {
            $scope.hideoutput = true;
        }
    };


});
