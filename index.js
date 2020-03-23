const request = require('request');

var url = 'https://en.wikipedia.org/w/api.php?'
var wikidataurl = 'https://wikidata.org/w/api.php?'
var queryInicial = 'action=query&prop=pageimages|pageprops&ppprop=wikibase_item&piprop=original&pilicense=any&generator=categorymembers&gcmlimit=100&gcmtitle=Category:Pulitzer_Prize_for_Fiction_winners&format=json'
var query2 = 'action=wbgetentities&props=labels|claims&languages=en&ids='
var query3 = 'action=wbgetentities&props=labels'
var continueResponse = function (body) {
    return body.continue.picontinue
}
var cont
var parsedContent = []
var paises = []

request(url + queryInicial, {json: true}, (err, res, body) => {

    if (err) {return console.log(err);}

    getStuff(body);

    if (body.hasOwnProperty('continue')) {

        cont = '&picontinue=' + continueResponse(body)
        let newQuery = url + queryInicial + cont

        request(newQuery, {json: true}, (err, res, extra) => {
            if (err) {return console.log(err);}
            getExtraStuff(extra);
            logStuff();
        })
    }

});

function logStuff() {
    // for (i = 0; i < parsedContent.length; i++) {
    //     console.log('Autores do Pulitzer de Ficção - Nº' + i + ' : ' + parsedContent[i].nome);
    //     console.log('Imagem do Autor: ' + (parsedContent[i].img || "Sem Imagem"));
    // }
    // console.log(parsedContent.length);
    handleArray(parsedContent)
}

function getStuff(body) {

    let respostas = (body.query.pages);

    for (resposta in respostas) {
        if (respostas[resposta].original != undefined) {
            let objeto = {
                nome: respostas[resposta].title,
                id: respostas[resposta].pageprops.wikibase_item,
                img: respostas[resposta].original.source
            };
            parsedContent.push(objeto);

        } else {
            let objeto = {
                nome: respostas[resposta].title,
                id: respostas[resposta].pageprops.wikibase_item,
            };
            parsedContent.push(objeto);
        }
    }
}

function getExtraStuff(extra) {

    let respostas = (extra.query.pages);

    for (resposta in respostas) {
        if (respostas[resposta].original != undefined) {
            let objeto = {
                nome: respostas[resposta].title,
                id: respostas[resposta].pageprops.wikibase_item,
                img: respostas[resposta].original.source
            };

            for (content of parsedContent) {
                if (objeto.nome == content.nome) {
                    content.img = objeto.img;
                }
            }

        }


    }

}

function handleArray(array) {

    array.forEach(element => {queryEntity(element)});

    let i = 0

    function queryEntity(entity) {
        let id = entity.id

        // console.log(url+query2+id+'&format=json')
        request(wikidataurl + query2 + id + '&format=json', {json: true}, (err, res, body) => {
            if (err) {return console.log(err);}

            console.log(i)
            // if(body.entities.labels != undefined){
            // console.log(body.entities.labels['pt-br'].value)
            for (entity in body.entities) {

                // p569 - date of birth
                let dateOfBirth = new Date(Date.parse((body.entities[entity].claims.P569[0].mainsnak.datavalue.value.time).slice(1)))
                let renderedDOB = dateOfBirth.getDate() + '-' + (dateOfBirth.getMonth() + 1) + '-' + dateOfBirth.getFullYear()

                function getAge(dateString) {
                    var today = new Date();
                    var birthDate = new Date(dateString);
                    var age = today.getFullYear() - birthDate.getFullYear();
                    var m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    return age;
                }

                let idade = getAge(dateOfBirth);

                // P21 - sex or gender (female or male)
                let sexo = body.entities[entity].claims.P21[0].mainsnak.datavalue.value.id

                // P27 - country
                let pais = body.entities[entity].claims.P27[0].mainsnak.datavalue.value.id

                // p19 - place of origin
                let lugarDeOrigem = body.entities[entity].claims.P19[0].mainsnak.datavalue.value.id

                let objeto = {
                    nome: (body.entities[entity].labels["en"].value),
                    nascimento: renderedDOB,
                    sexo: sexo,
                    idade: idade,
                    pais: pais,
                    local: lugarDeOrigem,
                }

                // console.log(objeto)
                array.push(objeto)
                array.pop(entity)
            }
            // }
            i++
    console.log(array)

        })

    }

}

// ================= Não VAI FUNCIONAR ================= REVER!!!
// async function getCountry(country) {
//     var objeto 
// let promise = new Promise((resolve, reject) => {
// request((wikidataurl + query3 + '&languages=en&ids=' + country + '&format=json'), {json: true}, (err, res, countrystuff) => {
//     if (err) {return console.log(err);}   
//     for (entity in countrystuff.entities) {
//         let codigo = country
//         let nomepais = countrystuff.entities[entity].labels["en"].value
//          objeto = {
//             codigo: codigo,
//             label: nomepais
//         } 
//         return objeto.label
        
//     }
// }) 

// })
// let result = await promise;

// return result     

// }