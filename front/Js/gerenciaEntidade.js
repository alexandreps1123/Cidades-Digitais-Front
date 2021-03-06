//pega o CNPJ escolhido anteriormente
let meuCNPJ = localStorage.getItem("cnpj");

let cidades = [];


window.onload = function () {

  fetch(servidor + 'read/municipio', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + meuToken
    },
  }).then(function (response) {
    mascara()
    //tratamento dos erros
    if (response.status == 200) {
      return response.json().then(function (json) {
        //pegando valores para usar em municipios
        cidades = json;
        //cria variaveis
        let i, j = 0;
        let x = [],
          valorUF = [],
          valorFinalUF = [];

        //faz a ligação entre variaveis e valores do banco
        for (i = 0; i < json.length; i++) {
          valorUF[i] = json[i].uf;
          if (valorUF[i] != valorUF[i - 1]) {
            valorFinalUF[j] = valorUF[i];
            j++;
          }
        }
        for (i = 0; i < j; i++) {
          x[i] += "<option>" + valorFinalUF[i] + "</option>";
        }
        
        document.getElementById("uf").innerHTML = x;

        let y = [];
        for (i = 0; i < json.length; i++) {
          y[i] = "<option>" + json[i].nome_municipio + "</option>"
        }
        
        document.getElementById("nome_municipio").innerHTML = y;

        //captura os elementos anteriores para visualizar na edição
        document.getElementById("cnpj").value = localStorage.getItem("cnpj");
        document.getElementById("nome").value = localStorage.getItem("nome");
        document.getElementById("endereco").value = localStorage.getItem("endereco");
        document.getElementById("numero").value = localStorage.getItem("numero");
        document.getElementById("bairro").value = localStorage.getItem("bairro");
        document.getElementById("cep").value = localStorage.getItem("cep");
        document.getElementById("uf").value = localStorage.getItem("uf");
        document.getElementById("nome_municipio").value = localStorage.getItem("nome_municipio");
        document.getElementById("observacao").value = localStorage.getItem("observacao");
      });
    } else {
      erros(response.status);
    }
  });
}

function enabler() {
  let uf1 = document.getElementById("uf").value;
  document.getElementById("nome_municipio").disabled = false;
  let i, y = [];
  for (i = 0; i < cidades.length; i++) {
    if (cidades[i].uf == uf1) {
      y[i] = "<option>" + cidades[i].nome_municipio + "</option>"
    }
  }
  
  document.getElementById("nome_municipio").innerHTML = y;
}

function enviar() {

  //estrutura para o JSON usado no fetch
  let info = {
    "nome": document.getElementById("nome").value,
    "endereco": document.getElementById("endereco").value,
    "numero":  document.getElementById("numero").value,
    "bairro": document.getElementById("bairro").value,
    "cep": document.getElementById("cep").value,
    "uf": document.getElementById("uf").value,
    "nome_municipio": document.getElementById("nome_municipio").value,
    "observacao": document.getElementById("observacao").value,
  };

  //transforma as informações do token em json
  let corpo = JSON.stringify(info);
  console.log(corpo);
  //função fetch para mandar
  fetch(servidor + 'read/entidade/' + meuCNPJ, {
    method: 'PUT',
    body: corpo,
    headers: {
      'Authorization': 'Bearer ' + meuToken
    },
  }).then(function (response) {

    //tratamento dos erros
    if (response.status == 200) {
      window.location.replace("./entidade.html");
    } else {
      erros(response.status);
    }
    return console.log(response);
  });
}

//Contatos

function contatosEntidade() {
  
  //cria o botão para editar
  document.getElementById("editar").innerHTML = (`<button class="btn btn-success" data-toggle="modal" data-target="#adicionarContato">Novo Contato</button>`);

  //função fetch para chamar contatos da tabela
  fetch(servidor + 'read/contato/0/'+meuCNPJ, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + meuToken
    },
  }).then(function (response) {

    //checar os status de pedidos
    //console.log(response)

    //tratamento dos erros
    if (response.status == 200) {
      //console.log(response.statusText);

      //pegar o json que possui a tabela
      response.json().then(function (json) {

        //console.log(json);

        let tabela = (`<thead style="background: #4b5366; color:white; font-size:15px">
        <tr>
        <th style="width:20%" scope="col">Nome</th>
        <th style="width:20%" scope="col">Função</th>
        <th style="width:20%" scope="col">E-mail</th>
        <th style="width:10%" scope="col">Telefones</th>
        <th style="width:10%" scope="col">Tipo</th>
        <th style="width:30%" scope="col">Opções</th>
        </tr>
        </thead>`);
        tabela += (`<tbody>`);
        // console.log(json)
        //cria uma lista apenas com os itens do lote selecionado
        let j = 0;
        for (let i = 0; i < json.length; i++) {
          if (json[i]["cnpj"] == meuCNPJ) {
            listaItem[j] = json[i];
            j++;
          }
        }
        for (i = 0; i < listaItem.length; i++) {
          // console.log(meuCNPJ)
          //salva os valores para edição
          meuItem[i] = listaItem[i]["cod_item"];
          meuTipo[i] = listaItem[i]["cod_tipo_item"];
          
          tabela += (`<tr>`);
          tabela += (`<td>`);
          tabela += (`<span id="nome style="white-space: pre-line">` + listaItem[i]["nome"] + `</span>`);
          tabela += (`</td> <td>`);
          tabela += (`<span id="funcao style="white-space: pre-line">` + listaItem[i]["funcao"] + `</span>`);
          tabela += (`</td> <td>`);
          tabela += (`<span id="email style="white-space: pre-line">` + listaItem[i]["email"] + `</span>`);
          tabela += (`</td> <td>`);
          tabela += (`<span class="" id="telefone" style="white-space: pre-line">` + listaItem[i].telefone + `</span>`);
          tabela += (`</td> <td>`);
          tabela += (`<span class="" id="tipo" style="white-space: pre-line">` + listaItem[i].tipo + `</span>`);
          tabela += (`</td><td> 
          <span class="d-flex">
            <button onclick="visualizarContato(`+  listaItem[i].cod_contato+`,'`+ listaItem[i].nome +`','`+ listaItem[i].funcao +`','`+ listaItem[i].email +`','`+i+`')" data-toggle="modal" href="#visualizar" class="btn btn-success">
              <i class="material-icons"data-toggle="tooltip" title="Visualizar">content_paste</i>
            </button>
            <button onclick="apagarContatoTelefone(`+  listaItem[i].cod_contato+`)" class="btn btn-danger">
              <i class="material-icons"data-toggle="tooltip" title="Apagar">delete</i>
            </button>
          </span>
          </td>`);
          tabela += (`</tr>`);
          // console.log(tabela)
        }
        tabela += (`</tbody>`);
        document.getElementById("tabela").innerHTML = tabela;

        //Máscara colocada separadamente para tabela
        mascara();
        
      });
    } else {
      erros(response.status);
    }
  });
}

let id= 0
let codigoTelefone = '';
function visualizarContato(cod_contato,nome,funcao,email,identificador) {
  identificador= parseInt(identificador)
  
  fetch(servidor + 'read/telefone/' + cod_contato, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + meuToken
    },
  }).then(function (response) {

    //checar os status de pedidos
    //console.log(response)

    //tratamento dos erros
    if (response.status == 200) {
      //console.log(response.statusText);

      //pegar o json que possui a tabela
      response.json().then(function (json) {

        // console.log(json)
        let tabela = (`<thead style="background: #4b5366; color:white; font-size:15px">
          <tr>
            <th style="width:20%" scope="col">Nome</th>
            <th style="width:20%" scope="col">Função</th>
            <th style="width:20%" scope="col">E-mail</th>
            <th style="width:30%" scope="col" rowspan="`+ json.length +`">Telefone</th>
            <th style="width:9%" scope="col">Ação</th>
          </tr>
          </thead>
        <tbody>
          <tr>`);
        tabela += (`<td><input value="` + nome + `" id="nome`+identificador+`" type="text" class="nome"></td>`);
        tabela += (`<td><input value="` + funcao + `" id="funcao`+identificador+`" type="text" class="funcao"></td>`);
        tabela += (`<td><input value="` + email + `" id="email`+identificador+`" type="text" class="email"></td>`);
        tabela += (`<td><div id="maisLittleInput">`);

        if(json.length == 0){
          tabela += (`<input value="" id="telefoneNew0" type="text" class="telefone" size="14">`);
            tabela += (`&nbsp&nbsp&nbsp&nbsp
            <select name="tipo" id="tipoNew0">
              <option value=""> Tipo</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Casa">Casa</option>
              <option value="Celular">Celular</option>
              <option value="Trabalho">Trabalho</option>
            </select>
            <br/>
            <br/>
            `);
        }else{
          for (i = 0; i < json.length; i++) {
            // console.log(json)
            if(json.length !=0){
              id = i +1;
            }
            tabela += (`<input value="` + json[i].telefone + `" id="telefone`+ parseInt(1+i) +`" type="text" class="telefone" size="14">`);
            tabela += (`&nbsp&nbsp&nbsp
            <select name="tipo" id="tipo`+ parseInt(1+i) +`">
              <option value="`+json[i].tipo+`">`+json[i].tipo+`</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Casa">Casa</option>
              <option value="Celular">Celular</option>
              <option value="Trabalho">Trabalho</option>
            </select>
            <button id="butaoDelet`+ parseInt(1+i) +`" onclick="apagarTelefone(`+ json[i].cod_telefone+`);lessInput(${id});" class="btn danger">
              <i class="material-icons"data-toggle="tooltip" title="Apagar Telefone">delete</i>
            </button>
            `);
          }
        }
        
        
        // console.log(id)
        tabela += (`</div>
        <siders/>
        </td>`);
        tabela += (`</td>
        <td> 
          <span class="d-flex">
            <button onclick="editarContato(`+ identificador +`,`+cod_contato+`);editarTelefone(`+ identificador +`,`+cod_contato+`);novoTelefone(`+cod_contato+`,${pass=true});" data-toggle="modal" href="#visualizar" class="btn ">
              <i class="material-icons"data-toggle="tooltip" title="Salvar">&#xE254;</i>
            </button>
          </span> 
          <span class="d-flex">
            &nbsp&nbsp&nbsp<a class="js-btn-next" type="reset" id="clicaInput" onclick="litteInput(${true});" title="Adicionar"><img  src="img/add-icon.png" width="25px"></a>
          </span> 
        </td>`);
        tabela += (`</tr></tbody>`);
        // console.log(tabela)

        
        document.getElementById("visualiza").innerHTML = tabela;
        mascara();
      });
    } else {
      erros(response.status);
    }
  });
  // document.getElementById("tabela").innerHTML = tabela;
}

contador=0
function litteInput(passe){
  // console.log(passe)
  if(passe == true){
    $(document).ready(function(){
      mascara();
      $("siders").append(`
      <div id="pequenoInput${contador}">
        <input value="" id="telefoneNew`+ contador +`" type="text" class="telefone" size="14">
        &nbsp&nbsp&nbsp
        <select name="tipo" id="tipoNew`+ contador +`">
          <option value="">Tipo</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Casa">Casa</option>
          <option value="Celular">Celular</option>
          <option value="Trabalho">Trabalho</option>
        </select>
      </div>
      <br>
      `)
      
    });
    console.log(contador)
    contador = contador + 1;
  }
  return contador;
}

function lessInput(identifier){
  document.getElementById('maisLittleInput').removeChild(document.getElementById('telefone'+identifier));
  document.getElementById('maisLittleInput').removeChild(document.getElementById('tipo'+identifier));
  document.getElementById('maisLittleInput').removeChild(document.getElementById('butaoDelet'+identifier));
}

function editarTelefone(id,cod_contato) {

  fetch(servidor + 'read/telefone/' + cod_contato, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + meuToken
    },
  }).then(function (response) {

    //checar os status de pedidos
    //console.log(response)

    //tratamento dos erros
    if (response.status == 200) {
      //console.log(response.statusText);

      //pegar o json que possui a tabela
      response.json().then(function (json) {
        // console.log(json)

        litteInput(false)

        for (let i = 0; i < json.length; i++) {
          
          edicaoItem[i] = {
            "telefone": document.getElementById("telefone"+ parseInt(1+i)).value,
            "tipo": document.getElementById("tipo"+parseInt(1+i)).value,
          };
        
      
          // console.log(edicaoItem[i])
          //transforma as informações do token em json
          let corpo = JSON.stringify(edicaoItem[i]);
          //função fetch para mandar
          fetch(servidor + 'read/telefone/' + json[i].cod_telefone , {
            method: 'PUT',
            body: corpo,
            headers: {
              'Authorization': 'Bearer ' + meuToken
            },
          }).then(function (response) {
            //checar o status do pedido
            console.log(response.statusText);
      
            //tratamento dos erros
            if (response.status == 200 || response.status == 201) {
              setTimeout(function(){
                location.reload()
              }, 2000);
            } else {
              erros(response.status);
            }
            // window.location.replace("./gerenciaCd.html");
          });
          
        }
      });


    } else {
      erros(response.status);
    }
  });
}
function editarContato(id,cod_contato) {


  edicaoItem = {
    "nome": document.getElementById("nome"+id).value,
    "email": document.getElementById("email"+id).value,
    "funcao": document.getElementById("funcao"+id).value,
  };

  // console.log(edicaoItem)
  if (edicaoItem["nome"] != listaItem["nome"] || edicaoItem["email"] != listaItem["email"] || edicaoItem["funcao"] != listaItem["funcao"]) {
    //transforma as informações do token em json
    let corpo = JSON.stringify(edicaoItem);
    //função fetch para mandar
    fetch(servidor + 'read/contato/' + cod_contato , {
      method: 'PUT',
      body: corpo,
      headers: {
        'Authorization': 'Bearer ' + meuToken
      },
    }).then(function (response) {
      //checar o status do pedido
      console.log(response.statusText);

      //tratamento dos erros
      if (response.status == 200 || response.status == 201) {
        // location.reload();
      } else {
        erros(response.status);
      }
      // window.location.replace("./gerenciaCd.html");
    });
  }
  
}

function novoContato() {
  let infoContato = {
    "cnpj": meuCNPJ.toString(),
    "nome": document.getElementById("nomeC").value,
    "email": document.getElementById("email").value,
    "funcao": document.getElementById("funcao").value,
  };

  console.log(infoContato)
  //transforma as informações em string para mandar
  let corpo = JSON.stringify(infoContato);
  //função fetch para mandar
  fetch(servidor + 'read/contato', {
    method: 'POST',
    body: corpo,
    headers: {
      'Authorization': 'Bearer ' + meuToken
    },
  }).then(function (response) {

    //tratamento dos erros
    if (response.status == 200 || response.status == 201) {
      alert('Contato inserido com sucesso!')
      // location.reload();
    } else {
      erros(response.status);
    }
  });
}

function novoTelefone(cod_contato, pass) {

  let meuContato;
  let infoTelefone= [];
  
  //Pega o numero de inputs do modal de adicionar
  maisInput(false);
  //pega o numero de inputs do modal de editar
  litteInput(false);

  fetch(servidor + 'read/contato/0/'+meuCNPJ, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + meuToken
    },
  }).then(function (response) {
    
    //tratamento dos erros
    if (response.status == 200 || response.status == 201) {
      response.json().then(function (json) {
        
        //Pega o ultimo contato salvo
        for (let i = 0; i < json.length; i++) {
          meuContato= json[i].cod_contato;
        }
        let tel0 = document.getElementById("telefoneNew0")
        
        if(pass== true && (tel0 != null) ){
          for (let i = 0; i <= contador; i++) {
            infoTelefone[i] = {
              "cod_contato": parseInt(cod_contato),
              "telefone": document.getElementById("telefoneNew"+parseInt(i)).value,
              "tipo": document.getElementById("tipoNew"+parseInt(i)).value,
            };
          
            if(infoTelefone[i].cod_contato != null && infoTelefone[i].telefone != null && infoTelefone[i].tipo != null){
              //transforma as informações em string para mandar
              let corpo = JSON.stringify(infoTelefone[i]);
              console.log(infoTelefone[i]);
              //função fetch para mandar
              fetch(servidor + 'read/telefone', {
                method: 'POST',
                body: corpo,
                headers: {
                  'Authorization': 'Bearer ' + meuToken
                },
              }).then(function (response) {
    
                //tratamento dos erros
                if (response.status == 200 || response.status == 201) {
                  // alert('O telefone: '+ infoTelefone[i].telefone +' do tipo: '+ infoTelefone[i].tipo +' cadastrado com sucesso!');
                } else {
                  erros(response.status);
                }
              });
            }
          }
        }
        else if(pass== true && contador>0 && tel0 == null){
          for (let i = 1; i <= contador; i++) {
            infoTelefone[i] = {
              "cod_contato": parseInt(cod_contato),
              "telefone": document.getElementById("telefoneNew"+parseInt(i)).value,
              "tipo": document.getElementById("tipoNew"+parseInt(i)).value,
            };
          
            if(infoTelefone[i].cod_contato != null && infoTelefone[i].telefone != null && infoTelefone[i].tipo != null){
              //transforma as informações em string para mandar
              let corpo = JSON.stringify(infoTelefone[i]);
              console.log(infoTelefone[i]);
              //função fetch para mandar
              fetch(servidor + 'read/telefone', {
                method: 'POST',
                body: corpo,
                headers: {
                  'Authorization': 'Bearer ' + meuToken
                },
              }).then(function (response) {
    
                //tratamento dos erros
                if (response.status == 200 || response.status == 201) {
                  // alert('O telefone: '+ infoTelefone[i].telefone +' do tipo: '+ infoTelefone[i].tipo +' cadastrado com sucesso!');
                } else {
                  erros(response.status);
                }
              });
            }
          }
        }
        else{

          for (let i = 0; i < indice+1; i++) {
            infoTelefone[i] = {
              "cod_contato": parseInt(meuContato),
              "telefone": document.getElementById("telefone"+i).value,
              "tipo": document.getElementById("tipo"+i).value,
            };
          
            if(infoTelefone[i].cod_contato != null && infoTelefone[i].telefone != null && infoTelefone[i].tipo != null){
              //transforma as informações em string para mandar
              let corpo = JSON.stringify(infoTelefone[i]);
              console.log(infoTelefone[i]);
              //função fetch para mandar
              fetch(servidor + 'read/telefone', {
                method: 'POST',
                body: corpo,
                headers: {
                  'Authorization': 'Bearer ' + meuToken
                },
              }).then(function (response) {
    
                //tratamento dos erros
                if (response.status == 200 || response.status == 201) {
                  // alert('O telefone: '+ infoTelefone[i].telefone +' do tipo: '+ infoTelefone[i].tipo +' cadastrado com sucesso!');
                } else {
                  erros(response.status);
                }
              });
            }
          }
        }
        if(pass != true){
          alert('O(s) telefone(s) foi(ram) cadastrado(s) com sucesso!');
          location.reload();
        }else{
          setTimeout(function(){
            location.reload()
          }, 3000);
        }
      });
    } else {
      erros(response.status);
    }
  });
}

let indice = 0;
function maisInput(passe){
  if(passe == true && indice < 3){
    indice = indice + 1;
    $(document).ready(function(){
      mascara();
      $("side").append('<div id="telTipo'+indice+'" class="form-row mt-4">'+
                          '<div class="col-12 col-sm-6">'+
                            '<input class="multisteps-form__input form-control telefone" type="text" placeholder="Telefone" id="telefone'+indice+'" name="telefone"/>'+
                          '</div>'+
                          '<div class="col-12 col-sm-6">'+
                            '<select class="multisteps-form__input form-control" name="tipo" id="tipo'+ indice +'">'+
                              '<option value="">Tipo</option>'+
                              '<option value="WhatsApp">WhatsApp</option>'+
                              '<option value="Casa">Casa</option>'+
                              '<option value="Celular">Celular</option>'+
                              '<option value="Trabalho">Trabalho</option>'+
                            '</select>'+
                          '</div>'+
                        '</div>')
    });
    // console.log(indice)
  }
  return indice;
}

function menosInput(){
  if(indice>0){
    document.getElementById('maisTelefone').removeChild(document.getElementById('telTipo'+indice));
  }
  indice = indice -1;
  // console.log(indice)
  return indice
}

function apagarContatoTelefone(cod_contato) {

  fetch(servidor + 'read/telefone/' + cod_contato, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + meuToken
    },
  }).then(function (response) {

    //checar os status de pedidos
    //console.log(response)

    //tratamento dos erros
    if (response.status == 200) {
      //console.log(response.statusText);

      //pegar o json que possui a tabela
      response.json().then(function (json) {
        // console.log(json)

        if(json.length != 0){

          Swal.fire({
            title: 'Tem certeza?',
            text: "Que deseja excluir todos os telefones?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, tenho certeza!'
          }).then((result) => {
            
            if (result.value) {
    
              Swal.fire(
                'Sucesso!',
                'Os telefones foram excluidos com sucesso!',
                'success'
              )
              
              for (i = 0; i < json.length; i++) {
                fetch(servidor + 'read/telefone/'+json[i].cod_telefone, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': 'Bearer ' + meuToken
                  },
                }).then(function (response) {
                  console.log('Telefone deletado com sucesso!')
                });
              }
    
              Swal.fire({
                title: 'Tem certeza?',
                text: "Que deseja excluir este Contato?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, tenho certeza!'
              }).then((result) => {
                
                if (result.value) {
        
                  Swal.fire(
                    'Sucesso!',
                    'O Contato foi excluido com sucesso!',
                    'success'
                  )
                  
                  fetch(servidor + 'read/contato/'+cod_contato, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': 'Bearer ' + meuToken
                    },
                  }).then(function (response) {
                
                    console.log('Contato deletado com sucesso!')
                  });

                  setTimeout(function(){
                    location.reload()
                  }, 2000);

                } else {
        
                  location.reload();
      
                }
              });
            }
          });
        }else{
          Swal.fire({
            title: 'Tem certeza?',
            text: "Que deseja excluir este Contato?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, tenho certeza!'
          }).then((result) => {
            
            if (result.value) {
    
              Swal.fire(
                'Sucesso!',
                'O Contato foi excluido com sucesso!',
                'success'
              )
              
              fetch(servidor + 'read/contato/'+cod_contato, {
                method: 'DELETE',
                headers: {
                  'Authorization': 'Bearer ' + meuToken
                },
              }).then(function (response) {
            
                console.log('Contato deletado com sucesso!')
              });
              
              setTimeout(function(){
                location.reload()
              }, 2000);

            }
          });
        }
      })
    }
  });
}

function apagarTelefone(cod_telefone) {

  fetch(servidor + 'read/telefone/'+cod_telefone, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + meuToken
    },
  }).then(function (response) {
    //checar os status de pedidos
    console.log(response)

    //tratamento dos erros
    if (response.status == 204) {
      //console.log(response.statusText);
      alert('Telefone deletado com sucesso!')
    }
  });
}

//tabela de lote de entidade

function loteEntidade() {

  document.getElementById("editar").innerHTML = (`<br>`);
  document.getElementById("editar2").innerHTML = (`<br>`);

  //função fetch para chamar os itens de previsão da tabela
  fetch(servidor + 'read/lotecnpj/'+meuCNPJ, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + meuToken
    },
  }).then(function (response) {

    //tratamento dos erros
    if (response.status == 200) {

      //pegar o json que possui a tabela
      response.json().then(function (json) {

        // console.log(json);

        let tabela = (`<thead style="background: #4b5366; color:white; font-size:15px">
          <tr>
          <th style="width:25%" scope="col">Lote</th>
          <th style="width:40%" scope="col">Contrato</th>
          <th style="width:10%" scope="col">Data de Inicío</th>
          <th style="width:10%" scope="col">Data de Final</th>
          <th style="width:15%" scope="col">Data de Reajuste</th>
          </tr>
          </thead>`);
        tabela += (`<tbody>`);

        let j = 0;
        for (let i = 0; i < json.length; i++) {
          if (json[i]["cnpj"] == meuCNPJ) {
            listaFinal[j] = json[i];
            j++;
          }
        }

        for (i = 0; i < listaFinal.length; i++) {
          //captura itens para tabela
          tabela += (`<tr style="cursor:pointer" id="linha` + i + `" onmouseover="sublinhar(` + i + "," + json.length + `)" onclick="redirecionar(` + i + "," + "'lote'" + `)">`);
          tabela += (`<td>`);
          tabela += listaFinal[i]["cod_lote"];
          tabela += (`</td><td>`);
          tabela += listaFinal[i]["contrato"];
          tabela += (`</td><td class="data">`);
          mascara();
          tabela += arrumaData(listaFinal[i]["dt_inicio_vig"]);
          tabela += (`</td>`);
          tabela += (`</td><td class="data">`);
          mascara();
          tabela += arrumaData(listaFinal[i]["dt_final_vig"]);
          tabela += (`</td>`);
          tabela += (`</td><td class="data">`);
          mascara();
          tabela += arrumaData(listaFinal[i]["dt_reajuste"]);
          tabela += (`</td>`);
          tabela += (`</tr>`);
        }
        tabela += (`</tbody>`);
        document.getElementById("tabela").innerHTML = tabela;
      });
    } else {
      erros(response.status);
    }
  });
}