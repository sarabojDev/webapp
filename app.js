$(document).ready(function () { // component smooth landing....

    //*common functions start 
    function checkPreDate(e) {
        var q = new Date();
        var date = new Date(q.getFullYear(), q.getMonth(), q.getDate());
        var mydate = new Date(e.target.value);
        if (date > mydate) {
            alertify.alert("Message!","Your selected previous date.....");
            e.target.value = ''
        }
        e.stopPropagation()
    }

    //*common functions end

    ScrollReveal().reveal('.smoothland');
    // *software common details here
    const templateUrl = 'https://script.google.com/macros/s/AKfycbw52wQn5WlBJ1tMiEHtT7HQNnqZnRsDM_p8tMZZ7Ja76tE2qrshWzVYyMUP0_4m9Xau/exec';
    var logUserDatas = {};

    // *add backend function get firebase for get details ;


    // *input style here start
    const inputs = document.querySelectorAll(".input");
    function addcl() {
        let parent = this.parentNode.parentNode;
        parent.classList.add("focus");
    }

    function remcl() {
        let parent = this.parentNode.parentNode;
        if (this.value == "") {
            parent.classList.remove("focus");
        }
    }


    inputs.forEach(input => {
        input.addEventListener("focus", addcl);
        input.addEventListener("blur", remcl);
    });

    $('.forgot_tag').click(() => {
        $('.login_two_tabs').eq(0).css('display', 'none')
        $('.login_two_tabs').eq(1).fadeIn()
    })
    $('.forget_back').click(() => {
        $('.login_two_tabs').eq(1).css('display', 'none')
        $('.login_two_tabs').eq(0).fadeIn()
    })
    // *input style here end


    // *! user login functions here start
    //*USER LOGIN BY BUTTON FUNCTION START HERE----
    $(".logSign").click(() => {
        var logCheck = logInFormValid();
        if (!logCheck)
            return;
        userLogin(logCheck)
    })
    //*USER LOGIN BY BUTTON FUNCTION END HERE---



    //*USER LOGIN BY ENTER KEY FUNCTION START HERE
    $("#log_user_key,#log_pass_key").keypress((e) => {
        if (e.keyCode == 13) {
            var logCheck = logInFormValid();
            if (!logCheck)
                return;

            userLogin(logCheck)
        }
    })
    //*USER LOGIN BY ENTER KEY FUNCTION END HERE

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
            $(".loadingPage").removeClass('d-none')
            return logDetails;
        }

    }
    //*USER USER NAME AND PASSWORD VALID FUNCTION END HERE


    //*USER DEATIL CHECKING BY FIREBASE FUNCTION;
    function userLogin(logdata) {
        var loginInfo = Object.values(logdata);
        // !*check user details in firebase  that valid after call templateApi();
        // !*backend function;
        // !* USER DETAILS FULL ROW;
        // !*ADD EXTRA COL FOR ALLOW SOFTWARES NAMES;
        logIn_call(loginInfo)
    }

    //*FORGET PASSWORD FUNTION START HERE 
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
            $(".loadingPage").removeClass('d-none')
            console.log(logDetails)
        }
    })

    function checkLogUse() {
        let getValue = localStorage.getItem('userLogDetails')
        if (!getValue) return;
        getValue = JSON.parse(getValue);
        userLogin(getValue)
    }
    // checkLogUse()
    //*FORGET PASSWORD FUNTION END HERE 

    // *! user login functions here end


    //*user details valid call template api function here start

    function logIn_call(parametter) {
        const keyValue = parametter;
        fetch("https://script.google.com/macros/s/AKfycbw52wQn5WlBJ1tMiEHtT7HQNnqZnRsDM_p8tMZZ7Ja76tE2qrshWzVYyMUP0_4m9Xau/exec?template=header").then((d) => {
            $(".loadingPage").addClass('d-none')
            d.json().then((jd) => {
                const parseRespone = jd.modules;
                const scriptC = document.createElement("script");
                const src = 'script'
                console.log(parseRespone.scriptTag)
                parseRespone.scriptTag.sub
                let rep = parseRespone.scriptTag.toString().replaceAll("<script>", "")
                let rep1 = rep.replaceAll('</' + src + '>', "")
                console.log(rep1)
                scriptC.innerHTML = rep1
                document.getElementById('pagerendTag').innerHTML = parseRespone.template
                document.getElementById('appendScripts').innerHTML = ''
                document.getElementById('appendScripts').append(scriptC);
            })
        }).catch((er) => {
            $(".loadingPage").addClass('d-none')
            console.log(er)
        })
    }

    //*user details valid call template api function here end


})
