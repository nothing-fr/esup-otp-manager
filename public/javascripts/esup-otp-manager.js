var uid = 'john';
var busy = false;

function init_admin() {
    get_methods_admin();
}

function init() {
    get_methods();
}

function navClick(link) {
    reset();
    $('#transport_preference').show();
    $(link).addClass('active');
    $('#' + link.id.split('_li')[0]).show();
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


function get_methods() {
    if (!busy) {
        var req = new XMLHttpRequest();
        req.open('GET', 'https://tequila:3443/methods', true);
        req.onerror = function(e) {};
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var responseObject = JSON.parse(req.responseText);
                    if (responseObject.code == "Ok") {
                        $('.method').each(function() {
                            if (!responseObject.methods[this.id.split('_method')[0]] || !responseObject.methods[this.id.split('_method')[0]].activate) {
                                this.remove();
                                $('#' + this.id + '_li').remove();
                            }
                        });
                    } else {
                        $('.method').each(function() {
                            this.remove();
                            $('#' + this.id + '_li').remove();
                        });
                        console.log(responseObject.message);
                    }
                }
                busy = false;
                get_user_methods();
            }
        };
        req.send(null);
        busy = true;
    }
}

function get_methods_admin() {
    if (!busy) {
        var req = new XMLHttpRequest();
        req.open('GET', 'https://tequila:3443/methods', true);
        req.onerror = function(e) {};
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var responseObject = JSON.parse(req.responseText);
                    if (responseObject.code == "Ok") {
                        $('.method').each(function() {
                            var method = this.id.split('_method')[0];
                            if (!responseObject.methods[method]) {
                                this.remove();
                                $('#' + this.id.split('_method')[0] + '_admin').remove();
                            } else {
                                if (responseObject.methods[method].activate) {
                                    check_method(method);
                                } else {
                                    uncheck_method(method);
                                }
                                if (responseObject.methods[method].sms) {
                                    check_method_transport(method, 'sms');
                                } else {
                                    uncheck_method_transport(method, 'sms');
                                }
                                if (responseObject.methods[method].mail) {
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
                        console.log(responseObject.message);
                    }
                }
                busy = false;
            }
        };
        req.send(null);
        busy = true;
    }
}

function get_user_methods() {
    if (!busy) {
        var req = new XMLHttpRequest();
        req.open('GET', 'https://tequila:3443/activate_methods/' + uid, true);
        req.onerror = function(e) {};
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var responseObject = JSON.parse(req.responseText);
                    if (responseObject.code == "Ok") {
                        for (method in responseObject.methods) {
                            if (responseObject.methods[method]) {
                                check_method(method);
                            } else {
                                uncheck_method(method);
                            }
                        }
                    } else {
                        console.log(responseObject.message);
                    }
                }
                busy = false;
                get_qrCode();
            }
        };
        req.send(null);
        busy = true;
    }
}

function get_user() {
    if (!busy) {
        var req = new XMLHttpRequest();
        req.open('GET', 'https://tequila:3443/admin/user/' + uid, true);
        req.onerror = function(e) {};
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var responseObject = JSON.parse(req.responseText);
                    if (responseObject.code == "Ok") {
                        $('#userInfo').show();
                    } else {
                        console.log(responseObject.message);
                    }
                }
                busy = false;
            }
        };
        req.send(null);
        busy = true;
    }
}

function get_qrCode() {
    if (!busy) {
        var req = new XMLHttpRequest();
        req.open('GET', 'https://tequila:3443/secret/google_authenticator/' + uid, true);
        req.onerror = function(e) {};
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var responseObject = JSON.parse(req.responseText);
                    if (responseObject.code == "Ok") {
                        $('#qrCode').append(responseObject.qrCode);
                        $('#secret').append(responseObject.message);
                    } else {
                        console.log(responseObject.message);
                    }
                }
                busy = false;
                get_transports();
            }
        };
        req.send(null);
        busy = true;
    }
}

function get_transports() {
    if (!busy) {
        var req = new XMLHttpRequest();
        req.open('GET', 'https://tequila:3443/available_transports/' + uid, true);
        req.onerror = function(e) {};
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var responseObject = JSON.parse(req.responseText);
                    if (responseObject.code == "Ok") {
                        $('#sms_label').text(responseObject.transports_list.sms);
                        $('#mail_label').text(responseObject.transports_list.mail);
                    } else {
                        console.log(responseObject.message);
                    }
                }
                busy = false;
            }
        };
        req.send(null);
        busy = true;
    }
}

function activate_method_admin(element) {
    if (!busy) {
        var req = new XMLHttpRequest();
        req.open('PUT', 'https://tequila:3443/admin/activate/' + element.id.split('_activate')[0], true);
        req.onerror = function(e) {};
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var responseObject = JSON.parse(req.responseText);
                    if (responseObject.code == "Ok") {
                        check_method(element.id.split('_activate')[0]);
                    } else {
                        console.log(responseObject.message);
                    }
                }
                busy = false;
            }
        };
        req.send(null);
        busy = true;
    }
}

function deactivate_method_admin(element) {
    if (!busy) {
        var req = new XMLHttpRequest();
        req.open('PUT', 'https://tequila:3443/admin/deactivate/' + element.id.split('_deactivate')[0], true);
        req.onerror = function(e) {};
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var responseObject = JSON.parse(req.responseText);
                    if (responseObject.code == "Ok") {
                        uncheck_method(element.id.split('_deactivate')[0]);
                    } else {
                        console.log(responseObject.message);
                    }
                }
                busy = false;
            }
        };
        req.send(null);
        busy = true;
    }
}

function activate_method_transport(element) {
    if (!busy) {
        var req = new XMLHttpRequest();
        req.open('PUT', 'https://tequila:3443/admin/activate/' + element.id.split('_activate')[0] + '/' + element.id.split('_activate_')[1].split('_transport')[0], true);
        req.onerror = function(e) {};
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var responseObject = JSON.parse(req.responseText);
                    if (responseObject.code == "Ok") {
                        check_method_transport(element.id.split('_activate')[0], element.id.split('_activate_')[1].split('_transport')[0]);
                    } else {
                        console.log(responseObject.message);
                    }
                }
                busy = false;
            }
        };
        req.send(null);
        busy = true;
    }
}

function deactivate_method_transport(element) {
    if (!busy) {
        var req = new XMLHttpRequest();
        req.open('PUT', 'https://tequila:3443/admin/deactivate/' + element.id.split('_deactivate')[0] + '/' + element.id.split('_deactivate_')[1].split('_transport')[0], true);
        req.onerror = function(e) {};
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var responseObject = JSON.parse(req.responseText);
                    if (responseObject.code == "Ok") {
                        uncheck_method_transport(element.id.split('_deactivate')[0], element.id.split('_deactivate_')[1].split('_transport')[0]);
                    } else {
                        console.log(responseObject.message);
                    }
                }
                busy = false;
            }
        };
        req.send(null);
        busy = true;
    }
}

function activate_method(element) {
    if (!busy) {
        var req = new XMLHttpRequest();
        req.open('PUT', 'https://tequila:3443/activate/' + element.id.split('_activate')[0] + '/' + uid, true);
        req.onerror = function(e) {};
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var responseObject = JSON.parse(req.responseText);
                    if (responseObject.code == "Ok") {
                        check_method(element.id.split('_activate')[0]);
                    } else {
                        console.log(responseObject.message);
                    }
                }
                busy = false;
            }
        };
        req.send(null);
        busy = true;
    }
}

function deactivate_method(element) {
    if (!busy) {
        var req = new XMLHttpRequest();
        req.open('PUT', 'https://tequila:3443/deactivate/' + element.id.split('_deactivate')[0] + '/' + uid, true);
        req.onerror = function(e) {};
        req.onreadystatechange = function(aEvt) {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    var responseObject = JSON.parse(req.responseText);
                    if (responseObject.code == "Ok") {
                        uncheck_method(element.id.split('_deactivate')[0]);
                    } else {
                        console.log(responseObject.message);
                    }
                }
                busy = false;
            }
        };
        req.send(null);
        busy = true;
    }
}

function change_transport(transport) {
    var new_transport = document.getElementById(transport + '_input').value;
    var reg;
    if(transport=='sms')reg = new RegExp("^0[6-7]([-. ]?[0-9]{2}){4}$");
    else reg = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (reg.test(new_transport)) {
        if (!busy) {
            var req = new XMLHttpRequest();
            req.open('PUT', 'https://tequila:3443/transport/' + transport + '/' + uid + '/' + new_transport, true);
            req.onerror = function(e) {};
            req.onreadystatechange = function(aEvt) {
                if (req.readyState == 4) {
                    if (req.status == 200) {
                        var responseObject = JSON.parse(req.responseText);
                        if (responseObject.code == "Ok") {
                            busy = false;
                            $('#change_'+transport+'_form').hide();
                            $('#modify_'+transport+'_btn').show();
                            get_transports();
                        } else {
                            console.log(responseObject.message);
                        }
                    }
                    busy = false;
                }
            };
            req.send(null);
            busy = true;
        }
    }
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
