const fs = require('fs'),
      pdf = require('pdf-parse'),
      jsonfile = require('jsonfile');
let   conferenciasQualis = [], conferenciasLattes, conferenciaLattes = {}, conferenciaQualis = {};


exports = module.exports.AvaliacaoConferencia = AvaliacaoConferencia


function AvaliacaoConferencia(config, callback) {
    
    new Conferencia(config, callback);
}


function Conferencia(config, callback) {

    this.parsePdfToTxt(config.arquivoConferencias, callback);
    this.parseXmlToJson(config.arquivoLattes);
    this.salvaConferencias();
}


Conferencia.prototype.parsePdfToTxt = function(arquivoConferencias) {

    pdf(fs.readFileSync(arquivoConferencias)).then(function(data) {
        fs.writeFileSync(
            "./conferencias.txt", 
            data.text, 
            function(err) {
                if(err) {
                    return console.log("Erro na escrita do arquivo: " + err);
                }
            }  
        ); 
    });
}


Conferencia.prototype.parseXmlToJson = function(arquivoLattes) {
    
    var convert = require('xml-js'),
        xml = fs.readFileSync(arquivoLattes, 'utf8'),
        options = {
            ignoreComment: true, alwaysChildren: true, compact: true, addParent: true, spaces: 2
        },
        result = convert.xml2json(xml, options); 

    fs.writeFile(
        "./curriculo-lattes.json", 
        result, 
        function(err) {
          if(err) {
            return console.log(err);
          }
        }  
    );     
}


Conferencia.prototype.salvaConferencias = function() {
    
    jsonfile.readFile("./curriculo-lattes.json", function (err, obj) {
        if (err) console.error(err)
        conferenciasLattes = obj['CURRICULO-VITAE']['PRODUCAO-BIBLIOGRAFICA']['TRABALHOS-EM-EVENTOS']['TRABALHO-EM-EVENTOS'];
        salvaConferenciaQualis();
    });
}


function salvaConferenciaQualis() {
    
    fs.readFile("./conferencias.txt", 'utf8', function(err, data) {
        if (err) throw err;        
        conferenciasQualis = data.toString().split("\n");
        comparaConferencias(conferenciasLattes, conferenciasQualis);
    });
}


function comparaConferencias(conferenciasLattes, conferenciasQualis) {

    console.log("Lattes: ", conferenciasLattes.length);
    console.log("Qualis: ", conferenciasQualis.length);   
}


function getInfosLattes(eventoLattes) {

    conferenciaLattes.nome = eventoLattes['DETALHAMENTO-DO-TRABALHO']['_attributes']['NOME-DO-EVENTO'].toUpperCase();
    conferenciaLattes.tituloTrabalho = eventoLattes['DADOS-BASICOS-DO-TRABALHO']['_attributes']['TITULO-DO-TRABALHO'];
}


function criaConferenciaQualis(linha) {

    // Remove os ultimos 2 caracteres da string. ex: B1
    conferenciaQualis.nome = linha.slice(0, linha.length-2).toUpperCase();
    conferenciaQualis.conceito = linha.slice(-2);
    var n = conferenciaQualis.nome.indexOf(" -");
    conferenciaQualis.nome = conferenciaQualis.nome.substring(n/2);
}