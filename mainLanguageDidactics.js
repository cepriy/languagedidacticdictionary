var divOutput = $("#divOutput");
var txtArQuery = $("#txtArQuery");
var names = new Array();
const substrMaxLength = 5;
function updateInterface() {
    interfaceLanguage = $("input[name='language']:checked").val();
    txtArQuery.attr("placeholder", langUpdateArray[interfaceLanguage]["introduceTermStr"]);
    $("#title").text(langUpdateArray[interfaceLanguage]["dictionaryNameStr"]);
    $("#about").text(langUpdateArray[interfaceLanguage]["about"]);
    $("#selectInterfaceLang").text(langUpdateArray[interfaceLanguage]["selectInterfaceStr"]);
    $("#makeConcordance").text(langUpdateArray[interfaceLanguage]["generateConcordanceStr"]);
}
updateInterface();
$("#langSelect").change(function (){
    updateInterface();
})

txtArQuery.keyup(function (event) {
    if (event.keyCode == 13) {
        findTranslation(txtArQuery.val().trim());
        makeConcorddance();
    }
});

concordanceData = JSON.parse(concordance);


$("#title").text(langUpdateArray[interfaceLanguage]["dictionaryNameStr"]);

txtArQuery.click( function (){
    txtArQuery.val("");
    divOutput.text("");
})

let entries = readJSONdata();
parseData(entries);

function readJSONdata() {

    // fetch(fileUrl)  // IMPLEMENT THIS JSON READING IF POSSIBLE HAVING PASSE THE FILEPATH AS THE ARGUMENT
    // .then(response => {
    //                  return response.json();})
    //            .then(jsondata => console.log(jsondata) );

    return JSON.parse(data);

}

function preprocessTerm(term) {
    let result = "";
    term = term.trim().toLowerCase().replaceAll("\\(","")
        .replaceAll(")", "")
        .replaceAll("$", ",");
    if (term.includes(" ")) {

        let arr = term.split(" ");
        result = "(";
        arr.forEach( function (element, index){
            let maxLenght = substrMaxLength;
            if (element.length <= substrMaxLength && element.length >= 4 ) {maxLenght = substrMaxLength-2}
            result = result + element.substring(0, maxLenght) +".{0,27}?";
        });
        result = result + ")([ \.,:;\\n]+)";  // terminates the first group and start the second one with a delimiter

    }
    else if (term.length > substrMaxLength) { result = "(" + term.substring(0, substrMaxLength) + ".{0,17}?)([ \.,:;\\n]+)";}
    else result = term;
    return result;
}

function parseData(data) {
    data.forEach(function (item){
        names = names.concat(item.spanish.split(","));
        names = names.concat(item.ukrainian.split(","))

    })
    console.log("names:")
    console.log(names)
}

$(document).ready(function () {

  txtArQuery.autocomplete(
        {
            source: names.map(function(item){
                return item.replaceAll('$', ',');
            }),
            minLength: 3,
            select: function (event, ui) {
                if (ui.item) {
                    $(event.target).val(ui.item.value);
                }
                findTranslation(txtArQuery.val().trim());
            }
        });
});

function highlightString (text, string1, string2){ // the string might be either original, either translation

    console.log("preprocessed string" + new RegExp( preprocessTerm(string1)))
           return  text.replace(new RegExp( preprocessTerm(string1),  "ig"), "<mark>$1</mark>$2")
                .replace(new RegExp( preprocessTerm(string2),  "ig"), "<mark>$1</mark>$2");
}

// $("#makeConcordance").click (function (){
//
// })

function makeConcorddance(){
    $("#concordTable").empty();
    let term = preprocessTerm(txtArQuery.val().trim());
    concordanceData.forEach(function (item){
        if (new RegExp(term).test(item.original) || new RegExp(term).test(item.translation) ||
            ( item.original.length > 2 && item.original.toLowerCase().includes(txtArQuery.val().trim())) || (item.translation.length > 2 && item.translation.toLowerCase().includes(txtArQuery.val().trim()))){ // because 'test' will not work if the fragment contains brackets and other special symbols

            let originalStringSet = divOutput.text().split(", ");
            let highlightedOriginalString = item.original;
            let translationsSet = divOutput.text().split(", ");
            let hightlightedTranslationString = item.translation;
           // alert(hightlightedTranslationString + " " + term.substring(0,4) + " swapping")
            if (hightlightedTranslationString.includes(term.substring(1,5))){ //because the zero character is a bracket as a part of regex

                let temp = hightlightedTranslationString;
                hightlightedTranslationString = highlightedOriginalString;
                highlightedOriginalString = temp;
            }
            originalStringSet.forEach(function (original){
                if (original.length > 2)  {highlightedOriginalString = highlightString( highlightedOriginalString,  txtArQuery.val().trim(),original);}

            })
            let row = $('<tr/>',{}).appendTo($("#concordTable"));
            $('<th/>',{
                html: highlightedOriginalString + "<br/>",
                css:{
                    width:"350px"
                }
            }).appendTo(row);


            translationsSet.forEach(function (translation){
                if (translation.length > 2)  {hightlightedTranslationString = highlightString( hightlightedTranslationString,  txtArQuery.val().trim(),translation);}
            })

            $('<th/>',{
                html: hightlightedTranslationString + "<br/>",
                css:{
                    width:"350px"
                }
            }).appendTo(row);
        }
    })
}

function findTranslation(term) {
    divOutput.text("");
    entries.forEach(function (currentEntry) {


        currentEntry.spanish.split(",").forEach(function (spName) {
            if (term === spName.trim().replaceAll("$", ",")) {
                if (divOutput.text().length > 1){
                    divOutput.text(divOutput.text() + ", " + currentEntry.ukrainian);}
                else{
                    divOutput.text(currentEntry.ukrainian);
                }
            }
        })
        currentEntry.ukrainian.split(",").forEach(function (ukrainian) {
            if (term === ukrainian.trim().replaceAll("$", ",")) {
                if (divOutput.text().length > 1){
                divOutput.text(divOutput.text() + ", " + currentEntry.spanish);}
                else{
                    divOutput.text(currentEntry.spanish);
                }
            }
        })
           divOutput.attr('readonly', true);
    });
    makeConcorddance();
}