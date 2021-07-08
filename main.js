const imageSearch = require("image-search-google");
const fs = require("fs");
const path = require("path");
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});
let keyfilePath = path.join(__dirname,"keyfile.txt");
const fetch = require("node-fetch");
const asciify = require("asciify-image");


//parsing and getting command line arguments
let getParam = function(){
    let param = process.argv[2];
    if(!param){
        console.log("usage: node main.js \"search param\"");
        process.exit();
        return false;
    }
    return param;
};

let readTextFile = function(name){
    return new Promise((res,rej)=>{
        fs.readFile(name, "utf8", function(err, data) {
            if (err){
                if(err.code === "ENOENT"){
                    res(false);
                }else{//error that I can't handle
                    rej(err);
                }
            }else{
                res(data);
            }
        });
    });
};

let writeTextFile = function(name,content){
    return new Promise((res,rej)=>{
        fs.writeFile(keyfilePath, content, err => {
            if(err){
                rej(err);
            }
            res();
        });
    });
};

let requestUserInput = function(question){
    return new Promise((res,rej)=>{
        readline.question(question, (reply)=>{
            if(!reply){
                process.stdout.write("\r                                         \033[F");
                requestUserInput(question).then((reply1)=>{
                    res(reply1);
                }).catch((err)=>{
                    rej(err);
                });
            }else{
                res(reply);
            }
        });
    });
};

let verifyIdKey = function([key,id]){
    if(!key || !id){
        return false;
    }
    return true;
};

let failcnt = 0;
let requestUserInputKeys = async function(){
    while(true){
        console.log("Please input your CSE ID and API key.");
        /*if(failcnt === 0){
            console.log("Please input your CSE ID and API key.");
        }else{
            console.log("Your input was not correctly formatted. Please enter it again.");
        }*/
        let id = await requestUserInput("CSE ID: ");
        let key = await requestUserInput("API KEY: ");
        if(verifyIdKey([id,key])){
            failcnt++;
            //write the keys as json
            try{
                await writeTextFile(keyfilePath,JSON.stringify([id,key]));
            }catch(err){
                console.log("error writing to the keyfile.txt");
            }
            return [id,key];
        }else{
            continue;
        }
    }
};

let handleKeyfileExists = async function(file){
    let id,key;
    let successFlag = true; 
    try{
        [id,key] = JSON.parse(file);
    }catch(err){
        successFlag = false;
    }
    if(successFlag || verifyIdKey([id,key])){
        return [id,key];
    }else{
        console.log("Your keyfile.txt exists but seems to be corrupted. please enter your id and key.");
        return await requestUserInputKeys();
    }
};

let getAPIkeys = async function(){
    let id,key,file;
    file = await readTextFile(keyfilePath);
    if(!file){//file dne
        [id,key] = await requestUserInputKeys();
    }else{
        [id,key] = await handleKeyfileExists(file);
    }
    return [id,key]
};

let getClient = async function(){
    let [id,key] = await getAPIkeys();
    if(!verifyIdKey([id,key])){
        throw new Error("The key format is corrupted for some reason");
    }
    return new imageSearch(id,key);
};





let main = async function(){
    let param = getParam();
    let images;
    let options = {page:1};
    
    let takes = 0;
    //getting authenticated
    while(true){//keep doing this until success
        try{
            let client = await getClient();
            try{
                images = await client.search(param, options);
            }catch(err){
                console.log("API keys you entered had been rejected");
                throw err;
            }
            break;
        }catch(err){
            console.log(err);
            await requestUserInputKeys();
            takes++;
            if(takes > 5){
                console.log("something must be going wrong, please re-start this program and try again");
                process.exit(1);
            }//break;
            //continue the loop until success
        }
    }
    console.log(images.length);
    //getting the image
    let str = await asciify(images[0].thumbnail, {
        fit:    'box',
        width:  100,
        height: 50
    });
    console.log(str);
    
    //cleaning up
    readline.close();
    console.log("program successfully completed");
};

main();