var fs = require('fs-extra');
const ngssdata = require('../../../app/ngssdata.js');
var finalData, srcdata, src, targdata, mapdata, map, tar, parent_source, parent_target, parent_source_tag, parent_target_tag, mirror_json, mirror_json_target, imagename, previousindex, target_mirror, maplength, counter, assignTarget, parent_key, parent_key_tag, alpha, source_json_path, arr = [],temp_index,fromEXCEL = null;
alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
var tmp_array = new Array();
var correct_value = null;
var myarr;
async function mappingJSON(file, jsonPath, widgetType, projectName, fromEXCEL) {
    myXCEL = fromEXCEL;
    console.log(fromEXCEL,"   from excel");
    source_json_path = jsonPath.split(".");
    console.log(jsonPath, "  mapping");
    jsonPath = "../" + projectName + "/assets/widget_data/config/" + jsonPath;
    srcdata = fs.readFileSync(jsonPath);
    src = JSON.parse(srcdata);
    console.log(src.hasOwnProperty('ActivityTitle'), "  src");
    if(src.hasOwnProperty('ActivityTitle')){
        console.log(src.ActivityTitle, "  src");
        var return_correct_value={"final_tar": 0 , "mcq_ss_correctvalue": correct_value}
        return return_correct_value;
    }
    let widgetSrc = ngssdata['matchingProps'][widgetType];
    //console.log(src,widgetSrc,widgetSrc.deciderProp);
    let isMulti_decider = (widgetSrc['isControlled'] ? (src[widgetSrc.deciderProp] ? 'checkbox' : 'radio') : null);
    debugger;
    let targetPath, mapPath = '';
    if (fromEXCEL.gradeLevel.toLowerCase() === 'kindergarten') {
        targetPath = (widgetSrc['isControlled'] ? widgetSrc['templateKG'][isMulti_decider] : ngssdata['matchingProps'][widgetType]['templateKG']);
        mapPath = (widgetSrc['isControlled'] ? widgetSrc['mappingKG'][isMulti_decider] : ngssdata['matchingProps'][widgetType]['mappingKG']);
    } else {
        targetPath = (widgetSrc['isControlled'] ? widgetSrc['templatePath'][isMulti_decider] : ngssdata['matchingProps'][widgetType]['templatePath']);
        if(fromEXCEL.widgetType == 'process_steps'){
            if(src.allsteps[0].hasOwnProperty('lbullet')){
                mapPath = "../Mapping/Process_Steps_bulletin_Map_G3_12.json";
            } else if(src.allsteps[0].hasOwnProperty('imagedet')){
                mapPath = "../Mapping/Process_Steps_image_Map_G3_12.json";
            } else if(src.allsteps[0].hasOwnProperty('desc')){
                mapPath = "../Mapping/Process_Steps_text_Map_G3_12.json";
            }
        } else {
            mapPath = (widgetSrc['isControlled'] ? widgetSrc['mappingPath'][isMulti_decider] : ngssdata['matchingProps'][widgetType]['mappingPath']);
        }
        //mapPath = (widgetSrc['isControlled'] ? widgetSrc['mappingPath'][isMulti_decider] : ngssdata['matchingProps'][widgetType]['mappingPath']);
    }
    //console.log(fromEXCEL.widgetType,"   ",targetPath, " ---  ", mapPath,"   ---   ",src.allsteps[0].hasOwnProperty('lbullet'),"   ",src.allsteps[0].hasOwnProperty('imagedet'),"   ",src.allsteps[0].hasOwnProperty('desc'));
    //return;
    targdata = fs.readFileSync(targetPath);
    mapdata = fs.readFileSync(mapPath);
    //console.log(targdata, "  ", mapdata);
    map = JSON.parse(mapdata);
    tar = JSON.parse(targdata);
    parent_source, parent_target;
    parent_source_tag, parent_target_tag;
    mirror_json, mirror_json_target;
    imagename;
    previousindex = {};
    //ddd_bg_mapping_k2.json
    previousindex.len = 0;
    previousindex.name = "";

    target_mirror;
    maplength = map.mapping_data.length;
    counter = 0;
    assignTarget;

    parent_source = map.mapping_data[counter].source_parent_name;
    parent_source_tag = parent_source.split(".");


    //debugger;
    if (counter < maplength) {
        if(src.ActivityTitle){
            console.log("Json is converted already",src.ActivityTitle);
            var return_correct_value={"final_tar": 0 , "mcq_ss_correctvalue": correct_value}
			return return_correct_value;
        } else {
            let result = await get_s_data(src, tar, parent_source_tag, counter);
            //console.log(result,"   when  ",counter, "  ",maplength);
            return result;
        }
    }

    //return finalData;
}


// returns the next index of the "currentbuffer" JSON ()
// currentbuffer - JSON returnBuffer
// sPtags - parent information
// mdata - Mapping Data json
// index - current mapping index
// if the currentbuffer length is more than one this should return the next level JSON till the cycle reaches the currentbuffer length
async function assignTargetData(currentBuffer, target, mapdata, counter) {


    if (mapdata[counter].data_type == "audio" && currentBuffer == undefined) {
        var src_name = source_json_path;
        target[mapdata[counter].target_key_name] = map.assets_config.audio_path + src_name[0] + '.json';
    } else if (mapdata[counter].difference_in_index == "audio_social") {
        target[mapdata[counter].target_key_name] = "../../" + src[mapdata[counter].source_key_name];

    } else if (parent_source == "") {
        if (parent_target_tag.length > 1) {
            if (tar[parent_target_tag[0]][0][parent_target_tag[1]]) {
                tar[parent_target_tag[0]][0][parent_target_tag[1]][mapdata[counter].target_key_name] = src[mapdata[counter].source_key_name]
            } else {
                console.log("ok")
            }
        } else {
            if (tar[parent_target_tag[0]]) {
                tar[parent_target_tag[0]][mapdata[counter].target_key_name] = src[mapdata[counter].source_key_name]

            } else {
                tar[mapdata[counter].target_key_name] = src[mapdata[counter].source_key_name];

            }

        }
    } else {


        if (mapdata[counter].iterative == "yes") {



            /* console.log(currentBuffer, "           CurrentBuffer")
            console.log(target, "                  TargetBuffer") */

            if (currentBuffer.length) {
                for (var j = 0; j < (currentBuffer.length); j++) {
                    if (currentBuffer.length && currentBuffer[j].length) {
                        if ((currentBuffer[j].length * currentBuffer.length) < target.length) {
                            for (q = 0; q < currentBuffer[j].length; q++) {
                                var split_key = currentBuffer[j][q][mapdata[counter].source_key_name];
                                var split_key_tag = split_key.split("<<");

                            }
                            if (split_key_tag.length > 2) {
                                target.splice(split_key_tag.length - 1);
                            } else {
                                target.splice((currentBuffer[j].length * currentBuffer.length));
                            }
                            if (currentBuffer[j - 1]) {
                                currentBuffer = currentBuffer[j - 1].concat(currentBuffer[j]);
                            } else if (currentBuffer[j + 1]) {
                                currentBuffer = currentBuffer[j].concat(currentBuffer[j + 1]);
                            } else {
                                currentBuffer = currentBuffer[j];
                            }


                        }
                    } else {
                        if ((currentBuffer.length < target.length)) {
                            target.splice(currentBuffer.length);
                        }
                    }
                    if (target[j]) {
                        if (mapdata[counter].data_type == "index") {
                            for (var i = 0; i < currentBuffer.length; i++) {
                                console.log(currentBuffer[i][mapdata[counter].source_key_name], "           BU");
                                if (currentBuffer[i][mapdata[counter].source_key_name] == true) {
                                    target[j][mapdata[counter].target_key_name] = i;
                                    return;
                                }
                            }
                        } else if (currentBuffer[j].length > 0) {
                            for (n = 0; n < currentBuffer[j].length; n++) {
                                arr.push(currentBuffer[j][n][mapdata[counter].source_key_name]);
                                console.log(currentBuffer[j][n][mapdata[counter].source_key_name], j, n);
                            }
                            target[j][mapdata[counter].target_key_name] = arr[j];
                            console.log(arr, target)
                        } else if (mapdata[counter].para_tag == "yes" && currentBuffer[j][mapdata[counter].source_key_name] !== "") {
                            if (typeof(target) == "object" && target[j][mapdata[counter].target_key_name] == undefined) {
                                target[j] = '<p class=\"quill-source-editor\">' + currentBuffer[j][mapdata[counter].source_key_name] + '</p>';
                            } else if (mapdata[counter].data_type == "alphatext") {
                                target[j][mapdata[counter].target_key_name] = '<p class=\"quill-source-editor\">' + alpha[j] + "." + "  " + currentBuffer[j][mapdata[counter].source_key_name] + '</p>';
                            } else {
                                if (currentBuffer[j][mapdata[counter].source_key_name] !== undefined) {
                                    target[j][mapdata[counter].target_key_name] = '<p class=\"quill-source-editor\">' + currentBuffer[j][mapdata[counter].source_key_name] + '</p>';
                                } else {
                                    target[j][mapdata[counter].target_key_name] = "";
                                }
                            }
                        } else {
                            if (mapdata[counter].data_type == "image" && currentBuffer[j][mapdata[counter].source_key_name] !== "") {
                                imagename = currentBuffer[j][mapdata[counter].source_key_name];
                                let imgPath = imagename.split("img");
                                //target[j][mapdata[counter].target_key_name] = map.assets_config.image_path + imgPath[imgPath.length - 1];
                                // if(myXCEL.socialType == 'dps'){
                                //     target[j][mapdata[counter].target_key_name] = "../../../../../img" + imgPath[0];
                                // } else {
                                //     target[j][mapdata[counter].target_key_name] = "../../../../../img" + imgPath[0];
                                // }
                                target[j][mapdata[counter].target_key_name] = "../../../../../img" + imgPath[1];
                            } else if (mapdata[counter].difference_in_index == "-1" && target[j][mapdata[counter].target_key_name] !== undefined) {
                                target[j][mapdata[counter].target_key_name] = currentBuffer[j][mapdata[counter].source_key_name] - 1;
                            } else if (mapdata[counter].data_type == "hide" && target[j][mapdata[counter].target_key_name] !== undefined) {
                                if (currentBuffer[j][mapdata[counter].source_key_name] == true) {
                                    target[j][mapdata[counter].target_key_name] = false;
                                } else {
                                    target[j][mapdata[counter].target_key_name] = true;
                                }
                            } else if (mapdata[counter].data_type == "split_prev_mdq") {

                                var parent_key = currentBuffer[j][map.mapping_data[counter].source_key_name];
                                var parent_key_tag = parent_key.split("<<");
                                for (var a = 0; a < parent_key_tag.length; a++) {
                                    if (parent_key_tag[a].indexOf(">>") > 0) {
                                        console.log(parent_key_tag[a].split(">>")[1], a);
                                        parent_key_tag[a] = parent_key_tag[a].split(">>")[1]
                                    };
                                }

                                if (parent_key_tag.length - 1 < target.length) {
                                    target.splice(parent_key_tag.length - 1);
                                }
                                for (m = 0; m < parent_key_tag.length - 1; m++) {

                                    target[m][mapdata[counter].target_key_name] = parent_key_tag[m];
                                }
                                console.log("testtttttttttttttttt")
                                //  target[j][mapdata[counter].target_key_name]=;
                            } else if (mapdata[counter].data_type == "split_post_mdq") {

                                var parent_key = currentBuffer[j][map.mapping_data[counter].source_key_name];
                                var parent_key_tag = parent_key.split(">>");

                                if (parent_key_tag.length - 1 <= target.length) {
                                    target.splice(parent_key_tag.length - 1);
                                }
                                target[target.length - 1][mapdata[counter].target_key_name] = parent_key_tag[parent_key_tag.length - 1];
                                console.log("testtttttttttttttttt")
                                //  target[j][mapdata[counter].target_key_name]=;
                            } else if (mapdata[counter].data_type == "alphatext") {
                                target[j][mapdata[counter].target_key_name] = alpha[j] + "." + "  " + currentBuffer[j][mapdata[counter].source_key_name];
                            } else if (mapdata[counter].data_type == "direction") {
                                if (currentBuffer[j][mapdata[counter].source_key_name] == "RIGHT") {
                                    target[j][mapdata[counter].target_key_name] = "pin-right";
                                }
                                if (currentBuffer[j][mapdata[counter].source_key_name] == "LEFT") {
                                    target[j][mapdata[counter].target_key_name] = "pin-left";
                                }
                                if (currentBuffer[j][mapdata[counter].source_key_name] == "TOP") {
                                    target[j][mapdata[counter].target_key_name] = "pin-top";
                                }
                                if (currentBuffer[j][mapdata[counter].source_key_name] == "DOWN") {
                                    target[j][mapdata[counter].target_key_name] = "pin-bottom";
                                }
                            } else if (mapdata[counter].data_type == "targetoption") {
                                if (currentBuffer[j][mapdata[counter].source_key_name] = "Target" + (j + 1)) {
                                    target[j][mapdata[counter].target_key_name] = "option_" + (j + 1);
                                }
                            } else if (mapdata[counter].data_type == "checkResponse") {
                                if (currentBuffer[j][mapdata[counter].source_key_name] == true) {
                                    target[j][mapdata[counter].target_key_name] = "<p class=\"quill-source-editor\">Well Done.</p>";
                                } else {
                                    target[j][mapdata[counter].target_key_name] = "<p class=\"quill-source-editor\">That’s not it.</p>";
                                }
                            } else { // changing the data when there is no information on image path and text node
                                if (target[j][parent_target_tag[parent_target_tag.length - 1]]) {
                                    target[j][parent_target_tag[parent_target_tag.length - 1]][mapdata[counter].target_key_name] = currentBuffer[j][mapdata[counter].source_key_name];
                                } else {
                                    if (currentBuffer[j][mapdata[counter].source_key_name] !== undefined) {
                                        if ([mapdata[counter].data_type] == "bulletins") {
                                          myarr="";
                                            for (lan = 0; lan < currentBuffer.length; lan++) {
                                                myarr = myarr + "<li>"+currentBuffer[lan][mapdata[counter].source_key_name] +"</li>";
                                                console.log(myarr, "my array")
                                                myarr = myarr.replace("<p>", "")
                                                myarr = myarr.replace("</p>", "")
                                            }
                                            console.log(tmp_array[temp_index],"Helooooo")
                                            target[0][mapdata[counter].target_key_name] = tmp_array[0] + myarr;

                                        } else {
                                            target[j][mapdata[counter].target_key_name] = currentBuffer[j][mapdata[counter].source_key_name];
                                        }
                                    } else {
                                        target[j][mapdata[counter].target_key_name] = "";
                                    }
                                }
                            }
                        }
                    } else {

                      if ([mapdata[counter].data_type] == "bulletins") {
                        myarr="";
                          for (lan = 0; lan < currentBuffer.length; lan++) {
                              myarr = myarr + "<li>"+currentBuffer[lan][mapdata[counter].source_key_name] +"</li>";
                              console.log(myarr, "my array")
                              myarr = myarr.replace("<p>", "")
                              myarr = myarr.replace("</p>", "")
                          }
                          console.log(tmp_array[temp_index],"Helooooo")
                          target[0][mapdata[counter].target_key_name] = tmp_array[temp_index] + myarr;
                          //[j]=""

                      }
                        //target[mapdata[counter].target_key_name] = currentBuffer[j][mapdata[counter].source_key_name];
                        //mirror_json_target[map.mapping_data[i].target_key_name]=mirror_json[j][map.mapping_data[i].source_key_name]
                    }
                    console.log(target, "                  TargetBuffer Modified")
                }
            } else {
                if (mapdata[counter].data_type == "split_previous") {
                    var parent_key = currentBuffer[map.mapping_data[counter].source_key_name];
                    var parent_key_tag = parent_key.split("<<");
                    //console.log(parent_key_tag)
                    for (var a = 0; a < parent_key_tag.length; a++) {
                        if (parent_key_tag[a].indexOf(">>") > 0) {
                            console.log(parent_key_tag[a].split(">>")[1], a);
                            parent_key_tag[a] = parent_key_tag[a].split(">>")[1]
                        };
                    }
                    if (parent_key_tag.length < target.length) {
                        target.splice(parent_key_tag.length);
                    }
                    for (m = 0; m < parent_key_tag.length; m++) {

                        target[m][mapdata[counter].target_key_name] = parent_key_tag[m];
                    }
                } else if (mapdata[counter].data_type == "split_post") {
                    var parent_key1 = currentBuffer[map.mapping_data[counter].source_key_name];
                    var parent_key_tag1 = parent_key1.split(">>");

                    if (parent_key_tag1.length <= target.length) {
                        target.splice(parent_key_tag1.length - 1);
                    }
                    target[target.length - 1][mapdata[counter].target_key_name] = parent_key_tag1[parent_key_tag1.length - 1];
                } else if (mapdata[counter].data_type == "split_previous_fiq") {
                    var parent_key = currentBuffer[map.mapping_data[counter].source_key_name];
                    var parent_key_tag = parent_key.split("</p><p>");
                    if (parent_key_tag.length < target.length) {
                        target.splice(parent_key_tag.length);
                    }
                    for (x = 0; x < parent_key_tag.length; x++) {
                        var s = x + 1;
                        parent_key_tag[x] = parent_key_tag[x].split("&lt;Option" + s + "&gt;")[0];
                        if (parent_key_tag[x].split("<p>")[1] != undefined) {
                            target[x][mapdata[counter].target_key_name] = parent_key_tag[x].split("<p>")[1];
                        } else {
                            target[x][mapdata[counter].target_key_name] = parent_key_tag[x];
                        }
                    }
                } else if (mapdata[counter].data_type == "split_post_fiq") {
                    var parent_key = currentBuffer[map.mapping_data[counter].source_key_name];
                    var parent_key_tag = parent_key.split("</p><p>");
                    if (parent_key_tag.length < target.length) {
                        target.splice(parent_key_tag.length);
                    }
                    for (x = 0; x < parent_key_tag.length; x++) {
                        var s = x + 1;
                        parent_key_tag[x] = parent_key_tag[x].split("&lt;Option" + s + "&gt;")[1];
                        if (parent_key_tag[x].split("</p>")[0] != undefined) {
                            target[x][mapdata[counter].target_key_name] = parent_key_tag[x].split("</p>")[0];
                        } else {
                            target[x][mapdata[counter].target_key_name] = parent_key_tag[x];
                        }
                    }
                } else if (mapdata[counter].data_type == "Correctvalue") {
                    //console.log("Correctvalue")

                    let correct_value_len = currentBuffer[map.mapping_data[counter].source_key_name].length;

                    for (cv = 0; cv < correct_value_len; cv++) {
                        correct_value = currentBuffer[map.mapping_data[counter].source_key_name][cv]
                        target[correct_value][mapdata[counter].target_key_name] = true;
                    }

                } else if (mapdata[counter].data_type == "feedback") {
                    console.log("feedback")
                    var cur_buff = map.mapping_data[counter].source_key_name;
                    var cur_buff_split = cur_buff.split(",")
                    for (b = 0; b < target.length; b++) {
                        if (correct_value == b) {
                            target[correct_value][mapdata[counter].target_key_name] = currentBuffer[cur_buff_split[0]]

                        } else {
                            target[b][mapdata[counter].target_key_name] = currentBuffer[cur_buff_split[1]]

                        }
                    }

                } else {
                    if (mapdata[counter].target_key_name == "image" && currentBuffer[map.mapping_data[counter].source_key_name] !== "") {
                        imagename = currentBuffer[mapdata[counter].source_key_name];
                        let imgPath = imagename.split("img");
                        // if(myXCEL.socialType == 'dps'){
                        //     target[0][mapdata[counter].target_key_name] = "../../../../../img" + imgPath[1];
                        // } else {
                        //     target[0][mapdata[counter].target_key_name] = "../../" + imagename;
                        // }
                        target[0][mapdata[counter].target_key_name] = "../../../../../img" + imgPath[1];
                        } else {
                        tmp_array.push(currentBuffer[map.mapping_data[counter].source_key_name])
                        target[0][mapdata[counter].target_key_name] = currentBuffer[map.mapping_data[counter].source_key_name];

                    }




                }
            }
        } else {
            if (mapdata[counter].para_tag == "yes" && currentBuffer[mapdata[counter].source_key_name] !== "") {
                target[mapdata[counter].target_key_name] = '<p class=\"quill-source-editor\">' + currentBuffer[mapdata[counter].source_key_name] + '</p>';
            } else {
                if (mapdata[counter].data_type == "image" && currentBuffer[mapdata[counter].source_key_name] !== "") {
                    imagename = currentBuffer[mapdata[counter].source_key_name];
                    let imgPath = imagename.split("img");
                    target[mapdata[counter].target_key_name] = "../../../../../img" + imgPath[1];

                    //target[mapdata[counter].target_key_name] = map.assets_config.image_path + imgPath[imgPath.length - 1];
                    // console.log(myXCEL,"  from excel value  ");
                    // if(myXCEL.socialType == 'dps'){
                    //     target[mapdata[counter].target_key_name] = "../" + imagename;
                    // } else {
                    //     target[mapdata[counter].target_key_name] = "../../" + imagename;
                    // }
                } else { // changing the data when there is no information on image path and text node
                    if (mapdata[counter].data_type == "optiontype") {
                        if (currentBuffer[mapdata[counter].source_key_name] == true) {
                            target[mapdata[counter].target_key_name] = "image";
                        } else {
                            target[mapdata[counter].target_key_name] = "text"
                        }
                    } else if (mapdata[counter].data_type == "number") {
                        target[mapdata[counter].target_key_name] = parseInt(currentBuffer[mapdata[counter].source_key_name]);
                    } else if (mapdata[counter].data_type == "hotspot") {
                        if (currentBuffer[mapdata[counter].source_key_name] == "PL") {
                            target[mapdata[counter].target_key_name] = "Letter";
                        } else if (currentBuffer[mapdata[counter].source_key_name] == "PN") {
                            target[mapdata[counter].target_key_name] = "Number";
                        } else {
                            target[mapdata[counter].target_key_name] = "none";
                        }
                    } else {

                        target[mapdata[counter].target_key_name] = currentBuffer[mapdata[counter].source_key_name];


                    }
                }
            }
        }
    }
    return true;
}
async function getparentLength(source_parent) {
    return source_parent.length;
};
//return JSON.stringify(tar);
async function get_s_data(src, tar, source_parent, counter) {

    if (counter == maplength) {
        console.log(tar);
        var json1 = JSON.stringify(tar);
        var regex = /<p>/g;
        tar = json1.replace(regex, "<p class='quill-source-editor'>")
        //fs.writeFileSync('Process_steps_cpl_G3_12.json', tar);
        var return_correct_value={"final_tar": tar , "mcq_ss_correctvalue": correct_value}
        return return_correct_value;
        process.exit();
    }
    let parentLen = await getparentLength(source_parent);

    parent_source = map.mapping_data[counter].source_parent_name;
    parent_source_tag = parent_source.split(".");

    parent_target = map.mapping_data[counter].target_parent_name;
    parent_target_tag = parent_target.split(".");

    target_mirror = {};
    mirror_json = {};
    previousindex = {};
    previousindex.len = 0;
    previousindex.name = "";
    console.log(counter, "                   Counter");
    if (counter < maplength) {
        if (parent_source_tag.length >= 1) {
            for (k = 0; k < parent_source_tag.length; k++) {
                if (k == 0) {
                    mirror_json = src[parent_source_tag[k]];
                    if (parent_source_tag.length == 1) { // check the source parent length is equal to one index
                        if (map.mapping_data[counter].target_parent_name != "") {
                            if (parent_target_tag.length == 1) { // check the target parent length is equal to one index
                                target_mirror = tar[parent_target_tag[0]];
                                assignTarget = await assignTargetData(mirror_json, target_mirror, map.mapping_data, counter);
                            } else { // check the target parent length is more than one index
                                console.log("One Source Parent Level and One or More Target Parent Level");
                                for (var i = 0; i < parent_target_tag.length; i++) { // check the target parent length is more than one index for get the sub level json node
                                    if (i == 0) { // form the target JSON to assign Target data
                                        target_mirror = tar[parent_target_tag[i]];
                                        if (i == parent_target_tag.length - 1) { // calling assignTarget function when the length of the target parent is one;
                                            assignTarget = await assignTargetData(mirror_json, target_mirror, map.mapping_data, counter);
                                        }
                                    } else {
                                        target_mirror = target_mirror[parent_target_tag[i]];
                                        if (i == parent_target_tag.length - 1) { // check the length of the target parent and if reaches the maximum execute assign data
                                            assignTarget = await assignTargetData(mirror_json, target_mirror, map.mapping_data, counter); // calling assignTarget function when the length of the target parent more than one;
                                        }
                                    }
                                }
                            }
                        } else {
                            assignTarget = await assignTargetData(mirror_json, tar, map.mapping_data, counter);
                        }
                    }
                } else {
                    if (mirror_json) { //check if the child is available in the existing mirror JSON (the parent_source_tag[k] referes the parent name from the array)


                        if (mirror_json.length > 1 && typeof(mirror_json) == "object") {
                            previousindex.len = mirror_json.length;
                            previousindex.name = parent_source_tag[k];
                            previousindex.data = mirror_json;
                            target_mirror = tar[parent_target_tag[0]];
                            if (mirror_json.length < target_mirror.length) {
                                target_mirror.splice(mirror_json.length)
                            } else {
                                assignTarget = await assignTargetData(mirror_json, target_mirror, map.mapping_data, counter);

                            }

                        } else if (mirror_json[parent_source_tag[k]].length != undefined) {
                            if (k != (parent_source_tag.length - 1)) {
                                previousindex.len = mirror_json[parent_source_tag[k]].length;
                                previousindex.name = parent_source_tag[k];
                                previousindex.data = mirror_json[parent_source_tag[k]];
                            } else if (k == (parent_source_tag.length - 1)) {
                                //previousindex.len = 0;
                                //previousindex.name = parent_source_tag[k];
                                //previousindex.data = mirror_json[parent_source_tag[k]];
                                mirror_json = mirror_json[parent_source_tag[k]];
                            }
                        } else {

                            mirror_json = mirror_json[parent_source_tag[k]];
                        }
                        if (previousindex.len > 0 && previousindex.name != parent_source_tag[k]) {
                            //mirror_json = mirror_json[parent_source_tag[k]];
                        } else if (previousindex.len > 0 && k == (parent_source_tag.length - 1)) { // cycle if the options is the last parent
                            mirror_json = mirror_json[parent_source_tag[k]]; //- commented today (may 23)
                        } else if (previousindex.len > 0 && k != (parent_source_tag.length - 1)) { // cycle if the cells is the last parent
                            mirror_json = mirror_json[parent_source_tag[k]][0];
                        }
                        if (k == parent_source_tag.length - 1) { // check if pranent level reaches the length (typically works for first level)
                            for (var i = 0; i < parent_target_tag.length; i++) { // check the target parent length is more than one index for get the sub level json node
                                if (i == 0) { // form the target JSON to assign Target data

                                    if (parent_target_tag[i] != "") {
                                        target_mirror = tar[parent_target_tag[i]];
                                    } else {
                                        target_mirror = tar;
                                    }
                                    if (i == parent_target_tag.length - 1) { // calling assignTarget function when the length of the target parent is one;
                                        if (previousindex.len > 0) {
                                            for (var e = 0; e < previousindex.len; e++) {
                                                //target_mirror = previousindex.targetdata[e][parent_target_tag[i]]; // i represents child loop - target parent length
                                                if (map.mapping_data[counter].data_type == "index") {
                                                    if (target_mirror.length < previousindex.len) {
                                                        target_mirror.splice(previousindex.len);
                                                    }
                                                }
                                                previousindex.targetdata = [];
                                                previousindex.targetdata.push(target_mirror[e]);

                                                temp_index=e;
                                                assignTarget = await assignTargetData(previousindex.data[e][parent_source_tag[k]], previousindex.targetdata, map.mapping_data, counter); // calling assignTarget function when the length of the target parent more than one;
                                                // myarr = "";

                                            }
                                        } else {
                                            assignTarget = await assignTargetData(mirror_json, target_mirror, map.mapping_data, counter);
                                        }
                                    }
                                } else {
                                    if (target_mirror.length != undefined) {
                                        previousindex.targetdata = target_mirror;
                                        if (map.mapping_data[counter].target_key_name == parent_target_tag[i]) {
                                            previousindex.targetdata = target_mirror;
                                            target_mirror = target_mirror;
                                        } else {
                                            target_mirror = target_mirror[0][parent_target_tag[i]];
                                        }
                                    } else {
                                        previousindex.targetdata = target_mirror[parent_target_tag[i]];
                                        target_mirror = target_mirror[parent_target_tag[i]];
                                    }
                                    if (i == parent_target_tag.length - 1) { // check the length of the target parent and if reaches the maximum execute assign data
                                        if (previousindex.len > 0) {
                                            for (var e = 0; e < previousindex.len; e++) {
                                                target_mirror = previousindex.targetdata[e][parent_target_tag[i]]; // i represents child loop - target parent length
                                                assignTarget = await assignTargetData(previousindex.data[e][parent_source_tag[k]], target_mirror, map.mapping_data, counter); // calling assignTarget function when the length of the target parent more than one;
                                            }
                                        } else {
                                            if (previousindex.targetdata.length > 0) {
                                                target_mirror = previousindex.targetdata;
                                                if (mirror_json.length < target_mirror.length) {
                                                    target_mirror.splice(mirror_json.length);
                                                } // calling assignTarget function when the length of the target parent more than one;
                                                for (z = 0; z < mirror_json.length; z++) {
                                                    assignTarget = await assignTargetData(mirror_json, target_mirror, map.mapping_data, counter);
                                                }
                                            } else {
                                                target_mirror = previousindex.targetdata;
                                                assignTarget = await assignTargetData(mirror_json, target_mirror, map.mapping_data, counter); // calling assignTarget function when the length of the target parent more than one;
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            mirror_json = mirror_json[parent_source_tag[k]];
                        }
                    }
                }
            }
        }
        // else{
        //   mirror_json=src;
        //   target_mirror=tar;
        //   assignTarget = await assignTargetData(mirror_json, target_mirror, map.mapping_data, counter); // calling assignTarget function when the length of the target parent more than one;
        // }
        if (counter == maplength) {
            console.log("ALL DONE");
            console.log(tar);
        } else if (counter < maplength) {
            counter++;
           return get_s_data(src, tar, parent_source_tag, counter);
        }

    } else {
        console.log("done")
    }
}

module.exports.mappingJSON = mappingJSON;
