"use strict";

const _$ = (selector) => document.querySelector(selector);

let globalState = {
    uportId: "",
    uportName: "",
    uportCountry: "",
    uportPhone: "",
    ethAddress: "",
    ethBalance: "",
    currentStatus: "",
    statusInput: "",
    txHashSentEth: "",
    txHashSetStatus: "",
    sendToAddr: "",
    sendToVal: ""
};

const renderGlobalState = function() {
    _$("#uportId").innerHTML = globalState.uportId;
    _$("#uportName").innerHTML = globalState.uportName;
    _$("#uportCountry").innerHTML = globalState.uportCountry;
    _$("#uportPhone").innerHTML = globalState.uportPhone;
    _$("#ethAddress").innerHTML = globalState.ethAddress;
    _$("#ethBalance").innerHTML = globalState.ethBalance;
    _$("#currentStatus").innerHTML = globalState.currentStatus;
    _$("#txHashSentEth").innerHTML = globalState.txHashSentEth;
    _$("#txHashSetStatus").innerHTML = globalState.txHashSetStatus;
    //_$("#sendTo").value = globalState.sendToAddr;
    //_$("#amount").value = globalState.sendToVal;
};    

const updateCredentials = function(credentials) {
    globalState.uportId = credentials.address;
    globalState.uportName = credentials.name;
    globalState.uportCountry = credentials.country;
    globalState.uportPhone = credentials.phone;
}

const web3 = connect.getWeb3();

// Setup the simple Status contract - allows you to set and read a status string
const abi = [
    {
        "constant": false,
        "inputs": [{ "name": "status", "type": "string" }],
        "name": "updateStatus",
        "outputs": [],
        "payable": false,
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{ "name": "addr", "type": "address" }],
        "name": "getStatus",
        "outputs": [{ "name": "", "type": "string" }],
        "payable": false,
        "type": "function"
    }
];

const StatusContract = web3.eth.contract(abi);
const statusInstance = StatusContract.at("0x70A804cCE17149deB6030039798701a38667ca3B");

// uPort connect
const uportConnect = function () {
    connect.requestCredentials({
            requested: ["name", "phone", "country"],
            notifications: true // We want this if we want to recieve credentials
        }).then((credentials) => {
            console.log("Credentials:", credentials);

            updateCredentials(credentials);
            $("[data-toggle='popover']").popover("dispose");
            gotoStep2();
            renderGlobalState();
        },
        (err) => {
            console.log("Error:", err);
        });
};

// Send ether
const sendEther = () => {
    const value = parseFloat(globalState.sendToVal) * 1.0e18;

    web3.eth.sendTransaction(
        {
            to: globalState.sendToAddr,
            value: value
        },
        (error, txHash) => {
            if (error) {
                throw error;
            }
            globalState.txHashSentEth = txHash;
            renderGlobalState();
        }
    );
};

// Set Status
const setStatus = () => {
    const newStatusMessage = globalState.statusInput;
    statusInstance.updateStatus(newStatusMessage,
        (error, txHash) => {
            if (error) {
                throw error;
            }
            globalState.txHashSetStatus = txHash;
            renderGlobalState();
        });
};

const gotoStep1 = (e) => {
    if (e)
        e.preventDefault();

    _$(".step1").classList.add("active");
    _$(".step2").classList.remove("active");
};

const gotoStep2 = (e) => {
    if (e)
        e.preventDefault();

    _$(".step1").classList.remove("active");
    _$(".step2").classList.add("active");
    $(".card button.btn-primary").focus();
    initPopover();
};

const initPopover = () => {

    $("[data-toggle='popover']").popover({
        html: true,
        content: function () {
            return $(".popover-content").clone();
        }
    });
};
