const imageSearch = require("image-search-google");
const fs = require("fs");
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(process.argv);

let filestat = function(){
    return new Promise((res,rej)=>{
        fs.stat(name,function(err,stats){
            resolve([err,stats]);
        });
    });
}
let exist = async function(){
    let [err,stats] = await filestat(name);
    if(err){
        if(err.code === "ENOENT"){
            //create a new file
            
        }else{
            throw err;
        }
    }
    
    fs.stat(name,function(err,stats){
        if(err){
            if(err.code === "ENOENT"){
                //create a new file
                
            }else{
                throw err;
            }
        }else{
            
        }
    });
}


let readTextFile = function(name){
    return new Promise((res,rej)=>{
        fs.readFile(name, "utf8", function(err, data) {
            if (err){
                if(err.code === "ENOENT"){
                    res(false);
                }else{
                    rej(err);
                }
            }else{
                res(data);
            }
        });
    });
};

let requestUserInput = function(question){
    return new Promise((res,rej)=>{
        readline.question(question, (reply)=>{
            readline.close();
            res(reply);
        });
    });
};

let writeFile = function(name,content){
    return new Promise((res,rej)=>{
        fs.writeFile(name, content, (err) => {
            if (err){
                rej(err);
            }else{
                res();
            }
        });
    });
};

let requestAndSaveUserKey = async function(filename){
    //create file and read user input
    console.log("Please enter your google CSE ID and API KEY. You won't need to do this from the second time.");
    let id = await requestUserInput("CSE ID: ");
    let key = await requestUserInput("API KEY: ");
    writeFile(filename,JSON.stringify([id.trim(),key.trim()]));
};

let getIDKEY = async function(){
    let data;
    let filename = "";
    try{
        while(true){
            
        }
        let data = readTextFile(filename);
        if(!data){//file does not exist
            requestAndSaveUserKey(filename);
            data = readTextFile(filename);
        }
        let vals;
        try{
            let vals = JSON.stringify(data);
        }catch()
        return 
    }catch(err){
        console.log(err);
        console.log("the key file may be corrupted. try removing ./keyfile and execute this command again.");
    }
};

let displayHelp = function(){
    console.log(
`Usage: node img.js "search params"`
    );
}

let main = async function(){
    let [id,key] = await getIDKEY();
    let param = process.argv[2];
    if(!param){
        displayHelp();
        process.exit(1);
    }
};
const client = new imageSearch("CSE ID", "API KEY");
const options = {page:1};
client.search("APJ Abdul kalam", options)
    .then(images => {
        /*
        [{
            'url': item.link,
            'thumbnail':item.image.thumbnailLink,
            'snippet':item.title,
            'context': item.image.contextLink
        }]
         */
    })
    .catch(error => console.log(error););
 
// search for certain size
client.search('Mahatma Gandhi', {size: 'large'});
 
// search for certain type
client.search('Indira Gandhi', {type: 'face'});