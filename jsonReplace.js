var fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const replaceAll = require("replace");


const ngssdata = require('./ngssdata.js');
var myArgs = process.argv;
let filepath = "./mrq_cards/";     

propsUpdate = async(start,end,filePath) =>{
    return new Promise(resolve => {   
        const options = replaceAll({
            regex: start,
            replacement: end,
            paths: [filePath],
            recursive: true,
            silent: true,
          });
        //console.log(options,"  options   ");
        resolve("src");
    });    
}
//propsUpdate("./tryme/tryme.json");
//module.exports.propsUpdate = propsUpdate;

const waitFor_one = ((ms,jsonName) => {
    return new Promise(async(resolve,reject) => {
        setTimeout(async()=>{
            console.log(jsonName,"   myArgs   ",myArgs);

            let jsonPath = "./config/"+jsonName+'.json';//config or audio
            let srcdata = fs.readFileSync(jsonPath);
            let src = JSON.parse(srcdata);
            let widgetSrc = ngssdata['matchingProps']['multiple_choice_question']; // widgetType
            let mcq_type = (widgetSrc['isControlled'] ? (src[widgetSrc.deciderProp] ? 'checkbox' : 'radio') : null);
            //let mcq_type = src.configuration[widgetSrc.deciderProp];
            let start = "\"../../../../widget_data/config"+jsonName+".json\" />";
            let end = null;
            
            
            console.log(mcq_type);
            //return;
            if(mcq_type == 'checkbox'){
                end = "\"../../../../widget_data/config"+jsonName+".json\"/><param name='qtype' value='mrq' />";
                let finalData = await propsUpdate(start,end,filepath);
                resolve(finalData);
            } else{
                end = "\"../../../../widget_data/config"+jsonName+".json\"/><param name='qtype' value='mcq' />";
                console.log(start,"  ",end,"  ",filepath);
                let finalData = await propsUpdate(start,end,filepath);
                resolve(finalData);
            }
        }, ms);
    });
});

async function asyncForEach_one(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

remove_linebreaks = async(tt) =>{ 
	return tt.replace( /[\r\n]+/gm, "" ).trim(); 
} 

callMe = async() => {
    /* get commitedJSON and process again for audio files */
    let audioJSON_input = `36b50e742a2f458b8d1ee8295a0e1127.json
a5702edb1c0c4ede954b4e9b7e10c0f7.json
afb2daea4814418b8480c734f6c4804b.json
e48a803185544102b27eebca9d6460df.json`;

    //console.log(audioJSON_input);
    let finalCombinedStr = await remove_linebreaks(audioJSON_input);
    let audioArr = finalCombinedStr.split('.json');
    const htmlStart = "assets/modules/hmh.cpl_mcq_multi/widgets/cpl_mcq_multi/index.html";
    const htmlEnd = "assets/modules/hmh.mcq_mrq/widgets/explib_mcq_mrq/index.html";
    let htmlData = await propsUpdate(htmlStart,htmlEnd,filepath);
    console.log("All html mcq changes are completed!!!");
	// <param name="theme" value="undefined" />
	//   '\"<param name\"="theme" value\"="undefined" />';
	const html_lma_Start = '<param name="theme" value="undefined" />';
    const html_lma_End = "";
    let html_lma_Data = await propsUpdate(html_lma_Start,html_lma_End,filepath);
	console.log("All html lma changes are completed!!!");
	
    console.log(audioArr);
    asyncForEach_one(audioArr, async (file) => {
        let fileName = file.trim();
        console.log(fileName,"   fileName");
        let recur_value = (fileName != '' ? await waitFor_one(50,"/"+fileName) : null);
        console.log('All param changes are completed!!!');
        
    })
}

callMe();


//module.exports.callMe = callMe;
module.exports.asyncForEach_one = asyncForEach_one;
module.exports.remove_linebreaks = remove_linebreaks;


//myArgs -> node run_audio.js image_carousel config_specific config