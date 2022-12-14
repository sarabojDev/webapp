// LOGIN PAGE CODE START HERE










// loader functions
function showLoader() {
    $(".loadingPage").removeClass('d-none')
    $("body,html").css("overflow", 'hidden')
}

function hideLoader() {
    $(".loadingPage").addClass('d-none')
    $("body,html").css("overflow-y", 'auto')
}


//*USER USER NAME AND PASSWORD VALID FUNCTION START HERE
function logInFormValid() {
    let userLog = $('#log_user_key')
    let passLog = $('#log_pass_key')
    if ($(userLog).val() == '') {
        alertify.alert('alert').set({ transition: 'zoom', title: 'Message', message: 'Please enter your email id/employee code.', closable: false }).show();
        return false
    } else if ($(passLog).val() == "") {
        alertify.alert('alert').set({ transition: 'zoom', title: 'Message', message: 'Please enter your password.' }).show();
        return false
    } else {
        const logDetails = {
            user: userLog[0].value,
            pass: passLog[0].value
        }
        window.localStorage.setItem('userLogDetails', JSON.stringify(logDetails));
        showLoader()
        return logDetails;
    }

}
//*USER USER NAME AND PASSWORD VALID FUNCTION END HERE

$(".logSign").click(() => {
    var logCheck = logInFormValid();
    if (!logCheck)
        return;
    userLogin(logCheck)
})


//*USER LOGIN BY ENTER KEY FUNCTION START HERE
$("#log_pass_key").keydown((e) => {
    e.stopImmediatePropagation()
    if (e.keyCode == 13) {
        var logCheck = logInFormValid();
        if (!logCheck)
            return;
        userLogin(logCheck)
    }
})
//*USER LOGIN BY ENTER KEY FUNCTION END HERE






// *USER DEATIL CHECKING BY FIREBASE FUNCTION;
function userLogin(logdata) {
    const checFireUser = loginchek(logdata);
    checFireUser.then((logFF) => {
        console.log(logFF)
        if (logFF.status == false) {
            hideLoader()
            return alertify.alert("Message!", logFF.message);
        };
        const key = logFF.data.mail_id + "," + logFF.data.emp_code;
        createCookie(key, 1);
        logUserDatas = logFF.data;
        window.open("./component/app.html","_top")
       
    })
    // !*check user details in firebase  that valid after call templateApi();
    // !*backend function;
    // !* USER DETAILS FULL ROW;
    // !*ADD EXTRA COL FOR ALLOW SOFTWARES NAMES;
}




function createCookie(name, days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "expires=" + date.toGMTString();
    document.cookie = "key" + "=" + name + ";" + expires + "; path=/";
}

// LOGIN PAGE CODE END HERE


/* ------------------- FORGET PASSWORD FUNCTION START HERE ------------------ */
// *FORGET PASSWORD FUNTION START HERE
$(".logForSub").click(() => {
    const userLog = $('#forget_value')
    const emCode = $("#forget_em_code")
    if ($(userLog).val() == '') {
        alertify.alert('alert').set({ transition: 'zoom', title: 'Message', message: 'Please enter your mail id.' }).show();
        return
    } else if ($(emCode).val() == '') {
        alertify.alert('alert').set({ transition: 'zoom', title: 'Message', message: 'Please enter your employee code.' }).show();
        return
    } else {
        const logDetails = {
            email: userLog[0].value,
            code: emCode[0].value
        }
        showLoader()
        forgotPassword(logDetails).then((res) => {
            if (res.status == false) {
                hideLoader();
                return alertify.alert("Message!", res.message);
            }
            const userD = res.data;
            const de = {name:userD.emp_name,func:"forgotpass","mail":userD.mail_id,"password":userD.password};
            makeForgotMail(de)
            alertify.alert("Message!", res.message);

            hideLoader()
           
        })
    }
})


function makeForgotMail(params){
   return fetch('https://script.google.com/macros/s/AKfycbx5sJ4xzRxk7c0kmo_mFJosMtiKO0xHvREFTgXOhNEiPZJ6kPn_HC-78NJyV3WGwJ37BQ/exec', {
        method: 'post',
        body:JSON.stringify(params)
    }).then((responsedata)=>{
        hideLoader(); 
       responsedata.json((result)=>{
         console.log(result)
       })
   })
}
/* ------------------- FORGET PASSWORD FUNCTION END HERE ------------------ */