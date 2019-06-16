const fs = require('fs');
const path = require('path');


var self = module.exports = {


    retornaJsonObj : function (filepath) { 

        let file = path.join(__dirname, filepath);
    
        let data = fs.readFileSync(file, 'utf8', function(err, data) {
    
            if (err) throw err;               
        });
    
        return JSON.parse(data);
    },

    retornaLattesArtigos : function(jsonLattesObj) {

        return jsonLattesObj['CURRICULO-VITAE']['PRODUCAO-BIBLIOGRAFICA']['ARTIGOS-PUBLICADOS']['ARTIGO-PUBLICADO'];
    },

    retornaLattesEventos : function (jsonLattesObj) {

        return jsonLattesObj['CURRICULO-VITAE']['PRODUCAO-BIBLIOGRAFICA']['TRABALHOS-EM-EVENTOS']['TRABALHO-EM-EVENTOS'];
    },

    cruzaDadosEve : function (conferenciasLattes, conferenciasQualis, anoInicial, anoFinal, similaridade, origem) {

        let stringSimilarity = require('string-similarity');
        let conferenciaLattes = {}, conferenciaQualis = {}, conferenciasEncontradas = [], conferenciasNaoEncontradas = [], qualis = [];
        let flag, cont;
    
        for ( var i in conferenciasLattes ) {  
            
            self.getInfosConferenciaLattes(conferenciaLattes, conferenciasLattes[i]);
    
            if ( conferenciaLattes.anoTrabalho >= anoInicial && conferenciaLattes.anoTrabalho <= anoFinal ) {
    
                cont = 0; flag = false; 
                var maiorSimilaridade = 0, conferencia = {};
    
                for ( var j in conferenciasQualis ) {
    
                    self.getInfosConferenciaQualis(conferenciaQualis, conferenciasQualis[j]);
                    
                    var resultadoSimilaridade = stringSimilarity.compareTwoStrings(conferenciaLattes.nome, conferenciaQualis.nome); 
                    
                    if ( resultadoSimilaridade >= similaridade ) {
    
                        if ( resultadoSimilaridade > maiorSimilaridade ) maiorSimilaridade = resultadoSimilaridade;
    
                        self.preencheObjConferencia(conferencia, conferenciaLattes, conferenciaQualis, maiorSimilaridade);
                        flag = true;
                    } 
                    
                    cont++;
                    
                    if ( origem == 'conferencia' ) self.salvaConferenciasNaoEncontradas(conferenciasNaoEncontradas, conferenciaLattes, conferenciasQualis, cont, flag, resultadoSimilaridade);
                }      
    
                if ( conferencia.similaridade ) {

                    conferenciasEncontradas.push(conferencia);
                    qualis.push(conferencia.qualis);
                    if ( origem == 'conferencia' ) self.escreveJsonObj("./resultado_conferencias_encontradas.json", conferenciasEncontradas);
                }
            }
        }
        if ( origem == 'indice' ) return qualis;
    },

    getInfosConferenciaLattes : function (conferenciaLattes, indice) {

        conferenciaLattes.nome = indice['DETALHAMENTO-DO-TRABALHO']['_attributes']['NOME-DO-EVENTO'].toUpperCase();
        conferenciaLattes.tituloTrabalho = indice['DADOS-BASICOS-DO-TRABALHO']['_attributes']['TITULO-DO-TRABALHO'];
        conferenciaLattes.anoTrabalho = indice['DADOS-BASICOS-DO-TRABALHO']['_attributes']['ANO-DO-TRABALHO'];
    },

    getInfosConferenciaQualis : function (conferenciaQualis, indice) {

        conferenciaQualis.nome = indice.nome.toUpperCase();
        conferenciaQualis.sigla = indice.sigla;
        conferenciaQualis.conceito = indice.qualis;
    },

    preencheObjConferencia : function(conferencia, conferenciaLattes, conferenciaQualis, maiorSimilaridade) {

        conferencia.nomeTrabalho = conferenciaLattes.tituloTrabalho; 
        conferencia.eventoLattes = conferenciaLattes.nome; 
        conferencia.eventoQualis = conferenciaQualis.nome; 
        conferencia.ano = conferenciaLattes.anoTrabalho;
        conferencia.qualis = conferenciaQualis.conceito; 
        conferencia.similaridade = maiorSimilaridade; 
    },

    salvaConferenciasNaoEncontradas : function (conferenciasNaoEncontradas, conferenciaLattes, conferenciasQualis, cont, flag, resultadoSimilaridade) {

        let conferencia = {};
    
        if ( cont == conferenciasQualis.length && flag == false ) {
            
            conferencia.nomeTrabalho = conferenciaLattes.tituloTrabalho; 
            conferencia.eventoLattes = conferenciaLattes.nome; 
            conferencia.ano = conferenciaLattes.anoTrabalho;
            // conferencia.similaridade = String(resultadoSimilaridade);
    
            conferenciasNaoEncontradas.push(conferencia);
            self.escreveJsonObj("./resultado_conferencias_nao_encontradas.json", conferenciasNaoEncontradas);
        }   
    },
        
    escreveJsonObj : function (filePath, data) {
    
        var json = JSON.stringify(data, null, " ");
    
        fs.writeFileSync(filePath, json, function(err) {
            
            if (err) return console.log("Erro na criação de arquivo com resultado final: " + err);
            console.log('Arquivo gerado com sucesso.');
        })  
    }
}