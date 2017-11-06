$(function() {
    var socket = io();
    var myname;
    var input_users = {};

    $('form').submit(function() {
        if($('#m').val() != "") {
            socket.emit('chat message', $('#m').val());
            $('#m').val('');
        }
        return false;
    });

    socket.on('chat message', function(msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('login', function(name) {
        var name_data = name.split(":");
        $('#users').append($('<li data-id="'+ name_data[1] +'" class="user">').text(name_data[0]));
        $('#messages').append($('<li class="info">').text(name_data[0] + "さんが入室しました。"));
    });

    socket.on('logout', function(id) {
        $('#messages').append($('<li class="info">').text(($('.user[data-id="'+ id +'"]').text()) + "さんが退出しました。"));
        $('.user[data-id="'+ id +'"]').remove();
    });

    socket.on('input start', function(data) {
        var name_data = data.split(':');
        input_users[name_data[1]] = name_data[0];
        var names = "";
        Object.keys(input_users).forEach(function (key) {
          names += input_users[key] + ",";
        });
        $('.input_now').text(names);
    });

    socket.on('input end', function(data) {
        var name_data = data.split(':');
        delete input_users[name_data[1]];
    });

    $('#login').modal();

    $('#user_name').keypress(function(e) {
        if(e.which == 13) {
            $('#submit_login').click();
            return false;
        }
    });

    $('#submit_login').on('click', function() {
        console.log($('#user_name').val());
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
        // socket.emit('input end', myname);
    });
    $('#m').focusin(function() {
        socket.emit('input start', myname);
        console.log(myname);
    });
    $('#m').focusout(function() {
        // socket.emit('input end', myname);
    });
});
