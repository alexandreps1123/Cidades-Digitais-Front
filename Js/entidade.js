function CheckError(response) {
	if (response.status >= 200 && response.status < 300) {
	  return console.log(response);
	}else{
	  throw ("Erro encontrado: " + response.status);
	  switch(response.status){
          case '403': window.location.replace("file:///home/mctic/Desktop/dimi%20was%20here/403.html");break;
          case '404': window.location.replace("file:///home/mctic/Desktop/dimi%20was%20here/404.html");break;
          case '412': alert("Usuario ou senha incorretos.") ;break;
          case '500': window.location.replace("file:///home/mctic/Desktop/dimi%20was%20here/500.html");break;
          case '504': window.location.replace("file:///home/mctic/Desktop/dimi%20was%20here/504.html");break;
          }
        }
  }
//talvez tenha que virar ponteiro
function editar(i){
  document.getElementById(i).innerHTML = "<tr id=" + i + ">" + "<td>" + '<input type="text" id="submitCNPJ" maxlength="18" OnKeyPress="formatar(' + '##.###.###/####-##' + ', this)" value="" onchange="changer()"></input>' + "</td>" + "<td>" + '<input type="text" class="form-control" id="submitNome" maxlength="50" value="" onchange="changer()">'  + "</td>" + "<td>" + '<input type="text" id="submitEndereco" maxlength="100" value="" onchange="changer()"></input>' + "</td>" + "<td>" + '<input type="text" id="submitNumero" maxlength="10" value="" onchange="changer()"></input>' + "</td>" + "<td>" + '<input type="text" id="submitBairro" maxlength="100" value="" onchange="changer()"></input>' + "</td>" + "<td>" + '<input type="text" id="submitCEP" maxlength="9" OnKeyPress="formatar(' + '#####-###' + ', this)" value="" onchange="changer()"></input>' + "</td>" + "<td>" + '<select type="text" id="submitUF" value="" onchange="changer()"><p id="estados"></p></select>' + "</td>" + "<td>" + '<select type="text" id="submitNomeMun" value="" onchange="changer()"><p id="municipios"></p></select>' + "</td>" + "<td>" + '<input type="text" id="submitObs"  maxlength="1000" value="" onchange="changer()"></input>' + "</td>" + "</tr>" + '<button type="button" class="btn btn-primary" onclick="mudar(' + i + ')" >' + "Editar Entidade" + "</button>";
  
  var info = {"cnpj" : " ","nome" : " ","endereco" : " ","numero" : " ","bairro" : " ","cep" : " ","nome_municipio" : " ","uf" : " ","observacao" : " "};
  
  function changer(){
  var a = document.getElementById("submitCNPJ");
  info.cnpj = a.value;
  var b = document.getElementById("submitNome");
  info.nome = b.value;
  var c = document.getElementById("submitEndereco");
  info.endereco = c.value;
  var d = document.getElementById("submitNumero");
  info.numero = d.value;
  var e = document.getElementById("submitBairro");
  info.bairro = e.value;
  var f = document.getElementById("submitCEP");
  info.cep = f.value;
  var g = document.getElementById("submitNomeMun");
  info.nome_municipio = g.value;
  var h = document.getElementById("submitUF");
  info.uf = h.value;
  var i = document.getElementById("submitObs");
  info.observacao = i.value;
  }

  function formatar(mascara, documento){
  var i = documento.value.length;
  var saida = mascara.substring(0,1);
  var texto = mascara.substring(i);
  
  if (texto.substring(0,1) != saida){
            documento.value += texto.substring(0,1);
  }
  
}

  function CheckError(response) {
    if (response.status >= 200 && response.status < 300) {
      return console.log(response);
      
    } else {
      throw ("Erro encontrado: " + response.status);
      switch(response.status){
            case '403': window.location.replace("file:///home/mctic/Desktop/dimi%20was%20here/403.html");break;
            case '404': window.location.replace("file:///home/mctic/Desktop/dimi%20was%20here/404.html");break;
            case '412': alert("Usuario ou senha incorretos.") ;break;
            case '500': window.location.replace("file:///home/mctic/Desktop/dimi%20was%20here/500.html");break;
            case '504': window.location.replace("file:///home/mctic/Desktop/dimi%20was%20here/504.html");break;
            }
          }
    }

  //função de edição
  function mudar(){
      var objetivo = JSON.stringify(info);
      //ja com o site para testes
      fetch("localhost:8080/read/entidade", {
      method: "EDIT",
      mode: 'no-cors',
      headers: {'content-type' : 'application/json'},
      body: objetivo
      })
      .then(CheckError);
  }

  
  window.onload=function estados(){
      var i = 0;
      var x;
      //ja com o site para testes
      fetch("localhost:8080/read/municipios", {
      method: "GET",
      mode: 'no-cors',
      headers: {'content-type' : 'application/json'},
      })
      .then(CheckError)
      .then(function(response)
      {
      return response;
      var objeto = JSON.parse(this.response);
      });
      for (i in objeto) {
      x += "<option>" + response.uf[i] + "</option>";
      }
    document.getElementById("estados").innerHTML = x;
  }



  
  window.onload=function municipios(){
  var i = 0;
  var x;
  //ja com o site para testes
  fetch("localhost:8080/read/municipios", {
  method: "GET",
      mode: 'no-cors',
      headers: {'content-type' : 'application/json'},
  })
  .then(CheckError)
  .then(function(response)
  {
      return response;
      var objeto = JSON.parse(this.response);
  });
  for (i in objeto) {
  x += "<option>" + response.nome_municipio[i] + "</option>";
  }
  document.getElementById("municipios").innerHTML = x;
  }

}


//testar se funciona depois
  window.onload=function lista(){
    var i = 0;
    var x;
    //ja com o site para testes
    fetch("localhost:8080/read/entidade", {
		method: "POST",
    mode: 'no-cors',
    headers: {'content-type' : 'application/json'},
    body: this.form
	})
    .then(CheckError)
    .then(function(response)
    {
        return response;
        var objeto = JSON.parse(this.response);
    });
    for (i in objeto) {
    x += "<tr id=" + i + ">" + "<td>" + response.cnpj[i] + "</td>" + "<td>" + response.nome[i] + "</td>" + "<td>" + response.endereco[i] + "</td>" + "<td>" + response.numero[i] + "</td>" + "<td>" + response.bairro[i] + "</td>" + "<td>" + response.cep[i] + "</td>" + "<td>" + response.uf[i] + "</td>" + "<td>" + response.nome_municipio[i] + "</td>" + "<td>" + response.observacao[i] + "</td>" + "</tr>" + '<button type="button" class="btn btn-primary" onclick="editar(' + i + ')" >' + "Editar Entidade" + "</button>";
    }
    document.getElementById("lista").innerHTML = x;
}

function deletar(){
  var objetivo = JSON.stringify(info);
      //ja com o site para testes
      fetch("localhost:8080/read/entidade", {
      method: "EDIT",
      mode: 'no-cors',
      headers: {'content-type' : 'application/json'},
      body: form
      })
      .then(CheckError)
      .then(response => console.log("ok?"));
}