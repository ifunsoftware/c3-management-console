/**
 * Created with IntelliJ IDEA.
 * User: aphreet
 * Date: 5/10/13
 * Time: 01:19
 * To change this template use File | Settings | File Templates.
 */

var cli = {

    welcomeMessages: [
        'Welcome to C3 Management console',
        'Type help to get list of available commands'
    ],

    state: {
        c3Host: null,
        c3User: null,
        c3Password: null
    },

    execute: function(command, context, onComplete){

        var splitCommand = command.split(" ");

        if(splitCommand[0] == "connect"){
            if(splitCommand.length < 4){
                onComplete(context, 'Not enough arguments')
                return;
            }else{
                this.state.c3Host = splitCommand[1];
                this.state.c3User = splitCommand[2];
                this.state.c3Password = splitCommand[3];
                onComplete(context, '');
                return;
            }
        }


        if(command.indexOf(' @file') < 0){
            runCliCommand(context, command, function(response){
                onComplete(context, response.trim());
            });
        }else{
            cliLoadFile(function(data){
                if(data != null){
                    var encodedFile = Base64.encode(data);

                    var processedCommand = command.replace('@file', encodedFile);

                    console.log(processedCommand);

                    runCliCommand(context, processedCommand, function(response){
                        onComplete(context, response.trim());
                    });

                }else{
                    onComplete(context, 'Canceled');
                }
            });
        }
    },

    prompt: function(context){
        if(context.cli.state.c3Host == null){
            return '# ';
        }else{
            return context.cli.state.c3Host + '# ';
        }
    }
};

function cliLoadFile(callback){

    chrome.fileSystem.chooseEntry({}, function(entry){

        if(entry){

            console.log(entry);

            var reader = new FileReader();
            reader.onload = function(content){
                console.log(content.target.result);

                callback(content.target.result);
            };

            reader.onerror = function(error){
                console.log(error);
                callback(null);
            };

            entry.file(function(file){
                reader.readAsBinaryString(file);
            });
        }else{
            callback(null);
        }
    });
}


function runCliCommand(context, command, callback){

    $.ajax('http://' + context.cli.state.c3Host + '/ws/cli?command=' + command, {
        cache: false,
        type: 'GET',
        username: context.cli.state.c3User,
        password: context.cli.state.c3Password,
        processData: false,
        complete: function(jqXHR){
            callback(jqXHR.responseText);
        }
    });
}

