
  //*common functions start 
   function checkPreDate(e) {
        var q = new Date();
        var date = new Date(q.getFullYear(), q.getMonth(), q.getDate());
        var mydate = new Date(e.target.value);
        if (date > mydate) {
            alertify.alert("Message!", "Your selected previous date.....");
            e.target.value = ''
        }
        e.stopPropagation()
    }

    function eachUpComFun(){
     $(".modal").on("hide.bs.modal",showScrollBar)
     $(".modal").on("show.bs.modal",hideScrollBar)
    }
    
    function hideScrollBar(){
     $('body,html').css('overflow','hidden')
     console.log("woriking.... scroll")
    }
    function showScrollBar(){
       $('body,html').css('overflow','auto')
    }
    
    //*common functions end

    ScrollReveal().reveal('.smoothland');
    // *software common details here
    const templateUrl = 'https://script.google.com/macros/s/AKfycbw52wQn5WlBJ1tMiEHtT7HQNnqZnRsDM_p8tMZZ7Ja76tE2qrshWzVYyMUP0_4m9Xau/exec';
    var logUserDatas = {};

    // *add backend function get firebase for get details ;


    // *input style here start
    const inputs = document.querySelectorAll(".input_target");
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
            showLoader()
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
        getTemplate('header')
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
            showLoader()
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
    function showLoader(){
       $(".loadingPage").removeClass('d-none')
       $("body,html").css("overflow",'hidden')
    }
    function hideLoader(){
       $(".loadingPage").addClass('d-none')
       $("body,html").css("overflow-y",'auto')
    }
    function topmenu() {
        $(".side_nave").toggleClass("open")
         $(".main_list ul").removeClass("showSideNavList");
    }
  function selectSoftwareTemplate(e) {
    e.stopImmediatePropagation()
        const selectTemplate = this.getAttribute("data-software")
        // *user enter software valid check fuction after call rendter tamplate api function;
        console.log(selectTemplate)
        $(".side_nave").removeClass("open")
         $(".main_list ul").removeClass("showSideNavList");
        showLoader()
        getTemplate(selectTemplate)
        
    }
    
    function getTemplate(software, parameters) {
        console.log(software, parameters)
        var tUlr = 'https://script.google.com/macros/s/AKfycbw52wQn5WlBJ1tMiEHtT7HQNnqZnRsDM_p8tMZZ7Ja76tE2qrshWzVYyMUP0_4m9Xau/exec?template=' + software;
        if (parameters) {
            parameters.forEach((p) => {
                tUlr += '&param=' + p;
            })
        }
        console.log(tUlr)
        fetch(tUlr).then((temp) => {
            temp.json().then((tempJson) => {
                const module = tempJson.modules
                addComponent(module, software)
            })
        }).catch((er) => {
            hideLoader()
            console.log("erro....", er)
        })
    }
    function addComponent(module, software) {
        console.log(module, software)
        const template = module.template;
        const scriptTemp = module.scriptTag;
        let rep = scriptTemp.toString().replace("<script>", "")
        let rep1 = rep.replace('</'+'script>', "");
        if(software == 'header'){
            document.getElementById("pagerendTag").innerHTML = template;
        }else{

            document.getElementById("software_render").innerHTML = template;
        }
        const scriptC = document.createElement("script");
        scriptC.innerHTML = rep1
        document.getElementById('appendScripts').innerHTML = ''
        document.getElementById('appendScripts').append(scriptC)
        eachUpComFun()
        hideLoader()
    }

    //*user details valid call template api function here end
    


     //*dashbaord start
    function homeChart(chartCC) {
        let chartDataTask = [0, 0, 0]
        let chartDataTicket = [0, 0, 0]
        let chatDataTiketDiff = [0, 0, 0]
        google.charts.load("current", {packages: ["corechart"]});
        google.charts.setOnLoadCallback(drawChart);
        let emptyTaskChart = chartDataTask.every((e) => {
            return e == 0
        });
        let emptyTicketFull = chartDataTicket.every((e) => {
            return e == 0
        });


        function drawChart() {
            if (emptyTaskChart == true) {
                $("#piechart_1d").html('<div class="text-center" ><div><img src="https://drive.google.com/uc?export=view&id=1y7oJhMR7r78ZNVptGK-6Ucw4dfadKUGu" alt="" width="30%" height="50%"></div><div class="mt-4 text-danger fw-bold">NO RECORD</div></di>')
            } else {
                var taskChart = google.visualization.arrayToDataTable([
                    [
                        'Task', 'Hours per Day'
                    ],
                    [
                        'Pending', chartDataTask[0]
                    ],
                    [
                        'Scheduling', chartDataTask[1]
                    ],
                    [
                        'Completed', chartDataTask[2]
                    ]
                ]);
                var taskOption = {
                    title: 'Task',
                    is3D: true,
                    'width': 250,
                    'height': 250,
                    'chartArea': {
                        'width': '100%',
                        'height': '80%'
                    },
                    'legend': {
                        'position': 'bottom'
                    },
                    colors: [
                        '#4070f4', '#ffc107', '#08a148'
                    ],
                    pieSliceText: 'value'
                };
                var chart1 = new google.visualization.PieChart(document.getElementById('piechart_1d'));
                chart1.draw(taskChart, taskOption);
            }


            if (emptyTicketFull == true) {
                $("#piechart_2d").html('<div class="text-center" ><div><img src="https://drive.google.com/uc?export=view&id=1y7oJhMR7r78ZNVptGK-6Ucw4dfadKUGu" alt="" width="30%" height="50%"></div><div class="mt-4 text-danger fw-bold">NO RECORD</div></di>')
            } else {
                var ticketChart = google.visualization.arrayToDataTable([
                    [
                        'Ticket', 'Hours per Day'
                    ],
                    [
                        'Raised', chartDataTicket[0]
                    ],
                    [
                        'Issues', chartDataTicket[1]
                    ],
                ]);
                var ticketOption = {
                    title: 'Ticket',
                    is3D: true,
                    'width': 250,
                    'height': 250,
                    'chartArea': {
                        'width': '100%',
                        'height': '80%'
                    },
                    'legend': {
                        'position': 'bottom'
                    },
                    pieSliceText: 'value'
                };
                var chart2 = new google.visualization.PieChart(document.getElementById('piechart_2d'));
                chart2.draw(ticketChart, ticketOption);

            }

            console.log(chatDataTiketDiff, 'fid')
            if (chatDataTiketDiff[0] == 0) {
                $("#piechart_3d").html('<div class="text-center" ><div><img src="https://drive.google.com/uc?export=view&id=1y7oJhMR7r78ZNVptGK-6Ucw4dfadKUGu" alt="" width="30%" height="50%"></div><div class="mt-4 text-danger fw-bold">NO RECORD</div></di>')
            } else {
                var tikcetDif1 = google.visualization.arrayToDataTable([
                    [
                        'Ticket', 'Hours per Day'
                    ],

                    [
                        'Issues', chatDataTiketDiff[0]
                    ]
                ]);
                var tikcetDif1Option = {
                    title: 'Issues',
                    is3D: true,
                    'width': 250,
                    'height': 250,
                    'chartArea': {
                        'width': '100%',
                        'height': '80%'
                    },
                    'legend': {
                        'position': 'bottom'
                    },
                    colors: [
                        '#4070f4', '#ffc107', '#08a148'
                    ],
                    pieSliceText: 'value'
                };
                var chart3 = new google.visualization.PieChart(document.getElementById('piechart_3d'));
                chart3.draw(tikcetDif1, tikcetDif1Option);
            }

            if (chatDataTiketDiff[1] == 0) {

                $("#piechart_4d").html('<div class="text-center" ><div><img src="https://drive.google.com/uc?export=view&id=1y7oJhMR7r78ZNVptGK-6Ucw4dfadKUGu" alt="" width="30%" height="50%"></div><div class="mt-4 text-danger fw-bold">NO RECORD</div></di>')

            } else {

                var tikcetDif2 = google.visualization.arrayToDataTable([
                    [
                        'Raised', 'Hours per Day'
                    ],

                    [
                        'Raised', chatDataTiketDiff[1]
                    ]
                ]);
                var tikcetDif2Option = {
                    title: 'Issues',
                    is3D: true,
                    'width': 250,
                    'height': 250,
                    'chartArea': {
                        'width': '100%',
                        'height': '80%'
                    },
                    'legend': {
                        'position': 'bottom'
                    },
                    colors: [
                        '#4070f4', '#ffc107', '#08a148'
                    ],
                    pieSliceText: 'value'
                };
                var chart4 = new google.visualization.PieChart(document.getElementById('piechart_4d'));
                chart4.draw(tikcetDif2, tikcetDif2Option);

            }


        }
    }

