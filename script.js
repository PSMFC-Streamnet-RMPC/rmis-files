//still need to handle no-files message
//log out issue

//const apiUrl = 'https://phish.rmis.org'
//for dev
const apiUrl = "http://localhost:5001"

function parseJwt(token) {
  var base64Url = token.split(".")[1]
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join("")
  )
  return JSON.parse(jsonPayload)
}

function showForm(form) {
  //clearForms()
  document.querySelector("#" + form).style.display = "inherit"
}

function clearForms() {
  document.querySelectorAll(".fxn").forEach((el) => (el.style.display = "none"))
}

function isValidToken(jwt) {
  jQuery.ajax({
    method: "GET",
    url: apiUrl + "/files",
    headers: {
      Authorization: "Bearer " + jwt,
      Accept: "*/*",
    },

    success: function (response) {
      loggedIn(response)
    },
    error: function (response) {
      localStorage.removeItem("RMIS")
      showForm("userLogin")

      if (response.responseJSON.statusCode == 401) {
        showMessage("Access issue. Contact RMIS.")
      } else {
        showMessage(response.responseJSON.message)
      }
    },
  })
}

function makeFiles(files) {
  clearForms()
  const items = files.reduce(
    (acc, cur) =>
      acc +
      '<tr><td width=375 style="color: #277e9f; font-weight: 700;">' +
      cur.filename +
      "</td><td>" +
      cur.size +
      "</td><td>" +
      cur.accessed +
      "</td></tr>",
    ""
  )
  const html =
    '<div style="margin-bottom:10px;">Use the "Choose files" button to select PSC format .csv or .txt files from your computer to upload. </div>' +
    '<table class="table"><thead class="thead-light"><tr><th>File Name</th><th>Size</th><th>Date</th></tr></thead><tbody>' +
    items +
    "</tbody></table>"
  showForm("userUpload")
  document.querySelector("#datafiles").innerHTML = html
}

function showMessage(msg, smalltxt) {
  showForm("statusInfo")
  if (smalltxt) {
    msg =
      '<h4 class="alert-heading">' +
      msg +
      "</h4>" +
      "<hr><p>" +
      smalltxt +
      "</p>"
  } else {
    msg = '<h4 class="alert-heading">' + msg + "</h4>"
  }
  document.querySelector("#statusInfo").innerHTML = msg
}

function logOut() {
  localStorage.removeItem("RMIS")
  clearForms()
  window.location.reload(true)
}

function loggedIn(res) {
  clearForms()
  let id = parseJwt(localStorage.getItem("RMIS"))
  showForm("userLoggedIn")
  document.querySelector("#navbarDropdown").innerHTML = id.email

  if (res.length) {
    makeFiles(res)
  } else {
    showMessage(
      "No files uploaded",
      'Use the "Choose files" button to select PSC format .csv or .txt files from your computer to upload.'
    )
  }

  document.querySelector(".Uppy").innerHTML = ""

  var uppy = new Uppy.Core({
    debug: true,
    autoProceed: true,
    restrictions: { maxFileSize: 250000000 },
  })
  const { FileInput } = Uppy
  //const { ProgressBar } = Uppy
  const { StatusBar } = Uppy
  const { XHRUpload } = Uppy

  uppy.use(FileInput, {
    target: ".Uppy",
    pretty: true,
    inputName: "filename",
  })

  uppy.use(StatusBar, {
    target: ".UppyProgressBar",
    hideAfterFinish: true,
  })

  let ak = parseJwt(localStorage.getItem("RMIS")).apikey

  uppy.use(XHRUpload, {
    endpoint: apiUrl + "/files?xapikey=" + ak,
    formData: true,
    fieldName: "upfile",
  })

  // And display uploaded list of files
  uppy.on("upload-success", (file, response) => {
    makeFiles(response.body)
  })
}

document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("RMIS")) {
    showForm("userLogin")
  } else {
    isValidToken(localStorage.getItem("RMIS"))
  }

  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault()
    let formType = jQuery(this).data("form")
    let formData = jQuery("#" + $(this).data("form")).serialize()
    formData = formData.concat("&jwt=true")

    jQuery.ajax({
      method: "POST",
      url: apiUrl + "/bauth",
      data: formData,
      success: function (response) {
        if (formType == "loginForm") {
          localStorage.setItem("RMIS", response.token)
          clearForms()
          isValidToken(response.token)
          return
        }

        //clearForms()
        //showForm('userLogin')
        //showMessage(response)
      },
      error: function (response) {
        clearForms()
        showForm("userLogin")

        if (response.responseJSON.statusCode == 404) {
          showMessage("Email or password not found")
        } else {
          showMessage(response.responseJSON.message)
        }
      },
    })
  })
})
