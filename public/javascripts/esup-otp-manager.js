uid = "";
methods = {};
loop = false;

var uids;

var uid_complete;

function autocomplete_uid() {
    uid_complete = new autoComplete({
        selector: '#userInput',
        minChars: 1,
        source: function(term, suggest) {
            term = term.toLowerCase();
            var choices = uids;
            var suggestions = [];
            for (i = 0; i < choices.length; i++)
                if (~choices[i].toLowerCase().indexOf(term)) suggestions.push(choices[i]);
            suggest(suggestions);
        }
    });
}

function init_admin() {
    get_methods_admin();
    get_uids();
}

function init() {
    get_methods();
}

function navClick(link) {
    loop =false;
    get_user_infos();
    reset();
    refresh_transports(link);
    $(link).addClass('active');
    $('#' + link.id.split('_li')[0]).show();
}

function refresh_transports(link) {
    if (methods[link.id.split('_method_li')[0]]) {
        '#transport_preference'
        if (methods[link.id.split('_method_li')[0]].transports.indexOf("sms") >= 0 || methods[link.id.split('_method_li')[0]].transports.indexOf("mail") >= 0) {
            $('#transport_preference').show();
            if (methods[link.id.split('_method_li')[0]].transports.indexOf("sms") >= 0) $('#sms_transport').show();
            else $('#sms_transport').hide();
            if (methods[link.id.split('_method_li')[0]].transports.indexOf("mail") >= 0) $('#mail_transport').show();
            else $('#mail_transport').hide();
        } else $('#transport_preference').hide();
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

function test_transport(transport) {
    request({ method: 'GET', url: '/api/transport/' + transport + '/test' }, function(response) {
        if (response.code == "Ok") {
            success_message(response.message);
        } else {
            console.log(response.message);
            errors_message(response.message);
        }
    });
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
                        admin_check_method(method);
                    } else {
                        admin_uncheck_method(method);
                    }
                    if (response.methods[method].transports.indexOf("sms") >= 0) {
                        check_method_transport(method, 'sms');
                    } else {
                        uncheck_method_transport(method, 'sms');
                    }
                    if (response.methods[method].transports.indexOf("mail") >= 0) {
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

function get_uids(){
    request({ method: 'GET', url: '/api/admin/users'}, function(response){
        if (response.code) {
            uids = response.uids;
            autocomplete_uid();
        }
    });
}

function get_user_infos(callback) {
    request({ method: 'GET', url: '/api/user' }, function(response) {
        if (response.code == "Ok") {
            $("#available_code").empty();
            $("#used_code").empty();
            for (method in response.user.methods) {
                if (response.user.methods[method].active) {
                    check_method(method);
                } else {
                    uncheck_method(method);
                }
            }
            if (response.user.methods.bypass){
                if (response.user.methods.bypass.active) {
                    $("#available_code").html("Code restants : " + JSON.stringify(response.user.methods.bypass.available_code));
                    $("#used_code").html("Code utilisés : " + JSON.stringify(response.user.methods.bypass.used_code));
                }
            }
            if (response.user.methods.push){
                if (response.user.methods.push.active) {
                    $("#device").html("Appareil associé : " + JSON.stringify(response.user.methods.push.device.model) + ' du constructeur ' +JSON.stringify(response.user.methods.push.device.manufacturer) +' fonctionnant sous ' +JSON.stringify(response.user.methods.push.device.platform));
                    $("#activation_code").empty();
                    loop = false;
                }else $("#device").empty();
            }
            $('#sms_label').empty();
            $('#mail_label').empty();
            $('#sms_label').text(response.user.transports.sms);
            $('#mail_label').text(response.user.transports.mail);
            if(loop)setTimeout(get_user_infos, 3000);
            if(typeof(callback)==="function")callback();
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
    show_push_infos(user.push);
}

function show_totp_infos(data) {
    if (data.active) {
        check_method("totp");
    } else {
        uncheck_method("totp");
    }
}

function show_random_code_infos(data) {
    if (data.active) {
        check_method("random_code");
    } else {
        uncheck_method("random_code");
    }
}

function show_bypass_infos(data) {
    if (data.active) {
        check_method("bypass");
        $("#available_code").html("Code restants : " + JSON.stringify(data.available_code));
        $("#used_code").html("Code utilisés : " + JSON.stringify(data.used_code));
    } else {
        uncheck_method("bypass");
    }
}

function show_push_infos(data) {
    if (data.active) {
        check_method("push");
        $("#device").html("Appareil associé : " + JSON.stringify(data.device.model) + ' du constructeur ' +JSON.stringify(data.device.manufacturer) +' fonctionnant sous ' +JSON.stringify(data.device.platform));
    } else {
        uncheck_method("push");
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
            errors_message(response.message);
            console.log(response.message);
        }
    });
}

function activate_method_admin(method) {
    request({ method: 'PUT', url: '/api/admin/' + method + '/activate' }, function(response) {
        if (response.code == "Ok") {
            admin_check_method(method);
        } else {
            console.log(response.message);
            errors_message(response.message);
        }
    });
}


function deactivate_method_admin(method) {
    request({ method: 'PUT', url: '/api/admin/' + method + '/deactivate' }, function(response) {
        if (response.code == "Ok") {
            admin_uncheck_method(method);
        } else {
            console.log(response.message);
            errors_message(response.message);
        }
    });
}

function deactivate_method_user_manager(method) {
    request({ method: 'PUT', url: '/api/admin/' + uid + '/' + method + '/deactivate' }, function(response) {
        if (response.code == "Ok") {
            get_user();
        } else {
            errors_message(response.message);
            console.log(response.message);
        }
    });
}

function activate_method_user_manager(method) {
    request({ method: 'PUT', url: '/api/admin/' + uid + '/' + method + '/activate' }, function(response) {
        if (response.code == "Ok") {
            get_user();
            switch (method) {
                case 'totp':
                    admin_generate_totp();
                    break;
                case 'bypass':
                    admin_generate_bypass();
                    break;
            }
        } else {
            errors_message(response.message);
            console.log(response.message);
        }
    });
}

function activate_method_transport(method, transport) {
    request({ method: 'PUT', url: '/api/admin/' + method + '/transport/' + transport + '/activate' }, function(response) {
        if (response.code == "Ok") {
            check_method_transport(method, transport);
        } else {
            console.log(response.message);
            errors_message(response.message);
        }
    });
}


function deactivate_method_transport(method, transport) {
    request({ method: 'PUT', url: '/api/admin/' + method + '/transport/' + transport + '/deactivate' }, function(response) {
        if (response.code == "Ok") {
            uncheck_method_transport(method, transport);
        } else {
            console.log(response.message);
            errors_message(response.message);
        }
    });
}


function activate_method(method) {
    request({ method: 'PUT', url: '/api/' + method + '/activate' }, function(response) {
        if (response.code == "Ok") {
            get_user_infos();
            switch (method) {
                case 'push':
                    loop = true;
                    $('#activation_code').html(response.message);
                    break;
                case 'totp':
                    generate_totp();
                    break;
                case 'bypass':
                    generate_bypass();
                    break;
                default: 
            }
        } else {
            console.log(response.message);
            errors_message(response.message);
        }
    });
}


function deactivate_method(method) {
    request({ method: 'PUT', url: '/api/' + method + '/deactivate' }, function(response) {
        if (response.code == "Ok") {
            get_user_infos();
            $("#bypass_codes").hide();
        } else {
            console.log(response.message);
            errors_message(response.message);
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
                errors_message(response.message);
                console.log(response.message);
            }
        }, get_user_infos);
    }
}

function delete_transport(transport) {
    request({ method: 'DELETE', url: '/api/transport/' + transport }, function(response) {
        if (response.code == "Ok") {

        } else {
            console.log(response.message);
            errors_message(response.message);
        }
    }, get_user_infos);
}


function generate_bypass() {
    request({ method: 'POST', url: '/api/generate/bypass' }, function(response) {
        if (response.code == "Ok") {
            show_bypass_codes(response);
        } else {
            $("#bypass_codes").hide();
            errors_message(response.message);
            console.log(response.message);
        }
    });
}

function show_bypass_codes(response) {
    var codes = JSON.stringify(response.codes);
    codes = codes.replace('["', '<ul><li>');
    codes = codes.replace(/","/g, '</li><li>');
    codes = codes.replace('"]', '</li></ul>');
    $("#bypass_codes").html("Codes : " + codes);
    $("#bypass_codes").show();
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
            errors_message(response.message);
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
            errors_message(response.message);
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
            errors_message(response.message);
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
            errors_message(response.message);
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
            errors_message(response.message);
            console.log(response.message);
        }
    });
}

function check_method(method) {
    $("#" + method + "_switch").addClass('On').removeClass('Off');
}

function uncheck_method(method) {
    $("#" + method + "_switch").removeClass('On').addClass('Off');
}

function check_method_transport(method, transport) {
    $("#" + method + "_switch_transport_"+transport).addClass('On').removeClass('Off');
}

function uncheck_method_transport(method, transport) {
    $("#" + method + "_switch_transport_"+transport).removeClass('On').addClass('Off');;
}

function admin_check_method(method) {
    $("#" + method + "_switch_admin").addClass('On').removeClass('Off');
}

function admin_uncheck_method(method) {
    $("#" + method + "_switch_admin").removeClass('On').addClass('Off');
}

$(document).ready(function() {
    // UserSwitch toggle
    $('.UserSwitch').click(function() {
        if($('#'+this.id).hasClass('On'))deactivate_method(this.id.split("_switch")[0]);
        else activate_method(this.id.split("_switch")[0])
    });

    $('.ManagerSwitch').click(function() {
        if($('#'+this.id).hasClass('On'))deactivate_method_user_manager(this.id.split("_switch")[0]);
        else activate_method_user_manager(this.id.split("_switch")[0])
    });

    $('.AdminSwitch').click(function() {
        if($('#'+this.id).hasClass('On'))deactivate_method_admin(this.id.split("_switch_admin")[0]);
        else activate_method_admin(this.id.split("_switch_admin")[0])
    });

    $('.TransportSwitch').click(function() {
        if($('#'+this.id).hasClass('On'))deactivate_method_transport(this.id.split("_switch_transport_")[0],this.id.split("_switch_transport_")[1]);
        else activate_method_transport(this.id.split("_switch_transport_")[0],this.id.split("_switch_transport_")[1])
    });

});

function success_message(message) {
    $('#msg2').attr('class', 'alert alert-success');
    $('#msg2').html(message);
    $('#msg2').show();
    $("#msg2").fadeTo(3500, 500).slideUp(300, function(){
        $("#msg2").hide();
    });
    $('.close').hide()
}

function errors_message(message) {
    $('#msg2').attr('class', 'alert alert-danger');
    $('#msg2').html(message);
    $("#msg2").fadeTo(3500, 500).slideUp(300, function(){
        $("#msg2").hide();
    });
    $('.close').hide()
}

function reset_message() {
    $('#msg2').html('');
    $('#msg2').hide();
}