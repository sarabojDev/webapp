
// connnecting my CDN code from firebase
const webapp = firebase.initializeApp({
    apiKey: "AIzaSyBjMC7WjwjXPAzV52rF5UzTU5B-9Xi5YVM",
    authDomain: "taskproject-57c82.firebaseapp.com",
    projectId: "taskproject-57c82",
    storageBucket: "taskproject-57c82.appspot.com",
    messagingSenderId: "906033466917",
    appId: "1:906033466917:web:7a83d92274d1b03fd779cc"
});

// firestore servise
var db = firebase.firestore();

var onsnap_store_obj = {};

/* -------------------------------------------------------------------------- */
/*                             FRONT PAGE FIREBASE START                            */
/* -------------------------------------------------------------------------- */
async function dashBoardTask(user) {
    const taskCollection = await db.collection("sotfwares").doc("task_database").collection(user).get();
    if (taskCollection.size == 0) {
        return { status: false }
    } else {
        let taskList = taskCollection.docs.map((d) => { return { ...d.data(), token: d.id } });
        const dashObj = { pending: [], scheduling: [], completed: [], ['awaiting_approval']: [] }
        taskList.filter((status_par) => {
            if (status_par.card_status == "Pending" || status_par.card_status == "Completed" || status_par.card_status == "Scheduling" || status_par.card_status == 'Awaiting Approval') {
                const ss = status_par.card_status.toString().replaceAll(" ", "_")
                dashObj[ss.toLowerCase()].push(status_par)
            }
        })
        return { status: true, data: dashObj };
    }
}


function getUserLog(token) {
    return new Promise(async (res, rej) => {
        var code = await db.collection("employee_database").doc("employee_list").collection("Namelist")
            .where('mail_id', "==", token).get();
        console.log(code)
        if (code.size == 0) {
            res({ status: false })
        } else {
            res({ status: true, data: code.docs })
        }
    })

}





async function notificationalert(n) {
    console.log(n)
    var message = n.message
    var clickType = n.click
    var tab = n.tab
    const add_obj = {
        software_name: n.software,
        doc_id: n.token,
        notification_received_by: n.receiver,
        notification_status: "Unread",
        notification_info: message,
        icon: n.action,
        notification_send_by: n.sender,
        moveto_tab: tab,
        notification_type: clickType,
        receive_date: new Date()
    }
    const credential = await db.collection("sotfwares").doc("notification_list").collection(n.receiver).add(add_obj)
    // console.log(credential)
}


async function notificationlive(user) {
    return notify = await db.collection('sotfwares').doc("notification_list").collection(user).where("notification_status", "==", "Unread")
        .onSnapshot((snap) => {
            console.log(snap)
            if (snap.size == 0) {
                notification_empty()
            } else {
                const change = snap.docChanges();
                change.filter((noti) => {
                    console.log(noti)
                    if (noti.type == "added") {
                        console.log(noti.doc.data(), "dfsdfs")
                        const no_data = { ...noti.doc.data(), token: noti.doc.id };
                        append_notification(no_data)
                    } else if (noti.type == 'modified') {
                        console.log("notify")
                        notification_readed(noti.doc.data().doc_id)
                    }else if(noti.type == 'removed'){
                        console.log('removed')
                        notification_readed(noti.doc.data().doc_id)
                    }
                })
            }
        })
}






async function readNotification(user, token) {
    console.log("reading notificaion")
    const credential = await db.collection("sotfwares").doc("notification_list").collection(user).where("doc_id", "==", token).where("notification_status", "==", "Unread").get();
    const doc = await credential.docs;
    doc.filter(async (d) => {
        d.ref.update({ notification_status: "Read"})
    })
}

/* -------------------------------------------------------------------------- */
/*                               FRONT PAGE FIREBASE END                               */
/* -------------------------------------------------------------------------- */





/* -------------------------------------------------------------------------- */
/*                          TASK PAGE FIREBASE START                          */
/* -------------------------------------------------------------------------- */




// add task function
async function addtask(n, s) {
    var now = new Date();
    var newtask, nTask;
    for (var i = 0; i < n.length; i++) {
        var td = n[i][1]
        var taskList = await db.collection('sotfwares').doc("task_database").collection(s.user).add({
            task_description: n[i][0],
            scheduled_On: new Date(td),
            user_name: s.user,
            card_status: "Pending",
            card_type: "Self",
            badge: "New",
            assigned_by: "",
            created_on: now,
            extended_on: ["empty"],
            completed_on: ["empty"],
            no_of_days: 0,
            approved_on: ["empty"],
            rejecte_On: ["empty"],
            folder_details: ["empty"],
            file_details: ["empty"],
            manager: s.manager

        })
        newtask = await taskList.get()
        console.log(newtask)
        nTask = { ...newtask.data(), token: newtask.id };
        console.log(nTask)
        const sub_notify_value = {
            tabs: "auto",
            software: "TASK",
            action: "Add Task",
            message: 'Task has been add task by ' + logUserDatas.emp_name,
            click: "Click",
            receiver: ""
        }
        addNotify_func(nTask, sub_notify_value)
    }

    if (newtask.exists == true) {
        console.log("New Task Added Successfully")
        return { status: true, message: "New Task Added Successfully", data: { ...nTask, token: newtask.id } }
    } else {
        console.log("Try Again")
        return { status: false, message: "Try Again" }
    }

}



//assing task
async function assignNewTask(taskInfo, selectName, user) {
    var assignList = await db.collection('sotfwares').doc("task_database").collection(selectName).add({
        task_description: taskInfo,
        scheduled_On: ["empty"],
        user_name: selectName,
        card_status: "Scheduling",
        card_type: "Assign",
        badge: "New",
        assigned_by: user,
        created_on: new Date(),
        extended_on: ["empty"],
        completed_on: ["empty"],
        no_of_days: 0,
        approved_on: ["empty"],
        rejecte_On: ["empty"],
        folder_details: ["empty"],
        file_details: ["empty"],
        manager: user

    })
    var asgtask = await assignList.get();
    console.log(asgtask)
    var asgData = asgtask.data();
    console.log(asgData)
    if (asgtask.id !== "") {
        console.log("Task Assigned Successfully")
        return { status: true, message: "Task Assigned Successfully", data: { ...asgData, token: asgtask.id } }
    } else {
        console.log("Try Again")
        return { status: false, message: "Try Again" }
    }

}



//PRELOADER TASK
async function addPreLoad(pre) {
    console.log(pre)
    var preLoad
    var preoption = pre.type;

    if (preoption == "Daily") {
        preLoad = await db.collection('sotfwares').doc("preloader_database").collection(pre.user).add({
            preTpye: pre.type,
            preInfo: pre.info,
            preStatus: "Pending",
            user: pre.user
        })
    } else if (preoption == "Weekly") {
        preLoad = await db.collection('sotfwares').doc("preloader_database").collection(pre.user).add({
            preTpye: pre.type,
            preInfo: pre.info,
            preDay: pre.weeklyDay,
            preStatus: "Pending",
            user: pre.user
        })
    } else if (preoption == "Monthly") {
        preLoad = await db.collection('sotfwares').doc("preloader_database").collection(pre.user).add({
            preTpye: pre.type,
            preInfo: pre.info,
            preDate: pre.date,
            preMonth: pre.month,
            preStatus: "Pending",
            user: pre.user
        })
    } else if (preoption == "Yearly") {
        preLoad = await db.collection('sotfwares').doc("preloader_database").collection(pre.user).add({
            preTpye: pre.type,
            preInfo: pre.info,
            preyear: pre.yeardate,
            preStatus: "Pending",
            user: pre.user
        })
    }
    var preGetData = await preLoad.get();
    const preL = {...preGetData.data(),token:preGetData.id}
        console.log(preL,'pre')
    if (preGetData.exists == true) {
        console.log("New PreLoader Added Successfully")
        return { status: true, message: "New PreLoader Added Successfully", data: preL }
    } else {
        console.log("Try Again")
        return { status: false, message: "Try Again" }
    }

}



/* ----------------------- ONSNAP FUNCTIONS START HERE ---------------------- */
   

async function task_snap_funtions(user) {
        const task_user = await db.collection('sotfwares').doc("task_database").collection(user);
        const task_check_data = await task_user.get();
        if(task_check_data.size == 0){
     
        }else{
                onsnap_store_obj.pending_snap = task_user.onSnapshot((snap)=>{
                    const change_task = snap.docChanges();
                    const d =  change_task.map((task_data)=>{
                        const store_task = task_data;
                        console.log('yep',store_task)
                          const make_details = {...store_task.doc.data(),token:store_task.doc.id}
                          return {s:store_task.type,data:make_details}
                    });
                    const added_data = d.every((td)=>{return td.s == 'added'});
                    const modify_data = d.every((td)=>{return td.s == 'modified'});
                    const remove_data = d.every((td)=>{return td.s == 'removed'});
                    console.log(remove_data,added_data,modify_data,'ddd')
                    if(added_data){
                      const card_values = d.map((cE)=>{return cE.data})
                      const filter_value =  card_values.filter((ce)=>{return ce.card_status != "Completed"})
                      makePendingCard(filter_value,"",false);
                    }else if(modify_data){
                        const card_values = d.map((cE)=>{return cE.data})
                        modify_card(card_values)
                    }else if(remove_data){
                        console.log(d,'sdr')
                        d.filter((cE)=>{
                            const dD = cE.data;
                            console.log(dD)
                            deleted_task_all(dD) 
                        })
                    }
                    
                })    
        }
    
    }
   



    async function taskPreloader(user) {
        return new Promise(async(res,rej)=>{
          const preload =    await db.collection('sotfwares').doc("preloader_database").collection(user).get();
          if(preload.size == 0){
            res({status:false})
          }else{
            const preloder_ar = preload.docs.map((preX)=>{
                const preT= {...preX.data(),token:preX.id}
                return preT;
            })
            res({status:true,data:preloder_ar})
          }
        })
     }

/* ----------------------- ONSNAP FUNCTIONS END HERE ---------------------- */







/* --------------------- TASK FILTER FUNCIONS START HERE -------------------- */
function preloaderTab(pre){
    return new Promise(async(res,rej)=>{
        if(pre.type == "All"){
            const  preLoad = await db.collection('sotfwares').doc("preloader_database").collection(pre.user);
            const preloader_docs = await preLoad.get();
            if(preloader_docs.size == 0){
               res({status:false}) 
            }else{
                const mK_preloader = preloader_docs.docs.map((preD)=>{return {...preD.data(),token:preD.id}});
                res({status:true,data:mK_preloader})
            }
        }else{
            const  preLoad = await db.collection('sotfwares').doc("preloader_database").collection(pre.user).where("preTpye","==",pre.type);
            const preloader_docs = await preLoad.get();
            if(preloader_docs.size == 0){
               res({status:false}) 
            }else{
                const mK_preloader = preloader_docs.docs.map((preD)=>{return {...preD.data(),token:preD.id}});
                res({status:true,data:mK_preloader})
            }
        }
        
    })
}


function approvalCard(h){
    return new Promise((resMain,rejMain)=>{
        var promises = {}
             h.sub_name.map( (sub) => {
                promises[sub] = new Promise(async(res,rej)=>{
                    app_s =  await db.collection('sotfwares').doc("task_database").collection(sub).where('card_status', "==", "Awaiting Approval").get();
                    res(app_s.docs)
                })
            });
            Promise.all(Object.values(promises)).then((values) => {
                const find = values.every((f) => { return f.length == 0 });
                if (find == false) {
                    const d = [];
                    values.filter((dss) => {
                        if (dss.length != 0) {
                            dss.filter((e) => {
                                d.push({ ...e.data(), token: e.id })
                            })
                        }
                    })
                    resMain({ status: true, data: d })
                } else {
                    resMain({ status: false })
                }
            });
    })
}



// pending tab
function pendingTab(h) {

    return new Promise(async(res,rej)=>{
        if (h.status == "All") {
            const d=  await db.collection('sotfwares').doc("task_database").collection(h.user).where('card_status', "!=", "Completed").get();
            if(d.size == 0){
                res({status:false})
            }else{
                const da =  d.docs.map((f)=>{return {...f.data(),token:f.id}})
                res({status:true,data:da})
            }

        } else {
            const  d =  await db.collection('sotfwares').doc("task_database").collection(h.user).where('card_status', "==", h.status).get();
            if(d.size == 0){
                res({status:false})
            }else{
                const da =  d.docs.map((f)=>{return {...f.data(),token:f.id}})
                res({status:true,data:da})
            }
        }
    })
    
}




// approve tab
 function approveTab(h) {
    console.log(h)
    return new Promise(async(resMain,mainrej)=>{
        if (h.user == 'All') {
            var promises = {}
             h.sub_name.map( (sub) => {
                promises[sub] = new Promise(async(res,rej)=>{
                    app_s =  await db.collection('sotfwares').doc("task_database").collection(sub).where('card_status', "==", "Awaiting Approval").get();
                    res(app_s.docs)
                })
            });
            Promise.all(Object.values(promises)).then((values) => {
                const find = values.every((f) => { return f.length == 0 });
                if (find == false) {
                    const d = [];
                    values.filter((dss) => {
                        if (dss.length != 0) {
                            dss.filter((e) => {
                                d.push({ ...e.data(), token: e.id })
                            })
                        }
                    })
                    resMain({ status: true, data: d })
                } else {
                    resMain({ status: false })
                }
            });
        } else {
            var subList = await db.collection('sotfwares').doc("task_database").collection(h.user).where('card_status', "==", "Awaiting Approval").get();
            if(subList.size == 0){
            resMain({status:false})
            }else{
                const ap = subList.docs.map(ap_m =>{return {...ap_m.data(),token:ap_m.id}});
                resMain({status:true,data:ap})
            }
        }
    })
    
}



// managing'
function managingTab(managing_param) {
    console.log(managing_param)
    return new Promise(async (resMain, rejMain) => {
        if (managing_param.fill_status == "All" && managing_param.fill_name == "All") {
            console.log("sdfasd")
            const managing_sub_user = managing_param.sub_users;
            const promises = {};
            managing_sub_user.filter((sub_tasks) => {
                console.log(sub_tasks)
                promises[sub_tasks] = new Promise(async (resA, resB) => {
                    var one = await db.collection('sotfwares').doc("task_database").collection(sub_tasks).where('card_status', "!=", "Awaiting Approval").get();
                    resA(one.docs)
                })
            })
            Promise.all(Object.values(promises)).then((values) => {
                const find = values.every((f) => { return f.length == 0 });
                if (find == false) {
                    const d = [];
                    values.filter((dss) => {
                        if (dss.length != 0) {
                            dss.filter((e) => {
                                d.push({ ...e.data(), token: e.id })
                            })
                        }
                    })
                    resMain({ status: true, data: d })
                } else {
                    resMain({ status: false })
                }
            });
        } else {
            console.log("sdfasd")
            if (managing_param.fill_status != "All" && managing_param.fill_name != "All") {
                const sub_user_task = await db.collection('sotfwares').doc("task_database").collection(managing_param.fill_name).where('card_status', "==", managing_param.fill_status).get();
                if (sub_user_task.size != 0) {
                    const finD = sub_user_task.docs.map((d) => { return { ...d.data(), token: d.id } });
                    resMain({ status: true, data: finD })
                } else {
                    resMain({ status: false })
                }
            } else if (managing_param.fill_status == "All") {
                const sub_user_task = await db.collection('sotfwares').doc("task_database").collection(managing_param.fill_name).where('card_status', "!=", "Awaiting Approval").get();
                if (sub_user_task.size != 0) {
                    const finD = sub_user_task.docs.map((d) => { return { ...d.data(), token: d.id } });
                    resMain({ status: true, data: finD })
                } else {
                    resMain({ status: false })
                }
            } else if (managing_param.fill_name == "All") { 
                const managing_sub_user = managing_param.sub_users;
                const promises = {};
                managing_sub_user.filter((sub_tasks) => {
                    promises[sub_tasks] = new Promise(async (resA, resB) => {
                        var one = await db.collection('sotfwares').doc("task_database").collection(sub_tasks).where('card_status', "==", managing_param.fill_status).get();
                        resA(one.docs)
                    })
                })
                Promise.all(Object.values(promises)).then((values) => {
                    const find = values.every((f) => { return f.length == 0 });
                    if (find == false) {
                        const d = [];
                        values.filter((dss) => {
                            if (dss.length != 0) {
                                dss.filter((e) => {
                                    d.push({ ...e.data(), token: e.id })
                                })
                            }
                        })
                        resMain({ status: true, data: d })
                    } else {
                        resMain({ status: false })
                    }
                });
            }
        }


    })


}




function viewTask(v) {
    console.log(v)
    return new Promise(async (res, rej) => {
        if (v.status == 'All') {
            var viewList = await db.collection('sotfwares').doc("task_database").collection(v.user)
                .where("created_on", ">=", new Date(v.start_date))
                .where("created_on", "<=", new Date(v.last_date)).get();
            console.log(viewList)
            if (viewList.size == 0) {
                res({ status: false });
            } else {
                const dataD = viewList.docs.map((da) => { return { ...da.data(), token: da.id } })
                res({ status: true, data: dataD });
            }
        } else {
            var viewList = await db.collection('sotfwares').doc("task_database").collection(v.user)
                .where("created_on", ">=", new Date(v.start_date))
                .where("created_on", "<=", new Date(v.last_date)).get();
            console.log(viewList)
            if (viewList.size == 0) {
                res({ status: false })
            } else {
                const datas = viewList.docs.filter(r => { return r.data().card_status == v.status });
                if (datas.length == 0) {
                    res({ status: false })
                } else {
                    const viewD = datas.map((view_task) => { return { ...view_task.data(), token: view_task.id } });
                    res({ status: true, data: viewD })
                }

            }
        }

    })


}





// manage task  
function manageTask(manage_fill) {
  console.log(manage_fill)
    return new Promise(async (mainRes, mainRej) => {

        if (manage_fill.status == 'All' && manage_fill.name == "All") {
            var promises = {}
            manage_fill.sub_users.filter((sub_user) => {
                promises[sub_user] = new Promise(async (subRes, subRej) => {
                    const manage_arr = await db.collection('sotfwares').doc("task_database").collection(sub_user)
                        .where("created_on", ">=", new Date(manage_fill.start_date))
                        .where("created_on", "<=", new Date(manage_fill.last_date)).get();
                     subRes(manage_arr.docs)
                })
            })

            Promise.all(Object.values(promises)).then((values) => {
                const find = values.every((f) => { return f.length == 0 });
                console.log(find)
                if (find == false) {
                    const d = [];
                    values.filter((dss) => {
                        if (dss.length != 0) {
                            dss.filter((e) => {
                                d.push({ ...e.data(), token: e.id })
                            })
                        }
                    })
                    mainRes({ status: true, data: d })
                } else {
                    mainRes({ status: false })
                }
            });
        } else {
            if (manage_fill.status != "All" && manage_fill.name != "All") {
                const manage_arr = await db.collection('sotfwares').doc("task_database").collection(manage_fill.name)
                    .where("created_on", ">=", new Date(manage_fill.start_date))
                    .where("created_on", "<=", new Date(manage_fill.last_date)).get();
                    console.log(manage_arr)
                if (manage_arr.size == 0) {
                    mainRes({status:false})
                } else {
                   const filerD_manage =  manage_arr.docs.filter((m_d)=>{return m_d.data().card_status == manage_fill.status});
                   if(filerD_manage.length == 0){
                    mainRes({status:false})
                   }else{
                    const manage_data =   filerD_manage.map(manage_data => { return { ...manage_data.data(), token: manage_data.id }})
                    mainRes({status:true,data:manage_data})
                   } 
                }

            } else if (manage_fill.status == "All") {
                const manage_arr = await db.collection('sotfwares').doc("task_database").collection(manage_fill.name)
                    .where("created_on", ">=", new Date(manage_fill.start_date))
                    .where("created_on", "<=", new Date(manage_fill.last_date)).get();
                if (manage_arr.size == 0) {
                   mainRes({status:false})
                } else {
                    const manage_re = manage_arr.docs.map((man)=>{return {...man.data(),token:man.id}});
                   mainRes({status:true,data:manage_re});
                }
            } else if (manage_fill.name == 'All') {
                var promises = {}
                manage_fill.sub_users.filter((sub_user) => {
                    promises[sub_user] = new Promise(async (subRes, subRej) => {
                        const manage_arr = await db.collection('sotfwares').doc("task_database").collection(sub_user)
                            .where("created_on", ">=", new Date(manage_fill.start_date))
                            .where("created_on", "<=", new Date(manage_fill.last_date)).get();
                            subRes(manage_arr.docs)
                    })
                })
    
                Promise.all(Object.values(promises)).then((values) => {
                    console.log(values,'asdfsf')
                    const find = values.every((f) => { return f.length == 0 });
                    if (find == false) {
                        console.log(find)
                        const d = [];
                        values.filter((dss) => {
                            if (dss.length != 0) {
                                dss.filter((e) => {
                                    console.log(e)
                                    if(e.data().card_status == manage_fill.status){
                                        d.push({ ...e.data(), token: e.id })
                                    }
                                })
                            }
                        })
                        console.log(d,'dsfsdf')
                        if(d.length == 0){
                            mainRes({status:false})
                         }else{
                             mainRes({ status: true, data: d })
                         }
                    } else {
                        mainRes({ status: false })
                    }
                });

            }
        }

    })


}





/* --------------------- TASK FILTER FUNCIONS END HERE -------------------- */




/* --------------------------- TASK CHAT STAR HERE -------------------------- */
/* ------------------------ CHAT FUNCITONS START HERE ------------------------ */

function getChats(chatJ) {
    return new Promise(async(res,rej)=>{
        const getTaskChat = await db.collection("sotfwares").doc("task_database").collection(chatJ.user).doc(chatJ.token).collection('Chat').orderBy("chat_date").get();
        if(getTaskChat.size == 0){
            res({status:false})
        }else{
            var chat_ar = getTaskChat.docs.map((chat) => { return chat.data() });
            console.log(chat_ar)
            //  makechatread(chatJ)
             res({status:true,data:chat_ar})
        }
    });
}





async function taskChat(f) {
    const chatList = await db.collection('sotfwares').doc("task_database").collection(f.taskOwner).doc(f.token).collection("Chat").add({
        chat_send_by: f.user,
        chat_message: f.message,
        chat_date: f.chatDate,
        chat_status: "Unread"
    })
    var chatcheck = await chatList.get()
    var chatresult = chatcheck.data()
    if (chatcheck.exists == true) {
        console.log("chat added successfully")
        return { status: true, message: "New chat added successfully", data: chatresult }
    } else {
        console.log("Try Again")
        return { status: false, message: "Try Again" }
    }
}



function getPreloaderCard(pre) {
    return new Promise(async(res,rej)=>{
         const  preLoad = await db.collection('sotfwares').doc("preloader_database").collection(pre.user).doc(pre.token).get();
         if(preLoad.exists){
          res({status:true,data:{...preLoad.data(),token:preLoad.id}})
         }else{
            res({status:false})
         }
    });
}

function updatePreloaderCard(pre,updates) {
    return new Promise(async(res,rej)=>{
        await db.collection('sotfwares').doc("preloader_database").collection(pre.user).doc(pre.token).update({
           preTpye:updates.type,
           preInfo:updates.info
        })
        if(updates.type == 'Weekly'){
            await db.collection('sotfwares').doc("preloader_database").collection(pre.user).doc(pre.token).update({
                preDay:updates.weeklyDay
             })
            
        }else if(updates.type == "Monthly") {
            await db.collection('sotfwares').doc("preloader_database").collection(pre.user).doc(pre.token).update({
                preMonth:updates.month,
                preDate:updates.date
             })
        }else if(updates.type == "Yearly"){
            await db.collection('sotfwares').doc("preloader_database").collection(pre.user).doc(pre.token).update({
                preyear:updates.yeardate
             })
        }
        const  preLoad = await db.collection('sotfwares').doc("preloader_database").collection(pre.user).doc(pre.token).get();
        res({data:{...preLoad.data(),token:preLoad.id}})
    });
}

function deletePreloaderCard(pre) {
    console.log(pre)
    return new Promise(async(res,rej)=>{
         const  preLoad = await db.collection('sotfwares').doc("preloader_database").collection(pre.user).doc(pre.token).delete();
         res({status:true})
    });
}

/* ------------------------ CHAT FUNCITONS END HERE ------------------------ */



async function makechatread(u) {

    var chatList = await db.collection("sotfwares").doc("task_database").collection(u.user).doc(u.token).collection('Chat').where("chat_status","==","Unread").get();
    chatList.forEach(async (v) => {
        var chatData = v.data();
        console.log(chatData)
        if (chatData.chat_send_by != u.currentuser) {
            v.ref.update({chat_status:"read"})
        }
    })
}

/* --------------------------- TASK CHAT END HERE -------------------------- */





/* -------------------------- TASK MODIFY FUNCTIONS ------------------------- */

 function modifyIcon(obj) {
    return new Promise(async(res,rej)=>{
        const taskCollection = await db.collection("sotfwares").doc("task_database").collection(obj.user_name).doc(obj.token).get();
        if (taskCollection.exists == false){
           res({status:fasle})
        }else{
            const value = await{...taskCollection.data(),token:taskCollection.id};
          res({status:true,data:value})
        }
        
    })
    
}


/* ----------------------- MODIFY FUNCTIONS START HERE ---------------------- */


// edit Task info
function editTaskInfo(g) {
  return new Promise(async (res,rej)=>{
    await db.collection('sotfwares').doc("task_database").collection(g.user).doc(g.token).update({
        task_description: g.editText
    });
    res({status:true});
  })
    
}



// schedule task
async function scheduleTask_backend(s) {
    var scheduletask = await db.collection('sotfwares').doc("task_database").collection(s.user).doc(s.token).update({
        scheduled_On: s.schedule_date,
        card_status: "Pending"
    })

}


// delete task
async function taskDelete(d) {
    await db.collection('sotfwares').doc("task_database").collection(d.user).doc(d.token).delete()
}




// task complete
async function completeTask(g) {
    console.log(g)
    var completed_on = [];
    if (g.comD[0] == "empty") {
        completed_on = []
    } else {
        completed_on = g.comD
    }
    var now = new Date();
    completed_on.push({ status: "Completed", date: now })
    console.log(completed_on)
    await db.collection('sotfwares').doc("task_database").collection(g.user).doc(g.token).update({
        card_status: "Completed",
        completed_on
    })
    var comptask = await db.collection('sotfwares').doc("task_database").collection(g.user).doc(g.token).get()
    console.log(comptask)
    var compresult = { ...comptask.data(), token: comptask.id }
    console.log(compresult)
    if (comptask.exists == true) {
        console.log("Task completed successfully")
        return { status: true, message: "Task completed successfully", data: compresult }
    } else {
        console.log("Try Again")
        return { status: false, message: "Try Again" }
    }
}








// restore task
async function restoreTask_backend(g) {
    const completed_on = g.comD;
    completed_on.push({ status: "Restore", date: new Date() })
    await db.collection('sotfwares').doc("task_database").collection(g.user).doc(g.token).update({
        card_status: "Pending",
        completed_on
    })
    var retask = await db.collection('sotfwares').doc("task_database").collection(g.user).doc(g.token).get()
    console.log(retask)
    var restoreresult = retask.data()
    console.log(restoreresult)

    if (retask.exists == true) {
        console.log("Task restored successfully")
        return { status: true, message: "Task restored successfully", data: restoreresult }
    } else {
        console.log("Try Again")
        return { status: false, message: "Try Again" }
    }
}



// extend task
async function extendTask_backend(h) {
    var extended_on = []
    if (h.ex_ar[0] == "empty") {
        extended_on.push({ status: "Request", date: h.ex_date })
    } else {
        extended_on = h.ex_ar
        extended_on.push({ status: "Request", date: h.ex_date })
    }
    await db.collection('sotfwares').doc("task_database").collection(h.user).doc(h.token).update({
        card_status: "Awaiting Approval",
        extended_on
    })
}



// approve task
async function approvetask(a) {
    var now = new Date();
    if (a.status == true) {
        let exAr = a.ex_on_ar[a.ex_on_ar.length - 1];
        exAr.status = "Approved"
        a.ex_on_ar[a.ex_on_ar.length - 1] = { ...exAr, approve_on: now };
        console.log(a.ex_on_ar)
        await db.collection('sotfwares').doc("task_database").collection(a.user).doc(a.token).update({
            card_status: "Approved",
            extended_on: a.ex_on_ar
        })
    } else {
        let exAr = a.ex_on_ar[a.ex_on_ar.length - 1];
        exAr.status = "Rejected"
        a.ex_on_ar[a.ex_on_ar.length - 1] = { ...exAr, rejected_on: new Date() };
        await db.collection('sotfwares').doc("task_database").collection(a.user).doc(a.token).update({
            card_status: "Pending",
            sub_status: "rejected",
            extended_on: a.ex_on_ar
        })

    }

}



function uploader(file, task) {
    console.log(file,task)
    return new Promise((res, rej) => {
        const storage = firebase.storage();
        const file_doc = Array.from(file);
        file_doc.forEach((fc) => {
            console.log(fc,"filessss")
            const d = storage.ref(`task/${task.token}/${fc.name}`);
            // const d = storage.ref("task")
            console.log(d)
            d.put(file);
            d.getDownloadURL().then((url)=>{
                console.log(url)
            })
        })
        res("Success!")
    })
 
}
 
function getUploadFile(id){
  return  new Promise((res, rej) => {
        const storage = firebase.storage();
        const d = storage.ref(`task/${id}/`);
        console.log(d)
            d.listAll().then((s) => {
                console.log(s,'sdfads')
                const sd = s.items;
                res(sd)
            })
    })
}


/* -------------------------------------------------------------------------- */
/*                           TASK PAGE FIREBASE END                           */
/* -------------------------------------------------------------------------- */