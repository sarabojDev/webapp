var logUserDatas;
var task_entry_point = null;
var current_software = 'home';
var click_notify;
var notification_data_ar = [];



var task_pending_tab_status_ls = [];
var preloader_tab_type_ls = [];
var view_tab_type_ls = [];
var manage_tab_type_ls = [];
var managing_tab_type_ls = [];
var approval_tab_type_ls = [];
var preloader_obj = {}


var no_record = `<div class="no_record_img mt-4"><div><img src="/vendors/images/no_data.svg" alt=""></div><div>No Record</div></div>`;
var fetch_loader = ` <div class="d-flex align-items-center justify-content-center w-100 h-100 fetching_loader"><div class="dashBB_loader"></div></div>`
var loacalTemplate_chatLoader = '<div class="w-100 h-100 d-flex align-items-center justify-content-center no_chat_template p-4">' + '<div class="w-50 h-50 text-center">' + ' <div><img src="https://drive.google.com/uc?export=view&id=10hd-GQbTgi1T06vvGF5_SGuSs_pqYLva" alt="" width="50%" height="50%"></div>' + '<div class="no_chat_text my-2"><div class="chat_prograss_bar"></div></div>' + '</div>' + '</div>';

function fetch_loader_show(id){
 $(id).html(fetch_loader)
}


checkForCookie('key');
function checkForCookie(name) {
    let cookieString = document.cookie.match(name + '=[^;]+')
    const cookie = cookieString ? cookieString[0] : cookieString;
    if (cookie) {
        const splitToken = cookie.split("=")[1];
        const values = splitToken.split(',');
        getUserLog(values[0]).then((result) => {
            if (result.status == true) {
                const log_user = result.data[0].data();
                logUserDatas = log_user;
                notificationlive(logUserDatas.emp_name);
                assign_user_details()
                dashboard_count_setter();

            } else {
                window.open("/index.html", "_top")
            }
        })
    } else {
        console.log(cookie, 'a')
    }
}


function dashboard_count_setter() {
    const dashBoard = dashBoardTask(logUserDatas.emp_name);
    dashBoard.then((d) => {
        if (d.status != false) {
            header_overview_box_count(d.data);
            dashboard_render(d.data);
        }
    })

}


function assign_user_details() {
    $(".user-name").text(logUserDatas.emp_name)
}


function scroll_down(scroll) {
    $(scroll).stop().animate({
        scrollTop: $(scroll)[0].scrollHeight
    }, 1000);
}

// loader functions
function showLoader() {
    $(".loadingPage").css("display", "block")
    $("body,html").css("overflow", 'hidden')
}

function hideLoader() {
    $(".loadingPage").css("display", "none")
    $("body,html").css("overflow-y", 'auto')
}

function checkPreDate(e) {
    var q = new Date();
    var date = new Date(q.getFullYear(), q.getMonth(), q.getDate());
    var mydate = new Date($(e).val());
    if (date > mydate) {
        alertify.alert("Message!", "Your selected previous date.....");
        $(e).val("")
    }
}

function header_overview_box_count(count_obj) {
    console.log(count_obj,"newcoutn")
    const count_value = Object.keys(count_obj);
    if (count_value.length > 0) {
        count_value.forEach((keyV) => {
            $(`.task_${keyV}_count`).text(count_obj[keyV].length)
        })
    }
}







function addNotify_func(notify, ad_value) {
    console.log("notiy", notify)
    let sent_tab;
    if (ad_value.tabs != "auto") {
        sent_tab = ad_value.tabs
    } else {
        sent_tab = logUserDatas.emp_name == notify.user_name ? "Managing" : "Pending"
    }

    let receiver;
    if (ad_value.receiver != "") {
        receiver = ad_value.receiver
    } else {
        receiver = logUserDatas.emp_name == notify.user_name ? logUserDatas.manager : logUserDatas.emp_name
    }

    console.log("uloa", logUserDatas)
    const notification_obj = {
        action: ad_value.action,
        sender: logUserDatas.emp_name,
        receiver,
        software: ad_value.software,
        tab: sent_tab,
        token: notify.token,
        click: ad_value.click,
        message: ad_value.message,
        card_user: notify.user_name
    }
    console.log(notification_obj, "sdfasdf")
    console.log(notify, "sdfasdf")
    notificationalert(notification_obj)
}







function notification_ui(notification) {
    const notification_tag = `<li class="notification_tag" data-notification-token="${notification.doc_id}" onclick="click_notifications_tag(this)">
                                    <a href="javascript:;"> 
                                            <h3>${notification.software_name}</h3>
                                        <p>
                                            ${notification.notification_info}
                                        </p>
                                    </a>
                             </li>`;
    return notification_tag;
}

function append_notification(notification) {
    if ($('.no_nofity')) {
        $('.no_nofity').remove()
    }
    const notification_tag = notification_ui(notification);
    $("#notifications_container_list").append(notification_tag);
    notification_data_ar.push(notification);
    find_notification_card(notification)
    notification_bell_count();
}


function find_notification_card(notify_card){
    const tab = notify_card.moveto_tab.toLowerCase();
    const token = notify_card.doc_id;
    const modify = $(`[data-modify=${token}]`);
    const chat = $(`[data-chat-token=${token}]`);
    console.log(chat,modify)
     if(notify_card.icon == 'Chat'){
       $(chat).children('.red_dt_cls').removeClass('d-none')
      }else{
        $(modify).children('.red_dt_cls').removeClass('d-none')
      }
  }

function notification_readed(id) {
    $(`.notification_tag[data-notification-token=${id}]`).remove()
}

function notification_empty() {
    $("#notifications_container_list").html('<h3 class="no_nofity font-12 text-center">No Notifications...</h3>')
}

function notification_bell_count() {
    if (notification_data_ar.length == 0) {
        $(".notification-active").addClass('d-none')
    } else {
        $(".notification-active").removeClass('d-none')
        $(".notification-active").text(notification_data_ar.length)
    }
}


$('.bell_icon_container').click(function () {
    const badge = $(".notification-active")
    if (!$(badge).hasClass('d-none')) {
        $(badge).addClass('d-none')
    }
})


function click_notifications_tag(e) {
    const notificaionToken = $(e).attr('data-notification-token');
    const find_notifications = notification_data_ar.filter((nofify) => { return nofify.doc_id == notificaionToken });
    $(e).addClass("d-none");
    if (find_notifications.length > 0) {
        const get_obj = find_notifications[find_notifications.length - 1];
        click_notify = get_obj;
        read_update_notification(get_obj.doc_id);
        notification_data_ar = notification_data_ar.filter((nofify) => { return nofify.doc_id != notificaionToken });
        if(get_obj.notification_type == "Click"){
            notification_move_software(get_obj)
        }
    } else {
        console.log('dd')
    }
}


function notification_move_software(notificaion_keys){
    const notify_data = notificaion_keys;
    const tab = notify_data.moveto_tab.toLowerCase();
    const sotfware = notify_data.software_name.toLowerCase();
    task_entry_point = {tab,notification:true,notification_data:notify_data};
    console.log(current_software)
  if(current_software == notify_data.software_name.toLowerCase()){
    auto_move_tab("");
  }else{
    get_template(sotfware);
  }
console.log(notificaion_keys,"keysss")
}


function read_update_notification(id) {
    readNotification(logUserDatas.emp_name, id);
}




function dashboard_render(chart_data) {
    $("#task_chart_tag").empty()
    google.charts.load('current', { 'packages': ['bar'] });
    google.charts.setOnLoadCallback(drawStuff);

    function drawStuff() {
        var data = new google.visualization.arrayToDataTable([
            ['Task', 'Counts'],
            ["Pending", chart_data['pending'].length],
            ["Scheduling", chart_data['scheduling'].length],
            ["Completed", chart_data['completed'].length],
            ["Awaiting Approval", chart_data['awaiting_approval'].length]
        ]);

        var options = {
            width: 400,
            height: 400,
            legend: { position: 'none' },
            chart: {
                title: 'Task Overview',
            },
            axes: {
                x: {
                    0: { side: 'top', label: 'White to move' } // Top x-axis.
                }
            },
            bar: { groupWidth: "10%" }
        };


        var task = new google.charts.Bar(document.getElementById('task_chart_tag'));
        // var ticket = new google.charts.Bar(document.getElementById('ticket_chart_tag'));
        // Convert the Classic options to Material options.
        task.draw(data, google.charts.Bar.convertOptions(options));
        // ticket.draw(data, google.charts.Bar.convertOptions(options));
    };
}

function unsubcribe_onsnap(){
    const snap_unsub = Object.keys(onsnap_store_obj);
    if(snap_unsub.length != 0){
        snap_unsub.forEach((unsub)=>{
           onsnap_store_obj[unsub]();
        })
    }
}

function get_template(software) {
    showLoader();
    unsubcribe_onsnap()
    $.get(`/component/${software}-template.html`, function (data) {
        current_software  = software;
        $('.main-container').html(data);
        if (software == 'task') {
            taskFunctions();
            task_snap_funtions(logUserDatas.emp_name);
            taskPreloader(logUserDatas.emp_name).then((preloder_card)=>{
                if(preloder_card.status == false){
                 makePreloaderCard([])
                }else{
                    console.log(preloder_card,'pre')
                    makePreloaderCard(preloder_card.data,false)
                }
            })
            let sub_ar = logUserDatas.subordinates_details.ad;
            console.log(sub_ar)
            if (sub_ar.length != 0) {
                sub_ar = sub_ar.map((sub) => { return sub.subname })
                approvalCard({sub_name:sub_ar}).then((aprD)=>{
                    if(aprD.status == false){
                       makeApprovalCard([],"",false)
                    }else{
                        makeApprovalCard(aprD.data,"",true)
                    }
                    console.log(aprD,"apprf")
                })
            }
            auto_move_tab("");

        } else if (software == 'home') {
            dashboard_count_setter()
        }
        hideLoader()
    })
}



$('.select_software_tag').click(function () {
    $('.left-side-bar').removeClass('open')
    $('.mobile-menu-overlay').removeClass('show')
    const sotfware = $(this).attr('data-render');
    get_template(sotfware)
})

function move_to_task(){
    get_template('task')
}






// TASK FUNCTIONS START HERE
function auto_move_tab(manual_move) {
    $('.tab_container_box .tab-pane').removeClass('show active')
    $('.tab_container_box_header .nav-item .nav-link').removeClass('active')

    if(manual_move != ""){
        $(`[href="#${manual_move}_bg_tab"]`).addClass("active");
        $(`#${manual_move}_bg_tab`).addClass('active show');
        if (task_entry_point.notification == true) {
            console.log(task_entry_point.notification_data,'noffff')
        }
    }else{
        if (task_entry_point == null) {
            $('[href="#pending_bg_tab"]').addClass("active");
            $("#pending_bg_tab").addClass('active show');
        } else {
            console.log(task_entry_point)
            $(`[href="#${task_entry_point.tab}_bg_tab"]`).addClass("active");
            $(`#${task_entry_point.tab}_bg_tab`).addClass('active show');
            if (task_entry_point.notification == true) {
                console.log(task_entry_point.notification_data,'noffff');
                if(task_entry_point.tab == 'managing'){
                    const managing_tab_filter = { fill_name:task_entry_point.notification_data.notification_send_by,fill_status:"All", sub_users: "" };
                    managing_main_filter(managing_tab_filter,task_entry_point);
                    $("#task_managing_name_sort").val(managing_tab_filter.fill_name);
                }else if(task_entry_point.tab == 'pending'){
                    const ve = task_entry_point
                    setTimeout(()=>{
                        const filter_by = {status:"All",user:logUserDatas.emp_name};
                        pending_main_filter(filter_by,ve,true)
                    },2000)
                    
                }else if(task_entry_point.tab == 'approval'){
                    const ve = task_entry_point
                   setTimeout(()=>{
                    const approval_tab_filter = { user: ve.notification_data.notification_send_by, user_name: logUserDatas.emp_name, sub_name:[]};
                    approval_main_filter(approval_tab_filter,ve,true,true)
                    $("#task_approval_name_sort").val(approval_tab_filter.user)
                   },2000)
                }
            }
        }
    }
    
    task_entry_point = null;
}






function taskFunctions() {
    task_pending_tab_status_ls = [],preloader_tab_type_ls = [],approval_tab_type_ls = [],manage_tab_type_ls = [],managing_tab_type_ls = [],view_tab_type_ls = []
    $(".head_buttons").click(add_task_click_assign)
    $("#add_task_confirm_btn").click(addNewTask)
    $(".chatValue").keyup(enterChatKey)
    selectInputs_value();
}


function add_task_click_assign() {
    let btnType = $(this).attr('data-modal')
    if (btnType == 'preloader')
        $(".preloader_sub_inputs").css("display", 'none');$("#preloaderChange_task_confirm_btn").addClass('d-none');$("#preloader_task_confirm_btn").removeClass('d-none')


    if (btnType == "add")
        $(".extra_close_btn").parent().remove();


    $(`#${btnType}_task_modal_form`)[0].reset();
    $(`#${btnType}_task_modal`).modal("show");
}






/* ----------------- add multiple task button fun start here ---------------- */

function extra_task() {
    let taskInfos = Array.from($(".new_task_info"))
    let taskLength = taskInfos.length;
    let extra_template = `<div class="page-header">
                                <div class="text-right extra_close_btn " onclick="remove_extra_task(this)"><i class="fa fa-close"></i></div>
                                <div class="form-group">
                                    <label>Task Info</label>
                                    <input class="form-control new_task_info " type="text" placeholder="Task Info.......">
                                </div>
                                <div class="form-group">
                                    <label>Schedule Date</label>
                                    <input class="form-control new_task_date requirePreDate" type="date" onchange="checkPreDate(this)">
                                </div>
                            </div>`

    if (taskLength < 5) {
        $("#add_task_modal_form").append(extra_template)
        ex_cHide()
        $('#add_task_modal_form').stop().animate({
            scrollTop: $('#add_task_modal_form')[0].scrollHeight
        }, 1000);

    } else {
        alertify.alert('Message!', 'Max length 5');
    }


}
/* ----------------- add multiple task button fun end here ---------------- */


/* ------------------- remove multiple task fun start here ------------------ */
function remove_extra_task(e) {
    $(e).parent().removeClass("extra_task_add_ani")
    $(e).parent().addClass("extra_task_close_ani")
    $(e).parent().fadeOut("1000", function () {
        $(this).remove();
        ex_cHide()
    });
}
/* ------------------- remove multiple task fun end here ------------------ */




/* ---------------- add multiple add task sub fun start here ---------------- */
function ex_cHide() {
    $(".extra_close_btn").addClass('d-none');
    const ex_length = $(".extra_close_btn").length - 1;
    $(".extra_close_btn").eq(ex_length).removeClass('d-none');
}
/* ---------------- add multiple add task sub fun end here ---------------- */


/* --------------- preloader type sub selecter fun start here --------------- */
function preloaderTypeLoad(e) {
    const selectType = $(e).val()
    if (selectType == 'Daily')
        return $(".preloader_sub_inputs").css("display", 'none');


    $(".preloader_sub_inputs").css("display", 'none');
    $(`.${selectType.toLowerCase()
        }_container`).fadeIn()
}
/* --------------- preloader type sub selecter fun end here --------------- */



function addNewTask() {
    let taskInfos = Array.from($(".new_task_info"))
    let taskDates = Array.from($(".new_task_date"))
    let storeTT = []
    let taskLength = taskInfos.length;
    let valid = true
    for (let i = 0; i < taskLength; i++) {
        if ($(taskInfos[i]).val().trim() == "") {
            alertify.alert("Message!", "Please enter task info....")
            valid = false
            $(taskInfos[i])[0].focus()
        } else if ($(taskDates[i]).val() == "") {
            alertify.alert("Message!", "Please select date....")
            $(taskDates[i])[0].focus()
            valid = false
        } else {
            storeTT.push([
                $(taskInfos[i]).val(),
                $(taskDates[i]).val()
            ])
        }
    }

    if (valid == true) {
        showLoader()
        console.log(storeTT)
        $("#add_task_modal").modal("hide")
        const ex_ma = { manager: logUserDatas.manager, user: logUserDatas.emp_name }
        addtask(storeTT, ex_ma).then((r) => {
            console.log("ne", r)
            scroll_down("#pending_card_list_container")
        })
        hideLoader()
    }

}


/* ----------------------- task assign fun start here ----------------------- */
function assignTask() {
    let info = $("#assign_task_info").val();
    let mbName = $("#assing_mmb_value").val();
    if (!info.trim()) {
        alertify.alert("Message!", "Please enter info....")
        return
    } else if (!mbName) {
        alertify.alert("Message!", "Please select name....")
        return
    } else {
        showLoader()
        $("#assign_task_modal").modal("hide")
        assignNewTask(info, mbName, logUserDatas.emp_name).then((ass_task) => {
            console.log(ass_task, "sdfasdf")
            const sub_notify_value = {
                tabs: "auto",
                software: "TASK",
                action: "Assign Task",
                message: 'Task has been assign by ' + logUserDatas.emp_name,
                click: "Click",
                receiver: ass_task.data.user_name
            }
            addNotify_func(ass_task.data, sub_notify_value)
        })
        hideLoader()
    }
}
/* ----------------------- task assign fun end here ----------------------- */


/* ---------------------- task preloader form fun start here --------------------- */
function preloaderTask() {
    const selecttype = $("#preloader_type_value").val();
    const infoe = $("#preloader_info_value").val();
    if (!infoe.trim())
        return alertify.alert("Message!", "Please enter task info....");
    console.log(selecttype, infoe)

    const preloaderObjec = {
        type: selecttype,
        info: infoe,
        user: logUserDatas.emp_name
    }
    if (selecttype == 'Weekly') {
        const t1 = $("#preloader_type_weekly").val();
        preloaderObjec.weeklyDay = t1;
        addPreloadertask(preloaderObjec)
    } else if (selecttype == 'Monthly') {
        const m1 = $("#preloader_type_monthly_month").val();
        const m2 = $("#preloader_type_monthly_date").val();
        if (!m2)
            return alertify.alert("Message!", "Please enter date....");


        preloaderObjec.month = m1
        preloaderObjec.date = m2
        addPreloadertask(preloaderObjec)
    } else if (selecttype == 'Yearly') {
        const date = $("#preloader_type_yearly").val();
        if (!date)
            return alertify.alert("Message!", "Please Select Date....");


        preloaderObjec.yeardate = date;
        addPreloadertask(preloaderObjec)
    } else if (selecttype == 'Daily') {
        addPreloadertask(preloaderObjec)
    }

}




/* ---------------------- task preloader fun start here --------------------- */
function addPreloadertask(obj) {
    showLoader()
    $("#preloader_task_modal").modal("hide")
    addPreLoad(obj).then((preloadEs)=>{
        if(preloadEs.status == false) return alertify.alert("Message!",preloadEs.message);
        makePreloaderCard([preloadEs.data],false)
        scroll_down("#preloader_card_list_container")
    })
    hideLoader()
}
/* ---------------------- task preloader fun end here --------------------- */






/* ----------- select and inputs assign value functions start here ---------- */
function selectInputs_value() {
    const sub_ar = logUserDatas.subordinates_details.ad;
    const allsub_ar = logUserDatas.allsubordinates.as;
    console.log(allsub_ar)
    if (sub_ar.length == 0) { } else {
        let sub_option
        let sub_option_all = '<option value="All" selected>All</option>'
        sub_ar.forEach((sub) => {
            sub_option += `<option value="${sub.subname
                }">${sub.subname
                }</option>`;
            sub_option_all += `<option value="${sub.subname
                }">${sub.subname
                }</option>`;
        })
        $("#assing_mmb_value").append(sub_option)
        $("#task_managing_name_sort,#task_approval_name_sort").append(sub_option_all)

        let all_sub_a = '<option value="All" selected >All</option>';
        allsub_ar.forEach((alsub) => {
            all_sub_a += `<option value="${alsub}"  >${alsub}</option>`
        })
        $("#task_manage_name_sort").html(all_sub_a)

    }
}
/* ----------- select and inputs assign value functions end here ---------- */


var menu_card_objects = {}
function menu_icons(e){
    const icon = $(e).attr('data-md-icon');
    const token = $(e).parent().parent().attr('data-modify');
    const card_user = $(e).parent().parent().attr('data-card-owner')
    const obj = { user_name:card_user,token }
    $(e).parent().prev().children('.red_dt_cls').addClass("d-none")
    showLoader()
    read_update_notification(token)
    modifyIcon(obj).then((task_data)=>{
        hideLoader()
        if(task_data.status == true){
            const reSAr = Array.from($(".modify_form"))
             reSAr.forEach((formE)=>{
               $(formE)[0].reset()
             })
            menu_card_objects = task_data.data;
            set_pre_input_value(task_data.data)
            if(icon == "download"){
                getDownFile()
            }
            $(`#task_${icon}_modity_modal`).modal('show');
        }else{
            alertify.alert("!Message","Please Try Again....");
        }
    })

}


function set_pre_input_value(input_date){
    $(".empty_valu_einput").val("")
    
    const create_date  = new Date(input_date.created_on.toDate()).toISOString().split("T")[0];
    $(".modify_task_info_input").val(input_date.task_description)
    $(".modify_task_create_date_input").val(create_date)
    $(".modify_task_manager_name_input").val(input_date.manager)
    $(".modify_task_status_input").val(input_date.card_status)

    if(input_date.card_status != "Scheduling"){
        const schedule_date  = new Date(input_date.scheduled_On.toDate()).toISOString().split("T")[0];
        console.log(schedule_date)
        $(".modify_task_schedule_input").val(schedule_date)
    }
    if(input_date.card_status == "Awaiting Approval"){
       
        const extend_date = new Date(input_date.extended_on[input_date.extended_on.length - 1].date.toDate()).toISOString().split("T")[0];
        $('.extend_date_input').val(extend_date)
        
    }

}





/* -------------------------- modify icons funtions ------------------------- */

/* ------------ task modify edit icons event functions start here ----------- */
function editTask(){
    const card_store_value = menu_card_objects;
    const editText = $("#modify_edit_input").val();
    console.log(card_store_value)
    if (card_store_value.task_description == editText) return alertify.alert("Messsage!", "Same Descriptions....!")
    if (editText.trim() == "")
        return alertify.alert("Message!", "Please enter task info")
    const edit_obj = { user: card_store_value.user_name, token: card_store_value.token, editText }

    $("#task_edit_modity_modal").modal("hide");
     showLoader()
    editTaskInfo(edit_obj);
    let receiverE = ""
    if(card_store_value.card_type == 'Assign'){
        receiverE = card_store_value.user_name;
    }
    const sub_notify_value = {
        tabs: "auto",
        software: "TASK",
        action: "Edit Task",
        message: 'Task has been edited by ' + logUserDatas.emp_name,
        click: "Click",
        receiver: receiverE
    }
    addNotify_func(card_store_value, sub_notify_value)
    hideLoader()

}
/* ------------- task modifty edit icon event function end here ------------- */





/* ---------------- task modify schedule icon fun start here ---------------- */
function scheduleTask() {
    const card_store_value = menu_card_objects;
    const scheduleDate = $("#modify_task_schedule_input").val();
    if (scheduleDate == "")
        return alertify.alert("Message!", "Please select schedule date....!");
    const edit_obj = { user: card_store_value.user_name, token: card_store_value.token, schedule_date: new Date(scheduleDate) }
    const sub_notify_value = {
        tabs: "auto",
        software: "TASK",
        action: "Schedule Task",
        message: 'Task has been scheduled by ' + logUserDatas.emp_name,
        click: "Click",
        receiver: ""
    }
    addNotify_func(card_store_value, sub_notify_value)

    $("#task_schedule_modity_modal").modal("hide");
     showLoader()
    scheduleTask_backend(edit_obj)
     hideLoader()
}
/* --------------- task modify schedule icon function end here -------------- */


/* ------------------------- deleted task start here ------------------------ */
function deleteTask() {
    const card_store_value = menu_card_objects;
    const edit_obj = { user: card_store_value.user_name, token: card_store_value.token }
    const sub_notify_value = {
        tabs: "auto",
        software: "TASK",
        action: "Delete Task",
        message: 'Task has been deleted by ' + logUserDatas.emp_name,
        click: "Non-Click",
        receiver: ""
    }
    addNotify_func(card_store_value, sub_notify_value)
    $("#task_delete_modity_modal").modal("hide");
   if(card_store_value.card_type == "Assign"){
        $(`.card_template_main[data-card-container-managing=${id}]`).remove();
    }
     showLoader()
     taskDelete(edit_obj)
     hideLoader()
}


function deleted_task_all(data) {
    $(`.card_template_main[data-card-container-pending=${data.token}]`).remove();
    task_pending_tab_status_ls = task_pending_tab_status_ls.filter((eTask)=>{return eTask.token != data.token})
    const pard = Array.from($('#pending_card_list_container').children('.card_template_main'));
    if(pard.length == 0){
        $('#pending_card_list_container').html(no_record);
    }
    task_pending_tab_set_counts()
}
/* ------------------------- deleted task end here ------------------------ */


/* ---------------- task modify completed icon fun start here --------------- */
function completedTask() {
    const card_store_value = menu_card_objects;
    const edit_obj = { user: card_store_value.user_name, token: card_store_value.token, comD: card_store_value.completed_on }
    const sub_notify_value = {
        tabs: "auto",
        software: "TASK",
        action: "Completed Task",
        message: 'Task has been completed by ' + logUserDatas.emp_name,
        click: "Click",
        receiver: ""
    }
    addNotify_func(card_store_value, sub_notify_value)

    $("#task_completed_modity_modal").modal("hide");
     showLoader()
    completeTask(edit_obj).then((compTask) => { hideLoader()})
   
   
}
/* ---------------- task modify completed icon fun end here --------------- */




/* ----------------- task modify restore icon fun start here ---------------- */

function restoreTask() {
    const card_store_value = menu_card_objects;
    const edit_obj = { user: card_store_value.user_name, token: card_store_value.token, comD: card_store_value.completed_on }
    $("#task_restore_modity_modal").modal("hide");
    const sub_notify_value = {
        tabs: "auto",
        software: "TASK",
        action: "Restore Task",
        message: 'Task has been Restore by ' + logUserDatas.emp_name,
        click: "Click",
        receiver: ""
    }
    showLoader()
    addNotify_func(card_store_value, sub_notify_value)
    restoreTask_backend(edit_obj).then((restore) => {
        if (restore.status == false) return alertify.alert("Message!", restore.message);
        alertify.alert("Message!", restore.message);
    })
     hideLoader()
}







/* ----------------- task modify extend icon fun start here ----------------- */
function extendTask() {
    const card_store_value = menu_card_objects;
    const exDate = $("#modify_extend_date").val();
    if (exDate == "")
        return alertify.alert("Message!", "Please selecet extend date....!")
    const edit_obj = { user: card_store_value.user_name, token: card_store_value.token, ex_ar: card_store_value.extended_on, ex_date: new Date(exDate) }
    const sub_notify_value = {
        tabs: "Approval",
        software: "TASK",
        action: "Extends Task",
        message: 'Task has been extend by ' + logUserDatas.emp_name,
        click: "Click",
        receiver: ""
    }
    console.log(card_store_value, sub_notify_value, "df")
    addNotify_func(card_store_value, sub_notify_value)
    $("#task_extend_modity_modal").modal("hide");
     showLoader()
    extendTask_backend(edit_obj)
     hideLoader()
    console.log(exDate)
}

/* ----------------- task modify extend icon fun start here ----------------- */
function checkAppr_card(id) {
    const ce_ee = Array.from($(`#${id} .card_template_main`));
    if (ce_ee.length == 0) {
        $(`#${id}`).html(no_record)
    }
}

function approvalTask() {
    const appval_status1 = $("#approval1")[0].checked;
    const appval_status2 = $("#approval2")[0].checked;
    var approved;
    if(appval_status1 == true){
        approved = true
    }else{
        approved = false
    }
    const card_store_value = menu_card_objects;
    const edit_obj = { user: card_store_value.user_name, token: card_store_value.token, status: approved, ex_on_ar: card_store_value.extended_on }
    const sub_notify_value = {
        tabs: "auto",
        software: "TASK",
        action: "Approved Task",
        message: 'Task has been approved by ' + logUserDatas.emp_name,
        click: "Click",
        receiver: card_store_value.user_name
    }
    addNotify_func(card_store_value, sub_notify_value)
    $("#task_approval_modity_modal").modal("hide");
    showLoader()
    console.log(card_store_value, "dfsdf")
    $(`.card_template_main[data-card-container-approval=${card_store_value.token}]`).remove();
    checkAppr_card("approval_card_list_container")
    approvetask(edit_obj)
    hideLoader()
}





/* ----------------------- MODIFY FUNCTIONS END HERE ---------------------- */



/* ----------------- task modify upload icons fun start here ---------------- */
function uploadeTask() {
    const card_store_value = menu_card_objects;
    const uploadFile = $("#task_upload_input");
    const files = uploadFile[0].files;
    if (files.length == 0)
        return alertify.alert("Message!", "Please select file..!");

        console.log(files)
    const upload_data = { user: logUserDatas.emp_name, uploade_files: files, token: card_store_value.token };
    let receivarE = "";
    if(card_store_value.manager == logUserDatas.emp_name){
        receivarE = card_store_value.user_name;
    }
    const sub_notify_value = {
        tabs: "auto",
        software: "TASK",
        action: "Uploade Task",
        message: 'Task has been uploaded by ' + logUserDatas.emp_name,
        click: "Click",
        receiver: receivarE
    }
    $("#task_upload_modity_modal").modal('hide')
    showLoader()
    addNotify_func(card_store_value, sub_notify_value)
    uploader(files, card_store_value)
    hideLoader()
    console.log(upload_data)
}


function getDownFile(){
    const card_store_value = menu_card_objects;
    showLoader()
    getUploadFile(card_store_value.token).then((downloadFile)=>{
        $(".download_append").empty()
        hideLoader()
        if(downloadFile.length == 0){
            $(".download_append").html(' <h5 class="text-center w-100">No Files</h5>')
        }else{
            downloadFile.forEach(async(down)=>{
                const downUrl  = await down.getDownloadURL();
                console.log(down)
              let  downUI = `<div class="down_file text-center">
                <div class="down_file_icon">
                   <i class="icon-copy dw dw-file"></i>
                </div>
                <div class="down_file_name">
                   <a href="${downUrl}" download> <samp>${down.name}</samp></a>
                </div>
            </div>`;
                console.log(down)
                $(".download_append").append(downUI)
            })

           

        }
      console.log(downloadFile)
    })
}


/* ----------------- task modify upload icons fun end here ---------------- */
function preloaderTask_update() {
    const selecttype = $("#preloader_type_value").val();
    const infoe = $("#preloader_info_value").val();
    if (!infoe.trim()){
     alertify.alert("Message!", "Please enter task info....");
     return {status:false}
    }else{
        const preloaderObjec = {
            type: selecttype,
            info: infoe,
            user: logUserDatas.emp_name
        }
        if (selecttype == 'Weekly') {
            const t1 = $("#preloader_type_weekly").val();
            preloaderObjec.weeklyDay = t1;
            return {status:true,data:preloaderObjec}
        } else if (selecttype == 'Monthly') {
            const m1 = $("#preloader_type_monthly_month").val();
            const m2 = $("#preloader_type_monthly_date").val();
            if (!m2){
    
                 alertify.alert("Message!", "Please enter date....");
                 return {status:false}
            }else{
                preloaderObjec.month = m1
                preloaderObjec.date = m2
                return {status:true,data:preloaderObjec}
            }
    
    
            
        } else if (selecttype == 'Yearly') {
            const date = $("#preloader_type_yearly").val();
            if (!date){
                 alertify.alert("Message!", "Please Select Date....");
                 return {status:false}
            }else{
                preloaderObjec.yeardate = date;
                return {status:true,data:preloaderObjec}
            }
        } else if (selecttype == 'Daily') {
            return {status:true,data:preloaderObjec}
        }
    }


    

}
function preloaderTaskEdit(){
   const getDt = preloaderTask_update();
   const cardEE = preloader_obj;
   if(getDt.status){
    showLoader()
    const pre = {user:logUserDatas.emp_name,token:cardEE.token};
    console.log(pre,"dddd",getDt.data)
    updatePreloaderCard(pre,getDt.data).then((updatePreloader)=>{
        hideLoader();
        $("#preloader_task_modal").modal('hide');
        const maked = makePreloadTask_card_ui(updatePreloader.data,false);
       const replaceTag  =  $(`.card_template_main[data-card-container-preloader=${updatePreloader.data.token}]`);
       console.log(replaceTag,updatePreloader)
       replaceTag[0].outerHTML = maked;
        console.log(updatePreloader,"update")
    })
   }
  
}


function deletePreloaderTask(){
    const delData = preloader_obj
    showLoader();
    deletePreloaderCard({user:logUserDatas.emp_name,token:delData.token}).then((del)=>{
      hideLoader();
      $("#preloadertask_delete_modity_modal").modal('hide');
      const replaceTag  =  $(`.card_template_main[data-card-container-preloader=${delData.token}]`);
      preloader_tab_type_ls = preloader_tab_type_ls.filter((prel)=>{return prel.token != delData.token});
      $(replaceTag).remove()
      preloader_cx_count_set()
      checkAppr_card("preloader_card_list_container")
    })
}


function preloader_menu(e){
    console.log("dsfas")
    const token = $(e).parent().attr('data-modify-token');
    const icon = $(e).attr('data-icons-name');
    const getPre = {user:logUserDatas.emp_name,token}
    showLoader()
    getPreloaderCard(getPre).then((preData)=>{
        hideLoader()
       
        if(preData.status){
            const preloaderCard = preData.data;
            preloader_obj = preloaderCard
            if(icon == "edit"){
                $("#preloaderChange_task_confirm_btn").removeClass('d-none')
                $("#preloader_task_confirm_btn").addClass('d-none')
                $("#preloader_info_value").val(preloaderCard.preInfo)
                $("#preloader_task_modal").modal("show");
                $(".preloader_sub_inputs").css("display", 'none');
                $("#preloader_type_value").val(preloaderCard.preTpye)
                if(preloaderCard.preTpye == "Weekly"){
                 $('.weekly_container').fadeIn();
                 $("#preloader_type_weekly").val(preloaderCard.preDay)
                }else if(preloaderCard.preTpye == "Monthly"){
                 $(".monthly_container").fadeIn();
                 $("#preloader_type_monthly_month").val(preloaderCard.preMonth)
                 $("#preloader_type_monthly_date").val(preloaderCard.preDate)
                }else if(preloaderCard.preTpye == "Yearly"){
                    $(".yearly_container").fadeIn();
                    $("#preloader_type_yearly").val(preloaderCard.preyear)
                }
            }else{
                 $('.prealoder_status_view').val(preData.data.preStatus)
                 $('.prealoder_info_view').val(preData.data.preInfo)
                 $('.prealoder_type_view').val(preData.data.preTpye)
                $(`#preloadertask_${icon}_modity_modal`).modal('show')
            }
        }else{
            alertify.alert("Message!","Please Try Again...")
        }
    })
}







/* -------------------------- // task ui start functions -------------------------- */
 
function makeTaskCard(taskData,tab){
    let create_date = taskData.created_on.toDate();
    create_date = new Date(create_date).toDateString();
 
    let schedule_date;
    if(taskData.card_status != "Scheduling"){
        schedule_date = taskData.scheduled_On.toDate();
        schedule_date = new Date(schedule_date).toDateString();
    }
    let extend_date;
    if(taskData.card_status == "Approved"){
        extend_date = new Date(taskData.extended_on[taskData.extended_on.length - 1].date.toDate()).toDateString();
    }
    
    let completed_date;
    if(taskData.card_status == "Completed"){
        completed_date = new Date(taskData.completed_on[taskData.completed_on.length - 1].date.toDate()).toDateString()
    }
    let chat = false;
    let task= false;
    chat = notification_data_ar.some((eR)=>{return eR.icon == 'Chat' && eR.doc_id == taskData.token});
    task = notification_data_ar.some((eR)=>{return eR.icon != 'Chat' && eR.doc_id == taskData.token});


   var task_card = ` <li class=" card-box mb-2  d-flex align-items-center justify-content-between border-bottom card_template_main" data-card-container-${tab}="${taskData.token}" >
   <div class="name-avatar d-flex align-items-center ml-2">
       <div class="txt">
           <div >
               <span class="badge badge-pill badge ${taskData.card_status.toLowerCase().replaceAll(" ","_")}_badge_cls" style=" background-color: rgb(231, 235, 245);">${taskData.card_status}</span>
               <span class="badge badge-pill badge ${taskData.card_type.toLowerCase().replaceAll(" ","_")}_badge_cls mx-1" style=" background-color: rgb(231, 235, 245);">${taskData.card_type}</span>`;
               if(taskData.badge != ""){
                task_card +=`<span class="badge badge-pill badge text-danger" style=" background-color: rgb(231, 235, 245);">New</span>`
               }

               if(tab == "managing" || tab == "approval" || tab == "manage"){
                task_card +=`<span class="badge badge-pill badge text-dark" style=" background-color: rgb(231, 235, 245);">${taskData.user_name}</span>`
               }
               task_card += `</div>
           <div class=" weight-600 card_info_text my-1">${taskData.task_description}</div>`;
           if(taskData.card_status == 'Scheduling'){
             task_card += `<div class="font-12 weight-500 card_schedule_date"  style="color: rgb(79 78 82);">
                                 <span><span>Created Date:${create_date}</span></span>
                         </div>`;
           }else if(taskData.card_status == "Approved"){
            task_card +=  `<div class="font-12 weight-500 card_schedule_date"  style="color: rgb(79 78 82);">
                         <span><span>Extend Date: ${extend_date}</span></span>
                 </div>`;
           }else if(taskData.card_status == "Completed"){
            task_card +=  `<div class="font-12 weight-500 card_schedule_date"  style="color: rgb(79 78 82);">
                         <span><span>Completed Date: ${completed_date}</span></span>
                 </div>`;
           }else{
            task_card +=  `<div class="font-12 weight-500 card_schedule_date"  style="color: rgb(79 78 82);">
                         <span><span>Schedule Date: ${schedule_date}</span></span>
                 </div>`;
           }
           task_card += `</div>
   </div>
   <div class="d-flex justify-content-between">
       <div class="cta flex-shrink-0">
           <div class="dropdown" data-modify="${taskData.token}" data-tab="${tab}" data-card-owner="${taskData.user_name}">
               <a class="btn btn-link font-24 p-0 line-height-1 no-arrow dropdown-toggle" data-color="#1b3133" href="javascript:;" role="button" data-toggle="dropdown" style="color: rgb(27, 49, 51);">
                   <i class="dw dw-more"></i>`;
                   if(task == true){
                    task_card +=  `<div class="red_dt_cls" style="transform: translate(15px, -20px);"></div>`
                   }else{
                    task_card +=  `<div class="red_dt_cls d-none" style="transform: translate(15px, -20px);"></div>`
                   }
      task_card +=  `</a>
               <div class="dropdown-menu dropdown-menu-right dropdown-menu-icon-list"  >
                   <a class="dropdown-item" href="javascript:;" data-md-icon="view" onclick="menu_icons(this)" ><i class="dw dw-eye"></i> View</a>`
                    if((taskData.card_type == "Self" && logUserDatas.emp_name == taskData.user_name && taskData.card_status != "Completed") || (taskData.card_type == 'Assign' && logUserDatas.emp_name == taskData.manager && taskData.card_status != "Completed")){
                       task_card += `<a class="dropdown-item" href="javascript:;" data-md-icon="edit" onclick="menu_icons(this)"><i class="dw dw-edit2"></i> Edit</a>`
                       if(taskData.card_status == "Pending" || taskData.card_status == "Approved"){
                           task_card +=`<a class="dropdown-item" href="javascript:;" data-md-icon="delete" onclick="menu_icons(this)"><i class="dw dw-delete-3"></i> Delete</a>`
                        }
                    }
                    if(taskData.card_status == "Scheduling" && logUserDatas.emp_name == taskData.user_name){
                        task_card +=  `<a class="dropdown-item" href="javascript:;" data-md-icon="schedule" onclick="menu_icons(this)" ><i class="dw dw-time-management"></i> Schedule</a>`
                    }
                    if((taskData.card_status == "Approved" || taskData.card_status == "Pending") && taskData.user_name == logUserDatas.emp_name){
                        task_card +=  `<a class="dropdown-item" href="javascript:;" data-md-icon="completed" onclick="menu_icons(this)" ><i class="dw dw-tick"></i> Complete</a>`
                    }

                    if(taskData.card_status == "Completed" && taskData.user_name == logUserDatas.emp_name){
                        task_card += `<a class="dropdown-item" href="javascript:;" data-md-icon="restore" onclick="menu_icons(this)" ><i class="dw dw-refresh1"></i> Restore</a>`
                    }
                    
                    if((taskData.card_status == "Pending" || taskData.card_status == "Approved") && taskData.user_name == logUserDatas.emp_name){
                        task_card +=  `<a class="dropdown-item" href="javascript:;" data-md-icon="extend" onclick="menu_icons(this)" ><i class="dw dw-wall-clock2"></i> Extend</a>`
                    }

                    if(taskData.card_status == "Awaiting Approval" && logUserDatas.emp_name == taskData.manager){
                        task_card +=  `<a class="dropdown-item" href="javascript:;" data-md-icon="approval" onclick="menu_icons(this)" ><i class="dw dw-check"></i> Approval</a>`
                    }
                    if((tab == "managing" || tab == "pending") && taskData.card_status != "Completed"){
                        task_card +=  `<a class="dropdown-item" href="javascript:;" data-md-icon="upload" onclick="menu_icons(this)" ><i class="dw dw-upload1"></i> Upload</a>`
                    }
                    
                    task_card +=  `<a class="dropdown-item" href="javascript:;" data-md-icon="download" onclick="menu_icons(this)" ><i class="dw dw-download1"></i> Download</a>`
                    task_card +=   `</div>
           </div>
       </div>
       <div class="cta flex-shrink-0 mx-3 chat_menu_cls" data-chat-token="${taskData.token}" data-owner="${taskData.user_name}" onclick="chat_menu_button(this)" >
           <i class="dw dw-chat"></i>`;
           if(chat == true){
            task_card +=  `<div class="red_dt_cls" style="transform: translate(15px, -25px);"></div>`
           }else{
            task_card +=  `<div class="red_dt_cls d-none" style="transform: translate(15px, -25px);"></div>`
           }
     task_card += `</div>
   </div>
   
</li>`

return task_card;

}


function preloader_cx_count_set(){
    const preload_types = {daily:[],monthly:[],yearly:[],weekly:[]}
    preloader_tab_type_ls.filter((preloade_s)=>{
        console.log(preloade_s)
        preload_types[preloade_s.preTpye.toLowerCase()].push(preloade_s);
    });
    const typeLength = Object.keys(preload_types);
    typeLength.forEach((tys)=>{
        $(`.status_count_s_${tys}`).text(preload_types[tys].length);
    })
}




 function makePreloadTask_card_ui(taskData){

    var preload_task_ui = `<li class=" card-box mb-2  d-flex align-items-center justify-content-between border-bottom card_template_main" data-card-container-preloader="${taskData.token}" >
                                    <div class="name-avatar d-flex align-items-center px-2">
                                        <div class="txt">
                                            <div>
                                                <span class="badge badge-pill badge text-primary"  style="background-color: rgb(231, 235, 245);">${taskData.preStatus}</span>
                                                <span class="badge badge-pill badge text-dark"  style="background-color: rgb(231, 235, 245);">${taskData.preTpye}</span>
                                            </div>
                                            <div class=" weight-600 card_info_text my-1">${taskData.preInfo}</div>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-between mr-2">
                                        <div class="cta flex-shrink-0">
                                            <div class="dropdown">
                                                <a class="btn btn-link font-24 p-0 line-height-1 no-arrow dropdown-toggle" data-color="#1b3133" href="javascript:;" role="button" data-toggle="dropdown" style="color: rgb(27, 49, 51);">
                                                    <i class="dw dw-more"></i>
                                                </a>
                                                <div class="dropdown-menu dropdown-menu-right dropdown-menu-icon-list" data-modify-token="${taskData.token}">
                                                    <a class="dropdown-item" href="javascript:;"  onclick="preloader_menu(this)" data-icons-name="view"><i class="dw dw-eye"></i> View</a>
                                                    <a class="dropdown-item" href="javascript:;"  onclick="preloader_menu(this)" data-icons-name="edit"><i class="dw dw-edit2"></i> Edit</a>
                                                    <a class="dropdown-item" href="javascript:;"  onclick="preloader_menu(this)" data-icons-name="delete"><i class="dw dw-delete-3" ></i> Delete</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            </li>`;
            return preload_task_ui
 }


 function makePreloaderCard(card_preloader,empty_count){
    remove_no_RL("#preloader_card_list_container")
    if(empty_count){
        preloader_tab_type_ls = []
    }
      if(card_preloader.length == 0){
        $("#preloader_card_list_container").html(no_record)
      }else{
        card_preloader.filter((preload)=>{
            preloader_tab_type_ls.push(preload);
            const preloaderCxU = makePreloadTask_card_ui(preload);
            $("#preloader_card_list_container").append(preloaderCxU);
        })
    }
    preloader_cx_count_set()
 }






function task_pending_tab_set_counts(){
    const status_list = task_pending_tab_status_ls;
    const task_status_obj ={pending:[],approved:[],awaiting_approval:[],scheduling:[]};
    status_list.filter((status_list)=>{
        if(status_list.card_status != "Completed"){
            task_status_obj[status_list.card_status.toLowerCase().replaceAll(" ","_")].push(status_list);
        }
    });
    const status_D = Object.keys(task_status_obj);
    status_D.filter((key_status)=>{
        $(`.status_count_s_${key_status}`).text(task_status_obj[key_status].length)
    })
}


function task_view_tab_set_counts(){
    const status_list = view_tab_type_ls;
    const task_status_obj ={pending:[],approved:[],awaiting_approval:[],completed:[]};

    status_list.filter((status_list)=>{
        console.log(status_list.card_status.toLowerCase().replaceAll(" ","_"))
        task_status_obj[status_list.card_status.toLowerCase().replaceAll(" ","_")].push(status_list);
    });

    const status_D = Object.keys(task_status_obj);
    status_D.filter((key_status)=>{
        $(`.view_count_list_${key_status}`).text(task_status_obj[key_status].length)
    })
}
function task_manage_tab_set_counts(){
    const status_list = manage_tab_type_ls;
    const task_status_obj ={pending:[],approved:[],awaiting_approval:[],completed:[]};

    status_list.filter((status_list)=>{
        console.log(status_list.card_status.toLowerCase().replaceAll(" ","_"))
        task_status_obj[status_list.card_status.toLowerCase().replaceAll(" ","_")].push(status_list);
    });

    const status_D = Object.keys(task_status_obj);
    status_D.filter((key_status)=>{
        $(`.manage_count_list_${key_status}`).text(task_status_obj[key_status].length)
    })
}
function task_managing_tab_set_counts(){
    const status_list = managing_tab_type_ls;
    const task_status_obj ={pending:[],approved:[],completed:[],scheduling:[]};

    status_list.filter((status_list)=>{
        console.log(status_list.card_status.toLowerCase().replaceAll(" ","_"))
        task_status_obj[status_list.card_status.toLowerCase().replaceAll(" ","_")].push(status_list);
    });

    const status_D = Object.keys(task_status_obj);
    status_D.filter((key_status)=>{
        $(`.managing_count_list_${key_status}`).text(task_status_obj[key_status].length)
    })
}
function task_approval_tab_set_counts(){
    const status_list = approval_tab_type_ls;
    const task_status_obj ={awaiting_approval:[]};

    status_list.filter((status_list)=>{
        console.log(status_list.card_status.toLowerCase().replaceAll(" ","_"))
        task_status_obj[status_list.card_status.toLowerCase().replaceAll(" ","_")].push(status_list);
    });

    const status_D = Object.keys(task_status_obj);
    status_D.filter((key_status)=>{
        $(`.approval_count_list_${key_status}`).text(task_status_obj[key_status].length)
    })
}


function remove_no_RL(appengingTag){
    if($(appengingTag).children().hasClass('fetching_loader')){
        $(appengingTag).children('.fetching_loader').remove()
    }else if($(appengingTag).children().hasClass('no_record_img')){
        $(appengingTag).children('.no_record_img ').remove();
    }
}

function makePendingCard(card_data,callback,empty_count){
    const appengingTag =  $("#pending_card_list_container")
    remove_no_RL(appengingTag)
    if(empty_count){
        task_pending_tab_status_ls = [];
    }

    if(card_data.length ==0){
        $(appengingTag).html(no_record);
    }else{
       card_data.forEach((task_make_card)=>{
        task_pending_tab_status_ls.push(task_make_card);
        const makeCard = makeTaskCard(task_make_card,'pending');
        $(appengingTag).append(makeCard);
       });

       if(callback != false){
        const select_card =  $(`[data-card-container-pending=${callback.notification_data.doc_id}]`);
        moving_card("#pending_card_list_container",select_card);
       }
    }
    task_pending_tab_set_counts()

}


function makeViewCard(view_card_data){
    remove_no_RL("#view_card_list_container")
    view_tab_type_ls = [];
    if(view_card_data.length == 0){
        $("#view_card_list_container").html(no_record)
     }else{
        view_card_data.filter((view_dD)=>{
            view_tab_type_ls.push(view_dD);
            const viewW = makeTaskCard(view_dD,"");
            $("#view_card_list_container").append(viewW)
        })
    }
    task_view_tab_set_counts();
}



function makeManageCard(manage_card_data){
    remove_no_RL("#manage_card_list_container")
     manage_tab_type_ls = []
    if(manage_card_data.length == 0){
        $("#manage_card_list_container").html(no_record)
      }else{
        manage_card_data.filter((manageD)=>{
            manage_tab_type_ls.push(manageD);
            const manage = makeTaskCard(manageD,'manage');
            $("#manage_card_list_container").append(manage);
        })
    }
    task_manage_tab_set_counts()
}



function makeManagingCard(managing_card_data,callback){
    remove_no_RL("#managing_card_list_container")
    managing_tab_type_ls = [];
    if(managing_card_data.length == 0){
        $("#managing_card_list_container").html(no_record)
    }else{
        managing_card_data.filter((managingE)=>{
            managing_tab_type_ls.push(managingE)
            const manaagingCaS = makeTaskCard(managingE,"managing");
            $("#managing_card_list_container").append(manaagingCaS);
        })
        if(callback != false){
            const select_card =  $(`[data-card-container-managing=${callback.notification_data.doc_id}]`);
            moving_card("#managing_card_list_container",select_card);
            console.log(select_card,"selelcted card")
            console.log(callback,"notificaions call back")
        }
    }
    task_managing_tab_set_counts()
}



function makeApprovalCard(approval_card_data,callback,empty_count){
    remove_no_RL("#approval_card_list_container")
   if(empty_count){
    approval_tab_type_ls = []
   }
    if(approval_card_data.length == 0){
        $("#approval_card_list_container").html(no_record)
    }else{
        approval_card_data.filter((approvale)=>{
            approval_tab_type_ls.push(approvale)
            const approvalsse = makeTaskCard(approvale,"approval");
            $("#approval_card_list_container").append(approvalsse);
        })
        if(callback != false){
            const select_card =  $(`[data-card-container-approval=${callback.notification_data.doc_id}]`);
            moving_card("#approval_card_list_container",select_card);
        }
    }
    task_approval_tab_set_counts()
}

function modify_card(card_data){
    const wDcard = card_data[0]
    const modify_make = makeTaskCard(wDcard,'pending');
    const find_tag = $(`.card_template_main[data-card-container-pending=${wDcard.token}]`);
    console.log(find_tag)
    if(find_tag){
        find_tag[0].outerHTML = modify_make;
        task_pending_tab_status_ls = task_pending_tab_status_ls.map((rep)=>{
            if(rep.token == wDcard.token){
                return wDcard
            }else{
                return rep
            }
        })
        task_pending_tab_set_counts()
    }
    console.log(find_tag)
}




/* -------------------------- // task ui end functions -------------------------- */


function moving_card(appendId,id) { 
    var $container = $(appendId),$scrollTo = $(id);
    $container.animate({
        scrollTop: $scrollTo.offset().top - $container.offset().top + $container.scrollTop()
    })
    $(id).addClass("bg-secondary")
    setTimeout(()=>{
    $(id).removeClass("bg-secondary")
    },5000)
 }



/* ----------------------------- filter function ---------------------------- */

function pending_filter_tag(e){
    const filter_by = {status:$(e).val(),user:logUserDatas.emp_name};
    pending_main_filter(filter_by,false)
}

function pending_main_filter(filter_by,callback){
    fetch_loader_show("#pending_card_list_container")
    pendingTab(filter_by).then((pending_filter_return)=>{
        $("#pending_card_list_container").empty()
        if(pending_filter_return.status == false){
            makePendingCard([],false,false)
        }else{
            makePendingCard(pending_filter_return.data,callback,true)
        }
        console.log(pending_filter_return);
        
    })
}


function view_filter_tag(){
    const status = $('#task_view_status_sort').val()
    const start_date = $('#task_view_start_date').val()
    const last_date = $('#task_view_end_date').val();
    if(start_date == "") return alertify.alert("Message!","Please Select From Date...");
    if(last_date == "") return alertify.alert("Message!","Please Select To Date....");
    const view_filter_obj = {start_date,last_date,status,user:logUserDatas.emp_name}
    
    fetch_loader_show("#view_card_list_container")
    viewTask(view_filter_obj).then((view_pre)=>{
        console.log(view_pre)
        $("#view_card_list_container").empty()
        if(view_pre.status == true){
            const fiterEs = view_pre.data.filter((deS)=>{return deS.card_status != "Scheduling"})
            makeViewCard(fiterEs)
        }else{
            makeViewCard([])
        }
    })

}


function manage_filter_tag(){
    const status =  $("#task_manage_status_sort").val()
    const name =  $("#task_manage_name_sort").val()
    const start_date = $("#manage_filter_start_date").val()
    const last_date = $("#manage_filter_end_date").val()
    if (!start_date) return alertify.alert("Message!", "Please  select start date...");
    if (!last_date) return alertify.alert("Message!", "Please selcet end date.....");
    let all_sub = logUserDatas.allsubordinates.as;
    const manage_tab_filter = { status, name, start_date, last_date, sub_users: all_sub }
    fetch_loader_show("#manage_card_list_container")
    manageTask(manage_tab_filter).then((manage_f)=>{
        $("#manage_card_list_container").empty()
        if(manage_f.status == false){
          makeManageCard([])
        }else{
            const fileD = manage_f.data.filter((manageRew)=>{return manageRew.card_status != "Scheduling"})
            makeManageCard(fileD)
        }
        console.log(manage_f,"manag")
    })
}







function managing_filter_tag() {
    const fill_name = $("#task_managing_name_sort").val()
    const fill_status = $("#task_managing_status_sort").val();
    let sub_ar = logUserDatas.subordinates_details.ad;
    if (sub_ar.length != 0) {
        sub_ar = sub_ar.map((sub) => { return sub.subname })
    }
    const managing_tab_filter = { fill_name,fill_status, sub_users: sub_ar };
    managing_main_filter(managing_tab_filter,false)
  }


 function managing_main_filter(managing_tab_filter,callback){
    fetch_loader_show("#managing_card_list_container")
    managingTab(managing_tab_filter).then((managingD)=>{
        $("#managing_card_list_container").empty()
        if(managingD.status == false){
            makeManagingCard([],false);
        }else{
            const managingEE = managingD.data.filter((manag)=>{return manag.card_status != "Awaiting Approval"});
            makeManagingCard(managingEE,callback);
        }
        console.log(managingD,'sdfa')
    })
 }





  function approval_filter_tag(e){
    const name = $(e).val();
    let sub_ar = logUserDatas.subordinates_details.ad;
    if (sub_ar.length != 0) {
        sub_ar = sub_ar.map((sub) => { return sub.subname })
    }

   const approval_tab_filter = { user: name, user_name: logUserDatas.emp_name, sub_name: sub_ar };
   approval_main_filter(approval_tab_filter,"",true)
  }

function approval_main_filter(approval_tab_filter,callback){
    fetch_loader_show("#approval_card_list_container")
    approveTab(approval_tab_filter).then((approvalD)=>{
        $("#approval_card_list_container").empty()
        if(approvalD.status == false){
          makeApprovalCard([],false,false)
        }else{
            makeApprovalCard(approvalD.data,callback,true)
        }
        console.log(approvalD)
    })
}


  function preloader_filter_tag(e){
    const valuE = $(e).val();
    const fE = {user:logUserDatas.emp_name,type:valuE};
   fetch_loader_show("#preloader_card_list_container")

    preloaderTab(fE).then((preladerD)=>{
        $("#preloader_card_list_container").empty()
        if(preladerD.status == false){
            makePreloaderCard([])
        }else{
            makePreloaderCard(preladerD.data,true)
        }
    })
  }


















  /* ----------------------------- CHAT FUNCTIONS ----------------------------- */
  
  /* -------------------- chat UI box append fun start here ------------------- */
function chatUI(chatData, appendType) {
    if (chatData.length == 0) {
        $(".no_chat_text").html("<h6>No Record</h6>")
    } else {
        var messageUI = ""
        chatData.forEach((chatArData) => {
            if (chatArData.chat_send_by == logUserDatas.emp_name) {
                messageUI += `<div class="message_container  mb-3 mLeft extra_task_add_ani">
             <div class="text-end message_sub_text" >You</div>
              <div class="chat_content_text">${
                    chatArData.chat_message
                }</div>
              <div class="d-flex message_sub_text justify-content-end">
                  <div class="chat_footer_text  text-end mb-2 align-items-center">${
                    chatArData.chat_date
                }</div>
                  <div class="messageDD ml-1"><i class="icon-copy ion-android-done-all chat_${
                    chatArData.chat_status.toLowerCase()
                }"></i></div>
              </div>
            </div>`;
            } else {
                messageUI += `<div class="message_container  mb-3  extra_task_add_ani">
             <div class=" message_sub_text" >${
                    chatArData.chat_send_by
                }</div>
              <div class="chat_content_text">${
                    chatArData.chat_message
                }</div>
              <div class="d-flex message_sub_text">
                  <div class="chat_footer_text">${
                    chatArData.chat_date
                }</div>
              </div>
            </div>`;
            }


        });

        if ($('.no_chat_template')) 
            $(".no_chat_template").remove();
        

        $(".chat_append").append(messageUI)
        const scrollEl = $(".chat_append").parent()
        $(scrollEl).stop().animate({
            scrollTop: $(scrollEl)[0].scrollHeight
        }, 1);
    }

}
/* -------------------- chat UI box append fun end here ------------------- */









/* --------------------- add chat common fun start here --------------------- */
function addChat() { // const message = $(".chatValue").val();
    var userInput = $('.chatValue');
    var message = userInput.html().replace(/\<div\>|\<br.*?\>/ig, '\n').replace(/\<\/div\>/g, '').trim().replace(/\n/g, '<br>');
    if (!message.trim())
        return alertify.alert("Message!", "Plesae enter your message.....");
    $(".chat_spinner").fadeIn()
    const chatDate = new Date().toISOString();
    const backend_chat = { user: logUserDatas.emp_name, taskOwner: chat_button_token.user, message, chatDate, token: chat_button_token.token, status: "Unread" }
    taskChat(backend_chat).then((chat_cc) => {
        if (chat_cc.status == true) {
            chatUI([chat_cc.data])
            const sub_notify_value = {
                tabs: "auto",
                software: "TASK",
                action: "Chat",
                message: 'Task has been chat  by ' + logUserDatas.emp_name,
                click: "Click",
                receiver: logUserDatas.emp_name == chat_button_token.user ? logUserDatas.manager : chat_button_token.user
            }
            const sub_notify_value_1 = {
                token: chat_button_token.token,
                user_name: chat_button_token.user
            }
            addNotify_func(sub_notify_value_1, sub_notify_value)

            $(".chat_spinner").fadeOut()
        } else {
            alertify.alert("Message!", "Try again...!")
        }
    })

    userInput.html("")
}
/* --------------------- add chat common fun start here --------------------- */


/* ------------------ add chat by enter key fun start here ------------------ */
function enterChatKey(e) {
    if ((e.metaKey || e.ctrlKey) && e.keyCode == 13) {
        addChat()

    }
}
/* ------------------ add chat by enter key fun end here ------------------ */


// chat code end





var chat_button_token ={}

  function chat_menu_button(e){
    const cardToken = $(e).attr('data-chat-token');
    const card_owner = $(e).attr("data-owner");
    const user = logUserDatas.emp_name;
    const chat_ob = {token:cardToken,user:card_owner,currentuser:user};
    chat_button_token = chat_ob;
    $("#chat_task_modal").modal('show'); 
    $(".chat_append").html(loacalTemplate_chatLoader);
    $(e).children(".red_dt_cls").addClass('d-none');

    getChats(chat_ob).then((chatFindData)=>{
           if(chatFindData.status == false){
            chatUI([])
           }else{
            chatUI(chatFindData.data)
            read_update_notification(cardToken)
            makechatread(chat_ob)
           }
        console.log(chatFindData)
    })
    // showLoader()
   console.log(cardToken)
  }

// TASK FUNCTIONS END HERE















