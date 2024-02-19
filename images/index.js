function handleInput(inputElement) {
  var inputValue = inputElement.value;
  console.log("Input value: " + inputValue);
}

async function toggleLogin() {
  const loginButton = document.getElementById("loginButton");
  const signOutButton = document.getElementById("signOutButton");
  loginButton.style.display = "none";
  signOutButton.style.display = "inline-block";
}
//UI changes
function logout() {
  const loginButton = document.getElementById("loginButton");
  const signOutButton = document.getElementById("signOutButton");

  loginButton.style.display = "inline-block";
  signOutButton.style.display = "none";
}
// Boolean "AND","OR"
const inputElement = document.getElementById("searchInput");
inputElement.addEventListener("input", (event) => {
  const inputValue = event.target.value;
  const words = inputValue.split(" ");
  words.forEach((word, index) => {
    if (word.toLowerCase() === "or" && words[index + 1] === "") {
      inputElement.value = inputValue.replace(/or /, "OR ");
    } else if (word.toLowerCase() === "and" && words[index + 1] === "") {
      inputElement.value = inputValue.replace(/and /, "AND ");
    }
  });
});
//MSAL object definition and creation
const msalconfig = {
  auth: {
    clientId: "5047e9a3-2b87-4fc9-abd8-9e85cca0e02d",
    authotity: "https://login.microsoftonline.com/common/",
    //Replace the localhost url below with ur permanent webpage url
    redirectUri: "https://sairajobs.onrender.com/callback",
  },
  cache: {
    cacheLocation: "sessionstorage",
    storeAuthStateInCookie: true,
  },
};
const uniqueFileNames = new Set();
//Initially accesstoken is set to null
var accessToken = null;
let successCount = 0;
username = "";
var count;
const keywords = [];
const operators = [];
const MSALobj = new msal.PublicClientApplication(msalconfig);
//sign in function
async function signIn() {
  const loginRequest = {
    scopes: ["User.Read", "Files.Read", "Files.Read.All"],
  };

  MSALobj.loginRedirect(loginRequest)
    .then(() => {
      toggleLogin();
    })
    .catch((error) => {
      console.error("Sign-in error: ", error);
    });
}

//sign out function
function signOut() {
  const logoutReq = {
    account: MSALobj.getAccountByUsername(username),
  };
  MSALobj.logoutPopup(logoutReq)
    .then(logout)
    .catch((error) => {
      console.error("Logout error: ", error);
    });
}
// To handle the response from Microsoft
MSALobj.handleRedirectPromise()
  .then((response) => {
    console.log(response);
    username = response.account.username;
    accessToken = response.accessToken;
    const apiUrl = "https://graph.microsoft.com/v1.0/me";
    toggleLogin();
  })
  .catch((error) => {
    console.log(error);
  });

function Preview(url) {
  const fileContentFrame = document.getElementById("Content");
  fileContentFrame.src = url;
}
//Input split function
function Inputsplit() {
  successCount = 0;
  const keywords = [];
  const operators = [];
  const resultsList = document.getElementById("fileList");
  uniqueFileNames.clear();
  resultsList.innerHTML = "";

  const Input = document.getElementById("searchInput").value;
  const terms = Input.split(" ");

  for (const term of terms) {
    if (term.toLowerCase() === "or" || term.toLowerCase() === "and") {
      operators.push(term.toLowerCase());
    } else {
      keywords.push(term);
    }
  }
  if (keywords.length == 0 || (keywords.length == 1 && keywords[0] == "")) {
    // resultsList.innerHTML = "No Search results";
  }
  searchfunc(keywords, operators);
}
//Main search function
async function searchfunc(keywords, operators) {
  const resultsList = document.getElementById("fileList");
  const searchResults = [];
  console.log(operators.length);

  for (let i = 0; i < keywords.length; i++) {
    if (operators[i] === "and") {
      key1 = keywords[i];
      key2 = keywords[i + 1];
      const result = await search(key1 + " " + key2);
      i++;
    } else {
      key = keywords[i];
      const result = await search(key);
    }
  }
  if (uniqueFileNames.size === 0) {
    // Hide the "No Profiles Found" message
    resultsList.innerHTML = "";

    // Show the photo instead
    const noProfilesImage = document.getElementById("noProfilesImage");
    noProfilesImage.style.display = "block";
  } else {
    // Unique profiles found, hide the photo
    const noProfilesImage = document.getElementById("noProfilesImage");
    noProfilesImage.style.display = "none";

    // Rest of your logic to display profiles
  }
}

//Graph api calls
async function search(parameter) {
  successCount++;
  if (accessToken == null) {
    alert("Sign in");
    return;
  }

  const resultsList = document.getElementById("fileList");

  const apiUrl = `https://graph.microsoft.com/v1.0/me/drive/search(q='${parameter}')?select=name,webUrl`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.value) {
        data.value.forEach((file) => {
          if (!uniqueFileNames.has(file.name)) {
            const fileLink = document.createElement("a");
            fileLink.href = file.webUrl;
            fileLink.textContent = file.name;
            fileLink.target = "_blank";
            const listItem = document.createElement("li");
            listItem.appendChild(fileLink);
            resultsList.appendChild(listItem);
            uniqueFileNames.add(file.name);
          }
        });
      }
    } else {
      throw new Error("Error searching for files: " + response.statusText);
    }
  } catch (error) {
    console.error("Error: " + error);
  }
}
// Check if the user is already signed in
function checkAuthentication() {
  const accounts = MSALobj.getAllAccounts();
  if (accounts.length > 0) {
    // User is signed in, show the "Logout" button
    const loginButton = document.getElementById("loginButton");
    const signOutButton = document.getElementById("signOutButton");

    loginButton.style.display = "none";
    signOutButton.style.display = "inline-block";
  }
}
// Call checkAuthentication when the page loads
window.addEventListener("load", checkAuthentication);
window.onload = function () {
  document.getElementById("searchInput").focus();
  document.addEventListener("click", function () {
    var userInputField = document.getElementById("searchInput");
    userInputField.focus();
  });
};
//Auto Focus to the input button
function focusInput() {
  document.getElementById("searchInput").focus();
}
focusInput();
document.addEventListener("click", function (event) {
  if (event.target !== searchInput) {
    focusInput();
  }
});
//Event Listener to search on Enter
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    Inputsplit();
  }
});
