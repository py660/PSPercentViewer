//import * as mhtml2html from './mhtml2html.js';
//console.log(mhtml2html);
document.getElementById("upload").addEventListener("change", activate, false);
function getContent(){
    return new Promise((resolve,reject)=>{
        let file = document.getElementById("upload").files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                resolve(evt.target.result);
            }
            reader.onerror = function (evt) {
                throw Error("Error reading file. Please check logs for more details.");
            }
        }
        else {
            throw Error("No file provided, aborting.");
        }
    });
}
async function activate(){
    try{
        let content = await getContent();//.replace('href="/', 'href="https://powerschool.newcanaan.k12.ct.us/').replace('src="/', 'src="https://powerschool.newcanaan.k12.ct.us/');
        console.log(content);
        let win = window.open("");
        console.log(mhtml2html);
        let converted =  mhtml2html.convert(content);
        console.log(converted);
        win.document.documentElement.innerHTML = converted.window.document.documentElement.innerHTML.replace('screen.css', 'https://powerschool.newcanaan.k12.ct.us/images/css/screen.css').replace('../../', 'https://powerschool.newcanaan.k12.ct.us/');
        console.log(win);
        win.window.onload = ()=>{console.log("bye");alert("hi"); win.document.body.style.lineHeight="2em !important"};
        console.log(win.window.onload);
        
        let interval = setInterval(()=>{
        try{
            let quarter = win.document.querySelector("table.linkDescList").children[0].children[1].children[3].innerText;
            let weights = win.document.querySelector("table.tablesorter.grid").children[1].children;
            let currentWeight = {}
            let weightsEnabled;
            for (let weight of weights){
                if (weight.children[0].innerText == quarter){
                    if (weight.children[1].innerText == "Category_Weighting"){
                        weightsEnabled = true;
                        console.log(weight.children[2].innerText);
                        for (let category of weight.children[2].innerText.split("\n")){
                            let [score, ...title] = category.split(" ");
                            score = parseInt(score.slice(1,-1));
                            title = title.join(" ");
                            console.log(score, title);
                            currentWeight[title] = score;
                        }
                    }
                    else{
                        weightsEnabled = false;
                    }
                }
            }
            let gradetable = win.document.querySelector("table[data-ng-if='studentAssignmentScoresCtrlData.loaded']");
            let totalGrade = [0, 0];
            for (let assignment of gradetable.children[1].children){
                if (! assignment.id.startsWith("assignmentsection_")){
                    continue;
                }
                //console.log(assignment);
                let category = assignment.children[1].children[1].innerText;
            
                let i;
                if (assignment.children[10].children.length > 1){
                    i = 1;
                }
                else{
                    i = 0;
                }
                let scoreStr = assignment.children[10].children[i].innerText.split("\n")[0].split("/");
                //console.log(scoreStr);
                let weight;
                if (scoreStr[0].startsWith("(")){
                    console.log("Weighted again");
                    console.log(scoreStr);
                    scoreStr[0] = scoreStr[0].slice(1);
                    scoreStr[1] = scoreStr[1].slice(0,-1);
                    console.log(scoreStr);
                    weight = parseInt(scoreStr[1]);
                }
                else{
                    weight = weightsEnabled ? currentWeight[category] : parseInt(scoreStr[1]);
                }
                //console.log(assignment.children[10].children[0].innerText.split("\n"))
                let score = parseFloat(scoreStr[0])/parseInt(scoreStr[1]);
                if (isNaN(score)){
                    continue;
                }
                totalGrade[0] += ~~(weight*score*10)/10;
                totalGrade[1] += weight;
                console.log(~~(weight * score *10)/10 + "/" + weight);
                console.log(category);
                assignment.children[10].children[0].innerText = assignment.children[10].children[0].innerText.split("\n")[0] + `\n[${~~(weight*score*10)/10}/${weight}]`;
            }
            
            win.document.querySelector("table.linkDescList").children[0].children[1].children[4].innerText = win.document.querySelector("table.linkDescList").children[0].children[1].children[4].innerText.split("\n")[0] + `\n[${~~(totalGrade[0]/totalGrade[1]*1000)/10}/100]`;
            
            clearInterval(interval);
        }catch(e){console.log(e)}
        }, 1000);
            
    }catch(e){alert(e)}
}