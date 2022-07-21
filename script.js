
//still need to handle no-files message
//log out issue

function parseJwt (token) {
  var base64Url = token.split('.')[1]
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))  
  return JSON.parse(jsonPayload)
}

function showForm(form){
  clearForms()
  document.querySelector('#' + form).style.display = 'inherit'
}

function clearForms() {
  document.querySelectorAll('.fxn').forEach((el) => el.style.display = 'none')
}

function isValidToken(jwt){	
 fetch('http://localhost:5001/files', {
    method: 'GET',
    mode: 'cors', 
    headers: {
      'Authorization' : 'Bearer ' + jwt,
      'User-Agent' : 'RMIS-App',
      'Accept': '*/*',
    },
  })
  .then(response => response.json())
  .then(data => {
    loggedIn(data)    
  })
  .catch(error => showForm('userLogin'))
}

function makeFiles(files){
  const items = files
      .reduce((acc, cur) => acc + '<tr><td width=375 style="color: #277e9f; font-weight: 700;">' + cur.filename + '</td><td>' + cur.size + '</td></tr>', '')
  const html = '<table class="table"><thead class="thead-light"><tr><th>File Name</th><th>Size</th></tr></thead><tbody>' + items + '</tbody></table>'
  document.querySelector('#datafiles').innerHTML = html
}

function showMessage(msg){
  document.querySelector('#statusMsg').innerHTML = msg
  document.querySelector('#statusInfo').style.display = 'inherit'
}

function logOut(){
  localStorage.removeItem("RMIS")
  clearForms()
  window.location.reload(true)
}

function loggedIn(res){
  let id = parseJwt(localStorage.getItem("RMIS"))
  showForm('userLoggedIn')  
  document.querySelector('#navbarDropdown').innerHTML = id.email
  makeFiles(res)
  document.querySelector('.Uppy').innerHTML = ''

  var uppy = new Uppy.Core({debug: true, autoProceed: true, restrictions: {maxFileSize:250000000}})
  const { FileInput } = Uppy
  const { ProgressBar } = Uppy
  const { StatusBar } = Uppy
  const { XHRUpload } = Uppy

  uppy.use(FileInput, {
    target: '.Uppy',
    pretty: true,
    inputName: 'filename',
  })
  
  uppy.use(StatusBar, {
    target: '.UppyProgressBar',
    hideAfterFinish: true,
  })

  let ak = parseJwt(localStorage.getItem("RMIS")).apikey

  uppy.use(XHRUpload, {
    endpoint: 'http://localhost:5001/files?xapikey=' + ak,
    formData: true,
    fieldName: 'upfile',
  })

  // And display uploaded list of files
  uppy.on('upload-success', (file, response) => {          
    makeFiles(response.body)
  })
  
}

document.addEventListener("DOMContentLoaded", function(){
       
  if (!localStorage.getItem("RMIS")){
    showForm('userLogin')    
  } else {
  	isValidToken(localStorage.getItem("RMIS"))
  }  
  
  document.querySelector('form').addEventListener("submit", function(e){
    
    e.preventDefault()
    let formType = this.id
    let form = document.querySelector('#' + this.id) 
    let formData = new FormData(form)
    formData.append("jwt", "true");
    formData = new URLSearchParams(formData)    

    fetch('http://localhost:5001/bauth', {
      method: 'POST',
      mode: 'cors', 
      body: formData,    
    })
    .then(response => response.json())
    .then(data => {
      if (formType=='loginForm'){
        localStorage.setItem("RMIS", data.token)
        isValidToken(data.token)
        return
        }        
      clearForms()
      showForm('userLogin')          
      })
    .catch(error => {
      clearForms()
      showForm('userLogin')
    })

  })

})

