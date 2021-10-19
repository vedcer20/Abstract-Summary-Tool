const inp = document.getElementById("inp");
const btn = document.getElementsByClassName("submit")[0];
const infoDisplay = document.getElementsByClassName("msg_board")[0]

const exceptions = ["", "it", "is", "and", "the", "that", "them", "they", "who", "what", "when", "his", "her", "him", "she", "he", "all", "we", "a", "an", "for", "to", "but", "at", "by", "on", "as", "in", "of", "so", "by", "nor", "or", "up", "yet",];

function summarizer(str, resCount) {
    if (!!str.match(/[\\.!?]/) == true) {
        let unformattedSens = getSens(str.split(" "));
        let sens = cleanWords(getSens(str.replace(/[()]/g, "").split(" ")));
        let words = cleanWords(sens.join().split(" "));
        let freqWrds_ = freqWrds(words, sens, resCount);
        let scores = scoring(sens, freqWrds_);
        let imps_ = imps(scores);
        let result = identify(unformattedSens, imps_);
        return result;
    }
    else {
        return str;
    }
}

function cap1st(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function identify(sens, imps_) {
    let temp = [];
    for (let i = 0; i < imps_.length; i++) {
        temp.push(cap1st(sens[imps_[i]]));
    }
    return temp.join("");
}

function cleanWords(arr) {
    let temp = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].trim().length > 1) {
            if (isNaN(arr[i])) {
                temp.push(arr[i]);
            }
        }
    }
    return temp;
}

function imps(scores) {
    let total_score = 0,
        total_cutOffs = 0,
        temp = [];
    for (let i = 0; i < scores.length; i++) {
        total_score += scores[i].score;
    }
    for (let i = 0; i < scores.length; i++) {
        total_cutOffs += (scores[i].score / total_score)
    }
    let cutOff = total_cutOffs / scores.length;
    let extra = cutOff / scores.length;
    for (let i = 0; i < scores.length; i++) {
        if ((scores[i].score / total_score) + extra >= cutOff) {
            temp.push(scores[i].sen)
        }
    }
    return temp;
}

function getSens(arr) {
    let temp = [];
    let str = "";
    for (let i = 0; i < arr.length; i++) {
        str += arr[i] + " ";
        if (!!arr[i].match(/[\\.!?]/) == true) {
            if (isNaN(arr[i].replace(/[()]/g, ""))) {
                if (!!arr[i].replace(/[()]/g, "").match(/^([a-z]\.)+$/i) == false) {
                    temp.push(str);
                    str = "";
                }
            }
        }
    }
    return temp;
}

function freqWrds(words, sens, resCount) {
    let freqs = [];
    sens = sens.map((sentences) => {
        return sentences.toLowerCase();
    });
    words = words.map((words) => {
        return words.split(/[\\.!?,]/)[0].toLowerCase();
    });
    for (let i = 0; i < words.length; i++) {
        if (!exceptions.includes(words[i])) {
            if (words[i].trim().length > 1) {
                freqs.push({
                    word: words[i],
                    freq: numberOfThings(sens.join(), words[i]) / words.length,
                });
            }
        }
    }
    freqs.sort((a, b) => (a.freq < b.freq ? 1 : -1));
    freqs = getUnique(freqs, "word");
    freqs = getRes(freqs, resCount)
    return freqs;
}

function getRes(freqs, resCount) {
    let temp = [],
        result = freqs,
        def = 5;
    if (resCount > def) {
        def = resCount;
    }
    for (let i = 0; i < def; i++) {
        temp.push(freqs[i])
        if (freqs.length - 1 == i) {
            break;
        }
    }
    if (temp.length > 0) {
        result = temp;
    }
    return result;
}

function scoring(sens, freqWrds) {
    let temp = [];
    for (let i = 0; i < sens.length; i++) {
        let score = 0;
        for (let j = 0; j < freqWrds.length; j++) {
            let count = numberOfThings(sens[i], freqWrds[j].word);
            score += count + freqWrds[j].freq;
        }
        if (score > 0) {
            temp.push({ "sen": i, "score": score })
        }
    }
    temp.sort((a, b) => (a.score < b.score ? 1 : -1));
    return temp;
}

function getUnique(arr, key) {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
}

function numberOfThings(str, thing) {
    let regex = new RegExp(thing, "g");
    return (count = (str.match(regex) || []).length);
}

function submit() {
    if(inp.value.trim().length>0){
        if(!!inp.value.match(/[\\.!?]/) == true){
            return summarizer(inp.value);
        }
        else{
            return "puncMiss"
        }
    }
    else{
        return false;
    }
}
let clicked = false;
let done = false;
btn.addEventListener("click",()=>{
    if(!clicked){
        clicked = true;
        let result = submit();
        if(result){
            if(result=="puncMiss"){
                convey("Make sure sentences are sepeated by punctuation [.!?]","color:red;")
            }
            else{
                let extra = "";
                let color;
                let newRes = submit();
                if(newRes.trim().length!==inp.value.trim().length){
                    extra="Click again to get a simpler summary."
                    color="grey";
                }
                else{
                    extra = "This is as simple as it can get.";
                    color="blue"
                }
                convey(`<p>Entry successfully summarized. <br>${extra}</p>`,`color:${color};`)
                inp.value = result;
            }
        }
        else{
            convey("<p>Empty input field. Actually enter something...</p>","color:red")
        }
        setTimeout(()=>{
            clicked = false;
        },2500)
    }
})

function convey(msg,style){
    infoDisplay.classList.add("hidden");
    setTimeout(()=>{
        infoDisplay.innerHTML=msg;
        infoDisplay.style=style;
    },500)
    setTimeout(()=>{
        infoDisplay.classList.remove("hidden");
    },500)
    setTimeout(()=>{
        infoDisplay.classList.add("hidden");
    },2500)
}