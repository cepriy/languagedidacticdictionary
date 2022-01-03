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

$("#txtArQuery").keyup(function (event) {
    if (event.keyCode == 13) {
        $("#makeConcordance").click();
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
    term = term.toLowerCase().trim().replaceAll("\\(","")
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

    $("#txtArQuery").autocomplete(
        {
            source: names.map(function(item){
                return item.replaceAll('$', ',');
            }),
            select: function (event, ui) {
                if (ui.item) {
                    $(event.target).val(ui.item.value);
                }
                findTranslation();
            }
        });
});

function highlightString (text, string1, string2){ // the string might be either original, either translation

    console.log("preprocessed string" + new RegExp( preprocessTerm(string1)))
           return  text.replace(new RegExp( preprocessTerm(string1),  "ig"), "<mark>$1</mark>$2")
                .replace(new RegExp( preprocessTerm(string2),  "ig"), "<mark>$1</mark>$2");
}

$("#makeConcordance").click (function (){
    $("#concordTable").empty();
    let term = preprocessTerm(txtArQuery.val());
   concordanceData.forEach(function (item){
        if (new RegExp(term).test(item.original) || new RegExp(term).test(item.translation) ||
            ( item.original.length > 2 && item.original.toLowerCase().includes(txtArQuery.val())) || (item.translation.length > 2 && item.translation.toLowerCase().includes(txtArQuery.val()))){ // because 'test' will not work if the fragment contains brackets and other special symbols
            let row = $('<tr/>',{}).appendTo($("#concordTable"));
           $('<th/>',{
                html: highlightString( item.original , divOutput.text(), txtArQuery.val()) + "<br/>",
                css:{
                    width:"350px"
                     }
            }).appendTo(row);

            let translationsSet = divOutput.text().split(", ");
            let hightlightedTranslationString = item.translation;
            translationsSet.forEach(function (translation){
                if (translation.length > 2)  {hightlightedTranslationString = highlightString( hightlightedTranslationString,  txtArQuery.val(),translation);}
            })

           $('<th/>',{
                html: hightlightedTranslationString + "<br/>",
                css:{
                width:"350px"
                }
            }).appendTo(row);
         }
    })
})

function findTranslation() {
    divOutput.text("");
    entries.forEach(function (currentEntry) {


        currentEntry.spanish.split(",").forEach(function (spName) {
            if (txtArQuery.val() === spName.trim().replaceAll("$", ",")) {
                if (divOutput.text().length > 1){
                    divOutput.text(divOutput.text() + ", " + currentEntry.ukrainian);}
                else{
                    divOutput.text(currentEntry.ukrainian);
                }
            }
        })
        currentEntry.ukrainian.split(",").forEach(function (ukrainian) {
            if (txtArQuery.val() === ukrainian.trim().replaceAll("$", ",")) {
                if (divOutput.text().length > 1){
                divOutput.text(divOutput.text() + ", " + currentEntry.spanish);}
                else{
                    divOutput.text(currentEntry.spanish);
                }
            }
        })
           divOutput.attr('readonly', true);
    })
}