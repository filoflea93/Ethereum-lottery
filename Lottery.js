// Moralis connection
const serverUrl = "SERVER_URL_HERE";   
const appId =  "MORALIS_APP_ID_HERE";              
Moralis.start({ serverUrl, appId });

// Login user
async function login() {

    let user = Moralis.User.current();

    if (!user) {
        user = await Moralis.authenticate({ signingMessage: "Log in using Moralis" })
               .then(function(user) {
                    alert("Logged in");
                    let addr = user.get("ethAddress");
                    $loggedUserAddress.innerHTML = `Logged as: ${addr}`;
                    userAddress = addr;
               })
               .catch(function(error) {
                    $loggedUserAddress.innerHTML = `${error}`;
               });
    }else{
        alert("Already logged")
        let addr = user.get("ethAddress");
        $loggedUserAddress.innerHTML = `Logged as: ${addr}`;
    }

}

// Logout user 
async function logOut() {
    await Moralis.User.logOut();
    alert("Logged out");
    $errorBox.innerHTML = "";
    $loggedUserAddress.innerHTML = "";
}

const $loggedUserAddress = document.getElementById("userAddress");
const $errorBox = document.getElementById("errorBox");

const $submitButton = document.getElementById("submit");
$submitButton.addEventListener("click", addParticipant);

const $winnersList = document.getElementById("winnersList");
const $numberOfParticipants = document.getElementById("numberOfParticipants");

const $btnLogin = document.getElementById("login");
const $btnLogOut = document.getElementById("logout");

$btnLogin.addEventListener('click', login);
$btnLogOut.addEventListener('click', logOut);

const $buttonBuyCrypto = document.getElementById("btn-buy-crypto");
$buttonBuyCrypto.addEventListener('click', buyCrypto);

const smartContractAddress = "0x0000000..."
const ticketPrice = 0.05;     // ETH

const maxParticipants = 4;
const maxWinners = 2;

const participants = [];
const winners = [];

let pseudonym;

function addParticipant(){

    let user = Moralis.User.current();
    const userAddress = user.get("ethAddress");

    let pseudonymValid = validatePseudonym(pseudonym);

    if(user){
        if(pseudonymValid){

            let newParticipant = {
                                    'address' :   userAddress,
                                    'pseudonym' : pseudonym
                                 }

            if(participants.length < maxParticipants){
                sendEthToContract();  
            }else{
                alert("Subscriptions ended");
            }

        }else{

            if(Boolean(pseudonym)){
                alert("Pseudonym already present");
            }else{
                alert("Pseudonym not valid");
            }

        }

    }else{
        alert("Need authentication")
    }

}

function displayWinners(){
    // TODO
}

/** fiat on ramp buy crypto */
async function buyCrypto() {

    let user = Moralis.User.current();

    if(user){
        let userAddress = user.get("ethAddress");
        const cryptoBuyURL = "https://global.transak.com/?apiKey=25ac1309-a49b-4411-b20e-5e56c61a5b1c&hostURL=https%3A%2F%2Fmetamask.io&cryptoCurrencyList=ETH%2CUSDT%2CUSDC%2CDAI&defaultCryptoCurrency=ETH&networks=ethereum&walletAddress="+userAddress;
        window.location.href = cryptoBuyURL;
    }else{
        alert("Need authentication")
    }
}

async function sendEthToContract(){
    
    const options = { 
                        type: "native",  
                        amount: Moralis.Units.ETH(ticketPrice), 
                        receiver: smartContractAddress
                    };
     
    try{

        //let result = await Moralis.transfer(options);  
        participants.push(newParticipant);
        $numberOfParticipants.innerHTML = `<p>Participants: ${participants.length}</p>
                                           <p>Remaining: ${maxParticipants - participants.length}</p>`;

    }catch(e){

        let error = JSON.stringify(e.reason);
        $errorBox.innerHTML += `Error: ${error.replace('"', '').replace('"', '')}`;

    }   

}

function getPseudonymContent() {
    pseudonym = document.querySelector('input').value;
}

function validatePseudonym(_pseudonym){
    let valid = true;

    if(Boolean(_pseudonym)){
        for(let i=0; i<participants.length; i++){
            if(participants[i].pseudonym === _pseudonym){
                valid = false;
            }
        }
    }else{
        valid = false;
    }
    return valid;
}

