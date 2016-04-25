uid = "";
methods = {};
function init_admin() {
    get_methods_admin();
}

function init() {
    get_methods();
}

function navClick(link) {
    reset();
    refresh_transports(link);
    $(link).addClass('active');
    $('#' + link.id.split('_li')[0]).show();
}

function refresh_transports(link){
    if(methods[link.id.split('_method_li')[0]]){
        '#transport_preference'
        if(methods[link.id.split('_method_li')[0]].sms || methods[link.id.split('_method_li')[0]].mail){
                $('#transport_preference').show();
                if(methods[link.id.split('_method_li')[0]].sms)$('#sms_transport').show();
                else $('#sms_transport').hide();
                if(methods[link.id.split('_method_li')[0]].mail)$('#mail_transport').show();
                else $('#mail_transport').hide();
        }else $('#transport_preference').hide();
    }
}

function reset() {
    resetLis();
    resetMethods();
    $('#userinfo').hide();
}

function resetLis() {
    $('li').removeClass('active');
}

function resetMethods() {
    $('.content-unit').hide();
}


function request(opts, callback, next) {
    var req = new XMLHttpRequest();
    req.open(opts.method, opts.url, true);
    req.onerror = function(e) { console.log(e) };
    req.onreadystatechange = function(aEvt) {
        if (req.readyState == 4) {
            if (req.status == 200) {
                var responseObject = JSON.parse(req.responseText);
                if (typeof(callback) === "function") callback(responseObject);
            }
            if (typeof(next) === "function") next();
        }
    };
    req.send(null);
}



function get_methods() {
    request({ method: 'GET', url: '/api/methods' }, function(response) {
        if (response.code == "Ok") {
            methods = response.methods;
            $('.method').each(function() {
                if (!response.methods[this.id.split('_method')[0]] || !response.methods[this.id.split('_method')[0]].activate) {
                    this.remove();
                    $('#' + this.id + '_li').remove();
                }
            });
        } else {
            $('.method').each(function() {
                this.remove();
                $('#' + this.id + '_li').remove();
            });
            console.log(response.message);
        }
    }, get_user_infos);
}


function get_methods_admin() {
    request({ method: 'GET', url: '/api/methods' }, function(response) {
        if (response.code == "Ok") {
            $('.method').each(function() {
                var method = this.id.split('_method')[0];
                if (!response.methods[method]) {
                    this.remove();
                    $('#' + this.id.split('_method')[0] + '_admin').remove();
                    $('#' + this.id.split('_method')[0] + '_manager').remove();
                } else {
                    if (response.methods[method].activate) {
                        check_method(method);
                    } else {
                        uncheck_method(method);
                    }
                    if (response.methods[method].sms) {
                        check_method_transport(method, 'sms');
                    } else {
                        uncheck_method_transport(method, 'sms');
                    }
                    if (response.methods[method].mail) {
                        check_method_transport(method, 'mail');
                    } else {
                        uncheck_method_transport(method, 'mail');
                    }
                    $('#' + this.id).show();
                }
            });
        } else {
            $('.method').each(function() {
                this.remove();
                $('#' + this.id + '_li').remove();
            });
            console.log(response.message);
        }
    });
}


function get_user_infos() {
    request({ method: 'GET', url: '/api/user' }, function(response) {
        if (response.code == "Ok") {
            for (method in response.user.methods) {
                if (response.user.methods[method]) {
                    check_method(method);
                } else {
                    uncheck_method(method);
                }
            }
            $('#sms_label').text(response.user.transports.sms);
            $('#mail_label').text(response.user.transports.mail);
        } else {
            console.log(response.message);
        }
    }, get_qrCode);
}


function get_user() {
    if (document.getElementById('userInput').value != '') {
        remove_user_infos();
        uid = document.getElementById('userInput').value;
        request({ method: 'GET', url: '/api/admin/user/' + uid }, function(response) {
            if (response.code == "Ok") {
                show_user(response.user);
                $('#userInfo').show();
            } else {
                console.log(response.message);
                uid = "";
                $('#userInfo').hide();
            }
        });
    }
}

function show_user(user) {
    show_totp_infos(user.totp);
    show_random_code_infos(user.random_code);
    show_bypass_infos(user.bypass);
}

function show_totp_infos(data) {
    if (data.active) {
    admin_check_method("totp");
    manager_check_method("totp");
    }else {
        admin_uncheck_method("totp");
        manager_uncheck_method("totp");
    }
}

function show_random_code_infos(data) {
    if (data.active) {
        admin_check_method("random_code");
        manager_check_method("random_code");
    }else {
        admin_uncheck_method("random_code");
        manager_uncheck_method("random_code");
    }
}

function show_bypass_infos(data) {
    if (data.active) {
        admin_check_method("bypass");
        manager_check_method("bypass");
        $("#available_code").html("Code restants : " + JSON.stringify(data.available_code));
        $("#used_code").html("Code utilisés : " + JSON.stringify(data.used_code));
    }else {
        admin_uncheck_method("bypass");
        manager_uncheck_method("bypass");
    }
}

function remove_user_infos() {
    remove_bypass_infos();
    remove_totp_infos();
    remove_random_code_infos();
}

function remove_totp_infos() {
    $('#totp_qrCode').empty()
    $('#totp_secret').empty();
}

function remove_bypass_infos() {
    $("#available_code").empty('');
    $("#used_code").empty('');   
    $("#bypass_codes").empty('');   
}

function remove_random_code_infos() {
    
}


function get_qrCode() {
    request({ method: 'GET', url: '/api/secret/totp' }, function(response) {
        if (response.code == "Ok") {
            $('#qrCode').html(response.qrCode);
            $('#secret').html(response.message);
        } else {
            console.log(response.message);
        }
    });
}

function activate_method_admin(element) {
    request({ method: 'PUT', url: '/api/admin/' + element.id.split('_activate')[0] + '/activate' }, function(response) {
        if (response.code == "Ok") {
            check_method(element.id.split('_activate')[0]);
        } else {
            console.log(response.message);
        }
    });
}


function deactivate_method_admin(element) {
    request({ method: 'PUT', url: '/api/admin/' + element.id.split('_deactivate')[0] + '/deactivate' }, function(response) {
        if (response.code == "Ok") {
            uncheck_method(element.id.split('_deactivate')[0]);
        } else {
            console.log(response.message);
        }
    });
}

function activate_method_user_admin(element) {
    request({ method: 'PUT', url: '/api/admin/' + uid +'/'+ element.id.split('_activate')[0].split('admin_')[1] + '/activate' }, function(response) {
        if (response.code == "Ok") {
            get_user();
        } else {
            console.log(response.message);
        }
    });
}

function deactivate_method_user_admin(element) {
    request({ method: 'PUT', url: '/api/admin/' + uid +'/'+ element.id.split('_deactivate')[0].split('admin_')[1]+ '/deactivate' }, function(response) {
        if (response.code == "Ok") {
            get_user();
        } else {
            console.log(response.message);
        }
    });
}

function deactivate_method_user_manager(element) {
    request({ method: 'PUT', url: '/api/admin/' + uid +'/'+ element.id.split('_deactivate')[0].split('manager_')[1]+ '/deactivate' }, function(response) {
        if (response.code == "Ok") {
            get_user();
        } else {
            console.log(response.message);
        }
    });
}

function activate_method_user_manager(element) {
    request({ method: 'PUT', url: '/api/admin/' + uid +'/'+ element.id.split('_activate')[0].split('manager_')[1] + '/activate' }, function(response) {
        if (response.code == "Ok") {
            get_user();
        } else {
            console.log(response.message);
        }
    });
}

function activate_method_transport(element) {
    request({ method: 'PUT', url: '/api/admin/' + element.id.split('_activate')[0] + '/transport/' + element.id.split('_activate_')[1].split('_transport')[0] + '/activate' }, function(response) {
        if (response.code == "Ok") {
            check_method_transport(element.id.split('_activate')[0], element.id.split('_activate_')[1].split('_transport')[0]);
        } else {
            console.log(response.message);
        }
    });
}


function deactivate_method_transport(element) {
    request({ method: 'PUT', url: '/api/admin/' + element.id.split('_deactivate')[0] + '/transport/' + element.id.split('_deactivate_')[1].split('_transport')[0] + '/deactivate' }, function(response) {
        if (response.code == "Ok") {
            uncheck_method_transport(element.id.split('_deactivate')[0], element.id.split('_deactivate_')[1].split('_transport')[0]);
        } else {
            console.log(response.message);
        }
    });
}


function activate_method(element) {
    request({ method: 'PUT', url: '/api/' + element.id.split('_activate')[0] + '/activate' }, function(response) {
        if (response.code == "Ok") {
            check_method(element.id.split('_activate')[0]);
        } else {
            console.log(response.message);
        }
    });
}


function deactivate_method(element) {
    request({ method: 'PUT', url: '/api/' + element.id.split('_deactivate')[0] + '/deactivate' }, function(response) {
        if (response.code == "Ok") {
            uncheck_method(element.id.split('_deactivate')[0]);
        } else {
            console.log(response.message);
        }
    });
}

function change_transport(transport) {
    var new_transport = document.getElementById(transport + '_input').value;
    var reg;
    if (transport == 'sms') reg = new RegExp("^0[6-7]([-. ]?[0-9]{2}){4}$");
    else reg = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (reg.test(new_transport)) {
        request({ method: 'PUT', url: '/api/transport/' + transport + '/' + new_transport }, function(response) {
            if (response.code == "Ok") {
                $('#change_' + transport + '_form').hide();
                $('#modify_' + transport + '_btn').show();
            } else {
                console.log(response.message);
            }
        }, get_transports);
    }
}

function generate_bypass() {
    request({ method: 'POST', url: '/api/generate/bypass'}, function(response) {
        if (response.code == "Ok") {
            var codes = JSON.stringify(response.codes);
            codes = codes.replace('["', '<ul><li>');
            codes = codes.replace(/","/g, '</li><li>');
            codes = codes.replace('"]', '</li></ul>');
            $("#bypass_codes").html("Codes : " + codes);
            $("#bypass_codes").show();
        } else {
            $("#bypass_codes").hide();
            console.log(response.message);
        }
    });
}

function admin_generate_bypass() {
    request({ method: 'POST', url: '/api/admin/generate/bypass/' + uid }, function(response) {
        if (response.code == "Ok") {
            var codes = JSON.stringify(response.codes);
            codes = codes.replace('["', '<ul><li>');
            codes = codes.replace(/","/g, '</li><li>');
            codes = codes.replace('"]', '</li></ul>');
            $("#bypass_codes").html("Codes : " + codes);
        } else {
            console.log(response.message);
        }
    });
}

function admin_delete_bypass_codes() {
    request({ method: 'DELETE', url: '/api/admin/delete_method_secret/bypass/' + uid }, function(response) {
        if (response.code == "Ok") {
            get_user();
            console.log(response.message);
        } else {
            console.log(response.message);
        }
    });
}

function admin_delete_totp_secret() {
    request({ method: 'DELETE', url: '/api/admin/delete_method_secret/totp/' + uid }, function(response) {
        if (response.code == "Ok") {
            get_user();
            console.log(response.message);
        } else {
            console.log(response.message);
        }
    });
}

function generate_totp() {
    request({ method: 'POST', url: '/api/generate/totp' }, function(response) {
        if (response.code == "Ok") {
            $('#qrCode').empty();
            $('#secret').empty();
            $('#qrCode').append(response.qrCode);
            $('#secret').append(response.message);
            $('#qrCode').show();
            $('#secret').show();
        } else {
            console.log(response.message);
        }
    });
}

function admin_generate_totp() {
    request({ method: 'POST', url: '/api/admin/generate/totp/' + uid }, function(response) {
        if (response.code == "Ok") {
            $('#totp_qrCode').empty();
            $('#totp_secret').empty();
            $('#totp_qrCode').append(response.qrCode);
            $('#totp_secret').append(response.message);
        } else {
            console.log(response.message);
        }
    });
}

function check_method(method) {
    $("#" + method + "_activate").addClass("glyphicon-check");
    $("#" + method + "_activate").removeClass("glyphicon-unchecked");
    $("#" + method + "_deactivate").addClass("glyphicon-unchecked");
    $("#" + method + "_deactivate").removeClass("glyphicon-check");
}

function uncheck_method(method) {
    $("#" + method + "_activate").addClass("glyphicon-unchecked");
    $("#" + method + "_activate").removeClass("glyphicon-check");
    $("#" + method + "_deactivate").addClass("glyphicon-check");
    $("#" + method + "_deactivate").removeClass("glyphicon-unchecked");
}

function check_method_transport(method, transport) {
    $("#" + method + "_activate_" + transport + '_transport').addClass("glyphicon-check");
    $("#" + method + "_activate_" + transport + '_transport').removeClass("glyphicon-unchecked");
    $("#" + method + "_deactivate_" + transport + '_transport').addClass("glyphicon-unchecked");
    $("#" + method + "_deactivate_" + transport + '_transport').removeClass("glyphicon-check");
}

function uncheck_method_transport(method, transport) {
    $("#" + method + "_activate_" + transport + '_transport').addClass("glyphicon-unchecked");
    $("#" + method + "_activate_" + transport + '_transport').removeClass("glyphicon-check");
    $("#" + method + "_deactivate_" + transport + '_transport').addClass("glyphicon-check");
    $("#" + method + "_deactivate_" + transport + '_transport').removeClass("glyphicon-unchecked");
}

function admin_check_method(method) {
    $("#admin_" + method + "_activate").addClass("glyphicon-check");
    $("#admin_" + method + "_activate").removeClass("glyphicon-unchecked");
    $("#admin_" + method + "_deactivate").addClass("glyphicon-unchecked");
    $("#admin_" + method + "_deactivate").removeClass("glyphicon-check");
}

function admin_uncheck_method(method) {
    $("#admin_" + method + "_activate").addClass("glyphicon-unchecked");
    $("#admin_" + method + "_activate").removeClass("glyphicon-check");
    $("#admin_" + method + "_deactivate").addClass("glyphicon-check");
    $("#admin_" + method + "_deactivate").removeClass("glyphicon-unchecked");
}

function manager_check_method(method) {
    $("#manager_" + method + "_activate").addClass("glyphicon-check");
    $("#manager_" + method + "_activate").removeClass("glyphicon-unchecked");
    $("#manager_" + method + "_deactivate").addClass("glyphicon-unchecked");
    $("#manager_" + method + "_deactivate").removeClass("glyphicon-check");
}

function manager_uncheck_method(method) {
    $("#manager_" + method + "_activate").addClass("glyphicon-unchecked");
    $("#manager_" + method + "_activate").removeClass("glyphicon-check");
    $("#manager_" + method + "_deactivate").addClass("glyphicon-check");
    $("#manager_" + method + "_deactivate").removeClass("glyphicon-unchecked");
}