$(function() {
    var socket = io();
    var myname;
    var myId;
    var input_users = {};
    var isTyping = false;
    var private_id;

    $('form').submit(function() {
        if($('#m').val() != "") {
            socket.emit('chat message', myname + ": " + $('#m').val());
            $('#m').val('');
        }
        return false;
    });

    socket.on('chat message', function(msg) {
        $('#messages').append($('<li>').text(msg));
        $('#main').scrollTop($('#main')[0].scrollHeight);
    });

    socket.on('login', function(users) {
        $('#users').empty();
        console.log(users);
        Object.keys(users).forEach(function (key) {
            if(key == "current" && users["current"] != myname) {
                $('#messages').append($('<li class="info">').text(users["current"] + "さんが入室しました。"));
            }else {
                if(users[key] != myname) {
                    $('#users').append($('<li data-id="'+ key +'" class="user">').text(users[key]));
                    console.log(users[key]);
                }else {
                    myId = key;
                }
            }
        });
        $(".user").on('click', function() {
            private_id = $(this).data("id");
            console.log(id);
            $("#private_name").text($(this).text());
            $("#private_header").click();
        });
    });

    socket.on('logout', function(id) {
        if($('.user[data-id="'+ id +'"]').text() != "") {
            $('#messages').append($('<li class="info">').text(($('.user[data-id="'+ id +'"]').text()) + "さんが退出しました。"));
            $('.user[data-id="'+ id +'"]').remove();
        }
    });

    socket.on('input start', function(data) {
        var name_data = data.split(':');
        input_users[name_data[1]] = name_data[0];
        var names = "";
        var name_num = 0;
        Object.keys(input_users).forEach(function (key) {
            if(input_users[key] != myname && input_users[key] != undefined) {
                names += input_users[key] + ",";
                name_num++;
            }
        });
        if(name_num != 0) {
            names = names.slice(0, -1) + "が入力しています。";
            $('.input_now').text(names);
        }
    });

    socket.on('input end', function(data) {
        var name_data = data.split(':');
        delete input_users[name_data[1]];
        var name_num = 0;
        var names;
        Object.keys(input_users).forEach(function (key) {
            if(input_users[key] == myname) return;
            names += input_users[key] + ",";
            name_num++;
        });
        if(name_num != 0) {
            names = names.slice(0, -1) + "が入力しています。";
            $('.input_now').text(names);
        }else {
            $('.input_now').text("");
        }
    });

    $('#login').modal();

    $('#user_name').keypress(function(e) {
        if(e.which == 13) {
            $('#submit_login').click();
            return false;
        }
    });

    $('#submit_login').on('click', function() {
        if($('#user_name').val() != "") {
            $('.error').css('display', 'none');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            $('#login').modal('hide');
            socket.emit('login', $('#user_name').val());
            myname = $('#user_name').val();
        }else {
            $('.error').css('display', 'block');
        }
    });

    $('#m').change(function() {
        if(isTyping) {
            isTyping = false;
            socket.emit('input end', myname);
        }
    });
    $('#m').focusin(function() {
        if(!isTyping) {
            isTyping = true;
            socket.emit('input start', myname);
        }
        setTimeout(function() {
            isTyping = false;
            socket.emit('input end', myname);
        }, 10000);
    });
    $('#m').focusout(function() {
        if(isTyping) {
            isTyping = false;
            socket.emit('input end', myname);
        }
    });

    $("#private_close").on('click', function(e) {
        e.stopPropagation();
        $("#private").animate({
            bottom: "-465px"
        }, 800);
    });
    $("#private_header").on('click', function() {
        $("#private").animate({
            bottom: "0"
        }, 800);
    });
    $('#private_m').keypress(function(e) {
        if(e.which == 13) {
            console.log($(this).val());
            socket.emit(private_id, $(this).val());
            $(this).val("");
            return false;
        }
    });
    socket.on(myId, function() {

    });
});
