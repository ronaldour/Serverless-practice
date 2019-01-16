
// ######### Global Config ########

var region = 'us-east-1';
var userpool_id = 'us-east-1_m4kl9DddE';
var app_client_id = '1fi8lvdrb5f9qgqsvoare7crp5';
var keys_url = 'https://cognito-idp.' + region + '.amazonaws.com/' + userpool_id + '/.well-known/jwks.json';   //https://cognito-idp.us-east-1.amazonaws.com/us-east-1_m4kl9DddE/.well-known/jwks.json
var login_url = 'https://trambotraining-lab4.auth.us-east-1.amazoncognito.com/login?response_type=token&client_id=1fi8lvdrb5f9qgqsvoare7crp5&redirect_uri=https://d1k7ek6207mmob.cloudfront.net/index.html'
var logout_url = 'https://trambotraining-lab4.auth.us-east-1.amazoncognito.com/logout?client_id=1fi8lvdrb5f9qgqsvoare7crp5&logout_uri=https://d1k7ek6207mmob.cloudfront.net/index.html'
var api_url = 'https://p9hbr6wwsd.execute-api.us-east-1.amazonaws.com/dev/lab4'


var TextToSpeech = window.TextToSpeech || {}


document.querySelector('#submitbtn').addEventListener('click', event => {
  post()
})
document.querySelector('#signin').addEventListener('click', event => {
  signin()
})
document.querySelector('#signout').addEventListener('click', event => {
  signout()
})

if(!!window.location.hash){
  //Save the token sent in the url
  TextToSpeech.JWT = decodeHash(window.location.hash)[0][1]
}

if(validateToken(TextToSpeech.JWT)){
  //save the session
  window.TextToSpeech = TextToSpeech

  //Show username
  let username = document.querySelector('#username')
  username.innerHTML = TextToSpeech.User
  username.style.display = "block"
  document.querySelector('#signout').style.display = "inline"
  document.querySelector('#signin').style.display = "none"
  document.querySelectorAll('.c').forEach(element => {
    element.disabled = false
  })
  //Fetch speeches
  fetch(api_url, {
    method: 'GET',
  }).then(async (result) => {
    let speech = await result.json()

    let html = ""
    for (let i = 0; i < speech.length; i++) {
      html += `<tr><th scope="row">${speech[i].name}</th><td>${speech[i].file}</td><td><a href="${speech[i].url}">${speech[i].url}<a></td></tr>`
    }

    document.querySelector('#tablebody').innerHTML = html
  }).catch(err => {
    console.log(err)
  })

  
}
else{
  //window.location = cognito_url
}

function decodeHash(hash){
  return hash.split("&").map(v => v.split("="))
}

function decodeJWT(t){
  let token = {}
  let jwt = t.split('.')

  token.raw = t
  token.header = JSON.parse(window.atob(jwt[0]))
  token.payload = JSON.parse(window.atob(jwt[1]))
  token.signature = jwt[2]

  return token
}

function validateToken(rawtoken){
  if(!rawtoken) return false

  let token = decodeJWT(rawtoken)

  TextToSpeech.User = token.payload.email.split('@')[0]

  if(Math.round(Date.now() / 1000) < token.payload.exp){
    return true
  }
  else{
    return false
  }
}

function signin(){
  window.location = login_url
}

function signout(){
  window.TextToSpeech = null 
  window.location = logout_url
}

function post(){
  let text = document.querySelector('#textInput').value
  if (!text) {
    return
  }
  document.querySelector('#textInput').value = ""

  let data = {
    Message: text,
    User: TextToSpeech.User
  }

  fetch(api_url, {
    method: 'POST',
    headers: {
       "Content-Type": "application/json",
       "Authorization": TextToSpeech.JWT
    },
    body: JSON.stringify(data)
  }).then(response => {
    console.log(response)
    document.querySelector('#alert').style.display = "block"
    setTimeout(() => {
      document.querySelector('#alert').style.display = "none"
    }, 3000);
  }).catch(err => {
    console.log(err)
  })

}